import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { Link } from 'react-router-dom';
import { Plus, Building2, MapPin, DoorOpen, Users, DollarSign, ChevronRight } from 'lucide-react';
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
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: ['properties'] });
      const prev = queryClient.getQueryData(['properties']);
      queryClient.setQueryData(['properties'], old => [...(old || []), { id: `tmp-${Date.now()}`, ...data, landlord_id: user?.id }]);
      return { prev };
    },
    onError: (_err, _vars, ctx) => queryClient.setQueryData(['properties'], ctx.prev),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      setOpen(false);
      setForm({ name: '', address: '', city: '', state: '', postcode: '', type: 'house' });
    },
  });

  const getRoomCount = (id) => rooms.filter(r => r.property_id === id).length;
  const getOccupied = (id) => rooms.filter(r => r.property_id === id && r.status === 'occupied').length;
  const getWeeklyRent = (id) => tenancies
    .filter(t => t.property_id === id)
    .reduce((sum, t) => {
      const a = t.rent_amount || 0;
      if (t.rent_frequency === 'monthly') return sum + Math.round(a * 12 / 52);
      if (t.rent_frequency === 'fortnightly') return sum + Math.round(a / 2);
      return sum + a;
    }, 0);

  const typeLabel = (type) => type?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || '';

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">Properties</h1>
          {properties.length > 0 && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {properties.length} {properties.length === 1 ? 'property' : 'properties'} · {tenancies.length} active tenancies
            </p>
          )}
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-md active:scale-95 transition-transform">
              <Plus className="w-5 h-5 text-white" />
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto rounded-3xl">
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
              <Button type="submit" className="w-full rounded-2xl" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create Property'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* List */}
      {properties.length === 0 && !isLoading && (
        <div className="px-5">
          <EmptyState
            icon={Building2}
            title="No properties yet"
            description="Add your first rental property to get started"
            action={
              <Button size="sm" onClick={() => setOpen(true)} className="gap-1.5 rounded-2xl">
                <Plus className="w-4 h-4" /> Add Property
              </Button>
            }
          />
        </div>
      )}

      <div className="px-5 space-y-3">
        {properties.map(p => {
          const totalRooms = getRoomCount(p.id);
          const occupied = getOccupied(p.id);
          const weeklyRent = getWeeklyRent(p.id);
          const pct = totalRooms > 0 ? Math.round((occupied / totalRooms) * 100) : 0;

          return (
            <Link key={p.id} to={`/properties/${p.id}`}>
              <div className="bg-white rounded-3xl p-4 shadow-sm border border-border/40 active:scale-[0.99] transition-transform">
                {/* Photo placeholder / gradient */}
                <div className="w-full h-28 rounded-2xl bg-gradient-to-br from-primary/20 to-orange-100 flex items-center justify-center mb-4 overflow-hidden">
                  {p.photo_url ? (
                    <img src={p.photo_url} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="w-10 h-10 text-primary/40" />
                  )}
                </div>

                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-base truncate">{p.name}</h3>
                    <div className="flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
                      <span className="text-xs text-muted-foreground truncate">{p.address}{p.city ? `, ${p.city}` : ''}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                </div>

                <div className="border-t border-border/40 mt-3 pt-3 grid grid-cols-3 gap-2">
                  <div className="flex items-center gap-1.5">
                    <DoorOpen className="w-3.5 h-3.5 text-muted-foreground" />
                    <div>
                      <p className="text-xs font-bold leading-none">{totalRooms}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Rooms</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-muted-foreground" />
                    <div>
                      <p className="text-xs font-bold leading-none">{occupied}/{totalRooms}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Occupied</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
                    <div>
                      <p className="text-xs font-bold leading-none">${weeklyRent.toLocaleString()}/wk</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Rent</p>
                    </div>
                  </div>
                </div>

                {totalRooms > 0 && (
                  <div className="mt-3">
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">{pct}% occupancy · {typeLabel(p.type)}</p>
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}