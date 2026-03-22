import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import FileUploader from '@/components/FileUploader';
import { money, normalizeCharge, prettyDate } from '@/lib/propertyApp';
import { format } from 'date-fns';

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

  const handleSubmitPayment = (e) => {
    e.preventDefault();
    markPaid.mutate({ id: selectedCharge.id, ...payForm });
  };

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
                {charge.paid_date && <p className="mt-0.5 text-xs text-muted-foreground">Paid: {prettyDate(charge.paid_date)}</p>}
              </div>
              <StatusBadge status={charge.status} label={charge.status === 'confirmed' ? 'Settled' : undefined} />
            </div>
            <div className="mt-4 flex gap-2">
              {['upcoming', 'due', 'overdue'].includes(charge.status) && (
                <Button className="flex-1" onClick={() => openPay(charge)}>I've paid</Button>
              )}
              {charge.receipt_url && (
                <a href={charge.receipt_url} target="_blank" rel="noreferrer" className="flex-1">
                  <Button variant="outline" className="w-full">View receipt</Button>
                </a>
              )}
            </div>
          </Card>
        ))}
        {charges.length === 0 && <Card className="rounded-3xl p-8 text-center text-sm text-muted-foreground shadow-sm">No rent records yet.</Card>}
      </div>

      {/* Payment submission dialog */}
      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Submit Payment</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmitPayment} className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Amount: <span className="font-semibold text-foreground">{money(selectedCharge?.amount)}</span> due {prettyDate(selectedCharge?.due_date)}
            </p>
            <div>
              <Label>Payment Reference (optional)</Label>
              <Input
                value={payForm.payment_reference}
                onChange={e => setPayForm({ ...payForm, payment_reference: e.target.value })}
                placeholder="Bank reference or transaction ID"
              />
            </div>
            <FileUploader
              label="Upload receipt (optional)"
              accept="image/*,.pdf"
              onUpload={url => setPayForm({ ...payForm, receipt_url: url })}
            />
            <Button type="submit" className="w-full" disabled={markPaid.isPending}>
              {markPaid.isPending ? 'Submitting...' : 'Confirm Payment'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}