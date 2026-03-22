import React, { useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { Link } from 'react-router-dom';
import { Wrench, ArrowRight } from 'lucide-react';
import { Card } from "@/components/ui/card";
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import EmptyState from '@/components/EmptyState';
import usePullToRefresh from '@/hooks/usePullToRefresh';

export default function MaintenanceRequests() {
  const { user } = useAuth();
  const isLandlord = user?.role === 'landlord';

  const { data: requests = [], refetch } = useQuery({
    queryKey: ['maintenanceRequests'],
    queryFn: () => isLandlord
      ? base44.entities.MaintenanceRequest.filter({ landlord_id: user?.id })
      : base44.entities.MaintenanceRequest.filter({ tenant_id: user?.id }),
  });

  const onRefresh = useCallback(() => refetch(), [refetch]);
  const { containerRef, isRefreshing } = usePullToRefresh(onRefresh);

  const sorted = [...requests].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

  return (
    <div>
      <PageHeader title={isLandlord ? "Maintenance Requests" : "My Repairs"} />
      {isRefreshing && <div className="text-center text-xs text-muted-foreground py-1">Refreshing…</div>}
      <div ref={containerRef} className="px-4 space-y-3 mt-2">
        {sorted.length === 0 && <EmptyState icon={Wrench} title="No requests" description="Maintenance requests will appear here" />}
        {sorted.map(r => (
          <Link key={r.id} to={`/maintenance/${r.id}`}>
            <Card className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-sm truncate">{r.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{r.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <StatusBadge status={r.status} />
                    <StatusBadge status={r.priority} />
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}