import React, { useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/PageHeader';
import usePullToRefresh from '@/hooks/usePullToRefresh';
import { Link } from 'react-router-dom';
import { formatDistanceToNow, isToday, isYesterday } from 'date-fns';

/* ─── TYPE → GROUP MAPPING ─────────────────────────── */
const TYPE_GROUP = {
  rent_overdue:       'urgent',
  lease_expiry:       'urgent',
  maintenance_new:    'action',
  rent_due:           'action',
  maintenance_update: 'updates',
  rent_confirmed:     'updates',
  message:            'updates',
  rent_paid:          'info',
  general:            'info',
};

const DOT_COLOR = {
  urgent:  'bg-red-500',
  action:  'bg-amber-400',
  updates: 'bg-blue-500',
  info:    'bg-slate-300',
};

const GROUPS = [
  { key: 'urgent',  label: '🔴 Urgent',        headerClass: 'text-red-600' },
  { key: 'action',  label: '🟡 Action needed',  headerClass: 'text-amber-600' },
  { key: 'updates', label: '🔵 Updates',         headerClass: 'text-blue-600' },
  { key: 'info',    label: '⚪ Info',             headerClass: 'text-slate-400' },
];

/* ─── ACTION LINK LABEL ────────────────────────────── */
function actionLabel(type) {
  if (type === 'rent_overdue' || type === 'rent_due' || type === 'rent_paid' || type === 'rent_confirmed') return 'View payment history →';
  if (type === 'maintenance_new' || type === 'maintenance_update') return 'View request →';
  if (type === 'lease_expiry') return 'Review lease →';
  if (type === 'message') return 'Reply →';
  return 'View →';
}

/* ─── RELATIVE TIMESTAMP ───────────────────────────── */
function relativeTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isToday(d)) {
    const mins = Math.floor((Date.now() - d.getTime()) / 60000);
    if (mins < 2) return 'Just now';
    if (mins < 60) return `${mins} minutes ago`;
    const hrs = Math.floor(mins / 60);
    return hrs === 1 ? '1 hour ago' : `${hrs} hours ago`;
  }
  if (isYesterday(d)) return 'Yesterday';
  return formatDistanceToNow(d, { addSuffix: true });
}

/* ─── NOTIFICATION ITEM ────────────────────────────── */
function NotifItem({ n, group, onRead }) {
  const dotColor = DOT_COLOR[group] || 'bg-slate-300';
  const linkLabel = actionLabel(n.type);

  return (
    <div
      onClick={() => !n.read && onRead(n.id)}
      className={`flex items-start gap-3.5 px-4 py-4 cursor-pointer transition-colors rounded-2xl border ${
        !n.read ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-50/60 border-transparent'
      }`}
    >
      {/* Dot */}
      <div className="mt-1.5 shrink-0">
        <div className={`w-2.5 h-2.5 rounded-full ${!n.read ? dotColor : 'bg-slate-200'}`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-snug ${!n.read ? 'font-semibold text-[#0f1f3d]' : 'font-normal text-slate-600'}`}>
          {n.title}
        </p>
        {n.body && (
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{n.body}</p>
        )}
        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
          <span className="text-[11px] text-slate-400">{relativeTime(n.created_date)}</span>
          {n.link && (
            <Link
              to={n.link}
              className="text-[11px] font-semibold text-[#0d9e7e] hover:underline"
              onClick={e => e.stopPropagation()}
            >
              {linkLabel}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── PAGE ─────────────────────────────────────────── */
export default function Notifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const qKey = ['notifications', user?.id];

  const { data: notifications = [], refetch } = useQuery({
    queryKey: qKey,
    queryFn: () => base44.entities.Notification.filter({ user_id: user?.id }, '-created_date'),
    enabled: !!user?.id,
  });

  const onRefresh = useCallback(() => refetch(), [refetch]);
  const { containerRef, isRefreshing } = usePullToRefresh(onRefresh);

  const markRead = useMutation({
    mutationFn: (id) => base44.entities.Notification.update(id, { read: true }),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: qKey });
      const prev = queryClient.getQueryData(qKey);
      queryClient.setQueryData(qKey, old => old?.map(n => n.id === id ? { ...n, read: true } : n));
      return { prev };
    },
    onError: (_err, _vars, ctx) => queryClient.setQueryData(qKey, ctx.prev),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qKey }),
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      const unread = notifications.filter(n => !n.read);
      for (const n of unread) await base44.entities.Notification.update(n.id, { read: true });
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: qKey });
      const prev = queryClient.getQueryData(qKey);
      queryClient.setQueryData(qKey, old => old?.map(n => ({ ...n, read: true })));
      return { prev };
    },
    onError: (_err, _vars, ctx) => queryClient.setQueryData(qKey, ctx.prev),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qKey }),
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  // Group
  const grouped = {};
  for (const n of notifications) {
    const g = TYPE_GROUP[n.type] || 'info';
    if (!grouped[g]) grouped[g] = [];
    grouped[g].push(n);
  }

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle={unreadCount > 0 ? `${unreadCount} unread` : undefined}
        action={
          unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-[#0d9e7e] font-semibold"
              onClick={() => markAllRead.mutate()}
            >
              Mark all as read
            </Button>
          )
        }
      />

      {isRefreshing && <div className="text-center text-xs text-muted-foreground py-1">Refreshing…</div>}

      <div ref={containerRef} className="px-4 space-y-6 mt-2 pb-8">

        {/* Empty state */}
        {notifications.length === 0 && (
          <div className="text-center py-16">
            <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={28} className="text-emerald-500" />
            </div>
            <p className="text-base font-bold text-[#0f1f3d] mb-1">You're all caught up ✓</p>
            <p className="text-sm text-slate-400">No new notifications.</p>
          </div>
        )}

        {GROUPS.map(g => {
          const items = grouped[g.key];
          if (!items?.length) return null;
          return (
            <div key={g.key}>
              <p className={`text-xs font-bold uppercase tracking-wider mb-2.5 px-1 ${g.headerClass}`}>
                {g.label}
              </p>
              <div className="space-y-2">
                {items.map(n => (
                  <NotifItem key={n.id} n={n} group={g.key} onRead={(id) => markRead.mutate(id)} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}