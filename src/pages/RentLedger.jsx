import React, { useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Plus, DollarSign, Check, Eye } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import EmptyState from '@/components/EmptyState';
import BottomSheet from '@/components/BottomSheet';
import usePullToRefresh from '@/hooks/usePullToRefresh';
import { format } from 'date-fns';

export default function RentLedger() {
  const { propertyId } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState({ tenancy_id: '', amount: '', due_date: '', notes: '' });

  const chargesKey = ['rentCharges', propertyId];
  const tenanciesKey = ['tenancies', propertyId];

  const { data: charges = [], refetch: refetchCharges } = useQuery({
    queryKey: chargesKey,
    queryFn: () => propertyId
      ? base44.entities.RentCharge.filter({ property_id: propertyId })
      : base44.entities.RentCharge.filter({ landlord_id: user?.id }),
  });

  const { data: tenancies = [], refetch: refetchTenancies } = useQuery({
    queryKey: tenanciesKey,
    queryFn: () => propertyId
      ? base44.entities.Tenancy.filter({ property_id: propertyId, status: 'active' })
      : base44.entities.Tenancy.filter({ landlord_id: user?.id, status: 'active' }),
  });

  const onRefresh = useCallback(() => Promise.all([refetchCharges(), refetchTenancies()]), [refetchCharges, refetchTenancies]);
  const { containerRef, isRefreshing } = usePullToRefresh(onRefresh);

  const tenancyOptions = tenancies.map(t => ({ value: t.id, label: t.tenant_name || t.tenant_email }));

  const createCharge = useMutation({
    mutationFn: (data) => {
      const tenancy = tenancies.find(t => t.id === data.tenancy_id);
      return base44.entities.RentCharge.create({
        ...data,
        amount: parseFloat(data.amount),
        property_id: tenancy?.property_id || propertyId,
        room_id: tenancy?.room_id,
        tenant_id: tenancy?.tenant_id,
        landlord_id: user?.id,
        status: 'upcoming',
      });
    },
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: chargesKey });
      const prev = queryClient.getQueryData(chargesKey);
      const optimistic = { id: `tmp-${Date.now()}`, ...data, amount: parseFloat(data.amount), status: 'upcoming' };
      queryClient.setQueryData(chargesKey, old => [optimistic, ...(old || [])]);
      return { prev };
    },
    onError: (_err, _vars, ctx) => queryClient.setQueryData(chargesKey, ctx.prev),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chargesKey });
      setOpen(false);
      setForm({ tenancy_id: '', amount: '', due_date: '', notes: '' });
    },
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => base44.entities.RentCharge.update(id, {
      status,
      ...(status === 'confirmed' ? { paid_date: format(new Date(), 'yyyy-MM-dd') } : {})
    }),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: chargesKey });
      const prev = queryClient.getQueryData(chargesKey);
      queryClient.setQueryData(chargesKey, old => old?.map(c => c.id === id ? { ...c, status } : c));
      return { prev };
    },
    onError: (_err, _vars, ctx) => queryClient.setQueryData(chargesKey, ctx.prev),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: chargesKey }),
  });

  const filtered = filter === 'all' ? charges : charges.filter(c => c.status === filter);
  const sorted = [...filtered].sort((a, b) => new Date(b.due_date) - new Date(a.due_date));

  return (
    <div>
      <PageHeader
        title="Rent Ledger"
        back
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button size="sm" className="gap-1"><Plus className="w-4 h-4" />Add</Button></DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogHeader><DialogTitle>New Rent Charge</DialogTitle></DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); createCharge.mutate(form); }} className="space-y-3">
                <div>
                  <Label>Tenant</Label>
                  <BottomSheet
                    value={form.tenancy_id}
                    onValueChange={v => {
                      const t = tenancies.find(x => x.id === v);
                      setForm({...form, tenancy_id: v, amount: t?.rent_amount?.toString() || form.amount });
                    }}
                    options={tenancyOptions}
                    placeholder="Select tenant"
                    label="Select Tenant"
                  />
                </div>
                <div><Label>Amount ($)</Label><Input type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required /></div>
                <div><Label>Due Date</Label><Input type="date" value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})} required /></div>
                <div><Label>Notes</Label><Input value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} /></div>
                <Button type="submit" className="w-full" disabled={createCharge.isPending}>Create Charge</Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />
      {isRefreshing && <div className="text-center text-xs text-muted-foreground py-1">Refreshing…</div>}
      <div ref={containerRef} className="px-4 space-y-3 mt-2">
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
          {['all', 'upcoming', 'due', 'paid', 'overdue', 'confirmed'].map(s => (
            <Button key={s} variant={filter === s ? 'default' : 'outline'} size="sm" onClick={() => setFilter(s)} className="shrink-0 capitalize">
              {s}
            </Button>
          ))}
        </div>
        {sorted.length === 0 && <EmptyState icon={DollarSign} title="No charges" description="Add rent charges to track payments" />}
        {sorted.map(c => {
          const tenancy = tenancies.find(t => t.id === c.tenancy_id);
          return (
            <Card key={c.id} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-sm">{tenancy?.tenant_name || tenancy?.tenant_email || 'Tenant'}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Due: {c.due_date}</p>
                  {c.notes && <p className="text-xs text-muted-foreground mt-0.5">{c.notes}</p>}
                </div>
                <div className="text-right">
                  <p className="font-bold">${c.amount}</p>
                  <StatusBadge status={c.status} />
                </div>
              </div>
              {c.proof_url && (
                <a href={c.proof_url} target="_blank" rel="noopener" className="flex items-center gap-1 text-xs text-primary mt-2">
                  <Eye className="w-3 h-3" />View receipt
                </a>
              )}
              {c.status === 'paid' && (
                <Button size="sm" variant="outline" className="mt-2 gap-1 w-full" onClick={() => updateStatus.mutate({ id: c.id, status: 'confirmed' })}>
                  <Check className="w-3.5 h-3.5" />Confirm Settlement
                </Button>
              )}
              {c.status === 'upcoming' && (
                <div className="flex gap-2 mt-2">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => updateStatus.mutate({ id: c.id, status: 'due' })}>Mark Due</Button>
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => updateStatus.mutate({ id: c.id, status: 'overdue' })}>Mark Overdue</Button>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}