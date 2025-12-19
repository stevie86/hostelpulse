"use client";

import { useActionState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GuestSchema, GuestFormValues } from "@/lib/schemas/guest";
import { ActionState } from "@/app/actions/guests";

interface GuestFormProps {
  propertyId: string;
  action: (
    prevState: ActionState,
    formData: FormData
  ) => Promise<ActionState>;
  initialValues?: Partial<GuestFormValues>;
  isEditMode?: boolean;
}

export function GuestForm({
  propertyId,
  action,
  initialValues,
  isEditMode = false,
}: GuestFormProps) {
  const [state, formAction, isPending] = useActionState(action, {
    message: null,
    errors: {},
  });

  const {
    register,
    formState: { errors: clientErrors },
  } = useForm<GuestFormValues>({
    resolver: zodResolver(GuestSchema),
    defaultValues: {
      firstName: initialValues?.firstName || "",
      lastName: initialValues?.lastName || "",
      email: initialValues?.email || "",
      phone: initialValues?.phone || "",
      nationality: initialValues?.nationality || "",
      documentType: initialValues?.documentType || "passport",
      documentId: initialValues?.documentId || "",
      notes: initialValues?.notes || "",
    },
  });

  return (
    <form action={formAction} className="space-y-4 max-w-lg">
      {state.message && (
        <div className="alert alert-error">
          <span>{state.message}</span>
        </div>
      )}

      <div className="flex gap-4">
        <div className="form-control w-1/2">
          <label className="label">First Name</label>
          <input
            type="text"
            className="input input-bordered w-full"
            {...register("firstName")}
          />
          {clientErrors.firstName && (
            <span className="text-error text-xs">{clientErrors.firstName.message}</span>
          )}
        </div>
        <div className="form-control w-1/2">
          <label className="label">Last Name</label>
          <input
            type="text"
            className="input input-bordered w-full"
            {...register("lastName")}
          />
          {clientErrors.lastName && (
            <span className="text-error text-xs">{clientErrors.lastName.message}</span>
          )}
        </div>
      </div>

      <div className="form-control">
        <label className="label">Email</label>
        <input
          type="email"
          className="input input-bordered w-full"
          {...register("email")}
        />
      </div>

      <div className="form-control">
        <label className="label">Phone</label>
        <input
          type="tel"
          className="input input-bordered w-full"
          {...register("phone")}
        />
      </div>

      <div className="flex gap-4">
        <div className="form-control w-1/3">
          <label className="label">Doc Type</label>
          <select className="select select-bordered" {...register("documentType")}>
            <option value="passport">Passport</option>
            <option value="id_card">ID Card</option>
            <option value="driving_license">Driver&apos;s License</option>
          </select>
        </div>
        <div className="form-control w-2/3">
          <label className="label">Document ID</label>
          <input
            type="text"
            className="input input-bordered w-full"
            {...register("documentId")}
          />
        </div>
      </div>

      <div className="form-control">
        <label className="label">Nationality</label>
        <input
          type="text"
          className="input input-bordered w-full"
          {...register("nationality")}
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="btn btn-primary w-full"
      >
        {isPending ? "Saving..." : isEditMode ? "Update Guest" : "Create Guest"}
      </button>
    </form>
  );
}
