import { env } from "../../config/env";
import { q, tx } from "../../db/oracle";
import { capturePaypalOrder, createPaypalOrder } from "../../services/paypal";
import { uuid } from "../../utils/crypto";

const providerTransitions: Record<string, string[]> = {
  REQUESTED: ["ACCEPTED", "DECLINED", "CANCELLED"],
  ACCEPTED: ["ON_THE_WAY", "CANCELLED"],
  ON_THE_WAY: ["ARRIVED", "CANCELLED"],
  ARRIVED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["DONE", "CANCELLED"]
};

function mapBooking(r: any) {
  return {
    id: r.ID,
    providerId: r.PROVIDER_ID,
    clientId: r.CLIENT_ID,
    status: r.STATUS,
    scheduledAt: new Date(r.SCHEDULED_AT).toISOString(),
    address: r.ADDRESS,
    notes: r.NOTES ?? null,
    totalPrice: Number(r.TOTAL_PRICE),
    commissionAmount: Number(r.COMMISSION_AMOUNT ?? 0),
    providerAmount: Number(r.PROVIDER_AMOUNT ?? 0),
    paymentStatus: r.PAYMENT_STATUS,
    createdAt: new Date(r.CREATED_AT).toISOString()
  };
}

async function findProviderIdByUser(userId: string) {
  const p = await q<any>(`SELECT id FROM providers WHERE user_id = :userId`, { userId: userId });
  return p[0]?.ID as string | undefined;
}

async function ensureProviderOperational(userId: string) {
  const rows = await q<any>(
    `SELECT p.id, p.verification_status, u.account_status
     FROM providers p
     JOIN users u ON u.id = p.user_id
     WHERE p.user_id = :userId`,
    { userId: userId }
  );
  const row = rows[0];
  if (!row) throw Object.assign(new Error("NOT_PROVIDER"), { status: 400 });
  if (row.ACCOUNT_STATUS !== "ACTIVE" || row.VERIFICATION_STATUS !== "VERIFIED") {
    throw Object.assign(new Error("PROVIDER_NOT_VERIFIED"), { status: 403 });
  }
  return row.ID as string;
}

async function loadBooking(bookingId: string) {
  const out = await q<any>(`SELECT * FROM bookings WHERE id = :id`, { id: bookingId });
  return out[0];
}

