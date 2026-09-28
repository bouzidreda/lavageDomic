import { q } from "../../db/oracle";
import { bbox, haversineSql } from "../../utils/geo";

function mapProviderRow(r: any) {
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
    distanceKm: r.DISTANCE_KM !== undefined ? Number(r.DISTANCE_KM) : undefined
  };
}

export async function getProvider(id: string) {
  const rows = await q<any>(
    `SELECT p.*, u.name
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
    `SELECT p.*, u.name
     FROM providers p
     JOIN users u ON u.id = p.user_id
     WHERE p.user_id = :uid`,
    { uid: userId }
  );
  const p = rows[0];
  if (!p) throw Object.assign(new Error("NOT_FOUND"), { status: 404 });
  return { provider: mapProviderRow(p) };
}

export async function updateMyProvider(userId: string, input: any) {
  const sets: string[] = [];
  const binds: any = { uid: userId };

  if (input.bio !== undefined) { sets.push("bio = :bio"); binds.bio = input.bio; }
  if (input.city !== undefined) { sets.push("city = :city"); binds.city = input.city; }
  if (input.lat !== undefined) { sets.push("lat = :lat"); binds.lat = input.lat; }
  if (input.lng !== undefined) { sets.push("lng = :lng"); binds.lng = input.lng; }
  if (input.radiusKm !== undefined) { sets.push("radius_km = :radiusKm"); binds.radiusKm = input.radiusKm; }
  if (input.priceFrom !== undefined) { sets.push("price_from = :priceFrom"); binds.priceFrom = input.priceFrom; }

  if (sets.length) {
    await q(`UPDATE providers SET ${sets.join(", ")} WHERE user_id = :uid`, binds);
  }

  return getMyProvider(userId);
}

export async function searchProviders(input: { lat: number; lng: number; maxKm: number; minRating?: number; sort?: string; q?: string }) {
  const b = bbox(input.lat, input.lng, input.maxKm);
  const distanceExpr = haversineSql();

  const where: string[] = [
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
    sort === "RATING" ? "p.rating_avg DESC, distance_km ASC" :
    sort === "PRICE" ? "p.price_from ASC, distance_km ASC" :
    "distance_km ASC, p.rating_avg DESC";

  const sql = `
  SELECT *
  FROM (
    SELECT
      p.id, p.bio, p.city, p.lat, p.lng, p.radius_km, p.price_from, p.rating_avg, p.rating_count,
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
  return { items: rows.map(mapProviderRow) };
}
