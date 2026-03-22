import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { Link } from 'react-router-dom';
import {
  DollarSign, TrendingUp, TrendingDown, AlertTriangle,
  Wrench, CalendarClock, MessageCircle, ChevronRight,
  CheckCircle2, Clock, Bell
} from 'lucide-react';
import { Card } from "@/components/ui/card";
import StatusBadge from '@/components/StatusBadge';
import {
  differenceInDays, parseISO,
  startOfMonth, endOfMonth, isWithinInterval, format
} from 'date-fns';

// ── Horizontal scroll metric card ────────────────────────────────────────────
function MetricCard({ icon: Icon, label, value, sub, iconBg, iconColor, valueColor = 'text-foreground' }) {
  return (
    <div className="flex-shrink-0 w-36 rounded-2xl bg-card border border-border p-4 flex flex-col gap-3 shadow-sm">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg}`}>
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
      <div>
        <p className={`text-xl font-bold leading-none ${valueColor}`}>{value}</p>
        {sub && <p className="text-[11px] text-muted-foreground mt-1">{sub}</p>}
      </div>
      <p className="text-[11px] font-medium text-muted-foreground leading-tight">{label}</p>
    </div>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({ title, icon: Icon, linkTo, children }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">{title}</h2>
        </div>
        {linkTo && (
          <Link to={linkTo} className="flex items-center gap-0.5 text-xs text-primary font-medium">
            See all <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
      <Card className="divide-y divide-border overflow-hidden">
        {children}
      </Card>
    </div>
  );
}

// ── Row inside a section card ─────────────────────────────────────────────────
function Row({ to, avatar, title, sub, right }) {
  const inner = (
    <div className="flex items-center gap-3 px-4 py-3.5 hover:bg-muted/40 active:bg-muted/60 transition-colors">
      {avatar && (
        <div className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center bg-muted">
          {avatar}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground truncate">{title}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5 truncate">{sub}</p>}
      </div>
      <div className="shrink-0 flex items-center gap-2">{right}</div>
    </div>
  );
  return to ? <Link to={to}>{inner}</Link> : inner;
}

// ── Main component ────────────────────────────────────────────────────────────
export default function LandlordDashboard() {
  const { user } = useAuth();
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const inMonth = (d) => {
    if (!d) return false;
    try { return isWithinInterval(parseISO(d), { start: monthStart, end: monthEnd }); } catch { return false; }
  };

  const { data: rentCharges = [] } = useQuery({
    queryKey: ['rentCharges'],
    queryFn: () => base44.entities.RentCharge.filter({ landlord_id: user?.id }),
  });

  const { data: tenancies = [] } = useQuery({
    queryKey: ['tenancies'],
    queryFn: () => base44.entities.Tenancy.filter({ landlord_id: user?.id }),
  });

  const { data: maintenanceRequests = [] } = useQuery({
    queryKey: ['maintenanceRequests'],
    queryFn: () => base44.entities.MaintenanceRequest.filter({ landlord_id: user?.id }),
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses'],
    queryFn: () => base44.entities.Expense.filter({ landlord_id: user?.id }),
  });

  const { data: chats = [] } = useQuery({
    queryKey: ['chats'],
    queryFn: () => base44.entities.Chat.list('-last_message_at', 20),
  });

  // Metrics
  const rentDue = rentCharges.filter(r => ['due', 'overdue'].includes(r.status)).reduce((s, r) => s + (r.amount || 0), 0);
  const collected = rentCharges.filter(r => ['paid', 'confirmed'].includes(r.status) && inMonth(r.due_date)).reduce((s, r) => s + (r.amount || 0), 0);
  const overdue = rentCharges.filter(r => r.status === 'overdue').reduce((s, r) => s + (r.amount || 0), 0);
  const income = rentCharges.filter(r => ['paid', 'confirmed'].includes(r.status) && inMonth(r.due_date)).reduce((s, r) => s + (r.amount || 0), 0);
  const expenseTotal = expenses.filter(e => inMonth(e.date)).reduce((s, e) => s + (e.amount || 0), 0);
  const net = income - expenseTotal;

  const fmt = (n) => `$${Math.abs(n || 0).toLocaleString()}`;

  // Sections data
  const actionItems = [
    ...rentCharges.filter(r => r.status === 'paid').map(r => ({ type: 'confirm', r })),
    ...rentCharges.filter(r => r.status === 'overdue').map(r => ({ type: 'overdue', r })),
  ];

  const expiringLeases = tenancies
    .filter(t => {
      if (!t.lease_end || t.status !== 'active') return false;
      const d = differenceInDays(parseISO(t.lease_end), now);
      return d >= 0 && d <= 60;
    })
    .sort((a, b) => new Date(a.lease_end) - new Date(b.lease_end));

  const openMaintenance = maintenanceRequests
    .filter(m => ['open', 'in_progress'].includes(m.status))
    .sort((a, b) => {
      const p = { urgent: 0, high: 1, medium: 2, low: 3 };
      return (p[a.priority] ?? 2) - (p[b.priority] ?? 2);
    });

  const myChats = chats.filter(c => c.participant_ids?.includes(user?.id)).slice(0, 5);

  const priorityColor = { urgent: 'text-red-500', high: 'text-orange-500', medium: 'text-amber-500', low: 'text-blue-400' };
  const priorityBg = { urgent: 'bg-red-50', high: 'bg-orange-50', medium: 'bg-amber-50', low: 'bg-blue-50' };

  return (
    <div className="pb-8 space-y-6">

      {/* ── Header ── */}
      <div className="px-4 pt-5 pb-1 flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground font-medium tracking-wide uppercase">
            {format(now, 'EEEE, d MMMM')}
          </p>
          <h1 className="text-2xl font-bold mt-0.5">
            Hi, {user?.full_name?.split(' ')[0] || 'there'} 👋
          </h1>
        </div>
        <Link to="/notifications">
          <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center mt-1">
            <Bell className="w-4 h-4 text-muted-foreground" />
          </div>
        </Link>
      </div>

      {/* ── Metric cards — horizontal scroll ── */}
      <div className="flex gap-3 overflow-x-auto px-4 pb-1 scrollbar-hide">
        <MetricCard
          icon={DollarSign}
          label="Rent Due"
          value={fmt(rentDue)}
          sub="Outstanding"
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          valueColor="text-amber-700"
        />
        <MetricCard
          icon={CheckCircle2}
          label="Collected"
          value={fmt(collected)}
          sub="This month"
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          valueColor="text-emerald-700"
        />
        <MetricCard
          icon={AlertTriangle}
          label="Overdue"
          value={fmt(overdue)}
          sub={overdue > 0 ? 'Action needed' : 'All clear'}
          iconBg={overdue > 0 ? 'bg-red-50' : 'bg-muted'}
          iconColor={overdue > 0 ? 'text-red-500' : 'text-muted-foreground'}
          valueColor={overdue > 0 ? 'text-red-600' : 'text-foreground'}
        />
        <MetricCard
          icon={net >= 0 ? TrendingUp : TrendingDown}
          label="Net Cashflow"
          value={(net >= 0 ? '+' : '-') + fmt(net)}
          sub="This month"
          iconBg={net >= 0 ? 'bg-primary/10' : 'bg-red-50'}
          iconColor={net >= 0 ? 'text-primary' : 'text-red-500'}
          valueColor={net >= 0 ? 'text-primary' : 'text-red-600'}
        />
      </div>

      <div className="px-4 space-y-5">

        {/* ── Action Required ── */}
        {actionItems.length > 0 && (
          <Section title="Action Required" icon={Clock}>
            {actionItems.slice(0, 5).map(({ type, r }) => (
              <Row
                key={r.id}
                to={`/properties/${r.property_id}/rent-ledger`}
                avatar={
                  type === 'confirm'
                    ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    : <AlertTriangle className="w-4 h-4 text-red-500" />
                }
                title={type === 'confirm' ? 'Payment to confirm' : 'Overdue rent'}
                sub={`Due ${r.due_date} · $${(r.amount || 0).toLocaleString()}`}
                right={
                  <StatusBadge
                    status={type === 'confirm' ? 'paid' : 'overdue'}
                    label={type === 'confirm' ? 'Confirm' : 'Overdue'}
                  />
                }
              />
            ))}
          </Section>
        )}

        {/* ── Leases Expiring ── */}
        {expiringLeases.length > 0 && (
          <Section title="Leases Expiring Soon" icon={CalendarClock} linkTo="/lease-expiry">
            {expiringLeases.slice(0, 4).map(t => {
              const days = differenceInDays(parseISO(t.lease_end), now);
              return (
                <Row
                  key={t.id}
                  to={`/properties/${t.property_id}`}
                  avatar={<CalendarClock className="w-4 h-4 text-amber-500" />}
                  title={t.tenant_name || t.tenant_email}
                  sub={`Expires ${format(parseISO(t.lease_end), 'd MMM yyyy')}`}
                  right={
                    <StatusBadge
                      status="expiring_soon"
                      label={days === 0 ? 'Today' : `${days}d`}
                    />
                  }
                />
              );
            })}
          </Section>
        )}

        {/* ── Maintenance ── */}
        {openMaintenance.length > 0 && (
          <Section title="Maintenance Requests" icon={Wrench} linkTo="/maintenance">
            {openMaintenance.slice(0, 4).map(m => (
              <Row
                key={m.id}
                to={`/maintenance/${m.id}`}
                avatar={
                  <Wrench className={`w-4 h-4 ${priorityColor[m.priority] || 'text-muted-foreground'}`} />
                }
                title={m.title}
                sub={m.description}
                right={
                  <div className="flex items-center gap-1.5">
                    <StatusBadge status={m.priority} />
                    <StatusBadge status={m.status} />
                  </div>
                }
              />
            ))}
          </Section>
        )}

        {/* ── Messages ── */}
        {myChats.length > 0 && (
          <Section title="Messages" icon={MessageCircle} linkTo="/messages">
            {myChats.map(c => (
              <Row
                key={c.id}
                to={`/chat/${c.id}`}
                avatar={<MessageCircle className="w-4 h-4 text-primary" />}
                title={c.name || 'Chat'}
                sub={c.last_message || 'No messages yet'}
                right={<ChevronRight className="w-4 h-4 text-muted-foreground" />}
              />
            ))}
          </Section>
        )}

        {/* ── All clear ── */}
        {actionItems.length === 0 && expiringLeases.length === 0 && openMaintenance.length === 0 && myChats.length === 0 && (
          <Card className="p-10 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground">All caught up!</p>
            <p className="text-xs text-muted-foreground mt-1">No pending items right now.</p>
          </Card>
        )}

      </div>
    </div>
  );
}