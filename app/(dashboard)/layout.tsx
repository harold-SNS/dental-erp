import { redirect } from 'next/navigation'
import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { ClinicLocaleProvider } from '@/components/i18n/clinic-locale-provider'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession()

  if (!session?.user) {
    redirect('/login')
  }

  const sessionUser = session.user as { hospitalId?: string; isSuperAdmin?: boolean }
  const hospitalId = sessionUser.hospitalId
  const availableHospitals = sessionUser.isSuperAdmin
    ? await prisma.hospital.findMany({ where: { isActive: true }, orderBy: { name: 'asc' }, select: { id: true, name: true } })
    : []

  // Fetch hospital info
  const hospital = hospitalId
    ? await prisma.hospital.findUnique({
        where: { id: hospitalId },
        select: {
          name: true,
          plan: true,
          logo: true,
          currency: true,
          onboardingCompleted: true,
        },
      })
    : null

  // Redirect to onboarding if not complete (except if already on onboarding page)
  if (hospital && !hospital.onboardingCompleted) {
    redirect('/onboarding')
  }

  const su = session.user as { name?: string; email?: string; role?: string; isSuperAdmin?: boolean }
  const user = {
    name: su.name || 'User',
    email: su.email || '',
    role: su.role || 'RECEPTIONIST',
    isSuperAdmin: !!su.isSuperAdmin,
  }

  const hospitalInfo = hospital
    ? {
        name: hospital.name,
        plan: hospital.plan,
        logo: hospital.logo,
      }
    : undefined

  return (
    <ClinicLocaleProvider currency={hospital?.currency || 'INR'}>
      <DashboardShell user={user} hospital={hospitalInfo} hospitals={availableHospitals} activeHospitalId={hospitalId || ''}>
        {children}
      </DashboardShell>
    </ClinicLocaleProvider>
  )
}
