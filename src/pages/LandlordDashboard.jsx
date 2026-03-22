import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { AlertTriangle, CalendarClock, CheckCircle2, DollarSign, MessageCircle, TrendingDown, TrendingUp, Wrench } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Card } from '@/components/ui/card';
import StatusBadge from '@/components/StatusBadge';
import { isOpenMaintenance, leaseSummary, money, normalizeCharge, normalizeExpense, normalizeMaintenance, normalizeTenancy, normalizeChat, prettyDate } from '@/lib/propertyApp';
import { startOfMonth } from 'date-fns';

function Metric({ icon: Icon, label, value, tone = 'slate' }) {
  const tones = {
    amber: 'bg-amber-50 text-amber-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    red: 'bg-red-50 text-red-700',
    blue: 'bg-blue-50 text-blue-700',
    slate: 'bg-slate-100 text-slate-700',
  };
  return (
    <Card className="min-w-[155px] rounded-3xl p-4 shadow-sm">
      <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-2xl ${tones[tone] || tones.slate}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </Card>
  );
}

function Section({ title, action, children }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700">{title}</h2>
        {action}
      </div>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function RowCard({ to, icon: Icon, title, subtitle, badge }) {
  const content = (
    <Card className="rounded-2xl p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100">
          <Icon className="h-4 w-4 text-slate-600" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{title}</p>
          <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
        </div>
        {badge}
      </div>
    </Card>
  );
  return to ? <Link to={to}>{content}</Link> : content;
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
    queryFn: () => base44.entities.RentCharge.list('-created_date'),
    enabled: !!user?.id,
  });

  const { data: expensesRaw = [] } = useQuery({
    queryKey: ['expenses', user?.id],
    queryFn: () => base44.entities.Expense.list('-date'),
    enabled: !!user?.id,
  });

  const { data: maintenanceRaw = [] } = useQuery({
    queryKey: ['maintenance', user?.id],
    queryFn: () => base44.entities.MaintenanceRequest.list('-created_date'),
    enabled: !!user?.id,
  });

  const { data: chatsRaw = [] } = useQuery({
    queryKey: ['chats', user?.id],
    queryFn: () => base44.entities.Chat.list('-last_message_at'),
    enabled: !!user?.id,
  });

  const tenancies = tenanciesRaw.map(normalizeTenancy);
  const propertyIds = new Set(tenancies.map(t => t.property_id));
  const charges = chargesRaw.map(normalizeCharge).filter(c => !c.property_id || propertyIds.size === 0 || propertyIds.has(c.property_id));
  const expenses = expensesRaw.map(normalizeExpense).filter(e => !e.property_id || propertyIds.size === 0 || propertyIds.has(e.property_id));
  const maintenance = maintenanceRaw.map(normalizeMaintenance).filter(m => !m.property_id || propertyIds.size === 0 || propertyIds.has(m.property_id));
  const chats = chatsRaw.map(normalizeChat).filter(c => c.participant_ids?.includes(user?.id));

  const due = charges.filter(c => ['due', 'upcoming', 'pending'].includes(c.status)).reduce((sum, c) => sum + c.amount, 0);
  const collected = charges.filter(c => ['paid', 'confirmed'].includes(c.status)).reduce((sum, c) => sum + c.amount, 0);
  const overdue = charges.filter(c => c.status === 'overdue').reduce((sum, c) => sum + c.amount, 0);
  const expensesMonth = expenses.reduce((sum, e) => sum + e.amount, 0);
  const net = collected - expensesMonth;

  const actionCharges = charges.filter(c => c.status === 'paid' || c.status === 'overdue').slice(0, 4);
  const expiring = tenancies
    .map(t => ({ ...t, lease: leaseSummary(t.lease_end) }))
    .filter(t => t.lease.days !== null && t.lease.days <= 60)
    .sort((a, b) => (a.lease.days ?? 999) - (b.lease.days ?? 999))
    .slice(0, 4);
  const openRepairs = maintenance.filter(m => isOpenMaintenance(m.status)).slice(0, 4);
  const recentMessages = chats.slice(0, 4);

  return (
    <div className="space-y-6 px-4 py-5">
      <header className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Landlord dashboard</p>
        <h1 className="text-3xl font-bold">Welcome back, {user?.full_name?.split(' ')[0] || 'Anthony'}</h1>
        <p className="text-sm text-muted-foreground">Track rent, leases, repairs and messages across your properties.</p>
      </header>

      <div className="flex gap-3 overflow-x-auto pb-1">
        <Metric icon={DollarSign} label="Rent due" value={money(due)} tone="amber" />
        <Metric icon={CheckCircle2} label="Collected" value={money(collected)} tone="emerald" />
        <Metric icon={AlertTriangle} label="Overdue" value={money(overdue)} tone="red" />
        <Metric icon={net >= 0 ? TrendingUp : TrendingDown} label="Net cashflow" value={`${net >= 0 ? '+' : '-'}${money(Math.abs(net))}`} tone="blue" />
      </div>

      <Section title="Action required" action={<Link className="text-xs font-semibold text-primary" to="/properties">View all</Link>}>
        {actionCharges.length === 0 ? <Card className="rounded-2xl p-4 text-sm text-muted-foreground">No urgent rent actions right now.</Card> : actionCharges.map((charge) => (
          <RowCard
            key={charge.id}
            to={charge.property_id ? `/properties/${charge.property_id}` : '/properties'}
            icon={charge.status === 'paid' ? CheckCircle2 : AlertTriangle}
            title={charge.status === 'paid' ? 'Payment awaiting confirmation' : 'Overdue rent'}
            subtitle={`${money(charge.amount)} · Due ${prettyDate(charge.due_date)}`}
            badge={<StatusBadge status={charge.status === 'paid' ? 'pending' : 'overdue'} label={charge.status === 'paid' ? 'Confirm' : 'Overdue'} />}
          />
        ))}
      </Section>

      <Section title="Lease expiry" action={<Link className="text-xs font-semibold text-primary" to="/lease-expiry">Open tracker</Link>}>
        {expiring.length === 0 ? <Card className="rounded-2xl p-4 text-sm text-muted-foreground">No leases expiring in the next 60 days.</Card> : expiring.map((tenancy) => (
          <RowCard
            key={tenancy.id}
            to={tenancy.room_id ? `/rooms/${tenancy.room_id}` : tenancy.property_id ? `/properties/${tenancy.property_id}` : '/lease-expiry'}
            icon={CalendarClock}
            title={tenancy.tenant_name}
            subtitle={`Ends ${prettyDate(tenancy.lease_end)}`}
            badge={<StatusBadge status={tenancy.lease.status} label={tenancy.lease.label} />}
          />
        ))}
      </Section>

      <Section title="Open repairs" action={<Link className="text-xs font-semibold text-primary" to="/maintenance">Manage</Link>}>
        {openRepairs.length === 0 ? <Card className="rounded-2xl p-4 text-sm text-muted-foreground">No open repair requests.</Card> : openRepairs.map((item) => (
          <RowCard
            key={item.id}
            to={`/maintenance/${item.id}`}
            icon={Wrench}
            title={item.title}
            subtitle={`${item.category} · ${prettyDate(item.submitted_at)}`}
            badge={<StatusBadge status={item.status} />}
          />
        ))}
      </Section>

      <Section title="Messages" action={<Link className="text-xs font-semibold text-primary" to="/messages">Inbox</Link>}>
        {recentMessages.length === 0 ? <Card className="rounded-2xl p-4 text-sm text-muted-foreground">No recent conversations yet.</Card> : recentMessages.map((chat) => (
          <RowCard
            key={chat.id}
            to={`/chat/${chat.id}`}
            icon={MessageCircle}
            title={chat.title}
            subtitle={chat.last_message || 'Open chat'}
            badge={<span className="text-[11px] font-medium text-muted-foreground">{prettyDate(chat.last_message_at, 'Recently')}</span>}
          />
        ))}
      </Section>
    </div>
  );
}