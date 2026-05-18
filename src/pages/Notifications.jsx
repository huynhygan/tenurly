import React, { useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { Bell, DollarSign, Wrench, CalendarClock, MessageCircle, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { Button } from "@/components/ui/button";
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';
import usePullToRefresh from '@/hooks/usePullToRefresh';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

const typeConfig = {
  rent_overdue:       { icon: DollarSign,    group: 'urgent',  dot: 'bg-red-500' },
  lease_expiry:       { icon: CalendarClock, group: 'urgent',  dot: 'bg-red-500' },
  maintenance_new:    { icon: Wrench,        group: 'action',  dot: 'bg-amber-500' },
  rent_due:           { icon: DollarSign,    group: 'action',  dot: 'bg-amber-500' },
  maintenance_update: { icon: Wrench,        group: 'updates', dot: 'bg-blue-500' },
  rent_confirmed:     { icon: CheckCircle2,  group: 'updates', dot: 'bg-blue-500' },
  message:            { icon: MessageCircle, group: 'updates', dot: 'bg-blue-500' },
  rent_paid:          { icon: DollarSign,    group: 'info',    dot: 'bg-slate-400' },
  general:            { icon: Bell,          group: 'info',    dot: 'bg-slate-400' },
};

const groups = [
  { key: 'urgent',  label: '🔴 Urgent',         bg: 'bg-red-50',    border: 'border-red-100' },
  { key: 'action',  label: '🟡 Action needed',   bg: 'bg-amber-50',  border: 'border-amber-100' },
  { key: 'updates', label: '🔵 Updates',          bg: 'bg-blue-50',   border: 'border-blue-100' },
  { key: 'info',    label: '⚪ Info',              bg: 'bg-slate-50',  border: 'border-slate-100' },
];

export default function Notifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const qKey = ['notifications'];

  const { data: notifications = [], refetch } = useQuery({
    queryKey: qKey,
    queryFn: () => base44.entities.Notification.filter({ user_id: user?.id }, '-created_date'),
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

  // Group notifications
  const grouped = {};
  for (const n of notifications) {
    const cfg = typeConfig[n.type] || typeConfig.general;
    if (!grouped[cfg.group]) grouped[cfg.group] = [];
    grouped[cfg.group].push({ ...n, _cfg: cfg });
  }

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle={unreadCount > 0 ? `${unreadCount} unread` : undefined}
        action={
          unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={() => markAllRead.mutate()}>
              Mark all read
            </Button>
          )
        }
      />
      {isRefreshing && <div className="text-center text-xs text-muted-foreground py-1">Refreshing…</div>}

      <div ref={containerRef} className="px-4 space-y-5 mt-2 pb-6">
        {notifications.length === 0 && (
          <EmptyState icon={CheckCircle2} title="You're all caught up ✓" description="No new notifications." />
        )}

        {groups.map(g => {
          const items = grouped[g.key];
          if (!items?.length) return null;
          return (
            <div key={g.key}>
              <p className="text-xs font-semibold text-muted-foreground mb-2 px-1">{g.label}</p>
              <div className="space-y-2">
                {items.map(n => {
                  const Icon = n._cfg.icon;
                  return (
                    <div
                      key={n.id}
                      onClick={() => !n.read && markRead.mutate(n.id)}
                      className={`rounded-2xl border p-4 flex items-start gap-3 cursor-pointer transition-colors ${
                        !n.read ? `${g.bg} ${g.border}` : 'bg-white border-border/50'
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.read ? n._cfg.dot : 'bg-slate-200'}`} />
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm leading-snug ${!n.read ? 'font-semibold text-foreground' : 'font-medium text-foreground/80'}`}>
                          {n.title}
                        </p>
                        {n.body && <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>}
                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                          <p className="text-[10px] text-muted-foreground">
                            {formatDistanceToNow(new Date(n.created_date), { addSuffix: true })}
                          </p>
                          {n.link && (
                            <Link
                              to={n.link}
                              className="text-[10px] font-semibold text-primary hover:underline"
                              onClick={e => e.stopPropagation()}
                            >
                              View →
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}