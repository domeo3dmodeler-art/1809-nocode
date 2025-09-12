import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { prisma } from './db'

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret'

export async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL || 'admin@domeo.local'
  const password = process.env.ADMIN_PASSWORD || 'admin123'
  const existing = await prisma.user.findUnique({ where: { email } })
  if (!existing) {
    const hash = await bcrypt.hash(password, 10)
    await prisma.user.create({ data: { email, password: hash, role: 'ADMIN' } })
    console.log(`[seed] Admin created: ${email}`)
  }
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return null
  const ok = await bcrypt.compare(password, user.password)
  if (!ok) return null
  const token = jwt.sign({ uid: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' })
  return token
}

export function verify(token?: string) {
  try { return jwt.verify(token || '', JWT_SECRET) as any } catch { return null }
}
