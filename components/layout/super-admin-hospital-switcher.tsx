'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, ChevronDown, Loader2 } from 'lucide-react'

interface Props {
  hospitals: { id: string; name: string }[]
  activeHospitalId: string
}

export function SuperAdminHospitalSwitcher({ hospitals, activeHospitalId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function changeHospital(hospitalId: string) {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/superadmin/active-hospital', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hospitalId }),
      })
      if (!response.ok) throw new Error('Unable to switch hospital context')
      router.refresh()
    } catch {
      setError('Could not switch hospital. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border bg-card px-4 py-3 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Building2 className="h-4 w-4 text-primary" />
        <span>Super Admin · Operating hospital</span>
      </div>
      <div className="relative min-w-[220px] flex-1 sm:max-w-sm">
        <select
          aria-label="Select hospital context"
          value={activeHospitalId}
          disabled={loading}
          onChange={(event) => changeHospital(event.target.value)}
          className="h-10 w-full appearance-none rounded-md border bg-background px-3 pr-9 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
        >
          {hospitals.map((hospital) => (
            <option key={hospital.id} value={hospital.id}>{hospital.name}</option>
          ))}
        </select>
        {loading ? <Loader2 className="pointer-events-none absolute right-3 top-3 h-4 w-4 animate-spin" /> : <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4" />}
      </div>
      <span className="text-xs text-muted-foreground">Your permissions remain global; data views use the selected hospital.</span>
      {error && <p role="alert" className="w-full text-xs text-destructive">{error}</p>}
    </div>
  )
}
