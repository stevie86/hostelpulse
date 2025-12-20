import { auth } from '@/auth';
import prisma from '@/lib/db';

/**
 * Verifies that the current user has access to the specified property.
 * This is the core RBAC enforcement for Race2MVP.
 */
export async function verifyPropertyAccess(propertyId: string) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error('Unauthorized: Please log in.');
  }

  // Find property and check if user is a member of the owning team
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: {
      team: {
        select: {
          members: {
            where: { userId },
            select: { role: true },
          },
        },
      },
    },
  });

  const member = property?.team.members[0];

  if (!member) {
    throw new Error('Access Denied: You do not have access to this property.');
  }

  return {
    userId,
    role: member.role,
  };
}
