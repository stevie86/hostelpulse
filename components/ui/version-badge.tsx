'use client';

export function VersionBadge() {
  const version = process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0';
  const env = process.env.NODE_ENV === 'production' ? '' : ' (dev)';

  return (
    <div className="fixed bottom-2 right-3 z-50">
      <div className="badge badge-ghost text-[10px] px-2 py-1 opacity-60 hover:opacity-100 transition-opacity">
        v{version}
        {env}
      </div>
    </div>
  );
}
