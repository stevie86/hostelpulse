-- Create hostels table
CREATE TABLE hostels (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    owner_id UUID,
    city VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Portugal',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create guests table
CREATE TABLE guests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50),
    nationality VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    hostel_id UUID NOT NULL REFERENCES hostels(id) ON DELETE CASCADE,
    guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'confirmed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tax_rules table
CREATE TABLE tax_rules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    city VARCHAR(100) NOT NULL,
    tax_rate DECIMAL(5,2) NOT NULL, -- e.g., 4.00 for 4%
    conditions TEXT, -- JSON or text describing when tax applies
    effective_from DATE NOT NULL,
    effective_to DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_hostels_city ON hostels(city);
CREATE INDEX idx_hostels_owner ON hostels(owner_id);
CREATE INDEX idx_bookings_hostel ON bookings(hostel_id);
CREATE INDEX idx_bookings_guest ON bookings(guest_id);
CREATE INDEX idx_bookings_dates ON bookings(check_in, check_out);
CREATE INDEX idx_tax_rules_city ON tax_rules(city);
CREATE INDEX idx_tax_rules_dates ON tax_rules(effective_from, effective_to);

-- Enable Row Level Security
ALTER TABLE hostels ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_rules ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic policies - can be customized based on auth requirements)
CREATE POLICY "Enable read access for all users" ON hostels FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON guests FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON bookings FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON tax_rules FOR SELECT USING (true);

-- Insert Lisbon tax rule
INSERT INTO tax_rules (city, tax_rate, conditions, effective_from) VALUES
('Lisbon', 4.00, 'City tax applied to all stays in Lisbon municipality', '2024-01-01');