export async function createBooking(input: {
  providerId: string;
  clientId: string;
  scheduledAt: string;
  address: string;
  notes?: string;
  serviceIds: string[];
}) {
  const scheduledDate = new Date(input.scheduledAt);
  if (!Number.isFinite(scheduledDate.getTime())) {
    throw Object.assign(new Error("INVALID_SCHEDULED_AT"), { status: 400 });
  }
  // Keep the "present minute" valid while still blocking true past bookings.
  if (scheduledDate.getTime() < Date.now() - 60_000) {
    throw Object.assign(new Error("PAST_BOOKING_NOT_ALLOWED"), { status: 400 });
  }

  return tx(async (c) => {
    const providerRows = await c.execute(
      `SELECT p.id, p.verification_status, u.account_status
       FROM providers p
       JOIN users u ON u.id = p.user_id
       WHERE p.id = :pid`,
      { pid: input.providerId },
      { autoCommit: false }
    );
    const provider = (providerRows.rows as any[] | undefined)?.[0];
    if (!provider) throw Object.assign(new Error("PROVIDER_NOT_FOUND"), { status: 404 });
    if (provider.VERIFICATION_STATUS !== "VERIFIED" || provider.ACCOUNT_STATUS !== "ACTIVE") {
      throw Object.assign(new Error("PROVIDER_NOT_AVAILABLE"), { status: 400 });
    }

    const services = await c.execute(
      `SELECT id, price FROM services WHERE provider_id = :pid AND active = 1 AND id IN (${input.serviceIds
        .map((_, i) => `:s${i}`)
        .join(",")})`,
      { pid: input.providerId, ...Object.fromEntries(input.serviceIds.map((id, i) => [`s${i}`, id])) },
      { autoCommit: false }
    );

    const rows = services.rows as any[] | undefined;
    if (!rows || rows.length !== input.serviceIds.length) throw Object.assign(new Error("INVALID_SERVICES"), { status: 400 });

    const total = rows.reduce((sum, r) => sum + Number(r.PRICE), 0);
    const commissionAmount = Number((total * env.PLATFORM_COMMISSION_RATE).toFixed(2));
    const providerAmount = Number((total - commissionAmount).toFixed(2));
    const id = uuid();

    await c.execute(
      `INSERT INTO bookings (id, provider_id, client_id, status, scheduled_at, address, notes, total_price, commission_amount, provider_amount, payment_status)
       VALUES (:id, :pid, :cid, 'REQUESTED', TO_TIMESTAMP(:ts, 'YYYY-MM-DD"T"HH24:MI'), :addr, :notes, :total, :commissionAmount, :providerAmount, 'UNPAID')`,
      {
        id,
        pid: input.providerId,
        cid: input.clientId,
        ts: input.scheduledAt,
        addr: input.address,
        notes: input.notes ?? null,
        total,
        commissionAmount,
        providerAmount
      },
      { autoCommit: false }
    );

    for (const sid of input.serviceIds) {
      await c.execute(
        `INSERT INTO booking_services (booking_id, service_id) VALUES (:bid, :sid)`,
        { bid: id, sid },
        { autoCommit: false }
      );
    }

    const out = await c.execute(`SELECT * FROM bookings WHERE id = :id`, { id }, { autoCommit: false });
    return { booking: mapBooking((out.rows as any[])[0]) };
  });
}

export async function myBookings(userId: string) {
  const rows = await q<any>(
    `SELECT * FROM bookings WHERE client_id = :id ORDER BY created_at DESC FETCH FIRST 100 ROWS ONLY`,
    { id: userId }
  );
  return { items: rows.map(mapBooking) };
}

export async function providerBookings(userId: string) {
  const pid = await ensureProviderOperational(userId);
  if (!pid) throw Object.assign(new Error("NOT_PROVIDER"), { status: 400 });

  const rows = await q<any>(
    `SELECT * FROM bookings WHERE provider_id = :pid ORDER BY created_at DESC FETCH FIRST 100 ROWS ONLY`,
    { pid }
  );
  return { items: rows.map(mapBooking) };
}

export async function updateStatus(userId: string, role: string, input: { bookingId: string; status: string }) {
  const row = await loadBooking(input.bookingId);
  if (!row) throw Object.assign(new Error("NOT_FOUND"), { status: 404 });

  if (role === "PROVIDER") {
    const pid = await ensureProviderOperational(userId);
    if (!pid || row.PROVIDER_ID !== pid) throw Object.assign(new Error("FORBIDDEN"), { status: 403 });

    const allowed = providerTransitions[row.STATUS] ?? [];
    if (!allowed.includes(input.status)) {
      throw Object.assign(new Error("INVALID_STATUS_TRANSITION"), { status: 400 });
    }
  }

  if (role === "CLIENT" && input.status !== "CANCELLED") {
    throw Object.assign(new Error("CLIENT_CAN_ONLY_CANCEL"), { status: 403 });
  }
  if (role === "CLIENT" && row.CLIENT_ID !== userId) {
    throw Object.assign(new Error("FORBIDDEN"), { status: 403 });
  }

  await q(`UPDATE bookings SET status = :s WHERE id = :id`, { s: input.status, id: input.bookingId });

  const out = await q<any>(`SELECT * FROM bookings WHERE id = :id`, { id: input.bookingId });
  return { booking: mapBooking(out[0]) };
}

