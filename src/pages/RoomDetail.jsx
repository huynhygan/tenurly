import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { UserPlus, DollarSign, FileText, Pencil, Trash2, AlertTriangle, Upload, Mail, CheckCircle2 } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import BottomSheet from '@/components/BottomSheet';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import EmptyState from '@/components/EmptyState';
import FileUploader from '@/components/FileUploader';
import { toast } from 'sonner';

const BLANK_TENANT = {
  tenant_name: '', tenant_email: '', rent_amount: '', rent_frequency: 'weekly',
  rent_due_day: '1', bond_amount: '', lease_start: '', lease_end: ''
};

export default function RoomDetail() {
   React.useEffect(() => { 
    document.title = 'Room — Tenurly';
    const el = document.querySelector('meta[name="description"]');
    if (el) el.setAttribute('content', 'Tenurly — smart property management for self-managed landlords and their tenants.');
  }, []);
   const { id } = useParams();
   const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [tenantOpen, setTenantOpen] = useState(false);
  const [tenantForm, setTenantForm] = useState(BLANK_TENANT);

  const [editRoomOpen, setEditRoomOpen] = useState(false);
  const [roomForm, setRoomForm] = useState({ name: '', description: '', status: 'vacant' });

  const [deleteRoomOpen, setDeleteRoomOpen] = useState(false);
  const [deleteTenantOpen, setDeleteTenantOpen] = useState(false);

  const [leaseOpen, setLeaseOpen] = useState(false);
  const [leaseUrl, setLeaseUrl] = useState('');
  const [leaseName, setLeaseName] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState(null); // { email, code }

  const { data: room } = useQuery({
    queryKey: ['room', id],
    queryFn: async () => { const list = await base44.entities.Room.filter({ id }); return list[0]; },
    onSuccess: (data) => {
      if (data) setRoomForm({ name: data.name, description: data.description || '', status: data.status || 'vacant' });
    }
  });

  const { data: tenancies = [] } = useQuery({
    queryKey: ['roomTenancies', id],
    queryFn: () => base44.entities.Tenancy.filter({ room_id: id }),
  });

  const activeTenancy = tenancies.find(t => t.status === 'active');

  // Create tenancy
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
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      await base44.entities.Invite.create({
        property_id: room.property_id, room_id: id,
        tenancy_id: tenancy.id, landlord_id: user?.id,
        tenant_email: data.tenant_email, code, status: 'pending'
      });
      return tenancy;
    },
    onSuccess: (tenancy, variables) => {
      queryClient.invalidateQueries({ queryKey: ['roomTenancies', id] });
      queryClient.invalidateQueries({ queryKey: ['room', id] });
      setTenantOpen(false);
      setTenantForm(BLANK_TENANT);
      setInviteSuccess({ email: variables.tenant_email });
    },
  });

  // Update room
  const updateRoom = useMutation({
    mutationFn: (data) => base44.entities.Room.update(id, data),
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: ['room', id] });
      const prev = queryClient.getQueryData(['room', id]);
      queryClient.setQueryData(['room', id], old => old ? { ...old, ...data } : old);
      return { prev };
    },
    onError: (_err, _vars, ctx) => queryClient.setQueryData(['room', id], ctx.prev),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['room', id] });
      setEditRoomOpen(false);
      toast.success('Room updated');
    },
  });

  // Delete room
  const deleteRoom = useMutation({
    mutationFn: async () => {
      if (activeTenancy) await base44.entities.Tenancy.update(activeTenancy.id, { status: 'terminated' });
      await base44.entities.Room.delete(id);
    },
    onSuccess: () => {
      toast.success('Room deleted');
      navigate(-1);
    },
  });

  // Terminate tenancy
  const terminateTenancy = useMutation({
    mutationFn: async () => {
      await base44.entities.Tenancy.update(activeTenancy.id, { status: 'terminated' });
      await base44.entities.Room.update(id, { status: 'vacant' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roomTenancies', id] });
      queryClient.invalidateQueries({ queryKey: ['room', id] });
      setDeleteTenantOpen(false);
      toast.success('Tenancy terminated');
    },
  });

  // Upload lease agreement
  const uploadLease = useMutation({
    mutationFn: () => base44.entities.Document.create({
      property_id: room.property_id,
      tenancy_id: activeTenancy?.id,
      name: leaseName || 'Lease Agreement',
      type: 'lease_agreement',
      file_url: leaseUrl,
      uploaded_by: user?.id,
    }),
    onSuccess: () => {
      setLeaseOpen(false);
      setLeaseUrl('');
      setLeaseName('');
      toast.success('Lease agreement uploaded');
    },
  });

  const openEditRoom = () => {
    if (room) setRoomForm({ name: room.name, description: room.description || '', status: room.status || 'vacant' });
    setEditRoomOpen(true);
  };

  return (
    <div>
      <PageHeader
        title={room?.name || 'Room'}
        subtitle={`Status: ${room?.status || ''}`}
        back
        action={
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={openEditRoom}><Pencil className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeleteRoomOpen(true)}><Trash2 className="w-4 h-4" /></Button>
          </div>
        }
      />

      <div className="px-4 space-y-4 mt-2">
        {/* Invite success banner */}
        {inviteSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-emerald-800">Invite sent!</p>
              <p className="text-xs text-emerald-700 mt-0.5">
                An invite link has been sent to <span className="font-semibold">{inviteSuccess.email}</span>. Once they accept, their account will be linked automatically.
              </p>
              <button className="text-xs text-emerald-700 underline mt-1" onClick={() => setInviteSuccess(null)}>Dismiss</button>
            </div>
          </div>
        )}

        {activeTenancy ? (
          <>
            <Card className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Current Tenant</h3>
                <Button variant="ghost" size="sm" className="text-destructive gap-1 h-7 px-2 text-xs" onClick={() => setDeleteTenantOpen(true)}>
                  <Trash2 className="w-3 h-3" /> Remove
                </Button>
              </div>
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
                <Button variant="outline" className="w-full gap-1"><DollarSign className="w-4 h-4" />Payment history</Button>
              </Link>
              <Button variant="outline" className="w-full gap-1" onClick={() => setLeaseOpen(true)}>
                <Upload className="w-4 h-4" />Lease Agreement
              </Button>
              <Link to={`/properties/${room?.property_id}/documents`} className="col-span-2">
                <Button variant="outline" className="w-full gap-1"><FileText className="w-4 h-4" />All Documents</Button>
              </Link>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-2xl border border-border/40 p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
              <UserPlus size={22} className="text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">This room is vacant</p>
              <p className="text-sm text-muted-foreground mt-1">Add a tenant to start tracking rent and send them an invite link.</p>
            </div>
            <Button className="gap-2 w-full" onClick={() => setTenantOpen(true)}>
              <UserPlus className="w-4 h-4" /> Add tenant & send invite
            </Button>
          </div>
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

      {/* Assign Tenant Dialog */}
      <Dialog open={tenantOpen} onOpenChange={setTenantOpen}>
        <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Assign Tenant</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); createTenancy.mutate(tenantForm); }} className="space-y-3">
            <div><Label>Tenant Name</Label><Input value={tenantForm.tenant_name} onChange={e => setTenantForm({...tenantForm, tenant_name: e.target.value})} required /></div>
            <div><Label>Tenant Email</Label><Input type="email" value={tenantForm.tenant_email} onChange={e => setTenantForm({...tenantForm, tenant_email: e.target.value})} required /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>Rent Amount ($)</Label><Input type="number" value={tenantForm.rent_amount} onChange={e => setTenantForm({...tenantForm, rent_amount: e.target.value})} required /></div>
              <div>
                <Label>Frequency</Label>
                <BottomSheet
                  value={tenantForm.rent_frequency}
                  onValueChange={v => setTenantForm({...tenantForm, rent_frequency: v})}
                  options={[{ value: 'weekly', label: 'Weekly' }, { value: 'fortnightly', label: 'Fortnightly' }, { value: 'monthly', label: 'Monthly' }]}
                  label="Select Frequency"
                />
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

      {/* Edit Room Dialog */}
      <Dialog open={editRoomOpen} onOpenChange={setEditRoomOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Edit Room</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); updateRoom.mutate(roomForm); }} className="space-y-3">
            <div><Label>Room Name</Label><Input value={roomForm.name} onChange={e => setRoomForm({...roomForm, name: e.target.value})} required /></div>
            <div><Label>Description</Label><Input value={roomForm.description} onChange={e => setRoomForm({...roomForm, description: e.target.value})} placeholder="Optional description" /></div>
            <div>
              <Label>Status</Label>
              <BottomSheet
                value={roomForm.status}
                onValueChange={v => setRoomForm({...roomForm, status: v})}
                options={[{ value: 'vacant', label: 'Vacant' }, { value: 'occupied', label: 'Occupied' }, { value: 'maintenance', label: 'Maintenance' }]}
                label="Select Status"
              />
            </div>
            <Button type="submit" className="w-full" disabled={updateRoom.isPending}>
              {updateRoom.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Upload Lease Agreement Dialog */}
      <Dialog open={leaseOpen} onOpenChange={setLeaseOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Upload Lease Agreement</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Document Name</Label>
              <Input value={leaseName} onChange={e => setLeaseName(e.target.value)} placeholder="Lease Agreement" />
            </div>
            <FileUploader label="Choose lease file (PDF)" onUpload={url => setLeaseUrl(url)} />
            <Button
              className="w-full"
              disabled={!leaseUrl || uploadLease.isPending}
              onClick={() => uploadLease.mutate()}
            >
              {uploadLease.isPending ? 'Uploading...' : 'Upload Lease Agreement'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Terminate Tenant Confirm */}
      <Dialog open={deleteTenantOpen} onOpenChange={setDeleteTenantOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="flex items-center gap-2 text-destructive"><AlertTriangle className="w-5 h-5" />Remove Tenant</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">This will terminate <span className="font-semibold text-foreground">{activeTenancy?.tenant_name}</span>'s tenancy and mark the room as vacant. This cannot be undone.</p>
          <div className="flex gap-2 mt-2">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteTenantOpen(false)}>Cancel</Button>
            <Button variant="destructive" className="flex-1" disabled={terminateTenancy.isPending} onClick={() => terminateTenancy.mutate()}>
              {terminateTenancy.isPending ? 'Removing...' : 'Remove Tenant'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Room Confirm */}
      <Dialog open={deleteRoomOpen} onOpenChange={setDeleteRoomOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="flex items-center gap-2 text-destructive"><AlertTriangle className="w-5 h-5" />Delete Room</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">This will permanently delete <span className="font-semibold text-foreground">{room?.name}</span> and terminate any active tenancy. This cannot be undone.</p>
          <div className="flex gap-2 mt-2">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteRoomOpen(false)}>Cancel</Button>
            <Button variant="destructive" className="flex-1" disabled={deleteRoom.isPending} onClick={() => deleteRoom.mutate()}>
              {deleteRoom.isPending ? 'Deleting...' : 'Delete Room'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}