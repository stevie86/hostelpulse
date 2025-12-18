'use client';

import React from 'react';
import GlassCard from '@/components/ui/glass-card';
import { Bed, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

interface OccupancyCardProps {
  occupancy: number;
  arrivals: number;
  departures: number;
}

export function OccupancyCard({ occupancy, arrivals, departures }: OccupancyCardProps) {
  // Assuming occupancy is a percentage
  const percentage = Math.min(100, Math.max(0, occupancy));

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
      <GlassCard delay={0.1} className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-base-content/60 uppercase tracking-wider">Occupancy</span>
          <div className="p-2 bg-primary/10 text-primary rounded-xl">
            <Bed size={20} />
          </div>
        </div>
        <div className="flex items-end gap-2">
          <span className="text-4xl font-bold tracking-tight">{percentage}%</span>
          <span className="text-sm text-success mb-1 font-medium">+2.5%</span>
        </div>
        <div className="w-full bg-base-content/5 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-primary h-full rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </GlassCard>

      <GlassCard delay={0.2} className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-base-content/60 uppercase tracking-wider">Arrivals Today</span>
          <div className="p-2 bg-secondary/10 text-secondary rounded-xl">
            <ArrowDownLeft size={20} />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-4xl font-bold tracking-tight">{arrivals}</span>
          <span className="badge badge-secondary badge-outline font-semibold">Scheduled</span>
        </div>
        <p className="text-xs text-base-content/50 font-medium">Check-ins starting from 14:00</p>
      </GlassCard>

      <GlassCard delay={0.3} className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-base-content/60 uppercase tracking-wider">Departures</span>
          <div className="p-2 bg-accent/10 text-accent rounded-xl">
            <ArrowUpRight size={20} />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-4xl font-bold tracking-tight">{departures}</span>
          <span className="badge badge-accent badge-outline font-semibold">Pending</span>
        </div>
        <p className="text-xs text-base-content/50 font-medium">Room cleaning scheduled</p>
      </GlassCard>
    </div>
  );
}