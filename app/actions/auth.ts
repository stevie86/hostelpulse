'use server';
import { signIn } from '@/auth';

export async function authenticate(prevState: string | undefined, formData: FormData) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error && typeof error === 'object' && 'type' in error) {
      if (error.type === 'CredentialsSignin' || (error as any).code === 'credentials') {
        return 'Invalid credentials.';
      }
    }
    // If it's a redirect error (success), Next.js handles it.
    // Otherwise re-throw.
    throw error;
  }
}
