import { createApp } from "./app";
import { env } from "./config/env";
import { initDb } from "./db/oracle";

async function main() {
  await initDb();
  const app = createApp();
  app.listen(env.API_PORT, () => {
    console.log(`api http://localhost:${env.API_PORT}`);
  });
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});