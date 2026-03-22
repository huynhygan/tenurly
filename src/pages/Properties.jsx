import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { Link } from 'react-router-dom';
import { Plus, Building2, MapPin, DoorOpen, Users, DollarSign, ChevronRight } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import BottomSheet from '@/components/BottomSheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import EmptyState from '@/components/EmptyState';

export default function Properties() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', address: '', city: '', state: '', postcode: '', type: 'house' });

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.filter({ landlord_id: user?.id }),
  });

  const { data: rooms = [] } = useQuery({
    queryKey: ['rooms'],
    queryFn: () => base44.entities.Room.list(),
  });

  const { data: tenancies = [] } = useQuery({
    queryKey: ['tenancies'],
    queryFn: () => base44.entities.Tenancy.filter({ landlord_id: user?.id, status: 'active' }),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Property.create({ ...data, landlord_id: user?.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      setOpen(false);
      setForm({ name: '', address: '', city: '', state: '', postcode: '', type: 'house' });
    },
  });

  const getRoomCount = (propId) => rooms.filter(r => r.property_id === propId).length;
  const getOccupied = (propId) => rooms.filter(r => r.property_id === propId && r.status === 'occupied').length;
  const getWeeklyRent = (propId) => {
    return tenancies
      .filter(t => t.property_id === propId)
      .reduce((sum, t) => {
        const amt = t.rent_amount || 0;
        if (t.rent_frequency === 'monthly') return sum + Math.round(amt * 12 / 52);
        if (t.rent_frequency === 'fortnightly') return sum + Math.round(amt / 2);
        return sum + amt; // weekly
      }, 0);
  };

  const typeLabel = (type) => type?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || '';

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <h1 className="text-2xl font-bold">Properties</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="w-4 h-4" /> Add Property
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Add Property</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(form); }} className="space-y-3">
              <div><Label>Property Name</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. 42 Smith Street" required /></div>
              <div><Label>Address</Label><Input value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Full street address" required /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>City</Label><Input value={form.city} onChange={e => setForm({...form, city: e.target.value})} /></div>
                <div><Label>State</Label><Input value={form.state} onChange={e => setForm({...form, state: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>Postcode</Label><Input value={form.postcode} onChange={e => setForm({...form, postcode: e.target.value})} /></div>
                <div>
                  <Label>Type</Label>
                  <BottomSheet
                    value={form.type}
                    onValueChange={v => setForm({...form, type: v})}
                    options={[
                      { value: 'house', label: 'House' },
                      { value: 'apartment', label: 'Apartment' },
                      { value: 'unit', label: 'Unit' },
                      { value: 'townhouse', label: 'Townhouse' },
                      { value: 'share_house', label: 'Share House' },
                      { value: 'other', label: 'Other' },
                    ]}
                    label="Select Type"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create Property'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary strip */}
      {properties.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {properties.length} {properties.length === 1 ? 'property' : 'properties'} · {tenancies.length} active tenancies
        </p>
      )}

      {/* List */}
      {properties.length === 0 && !isLoading && (
        <EmptyState
          icon={Building2}
          title="No properties yet"
          description="Add your first rental property to get started"
          action={
            <Button size="sm" onClick={() => setOpen(true)} className="gap-1.5">
              <Plus className="w-4 h-4" /> Add Property
            </Button>
          }
        />
      )}

      <div className="space-y-3">
        {properties.map(p => {
          const totalRooms = getRoomCount(p.id);
          const occupied = getOccupied(p.id);
          const weeklyRent = getWeeklyRent(p.id);
          const occupancyPct = totalRooms > 0 ? Math.round((occupied / totalRooms) * 100) : 0;

          return (
            <Link key={p.id} to={`/properties/${p.id}`}>
              <Card className="p-4 hover:shadow-md active:scale-[0.99] transition-all duration-150">
                {/* Top row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm leading-tight truncate">{p.name}</h3>
                      <div className="flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
                        <span className="text-xs text-muted-foreground truncate">{p.address}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                </div>

                {/* Divider */}
                <div className="border-t border-border mt-3 mb-3" />

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex items-center gap-1.5">
                    <DoorOpen className="w-3.5 h-3.5 text-muted-foreground" />
                    <div>
                      <p className="text-xs font-semibold leading-none">{totalRooms}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Rooms</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-muted-foreground" />
                    <div>
                      <p className="text-xs font-semibold leading-none">{occupied}/{totalRooms}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Occupied</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
                    <div>
                      <p className="text-xs font-semibold leading-none">${weeklyRent.toLocaleString()}/wk</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Rent</p>
                    </div>
                  </div>
                </div>

                {/* Occupancy bar */}
                {totalRooms > 0 && (
                  <div className="mt-3">
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${occupancyPct}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">{occupancyPct}% occupancy · {typeLabel(p.type)}</p>
                  </div>
                )}
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}