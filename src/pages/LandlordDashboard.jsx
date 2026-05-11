import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Bell, Settings, DollarSign, Home, Wrench, FileText, Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { money, normalizeCharge, normalizeExpense, normalizeMaintenance, normalizeTenancy, prettyDate } from '@/lib/propertyApp';
import NeedsAttentionFeed from '@/components/NeedsAttentionFeed';
import { differenceInDays, parseISO } from 'date-fns';

function StatCard({ label, value, valueClass = 'text-foreground' }) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-border/40">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className={`text-2xl font-bold ${valueClass}`}>{value}</p>
    </div>
  );
}

function QuickActionBtn({ icon: Icon, label, to, onClick }) {
  const cls = "flex items-center gap-2.5 px-4 py-3.5 bg-white border border-border/50 rounded-2xl text-sm font-medium text-foreground active:scale-95 transition-transform";
  const inner = <><Icon size={18} className="text-muted-foreground shrink-0" />{label}</>;
  if (to) return <Link to={to} className={cls}>{inner}</Link>;
  return <button onClick={onClick} className={cls}>{inner}</button>;
}

export default function LandlordDashboard() {
  const { user } = useAuth();

  const { data: tenanciesRaw = [] } = useQuery({
    queryKey: ['landlord-tenancies', user?.id],
    queryFn: () => base44.entities.Tenancy.filter({ landlord_id: user?.id }),
    enabled: !!user?.id,
  });

  const { data: chargesRaw = [] } = useQuery({
    queryKey: ['landlord-charges', user?.id],
    queryFn: () => base44.entities.RentCharge.filter({ landlord_id: user?.id }),
    enabled: !!user?.id,
  });

  const { data: maintenanceRaw = [] } = useQuery({
    queryKey: ['maintenance', user?.id],
    queryFn: () => base44.entities.MaintenanceRequest.filter({ landlord_id: user?.id }),
    enabled: !!user?.id,
  });

  const { data: roomsRaw = [] } = useQuery({
    queryKey: ['rooms-all', user?.id],
    queryFn: () => base44.entities.Room.list(),
    enabled: !!user?.id,
  });

  const tenancies = tenanciesRaw.map(normalizeTenancy);
  const charges = chargesRaw.map(normalizeCharge);
  const maintenance = maintenanceRaw.map(normalizeMaintenance);

  // Stats
  const activeTenancies = tenancies.filter(t => t.status === 'active');
  const totalRooms = roomsRaw.length;
  const occupiedRooms = activeTenancies.length;
  const weeklyIncome = activeTenancies.reduce((sum, t) => sum + (t.rent_amount || 0), 0);
  const overdueRooms = charges.filter(c => c.status === 'overdue');
  const overdueRoomsCount = [...new Set(overdueRooms.map(c => c.room_id))].length;
  const openRepairs = maintenance.filter(m => !['completed', 'cancelled'].includes(m.status)).length;

  const firstName = user?.full_name?.split(' ')[0] || 'there';

  return (
    <div className="pb-6 bg-background min-h-full">
      {/* Header */}
      <div className="px-5 pt-7 pb-4 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Landlordly</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Good morning, {firstName}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/notifications">
            <div className="w-9 h-9 rounded-xl bg-white border border-border/50 flex items-center justify-center">
              <Bell size={17} className="text-foreground/70" />
            </div>
          </Link>
          <Link to="/settings">
            <div className="w-9 h-9 rounded-xl bg-white border border-border/50 flex items-center justify-center">
              <Settings size={17} className="text-foreground/70" />
            </div>
          </Link>
        </div>
      </div>

      {/* 2×2 Stats grid */}
      <div className="grid grid-cols-2 gap-3 px-5 mb-6">
        <StatCard
          label="Occupied rooms"
          value={totalRooms > 0 ? `${occupiedRooms} / ${totalRooms}` : `${occupiedRooms}`}
          valueClass="text-emerald-600"
        />
        <StatCard
          label="Weekly income"
          value={money(weeklyIncome)}
        />
        <StatCard
          label="Rent overdue"
          value={`${overdueRoomsCount} room${overdueRoomsCount !== 1 ? 's' : ''}`}
          valueClass={overdueRoomsCount > 0 ? 'text-red-500' : 'text-emerald-600'}
        />
        <StatCard
          label="Open repairs"
          value={String(openRepairs)}
        />
      </div>

      {/* Needs attention */}
      <div className="px-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-foreground">Needs attention</h2>
          <Link to="/maintenance" className="text-sm text-primary font-medium">See all</Link>
        </div>
        <NeedsAttentionFeed
          charges={charges}
          maintenance={maintenance}
          tenancies={activeTenancies}
        />
      </div>

      {/* Quick actions */}
      <div className="px-5">
        <h2 className="text-base font-semibold text-foreground mb-3">Quick actions</h2>
        <div className="grid grid-cols-2 gap-3">
          <QuickActionBtn icon={Plus} label="Log payment" to="/properties" />
          <QuickActionBtn icon={Home} label="Vacancy board" to="/properties" />
          <QuickActionBtn icon={Wrench} label="New repair" to="/maintenance" />
          <QuickActionBtn icon={FileText} label="New agreement" to="/properties" />
        </div>
      </div>
    </div>
  );
}