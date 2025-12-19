import { CreditCard, History } from "lucide-react";

export function GuestHeader({ 
  totalStays, 
  lifetimeValue 
}: { 
  totalStays: number; 
  lifetimeValue: number 
}) {
  return (
    <div className="stats shadow w-full bg-base-100">
      <div className="stat">
        <div className="stat-figure text-primary">
          <History size={32} />
        </div>
        <div className="stat-title">Total Stays</div>
        <div className="stat-value text-primary">{totalStays}</div>
        <div className="stat-desc">Since joining</div>
      </div>

      <div className="stat">
        <div className="stat-figure text-secondary">
          <CreditCard size={32} />
        </div>
        <div className="stat-title">Lifetime Value</div>
        <div className="stat-value text-secondary">
          €{(lifetimeValue / 100).toFixed(2)}
        </div>
        <div className="stat-desc text-secondary">Total revenue</div>
      </div>
    </div>
  );
}
