import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { CalendarClock } from 'lucide-react';
import { Card } from "@/components/ui/card";
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import EmptyState from '@/components/EmptyState';
import { differenceInDays, parseISO } from 'date-fns';

export default function LeaseExpiry() {
  const { user } = useAuth();

  const { data: tenancies = [] } = useQuery({
    queryKey: ['tenancies'],
    queryFn: () => base44.entities.Tenancy.filter({ landlord_id: user?.id, status: 'active' }),
  });

  const now = new Date();
  const withExpiry = tenancies
    .filter(t => t.lease_end)
    .map(t => ({ ...t, daysLeft: differenceInDays(parseISO(t.lease_end), now) }))
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const getExpiryStatus = (days) => {
    if (days < 0) return 'expired';
    if (days <= 14) return 'urgent';
    if (days <= 30) return 'high';
    if (days <= 60) return 'expiring_soon';
    return 'active';
  };

  return (
    <div>
      <PageHeader title="Lease renewals" back />
      <div className="px-4 space-y-3 mt-2">
        {withExpiry.length === 0 && <EmptyState icon={CalendarClock} title="No active leases" description="Active leases with end dates will appear here" />}
        {withExpiry.map(t => (
          <Card key={t.id} className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium text-sm">{t.tenant_name || t.tenant_email}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Lease ends: {t.lease_end}</p>
              </div>
              <div className="text-right">
                <StatusBadge status={getExpiryStatus(t.daysLeft)} label={t.daysLeft < 0 ? 'Expired' : `${t.daysLeft} days`} />
                <p className="text-xs text-muted-foreground mt-1">${t.rent_amount}/{t.rent_frequency}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}