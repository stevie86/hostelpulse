// lib/sef-reporting.ts
/**
 * SEF (Portuguese Immigration) Reporting Utility
 * Generates reports for foreign guests staying in Portugal
 */

import prisma from '@/lib/db';

export interface SEFGuestReport {
  guestId: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  nationality: string;
  documentType: string;
  documentId: string;
  checkInDate: string;
  checkOutDate: string;
  addressDuringStay: string;
  reportedAt: string;
  reportId: string;
}

export interface SEFPropertyReport {
  propertyId: string;
  propertyName: string;
  propertyAddress: string;
  city: string;
  country: string;
  guests: SEFGuestReport[];
  generatedAt: string;
  reportingPeriod: {
    start: string;
    end: string;
  };
}

export class SEFReportingService {
  /**
   * Generate SEF report for a checked-out guest
   */
  static generateGuestReport(
    guest: {
      id: string;
      firstName: string;
      lastName: string;
      dateOfBirth?: Date | null;
      nationality?: string | null;
      documentType?: string | null;
      documentId: string;
    },
    booking: {
      checkIn: Date;
      checkOut: Date;
      actualCheckOut?: Date | null;
    },
    propertyAddress: string
  ): SEFGuestReport {
    // Validate required fields
    if (!guest.documentId) {
      throw new Error('Document ID is required for SEF reporting');
    }

    // Only report non-Portuguese guests
    if (
      guest.nationality?.toLowerCase() === 'portuguese' ||
      guest.nationality?.toLowerCase() === 'portuguesa'
    ) {
      throw new Error('Portuguese guests do not need SEF reporting');
    }

    return {
      guestId: guest.id,
      firstName: guest.firstName,
      lastName: guest.lastName,
      dateOfBirth: guest.dateOfBirth
        ? guest.dateOfBirth.toISOString().split('T')[0]
        : undefined,
      nationality: guest.nationality || 'Unknown',
      documentType: guest.documentType || 'passport',
      documentId: guest.documentId,
      checkInDate: booking.checkIn.toISOString().split('T')[0],
      checkOutDate: (booking.actualCheckOut || booking.checkOut)
        .toISOString()
        .split('T')[0],
      addressDuringStay: propertyAddress,
      reportedAt: new Date().toISOString(),
      reportId: `SEF-${guest.id}-${Date.now()}`,
    };
  }

  /**
   * Generate comprehensive property SEF report for a reporting period
   */
  static async generatePropertyReport(
    propertyId: string,
    startDate: Date,
    endDate: Date
  ): Promise<SEFPropertyReport> {
    // Get property details
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: {
        name: true,
        address: true,
        city: true,
        country: true,
      },
    });

    if (!property) {
      throw new Error('Property not found');
    }

    // Get all bookings that ended in the reporting period
    const bookings = await prisma.booking.findMany({
      where: {
        propertyId,
        status: 'completed',
        checkOut: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        guest: true,
      },
    });

    const propertyAddress = `${property.address}, ${property.city}, ${property.country}`;

    const guestReports: SEFGuestReport[] = [];

    for (const booking of bookings) {
      if (!booking.guest || !booking.guest.documentId) continue;

      try {
        const report = this.generateGuestReport(
          booking.guest as any,
          booking,
          propertyAddress
        );
        guestReports.push(report);
      } catch (error) {
        // Skip Portuguese guests or other errors
        console.log(
          `Skipping SEF report for guest ${booking.guest.id}:`,
          error
        );
      }
    }

    return {
      propertyId,
      propertyName: property.name,
      propertyAddress: property.address || '',
      city: property.city,
      country: property.country,
      guests: guestReports,
      generatedAt: new Date().toISOString(),
      reportingPeriod: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0],
      },
    };
  }

  /**
   * Export SEF report as JSON (for manual submission to SEF)
   */
  static exportAsJSON(report: SEFPropertyReport): string {
    return JSON.stringify(report, null, 2);
  }

  /**
   * Export SEF report as CSV (alternative format)
   */
  static exportAsCSV(report: SEFPropertyReport): string {
    const headers = [
      'Report ID',
      'Guest Name',
      'Date of Birth',
      'Nationality',
      'Document Type',
      'Document ID',
      'Check-in Date',
      'Check-out Date',
      'Address During Stay',
      'Reported At',
    ];

    const rows = report.guests.map((guest) => [
      guest.reportId,
      `${guest.firstName} ${guest.lastName}`,
      guest.dateOfBirth || '',
      guest.nationality,
      guest.documentType,
      guest.documentId,
      guest.checkInDate,
      guest.checkOutDate,
      guest.addressDuringStay,
      guest.reportedAt,
    ]);

    return [headers, ...rows]
      .map((row) => row.map((field) => `"${field}"`).join(','))
      .join('\n');
  }
}
