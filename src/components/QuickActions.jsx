import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Home, Wrench, FileText } from 'lucide-react';
import { format } from 'date-fns';

const actions = [
  {
    label: 'Log payment',
    icon: DollarSign,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    action: (navigate) => {
      const today = format(new Date(), 'yyyy-MM-dd');
      navigate(`/properties?action=log-payment&date=${today}`);
    },
  },
  {
    label: 'Vacancy board',
    icon: Home,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    action: (navigate) => navigate('/properties'),
  },
  {
    label: 'New repair',
    icon: Wrench,
    iconBg: 'bg-orange-50',
    iconColor: 'text-orange-600',
    action: (navigate) => navigate('/maintenance?action=new'),
  },
  {
    label: 'New agreement',
    icon: FileText,
    iconBg: 'bg-violet-50',
    iconColor: 'text-violet-600',
    action: (navigate) => navigate('/properties?action=new-tenancy'),
  },
];

export default function QuickActions() {
  const navigate = useNavigate();
  return (
    <div className="grid grid-cols-4 gap-2.5">
      {actions.map(({ label, icon: Icon, iconBg, iconColor, action }) => (
        <button
          key={label}
          onClick={() => action(navigate)}
          className="bg-white rounded-2xl p-3 flex flex-col items-center gap-2 border border-border/40 shadow-sm active:scale-95 transition-transform"
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
            <Icon size={18} className={iconColor} />
          </div>
          <span className="text-[10px] font-semibold text-foreground text-center leading-tight">{label}</span>
        </button>
      ))}
    </div>
  );
}