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
      
      if (isLoggedIn) {
        if (nextUrl.pathname === '/' && auth.user?.propertyId) {
            // Redirect to the first property's dashboard if on root after login
            return Response.redirect(new URL(`/properties/${auth.user.propertyId}/dashboard`, nextUrl));
        }
        // If logged in and on a protected page or already on a property dashboard
        return true; 
      }
      
      // If not logged in, allow access to public pages like login, otherwise redirect to login
      return !isOnDashboard;
    },
    redirect({ url, baseUrl }) {
        // Allows for login to redirect to previous page, or dashboard if none
        if (url.startsWith(baseUrl)) {
            return url;
        }
        // Fallback to dashboard if a specific redirect isn't provided (e.g., direct login)
        return baseUrl;
    }
  },
  providers: [], // Configured in auth.ts
};