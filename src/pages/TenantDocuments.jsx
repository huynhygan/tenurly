import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { FileText, ExternalLink } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';
import { format } from 'date-fns';

export default function TenantDocuments() {
  const { user } = useAuth();

  const { data: tenancies = [] } = useQuery({
    queryKey: ['myTenancies'],
    queryFn: () => base44.entities.Tenancy.filter({ tenant_id: user?.id }),
  });

  const propertyIds = [...new Set(tenancies.map(t => t.property_id))];

  const { data: docs = [] } = useQuery({
    queryKey: ['myDocuments', propertyIds],
    queryFn: async () => {
      const all = [];
      for (const pid of propertyIds) {
        const d = await base44.entities.Document.filter({ property_id: pid });
        all.push(...d);
      }
      return all;
    },
    enabled: propertyIds.length > 0,
  });

  return (
    <div>
      <PageHeader title="Documents" />
      <div className="px-4 space-y-3 mt-2">
        {docs.length === 0 && <EmptyState icon={FileText} title="No documents" description="Your lease documents will appear here" />}
        {docs.map(d => (
          <Card key={d.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary shrink-0" />
                  <h3 className="font-medium text-sm truncate">{d.name}</h3>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 capitalize">{d.type?.replace('_', ' ')}</p>
                <p className="text-xs text-muted-foreground">{format(new Date(d.created_date), 'MMM d, yyyy')}</p>
              </div>
              <a href={d.file_url} target="_blank" rel="noopener">
                <Button variant="ghost" size="icon"><ExternalLink className="w-4 h-4" /></Button>
              </a>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}