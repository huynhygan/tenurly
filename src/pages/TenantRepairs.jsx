import React, { useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { Link } from 'react-router-dom';
import { Wrench, Plus, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import EmptyState from '@/components/EmptyState';
import BottomSheet from '@/components/BottomSheet';
import FileUploader from '@/components/FileUploader';
import usePullToRefresh from '@/hooks/usePullToRefresh';

const BLANK = { title: '', description: '', priority: 'medium', photo_urls: [] };

export default function TenantRepairs() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(BLANK);

  const qKey = ['tenantRepairs', user?.id];

  const { data: requests = [], refetch } = useQuery({
    queryKey: qKey,
    queryFn: () => base44.entities.MaintenanceRequest.filter({ tenant_id: user?.id }),
    enabled: !!user?.id,
  });

  const onRefresh = useCallback(() => refetch(), [refetch]);
  const { containerRef, isRefreshing } = usePullToRefresh(onRefresh);

  // Fetch tenancy to get property_id and landlord_id
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
    },
  });

  const sorted = [...requests].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

  return (
    <div>
      <PageHeader
        title="My Repairs"
        subtitle="Track and submit repair requests"
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1"><Plus className="w-4 h-4" />Request</Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Request Repair</DialogTitle></DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); createRequest.mutate(form); }} className="space-y-3">
                <div><Label>Title</Label><Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Leaking tap" required /></div>
                <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Describe the issue..." required /></div>
                <div>
                  <Label>Urgency</Label>
                  <BottomSheet
                    value={form.priority}
                    onValueChange={v => setForm({...form, priority: v})}
                    options={[
                      { value: 'low', label: 'Low – not urgent' },
                      { value: 'medium', label: 'Medium – needs attention' },
                      { value: 'high', label: 'High – urgent' },
                      { value: 'urgent', label: 'Urgent – emergency' },
                    ]}
                    label="Select Urgency"
                  />
                </div>
                <FileUploader
                  label="Attach photos (optional)"
                  accept="image/*"
                  multiple
                  onUpload={url => setForm(f => ({ ...f, photo_urls: [...f.photo_urls, url] }))}
                />
                <Button type="submit" className="w-full" disabled={createRequest.isPending}>
                  {createRequest.isPending ? 'Submitting...' : 'Submit Request'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />
      {isRefreshing && <div className="text-center text-xs text-muted-foreground py-1">Refreshing…</div>}
      <div ref={containerRef} className="px-4 space-y-3 mt-2">
        {sorted.length === 0 && (
          <EmptyState
            icon={Wrench}
            title="No repair requests"
            description="Submit a repair request and your landlord will be notified"
            action={
              <Button size="sm" className="gap-1" onClick={() => setOpen(true)}>
                <Plus className="w-4 h-4" />Request Repair
              </Button>
            }
          />
        )}
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