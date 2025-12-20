# Data Model: Beautiful UI Revamp

## Entities

### DemoRoom

- name: string
- type: string
- beds: number
- occupancy: string
- price: number
- status: string (available, occupied, maintenance)

### DemoBooking

- guestName: string
- roomName: string
- checkIn: string
- checkOut: string
- status: string
