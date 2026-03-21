import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { Link } from 'react-router-dom';
import { Plus, Building2, MapPin, ArrowRight } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import PageHeader from '@/components/PageHeader';
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

  return (
    <div>
      <PageHeader
        title="Properties"
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1"><Plus className="w-4 h-4" />Add</Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogHeader><DialogTitle>New Property</DialogTitle></DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(form); }} className="space-y-3">
                <div><Label>Name</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. 42 Smith St" required /></div>
                <div><Label>Address</Label><Input value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Full address" required /></div>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>City</Label><Input value={form.city} onChange={e => setForm({...form, city: e.target.value})} /></div>
                  <div><Label>State</Label><Input value={form.state} onChange={e => setForm({...form, state: e.target.value})} /></div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>Postcode</Label><Input value={form.postcode} onChange={e => setForm({...form, postcode: e.target.value})} /></div>
                  <div>
                    <Label>Type</Label>
                    <Select value={form.type} onValueChange={v => setForm({...form, type: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="house">House</SelectItem>
                        <SelectItem value="apartment">Apartment</SelectItem>
                        <SelectItem value="unit">Unit</SelectItem>
                        <SelectItem value="townhouse">Townhouse</SelectItem>
                        <SelectItem value="share_house">Share House</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Create Property'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />
      <div className="px-4 space-y-3 mt-2">
        {properties.length === 0 && !isLoading && (
          <EmptyState icon={Building2} title="No properties yet" description="Add your first rental property to get started" />
        )}
        {properties.map(p => (
          <Link key={p.id} to={`/properties/${p.id}`}>
            <Card className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-primary shrink-0" />
                    <h3 className="font-semibold truncate">{p.name}</h3>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{p.address}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span>{getRoomCount(p.id)} rooms</span>
                    <span>{getOccupied(p.id)} occupied</span>
                    <span className="capitalize">{p.type?.replace('_', ' ')}</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}