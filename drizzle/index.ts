import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL as string;

// Disable prefetch as it is not supported for "Transaction" pool mode
const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client);

// : ReturnType<typeof drizzle<typeof schema>>

// let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

// export const db = () => {
//   if (!_db) {
//     const pool = new Pool({
//       // connection pool initiation code
//     });

//     _db = drizzle(pool, { schema });
//   }

//   return _db;
// };
