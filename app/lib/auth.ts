// lib/auth.ts
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Безопасный доступ к делегату User.
 * Если в schema.prisma нет модели `User` (или она названа иначе),
 * вернётся null — вызывающий код должен это учитывать.
 */
function getUserDelegate(): any | null {
  const db = prisma as unknown as Record<string, any>;
  return db && typeof db === "object" && db.user ? db.user : null;
}

/**
 * Создаёт админа, если его ещё нет.
 * Если модели User нет в схеме — тихо выходим (ничего не делаем).
 */
export async function ensureAdmin(): Promise<void> {
  const user = getUserDelegate();
  if (!user) {
    // Нет модели User — пропускаем сид.
    return;
  }
  const email = process.env.ADMIN_EMAIL || "admin@domeo.local";
  const password = process.env.ADMIN_PASSWORD || "admin123";

  const existing = await user.findUnique({ where: { email } });
  if (!existing) {
    const hash = await bcrypt.hash(password, 10);
    await user.create({
      data: { email, password: hash, role: "ADMIN" },
    });
  }
}

/**
 * Экспорт под ожидаемым именем роутом.
 */
export async function seedAdmin(): Promise<void> {
  await ensureAdmin();
}

/**
 * Найти пользователя по email. Если модели нет — вернёт null.
 */
export async function findUserByEmail(email: string) {
  const user = getUserDelegate();
  if (!user) return null;
  return user.findUnique({ where: { email } });
}

/**
 * Создать пользователя (роль USER по умолчанию).
 * Если модели нет — кидаем понятную ошибку.
 */
export async function createUser(
  email: string,
  password: string,
  role: "USER" | "ADMIN" = "USER"
) {
  const user = getUserDelegate();
  if (!user) throw new Error("Prisma model `User` is not available in schema.prisma");
  const hash = await bcrypt.hash(password, 10);
  return user.create({ data: { email, password: hash, role } });
}

/**
 * Проверка учётных данных. Возвращает объект пользователя или null.
 * Если модели нет — всегда null.
 */
export async function verifyUser(email: string, password: string) {
  const user = getUserDelegate();
  if (!user) return null;
  const u = await user.findUnique({ where: { email } });
  if (!u) return null;
  const ok = await bcrypt.compare(password, (u as any).password);
  return ok ? u : null;
}

/**
 * Экспорт под ожидаемым именем роутом: login(email, password)
 * Возвращает { ok, token, user }. Токен — дев-токен для smoke/CI (env SMOKE_TOKEN или 'smoke').
 * Если модели нет — всегда { ok:false }.
 */
export async function login(email: string, password: string): Promise<{
  ok: boolean;
  token: string;
  user: { id?: string; email?: string; role?: string } | null;
}> {
  const u = await verifyUser(email, password);
  if (!u) {
    return { ok: false, token: "", user: null };
  }
  const token = process.env.SMOKE_TOKEN || "smoke";
  return {
    ok: true,
    token,
    user: {
      id: (u as any).id,
      email: (u as any).email,
      role: (u as any).role ?? "USER",
    },
  };
}
