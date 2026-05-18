import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";

export default function LandlordDashboard() {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    document.title = 'Dashboard — Tenurly';
  }, []);
  const [properties, setProperties] = useState([]);
  const [tenancies, setTenancies] = useState([]);
  const [rentCharges, setRentCharges] = useState([]);
  const [maintenanceItems, setMaintenanceItems] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [u, props, ten, rent, maint, notifs] = await Promise.all([
          base44.auth.me(),
          base44.entities.Property.list(),
          base44.entities.Tenancy.list(),
          base44.entities.RentCharge.list(),
          base44.entities.MaintenanceRequest.list(),
          base44.entities.Notification.list(),
        ]);
        setUser(u);
        setProperties(props);
        setTenancies(ten);
        setRentCharges(rent);
        setMaintenanceItems(maint);
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
        Loading your portfolio…
      </div>
    );
  }

  const firstName = user?.full_name?.split(" ")[0] || "there";
  const isNewUser = properties.length === 0;

  const overdueCharges = rentCharges.filter(r => r.status === "overdue" || r.status === "unpaid");
  const activeTenancies = tenancies.filter(t => t.status === "active");
  const today = new Date();
  const in60Days = new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000);
  const expiringLeases = tenancies.filter(t => {
    if (!t.lease_end || t.status !== "active") return false;
    const end = new Date(t.lease_end);
    return end <= in60Days && end >= today;
  });
  const openMaintenance = maintenanceItems.filter(m => m.status !== "completed" && m.status !== "cancelled" && m.status !== "resolved" && m.status !== "closed");
  const totalMonthlyRent = activeTenancies.reduce((sum, t) => sum + (t.rent_amount || 0), 0);
  const unreadNotifs = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-50" style={{ fontFamily: "var(--font-jakarta, system-ui, sans-serif)" }}>
      {/* ─── HEADER ─── */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-[1100px] mx-auto px-6 h-14 flex items-center justify-between">
          {/* Logo + nav */}
          <div className="flex items-center gap-6">
            <span className="font-bold text-base text-[#0f1f3d]">🏠 Tenurly</span>
            <nav className="hidden md:flex items-center gap-1">
              {[
                { label: "Overview",        to: "/dashboard" },
                { label: "Properties",      to: "/properties" },
                { label: "Maintenance",     to: "/maintenance" },
                { label: "Finances",        to: "/properties" },
                { label: "Messages",        to: "/messages" },
                { label: "Lease renewals",  to: "/lease-expiry" },
                { label: "Reports & tax",   to: "/reports" },
              ].map(link => (
                <Link
                  key={link.label}
                  to={link.to}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:text-[#0f1f3d] hover:bg-slate-50 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <Link to="/notifications" className="relative w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors text-base">
              🔔
              {unreadNotifs > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadNotifs > 9 ? "9+" : unreadNotifs}
                </span>
              )}
            </Link>
            <Link to="/settings" className="w-9 h-9 rounded-full bg-[#0f1f3d] text-white flex items-center justify-center text-sm font-bold hover:bg-[#1a3460] transition-colors">
              {firstName.charAt(0).toUpperCase()}
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-[1100px] mx-auto px-6 py-7">

        {/* ─── GREETING ─── */}
        <div className="mb-5">
          <h1 className="text-xl font-bold text-[#0f1f3d] mb-0.5">
            Good {getGreeting()}, {firstName} 👋
          </h1>
          <p className="text-sm text-slate-500">
            {isNewUser
              ? "Let's get your first property set up."
              : `You're managing ${properties.length} propert${properties.length === 1 ? "y" : "ies"} with ${activeTenancies.length} active tenancies.`}
          </p>
        </div>

        {/* ─── ALERT BANNERS ─── */}
        {overdueCharges.length > 0 && (
          <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-3 text-sm text-red-800 font-medium">
            <span>⚠️ {overdueCharges.length} rent payment{overdueCharges.length > 1 ? "s are" : " is"} overdue.</span>
            <Link to="/properties" className="font-bold text-red-800 hover:underline whitespace-nowrap ml-4">View payment history →</Link>
          </div>
        )}
        {expiringLeases.length > 0 && (
          <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-3 text-sm text-amber-800 font-medium">
            <span>📅 {expiringLeases.length} lease{expiringLeases.length > 1 ? "s expire" : " expires"} within 60 days.</span>
            <Link to="/lease-expiry" className="font-bold text-amber-800 hover:underline whitespace-nowrap ml-4">Review leases →</Link>
          </div>
        )}

        {/* ─── STAT CARDS ─── */}
        {!isNewUser && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <StatCard label="Monthly rent income" value={`$${totalMonthlyRent.toLocaleString()}`} sub="active tenancies" icon="💰" bg="#eef2ff" />
            <StatCard
              label="Overdue payments"
              value={overdueCharges.length}
              sub={overdueCharges.length === 0 ? "All rent up to date ✓" : "Requires attention"}
              icon="📋"
              bg={overdueCharges.length > 0 ? "#fee2e2" : "#f0fdf4"}
              valueColor={overdueCharges.length > 0 ? "#dc2626" : "#16a34a"}
            />
            <StatCard
              label="Open maintenance jobs"
              value={openMaintenance.length}
              sub={openMaintenance.length === 0 ? "No open requests" : "Pending review"}
              icon="🔧"
              bg={openMaintenance.length > 0 ? "#fef3c7" : "#f0fdf4"}
              valueColor={openMaintenance.length > 0 ? "#d97706" : "#16a34a"}
            />
            <StatCard
              label="Leases expiring soon"
              value={expiringLeases.length}
              sub="within 60 days"
              icon="📅"
              bg={expiringLeases.length > 0 ? "#fef3c7" : "#f0fdf4"}
              valueColor={expiringLeases.length > 0 ? "#d97706" : "#16a34a"}
            />
          </div>
        )}

        {/* ─── EMPTY / ONBOARDING ─── */}
        {isNewUser ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-7">
            <h2 className="text-base font-bold text-[#0f1f3d] mb-1">Get started in 3 steps</h2>
            <p className="text-sm text-slate-500 mb-5">You're all set up. Now let's add your first property.</p>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { step: "1", icon: "🏠", title: "Add a property", desc: "Enter your property address and rooms.", to: "/properties" },
                { step: "2", icon: "✉️", title: "Invite a tenant",  desc: "Send a link by email — takes 30 seconds.", to: "/properties" },
                { step: "3", icon: "💰", title: "Set up rent tracking", desc: "Add the weekly rent amount and start date.", to: "/properties" },
              ].map(s => (
                <Link key={s.step} to={s.to} className="group block border border-slate-200 rounded-xl p-5 bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="text-2xl mb-2">{s.icon}</div>
                  <div className="font-semibold text-sm text-[#0f1f3d] mb-1">Step {s.step}: {s.title}</div>
                  <div className="text-xs text-slate-500">{s.desc}</div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          /* ─── TWO COLUMN ─── */
          <div className="grid md:grid-cols-[1fr_380px] gap-5">

            {/* LEFT */}
            <div className="flex flex-col gap-5">

              {/* Properties */}
              <Section title="Your properties" actionLabel="Manage all →" actionTo="/properties">
                {properties.length === 0 ? (
                  <EmptyMsg>No properties yet. <Link to="/properties" className="text-[#0d9e7e] font-semibold">Add your first →</Link></EmptyMsg>
                ) : (
                  <div className="flex flex-col gap-2">
                    {properties.map(p => {
                      const propTenancies = tenancies.filter(t => t.property_id === p.id && t.status === "active");
                      const propOverdue = rentCharges.filter(r =>
                        propTenancies.some(t => t.id === r.tenancy_id) &&
                        (r.status === "overdue" || r.status === "unpaid")
                      ).length;
                      return (
                        <Link key={p.id} to={`/properties/${p.id}`} className="flex items-center justify-between px-4 py-3 border border-slate-100 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-indigo-50 rounded-lg flex items-center justify-center text-base">🏠</div>
                            <div>
                              <div className="text-sm font-semibold text-[#0f1f3d]">{p.address || p.name || "Property"}</div>
                              <div className="text-xs text-slate-500">{propTenancies.length} active tenant{propTenancies.length !== 1 ? "s" : ""}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {propOverdue > 0 && (
                              <span className="bg-red-100 text-red-700 text-[11px] font-bold px-2 py-0.5 rounded-full">{propOverdue} overdue</span>
                            )}
                            <span className="text-slate-300 group-hover:text-slate-500 transition-colors">›</span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </Section>

              {/* Maintenance */}
              <Section title="Maintenance" actionLabel="View all jobs →" actionTo="/maintenance">
                {maintenanceItems.length === 0 ? (
                  <EmptyMsg>✅ No maintenance requests.</EmptyMsg>
                ) : (
                  <div className="flex flex-col gap-2">
                    {maintenanceItems.slice(0, 5).map(m => (
                      <Link key={m.id} to={`/maintenance/${m.id}`} className="flex items-center justify-between px-4 py-3 border border-slate-100 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                        <div>
                          <div className="text-sm font-semibold text-[#0f1f3d]">{m.title || "Maintenance request"}</div>
                          <div className="text-xs text-slate-400 mt-0.5">{fmtDate(m.created_date)}</div>
                        </div>
                        <MaintenanceBadge status={m.status} />
                      </Link>
                    ))}
                  </div>
                )}
              </Section>
            </div>

            {/* RIGHT */}
            <div className="flex flex-col gap-5">

              {/* Quick actions */}
              <Section title="Quick actions">
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { icon: "➕", label: "Add property",     to: "/properties" },
                    { icon: "✉️", label: "Invite tenant",    to: "/properties" },
                    { icon: "📄", label: "Upload document",  to: "/properties" },
                    { icon: "📊", label: "Reports & tax",    to: "/reports" },
                    { icon: "💸", label: "Log an expense",   to: "/properties" },
                    { icon: "📅", label: "Lease renewals",   to: "/lease-expiry" },
                  ].map(a => (
                    <Link key={a.label} to={a.to} className="flex items-center gap-2 px-3 py-2.5 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 hover:border-slate-300 transition-colors text-xs font-medium text-slate-700">
                      <span className="text-base leading-none">{a.icon}</span>
                      {a.label}
                    </Link>
                  ))}
                </div>
              </Section>

              {/* Rent overview */}
              <Section title="Rent overview" actionLabel="Payment history →" actionTo="/properties">
                {rentCharges.length === 0 ? (
                  <EmptyMsg>No rent charges yet.</EmptyMsg>
                ) : (
                  <div className="flex flex-col divide-y divide-slate-50">
                    {rentCharges.slice(0, 6).map(r => (
                      <div key={r.id} className="flex justify-between items-center py-2 text-xs">
                        <span className="text-slate-700">{r.notes || "Rent charge"} · {fmtDate(r.due_date)}</span>
                        <RentBadge status={r.status} />
                      </div>
                    ))}
                  </div>
                )}
              </Section>

              {/* Expiring leases */}
              {expiringLeases.length > 0 && (
                <Section title="⏰ Leases expiring soon" actionLabel="Manage leases →" actionTo="/lease-expiry">
                  <div className="flex flex-col divide-y divide-slate-50">
                    {expiringLeases.map(t => (
                      <div key={t.id} className="flex justify-between items-center py-2 text-xs">
                        <span className="text-slate-700">{t.tenant_name || "Tenant"}</span>
                        <span className="text-amber-600 font-semibold">{fmtDate(t.lease_end)}</span>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

            </div>
          </div>
        )}
      </main>
    </div>
  );
}

/* ─── SUB-COMPONENTS ─── */

function Section({ title, actionLabel, actionTo, children }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-bold text-[#0f1f3d]">{title}</h2>
        {actionLabel && <Link to={actionTo} className="text-xs text-[#0d9e7e] font-medium hover:underline">{actionLabel}</Link>}
      </div>
      {children}
    </div>
  );
}

function StatCard({ label, value, sub, icon, bg, valueColor = "#0f1f3d" }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4">
      <div className="flex justify-between items-start mb-2">
        <div className="text-xs text-slate-500 font-medium leading-tight">{label}</div>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0" style={{ background: bg }}>{icon}</div>
      </div>
      <div className="text-2xl font-bold leading-none mb-1" style={{ color: valueColor }}>{value}</div>
      <div className="text-[11px] text-slate-400">{sub}</div>
    </div>
  );
}

function EmptyMsg({ children }) {
  return <div className="text-center py-6 text-sm text-slate-400">{children}</div>;
}

function MaintenanceBadge({ status }) {
  const map = {
    open:        { bg: "bg-red-50",    text: "text-red-700",    label: "Open" },
    pending:     { bg: "bg-amber-50",  text: "text-amber-700",  label: "Pending" },
    in_progress: { bg: "bg-blue-50",   text: "text-blue-700",   label: "In progress" },
    scheduled:   { bg: "bg-blue-50",   text: "text-blue-700",   label: "Scheduled" },
    completed:   { bg: "bg-green-50",  text: "text-green-700",  label: "Completed" },
    resolved:    { bg: "bg-green-50",  text: "text-green-700",  label: "Resolved" },
    cancelled:   { bg: "bg-slate-50",  text: "text-slate-500",  label: "Cancelled" },
  };
  const s = map[status] || map["open"];
  return <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}>{s.label}</span>;
}

function RentBadge({ status }) {
  const map = {
    paid:      { bg: "bg-green-50",  text: "text-green-700",  label: "Paid" },
    confirmed: { bg: "bg-green-50",  text: "text-green-700",  label: "Confirmed" },
    overdue:   { bg: "bg-red-50",    text: "text-red-700",    label: "Overdue" },
    unpaid:    { bg: "bg-red-50",    text: "text-red-700",    label: "Unpaid" },
    due:       { bg: "bg-amber-50",  text: "text-amber-700",  label: "Due" },
    upcoming:  { bg: "bg-slate-50",  text: "text-slate-500",  label: "Upcoming" },
  };
  const s = map[status] || { bg: "bg-slate-50", text: "text-slate-500", label: status || "—" };
  return <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}>{s.label}</span>;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

function fmtDate(str) {
  if (!str) return "–";
  return new Date(str).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
}