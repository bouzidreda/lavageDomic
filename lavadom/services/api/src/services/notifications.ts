import { q } from "../db/oracle";
import { uuid } from "../utils/crypto";

export async function enqueueEmail(userId: string, kind: string, payload: { to: string; subject: string; text: string }) {
  await q(
    `INSERT INTO notifications (id, user_id, channel, kind, payload, status)
     VALUES (:id, :userId, 'EMAIL', :kind, :payload, 'QUEUED')`,
    { id: uuid(), userId: userId, kind, payload: JSON.stringify(payload) }
  );

  // Deployment-ready fallback: queue in DB and log until SMTP provider is configured.
  console.log("[mail:queued]", payload.to, payload.subject);
}

export async function enqueueSms(userId: string, kind: string, payload: { to: string; text: string }) {
  await q(
    `INSERT INTO notifications (id, user_id, channel, kind, payload, status)
     VALUES (:id, :userId, 'SMS', :kind, :payload, 'QUEUED')`,
    { id: uuid(), userId: userId, kind, payload: JSON.stringify(payload) }
  );

  // Deployment-ready fallback: queue in DB and log until SMS provider is configured.
  console.log("[sms:queued]", payload.to);
}

