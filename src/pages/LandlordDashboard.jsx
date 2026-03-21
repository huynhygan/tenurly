import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { Link } from 'react-router-dom';
import { DollarSign, TrendingUp, AlertTriangle, TrendingDown, CheckCircle2, Clock, Wrench, CalendarClock, MessageCircle, ReceiptText, ChevronRight } from 'lucide-react';
import { Card } from "@/components/ui/card";
import StatusBadge from '@/components/StatusBadge';
import { differenceInDays, parseISO, isWithinInterval, startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from 'date-fns';

function SummaryCard({ icon: Icon, label, value, color = 'text-primary', bg = 'bg-primary/10' }) {
  return (
    <Card className="p-4 flex flex-col gap-2">
      <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <p className="text-xs text-muted-foreground leading-tight">{label}</p>
      <p className="text-xl font-bold text-foreground leading-none">{value}</p>
    </Card>
  );
}

function SectionHeader({ title, icon: Icon, linkTo, linkLabel = 'See all' }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      </div>
      {linkTo && (
        <Link to={linkTo} className="text-xs text-primary font-medium flex items-center gap-0.5">
          {linkLabel} <ChevronRight className="w-3 h-3" />
        </Link>
      )}
    </div>
  );
}

function ListRow({ to, left, right, sub }) {
  return (
    <Link to={to} className="flex items-center justify-between py-3 border-b border-border last:border-0 hover:bg-muted/40 -mx-4 px-4 transition-colors">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground truncate">{left}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5 truncate">{sub}</p>}
      </div>
      <div className="flex items-center gap-2 shrink-0 ml-3">{right}</div>
    </Link>
  );
}

