'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { authenticate } from '@/app/actions/auth';

export default function LoginForm() {
  const [errorMessage, dispatch] = useActionState(authenticate, undefined);

  return (
    <form action={dispatch} className="space-y-3">
      <div className="flex-1 rounded-lg bg-base-200 px-6 pb-4 pt-8">
        <h1 className="mb-3 text-2xl font-bold text-base-content">
          Please log in to continue.
        </h1>
        <div className="w-full">
          <div>
            <label
              className="mb-3 mt-5 block text-xs font-medium text-base-content"
              htmlFor="email"
            >
              Email
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-base-300 bg-base-100 py-[9px] pl-3 text-sm outline-2 placeholder:text-base-content/50 text-base-content"
                id="email"
                type="email"
                name="email"
                placeholder="Enter your email address"
                required
                defaultValue="admin@hostelpulse.com"
              />
            </div>
          </div>
          <div className="mt-4">
            <label
              className="mb-3 mt-5 block text-xs font-medium text-base-content"
              htmlFor="password"
            >
              Password
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-base-300 bg-base-100 py-[9px] pl-3 text-sm outline-2 placeholder:text-base-content/50 text-base-content"
                id="password"
                type="password"
                name="password"
                placeholder="Enter password"
                required
                minLength={6}
                defaultValue="password"
              />
            </div>
          </div>
        </div>
        <LoginButton />
        <div
          className="flex h-8 items-end space-x-1"
          aria-live="polite"
          aria-atomic="true"
        >
          {errorMessage && <p className="text-sm text-error">{errorMessage}</p>}
        </div>
        <p className="text-xs text-base-content/70 mt-4">
          Demo: admin@hostelpulse.com / password
        </p>
      </div>
    </form>
  );
}

function LoginButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="mt-4 w-full rounded-lg bg-primary py-3 text-sm font-medium text-primary-content transition-colors hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50"
      disabled={pending}
      aria-disabled={pending}
    >
      {pending ? 'Logging in...' : 'Log in'}
    </button>
  );
}
