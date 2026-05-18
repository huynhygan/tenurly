import React, { useState, useCallback, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { Plus, CheckCircle2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import PageHeader from '@/components/PageHeader';
import FileUploader from '@/components/FileUploader';
import BottomSheet from '@/components/BottomSheet';
import usePullToRefresh from '@/hooks/usePullToRefresh';

/* ─── STATUS CONFIG ─────────────────────────────────── */
const STATUS = {
  open:        { dot: '🔴', label: 'Open — your request has been sent to your landlord',           bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-700' },
  scheduled:   { dot: '🟡', label: 'Acknowledged — your landlord has seen this',                   bg: 'bg-amber-50',  border: 'border-amber-200',  text: 'text-amber-700' },
  in_progress: { dot: '🔵', label: 'In progress — work is being arranged or underway',             bg: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-blue-700' },
  completed:   { dot: '🟢', label: 'Resolved — marked as fixed',                                   bg: 'bg-emerald-50',border: 'border-emerald-200', text: 'text-emerald-700' },
  cancelled:   { dot: '⚫', label: 'Closed',                                                        bg: 'bg-gray-50',   border: 'border-gray-200',   text: 'text-gray-500' },
};

function fmtDate(str) {
  if (!str) return '—';
  return new Date(str).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

function StatusPill({ status, resolvedDate }) {
  const s = STATUS[status] || STATUS.open;
  const label = (status === 'completed' && resolvedDate)
    ? `🟢 Resolved — marked as fixed on ${fmtDate(resolvedDate)}`
    : `${s.dot} ${s.label.replace(/^[^ ]+ /, '')}`;
  return (
    <span className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full border ${s.bg} ${s.border} ${s.text}`}>
      <span>{s.dot}</span>
      <span>{s.label.replace(/^[^ ]+ /, '')}{status === 'completed' && resolvedDate ? ` on ${fmtDate(resolvedDate)}` : ''}</span>
    </span>
  );
}

/* ─── REQUEST CARD ──────────────────────────────────── */
function RepairCard({ request }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      {/* Title + date */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-bold text-base text-[#0f1f3d] leading-tight">{request.title}</h3>
        <span className="text-xs text-slate-400 shrink-0 mt-0.5">Lodged {fmtDate(request.created_date)}</span>
      </div>

      {/* Status pill */}
      <div className="mb-3">
        <StatusPill status={request.status} resolvedDate={request.resolved_date} />
      </div>

      {/* Description */}
      {request.description && (
        <p className="text-sm text-slate-600 mb-3 leading-relaxed">{request.description}</p>
      )}

      {/* Landlord notes */}
      {request.notes && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-3">
          <p className="text-xs font-semibold text-blue-700 mb-1">Update from your landlord:</p>
          <p className="text-sm text-blue-800">{request.notes}</p>
        </div>
      )}

      {/* Photos */}
      {request.photo_urls?.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {request.photo_urls.map((url, i) => (
            <a key={i} href={url} target="_blank" rel="noopener noreferrer">
              <img src={url} alt={`Photo ${i + 1}`} className="w-16 h-16 object-cover rounded-xl border border-slate-200 hover:opacity-90 transition-opacity" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── NEW REQUEST FORM ──────────────────────────────── */
function NewRequestForm({ onSubmit, onClose, isPending }) {
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', photo_urls: [] });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-[#0f1f3d]">Log a repair request</h2>
        <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors">
          <X size={16} className="text-slate-400" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label className="text-sm font-semibold">What's the issue? <span className="text-red-500">*</span></Label>
          <Input
            className="mt-1"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Leaking tap in kitchen"
            required
          />
        </div>

        <div>
          <Label className="text-sm font-semibold">Describe the problem</Label>
          <Textarea
            className="mt-1"
            rows={3}
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            placeholder="When did it start? How bad is it? Any safety concern?"
          />
        </div>

        <div>
          <Label className="text-sm font-semibold">How urgent is this?</Label>
          <div className="mt-1">
            <BottomSheet
              value={form.priority}
              onValueChange={v => setForm({ ...form, priority: v })}
              options={[
                { value: 'low',    label: 'Low — not urgent, can wait' },
                { value: 'medium', label: 'Medium — needs attention soon' },
                { value: 'high',   label: 'High — urgent' },
                { value: 'urgent', label: 'Urgent — emergency' },
              ]}
              label="Select urgency"
            />
          </div>
        </div>

        <FileUploader
          label="Add a photo (helpful but not required)"
          accept="image/*"
          multiple
          onUpload={url => setForm(f => ({ ...f, photo_urls: [...f.photo_urls, url] }))}
        />

        <Button type="submit" className="w-full rounded-xl h-11 text-sm font-semibold bg-[#0d9e7e] hover:bg-[#0b8a6e]" disabled={isPending}>
          {isPending ? 'Sending…' : 'Send repair request →'}
        </Button>
      </form>
    </div>
  );
}

/* ─── PAGE ──────────────────────────────────────────── */
const BLANK = { title: '', description: '', priority: 'medium', photo_urls: [] };

export default function TenantRepairs() {
   React.useEffect(() => { document.title = 'Repairs — Tenurly'; }, []);
   const { user } = useAuth();
   const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const qKey = ['tenantRepairs', user?.id];

  const { data: requests = [], refetch } = useQuery({
    queryKey: qKey,
    queryFn: () => base44.entities.MaintenanceRequest.filter({ tenant_id: user?.id }),
    enabled: !!user?.id,
  });

  const { data: tenancies = [] } = useQuery({
    queryKey: ['tenant-tenancies', user?.id],
    queryFn: () => base44.entities.Tenancy.filter({ tenant_id: user?.id, status: 'active' }),
    enabled: !!user?.id,
  });
  const activeTenancy = tenancies[0];

  const onRefresh = useCallback(() => refetch(), [refetch]);
  const { containerRef, isRefreshing } = usePullToRefresh(onRefresh);

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
      setShowForm(false);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 6000);
    },
  });

  const sorted = [...requests].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

  return (
    <div>
      <PageHeader
        title="Repairs & maintenance"
        action={
          <Button
            size="sm"
            className="gap-1.5 rounded-xl bg-[#0d9e7e] hover:bg-[#0b8a6e] text-white"
            onClick={() => { setShowForm(true); setSubmitted(false); }}
          >
            <Plus className="w-4 h-4" /> Log a repair
          </Button>
        }
      />

      {isRefreshing && <div className="text-center text-xs text-muted-foreground py-1">Refreshing…</div>}

      <div ref={containerRef} className="px-4 space-y-3 mt-2 pb-6">

        {/* Success banner */}
        {submitted && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-sm text-emerald-800 font-medium">
              ✓ Your request has been sent to your landlord. You'll be notified when they respond.
            </p>
          </div>
        )}

        {/* New request form */}
        {showForm && (
          <NewRequestForm
            onSubmit={(data) => createRequest.mutate(data)}
            onClose={() => setShowForm(false)}
            isPending={createRequest.isPending}
          />
        )}

        {/* Empty state */}
        {sorted.length === 0 && !showForm && (
          <div className="text-center py-14">
            <div className="text-4xl mb-3">✅</div>
            <p className="text-sm font-semibold text-slate-700 mb-1">No repair requests</p>
            <p className="text-sm text-slate-400">If something needs fixing, tap the button above.</p>
          </div>
        )}

        {/* Request cards */}
        {sorted.map(r => <RepairCard key={r.id} request={r} />)}

        {/* Bottom "log new" button if requests exist */}
        {sorted.length > 0 && !showForm && (
          <button
            onClick={() => { setShowForm(true); setSubmitted(false); }}
            className="w-full border-2 border-dashed border-slate-200 rounded-2xl py-4 text-sm text-slate-400 hover:border-[#0d9e7e]/40 hover:text-[#0d9e7e] transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Log a new repair request
          </button>
        )}
      </div>
    </div>
  );
}