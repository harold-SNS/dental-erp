import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  const session = await getServerSession()
  if (!session?.user || !(session.user as { isSuperAdmin?: boolean }).isSuperAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json().catch(() => ({}))
  const hospitalId = typeof body.hospitalId === 'string' ? body.hospitalId : ''
  const hospital = await prisma.hospital.findFirst({
    where: { id: hospitalId, isActive: true },
    select: { id: true },
  })
  if (!hospital) return NextResponse.json({ error: 'Hospital not found' }, { status: 404 })

  const response = NextResponse.json({ success: true })
  response.cookies.set('dental-erp-active-hospital', hospital.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })
  return response
}
