// auth.config.ts
import type { Session, User } from 'next-auth';
import type { NextRequest } from 'next/server';

// Manually defining the configuration interface to avoid resolution issues with next-auth v5 beta types
// while maintaining strict type safety for our callbacks.
interface AuthConfig {
  pages?: {
    signIn?: string;
    signOut?: string;
    error?: string;
    verifyRequest?: string;
    newUser?: string;
  };
  callbacks?: {
    signIn?: (params: { user: User | unknown; account: unknown; profile?: unknown; email?: { verificationRequest?: boolean }; credentials?: Record<string, unknown> }) => Promise<boolean | string> | boolean | string;
    signOut?: (params: { session: Session; token: unknown }) => Promise<void> | void;
    redirect?: (params: { url: string; baseUrl: string }) => Promise<string> | string;
    session?: (params: { session: Session; token: unknown; user: User }) => Promise<Session> | Session;
    jwt?: (params: { token: unknown; user?: User | unknown; account?: unknown; profile?: unknown; trigger?: 'signIn' | 'signUp' | 'update'; isNewUser?: boolean; session?: unknown }) => Promise<unknown> | unknown;
    authorized?: (params: { auth: Session | null; request: NextRequest }) => boolean | Promise<boolean> | Response | Promise<Response>;
  };
  providers: unknown[];
}

export const authConfig: AuthConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/properties');
      
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false;
      }
      return true;
    },
  },
  providers: [],
};