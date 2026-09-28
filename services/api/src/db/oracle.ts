import oracledb from "node-oracledb";
import { env } from "../config/env";

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

let pool: oracledb.Pool | null = null;

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
  return pool;
}

export async function withConn<T>(fn: (c: oracledb.Connection) => Promise<T>) {
  const p = await initDb();
  const c = await p.getConnection();
  try {
    return await fn(c);
  } finally {
    await c.close();
  }
}

export async function q<T = any>(sql: string, binds: any = {}, opts: oracledb.ExecuteOptions = {}) {
  return withConn(async (c) => {
    const r = await c.execute<any>(sql, binds, { autoCommit: true, ...opts });
    return (r.rows ?? []) as T[];
  });
}

export async function tx<T>(fn: (c: oracledb.Connection) => Promise<T>) {
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
