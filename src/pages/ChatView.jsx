import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Send, Image } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PageHeader from '@/components/PageHeader';
import { format } from 'date-fns';

export default function ChatView() {
   React.useEffect(() => { document.title = 'Messages — Tenurly'; }, []);
   const { chatId } = useParams();
   const { user } = useAuth();
  const queryClient = useQueryClient();
  const [text, setText] = useState('');
  const bottomRef = useRef();

  const { data: chat } = useQuery({
    queryKey: ['chat', chatId],
    queryFn: async () => { const list = await base44.entities.Chat.filter({ id: chatId }); return list[0]; },
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['messages', chatId],
    queryFn: () => base44.entities.Message.filter({ chat_id: chatId }),
    refetchInterval: 3000,
  });

  const sendMessage = useMutation({
    mutationFn: (content) => {
      const msg = base44.entities.Message.create({
        chat_id: chatId,
        sender_id: user?.id,
        sender_name: user?.full_name,
        content,
      });
      base44.entities.Chat.update(chatId, { last_message: content, last_message_at: new Date().toISOString() });
      return msg;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', chatId] });
      setText('');
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sorted = [...messages].sort((a, b) => new Date(a.created_date) - new Date(b.created_date));

  const handleSend = () => {
    if (!text.trim()) return;
    sendMessage.mutate(text.trim());
  };

  return (
    <div className="flex flex-col h-screen max-w-lg mx-auto">
      <PageHeader title={chat?.name || 'Messages'} back />
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
        {sorted.map(msg => {
          const isMe = msg.sender_id === user?.id;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                isMe ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-card border rounded-bl-md'
              }`}>
                {!isMe && <p className="text-xs font-medium mb-0.5 opacity-70">{msg.sender_name}</p>}
                <p className="text-sm">{msg.content}</p>
                <p className={`text-[10px] mt-1 ${isMe ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                  {format(new Date(msg.created_date), 'h:mm a')}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <div className="p-4 border-t bg-card">
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={!text.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}