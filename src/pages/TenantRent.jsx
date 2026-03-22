import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import { money, normalizeCharge, prettyDate } from '@/lib/propertyApp';

export default function TenantRent() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: chargesRaw = [] } = useQuery({ queryKey: ['tenant-rent', user?.id], queryFn: () => base44.entities.RentCharge.filter({ tenant_id: user?.id }), enabled: !!user?.id });
  const charges = chargesRaw.map(normalizeCharge).sort((a,b) => new Date(b.due_date) - new Date(a.due_date));

  const markPaid = useMutation({
    mutationFn: (id) => base44.entities.RentCharge.update(id, { status: 'paid' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tenant-rent', user?.id] })
  });

  return (
    <div>
      <PageHeader title="Payments" subtitle="Mark rent as paid and track confirmation" back />
      <div className="space-y-3 px-4 py-4">
        {charges.map((charge) => (
          <Card key={charge.id} className="rounded-3xl p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{money(charge.amount)}</p>
                <p className="text-sm text-muted-foreground">Due {prettyDate(charge.due_date)}</p>
                {charge.payment_reference && <p className="mt-1 text-xs text-muted-foreground">Ref: {charge.payment_reference}</p>}
              </div>
              <StatusBadge status={charge.status === 'confirmed' ? 'confirmed' : charge.status} label={charge.status === 'confirmed' ? 'Settled' : undefined} />
            </div>
            <div className="mt-4 flex gap-2">
              {['upcoming', 'due', 'overdue', 'pending'].includes(charge.status) && <Button onClick={() => markPaid.mutate(charge.id)}>I've paid</Button>}
              {charge.receipt_url && <a href={charge.receipt_url} target="_blank" rel="noreferrer"><Button variant="outline">View receipt</Button></a>}
            </div>
          </Card>
        ))}
        {charges.length === 0 && <Card className="rounded-3xl p-8 text-center text-sm text-muted-foreground shadow-sm">No rent records yet.</Card>}
      </div>
    </div>
  );
}