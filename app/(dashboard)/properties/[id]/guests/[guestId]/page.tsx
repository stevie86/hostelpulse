import { updateGuest } from "@/app/actions/guests";
import { GuestForm } from "@/components/guests/guest-form";
import prisma from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EditGuestPage({
  params,
}: {
  params: Promise<{ id: string; guestId: string }>;
}) {
  const { id: propertyId, guestId } = await params;

  const guest = await prisma.guest.findUnique({
    where: { id: guestId },
  });

  if (!guest) notFound();

  const updateGuestWithId = updateGuest.bind(null, guestId, propertyId);

  return (
    <div className="space-y-6">
       <div className="flex items-center gap-4">
        <Link
          href={`/properties/${propertyId}/guests`}
          className="btn btn-ghost btn-sm"
        >
          ← Back
        </Link>
        <h1 className="text-2xl font-bold">Edit Guest</h1>
      </div>
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
  );
}
