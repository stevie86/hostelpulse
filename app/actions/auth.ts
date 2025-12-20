'use server';
import { signIn } from '@/auth';

export async function authenticate(
  prevState: string | undefined,
  formData: FormData
) {
  try {
    await signIn('credentials', formData);
    } catch (error) {
      if (error && typeof error === 'object' && 'type' in error) {
        const authError = error as { type: string; code?: string };
        if (authError.type === 'CredentialsSignin' || authError.code === 'credentials') {
          return 'Invalid credentials.';
        }
      }
    // If it's a redirect error (success), Next.js handles it.
    // Otherwise re-throw.
    throw error;
  }
}
