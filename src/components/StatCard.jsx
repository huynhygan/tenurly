import React from 'react';
import { Card } from "@/components/ui/card";

export default function StatCard({ icon: Icon, label, value, sublabel, iconColor = "text-primary" }) {
  return (
    <Card className="p-4 flex items-start gap-3">
      <div className={`p-2.5 rounded-xl bg-accent ${iconColor}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-muted-foreground truncate">{label}</p>
        <p className="text-xl font-bold text-foreground mt-0.5">{value}</p>
        {sublabel && <p className="text-xs text-muted-foreground mt-0.5">{sublabel}</p>}
      </div>
    </Card>
  );
}