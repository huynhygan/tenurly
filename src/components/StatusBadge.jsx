import React from 'react';
import { Badge } from "@/components/ui/badge";

const statusStyles = {
  upcoming: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'Upcoming' },
  due: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Due' },
  paid: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Paid' },
  overdue: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'Overdue' },
  confirmed: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Confirmed' },
  active: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Active' },
  expired: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', label: 'Expired' },
  terminated: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'Terminated' },
  pending: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Pending' },
  vacant: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'Vacant' },
  occupied: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Occupied' },
  maintenance: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', label: 'Maintenance' },
  open: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Open' },
  in_progress: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'In Progress' },
  scheduled: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', label: 'Scheduled' },
  completed: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Completed' },
  cancelled: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', label: 'Cancelled' },
  low: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'Low' },
  medium: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Medium' },
  high: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', label: 'High' },
  urgent: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'Urgent' },
  expiring_soon: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Expiring Soon' },
};

export default function StatusBadge({ status, label }) {
  const style = statusStyles[status] || statusStyles.pending;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text} border ${style.border}`}>
      {label || style.label}
    </span>
  );
}