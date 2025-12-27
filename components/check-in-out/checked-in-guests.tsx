import prisma from '@/lib/db';
import { CheckOutButton } from '@/components/dashboard/activity-buttons';

interface CheckedInGuestsProps {
  propertyId: string;
}

export async function CheckedInGuests({ propertyId }: CheckedInGuestsProps) {
  const checkedInBookings = await prisma.booking.findMany({
    where: {
      propertyId,
      status: 'checked_in',
    },
    include: {
      guest: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      beds: {
        select: {
          bedLabel: true,
          room: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      checkIn: 'desc',
    },
  });

  if (checkedInBookings.length === 0) {
    return (
      <div className="text-center py-8 text-base-content/70">
        No guests currently checked in.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Currently Checked-in Guests</h3>
      <div className="space-y-3">
        {checkedInBookings.map((booking) => (
          <div
            key={booking.id}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-base-100 rounded-lg border gap-4"
          >
            <div className="flex-1 w-full">
              <div className="font-medium text-lg">
                {booking.guest?.firstName} {booking.guest?.lastName}
              </div>
              <div className="text-sm text-base-content/70 mt-1">
                Room: {booking.beds[0]?.room.name || 'N/A'} • Bed:{' '}
                {booking.beds[0]?.bedLabel || 'N/A'}
              </div>
              <div className="text-xs text-base-content/60 mt-1">
                Check-in: {booking.checkIn.toLocaleDateString()}
              </div>
            </div>
            <div className="w-full sm:w-auto">
              <CheckOutButton
                bookingId={booking.id}
                className="btn btn-secondary btn-sm w-full sm:w-auto min-h-[44px]"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