export async function createBookingPaymentIntent(userId: string, input: { bookingId: string; method: "PAYPAL" | "CASH" | "CARD" }) {
  const booking = await loadBooking(input.bookingId);
  if (!booking) throw Object.assign(new Error("NOT_FOUND"), { status: 404 });
  if (booking.CLIENT_ID !== userId) throw Object.assign(new Error("FORBIDDEN"), { status: 403 });

  if (input.method !== "PAYPAL") {
    throw Object.assign(new Error("ONLY_PAYPAL_SUPPORTED_FOR_NOW"), { status: 400 });
  }

  const order = await createPaypalOrder({ amountMad: Number(booking.TOTAL_PRICE), bookingId: booking.ID });

  const existing = await q<any>(`SELECT id FROM payments WHERE booking_id = :bid`, { bid: booking.ID });
  if (existing[0]) {
    await q(
      `UPDATE payments
       SET method = 'PAYPAL', status = 'CREATED', provider_paypal_order_id = :orderId, updated_at = SYSTIMESTAMP
       WHERE booking_id = :bid`,
      { orderId: order.providerOrderId, bid: booking.ID }
    );
  } else {
    await q(
      `INSERT INTO payments (id, booking_id, provider_id, client_id, provider_amount, commission_amount, gross_amount, method, status, provider_paypal_order_id)
       VALUES (:id, :bid, :pid, :cid, :providerAmount, :commissionAmount, :grossAmount, 'PAYPAL', 'CREATED', :orderId)`,
      {
        id: uuid(),
        bid: booking.ID,
        pid: booking.PROVIDER_ID,
        cid: booking.CLIENT_ID,
        providerAmount: Number(booking.PROVIDER_AMOUNT),
        commissionAmount: Number(booking.COMMISSION_AMOUNT),
        grossAmount: Number(booking.TOTAL_PRICE),
        orderId: order.providerOrderId
      }
    );
  }

  await q(`UPDATE bookings SET payment_status = 'PENDING' WHERE id = :id`, { id: booking.ID });

  return {
    payment: {
      bookingId: booking.ID,
      method: "PAYPAL",
      providerOrderId: order.providerOrderId,
      approveUrl: order.approveUrl,
      mocked: order.mocked
    }
  };
}

export async function captureBookingPayment(userId: string, bookingId: string) {
  const booking = await loadBooking(bookingId);
  if (!booking) throw Object.assign(new Error("NOT_FOUND"), { status: 404 });
  if (booking.CLIENT_ID !== userId) throw Object.assign(new Error("FORBIDDEN"), { status: 403 });

  const payments = await q<any>(`SELECT * FROM payments WHERE booking_id = :bid`, { bid: bookingId });
  const p = payments[0];
  if (!p) throw Object.assign(new Error("PAYMENT_NOT_CREATED"), { status: 400 });

  const capture = await capturePaypalOrder(p.PROVIDER_PAYPAL_ORDER_ID);
  await q(
    `UPDATE payments
     SET status = 'CAPTURED', provider_paypal_capture_id = :captureId, updated_at = SYSTIMESTAMP
     WHERE id = :id`,
    { captureId: capture.captureId, id: p.ID }
  );
  await q(`UPDATE bookings SET payment_status = 'PAID' WHERE id = :id`, { id: bookingId });

  const invoiceRows = await q<any>(`SELECT id FROM invoices WHERE booking_id = :bid`, { bid: bookingId });
  if (!invoiceRows[0]) {
    await q(
      `INSERT INTO invoices (id, booking_id, payment_id, invoice_number, subtotal, commission_amount, total)
       VALUES (:id, :bid, :pid, :invoiceNumber, :subtotal, :commissionAmount, :total)`,
      {
        id: uuid(),
        bid: bookingId,
        pid: p.ID,
        invoiceNumber: `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${bookingId.slice(0, 8).toUpperCase()}`,
        subtotal: Number(booking.TOTAL_PRICE),
        commissionAmount: Number(booking.COMMISSION_AMOUNT),
        total: Number(booking.TOTAL_PRICE)
      }
    );
  }

  return {
    payment: {
      bookingId,
      status: "CAPTURED",
      captureId: capture.captureId,
      mocked: capture.mocked
    }
  };
}

