import { tx, q } from "../../db/oracle";
import { uuid } from "../../utils/crypto";
import { signAccess, signRefresh, verifyRefresh } from "../../utils/jwt";
import crypto from "crypto";

function hashPassword(password: string, salt: string, cost: number) {
  const keylen = 32;
  const iter = 100000 + cost * 1000;
  const h = crypto.pbkdf2Sync(password, salt, iter, keylen, "sha256").toString("hex");
  return { salt, iter, h };
}

function verifyPassword(password: string, stored: string) {
  const [salt, iterS, h] = stored.split(":");
  const iter = Number(iterS);
  const keylen = 32;
  const calc = crypto.pbkdf2Sync(password, salt, iter, keylen, "sha256").toString("hex");
  return crypto.timingSafeEqual(Buffer.from(calc, "hex"), Buffer.from(h, "hex"));
}

export async function registerUser(input: { name: string; phone: string; password: string; role: "CLIENT" | "PROVIDER" }) {
  const id = uuid();
  const salt = crypto.randomBytes(16).toString("hex");
  const ph = hashPassword(input.password, salt, 12);
  const password_hash = `${ph.salt}:${ph.iter}:${ph.h}`;

  return tx(async (c) => {
    await c.execute(
      `INSERT INTO users (id, role, name, phone, password_hash) VALUES (:id, :role, :name, :phone, :ph)`,
      { id, role: input.role, name: input.name, phone: input.phone, ph: password_hash },
      { autoCommit: false }
    );

    if (input.role === "PROVIDER") {
      const providerId = uuid();
      await c.execute(
        `INSERT INTO providers (id, user_id, bio, city, lat, lng, radius_km, price_from) VALUES (:pid, :uid, NULL, NULL, :lat, :lng, 10, 0)`,
        { pid: providerId, uid: id, lat: 30.4278, lng: -9.5981 },
        { autoCommit: false }
      );
      await c.execute(
        `INSERT INTO services (id, provider_id, name, price, active) VALUES (:id, :pid, :name, :price, 1)`,
        { id: uuid(), pid: providerId, name: "Standard wash", price: 80 },
        { autoCommit: false }
      );
    }

    const tokens = {
      accessToken: signAccess({ sub: id, role: input.role }),
      refreshToken: signRefresh({ sub: id, role: input.role })
    };
    return { user: { id, role: input.role, name: input.name, phone: input.phone }, tokens };
  });
}

export async function loginUser(input: { phone: string; password: string }) {
  const rows = await q<any>(`SELECT id, role, name, phone, password_hash FROM users WHERE phone = :phone`, { phone: input.phone });
  const u = rows[0];
  if (!u) throw Object.assign(new Error("INVALID_CREDENTIALS"), { status: 401 });

  const ok = verifyPassword(input.password, u.PASSWORD_HASH);
  if (!ok) throw Object.assign(new Error("INVALID_CREDENTIALS"), { status: 401 });

  const role = u.ROLE as "CLIENT" | "PROVIDER" | "ADMIN";
  const tokens = {
    accessToken: signAccess({ sub: u.ID, role }),
    refreshToken: signRefresh({ sub: u.ID, role })
  };
  return { user: { id: u.ID, role, name: u.NAME, phone: u.PHONE }, tokens };
}

export async function refreshTokens(input: { refreshToken: string }) {
  let claims: any;
  try { claims = verifyRefresh(input.refreshToken); } catch { throw Object.assign(new Error("INVALID_REFRESH"), { status: 401 }); }
  const rows = await q<any>(`SELECT id, role, name, phone FROM users WHERE id = :id`, { id: claims.sub });
  const u = rows[0];
  if (!u) throw Object.assign(new Error("INVALID_REFRESH"), { status: 401 });

  const role = u.ROLE as "CLIENT" | "PROVIDER" | "ADMIN";
  const tokens = {
    accessToken: signAccess({ sub: u.ID, role }),
    refreshToken: signRefresh({ sub: u.ID, role })
  };
  return { user: { id: u.ID, role, name: u.NAME, phone: u.PHONE }, tokens };
}
