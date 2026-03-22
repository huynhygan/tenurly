import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { format } from 'date-fns';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';

export default function MaintenanceDetail() {
  const { id } = useParams();
  const { currentMode } = useAuth();
  const queryClient = useQueryClient();
  const isLandlord = currentMode === 'landlord';

  const { data: request } = useQuery({
    queryKey: ['maintenanceRequest', id],
    queryFn: async () => { const list = await base44.entities.MaintenanceRequest.filter({ id }); return list[0]; },
  });

  const qKey = ['maintenanceRequest', id];

  const updateStatus = useMutation({
    mutationFn: (status) => base44.entities.MaintenanceRequest.update(id, {
      status,
      ...(status === 'completed' ? { resolved_date: format(new Date(), 'yyyy-MM-dd') } : {})
    }),
    onMutate: async (status) => {
      await queryClient.cancelQueries({ queryKey: qKey });
      const prev = queryClient.getQueryData(qKey);
      queryClient.setQueryData(qKey, old => old ? { ...old, status } : old);
      return { prev };
    },
    onError: (_err, _vars, ctx) => queryClient.setQueryData(qKey, ctx.prev),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qKey }),
  });

  if (!request) return <div className="p-4">Loading...</div>;

  return (
    <div>
      <PageHeader title={request.title} back />
      <div className="px-4 space-y-4 mt-2">
        <Card className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <StatusBadge status={request.status} />
            <StatusBadge status={request.priority} />
          </div>
          <p className="text-sm">{request.description}</p>
          <p className="text-xs text-muted-foreground">Submitted: {format(new Date(request.created_date), 'MMM d, yyyy')}</p>
          {request.resolved_date && <p className="text-xs text-muted-foreground">Resolved: {request.resolved_date}</p>}
          {request.notes && <p className="text-sm text-muted-foreground mt-2">Notes: {request.notes}</p>}
        </Card>

        {request.photo_urls?.length > 0 && (
          <Card className="p-4">
            <h3 className="text-sm font-semibold mb-2">Photos</h3>
            <div className="grid grid-cols-2 gap-2">
              {request.photo_urls.map((url, i) => (
                <a key={i} href={url} target="_blank" rel="noopener">
                  <img src={url} alt={`Photo ${i + 1}`} className="w-full h-32 object-cover rounded-lg" />
                </a>
              ))}
            </div>
          </Card>
        )}

        {isLandlord && request.status !== 'completed' && request.status !== 'cancelled' && (
          <Card className="p-4">
            <h3 className="text-sm font-semibold mb-2">Update Status</h3>
            <div className="flex gap-2 flex-wrap">
              {['open', 'in_progress', 'scheduled', 'completed', 'cancelled'].map(s => (
                <Button
                  key={s}
                  size="sm"
                  variant={request.status === s ? 'default' : 'outline'}
                  onClick={() => updateStatus.mutate(s)}
                  className="capitalize"
                >
                  {s.replace('_', ' ')}
                </Button>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}