export default function LandlordDashboard() {
  const { user } = useAuth();
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

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

  // Summary calculations
  const inWeek = (dateStr) => {
    if (!dateStr) return false;
    try { return isWithinInterval(parseISO(dateStr), { start: weekStart, end: weekEnd }); } catch { return false; }
  };
  const inMonth = (dateStr) => {
    if (!dateStr) return false;
    try { return isWithinInterval(parseISO(dateStr), { start: monthStart, end: monthEnd }); } catch { return false; }
  };

  const rentDueThisWeek = rentCharges
    .filter(r => ['due', 'upcoming'].includes(r.status) && inWeek(r.due_date))
    .reduce((s, r) => s + (r.amount || 0), 0);

  const rentCollectedThisWeek = rentCharges
    .filter(r => ['paid', 'confirmed'].includes(r.status) && inWeek(r.paid_date || r.due_date))
    .reduce((s, r) => s + (r.amount || 0), 0);

  const overdueTotal = rentCharges
    .filter(r => r.status === 'overdue')
    .reduce((s, r) => s + (r.amount || 0), 0);

  const monthlyIncome = rentCharges
    .filter(r => ['paid', 'confirmed'].includes(r.status) && inMonth(r.due_date))
    .reduce((s, r) => s + (r.amount || 0), 0);
  const monthlyExpenses = expenses
    .filter(e => inMonth(e.date))
    .reduce((s, e) => s + (e.amount || 0), 0);
  const netCashflow = monthlyIncome - monthlyExpenses;

  // Sections
  const awaitingConfirmation = rentCharges.filter(r => r.status === 'paid');
  const overdueCharges = rentCharges.filter(r => r.status === 'overdue');

  const expiringLeases = tenancies
    .filter(t => {
      if (!t.lease_end || t.status !== 'active') return false;
      const days = differenceInDays(parseISO(t.lease_end), now);
      return days >= 0 && days <= 60;
    })
    .sort((a, b) => new Date(a.lease_end) - new Date(b.lease_end));

  const openMaintenance = maintenanceRequests
    .filter(m => ['open', 'in_progress'].includes(m.status))
    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 4);

  const myChats = chats
    .filter(c => c.participant_ids?.includes(user?.id))
    .slice(0, 4);

  const fmt$ = (n) => `$${(n || 0).toLocaleString()}`;

  return (
    <div className="p-4 space-y-5 pb-6">
      {/* Header */}
      <div className="pt-2">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{format(now, 'EEEE, d MMMM')}</p>
        <h1 className="text-2xl font-bold mt-0.5">Dashboard</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <SummaryCard icon={DollarSign} label="Rent Due This Week" value={fmt$(rentDueThisWeek)} bg="bg-amber-50" color="text-amber-600" />
        <SummaryCard icon={TrendingUp} label="Collected This Week" value={fmt$(rentCollectedThisWeek)} bg="bg-emerald-50" color="text-emerald-600" />
        <SummaryCard icon={AlertTriangle} label="Overdue Rent" value={fmt$(overdueTotal)} bg="bg-red-50" color="text-red-500" />
        <SummaryCard
          icon={netCashflow >= 0 ? TrendingUp : TrendingDown}
          label="Net Cashflow (Month)"
          value={(netCashflow >= 0 ? '+' : '') + fmt$(netCashflow)}
          bg={netCashflow >= 0 ? 'bg-primary/10' : 'bg-red-50'}
          color={netCashflow >= 0 ? 'text-primary' : 'text-red-500'}
        />
      </div>

      {/* Awaiting Confirmation */}
      {awaitingConfirmation.length > 0 && (
        <Card className="p-4">
          <SectionHeader title="Awaiting Confirmation" icon={CheckCircle2} />
          {awaitingConfirmation.slice(0, 4).map(r => (
            <ListRow
              key={r.id}
              to={`/properties/${r.property_id}/rent-ledger`}
              left={r.tenant_id || 'Tenant'}
              sub={`Due ${r.due_date} · ${fmt$(r.amount)}`}
              right={<StatusBadge status="paid" label="Confirm Pending" />}
            />
          ))}
        </Card>
      )}

      {/* Overdue Tenants */}
      {overdueCharges.length > 0 && (
        <Card className="p-4">
          <SectionHeader title="Overdue Tenants" icon={AlertTriangle} />
          {overdueCharges.slice(0, 4).map(r => (
            <ListRow
              key={r.id}
              to={`/properties/${r.property_id}/rent-ledger`}
              left={r.tenant_id || 'Tenant'}
              sub={`Overdue since ${r.due_date}`}
              right={<>
                <span className="text-sm font-semibold text-red-500">{fmt$(r.amount)}</span>
                <StatusBadge status="overdue" />
              </>}
            />
          ))}
        </Card>
      )}

      {/* Expiring Leases */}
      {expiringLeases.length > 0 && (
        <Card className="p-4">
          <SectionHeader title="Leases Expiring Soon" icon={CalendarClock} linkTo="/lease-expiry" />
          {expiringLeases.slice(0, 4).map(t => {
            const days = differenceInDays(parseISO(t.lease_end), now);
            return (
              <ListRow
                key={t.id}
                to={`/properties/${t.property_id}`}
                left={t.tenant_name || t.tenant_email}
                sub={`Ends ${t.lease_end}`}
                right={<StatusBadge status="expiring_soon" label={`${days}d left`} />}
              />
            );
          })}
        </Card>
      )}

      {/* Open Maintenance */}
      {openMaintenance.length > 0 && (
        <Card className="p-4">
          <SectionHeader title="Open Maintenance" icon={Wrench} linkTo="/maintenance" />
          {openMaintenance.slice(0, 4).map(m => (
            <ListRow
              key={m.id}
              to={`/maintenance/${m.id}`}
              left={m.title}
              sub={m.description}
              right={<StatusBadge status={m.status} />}
            />
          ))}
        </Card>
      )}

      {/* Recent Expenses */}
      {recentExpenses.length > 0 && (
        <Card className="p-4">
          <SectionHeader title="Recent Expenses" icon={ReceiptText} />
          {recentExpenses.map(e => (
            <ListRow
              key={e.id}
              to={`/properties/${e.property_id}/expenses`}
              left={e.description || e.category}
              sub={e.date}
              right={<span className="text-sm font-medium text-red-500">-{fmt$(e.amount)}</span>}
            />
          ))}
        </Card>
      )}

      {/* Recent Messages */}
      {myChats.length > 0 && (
        <Card className="p-4">
          <SectionHeader title="Recent Messages" icon={MessageCircle} linkTo="/messages" />
          {myChats.map(c => (
            <ListRow
              key={c.id}
              to={`/chat/${c.id}`}
              left={c.name || 'Chat'}
              sub={c.last_message || 'No messages yet'}
              right={<ChevronRight className="w-4 h-4 text-muted-foreground" />}
            />
          ))}
        </Card>
      )}

      {/* Empty state if nothing to show */}
      {awaitingConfirmation.length === 0 && overdueCharges.length === 0 && expiringLeases.length === 0 && openMaintenance.length === 0 && recentExpenses.length === 0 && myChats.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground text-sm">All caught up! No pending items.</p>
        </Card>
      )}
    </div>
  );
}