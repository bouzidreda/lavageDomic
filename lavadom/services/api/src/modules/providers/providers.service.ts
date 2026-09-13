import { q } from "../../db/oracle";
import { bbox, haversineSql } from "../../utils/geo";
import { uuid } from "../../utils/crypto";
import { encryptSensitive, sha256Hex } from "../../utils/secure";

type AvailabilityStatus = "AVAILABLE" | "OFFLINE";

function parseAvailabilityStatus(raw: unknown): AvailabilityStatus {
  if (typeof raw !== "string" || !raw.trim()) return "AVAILABLE";
  try {
    const parsed = JSON.parse(raw) as { status?: string };
    return parsed?.status === "OFFLINE" ? "OFFLINE" : "AVAILABLE";
  } catch {
    return "AVAILABLE";
  }
}

function mergeAvailabilityJson(raw: unknown, status: AvailabilityStatus): string {
  let base: Record<string, unknown> = {};
  if (typeof raw === "string" && raw.trim()) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) base = parsed as Record<string, unknown>;
    } catch {}
  }
  return JSON.stringify({ ...base, status });
}

function mapProviderRow(r: any) {
  const availabilityJson = r.AVAILABILITY_JSON ?? null;
  return {
    id: r.ID,
    name: r.NAME,
    bio: r.BIO ?? null,
    city: r.CITY ?? null,
    lat: Number(r.LAT),
    lng: Number(r.LNG),
    radiusKm: Number(r.RADIUS_KM),
    priceFrom: Number(r.PRICE_FROM),
    ratingAvg: Number(r.RATING_AVG),
    ratingCount: Number(r.RATING_COUNT),
    verificationStatus: r.VERIFICATION_STATUS,
    identityDocUrl: r.IDENTITY_DOC_URL ?? null,
    availabilityJson,
    availabilityStatus: parseAvailabilityStatus(availabilityJson),
    distanceKm: r.DISTANCE_KM !== undefined ? Number(r.DISTANCE_KM) : undefined
  };
}

export async function getProvider(id: string) {
  const rows = await q<any>(
    `SELECT
       p.id, p.user_id, DBMS_LOB.SUBSTR(p.bio, 4000, 1) AS bio, p.city, p.lat, p.lng, p.radius_km, p.price_from,
       p.rating_avg, p.rating_count, p.verification_status, p.verification_notes, p.identity_doc_url,
       DBMS_LOB.SUBSTR(p.availability_json, 4000, 1) AS availability_json, p.created_at,
       u.name
     FROM providers p
     JOIN users u ON u.id = p.user_id
     WHERE p.id = :id`,
    { id }
  );
  const p = rows[0];
  if (!p) throw Object.assign(new Error("NOT_FOUND"), { status: 404 });

  const services = await q<any>(
    `SELECT id, name, price FROM services WHERE provider_id = :pid AND active = 1 ORDER BY price ASC`,
    { pid: id }
  );
  return {
    provider: mapProviderRow(p),
    services: services.map((s) => ({ id: s.ID, name: s.NAME, price: Number(s.PRICE) }))
  };
}

export async function getMyProvider(userId: string) {
  const rows = await q<any>(
    `SELECT
       p.id, p.user_id, DBMS_LOB.SUBSTR(p.bio, 4000, 1) AS bio, p.city, p.lat, p.lng, p.radius_km, p.price_from,
       p.rating_avg, p.rating_count, p.verification_status, p.verification_notes, p.identity_doc_url,
       DBMS_LOB.SUBSTR(p.availability_json, 4000, 1) AS availability_json, p.created_at,
       u.name
     FROM providers p
     JOIN users u ON u.id = p.user_id
     WHERE p.user_id = :userId`,
    { userId: userId }
  );
  const p = rows[0];
  if (!p) throw Object.assign(new Error("NOT_FOUND"), { status: 404 });
  return { provider: mapProviderRow(p) };
}

export async function updateMyProvider(userId: string, input: any) {
  const sets: string[] = [];
  const binds: any = { userId: userId };

  if (input.bio !== undefined) { sets.push("bio = :bio"); binds.bio = input.bio; }
  if (input.city !== undefined) { sets.push("city = :city"); binds.city = input.city; }
  if (input.lat !== undefined) { sets.push("lat = :lat"); binds.lat = input.lat; }
  if (input.lng !== undefined) { sets.push("lng = :lng"); binds.lng = input.lng; }
  if (input.radiusKm !== undefined) { sets.push("radius_km = :radiusKm"); binds.radiusKm = input.radiusKm; }
  if (input.priceFrom !== undefined) { sets.push("price_from = :priceFrom"); binds.priceFrom = input.priceFrom; }
  if (input.identityDocUrl !== undefined) { sets.push("identity_doc_url = :identityDocUrl"); binds.identityDocUrl = input.identityDocUrl; }
  let nextAvailabilityJson: string | undefined = input.availabilityJson;
  if (input.availabilityStatus !== undefined) {
    const baseJson = nextAvailabilityJson ?? (await q<any>(
      `SELECT DBMS_LOB.SUBSTR(availability_json, 4000, 1) AS availability_json FROM providers WHERE user_id = :userId`,
      { userId }
    ))[0]?.AVAILABILITY_JSON ?? null;
    nextAvailabilityJson = mergeAvailabilityJson(baseJson, input.availabilityStatus as AvailabilityStatus);
  }
  if (nextAvailabilityJson !== undefined) {
    sets.push("availability_json = :availabilityJson");
    binds.availabilityJson = nextAvailabilityJson;
  }

  if (sets.length) {
    await q(`UPDATE providers SET ${sets.join(", ")} WHERE user_id = :userId`, binds);
  }

  return getMyProvider(userId);
}

