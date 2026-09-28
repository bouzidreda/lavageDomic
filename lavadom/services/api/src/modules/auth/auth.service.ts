import crypto from "crypto";
import { env } from "../../config/env";
import { q, tx } from "../../db/oracle";
import { enqueueEmail, enqueueSms } from "../../services/notifications";
import { uuid } from "../../utils/crypto";
import { signAccess, signRefresh, verifyRefresh } from "../../utils/jwt";
import { hashPassword, verifyPassword } from "../../utils/password";
import { encryptSensitive, sha256Hex } from "../../utils/secure";

type Role = "CLIENT" | "PROVIDER" | "ADMIN";

function mapUser(u: any) {
  return {
    id: u.ID,
    role: u.ROLE as Role,
    name: u.NAME,
    email: u.EMAIL,
    phone: u.PHONE,
    accountStatus: u.ACCOUNT_STATUS,
    emailVerified: Boolean(u.EMAIL_VERIFIED)
  };
}

function tokenBundle(id: string, role: Role) {
  return {
    accessToken: signAccess({ sub: id, role }),
    refreshToken: signRefresh({ sub: id, role })
  };
}

export async function registerUser(input: {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: "CLIENT" | "PROVIDER";
  providerDocuments?: Array<{ type: "NATIONAL_ID" | "DRIVING_LICENSE" | "PASSPORT" | "OWNERSHIP_PAPER"; label?: string; payload: string }>;
}) {
  const id = uuid();
  const passwordHash = hashPassword(input.password);
  const accountStatus = input.role === "PROVIDER" ? "PENDING_VERIFICATION" : "ACTIVE";

  return tx(async (c) => {
    try {
      await c.execute(
        `INSERT INTO users (id, role, name, email, phone, password_hash, account_status)
         VALUES (:id, :role, :name, :email, :phone, :ph, :accountStatus)`,
        {
          id,
          role: input.role,
          name: input.name,
          email: input.email.toLowerCase(),
          phone: input.phone,
          ph: passwordHash,
          accountStatus
        },
        { autoCommit: false }
      );
    } catch {
      throw Object.assign(new Error("EMAIL_OR_PHONE_EXISTS"), { status: 409 });
    }

    if (input.role === "PROVIDER") {
      if (!input.providerDocuments?.length) throw Object.assign(new Error("PROVIDER_DOCUMENTS_REQUIRED"), { status: 400 });
      const providerId = uuid();
      await c.execute(
        `INSERT INTO providers (id, user_id, bio, city, lat, lng, radius_km, price_from, verification_status)
         VALUES (:pid, :userId, NULL, NULL, :lat, :lng, 10, 0, 'PENDING')`,
        { pid: providerId, userId: id, lat: 30.4278, lng: -9.5981 },
        { autoCommit: false }
      );
      await c.execute(
        `INSERT INTO services (id, provider_id, name, price, active) VALUES (:id, :pid, :name, :price, 1)`,
        { id: uuid(), pid: providerId, name: "Standard wash", price: 80 },
        { autoCommit: false }
      );

      for (const d of input.providerDocuments) {
        await c.execute(
          `INSERT INTO provider_documents (id, provider_id, doc_type, doc_label, encrypted_payload, payload_hash, status)
           VALUES (:id, :providerId, :docType, :docLabel, :encryptedPayload, :payloadHash, 'PENDING')`,
          {
            id: uuid(),
            providerId,
            docType: d.type,
            docLabel: d.label ?? null,
            encryptedPayload: encryptSensitive(d.payload),
            payloadHash: sha256Hex(d.payload)
          },
          { autoCommit: false }
        );
      }
    }

    await enqueueEmail(id, "WELCOME", {
      to: input.email.toLowerCase(),
      subject: "Bienvenue sur Lavadom",
      text: "Votre compte a ete cree."
    });
    await enqueueSms(id, "WELCOME", { to: input.phone, text: "Bienvenue sur Lavadom. Votre compte est cree." });

    const tokens = tokenBundle(id, input.role);
    return {
      user: { id, role: input.role, name: input.name, email: input.email.toLowerCase(), phone: input.phone, accountStatus },
      tokens
    };
  });
}

