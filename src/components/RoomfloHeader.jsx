import React from 'react';

export default function RoomfloHeader({ name, subtitle }) {
  return (
    <div className="px-5 pt-6 pb-2">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-2xl font-extrabold tracking-tight text-primary">roomflo</span>
      </div>
      {name && (
        <h1 className="text-2xl font-bold text-foreground mt-3">
          {name}
        </h1>
      )}
      {subtitle && (
        <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
      )}
    </div>
  );
}