# Samples for Testing (Remove Later)

These CSV files are provided for testing the import/export flow. They contain realistic, but fake data. Replace the placeholder IDs before importing bookings.

- `guests.testing.csv` — ready to import
- `bookings.testing.csv` — replace `REPLACE_HOSTEL_ID` and `REPLACE_GUEST_ID_*` with real IDs from your database
- `guests.template.csv`, `bookings.template.csv` — header-only templates you can copy and fill

How to use
1) Import guests first (creates guest records and IDs):
   - POST /api/import/guests with the CSV content (see docs/implementation-verification.md)
2) Retrieve real IDs:
   - GET /api/guests and copy the `id` values for the guests you just imported
   - Create or fetch a real `hostel_id` from Supabase
3) Open `bookings.testing.csv` and replace placeholder IDs with real ones
4) Import bookings:
   - POST /api/import/bookings with the edited CSV content

Cleanup
- These files are for testing. Remove the `samples/` folder before production.
