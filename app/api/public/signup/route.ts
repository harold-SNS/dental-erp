import { NextResponse } from 'next/server'

// Hospital accounts are provisioned by the platform Super Admin.
// Keep this endpoint as an explicit denial so older clients cannot bypass
// the controlled onboarding flow.
export async function POST() {
  return NextResponse.json(
    { error: 'Public registration is disabled. Please contact your system administrator.' },
    { status: 403 }
  )
}
