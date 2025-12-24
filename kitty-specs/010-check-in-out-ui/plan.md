# Implementation Plan: One-click Check-in and Check-out UI

## 1. Architecture Overview

This enhancement will focus on the `DailyActivity` component. We will convert it into a Client Component or use Client-side buttons to trigger the server actions.

## 2. Component Changes

- `components/dashboard/daily-activity.tsx`: Add action buttons to the list items.
- Create a wrapper component if needed to handle the `useActionState` or `useTransition` for the buttons.

## 3. Data Flow

1. User clicks "Check In".
2. `useTransition` hook starts.
3. `checkIn(bookingId)` server action is called.
4. `revalidatePath('/dashboard')` is called on the server.
5. UI refreshes automatically via Next.js server actions mechanism.

## 4. Tasks

- Task 1: Add "Check In" button to Arrivals list.
- Task 2: Add "Check Out" button to Departures list.
- Task 3: Verify security (ensure actions are protected).
