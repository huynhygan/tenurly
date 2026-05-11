import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { CalendarClock, CreditCard, FileText, MessageCircle, Wrench, ChevronRight, CheckCircle2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import StatusBadge from '@/components/StatusBadge';
import { leaseSummary, money, normalizeCharge, normalizeMaintenance, normalizeTenancy, prettyDate } from '@/lib/propertyApp';

function QuickLink({ to, icon: Icon, label, iconBg }) {
  return (
    <Link to={to}>
      <div className="bg-white rounded-3xl p-4 flex flex-col items-center gap-2 border border-border/40 shadow-sm active:scale-95 transition-transform">
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${iconBg}`}>
          <Icon size={20} className="text-foreground/70" />
        </div>
        <span className="text-xs font-semibold text-foreground">{label}</span>
      </div>
    </Link>
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

  const tenancies = tenanciesRaw.map(normalizeTenancy);
  const tenancy = tenancies.find(t => t.status === 'active') || tenancies[0];
  const charges = chargesRaw.map(normalizeCharge);
  const repairs = repairsRaw.map(normalizeMaintenance);

  const today = new Date();
  const nextDue = charges
    .filter(c => ['upcoming', 'due', 'pending', 'overdue'].includes(c.status))
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))[0];
  const overdueCharges = charges.filter(c => c.status === 'overdue');
  const totalOverdue = overdueCharges.reduce((sum, c) => sum + (c.amount || 0), 0);
  const daysOverdue = nextDue?.status === 'overdue' && nextDue.due_date
    ? Math.max(0, Math.floor((today - new Date(nextDue.due_date)) / 86400000))
    : 0;
  const isCurrent = overdueCharges.length === 0;
  const lease = leaseSummary(tenancy?.lease_end);
  const openRepairs = repairs.filter(r => !['completed', 'cancelled'].includes(r.status)).length;
  const recentCharges = charges.sort((a,b) => new Date(b.due_date) - new Date(a.due_date)).slice(0, 5);

  const firstName = user?.full_name?.split(' ')[0] || 'there';

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">roomflo</p>
        <h1 className="text-2xl font-extrabold text-foreground">Hi, {firstName} 👋</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {tenancy ? `${tenancy.tenant_email ? '' : ''}Your rental summary` : 'Welcome to your rental home.'}
        </p>
      </div>

      {/* Prominent rent status card */}
      <div className="px-5 mb-5">
        <div className={`rounded-3xl p-5 shadow-lg text-white ${
          !isCurrent
            ? 'bg-gradient-to-br from-red-500 to-red-400'
            : nextDue?.status === 'paid'
            ? 'bg-gradient-to-br from-emerald-500 to-emerald-400'
            : 'bg-gradient-to-br from-emerald-500 to-emerald-400'
        }`}>
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-2.5 h-2.5 rounded-full ${isCurrent ? 'bg-white' : 'bg-red-200'} animate-pulse`} />
            <p className="text-xs font-bold uppercase tracking-wider opacity-90">
              {!isCurrent ? 'Rent overdue' : 'Rent current'}
            </p>
          </div>
          <p className="text-4xl font-extrabold mt-1">
            {!isCurrent ? money(totalOverdue) : (nextDue ? money(nextDue.amount) : '—')}
          </p>
          {!isCurrent ? (
            <div className="flex items-center justify-between mt-4">
              <div>
                <p className="text-xs opacity-70">Days overdue</p>
                <p className="font-bold text-lg">{daysOverdue} day{daysOverdue !== 1 ? 's' : ''}</p>
              </div>
              <div className="w-px bg-white/20 self-stretch" />
              <div>
                <p className="text-xs opacity-70">Outstanding</p>
                <p className="font-bold text-lg">{money(totalOverdue)}</p>
              </div>
              <Link to="/rent">
                <div className="bg-white/25 px-4 py-2 rounded-2xl text-sm font-bold">Pay now →</div>
              </Link>
            </div>
          ) : (
            <div className="flex items-center justify-between mt-4">
              <div>
                <p className="text-xs opacity-70">Next due</p>
                <p className="font-bold">{prettyDate(nextDue?.due_date, 'Not scheduled')}</p>
              </div>
              {nextDue && (
                <Link to="/rent">
                  <div className="bg-white/20 px-4 py-2 rounded-2xl text-sm font-bold">
                    {['upcoming', 'due'].includes(nextDue?.status) ? "I've paid →" : 'View'}
                  </div>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 px-5 mb-5">
        <div className="bg-white rounded-3xl p-4 border border-border/40 shadow-sm">
          <div className="w-9 h-9 rounded-2xl bg-violet-50 flex items-center justify-center mb-3">
            <CalendarClock size={18} className="text-violet-500" />
          </div>
          <p className="text-xs text-muted-foreground font-medium">Lease expiry</p>
          <p className="text-xl font-bold mt-0.5 text-foreground">{lease.days === null ? '—' : `${lease.days}d`}</p>
          <div className="mt-2"><StatusBadge status={lease.status} label={lease.label} /></div>
        </div>
        <div className="bg-white rounded-3xl p-4 border border-border/40 shadow-sm">
          <div className="w-9 h-9 rounded-2xl bg-amber-50 flex items-center justify-center mb-3">
            <Wrench size={18} className="text-amber-500" />
          </div>
          <p className="text-xs text-muted-foreground font-medium">Open repairs</p>
          <p className="text-xl font-bold mt-0.5 text-foreground">{openRepairs}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            {openRepairs === 0 ? 'All clear ✅' : 'In progress'}
          </p>
        </div>
      </div>

      {/* Quick links */}
      <div className="px-5 mb-6">
        <h2 className="text-base font-bold mb-3">Quick access</h2>
        <div className="grid grid-cols-4 gap-3">
          <QuickLink to="/rent" icon={CreditCard} label="Payments" iconBg="bg-primary/10" />
          <QuickLink to="/repairs" icon={Wrench} label="Repairs" iconBg="bg-amber-50" />
          <QuickLink to="/messages" icon={MessageCircle} label="Messages" iconBg="bg-blue-50" />
          <QuickLink to="/documents" icon={FileText} label="Documents" iconBg="bg-violet-50" />
        </div>
      </div>

      {/* Recent payments */}
      {recentCharges.length > 0 && (
        <div className="px-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold">Recent payments</h2>
            <Link to="/rent" className="text-xs font-semibold text-primary flex items-center gap-0.5">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {recentCharges.map(c => (
              <div key={c.id} className="bg-white rounded-2xl px-4 py-3 border border-border/40 shadow-sm flex items-center gap-3">
                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center ${['paid', 'confirmed'].includes(c.status) ? 'bg-emerald-50' : 'bg-amber-50'}`}>
                  <CheckCircle2 size={16} className={['paid', 'confirmed'].includes(c.status) ? 'text-emerald-500' : 'text-amber-500'} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{money(c.amount)}</p>
                  <p className="text-xs text-muted-foreground">Due {prettyDate(c.due_date)}</p>
                </div>
                <StatusBadge status={c.status} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}