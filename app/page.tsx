import { redirect } from 'next/navigation'

// The proxy handles authenticated visitors and sends them to /dashboard.
// Keep the public entry point independent of the database/session adapter so
// a transient auth or database issue cannot prevent the login UI from loading.
export default function RootPage() {
  redirect('/login')
}
