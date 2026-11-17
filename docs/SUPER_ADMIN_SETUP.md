# Platform Super Admin

Set these server-side variables in Vercel (Production and Preview as appropriate):

```env
SUPERADMIN_NAME="System Administrator"
SUPERADMIN_EMAIL="admin@example.com"
SUPERADMIN_PASSWORD="use-a-unique-password-of-at-least-12-characters"
```

Never prefix these variables with `NEXT_PUBLIC_`. The login screen calls the idempotent bootstrap route; the route creates the initial platform user once and never returns the configured credentials. If the email already belongs to a non-Super-Admin account, the route fails closed rather than promoting it. Changing the environment password does not reset an existing account; use the authenticated password-reset flow instead.

The Super Admin marker is server-owned and cannot be set through Better Auth client input. Public hospital signup is disabled; hospital provisioning must be performed through an authenticated administrative workflow.
