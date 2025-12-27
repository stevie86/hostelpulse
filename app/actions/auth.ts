'use server';
import { signIn } from '@/auth';

export async function authenticate(
  prevState: string | undefined,
  formData: FormData
) {
  try {
    await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirectTo: '/',
    });
  } catch (error: unknown) {
    if (
      error &&
      typeof error === 'object' &&
      'type' in error &&
      (error as { type: string }).type === 'CredentialsSignin'
    ) {
      return 'Invalid credentials.';
    }
    throw error;
  }
}
