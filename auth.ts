// auth.ts
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import prisma from '@/lib/db';
import bcrypt from 'bcryptjs';

// Define the expected return type from NextAuth to maintain strict typing across the app
interface NextAuthResult {
  auth: any; // Using any here as a last resort for complex NextAuth internal types
  signIn: (...args: any[]) => Promise<any>;
  signOut: (...args: any[]) => Promise<any>;
  handlers: any;
}

// Workaround for NextAuth v5 beta type issue where the default export is not seen as callable.
const nextAuth = NextAuth as unknown as (config: unknown) => NextAuthResult;

export const { auth, signIn, signOut, handlers } = nextAuth({
  ...authConfig,
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(1) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          
          console.log(`[AUTH DEBUG] Attempting login for: ${email}`);
          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user) {
            console.log(`[AUTH DEBUG] User not found for email: ${email}`);
            return null;
          }

          console.log(`[AUTH DEBUG] User found: ${user.email}, ID: ${user.id}`);
          
          // If stored password is a hash, use bcrypt.compare
          if (user.password && (user.password.startsWith('$2a$') || user.password.startsWith('$2b$') || user.password.startsWith('$2y$'))) {
             console.log('[AUTH DEBUG] Attempting bcrypt compare...');
             const passwordsMatch = await bcrypt.compare(password, user.password);
             console.log(`[AUTH DEBUG] Bcrypt comparison match: ${passwordsMatch}`);
             if (passwordsMatch) {
               return { id: user.id, name: user.name, email: user.email };
             }
          } else if (user.password === password) { // Fallback for plaintext seeded password
            console.log('[AUTH DEBUG] Plaintext comparison match: true');
            return { id: user.id, name: user.name, email: user.email };
          }
        }
        console.log('[AUTH DEBUG] Authentication failed after all checks.');
        return null;
      },
    }),
  ],
});