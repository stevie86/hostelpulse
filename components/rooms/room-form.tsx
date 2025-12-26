'use client';

import { useActionState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RoomSchema, RoomFormValues } from '@/lib/schemas/room';
import { ActionState } from '@/app/actions/rooms';

interface RoomFormProps {
  propertyId: string;
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  initialValues?: Partial<RoomFormValues>;
  isEditMode?: boolean;
  roomId?: string; // Needed if we bind the action
}

export function RoomForm({
  propertyId,
  action,
  initialValues,
  isEditMode = false,
  roomId,
}: RoomFormProps) {
  // Bind the action with arguments
  // Since action signature is (arg, state, formData), we need to ensure we pass what's needed.
  // In actions/rooms.ts: createRoom(propertyId, prevState, formData)
  // updateRoom(roomId, propertyId, prevState, formData)

  // We need to handle the binding carefully or use a wrapper.
  // Best practice: Pass the *bound* action from the parent, OR bind it here.
  // But useActionState expects (state, payload) -> state.
  // Next.js actions are (prevState, formData) -> state.
  // So we just need to bind the ID arguments.

  // Let's assume the parent passes a BOUND action, or we bind it here.
  // Since 'action' prop usually comes from a server component where it can be bound:
  // <RoomForm action={createRoom.bind(null, propertyId)} />

  const [state, formAction, isPending] = useActionState(action, {
    message: null,
    errors: {},
  });

  const {
    register,
    handleSubmit, // We can use this if we want fully controlled submit, but with Server Actions we can just use action={formAction}
    formState: { errors: clientErrors },
  } = useForm({
    resolver: zodResolver(RoomSchema),
    defaultValues: {
      name: initialValues?.name || '',
      type: initialValues?.type || 'private',
      beds: initialValues?.beds || 1,
      pricePerNight: initialValues?.pricePerNight
        ? initialValues.pricePerNight / 100
        : 0, // Convert cents to euros
      maxOccupancy: initialValues?.maxOccupancy || 1,
      description: initialValues?.description || '',
    },
  });

  // If using action={formAction} directly on <form>, client-side validation won't stop submission automatically
  // unless we use handleSubmit.
  // But handleSubmit works with 'onSubmit', not 'action'.
  // Pattern: <form action={formAction} onSubmit={(evt) => { ... validate ... }} >
  // Actually, simplest is to let server handle it OR prevent default.
  // Let's use standard Next.js form action, and rely on browser HTML5 validation + server validation for simplicity and robustness.
  // OR use handleSubmit to trigger client validation, then call formAction(formData).

  return (
    <form action={formAction} className="space-y-6 max-w-lg">
      {state.message && (
        <div className="alert alert-error">
          <span>{state.message}</span>
        </div>
      )}

      {/* Name */}
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text">Room Name/Number</span>
        </label>
        <input
          type="text"
          placeholder="e.g. 101 or Blue Dorm"
          className={`input input-bordered w-full ${
            state.errors?.name || clientErrors.name ? 'input-error' : ''
          }`}
          {...register('name')}
        />
        <label className="label">
          <span className="label-text-alt text-error">
            {state.errors?.name?.join(', ') || clientErrors.name?.message}
          </span>
        </label>
      </div>

      {/* Type */}
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text">Type</span>
        </label>
        <select className="select select-bordered" {...register('type')}>
          <option value="dormitory">Dormitory</option>
          <option value="private">Private Room</option>
          <option value="suite">Suite</option>
        </select>
        <label className="label">
          <span className="label-text-alt text-error">
            {state.errors?.type?.join(', ') || clientErrors.type?.message}
          </span>
        </label>
      </div>

      <div className="flex gap-4">
        {/* Beds */}
        <div className="form-control w-1/2">
          <label className="label">
            <span className="label-text">Bed Count</span>
          </label>
          <input
            type="number"
            min="1"
            className={`input input-bordered w-full ${
              state.errors?.beds || clientErrors.beds ? 'input-error' : ''
            }`}
            {...register('beds')}
          />
          <label className="label">
            <span className="label-text-alt text-error">
              {state.errors?.beds?.join(', ') || clientErrors.beds?.message}
            </span>
          </label>
        </div>

        {/* Max Occupancy */}
        <div className="form-control w-1/2">
          <label className="label">
            <span className="label-text">Max Occupancy</span>
          </label>
          <input
            type="number"
            min="1"
            className={`input input-bordered w-full ${
              state.errors?.maxOccupancy || clientErrors.maxOccupancy
                ? 'input-error'
                : ''
            }`}
            {...register('maxOccupancy')}
          />
          <label className="label">
            <span className="label-text-alt text-error">
              {state.errors?.maxOccupancy?.join(', ') ||
                clientErrors.maxOccupancy?.message}
            </span>
          </label>
        </div>
      </div>

      {/* Price */}
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text font-semibold text-lg">
            💰 Price per Night
          </span>
        </label>
        <div className="join">
          <span className="join-item btn btn-outline">€</span>
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="25.00"
            className={`input input-bordered join-item w-full ${
              state.errors?.pricePerNight || clientErrors.pricePerNight
                ? 'input-error'
                : ''
            }`}
            {...register('pricePerNight')}
          />
        </div>
        <label className="label">
          <span className="label-text-alt text-gray-500">
            For dorms: price per person per night
            <br />
            For private rooms: price per room per night
            <br />
            Enter in euros (e.g., 25.00 for €25)
          </span>
          <span className="label-text-alt text-error">
            {state.errors?.pricePerNight?.join(', ') ||
              clientErrors.pricePerNight?.message}
          </span>
        </label>
      </div>

      {/* Description */}
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text">Description (Optional)</span>
        </label>
        <textarea
          className="textarea textarea-bordered h-24"
          placeholder="Room details..."
          {...register('description')}
        ></textarea>
        <label className="label">
          <span className="label-text-alt text-error">
            {state.errors?.description?.join(', ') ||
              clientErrors.description?.message}
          </span>
        </label>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="btn btn-primary w-full"
      >
        {isPending ? (
          <span className="loading loading-spinner"></span>
        ) : isEditMode ? (
          'Update Room'
        ) : (
          'Create Room'
        )}
      </button>
    </form>
  );
}
