import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { Plan, Role } from '@/lib/generated/prisma/enums'
import { syncCredentialAccount } from '@/lib/auth-credentials'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Idempotently provisions the one platform administrator from server-only
 * environment variables. No credential material is returned to the client.
 * Existing accounts are never silently promoted or have their passwords reset.
 */
export async function POST() {
  const name = process.env.SUPERADMIN_NAME?.trim()
  const email = process.env.SUPERADMIN_EMAIL?.trim().toLowerCase()
  const password = process.env.SUPERADMIN_PASSWORD

  if (!name || !email || !password || password.length < 12) {
    return NextResponse.json({ success: false }, { status: 503 })
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ success: existing.isSuperAdmin })
    }

    const anotherSuperAdmin = await prisma.user.findFirst({
      where: { isSuperAdmin: true },
      select: { id: true },
    })
    if (anotherSuperAdmin) {
      return NextResponse.json({ success: false }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 12)
    await prisma.$transaction(async (tx) => {
      const hospital = await tx.hospital.upsert({
        where: { slug: 'dental-erp-platform' },
        update: {},
        create: {
          name: 'Dental ERP Platform',
          slug: 'dental-erp-platform',
          email,
          plan: Plan.SELF_HOSTED,
          isActive: true,
          onboardingCompleted: true,
          patientLimit: -1,
          staffLimit: -1,
          storageLimitMb: -1,
        },
      })

      const user = await tx.user.create({
        data: {
          name,
          email,
          password: passwordHash,
          role: Role.ADMIN,
          isActive: true,
          isHospitalAdmin: true,
          isSuperAdmin: true,
          emailVerified: new Date(),
          emailVerifiedBa: true,
          hospitalId: hospital.id,
        },
      })
      await syncCredentialAccount(tx, user.id, passwordHash)
    })

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    // A concurrent first request may win the unique-email race. Re-read and
    // report success only if the configured address is now the Super Admin.
    const created = await prisma.user.findUnique({ where: { email }, select: { isSuperAdmin: true } }).catch(() => null)
    if (created?.isSuperAdmin) return NextResponse.json({ success: true })
    console.error('Super Admin bootstrap failed', error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
