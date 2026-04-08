import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL não definida no ambiente');
}

// Cliente PostgreSQL
const queryClient = postgres(DATABASE_URL);

// Cliente Drizzle ORM
export const db = drizzle(queryClient, { schema });

export type Database = typeof db;