export async function searchProviders(input: { lat: number; lng: number; maxKm: number; minRating?: number; sort?: string; q?: string }) {
  const b = bbox(input.lat, input.lng, input.maxKm);
  const distanceExpr = haversineSql();

  const where: string[] = [
    "p.verification_status = 'VERIFIED'",
    "u.account_status = 'ACTIVE'",
    "p.lat BETWEEN :minLat AND :maxLat",
    "p.lng BETWEEN :minLng AND :maxLng"
  ];
  const binds: any = {
    lat: input.lat,
    lng: input.lng,
    minLat: b.minLat,
    maxLat: b.maxLat,
    minLng: b.minLng,
    maxLng: b.maxLng,
    maxKm: input.maxKm
  };

  if (input.minRating !== undefined) {
    where.push("p.rating_avg >= :minRating");
    binds.minRating = input.minRating;
  }

  if (input.q) {
    where.push("(LOWER(u.name) LIKE :q OR LOWER(p.city) LIKE :q)");
    binds.q = `%${input.q.toLowerCase()}%`;
  }

  const sort = input.sort ?? "DISTANCE";
  const orderBy =
    sort === "RATING" ? "rating_avg DESC, distance_km ASC" :
    sort === "PRICE" ? "price_from ASC, distance_km ASC" :
    "distance_km ASC, rating_avg DESC";

  const sql = `
  SELECT *
  FROM (
    SELECT
      p.id, DBMS_LOB.SUBSTR(p.bio, 4000, 1) AS bio, p.city, p.lat, p.lng, p.radius_km, p.price_from, p.rating_avg, p.rating_count,
      u.name,
      ${distanceExpr} AS distance_km
    FROM providers p
    JOIN users u ON u.id = p.user_id
    WHERE ${where.join(" AND ")}
  )
  WHERE distance_km <= :maxKm
  ORDER BY ${orderBy}
  FETCH FIRST 50 ROWS ONLY
  `;

  const rows = await q<any>(sql, binds);
  return {
    items: rows
      .map(mapProviderRow)
      .filter((p: any) => p.availabilityStatus === "AVAILABLE")
  };
}

export async function listMyProviderDocuments(userId: string) {
  const p = await q<any>(`SELECT id FROM providers WHERE user_id = :userId`, { userId: userId });
  const providerId = p[0]?.ID;
  if (!providerId) throw Object.assign(new Error("NOT_PROVIDER"), { status: 400 });

  const rows = await q<any>(
    `SELECT id, doc_type, doc_label, status, rejection_reason, reviewed_at, created_at
     FROM provider_documents
     WHERE provider_id = :pid
     ORDER BY created_at DESC`,
    { pid: providerId }
  );
  return {
    items: rows.map((r) => ({
      id: r.ID,
      type: r.DOC_TYPE,
      label: r.DOC_LABEL ?? null,
      status: r.STATUS,
      rejectionReason: r.REJECTION_REASON ?? null,
      reviewedAt: r.REVIEWED_AT ? new Date(r.REVIEWED_AT).toISOString() : null,
      createdAt: new Date(r.CREATED_AT).toISOString()
    }))
  };
}

export async function submitProviderDocuments(
  userId: string,
  items: Array<{ type: "NATIONAL_ID" | "DRIVING_LICENSE" | "PASSPORT" | "OWNERSHIP_PAPER"; label?: string; payload: string }>
) {
  const p = await q<any>(`SELECT id FROM providers WHERE user_id = :userId`, { userId: userId });
  const providerId = p[0]?.ID;
  if (!providerId) throw Object.assign(new Error("NOT_PROVIDER"), { status: 400 });

  for (const d of items) {
    await q(
      `INSERT INTO provider_documents (id, provider_id, doc_type, doc_label, encrypted_payload, payload_hash, status, updated_at)
       VALUES (:id, :providerId, :docType, :docLabel, :encryptedPayload, :payloadHash, 'PENDING', SYSTIMESTAMP)`,
      {
        id: uuid(),
        providerId,
        docType: d.type,
        docLabel: d.label ?? null,
        encryptedPayload: encryptSensitive(d.payload),
        payloadHash: sha256Hex(d.payload)
      }
    );
  }

  await q(
    `UPDATE providers SET verification_status = 'PENDING', verification_notes = NULL WHERE id = :pid`,
    { pid: providerId }
  );
  await q(
    `UPDATE users SET account_status = 'PENDING_VERIFICATION' WHERE id = (SELECT user_id FROM providers WHERE id = :pid)`,
    { pid: providerId }
  );

  return listMyProviderDocuments(userId);
}

