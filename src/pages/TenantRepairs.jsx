import React, { useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { Wrench, Plus, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';
import BottomSheet from '@/components/BottomSheet';
import FileUploader from '@/components/FileUploader';
import usePullToRefresh from '@/hooks/usePullToRefresh';
import { format } from 'date-fns';

const BLANK = { title: '', description: '', priority: 'medium', photo_urls: [] };

const STATUS_INFO = {
  open:        { label: 'Open — awaiting review by your landlord',       color: 'bg-red-50 text-red-700 border-red-200' },
  in_progress: { label: 'In progress — work is being arranged',          color: 'bg-blue-50 text-blue-700 border-blue-200' },
  scheduled:   { label: 'Acknowledged — your landlord has seen this',    color: 'bg-amber-50 text-amber-700 border-amber-200' },
  completed:   { label: 'Resolved — marked as fixed',                    color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  cancelled:   { label: 'Closed',                                        color: 'bg-gray-50 text-gray-600 border-gray-200' },
};

function StatusPill({ status, resolvedDate }) {
  const info = STATUS_INFO[status] || STATUS_INFO.open;
  const label = (status === 'completed' && resolvedDate)
    ? `Resolved — marked as fixed on ${format(new Date(resolvedDate), 'd MMM yyyy')}`
    : info.label;
  return (
    <span className={`inline-flex items-center text-xs font-medium px-3 py-1.5 rounded-full border ${info.color}`}>
      {label}
    </span>
  );
}

export default function TenantRepairs() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [submitted, setSubmitted] = useState(false);

  const qKey = ['tenantRepairs', user?.id];

  const { data: requests = [], refetch } = useQuery({
    queryKey: qKey,
    queryFn: () => base44.entities.MaintenanceRequest.filter({ tenant_id: user?.id }),
    enabled: !!user?.id,
  });

  const onRefresh = useCallback(() => refetch(), [refetch]);
  const { containerRef, isRefreshing } = usePullToRefresh(onRefresh);

  const { data: tenancies = [] } = useQuery({
    queryKey: ['tenant-tenancies', user?.id],
    queryFn: () => base44.entities.Tenancy.filter({ tenant_id: user?.id, status: 'active' }),
    enabled: !!user?.id,
  });
  const activeTenancy = tenancies[0];

  const createRequest = useMutation({
    mutationFn: (data) => base44.entities.MaintenanceRequest.create({
      ...data,
      tenant_id: user?.id,
      property_id: activeTenancy?.property_id,
      room_id: activeTenancy?.room_id,
      landlord_id: activeTenancy?.landlord_id,
      status: 'open',
    }),
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: qKey });
      const prev = queryClient.getQueryData(qKey);
      const optimistic = { id: `tmp-${Date.now()}`, ...data, status: 'open', created_date: new Date().toISOString() };
      queryClient.setQueryData(qKey, old => [optimistic, ...(old || [])]);
      return { prev };
    },
    onError: (_err, _vars, ctx) => queryClient.setQueryData(qKey, ctx.prev),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qKey });
      setOpen(false);
      setForm(BLANK);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 5000);
    },
  });

  const sorted = [...requests].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

  return (
    <div>
      <PageHeader
        title="Repairs"
        subtitle="Your maintenance requests"
        action={
          <Button size="sm" className="gap-1" onClick={() => setOpen(true)}>
            <Plus className="w-4 h-4" /> Lodge a repair
          </Button>
        }
      />

      {isRefreshing && <div className="text-center text-xs text-muted-foreground py-1">Refreshing…</div>}

      {submitted && (
        <div className="mx-4 mb-3 bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
          <p className="text-sm text-emerald-800">
            Your request has been sent to your landlord. We'll update you when they respond.
          </p>
        </div>
      )}

      <div ref={containerRef} className="px-4 space-y-3 mt-2">
        {sorted.length === 0 && (
          <EmptyState
            icon={Wrench}
            title="No repair requests"
            description="Submit a repair request and your landlord will be notified"
            action={
              <Button size="sm" className="gap-1" onClick={() => setOpen(true)}>
                <Plus className="w-4 h-4" /> Lodge a repair
              </Button>
            }
          />
        )}

        {sorted.map(r => (
          <Card key={r.id} className="p-4">
            <div className="flex items-start justify-between gap-2 mb-3">
              <h3 className="font-semibold text-sm text-foreground">{r.title}</h3>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </div>
            {r.description && (
              <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{r.description}</p>
            )}
            <StatusPill status={r.status} resolvedDate={r.resolved_date} />
            <p className="text-xs text-muted-foreground mt-2">
              Lodged {r.created_date ? format(new Date(r.created_date), 'd MMM yyyy') : '—'}
            </p>
            {r.notes && (
              <div className="mt-3 bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-800">
                <p className="font-semibold mb-0.5">Note from landlord:</p>
                <p>{r.notes}</p>
              </div>
            )}
            {r.photo_urls?.length > 0 && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {r.photo_urls.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                    <img src={url} alt="repair photo" className="w-16 h-16 object-cover rounded-xl border border-border" />
                  </a>
                ))}
              </div>
            )}
          </Card>
        ))}

        {/* Dashed submit button at bottom */}
        {sorted.length > 0 && (
          <button
            onClick={() => setOpen(true)}
            className="w-full border-2 border-dashed border-border rounded-2xl py-4 text-sm text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Log a new repair request
          </button>
        )}
      </div>

      {/* New request dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Lodge a repair request</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); createRequest.mutate(form); }} className="space-y-4">
            <div>
              <Label>What's the issue?</Label>
              <Input
                value={form.title}
                onChange={e => setForm({...form, title: e.target.value})}
                placeholder="e.g. Leaking tap in kitchen"
                required
              />
            </div>
            <div>
              <Label>Describe the problem in detail</Label>
              <Textarea
                value={form.description}
                onChange={e => setForm({...form, description: e.target.value})}
                placeholder="When did it start? How bad is it?"
                required
              />
            </div>
            <div>
              <Label>How urgent is this?</Label>
              <BottomSheet
                value={form.priority}
                onValueChange={v => setForm({...form, priority: v})}
                options={[
                  { value: 'low', label: 'Low – not urgent' },
                  { value: 'medium', label: 'Medium – needs attention' },
                  { value: 'high', label: 'High – urgent' },
                  { value: 'urgent', label: 'Urgent – emergency' },
                ]}
                label="Select urgency"
              />
            </div>
            <FileUploader
              label="Add a photo (optional but helpful)"
              accept="image/*"
              multiple
              onUpload={url => setForm(f => ({ ...f, photo_urls: [...f.photo_urls, url] }))}
            />
            <Button type="submit" className="w-full" disabled={createRequest.isPending}>
              {createRequest.isPending ? 'Sending…' : 'Send repair request'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}