export async function loginUser(input: { identifier: string; password: string }) {
  const identifier = input.identifier.trim().toLowerCase();
  const rows = await q<any>(
    `SELECT id, role, name, email, phone, password_hash, account_status, suspension_reason, email_verified
     FROM users
     WHERE LOWER(email) = :identifier OR phone = :phone`,
    { identifier, phone: input.identifier.trim() }
  );
  const u = rows[0];
  if (!u) throw Object.assign(new Error("INVALID_CREDENTIALS"), { status: 401 });

  const ok = verifyPassword(input.password, u.PASSWORD_HASH);
  if (!ok) throw Object.assign(new Error("INVALID_CREDENTIALS"), { status: 401 });
  if (u.ACCOUNT_STATUS === "SUSPENDED") {
    throw Object.assign(new Error("ACCOUNT_SUSPENDED"), {
      status: 403,
      details: { reason: u.SUSPENSION_REASON ?? null }
    });
  }

  const role = u.ROLE as Role;
  return { user: mapUser(u), tokens: tokenBundle(u.ID, role) };
}

export async function refreshTokens(input: { refreshToken: string }) {
  let claims: any;
  try {
    claims = verifyRefresh(input.refreshToken);
  } catch {
    throw Object.assign(new Error("INVALID_REFRESH"), { status: 401 });
  }

  const rows = await q<any>(
    `SELECT id, role, name, email, phone, account_status, suspension_reason, email_verified
     FROM users
     WHERE id = :id`,
    { id: claims.sub }
  );
  const u = rows[0];
  if (!u) throw Object.assign(new Error("INVALID_REFRESH"), { status: 401 });
  if (u.ACCOUNT_STATUS === "SUSPENDED") {
    throw Object.assign(new Error("ACCOUNT_SUSPENDED"), {
      status: 403,
      details: { reason: u.SUSPENSION_REASON ?? null }
    });
  }

  const role = u.ROLE as Role;
  return { user: mapUser(u), tokens: tokenBundle(u.ID, role) };
}

function sha256(text: string) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

export async function forgotPasswordForEmail(email: string) {
  const rows = await q<any>(`SELECT id, email FROM users WHERE LOWER(email) = :email`, { email: email.toLowerCase() });
  const u = rows[0];
  if (!u) return { ok: true };

  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = sha256(token);
  const id = uuid();

  await q(
    `INSERT INTO password_resets (id, user_id, token_hash, expires_at)
     VALUES (:id, :userId, :tokenHash, SYSTIMESTAMP + NUMTODSINTERVAL(:ttl, 'MINUTE'))`,
    { id, userId: u.ID, tokenHash, ttl: env.PASSWORD_RESET_TTL_MIN }
  );

  const resetUrl = `${env.APP_BASE_URL}/reset-password?token=${encodeURIComponent(token)}`;
  await enqueueEmail(u.ID, "PASSWORD_RESET", {
    to: u.EMAIL,
    subject: "Reinitialisation du mot de passe",
    text: `Cliquez ici pour reinitialiser votre mot de passe: ${resetUrl}`
  });

  return { ok: true };
}

export async function resetPasswordWithToken(token: string, newPassword: string) {
  const tokenHash = sha256(token);
  return tx(async (c) => {
    const rows = await c.execute(
      `SELECT id, user_id
       FROM password_resets
       WHERE token_hash = :tokenHash
         AND used_at IS NULL
         AND expires_at > SYSTIMESTAMP
       ORDER BY created_at DESC
       FETCH FIRST 1 ROWS ONLY`,
      { tokenHash },
      { autoCommit: false }
    );

    const row = (rows.rows as any[] | undefined)?.[0];
    if (!row) throw Object.assign(new Error("INVALID_OR_EXPIRED_TOKEN"), { status: 400 });

    await c.execute(
      `UPDATE users SET password_hash = :ph, updated_at = SYSTIMESTAMP WHERE id = :userId`,
      { ph: hashPassword(newPassword), userId: row.USER_ID },
      { autoCommit: false }
    );

    await c.execute(
      `UPDATE password_resets SET used_at = SYSTIMESTAMP WHERE id = :id`,
      { id: row.ID },
      { autoCommit: false }
    );

    return { ok: true };
  });
}

