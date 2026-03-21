import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { DollarSign, TrendingUp, AlertTriangle, Wrench, CalendarClock, Building2, ArrowRight, Settings } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import StatCard from '@/components/StatCard';
import StatusBadge from '@/components/StatusBadge';
import { format, differenceInDays, parseISO } from 'date-fns';

export default function LandlordDashboard() {
  const { user } = useAuth();

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.filter({ landlord_id: user?.id }),
  });

  const { data: rentCharges = [] } = useQuery({
    queryKey: ['rentCharges'],
    queryFn: () => base44.entities.RentCharge.filter({ landlord_id: user?.id }),
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses'],
    queryFn: () => base44.entities.Expense.filter({ landlord_id: user?.id }),
  });

  const { data: tenancies = [] } = useQuery({
    queryKey: ['tenancies'],
    queryFn: () => base44.entities.Tenancy.filter({ landlord_id: user?.id }),
  });

  const { data: maintenanceRequests = [] } = useQuery({
    queryKey: ['maintenanceRequests'],
    queryFn: () => base44.entities.MaintenanceRequest.filter({ landlord_id: user?.id }),
  });

  const now = new Date();
  const thisMonth = format(now, 'yyyy-MM');

  const totalDue = rentCharges.filter(r => ['due', 'overdue'].includes(r.status)).reduce((s, r) => s + (r.amount || 0), 0);
  const collected = rentCharges.filter(r => ['paid', 'confirmed'].includes(r.status) && r.due_date?.startsWith(thisMonth)).reduce((s, r) => s + (r.amount || 0), 0);
  const overdue = rentCharges.filter(r => r.status === 'overdue').reduce((s, r) => s + (r.amount || 0), 0);
  const monthlyIncome = rentCharges.filter(r => ['paid', 'confirmed'].includes(r.status) && r.due_date?.startsWith(thisMonth)).reduce((s, r) => s + (r.amount || 0), 0);
  const monthlyExpenses = expenses.filter(e => e.date?.startsWith(thisMonth)).reduce((s, e) => s + (e.amount || 0), 0);
  const netCashflow = monthlyIncome - monthlyExpenses;
  const openMaintenance = maintenanceRequests.filter(m => ['open', 'in_progress'].includes(m.status)).length;

  const expiringLeases = tenancies.filter(t => {
    if (!t.lease_end || t.status !== 'active') return false;
    const days = differenceInDays(parseISO(t.lease_end), now);
    return days >= 0 && days <= 60;
  }).sort((a, b) => new Date(a.lease_end) - new Date(b.lease_end));

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Welcome back, {user?.full_name?.split(' ')[0]}</p>
        </div>
        <Link to="/settings">
          <Button variant="ghost" size="icon"><Settings className="w-5 h-5" /></Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={DollarSign} label="Rent Due" value={`$${totalDue.toLocaleString()}`} />
        <StatCard icon={TrendingUp} label="Collected" value={`$${collected.toLocaleString()}`} sublabel="This month" />
        <StatCard icon={AlertTriangle} label="Overdue" value={`$${overdue.toLocaleString()}`} iconColor="text-destructive" />
        <StatCard icon={Wrench} label="Open Repairs" value={openMaintenance} />
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">Monthly Cashflow</h2>
          <span className="text-xs text-muted-foreground">{format(now, 'MMMM yyyy')}</span>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Income</span>
            <span className="font-medium text-emerald-600">+${monthlyIncome.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Expenses</span>
            <span className="font-medium text-red-500">-${monthlyExpenses.toLocaleString()}</span>
          </div>
          <div className="border-t pt-2 flex justify-between text-sm font-semibold">
            <span>Net Cashflow</span>
            <span className={netCashflow >= 0 ? 'text-emerald-600' : 'text-red-500'}>
              {netCashflow >= 0 ? '+' : ''}${netCashflow.toLocaleString()}
            </span>
          </div>
        </div>
      </Card>

      {expiringLeases.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-amber-500" /> Expiring Leases
            </h2>
            <Link to="/lease-expiry" className="text-xs text-primary font-medium">View all</Link>
          </div>
          <div className="space-y-2">
            {expiringLeases.slice(0, 3).map(t => {
              const days = differenceInDays(parseISO(t.lease_end), now);
              return (
                <div key={t.id} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium">{t.tenant_name || t.tenant_email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status="expiring_soon" label={`${days}d`} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Building2 className="w-4 h-4" /> Properties
          </h2>
          <Link to="/properties" className="text-xs text-primary font-medium flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="space-y-2">
          {properties.slice(0, 3).map(p => (
            <Link key={p.id} to={`/properties/${p.id}`} className="flex items-center justify-between text-sm hover:bg-muted rounded-lg p-2 -mx-2 transition-colors">
              <div>
                <span className="font-medium">{p.name}</span>
                <p className="text-xs text-muted-foreground">{p.address}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </Link>
          ))}
          {properties.length === 0 && (
            <p className="text-sm text-muted-foreground">No properties yet</p>
          )}
        </div>
      </Card>
    </div>
  );
}