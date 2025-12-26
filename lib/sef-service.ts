import prisma from './db';

export interface SEFReportResult {
  success: boolean;
  referenceId?: string;
  error?: string;
}

export interface ComplianceStatus {
  complianceRate: number;
  totalReports: number;
  successfulReports: number;
  failedReports: number;
}

export const sefService = {
  /**
   * Submit SEF check-in report for a guest
   */
  submitCheckInReport: async (
    bookingId: string,
    propertyId: string
  ): Promise<SEFReportResult> => {
    try {
      // Get booking and guest details
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          guest: true,
          property: true,
        },
      });

      if (!booking || !booking.guest) {
        return {
          success: false,
          error: 'Booking or guest not found',
        };
      }

      // For now, simulate SEF submission (will be replaced with actual API)
      // Generate a fake reference ID for demo purposes
      const referenceId = `SEF-${bookingId.slice(0, 8).toUpperCase()}-${Date.now()}`;

      // Create SEF report record
      await prisma.sEFReport.create({
        data: {
          propertyId,
          guestId: booking.guest.id,
          bookingId,
          reportType: 'CHECK_IN',
          status: 'SUBMITTED',
          submittedAt: new Date(),
          referenceId,
        },
      });

      return {
        success: true,
        referenceId,
      };
    } catch (error) {
      console.error('SEF check-in report error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  /**
   * Submit SEF check-out report for a guest
   */
  submitCheckOutReport: async (
    bookingId: string,
    propertyId: string,
    checkOutTime: Date
  ): Promise<SEFReportResult> => {
    try {
      // Get booking and guest details
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          guest: true,
          property: true,
        },
      });

      if (!booking || !booking.guest) {
        return {
          success: false,
          error: 'Booking or guest not found',
        };
      }

      // For now, simulate SEF submission (will be replaced with actual API)
      // Generate a fake reference ID for demo purposes
      const referenceId = `SEF-${bookingId.slice(0, 8).toUpperCase()}-${Date.now()}`;

      // Create SEF report record
      await prisma.sEFReport.create({
        data: {
          propertyId,
          guestId: booking.guest.id,
          bookingId,
          reportType: 'CHECK_OUT',
          status: 'SUBMITTED',
          submittedAt: checkOutTime,
          referenceId,
        },
      });

      return {
        success: true,
        referenceId,
      };
    } catch (error) {
      console.error('SEF check-out report error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  /**
   * Get compliance status for a property
   */
  getComplianceStatus: async (
    propertyId: string
  ): Promise<ComplianceStatus> => {
    try {
      const reports = await prisma.sEFReport.findMany({
        where: { propertyId },
        select: { status: true },
      });

      const totalReports = reports.length;
      const successfulReports = reports.filter(
        (r) => r.status === 'SUBMITTED'
      ).length;
      const failedReports = reports.filter((r) => r.status === 'FAILED').length;

      const complianceRate =
        totalReports > 0
          ? Math.round((successfulReports / totalReports) * 100)
          : 100;

      return {
        complianceRate,
        totalReports,
        successfulReports,
        failedReports,
      };
    } catch (error) {
      console.error('Error getting compliance status:', error);
      return {
        complianceRate: 0,
        totalReports: 0,
        successfulReports: 0,
        failedReports: 0,
      };
    }
  },
};
