import { q, tx } from "../../db/oracle";
import { uuid } from "../../utils/crypto";

function mapReview(r: any) {
  return {
    id: r.ID,
    bookingId: r.BOOKING_ID,
    providerId: r.PROVIDER_ID,
    clientId: r.CLIENT_ID,
    rating: Number(r.RATING),
    comment: r.COMMENT_TEXT ?? null,
    createdAt: new Date(r.CREATED_AT).toISOString()
  };
}

export async function listProviderReviews(providerId: string) {
  const rows = await q<any>(
    `SELECT * FROM reviews WHERE provider_id = :pid ORDER BY created_at DESC FETCH FIRST 100 ROWS ONLY`,
    { pid: providerId }
  );
  return { items: rows.map(mapReview) };
}

export async function createReview(input: { bookingId: string; clientId: string; rating: number; comment?: string }) {
  return tx(async (c) => {
    const b = await c.execute(
      `SELECT id, provider_id, client_id, status FROM bookings WHERE id = :id`,
      { id: input.bookingId },
      { autoCommit: false }
    );
    const row = (b.rows as any[] | undefined)?.[0];
    if (!row) throw Object.assign(new Error("NOT_FOUND"), { status: 404 });
    if (row.CLIENT_ID !== input.clientId) throw Object.assign(new Error("FORBIDDEN"), { status: 403 });
    if (row.STATUS !== "DONE") throw Object.assign(new Error("BOOKING_NOT_DONE"), { status: 400 });

    const id = uuid();
    await c.execute(
      `INSERT INTO reviews (id, booking_id, provider_id, client_id, rating, comment_text)
       VALUES (:id, :bid, :pid, :cid, :rating, :comment)`,
      { id, bid: input.bookingId, pid: row.PROVIDER_ID, cid: input.clientId, rating: input.rating, comment: input.comment ?? null },
      { autoCommit: false }
    );

    const agg = await c.execute(
      `SELECT AVG(rating) AS avg_rating, COUNT(*) AS cnt FROM reviews WHERE provider_id = :pid`,
      { pid: row.PROVIDER_ID },
      { autoCommit: false }
    );
    const a = (agg.rows as any[])[0];
    await c.execute(
      `UPDATE providers SET rating_avg = :avg, rating_count = :cnt WHERE id = :pid`,
      { avg: Number(a.AVG_RATING), cnt: Number(a.CNT), pid: row.PROVIDER_ID },
      { autoCommit: false }
    );

    const out = await c.execute(`SELECT * FROM reviews WHERE id = :id`, { id }, { autoCommit: false });
    return { review: mapReview((out.rows as any[])[0]) };
  });
}
