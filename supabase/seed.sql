-- Seed data for Lisbon hostel management system

-- Insert Lisbon hostels
INSERT INTO hostels (name, address, city, country) VALUES
('Lisbon Central Hostel', 'Rua dos Sapateiros 150, Lisbon', 'Lisbon', 'Portugal'),
('Alfama Boutique Hostel', 'Rua dos Remédios 176, Lisbon', 'Lisbon', 'Portugal'),
('Bairro Alto Backpackers', 'Rua do Norte 15, Lisbon', 'Lisbon', 'Portugal'),
('LX Hostel', 'Rua Rodrigues Faria 103, Lisbon', 'Lisbon', 'Portugal'),
('The Independente Hostel', 'Rua São Pedro de Alcântara 81, Lisbon', 'Lisbon', 'Portugal'),
('Memmo Alfama', 'Rua dos Remédios 176, Lisbon', 'Lisbon', 'Portugal'),
('Lisbon Destination Hostel', 'Rua de São Paulo 126, Lisbon', 'Lisbon', 'Portugal'),
('Wombats City Hostel', 'Rua dos Anjos 1, Lisbon', 'Lisbon', 'Portugal'),
('Generator Hostel Lisbon', 'Rua José Falcão 25, Lisbon', 'Lisbon', 'Portugal'),
('Lisbon Lounge Hostel', 'Rua de São Paulo 48, Lisbon', 'Lisbon', 'Portugal');

-- Insert sample guests
INSERT INTO guests (name, email, phone, nationality) VALUES
('João Silva', 'joao.silva@email.pt', '+351 912 345 678', 'Portuguese'),
('Maria Santos', 'maria.santos@email.pt', '+351 913 456 789', 'Portuguese'),
('Ana Costa', 'ana.costa@email.pt', '+351 914 567 890', 'Portuguese'),
('Carlos Oliveira', 'carlos.oliveira@email.pt', '+351 915 678 901', 'Portuguese'),
('Sofia Pereira', 'sofia.pereira@email.pt', '+351 916 789 012', 'Portuguese'),
('Miguel Rodrigues', 'miguel.rodrigues@email.pt', '+351 917 890 123', 'Portuguese'),
('Inês Fernandes', 'ines.fernandes@email.pt', '+351 918 901 234', 'Portuguese'),
('Pedro Almeida', 'pedro.almeida@email.pt', '+351 919 012 345', 'Portuguese'),
('Beatriz Gomes', 'beatriz.gomes@email.pt', '+351 920 123 456', 'Portuguese'),
('Rui Martins', 'rui.martins@email.pt', '+351 921 234 567', 'Portuguese'),
('Emma Johnson', 'emma.johnson@email.com', '+44 7700 123456', 'British'),
('Lucas Schmidt', 'lucas.schmidt@email.de', '+49 170 1234567', 'German'),
('Sophie Dubois', 'sophie.dubois@email.fr', '+33 6 12 34 56 78', 'French'),
('Marco Rossi', 'marco.rossi@email.it', '+39 333 1234567', 'Italian'),
('Isabella Garcia', 'isabella.garcia@email.es', '+34 612 345 678', 'Spanish');

-- Insert sample bookings (using subquery to get actual UUIDs)
INSERT INTO bookings (hostel_id, guest_id, check_in, check_out, amount, status)
SELECT
  h.id,
  g.id,
  '2024-10-15'::date,
  '2024-10-18'::date,
  120.00,
  'confirmed'
FROM (SELECT id, row_number() over (order by name) as rn FROM hostels) h
JOIN (SELECT id, row_number() over (order by name) as rn FROM guests WHERE name = 'João Silva') g ON g.rn = 1
WHERE h.rn = 1;

INSERT INTO bookings (hostel_id, guest_id, check_in, check_out, amount, status)
SELECT
  h.id,
  g.id,
  '2024-10-20'::date,
  '2024-10-25'::date,
  200.00,
  'confirmed'
FROM (SELECT id, row_number() over (order by name) as rn FROM hostels) h
JOIN (SELECT id, row_number() over (order by name) as rn FROM guests WHERE name = 'Emma Johnson') g ON g.rn = 1
WHERE h.rn = 1;

INSERT INTO bookings (hostel_id, guest_id, check_in, check_out, amount, status)
SELECT
  h.id,
  g.id,
  '2024-10-16'::date,
  '2024-10-19'::date,
  90.00,
  'confirmed'
FROM (SELECT id, row_number() over (order by name) as rn FROM hostels) h
JOIN (SELECT id, row_number() over (order by name) as rn FROM guests WHERE name = 'Maria Santos') g ON g.rn = 1
WHERE h.rn = 2;

INSERT INTO bookings (hostel_id, guest_id, check_in, check_out, amount, status)
SELECT
  h.id,
  g.id,
  '2024-10-22'::date,
  '2024-10-24'::date,
  60.00,
  'confirmed'
FROM (SELECT id, row_number() over (order by name) as rn FROM hostels) h
JOIN (SELECT id, row_number() over (order by name) as rn FROM guests WHERE name = 'Lucas Schmidt') g ON g.rn = 1
WHERE h.rn = 2;

INSERT INTO bookings (hostel_id, guest_id, check_in, check_out, amount, status)
SELECT
  h.id,
  g.id,
  '2024-10-17'::date,
  '2024-10-21'::date,
  160.00,
  'confirmed'
FROM (SELECT id, row_number() over (order by name) as rn FROM hostels) h
JOIN (SELECT id, row_number() over (order by name) as rn FROM guests WHERE name = 'Ana Costa') g ON g.rn = 1
WHERE h.rn = 3;

INSERT INTO bookings (hostel_id, guest_id, check_in, check_out, amount, status)
SELECT
  h.id,
  g.id,
  '2024-10-25'::date,
  '2024-10-28'::date,
  90.00,
  'confirmed'
FROM (SELECT id, row_number() over (order by name) as rn FROM hostels) h
JOIN (SELECT id, row_number() over (order by name) as rn FROM guests WHERE name = 'Sophie Dubois') g ON g.rn = 1
WHERE h.rn = 3;

-- Lisbon City Tax rule is already inserted in the migration file
-- This ensures the tax calculation will work correctly