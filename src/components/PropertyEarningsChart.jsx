import React from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { subMonths, startOfMonth, endOfMonth, format, isWithinInterval } from 'date-fns';

// Build last N months of earnings from confirmed/paid charges
export function buildMonthlyEarnings(charges, months = 6) {
  const now = new Date();
  return Array.from({ length: months }, (_, i) => {
    const d = subMonths(now, months - 1 - i);
    const start = startOfMonth(d);
    const end = endOfMonth(d);
    const total = charges
      .filter(c => ['paid', 'confirmed'].includes(c.status) && c.due_date)
      .filter(c => isWithinInterval(new Date(c.due_date), { start, end }))
      .reduce((sum, c) => sum + (c.amount || 0), 0);
    return { month: format(d, 'MMM'), fullMonth: format(d, 'MMMM yyyy'), total, date: d };
  });
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-foreground text-background text-xs font-bold px-2.5 py-1.5 rounded-xl shadow-lg">
        ${payload[0].value.toLocaleString()}
      </div>
    );
  }
  return null;
};

export default function PropertyEarningsChart({ charges, currentMonthTotal, onClick }) {
  const data = buildMonthlyEarnings(charges, 6);
  const maxVal = Math.max(...data.map(d => d.total), 1);
  const thisMonth = format(new Date(), 'MMM');

  return (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClick?.(); }}
      className="w-full mt-3 pt-3 border-t border-border/40 text-left active:opacity-80 transition-opacity"
    >
      <div className="flex items-end justify-between mb-2">
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">This month</p>
          <p className="text-base font-extrabold">${currentMonthTotal.toLocaleString()}</p>
        </div>
        <p className="text-[10px] text-primary font-semibold">View performance →</p>
      </div>
      <div className="h-14">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap="25%" margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
            <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Bar dataKey="total" radius={[4, 4, 0, 0]}>
              {data.map((entry, idx) => (
                <Cell
                  key={idx}
                  fill={entry.month === thisMonth ? 'hsl(var(--primary))' : 'hsl(var(--muted))'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </button>
  );
}