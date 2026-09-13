import { q } from "../../db/oracle";
import { enqueueEmail, enqueueSms } from "../../services/notifications";
import { uuid } from "../../utils/crypto";
import { decryptSensitive } from "../../utils/secure";

export async function getAdminDashboard() {
  const [users] = await q<any>(`SELECT COUNT(*) AS CNT FROM users`);
  const [providers] = await q<any>(`SELECT COUNT(*) AS CNT FROM providers`);
  const [pendingProviders] = await q<any>(`SELECT COUNT(*) AS CNT FROM providers WHERE verification_status = 'PENDING'`);
  const [bookings] = await q<any>(`SELECT COUNT(*) AS CNT FROM bookings`);
  const [revenue] = await q<any>(`SELECT NVL(SUM(commission_amount), 0) AS SUM_COMMISSION FROM bookings WHERE payment_status = 'PAID'`);

  return {
    stats: {
      users: Number(users.CNT),
      providers: Number(providers.CNT),
      pendingProviders: Number(pendingProviders.CNT),
      bookings: Number(bookings.CNT),
      commissionRevenueMad: Number(revenue.SUM_COMMISSION)
    }
  };
}

export async function listPlatformUsers() {
  const rows = await q<any>(
    `SELECT u.id, u.role, u.name, u.email, u.phone, u.account_status, u.suspension_reason, u.email_verified, u.created_at, p.id AS provider_id
     FROM users u
     LEFT JOIN providers p ON p.user_id = u.id
     ORDER BY created_at DESC
     FETCH FIRST 200 ROWS ONLY`
  );

  return {
    items: rows.map((r) => ({
      id: r.ID,
      role: r.ROLE,
      name: r.NAME,
      email: r.EMAIL,
      phone: r.PHONE,
      providerId: r.PROVIDER_ID ?? null,
      accountStatus: r.ACCOUNT_STATUS,
      suspensionReason: r.SUSPENSION_REASON ?? null,
      emailVerified: Boolean(r.EMAIL_VERIFIED),
      createdAt: new Date(r.CREATED_AT).toISOString()
    }))
  };
}

function mapBookingSummary(r: any) {
  return {
    id: r.ID,
    status: r.STATUS,
    scheduledAt: new Date(r.SCHEDULED_AT).toISOString(),
    address: r.ADDRESS,
    totalPrice: Number(r.TOTAL_PRICE),
    paymentStatus: r.PAYMENT_STATUS,
    createdAt: new Date(r.CREATED_AT).toISOString()
  };
}

