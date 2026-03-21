import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { Link } from 'react-router-dom';
import { Plus, Wrench, ArrowRight } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import EmptyState from '@/components/EmptyState';
import FileUploader from '@/components/FileUploader';

export default function TenantRepairs() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', photo_urls: [] });

  const { data: tenancies = [] } = useQuery({
    queryKey: ['myTenancies'],
    queryFn: () => base44.entities.Tenancy.filter({ tenant_id: user?.id, status: 'active' }),
  });

  const { data: requests = [] } = useQuery({
    queryKey: ['myMaintenance'],
    queryFn: () => base44.entities.MaintenanceRequest.filter({ tenant_id: user?.id }),
  });

  const activeTenancy = tenancies[0];

  const createRequest = useMutation({
    mutationFn: (data) => base44.entities.MaintenanceRequest.create({
      ...data,
      property_id: activeTenancy?.property_id,
      room_id: activeTenancy?.room_id,
      tenant_id: user?.id,
      landlord_id: activeTenancy?.landlord_id,
      status: 'open',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myMaintenance'] });
      setOpen(false);
      setForm({ title: '', description: '', priority: 'medium', photo_urls: [] });
    },
  });

  const sorted = [...requests].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

  return (
    <div>
      <PageHeader
        title="Repairs"
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button size="sm" className="gap-1"><Plus className="w-4 h-4" />Request</Button></DialogTrigger>
            <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>New Repair Request</DialogTitle></DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); createRequest.mutate(form); }} className="space-y-3">
                <div><Label>Title</Label><Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Leaking tap in bathroom" required /></div>
                <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Describe the issue in detail" required /></div>
                <div>
                  <Label>Priority</Label>
                  <Select value={form.priority} onValueChange={v => setForm({...form, priority: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <FileUploader label="Add photos" accept="image/*" multiple onUpload={urls => setForm({...form, photo_urls: urls})} />
                <Button type="submit" className="w-full" disabled={createRequest.isPending}>Submit Request</Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />
      <div className="px-4 space-y-3 mt-2">
        {sorted.length === 0 && <EmptyState icon={Wrench} title="No repair requests" description="Submit a request when something needs fixing" />}
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