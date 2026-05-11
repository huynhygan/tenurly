import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { AlertTriangle, CalendarClock, CheckCircle2, DollarSign, MessageCircle, TrendingUp, TrendingDown, Wrench, BarChart2, ChevronRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import StatusBadge from '@/components/StatusBadge';
import { isOpenMaintenance, leaseSummary, money, normalizeCharge, normalizeExpense, normalizeMaintenance, normalizeTenancy, normalizeChat, prettyDate } from '@/lib/propertyApp';
import NeedsAttentionFeed from '@/components/NeedsAttentionFeed';
import QuickActions from '@/components/QuickActions';
import DashboardCalendar from '@/components/DashboardCalendar';

function MetricCard({ icon: Icon, label, value, tone = 'slate' }) {
  const tones = {
    amber: { bg: 'bg-amber-50', icon: 'text-amber-500', value: 'text-amber-700' },
    emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-500', value: 'text-emerald-700' },
    red: { bg: 'bg-red-50', icon: 'text-red-500', value: 'text-red-700' },
    blue: { bg: 'bg-blue-50', icon: 'text-blue-500', value: 'text-blue-700' },
    slate: { bg: 'bg-slate-50', icon: 'text-slate-500', value: 'text-slate-700' },
  };
  const t = tones[tone] || tones.slate;
  return (
    <div className="bg-white rounded-3xl p-4 shadow-sm border border-border/40 min-w-[150px]">
      <div className={`w-9 h-9 rounded-2xl ${t.bg} flex items-center justify-center mb-3`}>
        <Icon className={`w-4.5 h-4.5 ${t.icon}`} size={18} />
      </div>
      <p className="text-xs text-muted-foreground font-medium">{label}</p>
      <p className={`text-xl font-bold mt-0.5 ${t.value}`}>{value}</p>
    </div>
  );
}

function SectionHeader({ title, linkTo, linkLabel = 'See all' }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-base font-bold text-foreground">{title}</h2>
      {linkTo && (
        <Link to={linkTo} className="text-xs font-semibold text-primary flex items-center gap-0.5">
          {linkLabel} <ChevronRight className="w-3 h-3" />
        </Link>
      )}
    </div>
  );
}