export async function getPlatformUserDetails(userId: string) {
  const users = await q<any>(
    `SELECT id, role, name, email, phone, account_status, suspension_reason, email_verified, created_at, updated_at
     FROM users
     WHERE id = :id`,
    { id: userId }
  );
  const u = users[0];
  if (!u) throw Object.assign(new Error("NOT_FOUND"), { status: 404 });

  const addresses = await q<any>(
    `SELECT id, label, address_line, city, lat, lng, is_default, created_at
     FROM user_addresses
     WHERE user_id = :id
     ORDER BY is_default DESC, created_at DESC`,
    { id: userId }
  );

  const vehicles = await q<any>(
    `SELECT id, label, brand, model, plate_number, color, created_at
     FROM user_vehicles
     WHERE user_id = :id
     ORDER BY created_at DESC`,
    { id: userId }
  );

  const clientBookings = await q<any>(
    `SELECT id, status, scheduled_at, address, total_price, payment_status, created_at
     FROM bookings
     WHERE client_id = :id
     ORDER BY created_at DESC
     FETCH FIRST 100 ROWS ONLY`,
    { id: userId }
  );

  const providers = await q<any>(
    `SELECT id, bio, city, lat, lng, radius_km, price_from, rating_avg, rating_count, verification_status, verification_notes,
            identity_doc_url, availability_json, created_at
     FROM providers
     WHERE user_id = :id`,
    { id: userId }
  );
  const p = providers[0];

  let provider: any = null;
  if (p) {
    const services = await q<any>(
      `SELECT id, name, price, active, created_at
       FROM services
       WHERE provider_id = :pid
       ORDER BY created_at DESC`,
      { pid: p.ID }
    );

    const documents = await q<any>(
      `SELECT id, doc_type, doc_label, status, rejection_reason, reviewed_at, created_at
       FROM provider_documents
       WHERE provider_id = :pid
       ORDER BY created_at DESC`,
      { pid: p.ID }
    );

    const providerBookings = await q<any>(
      `SELECT id, status, scheduled_at, address, total_price, payment_status, created_at
       FROM bookings
       WHERE provider_id = :pid
       ORDER BY created_at DESC
       FETCH FIRST 100 ROWS ONLY`,
      { pid: p.ID }
    );

    provider = {
      id: p.ID,
      bio: p.BIO ?? null,
      city: p.CITY ?? null,
      lat: Number(p.LAT),
      lng: Number(p.LNG),
      radiusKm: Number(p.RADIUS_KM),
      priceFrom: Number(p.PRICE_FROM),
      ratingAvg: Number(p.RATING_AVG),
      ratingCount: Number(p.RATING_COUNT),
      verificationStatus: p.VERIFICATION_STATUS,
      verificationNotes: p.VERIFICATION_NOTES ?? null,
      identityDocUrl: p.IDENTITY_DOC_URL ?? null,
      availabilityJson: p.AVAILABILITY_JSON ?? null,
      createdAt: new Date(p.CREATED_AT).toISOString(),
      services: services.map((s) => ({
        id: s.ID,
        name: s.NAME,
        price: Number(s.PRICE),
        active: Number(s.ACTIVE) === 1,
        createdAt: new Date(s.CREATED_AT).toISOString()
      })),
      documents: documents.map((d) => ({
        id: d.ID,
        type: d.DOC_TYPE,
        label: d.DOC_LABEL ?? null,
        status: d.STATUS,
        rejectionReason: d.REJECTION_REASON ?? null,
        reviewedAt: d.REVIEWED_AT ? new Date(d.REVIEWED_AT).toISOString() : null,
        createdAt: new Date(d.CREATED_AT).toISOString()
      })),
      bookings: providerBookings.map(mapBookingSummary)
    };
  }

  return {
    user: {
      id: u.ID,
      role: u.ROLE,
      name: u.NAME,
      email: u.EMAIL,
      phone: u.PHONE,
      accountStatus: u.ACCOUNT_STATUS,
      suspensionReason: u.SUSPENSION_REASON ?? null,
      emailVerified: Boolean(u.EMAIL_VERIFIED),
      createdAt: new Date(u.CREATED_AT).toISOString(),
      updatedAt: new Date(u.UPDATED_AT).toISOString()
    },
    addresses: addresses.map((a) => ({
      id: a.ID,
      label: a.LABEL,
      addressLine: a.ADDRESS_LINE,
      city: a.CITY ?? null,
      lat: a.LAT === null ? null : Number(a.LAT),
      lng: a.LNG === null ? null : Number(a.LNG),
      isDefault: Number(a.IS_DEFAULT) === 1,
      createdAt: new Date(a.CREATED_AT).toISOString()
    })),
    vehicles: vehicles.map((v) => ({
      id: v.ID,
      label: v.LABEL,
      brand: v.BRAND ?? null,
      model: v.MODEL ?? null,
      plateNumber: v.PLATE_NUMBER ?? null,
      color: v.COLOR ?? null,
      createdAt: new Date(v.CREATED_AT).toISOString()
    })),
    bookingsAsClient: clientBookings.map(mapBookingSummary),
    provider
  };
}

export async function setUserStatus(
  actorUserId: string,
  userId: string,
  status: "ACTIVE" | "SUSPENDED" | "PENDING_VERIFICATION",
  reason?: string
) {
  if (actorUserId === userId && status === "SUSPENDED") {
    throw Object.assign(new Error("CANNOT_SUSPEND_SELF"), { status: 400 });
  }
  const cleanedReason = reason?.trim();
  if (status === "SUSPENDED" && !cleanedReason) {
    throw Object.assign(new Error("SUSPEND_REASON_REQUIRED"), { status: 400 });
  }

  await q(`UPDATE users SET account_status = :status, suspension_reason = :reason, updated_at = SYSTIMESTAMP WHERE id = :id`, {
    status,
    reason: status === "SUSPENDED" ? cleanedReason : null,
    id: userId
  });
  const rows = await q<any>(`SELECT id, account_status, suspension_reason, email, phone FROM users WHERE id = :id`, { id: userId });
  if (!rows[0]) throw Object.assign(new Error("NOT_FOUND"), { status: 404 });

  const statusText =
    rows[0].ACCOUNT_STATUS === "SUSPENDED"
      ? `Le statut de votre compte est maintenant: ${rows[0].ACCOUNT_STATUS}. Motif: ${rows[0].SUSPENSION_REASON ?? "non precise"}`
      : `Le statut de votre compte est maintenant: ${rows[0].ACCOUNT_STATUS}`;
  await enqueueEmail(rows[0].ID, "ACCOUNT_STATUS_CHANGED", {
    to: rows[0].EMAIL,
    subject: "Mise a jour de votre compte Lavadom",
    text: statusText
  });
  await enqueueSms(rows[0].ID, "ACCOUNT_STATUS_CHANGED", {
    to: rows[0].PHONE,
    text:
      rows[0].ACCOUNT_STATUS === "SUSPENDED"
        ? `Lavadom: compte suspendu. Motif: ${rows[0].SUSPENSION_REASON ?? "non precise"}`
        : `Lavadom: statut compte = ${rows[0].ACCOUNT_STATUS}`
  });

  return { user: { id: rows[0].ID, accountStatus: rows[0].ACCOUNT_STATUS, suspensionReason: rows[0].SUSPENSION_REASON ?? null } };
}

