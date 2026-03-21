import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { DollarSign, Upload, CheckCircle } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import EmptyState from '@/components/EmptyState';
import FileUploader from '@/components/FileUploader';

export default function TenantRent() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [proofOpen, setProofOpen] = useState(null);
  const [proofUrl, setProofUrl] = useState('');

  const { data: charges = [] } = useQuery({
    queryKey: ['myRentCharges'],
    queryFn: () => base44.entities.RentCharge.filter({ tenant_id: user?.id }),
  });

  const markPaid = useMutation({
    mutationFn: ({ id, proof_url }) => base44.entities.RentCharge.update(id, {
      status: 'paid',
      paid_date: new Date().toISOString().split('T')[0],
      ...(proof_url ? { proof_url } : {})
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myRentCharges'] });
      setProofOpen(null);
      setProofUrl('');
    },
  });

  const sorted = [...charges].sort((a, b) => new Date(b.due_date) - new Date(a.due_date));
  const actionable = sorted.filter(c => ['due', 'overdue', 'upcoming'].includes(c.status));
  const history = sorted.filter(c => ['paid', 'confirmed'].includes(c.status));

  return (
    <div>
      <PageHeader title="Rent & Payments" />
      <div className="px-4 space-y-4 mt-2">
        {actionable.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold mb-2">Action Required</h2>
            {actionable.map(c => (
              <Card key={c.id} className="p-4 mb-2">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-lg">${c.amount}</p>
                    <p className="text-xs text-muted-foreground">Due: {c.due_date}</p>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
                {c.status !== 'upcoming' && (
                  <Dialog open={proofOpen === c.id} onOpenChange={(o) => setProofOpen(o ? c.id : null)}>
                    <DialogTrigger asChild>
                      <Button className="w-full gap-2">
                        <CheckCircle className="w-4 h-4" />I've Paid
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-sm">
                      <DialogHeader><DialogTitle>Confirm Payment</DialogTitle></DialogHeader>
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">Upload your payment proof or receipt (optional)</p>
                        <FileUploader label="Upload receipt" accept="image/*,.pdf" onUpload={url => setProofUrl(url)} />
                        <Button className="w-full" onClick={() => markPaid.mutate({ id: c.id, proof_url: proofUrl })} disabled={markPaid.isPending}>
                          {markPaid.isPending ? 'Confirming...' : 'Confirm Payment'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </Card>
            ))}
          </div>
        )}

        <div>
          <h2 className="text-sm font-semibold mb-2">Payment History</h2>
          {history.length === 0 && <EmptyState icon={DollarSign} title="No payments yet" />}
          {history.map(c => (
            <Card key={c.id} className="p-4 mb-2">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">${c.amount}</p>
                  <p className="text-xs text-muted-foreground">Paid: {c.paid_date || c.due_date}</p>
                </div>
                <StatusBadge status={c.status} />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}