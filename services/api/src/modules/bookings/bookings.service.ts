import { q, tx } from "../../db/oracle";
import { uuid } from "../../utils/crypto";

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
    createdAt: new Date(r.CREATED_AT).toISOString()
  };
}

export async function createBooking(input: { providerId: string; clientId: string; scheduledAt: string; address: string; notes?: string; serviceIds: string[] }) {
  return tx(async (c) => {
    const services = await c.execute<any>(
      `SELECT id, price FROM services WHERE provider_id = :pid AND active = 1 AND id IN (${input.serviceIds.map((_, i) => `:s${i}`).join(",")})`,
      { pid: input.providerId, ...Object.fromEntries(input.serviceIds.map((id, i) => [`s${i}`, id])) },
      { autoCommit: false }
    );

    const rows = services.rows as any[] | undefined;
    if (!rows || rows.length !== input.serviceIds.length) throw Object.assign(new Error("INVALID_SERVICES"), { status: 400 });

    const total = rows.reduce((sum, r) => sum + Number(r.PRICE), 0);
    const id = uuid();

    await c.execute(
      `INSERT INTO bookings (id, provider_id, client_id, status, scheduled_at, address, notes, total_price)
       VALUES (:id, :pid, :cid, 'PENDING', TO_TIMESTAMP(:ts, 'YYYY-MM-DD"T"HH24:MI'), :addr, :notes, :total)`,
      { id, pid: input.providerId, cid: input.clientId, ts: input.scheduledAt, addr: input.address, notes: input.notes ?? null, total },
      { autoCommit: false }
    );

    for (const sid of input.serviceIds) {
      await c.execute(
        `INSERT INTO booking_services (booking_id, service_id) VALUES (:bid, :sid)`,
        { bid: id, sid },
        { autoCommit: false }
      );
    }

    const out = await c.execute<any>(`SELECT * FROM bookings WHERE id = :id`, { id }, { autoCommit: false });
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
  const p = await q<any>(`SELECT id FROM providers WHERE user_id = :uid`, { uid: userId });
  const pid = p[0]?.ID;
  if (!pid) throw Object.assign(new Error("NOT_PROVIDER"), { status: 400 });

  const rows = await q<any>(
    `SELECT * FROM bookings WHERE provider_id = :pid ORDER BY created_at DESC FETCH FIRST 100 ROWS ONLY`,
    { pid }
  );
  return { items: rows.map(mapBooking) };
}

export async function updateStatus(userId: string, role: string, input: { bookingId: string; status: string }) {
  if (role === "PROVIDER") {
    const p = await q<any>(`SELECT id FROM providers WHERE user_id = :uid`, { uid: userId });
    const pid = p[0]?.ID;
    if (!pid) throw Object.assign(new Error("NOT_PROVIDER"), { status: 400 });

    const rows = await q<any>(`SELECT provider_id FROM bookings WHERE id = :id`, { id: input.bookingId });
    if (!rows[0] || rows[0].PROVIDER_ID !== pid) throw Object.assign(new Error("FORBIDDEN"), { status: 403 });
  }

  await q(`UPDATE bookings SET status = :s WHERE id = :id`, { s: input.status, id: input.bookingId });

  const out = await q<any>(`SELECT * FROM bookings WHERE id = :id`, { id: input.bookingId });
  return { booking: mapBooking(out[0]) };
}
