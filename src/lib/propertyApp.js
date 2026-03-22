import { differenceInDays, parseISO, format } from 'date-fns';

export const money = (n) => `$${(n || 0).toLocaleString()}`;

export const prettyDate = (dateStr, fallback = '') => {
  if (!dateStr) return fallback;
  try { return format(parseISO(dateStr), 'd MMM yyyy'); } catch { return fallback; }
};

export const leaseSummary = (leaseEnd) => {
  if (!leaseEnd) return { days: null, label: '', status: 'expired' };
  try {
    const days = differenceInDays(parseISO(leaseEnd), new Date());
    if (days < 0) return { days, label: 'Expired', status: 'expired' };
    if (days === 0) return { days, label: 'Today', status: 'overdue' };
    if (days <= 14) return { days, label: `${days}d`, status: 'overdue' };
    if (days <= 30) return { days, label: `${days}d`, status: 'due' };
    return { days, label: `${days}d`, status: 'expiring_soon' };
  } catch { return { days: null, label: '', status: 'expired' }; }
};

export const isOpenMaintenance = (status) => ['open', 'in_progress', 'scheduled'].includes(status);

export const normalizeTenancy = (t) => ({
  ...t,
  tenant_name: t.tenant_name || t.tenant_email || 'Unknown tenant',
});

export const normalizeCharge = (c) => ({
  ...c,
  amount: c.amount || 0,
});

export const normalizeExpense = (e) => ({
  ...e,
  amount: e.amount || 0,
});

export const normalizeMaintenance = (m) => ({
  ...m,
  category: m.priority || 'medium',
  submitted_at: m.created_date,
});

export const normalizeChat = (c) => ({
  ...c,
  title: c.name || 'Chat',
});