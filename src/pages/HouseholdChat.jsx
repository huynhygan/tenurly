import React, { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Loader2 } from 'lucide-react';

export default function HouseholdChat() {
  const { propertyId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: chats = [], isLoading } = useQuery({
    queryKey: ['householdChat', propertyId],
    queryFn: () => base44.entities.Chat.filter({ property_id: propertyId, type: 'household' }),
  });

  const { data: property } = useQuery({
    queryKey: ['property', propertyId],
    queryFn: async () => { const list = await base44.entities.Property.filter({ id: propertyId }); return list[0]; },
  });

  const { data: tenancies = [] } = useQuery({
    queryKey: ['tenancies', propertyId],
    queryFn: () => base44.entities.Tenancy.filter({ property_id: propertyId, status: 'active' }),
  });

  const createChat = useMutation({
    mutationFn: async () => {
      const participantIds = [user?.id, ...tenancies.filter(t => t.tenant_id).map(t => t.tenant_id)];
      return base44.entities.Chat.create({
        property_id: propertyId,
        type: 'household',
        name: `${property?.name || 'Property'} - Household`,
        participant_ids: participantIds,
      });
    },
    onSuccess: (chat) => navigate(`/chat/${chat.id}`, { replace: true }),
  });

  useEffect(() => {
    if (!isLoading && chats.length > 0) {
      navigate(`/chat/${chats[0].id}`, { replace: true });
    } else if (!isLoading && chats.length === 0 && property) {
      createChat.mutate();
    }
  }, [isLoading, chats, property]);

  return (
    <div className="flex items-center justify-center h-screen">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
    </div>
  );
}