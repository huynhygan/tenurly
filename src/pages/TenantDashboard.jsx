import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { CalendarClock, CreditCard, FileText, MessageCircle, Wrench } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/StatusBadge';
import { leaseSummary, money, normalizeCharge, normalizeMaintenance, normalizeTenancy, prettyDate } from '@/lib/propertyApp';

export default function TenantDashboard() {
  const { user } = useAuth();

  const { data: tenanciesRaw = [] } = useQuery({
    queryKey: ['tenant-tenancies', user?.id],
    queryFn: () => base44.entities.Tenancy.filter({ tenant_id: user?.id }),
    enabled: !!user?.id,
  });

  const { data: chargesRaw = [] } = useQuery({
    queryKey: ['tenant-charges', user?.id],
    queryFn: () => base44.entities.RentCharge.filter({ tenant_id: user?.id }),
    enabled: !!user?.id,
  });

  const { data: repairsRaw = [] } = useQuery({
    queryKey: ['tenant-repairs', user?.id],
    queryFn: () => base44.entities.MaintenanceRequest.filter({ tenant_id: user?.id }),
    enabled: !!user?.id,
  });

  const tenancies = tenanciesRaw.map(normalizeTenancy);
  const tenancy = tenancies.find(t => t.status === 'active') || tenancies[0];
  const charges = chargesRaw.map(normalizeCharge);
  const repairs = repairsRaw.map(normalizeMaintenance);

  const nextDue = charges.filter(c => ['upcoming', 'due', 'pending', 'overdue'].includes(c.status)).sort((a,b) => new Date(a.due_date) - new Date(b.due_date))[0];
  const lease = leaseSummary(tenancy?.lease_end);
  const openRepairs = repairs.filter(r => !['completed', 'closed'].includes(r.status)).length;

  return (
    <div className="space-y-5 px-4 py-5">
      <header className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Tenant home</p>
        <h1 className="text-3xl font-bold">Hi, {user?.full_name?.split(' ')[0] || 'there'}</h1>
        <p className="text-sm text-muted-foreground">See your next rent, lease expiry and repairs in one place.</p>
      </header>

      <Card className="rounded-3xl bg-primary p-5 text-primary-foreground shadow-sm">
        <p className="text-xs font-medium opacity-80">Next rent due</p>
        <h2 className="mt-1 text-3xl font-bold">{nextDue ? money(nextDue.amount) : 'No charge due'}</h2>
        <div className="mt-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs opacity-80">Due date</p>
            <p className="font-semibold">{prettyDate(nextDue?.due_date, 'Not scheduled')}</p>
          </div>
          {nextDue && <StatusBadge status={nextDue.status} label={nextDue.status === 'pending' ? 'Waiting review' : undefined} />}
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card className="rounded-3xl p-4 shadow-sm">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-50 text-violet-700"><CalendarClock className="h-5 w-5" /></div>
          <p className="text-xs text-muted-foreground">Lease expiry</p>
          <p className="mt-1 text-xl font-bold">{lease.days === null ? '—' : `${lease.days}d`}</p>
          <div className="mt-2"><StatusBadge status={lease.status} label={lease.label} /></div>
        </Card>
        <Card className="rounded-3xl p-4 shadow-sm">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-700"><Wrench className="h-5 w-5" /></div>
          <p className="text-xs text-muted-foreground">Open repairs</p>
          <p className="mt-1 text-xl font-bold">{openRepairs}</p>
          <p className="mt-2 text-xs text-muted-foreground">Track maintenance progress</p>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link to="/rent"><Button className="h-12 w-full rounded-2xl">I've Paid / Payments</Button></Link>
        <Link to="/repairs"><Button variant="outline" className="h-12 w-full rounded-2xl">Request Repair</Button></Link>
      </div>

      <div className="space-y-3">
        <Link to="/rent">
          <Card className="rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-3"><CreditCard className="h-5 w-5 text-primary" /><div><p className="font-semibold">Payments</p><p className="text-xs text-muted-foreground">View rent history and upload receipts</p></div></div>
          </Card>
        </Link>
        <Link to="/documents">
          <Card className="rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-3"><FileText className="h-5 w-5 text-primary" /><div><p className="font-semibold">Lease documents</p><p className="text-xs text-muted-foreground">Rental agreement, bond receipt and notices</p></div></div>
          </Card>
        </Link>
        <Link to="/messages">
          <Card className="rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-3"><MessageCircle className="h-5 w-5 text-primary" /><div><p className="font-semibold">Messages</p><p className="text-xs text-muted-foreground">Chat with landlord and household</p></div></div>
          </Card>
        </Link>
      </div>
    </div>
  );
}