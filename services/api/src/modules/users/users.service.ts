import { q } from "../../db/oracle";

export async function getMe(userId: string) {
  const rows = await q<any>(`SELECT id, role, name, phone FROM users WHERE id = :id`, { id: userId });
  const u = rows[0];
  if (!u) throw Object.assign(new Error("NOT_FOUND"), { status: 404 });
  return { id: u.ID, role: u.ROLE, name: u.NAME, phone: u.PHONE };
}

export async function patchMe(userId: string, input: { name?: string; phone?: string }) {
  const sets: string[] = [];
  const binds: any = { id: userId };

  if (input.name) { sets.push("name = :name"); binds.name = input.name; }
  if (input.phone) { sets.push("phone = :phone"); binds.phone = input.phone; }

  if (sets.length) {
    await q(`UPDATE users SET ${sets.join(", ")} WHERE id = :id`, binds);
  }

  return getMe(userId);
}
