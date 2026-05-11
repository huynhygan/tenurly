import React, { useState } from 'react';
import { addMonths, subMonths, format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameMonth, isSameDay, isToday, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, DollarSign, CalendarClock, Wrench } from 'lucide-react';

// Event type config
const EVENT_TYPES = {
  rent: { color: 'bg-emerald-500', dot: 'bg-emerald-500', label: 'Rent due', icon: DollarSign, pill: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  lease: { color: 'bg-violet-500', dot: 'bg-violet-500', label: 'Lease expiry', icon: CalendarClock, pill: 'bg-violet-50 text-violet-700 border-violet-200' },
  maintenance: { color: 'bg-orange-400', dot: 'bg-orange-400', label: 'Maintenance', icon: Wrench, pill: 'bg-orange-50 text-orange-700 border-orange-200' },
};

function buildEvents(charges, tenancies, maintenance) {
  const events = [];

  charges.forEach(c => {
    if (!c.due_date) return;
    events.push({ id: `rent-${c.id}`, date: c.due_date, type: 'rent', label: `$${c.amount?.toLocaleString()} due`, sub: c.tenant_name || 'Rent' });
  });

  tenancies.forEach(t => {
    if (!t.lease_end) return;
    events.push({ id: `lease-${t.id}`, date: t.lease_end, type: 'lease', label: `${t.tenant_name || 'Tenant'} lease ends`, sub: t.tenant_email || '' });
  });

  maintenance.forEach(m => {
    if (!m.scheduled_date) return;
    events.push({ id: `maint-${m.id}`, date: m.scheduled_date, type: 'maintenance', label: m.title, sub: 'Scheduled visit' });
  });

  return events;
}

function CalendarDay({ day, events, isCurrentMonth, onSelect, selected }) {
  const isSelected = selected && isSameDay(day, selected);
  const todayDay = isToday(day);
  const dots = events.slice(0, 3);

  return (
    <button
      onClick={() => onSelect(day)}
      className={`relative flex flex-col items-center py-1.5 rounded-xl transition-colors
        ${isCurrentMonth ? 'text-foreground' : 'text-muted-foreground/40'}
        ${isSelected ? 'bg-primary text-white' : todayDay ? 'bg-primary/10' : 'hover:bg-muted/60'}
      `}
    >
      <span className={`text-[13px] font-semibold leading-none ${isSelected ? 'text-white' : todayDay ? 'text-primary' : ''}`}>
        {format(day, 'd')}
      </span>
      <div className="flex gap-0.5 mt-1 h-1.5">
        {dots.map((e, i) => (
          <span key={i} className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white/80' : EVENT_TYPES[e.type]?.dot || 'bg-muted-foreground'}`} />
        ))}
      </div>
    </button>
  );
}

export default function DashboardCalendar({ charges = [], tenancies = [], maintenance = [] }) {
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date());

  const events = buildEvents(charges, tenancies, maintenance);

  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad start with empty cells
  const startPad = (getDay(monthStart) + 6) % 7; // Mon-start
  const paddedDays = [...Array(startPad).fill(null), ...days];

  const eventsForDay = (day) => events.filter(e => e.date && isSameDay(parseISO(e.date), day));
  const selectedEvents = eventsForDay(selectedDay);

  return (
    <div className="bg-white rounded-3xl border border-border/40 shadow-sm overflow-hidden">
      {/* Month navigation */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <button
          onClick={() => setViewDate(d => subMonths(d, 1))}
          className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center active:scale-95 transition-transform"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <p className="text-sm font-bold">{format(viewDate, 'MMMM yyyy')}</p>
        <button
          onClick={() => setViewDate(d => addMonths(d, 1))}
          className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center active:scale-95 transition-transform"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Day-of-week header */}
      <div className="grid grid-cols-7 px-3 pb-1">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <div key={i} className="text-center text-[10px] font-bold text-muted-foreground py-1">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 px-3 gap-y-0.5 pb-3">
        {paddedDays.map((day, i) =>
          day ? (
            <CalendarDay
              key={i}
              day={day}
              events={eventsForDay(day)}
              isCurrentMonth={isSameMonth(day, viewDate)}
              onSelect={setSelectedDay}
              selected={selectedDay}
            />
          ) : (
            <div key={i} />
          )
        )}
      </div>

      {/* Legend */}
      <div className="flex gap-3 px-4 pb-3 flex-wrap">
        {Object.entries(EVENT_TYPES).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
            <span className="text-[10px] text-muted-foreground font-medium">{cfg.label}</span>
          </div>
        ))}
      </div>

      {/* Selected day events */}
      {selectedEvents.length > 0 && (
        <div className="border-t border-border/40 px-4 py-3 space-y-2">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">{format(selectedDay, 'EEE d MMM')}</p>
          {selectedEvents.map(e => {
            const cfg = EVENT_TYPES[e.type];
            const Icon = cfg.icon;
            return (
              <div key={e.id} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border ${cfg.pill}`}>
                <div className="w-7 h-7 rounded-lg bg-white/70 flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate">{e.label}</p>
                  <p className="text-[10px] opacity-70 truncate">{e.sub}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedEvents.length === 0 && (
        <div className="border-t border-border/40 px-4 py-3">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide mb-1">{format(selectedDay, 'EEE d MMM')}</p>
          <p className="text-xs text-muted-foreground">No events on this day</p>
        </div>
      )}
    </div>
  );
}