# Code Critic (Created by Codex)

This is a risk-first critique of the current code paths reviewed (post clean-slate MVP commits across auth, properties/rooms, guests, bookings, dashboard, and Prisma generate script).

- **Security exposure**: Printing `DATABASE_URL` on every Prisma init (`lib/db.ts:5-9`) and verbose auth debug logs (`auth.ts:18-50`) will leak credentials/secrets in any log aggregation. Strip secrets immediately and gate debug logging behind dev-only flags.
- **Authentication loopholes**: Plaintext password fallback in the credentials provider (`auth.ts:44-46`) means any seeded plaintext can bypass hashing and invites downgrade attacks. Enforce bcrypt-only, migrate any legacy passwords, and add rate limits/lockouts.
- **Authorization missing entirely**: [RESOLVED 2025-12-19] Server actions for rooms/bookings/guests/import (`app/actions/*.ts`) now call `verifyPropertyAccess()` to ensure users can only mutate data for hostels they have access to.
- **Broken UX links**: [RESOLVED 2025-12-19] Implemented a "Data Management Hub" at `/properties/[id]/data` which centralizes working CSV export links and import forms, replacing 404-prone distributed links.
- **Data correctness risks**: [IN PROGRESS] Booking totals now use accurate night calculations (`app/actions/bookings.ts`). Concurrency protection is implemented via database transactions during creation.
- **Timezone blindness**: [RESOLVED 2025-12-19] Dashboard stats and daily activity now use `date-fns-tz` and `property.timezone` to ensure operational numbers match the hostel's local time.