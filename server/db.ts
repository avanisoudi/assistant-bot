import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, botSessions, InsertBotSession } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// === Bot Sessions ===

export async function getBotSessionByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(botSessions).where(eq(botSessions.userId, userId)).orderBy(botSessions.updatedAt).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createBotSession(data: InsertBotSession) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(botSessions).values(data);
  return result;
}

export async function updateBotSession(id: number, data: Partial<InsertBotSession>) {
  const db = await getDb();
  if (!db) return;
  const updateSet: Record<string, unknown> = {};
  if (data.status) updateSet.status = data.status;
  if (data.pairingCode !== undefined) updateSet.pairingCode = data.pairingCode;
  if (data.pairingCodeExpiresAt !== undefined) updateSet.pairingCodeExpiresAt = data.pairingCodeExpiresAt;
  if (data.codeSent !== undefined) updateSet.codeSent = data.codeSent;
  if (data.phoneNumber !== undefined) updateSet.phoneNumber = data.phoneNumber;
  await db.update(botSessions).set(updateSet).where(eq(botSessions.id, id));
}

export async function stopBotSession(id: number) {
  await updateBotSession(id, { status: "idle" as any, pairingCode: null, pairingCodeExpiresAt: null as any });
}
