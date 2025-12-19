import { importRooms, importBookings } from "@/app/actions/import";
import prisma from "@/lib/db";
import Papa from "papaparse"; // To mock file parsing
import { parseISO } from "date-fns";

// Mock auth
jest.mock("@/auth", () => ({
  auth: jest.fn(() => Promise.resolve({ user: { email: "test@example.com" } }))
}));

// Mock next/cache and next/navigation
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));
jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

// Mock the parseCsv helper function to control its return value
// jest.mock("papaparse", () => ({
//   parse: jest.fn(), // Mock the default export of papaparse
// }));

describe("Import Actions", () => {
  const propertyId = "prop-csv-test";
  const teamId = "team-csv-test";

  // Use a longer timeout for import tests
  jest.setTimeout(10000);

  beforeEach(async () => {
    // Cleanup
    await prisma.bookingBed.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.room.deleteMany();
    await prisma.guest.deleteMany();
    await prisma.property.deleteMany();
    await prisma.team.deleteMany();

    // Setup base data
    await prisma.team.create({ data: { id: teamId, name: "Test Team", slug: "csv-test-team" } });
    await prisma.property.create({ data: { id: propertyId, teamId, name: "CSV Test Prop", city: "Test City" } });
  });

  describe("importRooms", () => {
    it("should import rooms successfully", async () => {
      const csvContent = `name,type,beds,pricePerNight,maxOccupancy,description
Room A,private,1,5000,1,Single Room
Room B,dormitory,4,2000,4,Shared Dorm`;

      // Mock the file object and its text() method
      const mockFile = new Blob([csvContent], { type: "text/csv" }) as File;
      mockFile.text = jest.fn().mockResolvedValue(csvContent);

      const formData = new FormData();
      formData.append("file", mockFile);

      jest.spyOn(Papa, 'parse').mockImplementationOnce(((file: unknown, options: unknown) => {
        const rows = csvContent.split('\n');
        const headers = rows[0].split(',').map(h => h.trim());
        const data = rows.slice(1).map(row => {
          const values = row.split(',').map(v => v.trim());
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return headers.reduce((obj: Record<string, any>, header, index) => {
            obj[header] = values[index];
            return obj;
          }, {});
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return { data, errors: [], meta: {} } as any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }) as any);

      jest.spyOn(Papa, 'parse').mockImplementationOnce(((file: unknown, options: unknown) => {
        const rows = csvContent.split('\n');
        const headers = rows[0].split(',').map(h => h.trim());
        const data = rows.slice(1).map(row => {
          const values = row.split(',').map(v => v.trim());
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return headers.reduce((obj: Record<string, any>, header, index) => {
            obj[header] = values[index];
            return obj;
          }, {});
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return { data, errors: [], meta: {} } as any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }) as any);

      jest.spyOn(Papa, 'parse').mockImplementationOnce(((file: unknown, options: unknown) => {
        const rows = csvContent.split('\n');
        const headers = rows[0].split(',').map(h => h.trim());
        const data = rows.slice(1).map(row => {
          const values = row.split(',').map(v => v.trim());
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return headers.reduce((obj: Record<string, any>, header, index) => {
            obj[header] = values[index];
            return obj;
          }, {});
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return { data, errors: [], meta: {} } as any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }) as any);

      (Papa.parse as jest.Mock).mockImplementationOnce((file, options) => {
        const rows = csvContent.split('\n');
        const headers = rows[0].split(',').map(h => h.trim());
        const data = rows.slice(1).map(row => {
          const values = row.split(',').map(v => v.trim());
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return headers.reduce((obj: Record<string, any>, header, index) => {
            obj[header] = values[index];
            return obj;
          }, {});
        });
        return { data, errors: [], meta: {} };
      });

      (Papa.parse as jest.Mock).mockImplementationOnce((file, options) => {
        const rows = csvContent.split('\n');
        const headers = rows[0].split(',').map(h => h.trim());
        const data = rows.slice(1).map(row => {
          const values = row.split(',').map(v => v.trim());
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return headers.reduce((obj: Record<string, any>, header, index) => {
            obj[header] = values[index];
            return obj;
          }, {});
        });
        return { data, errors: [], meta: {} };
      });

      // Mock Papa.parse to return the data we expect from parsing csvContent
      (Papa.parse as jest.Mock).mockImplementationOnce((file, options) => {
        const rows = csvContent.split('\n');
        const headers = rows[0].split(',').map(h => h.trim());
        const data = rows.slice(1).map(row => {
          const values = row.split(',').map(v => v.trim());
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return headers.reduce((obj: Record<string, any>, header, index) => {
            obj[header] = values[index];
            return obj;
          }, {});
        });
        return { data, errors: [], meta: {} };
      });

      const result = await importRooms(propertyId, {}, formData);

      expect(result.message).toBe("Import complete.");
      expect(result.results?.successCount).toBe(2);
      expect(result.results?.failCount).toBe(0);

      const rooms = await prisma.room.findMany({ where: { propertyId } });
      expect(rooms.length).toBe(2);
      expect(rooms.some((r) => r.name === "Room A" && r.type === "private")).toBe(true);
      expect(rooms.some((r) => r.name === "Room B" && r.beds === 4)).toBe(true);
    });

    it("should handle invalid room data", async () => {
      const csvContent = `name,type,beds,pricePerNight,maxOccupancy
Invalid Room,,1,5000,1`; // Missing type

      const mockFile = new Blob([csvContent], { type: "text/csv" }) as File;
      mockFile.text = jest.fn().mockResolvedValue(csvContent);

      const formData = new FormData(); // Define formData here
      formData.append("file", mockFile);

      (Papa.parse as jest.Mock).mockImplementationOnce((file, options) => {
        const rows = csvContent.split('\n');
        const headers = rows[0].split(',').map(h => h.trim());
        const data = rows.slice(1).map(row => {
          const values = row.split(',').map(v => v.trim());
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return headers.reduce((obj: Record<string, any>, header, index) => {
            obj[header] = values[index];
            return obj;
          }, {});
        });
        return { data, errors: [], meta: {} };
      });

      const result = await importRooms(propertyId, {}, formData);

      expect(result.results?.successCount).toBe(0);
      expect(result.results?.failCount).toBe(1);
      expect(result.results?.failedRows[0].reason).toContain("type");
    });
  });

  describe("importBookings", () => {
    let roomId1: string;
    let guestId1: string;

    beforeEach(async () => {
      // Create a room and guest for booking imports
      const room = await prisma.room.create({ data: { id: "room-imp-1", propertyId, name: "Import Room 1", type: "private", beds: 1, pricePerNight: 5000, maxOccupancy: 1 } });
      const guest = await prisma.guest.create({ data: { id: "guest-imp-1", propertyId, firstName: "Import", lastName: "Guest", email: "import@example.com" } });
      roomId1 = room.id;
      guestId1 = guest.id;
    });

    it("should import bookings successfully", async () => {
      const csvContent = `guestFirstName,guestLastName,roomName,checkIn,checkOut,status,email
New,Booking,Import Room 1,2025-02-01,2025-02-05,confirmed,new@example.com`;

      const mockFile = new Blob([csvContent], { type: "text/csv" }) as File;
      mockFile.text = jest.fn().mockResolvedValue(csvContent);

      const formData = new FormData(); // Define formData here
      formData.append("file", mockFile);

      (Papa.parse as jest.Mock).mockImplementationOnce((file, options) => {
        const rows = csvContent.split('\n');
        const headers = rows[0].split(',').map(h => h.trim());
        const data = rows.slice(1).map(row => {
          const values = row.split(',').map(v => v.trim());
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return headers.reduce((obj: Record<string, any>, header, index) => {
            obj[header] = values[index];
            return obj;
          }, {});
        });
        return { data, errors: [], meta: {} };
      });

      const result = await importBookings(propertyId, {}, formData);

      expect(result.message).toBe("Import complete.");
      expect(result.results?.successCount).toBe(1);
      expect(result.results?.failCount).toBe(0);

      const bookings = await prisma.booking.findMany({ where: { propertyId }, include: { guest: true } });
      expect(bookings.length).toBe(1);
      expect(bookings[0].guest?.firstName).toBe("New");
      expect(bookings[0].status).toBe("confirmed");
    });

    it("should fail to import booking if room is unavailable", async () => {
      // Create an existing booking that fills the room
      const existingBooking = await prisma.booking.create({
        data: {
          propertyId,
          guestId: guestId1,
          checkIn: parseISO("2025-02-01"),
          checkOut: parseISO("2025-02-05"),
          status: "confirmed",
          totalAmount: 10000,
        },
      });
      await prisma.bookingBed.create({ data: { bookingId: existingBooking.id, roomId: roomId1, bedLabel: "1", pricePerNight: 5000 } });

      const csvContent = `guestFirstName,guestLastName,roomName,checkIn,checkOut
Conflict,Guest,Import Room 1,2025-02-02,2025-02-04`; // Overlapping dates

      const mockFile = new Blob([csvContent], { type: "text/csv" }) as File;
      mockFile.text = jest.fn().mockResolvedValue(csvContent);

      const formData = new FormData(); // Define formData here
      formData.append("file", mockFile);

      (Papa.parse as jest.Mock).mockImplementationOnce((file, options) => {
        const rows = csvContent.split('\n');
        const headers = rows[0].split(',').map(h => h.trim());
        const data = rows.slice(1).map(row => {
          const values = row.split(',').map(v => v.trim());
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return headers.reduce((obj: Record<string, any>, header, index) => {
            obj[header] = values[index];
            return obj;
          }, {});
        });
        return { data, errors: [], meta: {} };
      });

      const result = await importBookings(propertyId, {}, formData);

      expect(result.results?.successCount).toBe(0);
      expect(result.results?.failCount).toBe(1);
      expect(result.results?.failedRows[0].reason).toContain("Room fully booked");
    });
  });
});
