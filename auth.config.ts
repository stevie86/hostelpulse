import type { NextAuthConfig } from 'next-auth';
import prisma from '@/lib/db'; // Import prisma client

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async session({ session, token, user }: any) {
      if (session?.user) {
        // Find the user's first property
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
        if (firstProperty) {
          session.user.propertyId = firstProperty.id;
          session.user.propertyName = firstProperty.name;
        }
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }: any) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/properties') || nextUrl.pathname === '/'; // Treat root as part of dashboard
      
      if (isOnDashboard) {
        if (isLoggedIn) {
          // If logged in and on the root, redirect to the first property's dashboard
          if (nextUrl.pathname === '/' && auth.user?.propertyId) {
            return Response.redirect(new URL(`/properties/${auth.user.propertyId}/dashboard`, nextUrl));
          }
          return true; // Allow access to properties or root if logged in
        }
        return false; // Redirect unauthenticated users to login page
      }
      return true; // Allow access to other pages (e.g., login, static)
    },
  },
  providers: [], // Configured in auth.ts
};
