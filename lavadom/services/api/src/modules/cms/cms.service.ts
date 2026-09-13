import { q } from "../../db/oracle";

export async function getCmsBySlug(slug: string) {
  const rows = await q<any>(
    `SELECT id, slug, title, content, updated_at
     FROM cms_pages
     WHERE slug = :slug
     FETCH FIRST 1 ROWS ONLY`,
    { slug }
  );
  const r = rows[0];
  if (!r) return { page: null as null };
  return {
    page: {
      id: r.ID,
      slug: r.SLUG,
      title: r.TITLE,
      content: r.CONTENT,
      updatedAt: new Date(r.UPDATED_AT).toISOString()
    }
  };
}
