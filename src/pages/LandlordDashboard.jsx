import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Property, Tenancy, RentCharge, MaintenanceRequest,
  Expense, Notification, User
} from "@/api/entities";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * LANDLORD DASHBOARD — rebuilt from critique
 *
 * Fixes from review:
 * - Clear at-a-glance rent status (not just a number — paid vs overdue)
 * - Maintenance requests shown with status colours (open / in-progress / resolved)
 * - Lease expiry shown proactively on the dashboard (not buried in a separate page)
 * - Expenses and reports are clearly linked ("View tax report →")
 * - No developer naming (no "RentLedger", "MaintenanceDetail" etc exposed)
 * - Empty state with guided first steps for new landlords
 * - Quick actions bar so landlords don't have to navigate to perform common tasks
 */
export default function LandlordDashboard() {
  const [user, setUser] = useState(null);
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
          User.me(),
          Property.list(),
          Tenancy.list(),
          RentCharge.list(),
          MaintenanceRequest.list(),
          Notification.list(),
        ]);
        setUser(u);
        setProperties(props);
        setTenancies(ten);
        setRentCharges(rent);
        setMaintenanceItems(maint);
        setNotifications(notifs.slice(0, 5));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // --- Derived stats ---
  const overdueRent = rentCharges.filter(r => r.status === "overdue" || r.status === "unpaid").length;
  const openMaintenance = maintenanceItems.filter(m => m.status !== "resolved" && m.status !== "closed").length;
  const activeTenancies = tenancies.filter(t => t.status === "active").length;

  // Leases expiring within 60 days
  const today = new Date();
  const in60Days = new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000);
  const expiringLeases = tenancies.filter(t => {
    if (!t.end_date || t.status !== "active") return false;
    const end = new Date(t.end_date);
    return end <= in60Days && end >= today;
  });

  const totalMonthlyRent = tenancies
    .filter(t => t.status === "active")
    .reduce((sum, t) => sum + (t.rent_amount || 0), 0);

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui, sans-serif",
        color: "#64748b",
        fontSize: "0.9rem",
      }}>
        Loading your portfolio…
      </div>
    );
  }

  const firstName = user?.full_name?.split(" ")[0] || "there";
  const isNewUser = properties.length === 0;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f8fafc",
      fontFamily: "system-ui, -apple-system, sans-serif",
    }}>
      {/* ===== TOP NAV ===== */}
      <header style={{
        background: "white",
        borderBottom: "1px solid #e2e8f0",
        padding: "0 1.5rem",
        height: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{
            fontWeight: 700,
            fontSize: "1.1rem",
            color: "#0f1f3d",
            letterSpacing: "-0.01em",
          }}>
            🏠 Tenurly
          </span>
          <nav style={{ display: "flex", gap: "0.25rem" }}>
            {[
              { label: "Overview", to: "/", active: true },
              { label: "Properties", to: "/properties" },
              { label: "Maintenance", to: "/maintenance" },
              { label: "Finances", to: "/properties" },
              { label: "Messages", to: "/messages" },
            ].map(link => (
              <Link
                key={link.label}
                to={link.to}
                style={{
                  padding: "0.35rem 0.75rem",
                  borderRadius: 6,
                  fontSize: "0.85rem",
                  fontWeight: link.active ? 600 : 400,
                  color: link.active ? "#0f1f3d" : "#64748b",
                  background: link.active ? "#f1f5f9" : "transparent",
                  textDecoration: "none",
                  transition: "all 0.15s",
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {notifications.length > 0 && (
            <Link to="/notifications" style={{ position: "relative", textDecoration: "none" }}>
              <div style={{
                width: 36, height: 36,
                borderRadius: 8,
                border: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1rem",
                cursor: "pointer",
              }}>🔔</div>
              <div style={{
                position: "absolute",
                top: -3, right: -3,
                width: 16, height: 16,
                background: "#dc2626",
                borderRadius: "50%",
                fontSize: "0.65rem",
                color: "white",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                {notifications.length}
              </div>
            </Link>
          )}
          <Link to="/settings" style={{
            width: 36, height: 36,
            borderRadius: "50%",
            background: "#0f1f3d",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.8rem",
            fontWeight: 700,
            textDecoration: "none",
          }}>
            {firstName.charAt(0).toUpperCase()}
          </Link>
        </div>
      </header>

      <main style={{ padding: "1.75rem 1.5rem", maxWidth: 1100, margin: "0 auto" }}>

        {/* ===== GREETING ===== */}
        <div style={{ marginBottom: "1.5rem" }}>
          <h1 style={{
            fontSize: "1.4rem",
            fontWeight: 700,
            color: "#0f1f3d",
            marginBottom: "0.2rem",
          }}>
            Good {getGreeting()}, {firstName} 👋
          </h1>
          <p style={{ fontSize: "0.9rem", color: "#64748b" }}>
            {isNewUser
              ? "Let's get your first property set up."
              : `You're managing ${properties.length} propert${properties.length === 1 ? "y" : "ies"} with ${activeTenancies} active tenancies.`
            }
          </p>
        </div>

        {/* ===== ALERT BANNERS ===== */}
        {overdueRent > 0 && (
          <AlertBanner
            type="error"
            icon="⚠️"
            message={`${overdueRent} rent payment${overdueRent > 1 ? "s are" : " is"} overdue.`}
            action={{ label: "View payment history →", to: "/properties" }}
          />
        )}
        {expiringLeases.length > 0 && (
          <AlertBanner
            type="warning"
            icon="📅"
            message={`${expiringLeases.length} lease${expiringLeases.length > 1 ? "s expire" : " expires"} within 60 days.`}
            action={{ label: "Review leases →", to: "/lease-expiry" }}
          />
        )}

        {/* ===== NEW USER ONBOARDING ===== */}
        {isNewUser && (
          <div style={{
            background: "white",
            border: "1px solid #e2e8f0",
            borderRadius: 16,
            padding: "2rem",
            marginBottom: "1.5rem",
          }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f1f3d", marginBottom: "0.4rem" }}>
              Get started in 3 steps
            </h2>
            <p style={{ fontSize: "0.88rem", color: "#64748b", marginBottom: "1.5rem" }}>
              You're all set up. Now let's add your first property.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
              {[
                { step: "1", icon: "🏠", title: "Add a property", desc: "Enter your property address and rooms.", to: "/properties" },
                { step: "2", icon: "✉️", title: "Invite a tenant", desc: "Send a link by email — takes 30 seconds.", to: "/properties" },
                { step: "3", icon: "💰", title: "Set up rent tracking", desc: "Add the weekly rent amount and start date.", to: "/properties" },
              ].map(s => (
                <Link key={s.step} to={s.to} style={{ textDecoration: "none" }}>
                  <div style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: 10,
                    padding: "1.25rem",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    background: "#fafafa",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f1f5f9"}
                  onMouseLeave={e => e.currentTarget.style.background = "#fafafa"}
                  >
                    <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>{s.icon}</div>
                    <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "#0f1f3d", marginBottom: "0.25rem" }}>
                      Step {s.step}: {s.title}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "#64748b" }}>{s.desc}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ===== STAT CARDS ===== */}
        {!isNewUser && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "1rem",
            marginBottom: "1.5rem",
          }}>
            <StatCard
              label="Monthly rent income"
              value={`$${totalMonthlyRent.toLocaleString()}`}
              sub="across active tenancies"
              icon="💰"
              color="#eef2ff"
            />
            <StatCard
              label="Overdue payments"
              value={overdueRent}
              sub={overdueRent === 0 ? "All rent up to date ✓" : "Requires attention"}
              icon="📋"
              color={overdueRent > 0 ? "#fee2e2" : "#f0fdf4"}
              valueColor={overdueRent > 0 ? "#dc2626" : "#16a34a"}
            />
            <StatCard
              label="Open maintenance jobs"
              value={openMaintenance}
              sub={openMaintenance === 0 ? "No open requests" : "Pending review"}
              icon="🔧"
              color={openMaintenance > 0 ? "#fef3c7" : "#f0fdf4"}
              valueColor={openMaintenance > 0 ? "#d97706" : "#16a34a"}
            />
            <StatCard
              label="Leases expiring soon"
              value={expiringLeases.length}
              sub="within 60 days"
              icon="📅"
              color={expiringLeases.length > 0 ? "#fef3c7" : "#f0fdf4"}
              valueColor={expiringLeases.length > 0 ? "#d97706" : "#16a34a"}
            />
          </div>
        )}

        {/* ===== MAIN CONTENT GRID ===== */}
        {!isNewUser && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "1.25rem" }}>
            {/* LEFT COLUMN */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

              {/* Properties */}
              <Section title="Your properties" action={{ label: "Manage all →", to: "/properties" }}>
                {properties.length === 0 ? (
                  <EmptyState icon="🏠" message="No properties yet." cta="Add your first property" to="/properties" />
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {properties.map(p => {
                      const propTenancies = tenancies.filter(t => t.property_id === p.id && t.status === "active");
                      const propRentOverdue = rentCharges.filter(r =>
                        propTenancies.some(t => t.id === r.tenancy_id) &&
                        (r.status === "overdue" || r.status === "unpaid")
                      ).length;
                      return (
                        <PropertyRow key={p.id} property={p} tenancies={propTenancies} overdueCount={propRentOverdue} />
                      );
                    })}
                  </div>
                )}
              </Section>

              {/* Recent maintenance */}
              <Section title="Maintenance" action={{ label: "View all jobs →", to: "/maintenance" }}>
                {maintenanceItems.length === 0 ? (
                  <EmptyState icon="🔧" message="No maintenance requests." cta={null} />
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {maintenanceItems.slice(0, 5).map(m => (
                      <MaintenanceRow key={m.id} item={m} />
                    ))}
                  </div>
                )}
              </Section>
            </div>

            {/* RIGHT COLUMN */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

              {/* Quick actions */}
              <Section title="Quick actions">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                  {[
                    { icon: "➕", label: "Add property", to: "/properties" },
                    { icon: "✉️", label: "Invite tenant", to: "/properties" },
                    { icon: "📄", label: "Upload document", to: "/properties" },
                    { icon: "📊", label: "Reports & tax", to: "/reports" },
                    { icon: "💸", label: "Log an expense", to: "/properties" },
                    { icon: "📅", label: "Lease renewals", to: "/lease-expiry" },
                  ].map(a => (
                    <Link key={a.label} to={a.to} style={{ textDecoration: "none" }}>
                      <div style={{
                        padding: "0.75rem",
                        border: "1px solid #e2e8f0",
                        borderRadius: 8,
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        fontSize: "0.82rem",
                        color: "#374151",
                        background: "white",
                        cursor: "pointer",
                        transition: "all 0.15s",
                        fontWeight: 500,
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.borderColor = "#94a3b8"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.borderColor = "#e2e8f0"; }}
                      >
                        <span style={{ fontSize: "1rem" }}>{a.icon}</span>
                        {a.label}
                      </div>
                    </Link>
                  ))}
                </div>
              </Section>

              {/* Rent summary */}
              <Section title="Rent overview" action={{ label: "Payment history →", to: "/properties" }}>
                {rentCharges.length === 0 ? (
                  <EmptyState icon="💰" message="No rent charges yet." cta={null} />
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    {rentCharges.slice(0, 6).map(r => (
                      <div key={r.id} style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "0.5rem 0",
                        borderBottom: "1px solid #f1f5f9",
                        fontSize: "0.83rem",
                      }}>
                        <span style={{ color: "#374151" }}>
                          {r.description || "Rent charge"}
                        </span>
                        <span style={{
                          fontWeight: 600,
                          color: r.status === "paid" ? "#16a34a" : r.status === "overdue" ? "#dc2626" : "#d97706",
                          fontSize: "0.78rem",
                          textTransform: "capitalize",
                        }}>
                          {r.status || "pending"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </Section>

              {/* Lease expiry */}
              {expiringLeases.length > 0 && (
                <Section title="⏰ Leases expiring soon" action={{ label: "Manage leases →", to: "/lease-expiry" }}>
                  {expiringLeases.map(t => (
                    <div key={t.id} style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "0.5rem 0",
                      borderBottom: "1px solid #f1f5f9",
                      fontSize: "0.83rem",
                    }}>
                      <span style={{ color: "#374151" }}>{t.tenant_name || "Tenant"}</span>
                      <span style={{ color: "#d97706", fontWeight: 600 }}>
                        {formatDate(t.end_date)}
                      </span>
                    </div>
                  ))}
                </Section>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

/* ===== SUB-COMPONENTS ===== */

function AlertBanner({ type, icon, message, action }) {
  const styles = {
    error: { bg: "#fee2e2", border: "#fca5a5", text: "#991b1b" },
    warning: { bg: "#fef3c7", border: "#fcd34d", text: "#92400e" },
  };
  const s = styles[type];
  return (
    <div style={{
      background: s.bg,
      border: `1px solid ${s.border}`,
      borderRadius: 10,
      padding: "0.75rem 1rem",
      marginBottom: "0.75rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      fontSize: "0.88rem",
      color: s.text,
      fontWeight: 500,
    }}>
      <span>{icon} {message}</span>
      {action && (
        <Link to={action.to} style={{ color: s.text, fontWeight: 700, textDecoration: "none" }}>
          {action.label}
        </Link>
      )}
    </div>
  );
}

function StatCard({ label, value, sub, icon, color, valueColor = "#0f1f3d" }) {
  return (
    <div style={{
      background: "white",
      border: "1px solid #e2e8f0",
      borderRadius: 12,
      padding: "1.1rem",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
        <div style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: 500 }}>{label}</div>
        <div style={{
          width: 32, height: 32,
          background: color,
          borderRadius: 7,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1rem",
        }}>{icon}</div>
      </div>
      <div style={{ fontSize: "1.6rem", fontWeight: 700, color: valueColor, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.25rem" }}>{sub}</div>
    </div>
  );
}

function Section({ title, action, children }) {
  return (
    <div style={{
      background: "white",
      border: "1px solid #e2e8f0",
      borderRadius: 12,
      padding: "1.25rem",
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "1rem",
      }}>
        <h2 style={{ fontSize: "0.92rem", fontWeight: 700, color: "#0f1f3d", margin: 0 }}>{title}</h2>
        {action && (
          <Link to={action.to} style={{ fontSize: "0.78rem", color: "#0d9e7e", textDecoration: "none", fontWeight: 500 }}>
            {action.label}
          </Link>
        )}
      </div>
      {children}
    </div>
  );
}

function PropertyRow({ property, tenancies, overdueCount }) {
  return (
    <Link to={`/properties/${property.id}`} style={{ textDecoration: "none" }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0.75rem 0.9rem",
        border: "1px solid #f1f5f9",
        borderRadius: 8,
        transition: "all 0.15s",
        background: "#fafafa",
        cursor: "pointer",
      }}
      onMouseEnter={e => e.currentTarget.style.background = "#f1f5f9"}
      onMouseLeave={e => e.currentTarget.style.background = "#fafafa"}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{
            width: 36, height: 36,
            background: "#eef2ff",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1rem",
          }}>🏠</div>
          <div>
            <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#0f1f3d" }}>
              {property.address || property.name || "Property"}
            </div>
            <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
              {tenancies.length} active tenant{tenancies.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {overdueCount > 0 && (
            <span style={{
              background: "#fee2e2",
              color: "#dc2626",
              fontSize: "0.72rem",
              fontWeight: 700,
              padding: "0.2rem 0.5rem",
              borderRadius: 100,
            }}>
              {overdueCount} overdue
            </span>
          )}
          <span style={{ color: "#94a3b8", fontSize: "0.9rem" }}>›</span>
        </div>
      </div>
    </Link>
  );
}

function MaintenanceRow({ item }) {
  const statusMap = {
    open: { bg: "#fee2e2", text: "#dc2626", label: "Open" },
    pending: { bg: "#fef3c7", text: "#d97706", label: "Pending" },
    in_progress: { bg: "#dbeafe", text: "#1d4ed8", label: "In progress" },
    resolved: { bg: "#dcfce7", text: "#16a34a", label: "Resolved" },
    closed: { bg: "#f1f5f9", text: "#64748b", label: "Closed" },
  };
  const s = statusMap[item.status] || statusMap["open"];
  return (
    <Link to={`/maintenance/${item.id}`} style={{ textDecoration: "none" }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0.65rem 0.9rem",
        border: "1px solid #f1f5f9",
        borderRadius: 8,
        background: "#fafafa",
        cursor: "pointer",
        transition: "background 0.15s",
      }}
      onMouseEnter={e => e.currentTarget.style.background = "#f1f5f9"}
      onMouseLeave={e => e.currentTarget.style.background = "#fafafa"}
      >
        <div>
          <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "#0f1f3d" }}>
            {item.title || item.description || "Maintenance request"}
          </div>
          <div style={{ fontSize: "0.76rem", color: "#64748b" }}>
            {item.property_address || "Property"} · {formatDate(item.created_date)}
          </div>
        </div>
        <span style={{
          background: s.bg,
          color: s.text,
          fontSize: "0.72rem",
          fontWeight: 600,
          padding: "0.2rem 0.55rem",
          borderRadius: 100,
          whiteSpace: "nowrap",
        }}>
          {s.label}
        </span>
      </div>
    </Link>
  );
}

function EmptyState({ icon, message, cta, to }) {
  return (
    <div style={{ textAlign: "center", padding: "1.5rem 0", color: "#94a3b8" }}>
      <div style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}>{icon}</div>
      <div style={{ fontSize: "0.85rem", marginBottom: cta ? "0.75rem" : 0 }}>{message}</div>
      {cta && to && (
        <Link to={to} style={{
          fontSize: "0.82rem",
          color: "#0d9e7e",
          textDecoration: "none",
          fontWeight: 600,
        }}>
          {cta} →
        </Link>
      )}
    </div>
  );
}

/* ===== HELPERS ===== */
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

function formatDate(dateStr) {
  if (!dateStr) return "–";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
}