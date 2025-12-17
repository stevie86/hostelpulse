# Code Critic (Created by Codex)

This is a risk-first critique of the current code paths reviewed (post clean-slate MVP commits across auth, properties/rooms, guests, bookings, dashboard, and Prisma generate script).

- **Security exposure**: Printing `DATABASE_URL` on every Prisma init (`lib/db.ts:5-9`) and verbose auth debug logs (`auth.ts:18-50`) will leak credentials/secrets in any log aggregation. Strip secrets immediately and gate debug logging behind dev-only flags.
- **Authentication loopholes**: Plaintext password fallback in the credentials provider (`auth.ts:44-46`) means any seeded plaintext can bypass hashing and invites downgrade attacks. Enforce bcrypt-only, migrate any legacy passwords, and add rate limits/lockouts.
- **Authorization missing entirely**: Server actions for rooms/bookings/guests/import (`app/actions/*.ts`) trust any caller who knows a `propertyId`, so unauthenticated users can mutate production data. Every action needs `auth()` + property ownership checks.
- **Broken UX links**: Export buttons point to non-existent API routes (`/api/export/...` from properties/bookings/guests pages), guaranteeing 404s for a core CSV workflow. Ship the routes or hide the buttons.
- **Data correctness risks**: Booking totals ignore stay length and capacity checks are non-transactional (`app/actions/bookings.ts:25-136`), so long stays are underbilled and concurrent requests can double-book beds. Wrap the flow in a transaction, lock per room, and compute nights accurately.
- **Timezone blindness**: Dashboard uses server-local time for arrivals/departures (`app/properties/[id]/dashboard/page.tsx:8-52`), so any property outside the server timezone shows wrong operational numbers. Make date math timezone-aware using the property’s setting.