async function notifyProviderDecision(providerId: string, status: "VERIFIED" | "REJECTED", notes?: string) {
  const rows = await q<any>(
    `SELECT u.id, u.email, u.phone, u.name
     FROM providers p
     JOIN users u ON u.id = p.user_id
     WHERE p.id = :pid`,
    { pid: providerId }
  );
  const u = rows[0];
  if (!u) return;

  const text =
    status === "VERIFIED"
      ? "Votre compte prestataire est approuve. Vous pouvez commencer a recevoir des demandes."
      : `Votre compte prestataire a ete refuse. Motif: ${notes ?? "non precise"}. Veuillez re-soumettre vos documents.`;

  await enqueueEmail(u.ID, "PROVIDER_VERIFICATION_DECISION", {
    to: u.EMAIL,
    subject: status === "VERIFIED" ? "Compte prestataire approuve" : "Compte prestataire refuse",
    text
  });
  await enqueueSms(u.ID, "PROVIDER_VERIFICATION_DECISION", {
    to: u.PHONE,
    text: `Lavadom: ${status === "VERIFIED" ? "compte approuve" : "compte refuse"}`
  });
}

export async function setProviderVerification(providerId: string, status: "PENDING" | "VERIFIED" | "REJECTED", notes?: string) {
  await q(`UPDATE providers SET verification_status = :status, verification_notes = :notes WHERE id = :id`, {
    status,
    notes: notes ?? null,
    id: providerId
  });
  const rows = await q<any>(`SELECT id, verification_status, verification_notes FROM providers WHERE id = :id`, { id: providerId });
  if (!rows[0]) throw Object.assign(new Error("NOT_FOUND"), { status: 404 });

  const provider = rows[0];
  await q(
    `UPDATE users
     SET account_status = :userStatus
     WHERE id = (SELECT user_id FROM providers WHERE id = :pid)`,
    { userStatus: status === "VERIFIED" ? "ACTIVE" : "PENDING_VERIFICATION", pid: providerId }
  );

  if (status === "VERIFIED" || status === "REJECTED") {
    await notifyProviderDecision(providerId, status, notes);
  }

  return {
    provider: {
      id: provider.ID,
      verificationStatus: provider.VERIFICATION_STATUS,
      verificationNotes: provider.VERIFICATION_NOTES ?? null
    }
  };
}

export async function getProviderKycDocuments(providerId: string) {
  const rows = await q<any>(
    `SELECT id, doc_type, doc_label, encrypted_payload, status, rejection_reason, reviewed_at, created_at
     FROM provider_documents
     WHERE provider_id = :pid
     ORDER BY created_at DESC`,
    { pid: providerId }
  );

  return {
    items: rows.map((r) => {
      let payloadPreview = "[encrypted]";
      try {
        const plain = decryptSensitive(r.ENCRYPTED_PAYLOAD);
        payloadPreview = plain.length > 280 ? `${plain.slice(0, 280)}...` : plain;
      } catch {}

      return {
        id: r.ID,
        type: r.DOC_TYPE,
        label: r.DOC_LABEL ?? null,
        status: r.STATUS,
        rejectionReason: r.REJECTION_REASON ?? null,
        reviewedAt: r.REVIEWED_AT ? new Date(r.REVIEWED_AT).toISOString() : null,
        createdAt: new Date(r.CREATED_AT).toISOString(),
        payloadPreview
      };
    })
  };
}

