import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, CalendarClock, Wrench, ChevronRight } from 'lucide-react';
import { differenceInDays, parseISO } from 'date-fns';
import { money, prettyDate } from '@/lib/propertyApp';
import StatusBadge from '@/components/StatusBadge';

function buildFeedItems(charges, maintenance, tenancies) {
  const today = new Date();
  const items = [];

  // Overdue rent
  charges.forEach(c => {
    if (c.status !== 'overdue') return;
    const daysOverdue = c.due_date ? differenceInDays(today, parseISO(c.due_date)) : 0;
    items.push({
      id: `rent-${c.id}`,
      urgency: 0,
      icon: AlertTriangle,
      iconBg: 'bg-red-50',
      iconColor: 'text-red-500',
      title: `Overdue rent — ${money(c.amount)}`,
      subtitle: `${daysOverdue} day${daysOverdue !== 1 ? 's' : ''} overdue · Due ${prettyDate(c.due_date)}`,
      badge: <StatusBadge status="overdue" />,
      to: c.property_id ? `/properties/${c.property_id}` : '/properties',
    });
  });

  // Vacating soon (within 14 days)
  tenancies.forEach(t => {
    if (!t.lease_end) return;
    const daysLeft = differenceInDays(parseISO(t.lease_end), today);
    if (daysLeft < 0 || daysLeft > 14) return;
    items.push({
      id: `lease-${t.id}`,
      urgency: 1,
      icon: CalendarClock,
      iconBg: 'bg-violet-50',
      iconColor: 'text-violet-500',
      title: `${t.tenant_name || 'Tenant'} vacating soon`,
      subtitle: `Agreement ends ${prettyDate(t.lease_end)} · ${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`,
      badge: <StatusBadge status={daysLeft <= 3 ? 'overdue' : 'due'} label={`${daysLeft}d`} />,
      to: t.room_id ? `/rooms/${t.room_id}` : `/properties/${t.property_id}`,
    });
  });

  // Open maintenance
  maintenance.forEach(m => {
    if (m.status !== 'open') return;
    items.push({
      id: `maint-${m.id}`,
      urgency: 2,
      icon: Wrench,
      iconBg: 'bg-orange-50',
      iconColor: 'text-orange-500',
      title: m.title,
      subtitle: `Reported ${prettyDate(m.submitted_at || m.created_date)} · ${m.priority || 'medium'} priority`,
      badge: <StatusBadge status="open" />,
      to: `/maintenance/${m.id}`,
    });
  });

  return items.sort((a, b) => a.urgency - b.urgency);
}

export default function NeedsAttentionFeed({ charges = [], maintenance = [], tenancies = [] }) {
  const items = buildFeedItems(charges, maintenance, tenancies);

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-4 text-sm text-muted-foreground border border-border/40 text-center">
        ✅ Everything looks good — no urgent actions
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map(item => {
        const Icon = item.icon;
        const content = (
          <div className="bg-white rounded-2xl px-4 py-3.5 shadow-sm border border-border/40 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${item.iconBg}`}>
              <Icon className={`w-[18px] h-[18px] ${item.iconColor}`} strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{item.title}</p>
              <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {item.badge}
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground ml-0.5" />
            </div>
          </div>
        );
        return <Link key={item.id} to={item.to}>{content}</Link>;
      })}
    </div>
  );
}