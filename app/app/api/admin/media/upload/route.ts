import { writeFile } from 'fs/promises'
import { randomUUID } from 'crypto'
import { join } from 'path'

export async function POST(req: Request) {
  const form = await req.formData()
  const file = form.get('file') as File | null
  if (!file) return new Response(JSON.stringify({ error: 'file required' }), { status: 400 })
  const bytes = Buffer.from(await file.arrayBuffer())
  const ext = (file.name.split('.').pop() || 'bin').toLowerCase()
  const name = `${randomUUID()}.${ext}`
  const rel = `/uploads/${name}`
  const abs = join(process.cwd(), 'public', rel)
  await writeFile(abs, bytes)
  return Response.json({ ok: true, path: rel })
}
