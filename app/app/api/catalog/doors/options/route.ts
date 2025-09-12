import { prisma } from '@/lib/db'
export async function GET(req: Request) {
  // TODO: реализовать dependsOn-цепочку.
  // Пока вернём уникальные значения по основным полям, чтобы фронт ожил.
  const [models, finishes, colors, types] = await Promise.all([
    prisma.products.findMany({ select: { model: true }, distinct: ['model'] }),
    prisma.products.findMany({ select: { finish: true }, distinct: ['finish'] }),
    prisma.products.findMany({ select: { color: true }, distinct: ['color'] }),
    prisma.products.findMany({ select: { type: true }, distinct: ['type'] }),
  ])
  return Response.json({
    model: models.map(m=>m.model).filter(Boolean),
    finish: finishes.map(f=>f.finish).filter(Boolean),
    color: colors.map(c=>c.color).filter(Boolean),
    type: types.map(t=>t.type).filter(Boolean),
  })
}
