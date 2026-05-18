import React, { useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { Download, TrendingUp, Home, Users, FileSpreadsheet } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/PageHeader';
import { normalizeCharge, normalizeExpense, normalizeTenancy, money } from '@/lib/propertyApp';
import { format, subMonths, startOfMonth, endOfMonth, parseISO, isWithinInterval } from 'date-fns';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const COLORS = ['hsl(168,70%,38%)', 'hsl(0,72%,55%)', 'hsl(35,90%,55%)', 'hsl(200,65%,50%)'];

function SummaryTile({ icon: Icon, label, value, sub }) {
  return (
    <Card className="flex-1 min-w-0 p-4 rounded-2xl shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-primary" />
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
      <p className="text-xl font-bold text-foreground">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </Card>
  );
}

function ChartCard({ title, children }) {
  return (
    <Card className="p-4 rounded-2xl shadow-sm space-y-3">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {children}
    </Card>
  );
}

export default function Reports() {
  const { user } = useAuth();
  const reportRef = useRef(null);

  const { data: tenanciesRaw = [] } = useQuery({
    queryKey: ['report-tenancies', user?.id],
    queryFn: () => base44.entities.Tenancy.filter({ landlord_id: user?.id }),
    enabled: !!user?.id,
  });

  const { data: chargesRaw = [] } = useQuery({
    queryKey: ['report-charges', user?.id],
    queryFn: () => base44.entities.RentCharge.list('-due_date', 200),
    enabled: !!user?.id,
  });

  const { data: expensesRaw = [] } = useQuery({
    queryKey: ['report-expenses', user?.id],
    queryFn: () => base44.entities.Expense.list('-date', 200),
    enabled: !!user?.id,
  });

  const { data: roomsRaw = [] } = useQuery({
    queryKey: ['report-rooms', user?.id],
    queryFn: () => base44.entities.Room.list(),
    enabled: !!user?.id,
  });

  const tenancies = tenanciesRaw.map(normalizeTenancy);
  const charges = chargesRaw.map(normalizeCharge);
  const expenses = expensesRaw.map(normalizeExpense);

  // Last 6 months labels
  const months = useMemo(() => Array.from({ length: 6 }, (_, i) => {
    const d = subMonths(new Date(), 5 - i);
    return { label: format(d, 'MMM'), start: startOfMonth(d), end: endOfMonth(d) };
  }), []);

  // Income vs Expenses per month
  const incomeExpenseData = useMemo(() => months.map(({ label, start, end }) => {
    const income = charges
      .filter(c => ['paid', 'confirmed'].includes(c.status) && c.due_date && isWithinInterval(parseISO(c.due_date), { start, end }))
      .reduce((s, c) => s + c.amount, 0);
    const expense = expenses
      .filter(e => e.date && isWithinInterval(parseISO(e.date), { start, end }))
      .reduce((s, e) => s + e.amount, 0);
    return { month: label, Income: Math.round(income), Expenses: Math.round(expense) };
  }), [charges, expenses, months]);

  // Payment status breakdown (last 6 months)
  const paymentTrendData = useMemo(() => months.map(({ label, start, end }) => {
    const inRange = charges.filter(c => c.due_date && isWithinInterval(parseISO(c.due_date), { start, end }));
    const paid = inRange.filter(c => ['paid', 'confirmed'].includes(c.status)).length;
    const overdue = inRange.filter(c => c.status === 'overdue').length;
    const pending = inRange.filter(c => ['upcoming', 'due'].includes(c.status)).length;
    return { month: label, Paid: paid, Overdue: overdue, Pending: pending };
  }), [charges, months]);

  // Vacancy rate (rooms)
  const totalRooms = roomsRaw.length;
  const activeRooms = tenancies.filter(t => t.status === 'active').length;
  const vacantRooms = Math.max(0, totalRooms - activeRooms);
  const occupancyRate = totalRooms > 0 ? Math.round((activeRooms / totalRooms) * 100) : 0;
  const vacancyData = [
    { name: 'Occupied', value: activeRooms },
    { name: 'Vacant', value: vacantRooms },
  ];

  // Summary stats
  const totalIncome = charges.filter(c => ['paid', 'confirmed'].includes(c.status)).reduce((s, c) => s + c.amount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const netCashflow = totalIncome - totalExpenses;

  const handleDownloadCSV = () => {
    const rows = [
      ['Date', 'Type', 'Description', 'Amount (AUD)', 'Status'],
      ...charges
        .filter(c => ['paid', 'confirmed'].includes(c.status))
        .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
        .map(c => [c.due_date || '', 'Income', `Rent - ${c.tenancy_id || ''}`, c.amount, c.status]),
      ...expenses
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .map(e => [e.date || '', 'Expense', e.description || e.category || '', e.amount, 'paid']),
    ];
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tenurly-tax-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = async () => {
    const el = reportRef.current;
    if (!el) return;
    const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgHeight = (canvas.height * pageWidth) / canvas.width;
    let y = 0;
    const pageHeight = pdf.internal.pageSize.getHeight();
    while (y < imgHeight) {
      pdf.addImage(imgData, 'PNG', 0, -y, pageWidth, imgHeight);
      y += pageHeight;
      if (y < imgHeight) pdf.addPage();
    }
    pdf.save(`property-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  return (
    <div>
      <PageHeader
        title="Reports & tax"
        back
        action={
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="gap-1.5 rounded-xl" onClick={handleDownloadCSV}>
              <FileSpreadsheet className="w-4 h-4" /> CSV
            </Button>
            <Button size="sm" className="gap-1.5 rounded-xl" onClick={handleDownloadPDF}>
              <Download className="w-4 h-4" /> PDF
            </Button>
          </div>
        }
      />

      <div ref={reportRef} className="px-4 pb-8 space-y-5 mt-2 bg-background">
        {/* Tax export hint */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-center gap-3">
          <FileSpreadsheet size={18} className="text-amber-600 shrink-0" />
          <p className="text-xs text-amber-800">
            <span className="font-semibold">Tax time?</span> Tap <span className="font-semibold">CSV</span> to export all income &amp; expenses in a spreadsheet ready for your accountant.
          </p>
        </div>
        {/* Summary tiles */}
        <div className="flex gap-3">
          <SummaryTile icon={TrendingUp} label="Total Income" value={money(totalIncome)} sub="All time collected" />
          <SummaryTile icon={TrendingUp} label="Net Cashflow" value={money(netCashflow)} sub="Income minus expenses" />
        </div>
        <div className="flex gap-3">
          <SummaryTile icon={Home} label="Occupancy" value={`${occupancyRate}%`} sub={`${activeRooms}/${totalRooms} rooms`} />
          <SummaryTile icon={Users} label="Active Tenants" value={tenancies.filter(t => t.status === 'active').length} sub="Current leases" />
        </div>

        {/* Income vs Expenses */}
        <ChartCard title="Monthly Income vs Expenses">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={incomeExpenseData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(210,15%,90%)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${v}`} />
              <Tooltip formatter={v => `$${v}`} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Income" fill="hsl(168,70%,38%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Expenses" fill="hsl(0,72%,55%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Payment trends */}
        <ChartCard title="Tenant Payment Trends">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={paymentTrendData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(210,15%,90%)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="Paid" stroke="hsl(168,70%,38%)" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Overdue" stroke="hsl(0,72%,55%)" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Pending" stroke="hsl(35,90%,55%)" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Vacancy rate */}
        <ChartCard title="Vacancy Rate">
          {totalRooms === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No rooms added yet.</p>
          ) : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={160}>
                <PieChart>
                  <Pie data={vacancyData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                    {vacancyData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-3">
                {vacancyData.map((entry, i) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: COLORS[i] }} />
                    <div>
                      <p className="text-sm font-semibold">{entry.value} rooms</p>
                      <p className="text-xs text-muted-foreground">{entry.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ChartCard>
      </div>
    </div>
  );
}