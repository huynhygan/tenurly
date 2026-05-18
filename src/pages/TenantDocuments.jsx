import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ExternalLink, FileText } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/PageHeader';
import { normalizeDocument, prettyDate } from '@/lib/propertyApp';

export default function TenantDocuments() {
   React.useEffect(() => { document.title = 'Documents — Tenurly'; }, []);
   const { user } = useAuth();
  const { data: tenancies = [] } = useQuery({ queryKey: ['tenant-docs-tenancies', user?.id], queryFn: () => base44.entities.Tenancy.filter({ tenant_id: user?.id }), enabled: !!user?.id });
  const activeTenancy = tenancies.find(t => t.status === 'active') || tenancies[0];

  const { data: docsRaw = [] } = useQuery({
    queryKey: ['tenant-documents', activeTenancy?.id],
    queryFn: () => base44.entities.Document.filter({ tenancy_id: activeTenancy.id }),
    enabled: !!activeTenancy?.id,
  });

  const docs = docsRaw.map(normalizeDocument).filter(d => d.visible_to_tenant !== false);

  return (
    <div>
      <PageHeader title="Documents" subtitle="Lease agreement, bond receipt and notices" back />
      <div className="space-y-3 px-4 py-4">
        {docs.map((doc) => (
          <Card key={doc.id} className="rounded-3xl p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-primary" /><p className="truncate font-semibold">{doc.title}</p></div>
                <p className="mt-1 text-xs text-muted-foreground">{doc.type.replaceAll('_', ' ')} · {prettyDate(doc.created_date)}</p>
              </div>
              {doc.file_url && <a href={doc.file_url} target="_blank" rel="noreferrer"><Button variant="outline" size="icon"><ExternalLink className="h-4 w-4" /></Button></a>}
            </div>
          </Card>
        ))}
        {docs.length === 0 && <Card className="rounded-3xl p-8 text-center text-sm text-muted-foreground shadow-sm">Your landlord has not shared documents yet.</Card>}
      </div>
    </div>
  );
}