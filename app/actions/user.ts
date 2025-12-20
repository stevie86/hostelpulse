'use server';

import { auth } from '@/auth';
import prisma from '@/lib/db';

export async function getUserFirstPropertyId(): Promise<string | null> {
  console.log('Server Action: getUserFirstPropertyId called.');
  const session = await auth();
  if (!session?.user?.id) {
    console.log('Server Action: User not logged in or ID missing.');
    return null; // Not logged in or user ID missing
  }
  console.log('Server Action: User ID:', session.user.id);

  try {
    const userWithTeams = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        teamMembers: {
          include: {
            team: {
              include: {
                property: true,
              },
            },
          },
        },
      },
    });

    const firstProperty = userWithTeams?.teamMembers[0]?.team?.property;
    return firstProperty?.id || null;
  } catch (error) {
    console.error("Failed to fetch user's first property ID:", error);
    return null;
  }
}
