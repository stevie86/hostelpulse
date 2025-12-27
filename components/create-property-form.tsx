'use client';

import { useActionState } from 'react';
import { createProperty } from '@/app/actions/properties';
import GlassCard from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, MapPin, Globe, Clock } from 'lucide-react';

export function CreatePropertyForm() {
  const [state, action, isPending] = useActionState(createProperty, {
    message: null,
    errors: {},
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-base-100 to-secondary/5 flex items-center justify-center p-4">
      <GlassCard className="w-full max-w-2xl p-8">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-base-content mb-2">
            Welcome to HostelPulse!
          </h1>
          <p className="text-lg text-base-content/70">
            Let's set up your first property to get started
          </p>
        </div>

        {state.message && (
          <div className="alert alert-error bg-error/10 text-error border-error/20 mb-6 p-4 rounded-lg">
            <span>{state.message}</span>
          </div>
        )}

        <form action={action} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Property Name */}
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-sm font-semibold flex items-center gap-2"
              >
                <Building2 size={16} className="text-primary" />
                Property Name
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g., Lisbon Central Hostel"
                className="input input-bordered w-full bg-base-100/50 backdrop-blur-sm"
                required
              />
              {state.errors?.name && (
                <p className="text-sm text-red-600">
                  {state.errors.name.join(', ')}
                </p>
              )}
            </div>

            {/* City */}
            <div className="space-y-2">
              <Label
                htmlFor="city"
                className="text-sm font-semibold flex items-center gap-2"
              >
                <MapPin size={16} className="text-primary" />
                City
              </Label>
              <Input
                id="city"
                name="city"
                placeholder="e.g., Lisbon"
                className="input input-bordered w-full bg-base-100/50 backdrop-blur-sm"
                required
              />
              {state.errors?.city && (
                <p className="text-sm text-red-600">
                  {state.errors.city.join(', ')}
                </p>
              )}
            </div>

            {/* Country */}
            <div className="space-y-2">
              <Label
                htmlFor="country"
                className="text-sm font-semibold flex items-center gap-2"
              >
                <Globe size={16} className="text-primary" />
                Country
              </Label>
              <Input
                id="country"
                name="country"
                placeholder="e.g., Portugal"
                className="input input-bordered w-full bg-base-100/50 backdrop-blur-sm"
                required
              />
              {state.errors?.country && (
                <p className="text-sm text-red-600">
                  {state.errors.country.join(', ')}
                </p>
              )}
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label
                htmlFor="address"
                className="text-sm font-semibold flex items-center gap-2"
              >
                <MapPin size={16} className="text-primary" />
                Address
              </Label>
              <Input
                id="address"
                name="address"
                placeholder="Street address"
                className="input input-bordered w-full bg-base-100/50 backdrop-blur-sm"
                required
              />
              {state.errors?.address && (
                <p className="text-sm text-red-600">
                  {state.errors.address.join(', ')}
                </p>
              )}
            </div>

            {/* Check-in Time */}
            <div className="space-y-2">
              <Label
                htmlFor="checkInTime"
                className="text-sm font-semibold flex items-center gap-2"
              >
                <Clock size={16} className="text-primary" />
                Check-in Time
              </Label>
              <Input
                id="checkInTime"
                name="checkInTime"
                type="time"
                defaultValue="15:00"
                className="input input-bordered w-full bg-base-100/50 backdrop-blur-sm"
                required
              />
              {state.errors?.checkInTime && (
                <p className="text-sm text-red-600">
                  {state.errors.checkInTime.join(', ')}
                </p>
              )}
            </div>

            {/* Check-out Time */}
            <div className="space-y-2">
              <Label
                htmlFor="checkOutTime"
                className="text-sm font-semibold flex items-center gap-2"
              >
                <Clock size={16} className="text-primary" />
                Check-out Time
              </Label>
              <Input
                id="checkOutTime"
                name="checkOutTime"
                type="time"
                defaultValue="11:00"
                className="input input-bordered w-full bg-base-100/50 backdrop-blur-sm"
                required
              />
              {state.errors?.checkOutTime && (
                <p className="text-sm text-red-600">
                  {state.errors.checkOutTime.join(', ')}
                </p>
              )}
            </div>
          </div>

          {/* Hidden fields with defaults */}
          <input type="hidden" name="currency" value="EUR" />
          <input type="hidden" name="timezone" value="Europe/Lisbon" />

          <Button
            type="submit"
            disabled={isPending}
            className="w-full h-[3.5rem] rounded-xl text-base font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-[0.98]"
          >
            {isPending ? (
              <>
                <div className="loading loading-spinner loading-sm mr-2" />
                Creating Property...
              </>
            ) : (
              <>
                <Building2 className="mr-2" size={20} />
                Create My Property
              </>
            )}
          </Button>
        </form>

        {/* Alternative: Use Demo Data */}
        <div className="mt-8 p-6 bg-base-200 rounded-xl border border-base-300">
          <h3 className="text-lg font-semibold mb-2">Quick Start Option</h3>
          <p className="text-base-content/70 mb-4">
            Want to explore HostelPulse with demo data? Run the database seed
            command:
          </p>
          <div className="bg-base-100 p-3 rounded-lg font-mono text-sm border">
            pnpm run db:seed
          </div>
          <p className="text-xs text-base-content/60 mt-2">
            This creates a demo property called "HostelPulse Lisbon" with sample
            rooms and guests.
          </p>
        </div>
      </GlassCard>
    </div>
  );
}
