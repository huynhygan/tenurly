import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Plus, DoorOpen, Users, DollarSign, FileText, Wrench, MessageCircle } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import EmptyState from '@/components/EmptyState';

export default function PropertyDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
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

  const createRoom = useMutation({
    mutationFn: (data) => base44.entities.Room.create({ ...data, property_id: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms', id] });
      setRoomOpen(false);
      setRoomForm({ name: '', description: '' });
    },
  });

  const getTenantForRoom = (roomId) => tenancies.find(t => t.room_id === roomId && t.status === 'active');

  return (
    <div>
      <PageHeader title={property?.name || 'Property'} subtitle={property?.address} back />
      <div className="px-4 space-y-4 mt-2">
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
          <Link to={`/properties/${id}/rent-ledger`}>
            <Button variant="outline" size="sm" className="gap-1 shrink-0"><DollarSign className="w-3.5 h-3.5" />Rent Ledger</Button>
          </Link>
          <Link to={`/properties/${id}/expenses`}>
            <Button variant="outline" size="sm" className="gap-1 shrink-0"><FileText className="w-3.5 h-3.5" />Expenses</Button>
          </Link>
          <Link to={`/properties/${id}/documents`}>
            <Button variant="outline" size="sm" className="gap-1 shrink-0"><FileText className="w-3.5 h-3.5" />Documents</Button>
          </Link>
          <Link to={`/household-chat/${id}`}>
            <Button variant="outline" size="sm" className="gap-1 shrink-0"><MessageCircle className="w-3.5 h-3.5" />Group Chat</Button>
          </Link>
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Rooms</h2>
          <Dialog open={roomOpen} onOpenChange={setRoomOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-1"><Plus className="w-3.5 h-3.5" />Room</Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogHeader><DialogTitle>Add Room</DialogTitle></DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); createRoom.mutate(roomForm); }} className="space-y-3">
                <div><Label>Room Name</Label><Input value={roomForm.name} onChange={e => setRoomForm({...roomForm, name: e.target.value})} placeholder="e.g. Room 1, Master Bedroom" required /></div>
                <div><Label>Description</Label><Input value={roomForm.description} onChange={e => setRoomForm({...roomForm, description: e.target.value})} placeholder="Optional description" /></div>
                <Button type="submit" className="w-full" disabled={createRoom.isPending}>Add Room</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {rooms.length === 0 && (
          <EmptyState icon={DoorOpen} title="No rooms yet" description="Add rooms to assign tenants" />
        )}

        {rooms.map(room => {
          const tenancy = getTenantForRoom(room.id);
          return (
            <Link key={room.id} to={`/rooms/${room.id}`}>
              <Card className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <DoorOpen className="w-4 h-4 text-primary shrink-0" />
                      <h3 className="font-medium">{room.name}</h3>
                      <StatusBadge status={room.status} />
                    </div>
                    {tenancy ? (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1.5">
                        <Users className="w-3 h-3" />
                        <span>{tenancy.tenant_name || tenancy.tenant_email}</span>
                        <span className="text-muted-foreground">· ${tenancy.rent_amount}/{tenancy.rent_frequency}</span>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-1.5">No tenant assigned</p>
                    )}
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}