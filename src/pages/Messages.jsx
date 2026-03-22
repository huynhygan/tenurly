import React, { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import usePullToRefresh from '@/hooks/usePullToRefresh';
import { MessageCircle, Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Card } from '@/components/ui/card';
import PageHeader from '@/components/PageHeader';
import { normalizeChat, prettyDate } from '@/lib/propertyApp';

export default function Messages() {
  const { user } = useAuth();
  const { data: chatsRaw = [], refetch } = useQuery({ queryKey: ['messages'], queryFn: () => base44.entities.Chat.list('-last_message_at') });
  const chats = chatsRaw.map(normalizeChat).filter(c => c.participant_ids?.includes(user?.id));

  const onRefresh = useCallback(() => refetch(), [refetch]);
  const { containerRef, isRefreshing } = usePullToRefresh(onRefresh);

  return (
    <div>
      <PageHeader title="Messages" subtitle="Direct chat and household group chat" />
      {isRefreshing && <div className="text-center text-xs text-muted-foreground py-1">Refreshing…</div>}
      <div ref={containerRef} className="space-y-3 px-4 py-4">
        {chats.map((chat) => (
          <Link key={chat.id} to={`/chat/${chat.id}`}>
            <Card className="rounded-3xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100">
                  {chat.type === 'household' ? <Users className="h-5 w-5 text-primary" /> : <MessageCircle className="h-5 w-5 text-primary" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{chat.title}</p>
                  <p className="truncate text-sm text-muted-foreground">{chat.last_message || 'Open conversation'}</p>
                </div>
                <p className="text-[11px] text-muted-foreground">{prettyDate(chat.last_message_at, 'Now')}</p>
              </div>
            </Card>
          </Link>
        ))}
        {chats.length === 0 && <Card className="rounded-3xl p-8 text-center text-sm text-muted-foreground shadow-sm">No conversations yet.</Card>}
      </div>
    </div>
  );
}