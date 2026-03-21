import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Plus, Receipt } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';
import FileUploader from '@/components/FileUploader';

const CATEGORIES = ['repairs', 'insurance', 'rates', 'utilities', 'management', 'cleaning', 'garden', 'other'];

export default function Expenses() {
  const { propertyId } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ category: 'other', amount: '', date: '', description: '', receipt_url: '' });

  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses', propertyId],
    queryFn: () => propertyId
      ? base44.entities.Expense.filter({ property_id: propertyId })
      : base44.entities.Expense.filter({ landlord_id: user?.id }),
  });

  const createExpense = useMutation({
    mutationFn: (data) => base44.entities.Expense.create({
      ...data, amount: parseFloat(data.amount), property_id: propertyId, landlord_id: user?.id
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setOpen(false);
      setForm({ category: 'other', amount: '', date: '', description: '', receipt_url: '' });
    },
  });

  const sorted = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
  const total = expenses.reduce((s, e) => s + (e.amount || 0), 0);

  return (
    <div>
      <PageHeader
        title="Expenses"
        subtitle={`Total: $${total.toLocaleString()}`}
        back
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button size="sm" className="gap-1"><Plus className="w-4 h-4" />Add</Button></DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogHeader><DialogTitle>New Expense</DialogTitle></DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); createExpense.mutate(form); }} className="space-y-3">
                <div>
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={v => setForm({...form, category: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(c => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Amount ($)</Label><Input type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required /></div>
                <div><Label>Date</Label><Input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required /></div>
                <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
                <FileUploader label="Upload receipt" accept="image/*,.pdf" onUpload={url => setForm({...form, receipt_url: url})} />
                <Button type="submit" className="w-full" disabled={createExpense.isPending}>Add Expense</Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />
      <div className="px-4 space-y-3 mt-2">
        {sorted.length === 0 && <EmptyState icon={Receipt} title="No expenses" description="Log property expenses here" />}
        {sorted.map(e => (
          <Card key={e.id} className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-sm capitalize">{e.category}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{e.date}</p>
                {e.description && <p className="text-xs text-muted-foreground mt-0.5">{e.description}</p>}
              </div>
              <p className="font-bold text-destructive">-${e.amount}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}