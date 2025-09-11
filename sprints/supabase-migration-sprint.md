# Revised Supabase Migration Sprint Plan

## Sprint Goal
Set up Supabase with native CLI tools, create hostel management tables (hostels, guests, bookings, tax_rules), seed with Lisbon data, generate TypeScript types, and connect to MVP dashboard. Complete real Supabase data integration by EOD Day 3.

## Sprint Duration
3 days (accelerated mini sprint)

## Current State
- Database: SQLite with Prisma (schema exists, but empty - 0 records in all tables)
- Existing Tables: User, Hostel, Booking (can inform new Supabase schema)
- Target: Pure Supabase with CLI-generated schema
- Tables Needed: hostels, guests, bookings, tax_rules
- Data: Lisbon-specific seed data (no existing data to migrate)
- Integration: MVP dashboard with real-time data

## User Stories

### US1: As a developer, I want to set up Supabase project with CLI so I can create the database schema.
- **Acceptance Criteria**: Supabase project ready with CLI access.
- **Estimate**: 0.5 days
- **Sub-tasks**:
  - Create Supabase project via dashboard
  - Install Supabase CLI: `bun add supabase --dev`
  - Login to Supabase: `npx supabase login`
  - Initialize project: `npx supabase init`
  - Link to remote project: `npx supabase link --project-ref <project-id>`
  - Start local development: `npx supabase start`

### US2: As a developer, I want to create database tables using Supabase CLI so I have the proper schema.
- **Acceptance Criteria**: Tables created: hostels, guests, bookings, tax_rules.
- **Estimate**: 0.5 days
- **Sub-tasks**:
  - Create migration file: `npx supabase migration new create_hostel_tables`
  - Write SQL for hostels table with Lisbon-specific fields
  - Write SQL for guests table with contact info
  - Write SQL for bookings table with dates and amounts
  - Write SQL for tax_rules table with Lisbon City Tax rules
  - Apply migration: `npx supabase db push`

### US3: As a developer, I want to seed database with Lisbon data so I have realistic test data.
- **Acceptance Criteria**: Database populated with Lisbon hostels, sample guests, bookings, and tax rules.
- **Estimate**: 0.5 days
- **Sub-tasks**:
  - Create seed file: `npx supabase seed new lisbon_data`
  - Add 5-10 Lisbon hostels with real addresses
  - Add sample guests with Portuguese names/emails
  - Add bookings with realistic dates and amounts
  - Add Lisbon City Tax rules (current rates and conditions)
  - Run seed: `npx supabase db reset` (includes seed)

### US4: As a developer, I want to generate TypeScript types so I have type safety.
- **Acceptance Criteria**: TypeScript types generated for all tables.
- **Estimate**: 0.5 days
- **Sub-tasks**:
  - Generate types: `npx supabase gen types typescript --local > types/supabase.ts`
  - Review generated types for accuracy
  - Update import statements in existing code
  - Verify type compatibility with current components

### US5: As a developer, I want to connect dashboard to Supabase so it shows real data.
- **Acceptance Criteria**: Dashboard displays live data from Supabase.
- **Estimate**: 1 day
- **Sub-tasks**:
  - Install Supabase client: `bun add @supabase/supabase-js`
  - Create Supabase client configuration
  - Update dashboard API route to use Supabase
  - Replace Prisma queries with Supabase queries
  - Test dashboard data loading
  - Implement real-time subscriptions for live updates

## Technical Considerations
- Use Supabase CLI exclusively (no Prisma)
- Create tables: hostels, guests, bookings, tax_rules
- Lisbon-specific data seeding
- TypeScript type generation from Supabase
- Real-time dashboard integration
- Replace all npm commands with bun

## Success Criteria
- [ ] Supabase CLI setup complete
- [ ] All required tables created and seeded
- [ ] TypeScript types generated and integrated
- [ ] Dashboard displays real Supabase data
- [ ] Real-time updates working
- [ ] Lisbon tax calculations accurate

## Risks & Mitigations
- **Risk**: CLI complexity - **Mitigation**: Follow official Supabase docs
- **Risk**: Type generation issues - **Mitigation**: Test types thoroughly
- **Risk**: Seed data quality - **Mitigation**: Use realistic Lisbon data
- **Risk**: Real-time integration - **Mitigation**: Start with basic queries

## Definition of Done
- Dashboard shows live Supabase data by EOD Day 3
- All tables populated with Lisbon data
- TypeScript types properly integrated
- Real-time features functional
- Code committed with documentation

---

*This mini sprint plan is ready for approval. Please review and confirm to proceed with the migration.*