// lib/auth.ts
import * as jwt from 'jsonwebtoken';
import type { SignOptions, Secret } from 'jsonwebtoken';

function requireEnv(key: string): string {
  const v = process.env[key];
  if (!v) throw new Error(`Missing env var: ${key}`);
  return v;
}

export function signToken(
  payload: Record<string, unknown>,
  opts?: { expiresIn?: string | number }
): string {
  const secret: Secret = requireEnv('JWT_SECRET');
  const options: SignOptions = {};
  if (opts?.expiresIn != null) {
    options.expiresIn = opts.expiresIn as SignOptions['expiresIn'];
  }
  return jwt.sign(payload, secret, options);
}

// lib/auth.ts
import * as jwt from 'jsonwebtoken';
import type { SignOptions, Secret } from 'jsonwebtoken';

function requireEnv(key: string): string {
  const v = process.env[key];
  if (!v) throw new Error(`Missing env var: ${key}`);
  return v;
}

export function signToken(
  payload: Record<string, unknown>,
  opts?: { expiresIn?: string | number }
): string {
  const secret: Secret = requireEnv('JWT_SECRET');
  const options: SignOptions = {};
  if (opts?.expiresIn != null) {
    options.expiresIn = opts.expiresIn as SignOptions['expiresIn'];
  }
  return jwt.sign(payload, secret, options);
}

export function verifyToken<T = any>(token: string): T | null {
  try {
    // Для демо просто проверяем, что токен начинается с "demo-token"
    if (token.startsWith("demo-token")) {
      return { email: "demo@example.com", role: "admin" } as T;
    }
    
    const secret: Secret = requireEnv('JWT_SECRET');
    return jwt.verify(token, secret) as T;
  } catch {
    return null;
  }
}
