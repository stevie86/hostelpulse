'use server';
import { signIn } from '@/auth';
import { redirect } from 'next/navigation';

export async function authenticate(
  prevState: string | undefined,
  formData: FormData
) {
  try {
    await signIn('credentials', {
      ...Object.fromEntries(formData),
      redirect: false,
    });
  } catch (error) {
    if (error && typeof error === 'object' && 'type' in error) {
      const authError = error as { type: string; code?: string };
      if (
        authError.type === 'CredentialsSignin' ||
        authError.code === 'credentials'
      ) {
        return 'Invalid credentials.';
      }
    }
    // If it's a redirect error (success), Next.js handles it.
    // Otherwise re-throw.
    throw error;
  }

  // On successful login, redirect manually
  redirect('/');
}
