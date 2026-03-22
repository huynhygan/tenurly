import React, { useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { Bell, DollarSign, Wrench, CalendarClock, MessageCircle, CheckCircle } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';
import usePullToRefresh from '@/hooks/usePullToRefresh';
import { formatDistanceToNow } from 'date-fns';

const typeIcons = {
  rent_due: DollarSign, rent_overdue: DollarSign, rent_paid: DollarSign,
  rent_confirmed: CheckCircle, maintenance_new: Wrench, maintenance_update: Wrench,
  lease_expiry: CalendarClock, message: MessageCircle, general: Bell,
};

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
      <div ref={containerRef} className="px-4 space-y-2 mt-2">
        {notifications.length === 0 && <EmptyState icon={Bell} title="No notifications" description="You're all caught up!" />}
        {notifications.map(n => {
          const Icon = typeIcons[n.type] || Bell;
          return (
            <Card
              key={n.id}
              className={`p-4 transition-colors cursor-pointer ${!n.read ? 'bg-accent/50 border-primary/20' : ''}`}
              onClick={() => !n.read && markRead.mutate(n.id)}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-full shrink-0 ${!n.read ? 'bg-primary/10' : 'bg-muted'}`}>
                  <Icon className={`w-4 h-4 ${!n.read ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className={`text-sm ${!n.read ? 'font-semibold' : 'font-medium'}`}>{n.title}</h3>
                  {n.body && <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>}
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(n.created_date), { addSuffix: true })}
                  </p>
                </div>
                {!n.read && <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}