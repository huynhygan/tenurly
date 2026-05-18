import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import FileUploader from '@/components/FileUploader';
import { money, normalizeCharge, prettyDate } from '@/lib/propertyApp';
import { format } from 'date-fns';
import { CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

export default function TenantRent() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [payOpen, setPayOpen] = useState(false);
  const [selectedCharge, setSelectedCharge] = useState(null);
  const [payForm, setPayForm] = useState({ receipt_url: '', payment_reference: '' });

  const qKey = ['tenant-rent', user?.id];

  const { data: chargesRaw = [] } = useQuery({
    queryKey: qKey,
    queryFn: () => base44.entities.RentCharge.filter({ tenant_id: user?.id }),
    enabled: !!user?.id,
  });

  const charges = chargesRaw.map(normalizeCharge).sort((a, b) => new Date(b.due_date) - new Date(a.due_date));

  const markPaid = useMutation({
    mutationFn: ({ id, receipt_url, payment_reference }) =>
      base44.entities.RentCharge.update(id, {
        status: 'paid',
        receipt_url,
        payment_reference,
        paid_date: format(new Date(), 'yyyy-MM-dd'),
      }),
    onMutate: async ({ id }) => {
      await qc.cancelQueries({ queryKey: qKey });
      const prev = qc.getQueryData(qKey);
      qc.setQueryData(qKey, old => old?.map(c => c.id === id ? { ...c, status: 'paid' } : c));
      return { prev };
    },
    onError: (_err, _vars, ctx) => qc.setQueryData(qKey, ctx.prev),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qKey });
      setPayOpen(false);
      setSelectedCharge(null);
      setPayForm({ receipt_url: '', payment_reference: '' });
    },
  });

  const openPay = (charge) => {
    setSelectedCharge(charge);
    setPayForm({ receipt_url: '', payment_reference: '' });
    setPayOpen(true);
  };

  const statusIcon = (status) => {
    if (['paid', 'confirmed'].includes(status)) return <CheckCircle2 size={16} className="text-emerald-500" />;
    if (status === 'overdue') return <AlertTriangle size={16} className="text-red-500" />;
    return <Clock size={16} className="text-amber-500" />;
  };

  const statusBg = (status) => {
    if (['paid', 'confirmed'].includes(status)) return 'bg-emerald-50';
    if (status === 'overdue') return 'bg-red-50';
    return 'bg-amber-50';
  };

  return (
    <div className="pb-6">
      <PageHeader title="My rent" subtitle="Track and submit your rent payments" back />

      <div className="px-5 space-y-3">
        {charges.length === 0 && (
          <div className="bg-white rounded-3xl p-8 text-center text-sm text-muted-foreground border border-border/40 mt-2">
            No rent records yet.
          </div>
        )}

        {charges.map((charge) => (
          <div key={charge.id} className="bg-white rounded-3xl p-4 shadow-sm border border-border/40">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${statusBg(charge.status)}`}>
                {statusIcon(charge.status)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-base">{money(charge.amount)}</p>
                <p className="text-xs text-muted-foreground">Due {prettyDate(charge.due_date)}</p>
              </div>
              <StatusBadge status={charge.status} label={charge.status === 'confirmed' ? 'Settled' : undefined} />
            </div>

            {(charge.payment_reference || charge.paid_date) && (
              <div className="mt-3 pt-3 border-t border-border/40 space-y-0.5">
                {charge.payment_reference && <p className="text-xs text-muted-foreground">Ref: {charge.payment_reference}</p>}
                {charge.paid_date && <p className="text-xs text-muted-foreground">Paid: {prettyDate(charge.paid_date)}</p>}
              </div>
            )}

            {(['upcoming', 'due', 'overdue'].includes(charge.status) || charge.receipt_url) && (
              <div className="mt-3 flex gap-2">
                {['upcoming', 'due', 'overdue'].includes(charge.status) && (
                  <Button className="flex-1 rounded-2xl" onClick={() => openPay(charge)}>I've paid</Button>
                )}
                {charge.receipt_url && (
                  <a href={charge.receipt_url} target="_blank" rel="noreferrer" className="flex-1">
                    <Button variant="outline" className="w-full rounded-2xl">View receipt</Button>
                  </a>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent className="max-w-sm rounded-3xl">
          <DialogHeader><DialogTitle>Submit Payment</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); markPaid.mutate({ id: selectedCharge.id, ...payForm }); }} className="space-y-3">
            <div className="bg-muted/50 rounded-2xl p-3 text-sm">
              <span className="text-muted-foreground">Amount: </span>
              <span className="font-bold">{money(selectedCharge?.amount)}</span>
              <span className="text-muted-foreground"> due </span>
              <span className="font-medium">{prettyDate(selectedCharge?.due_date)}</span>
            </div>
            <div>
              <Label>Payment Reference (optional)</Label>
              <Input
                value={payForm.payment_reference}
                onChange={e => setPayForm({ ...payForm, payment_reference: e.target.value })}
                placeholder="Bank reference or transaction ID"
                className="mt-1"
              />
            </div>
            <FileUploader
              label="Upload receipt (optional)"
              accept="image/*,.pdf"
              onUpload={url => setPayForm({ ...payForm, receipt_url: url })}
            />
            <Button type="submit" className="w-full rounded-2xl" disabled={markPaid.isPending}>
              {markPaid.isPending ? 'Submitting...' : 'Confirm Payment'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}