export async function reviewKycDocument(
  adminId: string,
  providerId: string,
  documentId: string,
  status: "APPROVED" | "REJECTED",
  reason?: string
) {
  await q(
    `UPDATE provider_documents
     SET status = :status, rejection_reason = :reason, reviewed_by = :adminId, reviewed_at = SYSTIMESTAMP, updated_at = SYSTIMESTAMP
     WHERE id = :id AND provider_id = :pid`,
    { status, reason: reason ?? null, adminId, id: documentId, pid: providerId }
  );

  const counts = await q<any>(
    `SELECT
       SUM(CASE WHEN status = 'APPROVED' THEN 1 ELSE 0 END) AS approved_cnt,
       SUM(CASE WHEN status = 'REJECTED' THEN 1 ELSE 0 END) AS rejected_cnt,
       COUNT(*) AS total_cnt
     FROM provider_documents
     WHERE provider_id = :pid`,
    { pid: providerId }
  );
  const c = counts[0];

  if (Number(c.REJECTED_CNT) > 0) {
    await setProviderVerification(providerId, "REJECTED", reason ?? "Documents rejected");
  } else if (Number(c.APPROVED_CNT) > 0 && Number(c.APPROVED_CNT) === Number(c.TOTAL_CNT)) {
    await setProviderVerification(providerId, "VERIFIED", "All documents approved");
  } else {
    await setProviderVerification(providerId, "PENDING", "Waiting for remaining document reviews");
  }

  const docs = await getProviderKycDocuments(providerId);
  return { documents: docs.items };
}

export async function getCommissionReport() {
  const byProvider = await q<any>(
    `SELECT p.id AS provider_id, u.name AS provider_name,
            NVL(SUM(b.total_price), 0) AS gross,
            NVL(SUM(b.commission_amount), 0) AS commission,
            NVL(SUM(b.provider_amount), 0) AS provider_net
     FROM providers p
     JOIN users u ON u.id = p.user_id
     LEFT JOIN bookings b ON b.provider_id = p.id AND b.payment_status = 'PAID'
     GROUP BY p.id, u.name
     ORDER BY commission DESC`
  );

  return {
    items: byProvider.map((r) => ({
      providerId: r.PROVIDER_ID,
      providerName: r.PROVIDER_NAME,
      grossMad: Number(r.GROSS),
      commissionMad: Number(r.COMMISSION),
      providerNetMad: Number(r.PROVIDER_NET)
    }))
  };
}

export async function listPlatformBookings() {
  const rows = await q<any>(
    `SELECT b.id, b.status, b.scheduled_at, b.address, b.total_price, b.payment_status, b.created_at,
            cu.name AS client_name, pu.name AS provider_name
     FROM bookings b
     JOIN users cu ON cu.id = b.client_id
     JOIN providers p ON p.id = b.provider_id
     JOIN users pu ON pu.id = p.user_id
     ORDER BY b.created_at DESC
     FETCH FIRST 200 ROWS ONLY`
  );

  return {
    items: rows.map((r) => ({
      id: r.ID,
      status: r.STATUS,
      scheduledAt: new Date(r.SCHEDULED_AT).toISOString(),
      address: r.ADDRESS,
      totalPrice: Number(r.TOTAL_PRICE),
      paymentStatus: r.PAYMENT_STATUS,
      clientName: r.CLIENT_NAME,
      providerName: r.PROVIDER_NAME,
      createdAt: new Date(r.CREATED_AT).toISOString()
    }))
  };
}

export async function listCmsPages() {
  const rows = await q<any>(`SELECT id, slug, title, content, updated_at FROM cms_pages ORDER BY updated_at DESC`);
  return {
    items: rows.map((r) => ({
      id: r.ID,
      slug: r.SLUG,
      title: r.TITLE,
      content: r.CONTENT,
      updatedAt: new Date(r.UPDATED_AT).toISOString()
    }))
  };
}

export async function upsertCmsPage(input: { id?: string; slug: string; title: string; content: string }) {
  if (input.id) {
    await q(
      `UPDATE cms_pages SET slug = :slug, title = :title, content = :content, updated_at = SYSTIMESTAMP WHERE id = :id`,
      { id: input.id, slug: input.slug, title: input.title, content: input.content }
    );
    return { page: { id: input.id, slug: input.slug, title: input.title, content: input.content } };
  }

  const id = uuid();
  await q(`INSERT INTO cms_pages (id, slug, title, content) VALUES (:id, :slug, :title, :content)`, {
    id,
    slug: input.slug,
    title: input.title,
    content: input.content
  });
  return { page: { id, slug: input.slug, title: input.title, content: input.content } };
}
