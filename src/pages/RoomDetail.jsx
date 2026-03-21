import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { UserPlus, DollarSign, CalendarDays, Mail, Trash2 } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import EmptyState from '@/components/EmptyState';

export default function RoomDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [tenantOpen, setTenantOpen] = useState(false);
  const [tenantForm, setTenantForm] = useState({
    tenant_name: '', tenant_email: '', rent_amount: '', rent_frequency: 'weekly',
    rent_due_day: '1', bond_amount: '', lease_start: '', lease_end: ''
  });

  const { data: room } = useQuery({
    queryKey: ['room', id],
    queryFn: async () => { const list = await base44.entities.Room.filter({ id }); return list[0]; },
  });

  const { data: tenancies = [] } = useQuery({
    queryKey: ['roomTenancies', id],
    queryFn: () => base44.entities.Tenancy.filter({ room_id: id }),
  });

  const activeTenancy = tenancies.find(t => t.status === 'active');

  const createTenancy = useMutation({
    mutationFn: async (data) => {
      const tenancy = await base44.entities.Tenancy.create({
        ...data,
        property_id: room.property_id,
        room_id: id,
        landlord_id: user?.id,
        rent_amount: parseFloat(data.rent_amount),
        bond_amount: parseFloat(data.bond_amount) || 0,
        rent_due_day: parseInt(data.rent_due_day),
        status: 'active'
      });
      await base44.entities.Room.update(id, { status: 'occupied' });
      // Create invite
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      await base44.entities.Invite.create({
        property_id: room.property_id,
        room_id: id,
        tenancy_id: tenancy.id,
        landlord_id: user?.id,
        tenant_email: data.tenant_email,
        code,
        status: 'pending'
      });
      return tenancy;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roomTenancies', id] });
      queryClient.invalidateQueries({ queryKey: ['room', id] });
      setTenantOpen(false);
    },
  });

  return (
    <div>
      <PageHeader title={room?.name || 'Room'} subtitle={`Status: ${room?.status || ''}`} back />
      <div className="px-4 space-y-4 mt-2">
        {activeTenancy ? (
          <>
            <Card className="p-4 space-y-3">
              <h3 className="text-sm font-semibold">Current Tenant</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span className="font-medium">{activeTenancy.tenant_name}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span className="font-medium">{activeTenancy.tenant_email}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Rent</span><span className="font-medium">${activeTenancy.rent_amount} / {activeTenancy.rent_frequency}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Bond</span><span className="font-medium">${activeTenancy.bond_amount || 0}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Lease</span><span className="font-medium">{activeTenancy.lease_start} — {activeTenancy.lease_end}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Status</span><StatusBadge status={activeTenancy.status} /></div>
              </div>
            </Card>
            <div className="grid grid-cols-2 gap-2">
              <Link to={`/properties/${room?.property_id}/rent-ledger`}>
                <Button variant="outline" className="w-full gap-1"><DollarSign className="w-4 h-4" />Rent Ledger</Button>
              </Link>
              <Link to={`/properties/${room?.property_id}/documents`}>
                <Button variant="outline" className="w-full gap-1"><CalendarDays className="w-4 h-4" />Documents</Button>
              </Link>
            </div>
          </>
        ) : (
          <EmptyState
            icon={UserPlus}
            title="No tenant assigned"
            description="Add a tenant to this room to start tracking rent"
            action={
              <Dialog open={tenantOpen} onOpenChange={setTenantOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-1"><UserPlus className="w-4 h-4" />Assign Tenant</Button>
                </DialogTrigger>
                <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto">
                  <DialogHeader><DialogTitle>Assign Tenant</DialogTitle></DialogHeader>
                  <form onSubmit={(e) => { e.preventDefault(); createTenancy.mutate(tenantForm); }} className="space-y-3">
                    <div><Label>Tenant Name</Label><Input value={tenantForm.tenant_name} onChange={e => setTenantForm({...tenantForm, tenant_name: e.target.value})} required /></div>
                    <div><Label>Tenant Email</Label><Input type="email" value={tenantForm.tenant_email} onChange={e => setTenantForm({...tenantForm, tenant_email: e.target.value})} required /></div>
                    <div className="grid grid-cols-2 gap-2">
                      <div><Label>Rent Amount ($)</Label><Input type="number" value={tenantForm.rent_amount} onChange={e => setTenantForm({...tenantForm, rent_amount: e.target.value})} required /></div>
                      <div>
                        <Label>Frequency</Label>
                        <Select value={tenantForm.rent_frequency} onValueChange={v => setTenantForm({...tenantForm, rent_frequency: v})}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="fortnightly">Fortnightly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div><Label>Due Day</Label><Input type="number" min="1" max="31" value={tenantForm.rent_due_day} onChange={e => setTenantForm({...tenantForm, rent_due_day: e.target.value})} /></div>
                      <div><Label>Bond ($)</Label><Input type="number" value={tenantForm.bond_amount} onChange={e => setTenantForm({...tenantForm, bond_amount: e.target.value})} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div><Label>Lease Start</Label><Input type="date" value={tenantForm.lease_start} onChange={e => setTenantForm({...tenantForm, lease_start: e.target.value})} /></div>
                      <div><Label>Lease End</Label><Input type="date" value={tenantForm.lease_end} onChange={e => setTenantForm({...tenantForm, lease_end: e.target.value})} /></div>
                    </div>
                    <Button type="submit" className="w-full" disabled={createTenancy.isPending}>
                      {createTenancy.isPending ? 'Creating...' : 'Assign Tenant & Send Invite'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            }
          />
        )}

        {tenancies.filter(t => t.status !== 'active').length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-2">Previous Tenancies</h3>
            {tenancies.filter(t => t.status !== 'active').map(t => (
              <Card key={t.id} className="p-3 mb-2">
                <div className="flex justify-between items-center text-sm">
                  <span>{t.tenant_name || t.tenant_email}</span>
                  <StatusBadge status={t.status} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{t.lease_start} — {t.lease_end}</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}