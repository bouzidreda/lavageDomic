import crypto from "crypto";
import { env } from "../config/env";

function getKey() {
  return crypto.createHash("sha256").update(env.DOCS_ENCRYPTION_KEY).digest();
}

export function encryptSensitive(payload: string) {
  const iv = crypto.randomBytes(12);
  const key = getKey();
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const data = Buffer.concat([cipher.update(payload, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString("base64"), tag.toString("base64"), data.toString("base64")].join(".");
}

export function decryptSensitive(ciphertext: string) {
  const [ivB64, tagB64, dataB64] = ciphertext.split(".");
  if (!ivB64 || !tagB64 || !dataB64) throw new Error("INVALID_ENCRYPTED_PAYLOAD");
  const key = getKey();
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(ivB64, "base64"));
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  const plain = Buffer.concat([decipher.update(Buffer.from(dataB64, "base64")), decipher.final()]);
  return plain.toString("utf8");
}

export function sha256Hex(payload: string) {
  return crypto.createHash("sha256").update(payload).digest("hex");
}