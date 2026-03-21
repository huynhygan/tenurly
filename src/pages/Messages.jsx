import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { Link } from 'react-router-dom';
import { MessageCircle, Plus, Users } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';
import { formatDistanceToNow } from 'date-fns';

export default function Messages() {
  const { user } = useAuth();

  const { data: chats = [] } = useQuery({
    queryKey: ['chats'],
    queryFn: () => base44.entities.Chat.list('-last_message_at'),
  });

  const myChats = chats.filter(c => c.participant_ids?.includes(user?.id));

  return (
    <div>
      <PageHeader title="Messages" />
      <div className="px-4 space-y-3 mt-2">
        {myChats.length === 0 && (
          <EmptyState icon={MessageCircle} title="No conversations" description="Start a conversation with a tenant or landlord" />
        )}
        {myChats.map(chat => (
          <Link key={chat.id} to={`/chat/${chat.id}`}>
            <Card className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${chat.type === 'household' ? 'bg-accent' : 'bg-secondary'}`}>
                  {chat.type === 'household' ? <Users className="w-4 h-4 text-primary" /> : <MessageCircle className="w-4 h-4 text-muted-foreground" />}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-sm truncate">{chat.name || 'Direct Message'}</h3>
                  {chat.last_message && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{chat.last_message}</p>
                  )}
                </div>
                {chat.last_message_at && (
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {formatDistanceToNow(new Date(chat.last_message_at), { addSuffix: false })}
                  </span>
                )}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}