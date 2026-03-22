import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Plus, FileText, ExternalLink } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import BottomSheet from '@/components/BottomSheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';
import FileUploader from '@/components/FileUploader';
import { format } from 'date-fns';

export default function Documents() {
  const { propertyId } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'other', file_url: '' });

  const { data: docs = [] } = useQuery({
    queryKey: ['documents', propertyId],
    queryFn: () => base44.entities.Document.filter({ property_id: propertyId }),
  });

  const createDoc = useMutation({
    mutationFn: (data) => base44.entities.Document.create({
      ...data, property_id: propertyId, uploaded_by: user?.id
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setOpen(false);
      setForm({ name: '', type: 'other', file_url: '' });
    },
  });

  return (
    <div>
      <PageHeader
        title="Documents"
        back
        action={
          user?.role === 'landlord' && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild><Button size="sm" className="gap-1"><Plus className="w-4 h-4" />Upload</Button></DialogTrigger>
              <DialogContent className="max-w-sm">
                <DialogHeader><DialogTitle>Upload Document</DialogTitle></DialogHeader>
                <form onSubmit={(e) => { e.preventDefault(); createDoc.mutate(form); }} className="space-y-3">
                  <div><Label>Document Name</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
                  <div>
                    <Label>Type</Label>
                    <Select value={form.type} onValueChange={v => setForm({...form, type: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lease_agreement">Lease Agreement</SelectItem>
                        <SelectItem value="bond_receipt">Bond Receipt</SelectItem>
                        <SelectItem value="condition_report">Condition Report</SelectItem>
                        <SelectItem value="notice">Notice</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <FileUploader label="Choose file" onUpload={url => setForm({...form, file_url: url})} />
                  <Button type="submit" className="w-full" disabled={createDoc.isPending || !form.file_url}>Upload</Button>
                </form>
              </DialogContent>
            </Dialog>
          )
        }
      />
      <div className="px-4 space-y-3 mt-2">
        {docs.length === 0 && <EmptyState icon={FileText} title="No documents" description="Upload lease agreements and other documents" />}
        {docs.map(d => (
          <Card key={d.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary shrink-0" />
                  <h3 className="font-medium text-sm truncate">{d.name}</h3>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 capitalize">{d.type?.replace('_', ' ')}</p>
                <p className="text-xs text-muted-foreground">{format(new Date(d.created_date), 'MMM d, yyyy')}</p>
              </div>
              <a href={d.file_url} target="_blank" rel="noopener">
                <Button variant="ghost" size="icon"><ExternalLink className="w-4 h-4" /></Button>
              </a>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}