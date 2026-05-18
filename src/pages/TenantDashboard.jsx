import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";

export default function TenantDashboard() {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const el = document.querySelector('meta[name="description"]');
    if (el) el.setAttribute('content', 'Your Tenurly tenant dashboard. Check your rent, submit repairs, download documents, and message your landlord.');
  }, []);
  const [tenancy, setTenancy] = useState(null);
  const [rentCharges, setRentCharges] = useState([]);
  const [maintenanceItems, setMaintenanceItems] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [u, tens, rent, maint, docs, notifs] = await Promise.all([
          base44.auth.me(),
          base44.entities.Tenancy.list(),
          base44.entities.RentCharge.list(),
          base44.entities.MaintenanceRequest.list(),
          base44.entities.Document.list(),
          base44.entities.Notification.list(),
        ]);
        setUser(u);
        const active = tens.find(t => t.status === "active") || tens[0] || null;
        setTenancy(active);
        setRentCharges(rent.slice(0, 8));
        setMaintenanceItems(maint);
        setDocuments(docs.slice(0, 6));
        setNotifications(notifs);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500 text-sm">
        Loading your tenancy…
      </div>
    );
  }

  const firstName = user?.full_name?.split(" ")[0] || "there";
  const overdueRent = rentCharges.filter(r => r.status === "overdue" || r.status === "unpaid");
  const nextDue = rentCharges.find(r => r.status === "due" || r.status === "upcoming");
  const unreadNotifs = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-50" style={{ fontFamily: "var(--font-jakarta, system-ui, sans-serif)" }}>

      {/* ─── STICKY HEADER ─── */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-[600px] mx-auto px-5 h-14 flex items-center justify-between">
          <span className="font-bold text-base text-[#0f1f3d]">🏠 Tenurly</span>
          <div className="flex items-center gap-2">
            <Link to="/notifications" className="relative w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors text-base">
              🔔
              {unreadNotifs > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadNotifs > 9 ? "9+" : unreadNotifs}
                </span>
              )}
            </Link>
            <Link to="/settings" className="w-9 h-9 rounded-full bg-[#0d9e7e] text-white flex items-center justify-center text-sm font-bold hover:bg-[#0b8a6e] transition-colors">
              {firstName.charAt(0).toUpperCase()}
            </Link>
          </div>
        </div>
      </header>

      {/* ─── MAIN ─── */}
      <main className="max-w-[600px] mx-auto px-5 pt-5 pb-6">

        {/* Greeting */}
        <div className="mb-4">
          <h1 className="text-xl font-bold text-[#0f1f3d]">Hey {firstName} 👋</h1>
          {tenancy ? (
            <p className="text-sm text-slate-500 mt-0.5">
              {tenancy.property_address || "Your property"}{tenancy.lease_end ? ` · Lease ends ${fmtDate(tenancy.lease_end)}` : ""}
            </p>
          ) : (
            <p className="text-sm text-slate-500 mt-0.5">Your tenancy overview</p>
          )}
        </div>

        {/* Overdue banner */}
        {overdueRent.length > 0 && (
          <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 text-sm text-red-800 font-medium">
            <span>⚠️ You have {overdueRent.length} overdue payment{overdueRent.length > 1 ? "s" : ""}.</span>
            <Link to="/rent" className="font-bold text-red-800 hover:underline ml-3">View →</Link>
          </div>
        )}

        {/* ─── RENT CARD ─── */}
        <div className={`bg-white rounded-[14px] border p-5 mb-4 ${overdueRent.length > 0 ? "border-red-200" : "border-slate-200"}`}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Rent status</div>
              {nextDue ? (
                <>
                  <div className="text-2xl font-bold text-[#0f1f3d]">${nextDue.amount?.toLocaleString() || "—"} due</div>
                  <div className="text-sm text-slate-500 mt-0.5">Due {fmtDate(nextDue.due_date)}</div>
                </>
              ) : overdueRent.length === 0 ? (
                <div className="text-lg font-semibold text-green-600">✓ All rent up to date</div>
              ) : (
                <div className="text-lg font-semibold text-red-600">Payment overdue</div>
              )}
            </div>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl ${overdueRent.length > 0 ? "bg-red-50" : "bg-green-50"}`}>
              {overdueRent.length > 0 ? "⚠️" : "💰"}
            </div>
          </div>

          {/* Recent payments */}
          <div className="border-t border-slate-100 pt-3">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Recent payments</div>
            {rentCharges.length === 0 ? (
              <div className="text-sm text-slate-400">No payment history yet.</div>
            ) : (
              rentCharges.slice(0, 4).map(r => (
                <div key={r.id} className="flex justify-between items-center py-1.5 text-sm border-b border-slate-50 last:border-0">
                  <span className="text-slate-700">{r.notes || "Rent"} · {fmtDate(r.due_date)}</span>
                  <RentStatusBadge status={r.status} />
                </div>
              ))
            )}
          </div>
          <Link to="/rent" className="block text-center mt-3 text-sm text-[#0d9e7e] font-semibold hover:underline">
            View full payment history →
          </Link>
        </div>

        {/* ─── REPAIRS CARD ─── */}
        <div className="bg-white rounded-[14px] border border-slate-200 p-5 mb-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-bold text-[#0f1f3d]">🔧 Repairs & maintenance</span>
            <Link to="/repairs" className="text-xs text-[#0d9e7e] font-semibold hover:underline">View all →</Link>
          </div>

          {maintenanceItems.length === 0 ? (
            <div className="text-center py-4">
              <div className="text-2xl mb-1">✅</div>
              <div className="text-sm text-slate-500">No open repair requests.</div>
            </div>
          ) : (
            <div className="flex flex-col gap-2 mb-3">
              {maintenanceItems.slice(0, 3).map(m => (
                <div key={m.id} className="flex justify-between items-center px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                  <div>
                    <div className="text-sm font-semibold text-[#0f1f3d]">{m.title || "Repair request"}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Lodged {fmtDate(m.created_date)}</div>
                  </div>
                  <RepairStatusBadge status={m.status} />
                </div>
              ))}
            </div>
          )}

          <Link
            to="/repairs"
            className="flex items-center justify-center gap-1.5 w-full py-2.5 border border-dashed border-slate-300 rounded-xl text-sm text-slate-500 font-medium hover:bg-slate-50 transition-colors"
          >
            + Log a new repair request
          </Link>
        </div>

        {/* ─── DOCUMENTS CARD ─── */}
        <div className="bg-white rounded-[14px] border border-slate-200 p-5 mb-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-bold text-[#0f1f3d]">📄 Your documents</span>
            <Link to="/documents" className="text-xs text-[#0d9e7e] font-semibold hover:underline">All documents →</Link>
          </div>

          {documents.length === 0 ? (
            <div className="text-sm text-slate-400 text-center py-3">
              No documents uploaded yet. Your landlord will add them here.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {documents.map(d => {
                const isLease = (d.type || "").toLowerCase().includes("lease");
                return (
                  <div key={d.id} className="flex items-center gap-3 px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                    <span className="text-base flex-shrink-0">{isLease ? "📋" : "📄"}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-700 truncate">{d.name || "Document"}</div>
                      <div className="text-[11px] text-slate-400 capitalize">{d.type?.replace(/_/g, " ") || "Document"}</div>
                    </div>
                    {d.file_url && (
                      <a href={d.file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#0d9e7e] font-semibold hover:underline flex-shrink-0">
                        Download
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ─── PRIVACY NOTE ─── */}
        <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex items-start gap-3 text-xs text-green-900 leading-relaxed">
          <span className="flex-shrink-0">🔒</span>
          <span>
            <strong>Your data is private.</strong> Only you and your landlord can see your information.
            Tenurly never shares your data with third parties, real estate agents, or advertisers.
          </span>
        </div>
      </main>


    </div>
  );
}

/* ─── BADGES ─── */

function RentStatusBadge({ status }) {
  const map = {
    paid:      { bg: "bg-green-50",  text: "text-green-700",  label: "Paid" },
    confirmed: { bg: "bg-green-50",  text: "text-green-700",  label: "Confirmed" },
    overdue:   { bg: "bg-red-50",    text: "text-red-700",    label: "Overdue" },
    unpaid:    { bg: "bg-red-50",    text: "text-red-700",    label: "Unpaid" },
    due:       { bg: "bg-amber-50",  text: "text-amber-700",  label: "Due" },
    upcoming:  { bg: "bg-amber-50",  text: "text-amber-700",  label: "Due soon" },
  };
  const s = map[status] || { bg: "bg-slate-50", text: "text-slate-500", label: status || "—" };
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${s.bg} ${s.text}`}>{s.label}</span>;
}

function RepairStatusBadge({ status }) {
  const map = {
    open:        { bg: "bg-red-50",   text: "text-red-700",   label: "Open — awaiting review" },
    pending:     { bg: "bg-amber-50", text: "text-amber-700", label: "Awaiting review" },
    in_progress: { bg: "bg-blue-50",  text: "text-blue-700",  label: "In progress — work being arranged" },
    scheduled:   { bg: "bg-blue-50",  text: "text-blue-700",  label: "Scheduled" },
    completed:   { bg: "bg-green-50", text: "text-green-700", label: "Resolved ✓" },
    resolved:    { bg: "bg-green-50", text: "text-green-700", label: "Resolved ✓" },
    cancelled:   { bg: "bg-slate-50", text: "text-slate-500", label: "Closed" },
  };
  const s = map[status] || map["open"];
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-center leading-tight ${s.bg} ${s.text}`} style={{ maxWidth: 140 }}>{s.label}</span>;
}

function fmtDate(str) {
  if (!str) return "–";
  return new Date(str).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
}