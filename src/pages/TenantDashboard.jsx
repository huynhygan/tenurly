import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { DollarSign, CalendarClock, Wrench, FileText, ArrowRight, Settings } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import StatCard from '@/components/StatCard';
import StatusBadge from '@/components/StatusBadge';
import { format, differenceInDays, parseISO } from 'date-fns';

export default function TenantDashboard() {
  const { user } = useAuth();

  const { data: tenancies = [] } = useQuery({
    queryKey: ['myTenancies'],
    queryFn: () => base44.entities.Tenancy.filter({ tenant_id: user?.id, status: 'active' }),
  });

  const { data: rentCharges = [] } = useQuery({
    queryKey: ['myRentCharges'],
    queryFn: () => base44.entities.RentCharge.filter({ tenant_id: user?.id }),
  });

  const { data: maintenanceRequests = [] } = useQuery({
    queryKey: ['myMaintenance'],
    queryFn: () => base44.entities.MaintenanceRequest.filter({ tenant_id: user?.id }),
  });

  const activeTenancy = tenancies[0];
  const now = new Date();

  const nextDue = rentCharges
    .filter(r => ['upcoming', 'due'].includes(r.status))
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))[0];

  const overdue = rentCharges.filter(r => r.status === 'overdue');
  const openRepairs = maintenanceRequests.filter(m => ['open', 'in_progress'].includes(m.status)).length;

  const leaseEnd = activeTenancy?.lease_end;
  const daysToExpiry = leaseEnd ? differenceInDays(parseISO(leaseEnd), now) : null;

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Home</h1>
          <p className="text-sm text-muted-foreground">Hi, {user?.full_name?.split(' ')[0]}</p>
        </div>
        <Link to="/settings"><Button variant="ghost" size="icon"><Settings className="w-5 h-5" /></Button></Link>
      </div>

      {activeTenancy && (
        <Card className="p-4 bg-primary text-primary-foreground">
          <p className="text-xs font-medium opacity-80">Your room</p>
          <h2 className="text-lg font-bold mt-0.5">{activeTenancy.tenant_name}</h2>
          <div className="flex items-center gap-4 mt-2 text-sm opacity-90">
            <span>${activeTenancy.rent_amount} / {activeTenancy.rent_frequency}</span>
            {leaseEnd && <span>Lease ends {leaseEnd}</span>}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={DollarSign}
          label="Next Due"
          value={nextDue ? `$${nextDue.amount}` : '-'}
          sublabel={nextDue?.due_date}
        />
        <StatCard
          icon={DollarSign}
          label="Overdue"
          value={overdue.length > 0 ? `$${overdue.reduce((s, r) => s + r.amount, 0)}` : '$0'}
          iconColor={overdue.length > 0 ? 'text-destructive' : 'text-primary'}
        />
        <StatCard icon={Wrench} label="Open Repairs" value={openRepairs} />
        <StatCard
          icon={CalendarClock}
          label="Lease Expiry"
          value={daysToExpiry !== null ? `${daysToExpiry}d` : '-'}
          sublabel={daysToExpiry !== null && daysToExpiry <= 60 ? 'Expiring soon' : undefined}
        />
      </div>

      <div className="space-y-2">
        <Link to="/rent">
          <Card className="p-4 flex items-center justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-primary" />
              <span className="font-medium text-sm">Rent & Payments</span>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
          </Card>
        </Link>
        <Link to="/repairs">
          <Card className="p-4 flex items-center justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <Wrench className="w-5 h-5 text-primary" />
              <span className="font-medium text-sm">Maintenance Requests</span>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
          </Card>
        </Link>
        <Link to="/documents">
          <Card className="p-4 flex items-center justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-primary" />
              <span className="font-medium text-sm">Lease Documents</span>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
          </Card>
        </Link>
      </div>
    </div>
  );
}