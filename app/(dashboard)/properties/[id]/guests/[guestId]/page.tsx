import { updateGuest } from "@/app/actions/guests";
import { GuestForm } from "@/components/guests/guest-form";
import { GuestHeader } from "@/components/guests/guest-header";
import { GuestHistory } from "@/components/guests/guest-history";
import prisma from "@/lib/db";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { verifyPropertyAccess } from "@/lib/auth-utils";

export default async function GuestDetailPage({
  params,
}: {
  params: Promise<{ id: string; guestId: string }>;
}) {
  const { id: propertyId, guestId } = await params;

  try {
    await verifyPropertyAccess(propertyId);
  } catch (error) {
    redirect("/login");
  }

  const guest = await prisma.guest.findUnique({
    where: { id: guestId },
    include: {
      bookings: {
        where: { propertyId },
        include: {
          beds: {
            include: {
              room: true,
            },
          },
        },
        orderBy: {
          checkIn: "desc",
        },
      },
    },
  });

  if (!guest) notFound();

  const totalStays = guest.bookings.length;
  const lifetimeValue = guest.bookings.reduce((sum, b) => sum + b.totalAmount, 0);

  const updateGuestWithId = updateGuest.bind(null, guestId, propertyId);

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <Link
          href={`/properties/${propertyId}/guests`}
          className="btn btn-ghost btn-sm"
        >
          ← Back to Guests
        </Link>
        <h1 className="text-2xl font-bold">Guest Profile</h1>
      </div>

      <GuestHeader totalStays={totalStays} lifetimeValue={lifetimeValue} />

      <div className="flex flex-col xl:flex-row gap-8">
        {/* Left: History */}
        <div className="flex-1 space-y-4 order-2 xl:order-1">
          <h2 className="text-xl font-semibold">Booking History</h2>
          <div className="bg-base-100 rounded-box shadow overflow-hidden">
            <GuestHistory bookings={guest.bookings} />
          </div>
        </div>

        {/* Right: Personal Info */}
        <div className="w-full xl:w-96 space-y-4 order-1 xl:order-2">
          <h2 className="text-xl font-semibold">Personal Details</h2>
          <div className="bg-base-100 p-6 rounded-box shadow">
            <GuestForm
              propertyId={propertyId}
              action={updateGuestWithId}
              isEditMode={true}
              initialValues={{
                firstName: guest.firstName,
                lastName: guest.lastName,
                email: guest.email || "",
                phone: guest.phone || "",
                nationality: guest.nationality || "",
                documentType: (guest.documentType as "passport" | "id_card" | "driving_license" | undefined) || "passport",
                documentId: guest.documentId || "",
                notes: guest.notes || "",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}