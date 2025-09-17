import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
export const runtime = 'nodejs';
function pickFiles(form: FormData, keys: string[]): File[] {
  for (const k of keys) {
    const vals = form.getAll(k);
    const files = vals.filter((v): v is File => v instanceof File);
    if (files.length) return files;
  } return [];
}
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const rawModel = form.get('model');
    if (typeof rawModel !== 'string' || !rawModel.trim()) {
      return NextResponse.json({ error: 'model is required' }, { status: 400 });
    }
    const model = rawModel.trim();
    const files = pickFiles(form, ['file','file[]','files','files[]']);
    if (!files.length) return NextResponse.json({ error: 'file is required' }, { status: 400 });
    const publicDir = path.join(process.cwd(), 'public', 'assets', 'doors');
    await fs.mkdir(publicDir, { recursive: true });
    const saved: { filename: string; url: string }[] = [];
    for (const f of files) {
      const buf = Buffer.from(await f.arrayBuffer());
      const orig = f.name || 'upload.bin';
      const ext = (orig.includes('.') ? orig.slice(orig.lastIndexOf('.')) :
        (f.type === 'image/jpeg' ? '.jpg' : f.type === 'image/png' ? '.png' : '')
      ).toLowerCase();
      const encoded = encodeURIComponent(model) + ext;
      await fs.writeFile(path.join(publicDir, encoded), buf);
      saved.push({ filename: encoded, url: `/assets/doors/${encoded}` });
    }
    return NextResponse.json({ files: saved }, { status: 200 });
  } catch (e) {
    console.error('media/upload error', e);
    return NextResponse.json({ error: 'internal error' }, { status: 500 });
  }
}
