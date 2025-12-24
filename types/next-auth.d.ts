import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      /** The user's postal address. */
      propertyId?: string;
      propertyName?: string;
    } & Session['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    propertyId?: string;
    propertyName?: string;
  }
}
