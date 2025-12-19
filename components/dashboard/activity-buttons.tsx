"use client";

import { useTransition } from "react";
import { checkIn, checkOut } from "@/app/actions/dashboard";

export function CheckInButton({ bookingId }: { bookingId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(async () => { await checkIn(bookingId); })}
      disabled={isPending}
      className="btn btn-primary btn-sm"
    >
      {isPending ? <span className="loading loading-spinner loading-xs"></span> : "Check In"}
    </button>
  );
}

export function CheckOutButton({ bookingId }: { bookingId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(async () => { await checkOut(bookingId); })}
      disabled={isPending}
      className="btn btn-secondary btn-sm"
    >
      {isPending ? <span className="loading loading-spinner loading-xs"></span> : "Check Out"}
    </button>
  );
}
