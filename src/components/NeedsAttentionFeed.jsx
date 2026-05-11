import React from 'react';
import { Link } from 'react-router-dom';
import { differenceInDays, parseISO } from 'date-fns';
import { money, prettyDate } from '@/lib/propertyApp';

function dot(color) {
  const map = { red: 'bg-red-500', amber: 'bg-amber-400', orange: 'bg-orange-400', green: 'bg-emerald-500', gray: 'bg-gray-300' };
  return <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${map[color] || map.gray}`} />;
}

function buildItems(charges, maintenance, tenancies) {
  const today = new Date();
  const items = [];

  // Overdue rent per tenancy
  charges.forEach(c => {
    if (c.status !== 'overdue') return;
    const tenancy = tenancies.find(t => t.id === c.tenancy_id);
    const name = tenancy?.tenant_name || 'Tenant';
    const daysAgo = c.due_date ? differenceInDays(today, parseISO(c.due_date)) : 0;
    const lastPaid = charges
      .filter(x => (x.status === 'paid' || x.status === 'confirmed') && x.tenancy_id === c.tenancy_id)
      .sort((a, b) => new Date(b.due_date) - new Date(a.due_date))[0];
    items.push({
      id: `rent-${c.id}`,
      urgency: 0,
      dot: 'red',
      title: `${name} — ${daysAgo} days overdue`,
      badge: daysAgo > 0 ? { label: `${daysAgo} days overdue`, color: 'text-red-600 bg-red-50' } : null,
      subtitle: `${money(c.amount)} outstanding${lastPaid ? ` · Last paid ${prettyDate(lastPaid.due_date)}` : ''}`,
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
      dot: 'amber',
      title: `${t.tenant_name || 'Tenant'} vacating`,
      badge: null,
      subtitle: `Notice given · Leaves ${prettyDate(t.lease_end)} · ${daysLeft} days`,
      to: t.room_id ? `/rooms/${t.room_id}` : `/properties/${t.property_id}`,
    });
  });

  // Open/urgent maintenance
  maintenance.forEach(m => {
    if (m.status === 'completed' || m.status === 'cancelled') return;
    const isUrgent = m.priority === 'urgent' || m.priority === 'high';
    items.push({
      id: `maint-${m.id}`,
      urgency: isUrgent ? 1 : 2,
      dot: isUrgent ? 'orange' : 'gray',
      title: `${m.title}${isUrgent ? ' — urgent repair' : ''}`,
      badge: null,
      subtitle: `Lodged by ${m.tenant_id ? 'tenant' : 'owner'} · ${prettyDate(m.submitted_at || m.created_date)}`,
      to: `/maintenance/${m.id}`,
    });
  });

  // Recent confirmed payments (green dot)
  charges
    .filter(c => c.status === 'confirmed' || c.status === 'paid')
    .sort((a, b) => new Date(b.paid_date || b.due_date) - new Date(a.paid_date || a.due_date))
    .slice(0, 1)
    .forEach(c => {
      const tenancy = tenancies.find(t => t.id === c.tenancy_id);
      const name = tenancy?.tenant_name || 'Tenant';
      items.push({
        id: `paid-${c.id}`,
        urgency: 3,
        dot: 'green',
        title: `${name} paid`,
        badge: null,
        subtitle: `${money(c.amount)} received · Weekly rent · ${prettyDate(c.paid_date || c.due_date) === prettyDate(new Date().toISOString().slice(0,10)) ? 'Today' : prettyDate(c.paid_date || c.due_date)}`,
        to: c.property_id ? `/properties/${c.property_id}` : '/properties',
      });
    });

  return items.sort((a, b) => a.urgency - b.urgency);
}

export default function NeedsAttentionFeed({ charges = [], maintenance = [], tenancies = [] }) {
  const items = buildItems(charges, maintenance, tenancies);

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-border/40 px-4 py-5 text-sm text-muted-foreground text-center">
        ✅ Nothing needs attention right now
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-border/40 divide-y divide-border/30 overflow-hidden">
      {items.map(item => (
        <Link key={item.id} to={item.to}>
          <div className="flex items-center gap-3 px-4 py-3.5 active:bg-muted/40">
            {dot(item.dot)}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-medium text-foreground">{item.title}</p>
                {item.badge && (
                  <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-md ${item.badge.color}`}>
                    {item.badge.label}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{item.subtitle}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}