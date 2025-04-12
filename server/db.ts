import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Konfiguriere Neon für WebSocket-Verbindungen
neonConfig.webSocketConstructor = ws;

// Überprüfe, ob die DATABASE_URL-Umgebungsvariable vorhanden ist
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL muss gesetzt sein. Wurde die Datenbank korrekt bereitgestellt?",
  );
}

// Erstelle den Verbindungspool
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Erstelle die Drizzle-Datenbankinstanz mit dem Schema
export const db = drizzle(pool, { schema });