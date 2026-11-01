import { defineConfig } from "drizzle-kit";

const host = process.env.MYSQL_HOST ?? "127.0.0.1";
const port = process.env.MYSQL_PORT ?? "3306";
const user = process.env.MYSQL_USER ?? "root";
const password = process.env.MYSQL_PASSWORD ?? "";
const database = process.env.MYSQL_DATABASE ?? "gadgetpulse";

export default defineConfig({
  out: "./drizzle",
  schema: "./db/schema.ts",
  dialect: "mysql",
  dbCredentials: {
    url: `mysql://${user}:${encodeURIComponent(password)}@${host}:${port}/${database}`
  }
});
