# Domain Model: HostelPulse
Understanding the business logic and entity relationships.

## 1. Hierarchy of Tenancy
1. **User:** A person with login credentials.
2. **Team:** A collection of Users. Subscriptions are billed at the Team level.
3. **Property:** A physical hostel location managed by a Team. 
   - *Note:* One Team can manage multiple Properties.

## 2. Core Entities
- **Property:** The root of daily operations. Holds timezone, currency, and local tax settings.
- **Room:** A physical space within a Property. 
  - `private`: Entire room booked by one guest/party.
  - `dormitory`: Multiple beds sold individually.
- **Bed:** The unit of inventory. In a private room, the room is the unit; in a dorm, the bed is the unit.
- **Guest:** The customer. Guests are global to a Property.
- **Booking:** A reservation for a Guest at a Property.
  - Lifecycle: `Pending` -> `Confirmed` -> `Checked In` -> `Checked Out`.

## 3. Availability Logic
Availability is calculated by comparing physical beds vs. `BookingBed` assignments.
- **Overlapping Check:** A bed is "available" for DateRange X if no `confirmed` or `checked_in` booking occupies that specific `bedLabel` between X.start and X.end.

## 4. Key Constraints
- A `Booking` must belong to exactly one `Guest` and one `Property`.
- A `Booking` can span multiple `Rooms` or `Beds` (managed via `BookingBed` junction table).
- `TotalAmount` is calculated based on `Room.pricePerNight` at the time of booking.