function ActionRow({ to, icon: Icon, iconBg, title, subtitle, badge }) {
  const content = (
    <div className="bg-white rounded-2xl px-4 py-3.5 shadow-sm border border-border/40 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${iconBg || 'bg-muted'}`}>
        <Icon className="w-4.5 h-4.5 text-foreground/70" size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{title}</p>
        <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
      </div>
      {badge}
    </div>
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
    queryFn: () => base44.entities.RentCharge.filter({ landlord_id: user?.id }),
    enabled: !!user?.id,
  });

  const { data: expensesRaw = [] } = useQuery({
    queryKey: ['expenses', user?.id],
    queryFn: () => base44.entities.Expense.filter({ landlord_id: user?.id }),
    enabled: !!user?.id,
  });

  const { data: maintenanceRaw = [] } = useQuery({
    queryKey: ['maintenance', user?.id],
    queryFn: () => base44.entities.MaintenanceRequest.filter({ landlord_id: user?.id }),
    enabled: !!user?.id,
  });

  const { data: chatsRaw = [] } = useQuery({
    queryKey: ['chats', user?.id],
    queryFn: () => base44.entities.Chat.list('-last_message_at'),
    enabled: !!user?.id,
  });

  const tenancies = tenanciesRaw.map(normalizeTenancy);
  const charges = chargesRaw.map(normalizeCharge);
  const expenses = expensesRaw.map(normalizeExpense);
  const maintenance = maintenanceRaw.map(normalizeMaintenance);
  const chats = chatsRaw.map(normalizeChat).filter(c => c.participant_ids?.includes(user?.id));

  const due = charges.filter(c => ['due', 'upcoming', 'pending'].includes(c.status)).reduce((sum, c) => sum + c.amount, 0);
  const collected = charges.filter(c => ['paid', 'confirmed'].includes(c.status)).reduce((sum, c) => sum + c.amount, 0);
  const overdue = charges.filter(c => c.status === 'overdue').reduce((sum, c) => sum + c.amount, 0);
  const expensesTotal = expenses.reduce((sum, e) => sum + e.amount, 0);
  const net = collected - expensesTotal;

  const inProgressRepairs = maintenance.filter(m => m.status === 'in_progress');
  const mostRecentIssue = [...maintenance]
    .filter(m => m.status !== 'completed' && m.status !== 'cancelled')
    .sort((a, b) => new Date(b.submitted_at || b.created_date || 0) - new Date(a.submitted_at || a.created_date || 0))[0] || null;

  const recentChats = chats.slice(0, 3);
  const firstName = user?.full_name?.split(' ')[0] || 'there';

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">roomflo</p>
        <h1 className="text-2xl font-extrabold text-foreground">Hey, {firstName} 👋</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Here's your portfolio at a glance.</p>
      </div>

      {/* Metrics scroll — top of page */}
      <div className="flex gap-3 overflow-x-auto px-5 pb-1 scrollbar-hide mb-5">
        <MetricCard icon={DollarSign} label="Weekly rent due" value={money(due)} tone="amber" />
        <MetricCard icon={CheckCircle2} label="Collected" value={money(collected)} tone="emerald" />
        {overdue > 0 && <MetricCard icon={AlertTriangle} label="Overdue" value={money(overdue)} tone="red" />}
        <MetricCard icon={net >= 0 ? TrendingUp : TrendingDown} label="Net cashflow" value={`${net >= 0 ? '+' : '-'}${money(Math.abs(net))}`} tone="blue" />
      </div>

      {/* Hero summary card */}
      <div className="px-5 mb-5">
        <div className="rounded-3xl bg-gradient-to-br from-primary to-orange-400 p-5 text-white shadow-lg">
          <p className="text-xs font-semibold opacity-80 uppercase tracking-wider">Collected this period</p>
          <p className="text-4xl font-extrabold mt-1">{money(collected)}</p>
          <div className="flex gap-4 mt-4">
            <div>
              <p className="text-xs opacity-70">Outstanding</p>
              <p className="font-bold text-lg">{money(due)}</p>
            </div>
            <div className="w-px bg-white/20" />
            <div>
              <p className="text-xs opacity-70">Net</p>
              <p className="font-bold text-lg flex items-center gap-1">
                {net >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {money(Math.abs(net))}
              </p>
            </div>
            {overdue > 0 && (
              <>
                <div className="w-px bg-white/20" />
                <div>
                  <p className="text-xs opacity-70">Overdue</p>
                  <p className="font-bold text-lg text-red-200">{money(overdue)}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="px-5 space-y-6">
        {/* Quick actions */}
        <section>
          <SectionHeader title="Quick actions" />
          <QuickActions />
        </section>

        {/* Needs attention feed */}
        <section>
          <SectionHeader title="Needs attention" linkTo="/maintenance" linkLabel="All repairs" />
          <NeedsAttentionFeed
            charges={charges}
            maintenance={maintenance}
            tenancies={tenancies.filter(t => t.status === 'active')}
          />
        </section>

        {/* Maintenance summary card */}
        <section>
          <SectionHeader title="Maintenance" linkTo="/maintenance" linkLabel="Manage" />
          <div className="bg-white rounded-3xl border border-border/40 shadow-sm overflow-hidden">
            <div className="flex items-stretch">
              <div className="flex-1 flex flex-col items-center justify-center py-5 border-r border-border/40">
                <div className="w-10 h-10 rounded-2xl bg-orange-50 flex items-center justify-center mb-2">
                  <Wrench className="w-5 h-5 text-orange-500" />
                </div>
                <p className="text-3xl font-extrabold text-orange-600">{inProgressRepairs.length}</p>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">In Progress</p>
              </div>
              <div className="flex-[2] flex flex-col justify-center px-4 py-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Latest Issue</p>
                {mostRecentIssue ? (
                  <>
                    <p className="text-sm font-semibold text-foreground leading-snug line-clamp-2">{mostRecentIssue.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{prettyDate(mostRecentIssue.submitted_at)}</p>
                    <div className="mt-2"><StatusBadge status={mostRecentIssue.status} /></div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">No open issues 🎉</p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Messages */}
        <section>
          <SectionHeader title="Recent messages" linkTo="/messages" linkLabel="Inbox" />
          {recentChats.length === 0 ? (
            <div className="bg-white rounded-2xl p-4 text-sm text-muted-foreground border border-border/40 text-center">
              No conversations yet
            </div>
          ) : recentChats.map((chat) => (
            <div key={chat.id} className="mb-2">
              <ActionRow
                to={`/chat/${chat.id}`}
                icon={MessageCircle}
                iconBg="bg-blue-50"
                title={chat.title}
                subtitle={chat.last_message || 'Open chat'}
                badge={<span className="text-[11px] text-muted-foreground shrink-0">{prettyDate(chat.last_message_at, '')}</span>}
              />
            </div>
          ))}
        </section>

        {/* Calendar */}
        <section>
          <SectionHeader title="Calendar" linkTo="/lease-expiry" linkLabel="Agreements" />
          <DashboardCalendar
            charges={charges.filter(c => ['upcoming', 'due', 'overdue'].includes(c.status))}
            tenancies={tenancies.filter(t => t.status === 'active')}
            maintenance={maintenance.filter(m => m.status === 'scheduled')}
          />
        </section>

        {/* Reports shortcut */}
        <section>
          <SectionHeader title="Reports" />
          <ActionRow
            to="/reports"
            icon={BarChart2}
            iconBg="bg-primary/10"
            title="Financial & Vacancy Reports"
            subtitle="Income, expenses, payment trends"
            badge={<ChevronRight className="w-4 h-4 text-muted-foreground" />}
          />
        </section>
      </div>
    </div>
  );
}