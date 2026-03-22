import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Plus, DoorOpen, Users, DollarSign, FileText, Wrench, MessageCircle, AlertTriangle, ChevronRight } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import EmptyState from '@/components/EmptyState';

function SummaryTile({ icon: Icon, label, value, color = 'text-primary', bg = 'bg-primary/10' }) {
  return (
    <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-card border border-border">
      <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center`}>
        <Icon className={`w-3.5 h-3.5 ${color}`} />
      </div>
      <p className="text-[11px] text-muted-foreground leading-tight">{label}</p>
      <p className="text-base font-bold leading-none">{value}</p>
    </div>
  );
}

export default function PropertyDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [roomOpen, setRoomOpen] = useState(false);
  const [roomForm, setRoomForm] = useState({ name: '', description: '' });

  const { data: property } = useQuery({
    queryKey: ['property', id],
    queryFn: async () => { const list = await base44.entities.Property.filter({ id }); return list[0]; },
  });

  const { data: rooms = [] } = useQuery({
    queryKey: ['rooms', id],
    queryFn: () => base44.entities.Room.filter({ property_id: id }),
  });

  const { data: tenancies = [] } = useQuery({
    queryKey: ['tenancies', id],
    queryFn: () => base44.entities.Tenancy.filter({ property_id: id }),
  });

  const { data: rentCharges = [] } = useQuery({
    queryKey: ['rentCharges', id],
    queryFn: () => base44.entities.RentCharge.filter({ property_id: id }),
  });

  const { data: maintenanceRequests = [] } = useQuery({
    queryKey: ['maintenanceRequests', id],
    queryFn: () => base44.entities.MaintenanceRequest.filter({ property_id: id }),
  });

  const createRoom = useMutation({
    mutationFn: (data) => base44.entities.Room.create({ ...data, property_id: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms', id] });
      setRoomOpen(false);
      setRoomForm({ name: '', description: '' });
    },
  });

  // Summary calculations
  const activeTenancies = tenancies.filter(t => t.status === 'active');
  const occupiedRooms = rooms.filter(r => r.status === 'occupied').length;
  const occupancyRate = rooms.length > 0 ? Math.round((occupiedRooms / rooms.length) * 100) : 0;

  const weeklyRent = activeTenancies.reduce((sum, t) => {
    const amt = t.rent_amount || 0;
    if (t.rent_frequency === 'monthly') return sum + Math.round(amt * 12 / 52);
    if (t.rent_frequency === 'fortnightly') return sum + Math.round(amt / 2);
    return sum + amt;
  }, 0);

  const overdueRent = rentCharges
    .filter(r => r.status === 'overdue')
    .reduce((s, r) => s + (r.amount || 0), 0);

  const openMaintenance = maintenanceRequests.filter(m => ['open', 'in_progress'].includes(m.status)).length;

  // Per-room rent status: latest charge for that room's tenancy
  const getLatestCharge = (roomId) => {
    const tenancy = tenancies.find(t => t.room_id === roomId && t.status === 'active');
    if (!tenancy) return null;
    const charges = rentCharges
      .filter(r => r.tenancy_id === tenancy.id)
      .sort((a, b) => new Date(b.due_date) - new Date(a.due_date));
    return charges[0] || null;
  };

  const getTenantForRoom = (roomId) => tenancies.find(t => t.room_id === roomId && t.status === 'active');

  return (
    <div>
      <PageHeader title={property?.name || 'Property'} subtitle={property?.address} back />

      <div className="px-4 space-y-5 mt-3">

        {/* 1. Summary */}
        <div className="grid grid-cols-2 gap-2.5">
          <SummaryTile icon={DollarSign} label="Weekly Rent" value={`$${weeklyRent.toLocaleString()}`} />
          <SummaryTile icon={Users} label="Occupancy" value={`${occupancyRate}%`} color="text-emerald-600" bg="bg-emerald-50" />
          <SummaryTile
            icon={AlertTriangle}
            label="Overdue Rent"
            value={`$${overdueRent.toLocaleString()}`}
            color={overdueRent > 0 ? 'text-red-500' : 'text-muted-foreground'}
            bg={overdueRent > 0 ? 'bg-red-50' : 'bg-muted'}
          />
          <SummaryTile
            icon={Wrench}
            label="Open Repairs"
            value={openMaintenance}
            color={openMaintenance > 0 ? 'text-amber-600' : 'text-muted-foreground'}
            bg={openMaintenance > 0 ? 'bg-amber-50' : 'bg-muted'}
          />
        </div>

        {/* Quick links */}
        <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1">
          <Link to={`/properties/${id}/rent-ledger`}>
            <Button variant="outline" size="sm" className="gap-1.5 shrink-0"><DollarSign className="w-3.5 h-3.5" />Rent Ledger</Button>
          </Link>
          <Link to={`/properties/${id}/expenses`}>
            <Button variant="outline" size="sm" className="gap-1.5 shrink-0"><FileText className="w-3.5 h-3.5" />Expenses</Button>
          </Link>
          <Link to={`/properties/${id}/documents`}>
            <Button variant="outline" size="sm" className="gap-1.5 shrink-0"><FileText className="w-3.5 h-3.5" />Documents</Button>
          </Link>
          <Link to={`/maintenance`}>
            <Button variant="outline" size="sm" className="gap-1.5 shrink-0"><Wrench className="w-3.5 h-3.5" />Maintenance</Button>
          </Link>
        </div>

        {/* 2. Rooms List */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">Rooms <span className="text-muted-foreground font-normal">({rooms.length})</span></h2>
            <Dialog open={roomOpen} onOpenChange={setRoomOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1.5"><Plus className="w-3.5 h-3.5" />Add Room</Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm">
                <DialogHeader><DialogTitle>Add Room</DialogTitle></DialogHeader>
                <form onSubmit={(e) => { e.preventDefault(); createRoom.mutate(roomForm); }} className="space-y-3">
                  <div><Label>Room Name</Label><Input value={roomForm.name} onChange={e => setRoomForm({...roomForm, name: e.target.value})} placeholder="e.g. Room 1, Master Bedroom" required /></div>
                  <div><Label>Description (optional)</Label><Input value={roomForm.description} onChange={e => setRoomForm({...roomForm, description: e.target.value})} placeholder="e.g. En-suite, ground floor" /></div>
                  <Button type="submit" className="w-full" disabled={createRoom.isPending}>
                    {createRoom.isPending ? 'Adding...' : 'Add Room'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {rooms.length === 0 && (
            <EmptyState icon={DoorOpen} title="No rooms yet" description="Add rooms to assign tenants and track rent" />
          )}

          <div className="space-y-2">
            {rooms.map(room => {
              const tenancy = getTenantForRoom(room.id);
              const latestCharge = getLatestCharge(room.id);

              return (
                <Link key={room.id} to={`/rooms/${room.id}`}>
                  <Card className="p-4 hover:shadow-md active:scale-[0.99] transition-all duration-150">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          room.status === 'occupied' ? 'bg-emerald-50' :
                          room.status === 'maintenance' ? 'bg-orange-50' : 'bg-muted'
                        }`}>
                          <DoorOpen className={`w-4 h-4 ${
                            room.status === 'occupied' ? 'text-emerald-600' :
                            room.status === 'maintenance' ? 'text-orange-500' : 'text-muted-foreground'
                          }`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold truncate">{room.name}</p>
                          </div>
                          {tenancy ? (
                            <div className="flex items-center gap-1 mt-0.5">
                              <Users className="w-3 h-3 text-muted-foreground shrink-0" />
                              <span className="text-xs text-muted-foreground truncate">
                                {tenancy.tenant_name || tenancy.tenant_email}
                              </span>
                              <span className="text-xs text-muted-foreground shrink-0">
                                · ${tenancy.rent_amount}/{tenancy.rent_frequency?.slice(0, 2)}
                              </span>
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground mt-0.5">Vacant</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {latestCharge ? (
                          <StatusBadge status={latestCharge.status} />
                        ) : tenancy ? (
                          <StatusBadge status="upcoming" />
                        ) : (
                          <StatusBadge status="vacant" />
                        )}
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* 3. Household Chat button */}
        <Link to={`/household-chat/${id}`} className="block">
          <Button variant="outline" className="w-full gap-2">
            <MessageCircle className="w-4 h-4" /> Household Chat
          </Button>
        </Link>

      </div>
    </div>
  );
}