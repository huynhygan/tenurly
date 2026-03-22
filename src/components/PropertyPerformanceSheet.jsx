import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { buildMonthlyEarnings } from './PropertyEarningsChart';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { X, TrendingUp, TrendingDown, Minus } from 'lucide-react';

function MonthDetail({ month, charges }) {
  const paid = charges.filter(c => ['paid', 'confirmed'].includes(c.status) && c.due_date &&
    isWithinInterval(new Date(c.due_date), {
      start: startOfMonth(month.date),
      end: endOfMonth(month.date),
    })
  );
  return (
    <div className="mt-4 space-y-2">
      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">{month.fullMonth} breakdown</p>
      {paid.length === 0 ? (
        <p className="text-sm text-muted-foreground">No confirmed payments.</p>
      ) : paid.map(c => (
        <div key={c.id} className="flex items-center justify-between py-2 border-b border-border/40">
          <div>
            <p className="text-sm font-medium">Rent payment</p>
            <p className="text-xs text-muted-foreground">{c.due_date}</p>
          </div>
          <p className="text-sm font-bold">${c.amount?.toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-foreground text-background text-xs font-bold px-3 py-2 rounded-xl shadow-lg">
        <p>{label}</p>
        <p>${payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

export default function PropertyPerformanceSheet({ property, charges, onClose }) {
  const months = 12;
  const data = buildMonthlyEarnings(charges, months);
  const thisMonthLabel = format(new Date(), 'MMM');
  const [selected, setSelected] = useState(data[data.length - 1]);

  const thisMonthIdx = data.length - 1;
  const prevMonthIdx = data.length - 2;
  const thisTotal = data[thisMonthIdx]?.total || 0;
  const prevTotal = data[prevMonthIdx]?.total || 0;
  const totalYear = data.reduce((s, d) => s + d.total, 0);
  const avgMonth = Math.round(totalYear / months);

  const delta = prevTotal > 0 ? Math.round(((thisTotal - prevTotal) / prevTotal) * 100) : null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" onClick={onClose}>
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      <div
        className="relative bg-background rounded-t-[2rem] overflow-hidden max-h-[90vh] flex flex-col max-w-lg mx-auto w-full"
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        <div className="overflow-y-auto px-5 pb-10">
          {/* Header */}
          <div className="flex items-center justify-between py-3">
            <div>
              <h2 className="font-extrabold text-lg">{property.name}</h2>
              <p className="text-xs text-muted-foreground">Earnings performance</p>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-2xl bg-muted flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* KPI row */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="bg-white rounded-2xl p-3 border border-border/40 shadow-sm">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">This month</p>
              <p className="text-base font-extrabold mt-0.5">${thisTotal.toLocaleString()}</p>
              {delta !== null && (
                <div className={`flex items-center gap-0.5 mt-1 text-[10px] font-semibold ${delta > 0 ? 'text-emerald-500' : delta < 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
                  {delta > 0 ? <TrendingUp className="w-3 h-3" /> : delta < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                  {delta > 0 ? '+' : ''}{delta}% vs last
                </div>
              )}
            </div>
            <div className="bg-white rounded-2xl p-3 border border-border/40 shadow-sm">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">12-mo total</p>
              <p className="text-base font-extrabold mt-0.5">${totalYear.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-2xl p-3 border border-border/40 shadow-sm">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">Avg/month</p>
              <p className="text-base font-extrabold mt-0.5">${avgMonth.toLocaleString()}</p>
            </div>
          </div>

          {/* Bar chart */}
          <div className="bg-white rounded-3xl border border-border/40 shadow-sm p-4 mb-4">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">Monthly earnings</p>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} barCategoryGap="30%" margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                  onClick={(d) => d?.activePayload?.[0] && setSelected(data.find(m => m.month === d.activeLabel))}
                >
                  <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.5} />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => v === 0 ? '0' : `$${(v/1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', radius: 6 }} />
                  <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                    {data.map((entry, idx) => (
                      <Cell
                        key={idx}
                        fill={entry.month === (selected?.month || thisMonthLabel) ? 'hsl(var(--primary))' : 'hsl(var(--muted))'}
                        style={{ cursor: 'pointer' }}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Selected month detail */}
          {selected && (
            <div className="bg-white rounded-3xl border border-border/40 shadow-sm p-4">
              <MonthDetail month={selected} charges={charges} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}