import oracledb from "oracledb";
import { env } from "../config/env";

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
oracledb.fetchAsString = [oracledb.CLOB];

let pool: any = null;

async function ensureCompatibility(p: any) {
  const c = await p.getConnection();
  try {
    const r = await c.execute(
      `SELECT COUNT(*) AS cnt
       FROM user_tab_cols
       WHERE table_name = 'USERS' AND column_name = 'SUSPENSION_REASON'`
    );
    const cnt = Number((r.rows as any[] | undefined)?.[0]?.CNT ?? 0);
    if (cnt === 0) {
      await c.execute(`ALTER TABLE users ADD (suspension_reason VARCHAR2(500))`);
      await c.commit();
    }
  } finally {
    await c.close();
  }
}

export async function initDb() {
  if (pool) return pool;
  pool = await oracledb.createPool({
    user: env.ORACLE_USER,
    password: env.ORACLE_PASSWORD,
    connectString: env.ORACLE_CONNECT_STRING,
    poolMin: 1,
    poolMax: 10,
    poolIncrement: 1
  });
  await ensureCompatibility(pool);
  return pool;
}

export async function withConn<T>(fn: (c: any) => Promise<T>) {
  const p = await initDb();
  const c = await p.getConnection();
  try {
    return await fn(c);
  } finally {
    await c.close();
  }
}

export async function q<T = any>(sql: string, binds: any = {}, opts: any = {}) {
  return withConn(async (c) => {
    const r = await c.execute(sql, binds, { autoCommit: true, ...opts });
    return (r.rows ?? []) as T[];
  });
}

export async function tx<T>(fn: (c: any) => Promise<T>) {
  const p = await initDb();
  const c = await p.getConnection();
  try {
    const r = await fn(c);
    await c.commit();
    return r;
  } catch (e) {
    try { await c.rollback(); } catch {}
    throw e;
  } finally {
    await c.close();
  }
}