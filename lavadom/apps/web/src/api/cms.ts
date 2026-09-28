import { api } from "./client";

export function cmsBySlug(slug: string) {
  return api<{ page: null | { id: string; slug: string; title: string; content: string; updatedAt: string } }>(
    `/v1/cms/${encodeURIComponent(slug)}`,
    "GET"
  );
}
