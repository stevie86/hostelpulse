-- Create tables
CREATE TABLE IF NOT EXISTS guests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  notes TEXT,
  owner_id UUID NOT NULL
);

CREATE TABLE IF NOT EXISTS rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('private', 'dorm')),
  max_capacity INTEGER NOT NULL DEFAULT 1,
  owner_id UUID NOT NULL
);

CREATE TABLE IF NOT EXISTS beds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  owner_id UUID NOT NULL
);

CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  bed_id UUID REFERENCES beds(id) ON DELETE CASCADE,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'pending', 'cancelled')),
  notes TEXT,
  owner_id UUID NOT NULL,
  CONSTRAINT booking_accommodation CHECK (room_id IS NOT NULL OR bed_id IS NOT NULL)
);

-- Create indexes
CREATE INDEX idx_guests_owner_id ON guests(owner_id);
CREATE INDEX idx_rooms_owner_id ON rooms(owner_id);
CREATE INDEX idx_beds_owner_id ON beds(owner_id);
CREATE INDEX idx_beds_room_id ON beds(room_id);
CREATE INDEX idx_bookings_owner_id ON bookings(owner_id);
CREATE INDEX idx_bookings_guest_id ON bookings(guest_id);
CREATE INDEX idx_bookings_room_id ON bookings(room_id);
CREATE INDEX idx_bookings_bed_id ON bookings(bed_id);
CREATE INDEX idx_bookings_dates ON bookings(check_in, check_out);

-- Enable RLS
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE beds ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can only access their own guests" ON guests
  FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Users can only access their own rooms" ON rooms
  FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Users can only access their own beds" ON beds
  FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Users can only access their own bookings" ON bookings
  FOR ALL USING (auth.uid() = owner_id);
