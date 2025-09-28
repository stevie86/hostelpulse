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

CREATE TABLE IF NOT EXISTS housekeeping_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  assigned_to UUID,
  assigned_date DATE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_by UUID,
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  task_type TEXT NOT NULL CHECK (task_type IN ('checkout_cleaning', 'maintenance', 'inspection', 'deep_clean')),
  owner_id UUID NOT NULL
);

CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  method TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  notes TEXT,
  owner_id UUID NOT NULL
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'warning', 'urgent', 'success')),
  read BOOLEAN DEFAULT FALSE,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES guests(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL
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
CREATE INDEX idx_housekeeping_tasks_owner_id ON housekeeping_tasks(owner_id);
CREATE INDEX idx_housekeeping_tasks_room_id ON housekeeping_tasks(room_id);
CREATE INDEX idx_housekeeping_tasks_completed ON housekeeping_tasks(completed);
CREATE INDEX idx_payments_owner_id ON payments(owner_id);
CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_notifications_owner_id ON notifications(owner_id);
CREATE INDEX idx_notifications_booking_id ON notifications(booking_id);
CREATE INDEX idx_notifications_guest_id ON notifications(guest_id);
CREATE INDEX idx_notifications_read ON notifications(read);

-- Enable RLS
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE beds ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE housekeeping_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can only access their own guests" ON guests
  FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Users can only access their own rooms" ON rooms
  FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Users can only access their own beds" ON beds
  FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Users can only access their own bookings" ON bookings
  FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Users can only access their own housekeeping_tasks" ON housekeeping_tasks
  FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Users can only access their own payments" ON payments
  FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Users can only access their own notifications" ON notifications
  FOR ALL USING (auth.uid() = owner_id);
