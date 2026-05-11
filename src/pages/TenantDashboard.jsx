import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Bell, Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { money, normalizeCharge, normalizeMaintenance, normalizeTenancy, prettyDate } from '@/lib/propertyApp';
import { format, parseISO } from 'date-fns';

function Avatar({ name }) {
  const initials = name ? name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() : '?';
  return (
    <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
      <span className="text-xs font-bold text-emerald-700">{initials}</span>
    </div>
  );
}

export default function TenantDashboard() {
  const { user } = useAuth();

  const { data: tenanciesRaw = [] } = useQuery({
    queryKey: ['tenant-tenancies', user?.id],
    queryFn: () => base44.entities.Tenancy.filter({ tenant_id: user?.id }),
    enabled: !!user?.id,
  });

  const { data: chargesRaw = [] } = useQuery({
    queryKey: ['tenant-charges', user?.id],
    queryFn: () => base44.entities.RentCharge.filter({ tenant_id: user?.id }),
    enabled: !!user?.id,
  });

  const { data: repairsRaw = [] } = useQuery({
    queryKey: ['tenant-repairs', user?.id],
    queryFn: () => base44.entities.MaintenanceRequest.filter({ tenant_id: user?.id }),
    enabled: !!user?.id,
  });

  const { data: propertiesRaw = [] } = useQuery({
    queryKey: ['properties-tenant'],
    queryFn: () => base44.entities.Property.list(),
    enabled: !!user?.id,
  });

  const tenancies = tenanciesRaw.map(normalizeTenancy);
  const tenancy = tenancies.find(t => t.status === 'active') || tenancies[0];
  const charges = chargesRaw.map(normalizeCharge);
  const repairs = repairsRaw.map(normalizeMaintenance);

  const today = new Date();
  const overdueCharges = charges.filter(c => c.status === 'overdue');
  const totalOverdue = overdueCharges.reduce((sum, c) => sum + (c.amount || 0), 0);
  const daysOverdue = overdueCharges.length > 0 && overdueCharges[0].due_date
    ? Math.max(0, Math.floor((today - new Date(overdueCharges[0].due_date)) / 86400000))
    : 0;
  const isOverdue = overdueCharges.length > 0;

  const property = propertiesRaw.find(p => p.id === tenancy?.property_id);
  const roomLabel = tenancy?.room_id ? `Room ${tenancy.room_id?.slice(-2) || ''}` : '';
  const propertyAddress = property?.address || property?.name || '';
  const subheading = [roomLabel, propertyAddress].filter(Boolean).join(' · ');

  const weeklyRent = tenancy?.rent_amount || 0;
  const bond = tenancy?.bond_amount || 0;

  // Frequency label
  const freqLabel = tenancy?.rent_frequency === 'fortnightly' ? 'due every fortnight'
    : tenancy?.rent_frequency === 'monthly' ? 'due every month'
    : 'due every Monday';

  const recentCharges = [...charges]
    .sort((a, b) => new Date(b.due_date) - new Date(a.due_date))
    .slice(0, 5);

  const openRepairs = repairs.filter(r => !['completed', 'cancelled'].includes(r.status));

  const firstName = user?.full_name?.split(' ')[0] || 'there';
  const fullName = user?.full_name || 'Tenant';

  return (
    <div className="pb-6 bg-background min-h-full">
      {/* Header */}
      <div className="px-5 pt-7 pb-4 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Hi {firstName} 👋</h1>
          {subheading ? <p className="text-sm text-muted-foreground mt-0.5">{subheading}</p> : null}
        </div>
        <Link to="/notifications">
          <div className="w-9 h-9 rounded-xl bg-white border border-border/50 flex items-center justify-center">
            <Bell size={17} className="text-foreground/70" />
          </div>
        </Link>
      </div>

      {/* Rent status card */}
      <div className="px-5 mb-5">
        <div className={`rounded-2xl p-5 border ${isOverdue ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
          <p className={`text-sm font-semibold mb-1 ${isOverdue ? 'text-red-600' : 'text-emerald-700'}`}>
            {isOverdue ? 'Rent overdue' : 'Rent current'}
          </p>
          <p className={`text-4xl font-bold mb-1 ${isOverdue ? 'text-red-600' : 'text-emerald-700'}`}>
            {isOverdue ? money(totalOverdue) : money(weeklyRent)}
          </p>
          <p className={`text-sm mb-4 ${isOverdue ? 'text-red-500' : 'text-emerald-600'}`}>
            {isOverdue ? `${daysOverdue} days overdue · ${freqLabel}` : freqLabel}
          </p>
          <Link to="/rent">
            <div className={`w-full text-center py-3 rounded-xl text-sm font-semibold text-white ${isOverdue ? 'bg-red-700' : 'bg-emerald-600'}`}>
              {isOverdue ? 'Pay now' : "I've paid →"}
            </div>
          </Link>
        </div>
      </div>

      {/* Weekly rent + Bond */}
      <div className="grid grid-cols-2 gap-3 px-5 mb-6">
        <div className="bg-white rounded-2xl p-4 border border-border/40">
          <p className="text-xs text-muted-foreground mb-1">Weekly rent</p>
          <p className="text-xl font-bold text-foreground">{money(weeklyRent)}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-border/40">
          <p className="text-xs text-muted-foreground mb-1">Bond held</p>
          <p className="text-xl font-bold text-foreground">{bond ? money(bond) : '—'}</p>
        </div>
      </div>

      {/* Recent payments */}
      <div className="px-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-foreground">Recent payments</h2>
          <Link to="/rent" className="text-sm text-primary font-medium">History</Link>
        </div>
        <div className="bg-white rounded-2xl border border-border/40 divide-y divide-border/40 overflow-hidden">
          {recentCharges.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No payment history yet</p>
          ) : recentCharges.map(c => {
            const isPaid = ['paid', 'confirmed'].includes(c.status);
            const weekLabel = c.due_date ? `Week of ${format(parseISO(c.due_date), 'd MMM')}` : '—';
            return (
              <div key={c.id} className="flex items-center gap-3 px-4 py-3.5">
                <Avatar name={fullName} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{weekLabel}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.payment_reference || 'Bank transfer'} · {isPaid ? 'Confirmed' : c.status}
                  </p>
                </div>
                <p className={`text-sm font-semibold ${isPaid ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {money(c.amount)}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* My repairs */}
      <div className="px-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-foreground">My repairs</h2>
          <Link to="/repairs" className="flex items-center gap-1 text-sm text-primary font-medium">
            <Plus size={14} />Lodge new
          </Link>
        </div>
        <div className="bg-white rounded-2xl border border-border/40 divide-y divide-border/40 overflow-hidden">
          {openRepairs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No open repairs 🎉</p>
          ) : openRepairs.map(r => {
            const dotColor = r.priority === 'urgent' || r.priority === 'high' ? 'bg-red-500'
              : r.status === 'in_progress' ? 'bg-amber-400'
              : 'bg-gray-400';
            return (
              <Link key={r.id} to={`/maintenance/${r.id}`}>
                <div className="flex items-center gap-3 px-4 py-3.5">
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${dotColor}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{r.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Lodged {prettyDate(r.submitted_at || r.created_date)} · {r.status === 'in_progress' ? 'In progress' : r.status}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}