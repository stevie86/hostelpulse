import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

// Workaround for NextAuth v5 beta type issue
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { auth } = (NextAuth as any)(authConfig);

export default auth;

export const config = {
  // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
  matcher: ['/((?!api|_next/static|_next/image|.*\.png$).*)'],
};
