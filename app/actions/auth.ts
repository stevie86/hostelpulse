'use server';
import { signIn } from '@/auth';

export async function authenticate(prevState: string | undefined, formData: FormData) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error && typeof error === 'object' && 'type' in error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (error.type === 'CredentialsSignin' || (error as any).code === 'credentials') {
        return 'Invalid credentials.';
      }
    }
    // If it's a redirect error (success), Next.js handles it.
    // Otherwise re-throw.
    throw error;
  }
}
