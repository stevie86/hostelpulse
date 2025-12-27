import { getCheckedInGuests } from '@/app/actions/check-in-out';
import Link from 'next/link';
import { LogIn, LogOut, BedDouble, ArrowRight } from 'lucide-react';

interface CheckInOutPageProps {
  params: Promise<{ id: string }>;
}

export default async function CheckInOutPage({ params }: CheckInOutPageProps) {
  const { id: propertyId } = await params;

  try {
    const checkedInGuests = await getCheckedInGuests(propertyId);

    return (
      <div className="space-y-8 max-w-6xl mx-auto">
        <div className="text-center sm:text-left">
          <h1 className="text-3xl font-bold tracking-tight">
            Check-In / Check-Out
          </h1>
          <p className="text-base-content/70 mt-1">
            Manage guest flow and occupancy.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Link
            href={`/properties/${propertyId}/check-in`}
            className="block group"
          >
            <div className="card bg-base-100 shadow-xl border border-base-200 transition-all hover:shadow-2xl hover:scale-[1.01] hover:border-primary/50">
              <div className="card-body items-center text-center py-10">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <LogIn className="w-8 h-8 text-primary" />
                </div>
                <h2 className="card-title text-2xl">Check-In Guest</h2>
                <p className="text-base-content/70">
                  Register new arrivals and assign rooms
                </p>
                <div className="card-actions mt-4">
                  <button className="btn btn-primary gap-2">
                    Start Check-In <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </Link>

          <Link
            href={`/properties/${propertyId}/check-out`}
            className="block group"
          >
            <div className="card bg-base-100 shadow-xl border border-base-200 transition-all hover:shadow-2xl hover:scale-[1.01] hover:border-secondary/50">
              <div className="card-body items-center text-center py-10">
                <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
                  <LogOut className="w-8 h-8 text-secondary" />
                </div>
                <h2 className="card-title text-2xl">Check-Out Guest</h2>
                <p className="text-base-content/70">
                  Process departures and payments
                </p>
                <div className="card-actions mt-4">
                  <button className="btn btn-secondary gap-2">
                    Start Check-Out <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </Link>
        </div>

        <div className="card bg-base-100 shadow-xl border border-base-200">
          <div className="card-body p-0">
            <div className="p-6 border-b border-base-200 flex justify-between items-center">
              <h2 className="card-title text-xl flex items-center gap-2">
                <BedDouble size={20} className="text-primary" />
                Currently Checked-In
                <div className="badge badge-neutral badge-lg">
                  {checkedInGuests.length}
                </div>
              </h2>
            </div>

            {checkedInGuests.length > 0 ? (
              <>
                <div className="md:hidden space-y-4 p-4">
                  {checkedInGuests.map((booking) => {
                    const room = booking.beds[0]?.room;
                    return (
                      <div
                        key={booking.id}
                        className="card bg-base-100 shadow-sm border border-base-200"
                      >
                        <div className="card-body p-4">
                          <div className="flex justify-between items-start">
                            <h3 className="font-semibold text-lg">
                              {booking.guest?.firstName}{' '}
                              {booking.guest?.lastName}
                            </h3>
                            <div className="badge badge-ghost gap-1">
                              {room?.name}{' '}
                              <span className="text-xs opacity-70">
                                ({room?.type})
                              </span>
                            </div>
                          </div>

                          <div className="flex justify-between items-center text-sm mt-3 pt-3 border-t border-base-200">
                            <div className="flex flex-col">
                              <span className="text-xs text-base-content/70">
                                Check-in Date
                              </span>
                              <span className="font-medium">
                                {new Date(booking.checkIn).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex flex-col text-right">
                              <span className="text-xs text-base-content/70">
                                Amount
                              </span>
                              <span className="font-mono font-bold">
                                €{(booking.totalAmount / 100).toFixed(2)}
                              </span>
                            </div>
                          </div>

                          <div className="card-actions mt-3">
                            <Link
                              href={`/properties/${propertyId}/check-out?booking=${booking.id}`}
                              className="btn btn-secondary btn-sm w-full min-h-[44px]"
                            >
                              Check Out
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="hidden md:block overflow-x-auto">
                  <table className="table table-zebra w-full">
                    <thead className="bg-base-200/50">
                      <tr>
                        <th className="py-4 pl-6">Guest</th>
                        <th className="py-4">Room</th>
                        <th className="py-4">Check-In Date</th>
                        <th className="py-4">Current Amount</th>
                        <th className="py-4 pr-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {checkedInGuests.map((booking) => {
                        const room = booking.beds[0]?.room;
                        return (
                          <tr
                            key={booking.id}
                            className="hover:bg-base-200/50 transition-colors"
                          >
                            <td className="pl-6 font-medium">
                              {booking.guest?.firstName}{' '}
                              {booking.guest?.lastName}
                            </td>
                            <td>
                              <div className="badge badge-ghost gap-1">
                                {room?.name}{' '}
                                <span className="text-xs opacity-70">
                                  ({room?.type})
                                </span>
                              </div>
                            </td>
                            <td>
                              {new Date(booking.checkIn).toLocaleDateString()}
                            </td>
                            <td className="font-mono">
                              €{(booking.totalAmount / 100).toFixed(2)}
                            </td>
                            <td className="text-right pr-6">
                              <Link
                                href={`/properties/${propertyId}/check-out?booking=${booking.id}`}
                                className="btn btn-sm btn-outline btn-secondary"
                              >
                                Check Out
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="text-center py-16 px-4">
                <div className="bg-base-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BedDouble className="w-8 h-8 text-base-content/30" />
                </div>
                <h3 className="text-lg font-bold">
                  No Guests Currently Checked In
                </h3>
                <p className="text-base-content/70 mt-1">
                  Rooms are empty. Use the Check-In button to register arrivals.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading check-in/out page:', error);
    throw error;
  }
}
