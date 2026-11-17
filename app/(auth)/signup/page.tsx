import Link from 'next/link'
import { ShieldCheck, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function SignupPage() {
  return (
    <Card className="shadow-lg">
      <CardHeader className="space-y-2 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl font-bold">Registration is managed by your administrator</CardTitle>
        <CardDescription>New hospital and staff accounts are created through the Dental ERP administration process.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-center text-sm text-muted-foreground">If your hospital needs access, contact the system administrator. If you already have an account, sign in below.</p>
        <Button asChild className="w-full"><Link href="/login"><ArrowLeft className="mr-2 h-4 w-4" />Back to login</Link></Button>
      </CardContent>
    </Card>
  )
}
