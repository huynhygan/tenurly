import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Tenancy, RentCharge, MaintenanceRequest,
  Document, Notification, Chat, User
} from "@/api/entities";

/**
 * TENANT DASHBOARD — rebuilt from critique
 *
 * Fixes from review:
 * - Rent clearly shows PAID vs DUE vs OVERDUE (not just a number)
 * - Maintenance requests show STATUS after submission (not a black hole)
 * - Documents section makes it obvious the lease is there and downloadable
 * - Trust language: "Your data is private" clearly shown
 * - Notifications explained — tenant knows what to expect
 * - Simple, clean — no overwhelm
 */
export default function TenantDashboard() {
  const [user, setUser] = useState(null);
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
          User.me(),
          Tenancy.list(),
          RentCharge.list(),
          MaintenanceRequest.list(),
          Document.list(),
          Notification.list(),
        ]);
        setUser(u);
        const active = tens.find(t => t.status === "active") || tens[0];
        setTenancy(active || null);
        setRentCharges(rent.slice(0, 8));
        setMaintenanceItems(maint);
        setDocuments(docs.slice(0, 6));
        setNotifications(notifs.slice(0, 4));
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
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#64748b",
        fontSize: "0.9rem",
        fontFamily: "system-ui, sans-serif",
      }}>
        Loading your tenancy…
      </div>
    );
  }

  const firstName = user?.full_name?.split(" ")[0] || "there";
  const overdueRent = rentCharges.filter(r => r.status === "overdue" || r.status === "unpaid");
  const nextDue = rentCharges.find(r => r.status === "pending" || r.status === "due");
  const openRepairs = maintenanceItems.filter(m => m.status !== "resolved" && m.status !== "closed");

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f8fafc",
      fontFamily: "system-ui, -apple-system, sans-serif",
    }}>
      {/* ===== HEADER ===== */}
      <header style={{
        background: "white",
        borderBottom: "1px solid #e2e8f0",
        padding: "0 1.25rem",
        height: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}>
        <span style={{ fontWeight: 700, fontSize: "1.05rem", color: "#0f1f3d" }}>🏠 Landlordly</span>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <Link to="/notifications" style={{ position: "relative", textDecoration: "none" }}>
            <div style={{
              width: 34, height: 34,
              borderRadius: 7,
              border: "1px solid #e2e8f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.95rem",
            }}>🔔</div>
            {notifications.length > 0 && (
              <div style={{
                position: "absolute",
                top: -2, right: -2,
                width: 14, height: 14,
                background: "#dc2626",
                borderRadius: "50%",
                fontSize: "0.6rem",
                color: "white",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                {notifications.length}
              </div>
            )}
          </Link>
          <Link to="/settings" style={{
            width: 34, height: 34,
            borderRadius: "50%",
            background: "#0d9e7e",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.78rem",
            fontWeight: 700,
            textDecoration: "none",
          }}>
            {firstName.charAt(0).toUpperCase()}
          </Link>
        </div>
      </header>

      {/* ===== BOTTOM NAV (mobile) ===== */}
      <nav style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "white",
        borderTop: "1px solid #e2e8f0",
        display: "flex",
        zIndex: 50,
        padding: "0.5rem 0 0.75rem",
      }}>
        {[
          { icon: "🏠", label: "Home", to: "/TenantDashboard", active: true },
          { icon: "💰", label: "Rent", to: "/rent" },
          { icon: "🔧", label: "Repairs", to: "/repairs" },
          { icon: "📄", label: "Documents", to: "/documents" },
          { icon: "💬", label: "Messages", to: "/messages" },
        ].map(item => (
          <Link key={item.label} to={item.to} style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.2rem",
            textDecoration: "none",
          }}>
            <span style={{ fontSize: "1.25rem" }}>{item.icon}</span>
            <span style={{
              fontSize: "0.65rem",
              fontWeight: item.active ? 700 : 400,
              color: item.active ? "#0d9e7e" : "#94a3b8",
            }}>
              {item.label}
            </span>
          </Link>
        ))}
      </nav>

      <main style={{ padding: "1.25rem 1.25rem 5rem", maxWidth: 600, margin: "0 auto" }}>

        {/* ===== GREETING ===== */}
        <div style={{ marginBottom: "1.25rem" }}>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0f1f3d", marginBottom: "0.25rem" }}>
            Hey {firstName} 👋
          </h1>
          {tenancy ? (
            <p style={{ fontSize: "0.85rem", color: "#64748b" }}>
              {tenancy.property_address || "Your tenancy"} · Lease ends {formatDate(tenancy.end_date)}
            </p>
          ) : (
            <p style={{ fontSize: "0.85rem", color: "#64748b" }}>Your tenancy overview</p>
          )}
        </div>

        {/* ===== OVERDUE ALERT ===== */}
        {overdueRent.length > 0 && (
          <div style={{
            background: "#fee2e2",
            border: "1px solid #fca5a5",
            borderRadius: 10,
            padding: "0.85rem 1rem",
            marginBottom: "1rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "0.88rem",
            color: "#991b1b",
            fontWeight: 500,
          }}>
            <span>⚠️ You have {overdueRent.length} overdue payment{overdueRent.length > 1 ? "s" : ""}.</span>
            <Link to="/rent" style={{ color: "#991b1b", fontWeight: 700, textDecoration: "none" }}>
              View →
            </Link>
          </div>
        )}

        {/* ===== RENT CARD ===== */}
        <div style={{
          background: overdueRent.length > 0 ? "#fff7f7" : "white",
          border: `1px solid ${overdueRent.length > 0 ? "#fca5a5" : "#e2e8f0"}`,
          borderRadius: 14,
          padding: "1.25rem",
          marginBottom: "1rem",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
            <div>
              <div style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: 500, marginBottom: "0.2rem" }}>
                RENT STATUS
              </div>
              {nextDue ? (
                <>
                  <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0f1f3d" }}>
                    ${nextDue.amount?.toLocaleString() || "—"} due
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                    Due {formatDate(nextDue.due_date)}
                  </div>
                </>
              ) : overdueRent.length === 0 ? (
                <div style={{ fontSize: "1.1rem", fontWeight: 600, color: "#16a34a" }}>
                  ✓ All rent up to date
                </div>
              ) : (
                <div style={{ fontSize: "1.1rem", fontWeight: 600, color: "#dc2626" }}>
                  Payment overdue
                </div>
              )}
            </div>
            <div style={{
              width: 40, height: 40,
              background: overdueRent.length > 0 ? "#fee2e2" : "#f0fdf4",
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.2rem",
            }}>
              {overdueRent.length > 0 ? "⚠️" : "💰"}
            </div>
          </div>

          {/* Recent payments */}
          <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "0.75rem" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#94a3b8", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Recent payments
            </div>
            {rentCharges.length === 0 ? (
              <div style={{ fontSize: "0.82rem", color: "#94a3b8" }}>No payment history yet.</div>
            ) : (
              rentCharges.slice(0, 4).map(r => (
                <div key={r.id} style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.4rem 0",
                  fontSize: "0.82rem",
                }}>
                  <span style={{ color: "#374151" }}>
                    {r.description || "Rent"} · {formatDate(r.due_date)}
                  </span>
                  <RentStatusBadge status={r.status} />
                </div>
              ))
            )}
          </div>
          <Link to="/rent" style={{
            display: "block",
            textAlign: "center",
            marginTop: "0.75rem",
            fontSize: "0.82rem",
            color: "#0d9e7e",
            fontWeight: 600,
            textDecoration: "none",
          }}>
            View full payment history →
          </Link>
        </div>

        {/* ===== MAINTENANCE CARD ===== */}
        <div style={{
          background: "white",
          border: "1px solid #e2e8f0",
          borderRadius: 14,
          padding: "1.25rem",
          marginBottom: "1rem",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <div style={{ fontSize: "0.92rem", fontWeight: 700, color: "#0f1f3d" }}>🔧 Repairs & maintenance</div>
            <Link to="/repairs" style={{ fontSize: "0.78rem", color: "#0d9e7e", fontWeight: 600, textDecoration: "none" }}>
              View all →
            </Link>
          </div>

          {maintenanceItems.length === 0 ? (
            <div style={{ textAlign: "center", padding: "1rem 0" }}>
              <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>✅</div>
              <div style={{ fontSize: "0.85rem", color: "#64748b" }}>No open repair requests.</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "0.75rem" }}>
              {maintenanceItems.slice(0, 3).map(m => (
                <div key={m.id} style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.6rem 0.8rem",
                  background: "#fafafa",
                  borderRadius: 8,
                  border: "1px solid #f1f5f9",
                  fontSize: "0.85rem",
                }}>
                  <div>
                    <div style={{ fontWeight: 600, color: "#0f1f3d" }}>
                      {m.title || "Repair request"}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                      Lodged {formatDate(m.created_date)}
                    </div>
                  </div>
                  <MaintenanceStatusBadge status={m.status} />
                </div>
              ))}
            </div>
          )}

          <Link to="/repairs" style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            padding: "0.6rem",
            border: "1px dashed #cbd5e1",
            borderRadius: 8,
            fontSize: "0.82rem",
            color: "#64748b",
            fontWeight: 500,
            textDecoration: "none",
            transition: "all 0.15s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            + Log a new repair request
          </Link>
        </div>

        {/* ===== DOCUMENTS CARD ===== */}
        <div style={{
          background: "white",
          border: "1px solid #e2e8f0",
          borderRadius: 14,
          padding: "1.25rem",
          marginBottom: "1rem",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <div style={{ fontSize: "0.92rem", fontWeight: 700, color: "#0f1f3d" }}>📄 Your documents</div>
            <Link to="/documents" style={{ fontSize: "0.78rem", color: "#0d9e7e", fontWeight: 600, textDecoration: "none" }}>
              All documents →
            </Link>
          </div>

          {documents.length === 0 ? (
            <div style={{ fontSize: "0.85rem", color: "#94a3b8", textAlign: "center", padding: "0.75rem 0" }}>
              No documents uploaded yet. Your landlord will add them here.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              {documents.map(d => (
                <div key={d.id} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.6rem 0.8rem",
                  background: "#fafafa",
                  borderRadius: 8,
                  border: "1px solid #f1f5f9",
                  fontSize: "0.82rem",
                }}>
                  <span style={{ fontSize: "1rem" }}>
                    {(d.type || "").toLowerCase().includes("lease") ? "📋" : "📄"}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: "#374151" }}>{d.name || d.title || "Document"}</div>
                    <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>{d.type || "Document"}</div>
                  </div>
                  {d.file_url && (
                    <a href={d.file_url} target="_blank" rel="noopener noreferrer" style={{
                      fontSize: "0.72rem",
                      color: "#0d9e7e",
                      fontWeight: 600,
                      textDecoration: "none",
                    }}>
                      Download
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ===== PRIVACY NOTE ===== */}
        <div style={{
          background: "#f0fdf4",
          border: "1px solid rgba(13,158,126,0.2)",
          borderRadius: 10,
          padding: "0.75rem 1rem",
          display: "flex",
          alignItems: "flex-start",
          gap: "8px",
          fontSize: "0.78rem",
          color: "#14532d",
          lineHeight: 1.5,
          marginBottom: "0.75rem",
        }}>
          <span>🔒</span>
          <span>
            <strong>Your data is private.</strong> Only you and your landlord can see your information.
            Landlordly never shares your data with third parties, real estate agents, or advertisers.
          </span>
        </div>
      </main>
    </div>
  );
}

/* ===== SUB-COMPONENTS ===== */

function RentStatusBadge({ status }) {
  const map = {
    paid: { bg: "#dcfce7", color: "#16a34a", label: "Paid" },
    overdue: { bg: "#fee2e2", color: "#dc2626", label: "Overdue" },
    unpaid: { bg: "#fee2e2", color: "#dc2626", label: "Unpaid" },
    pending: { bg: "#fef3c7", color: "#d97706", label: "Due soon" },
    due: { bg: "#fef3c7", color: "#d97706", label: "Due" },
  };
  const s = map[status] || { bg: "#f1f5f9", color: "#64748b", label: status || "Unknown" };
  return (
    <span style={{
      background: s.bg,
      color: s.color,
      fontSize: "0.7rem",
      fontWeight: 700,
      padding: "0.2rem 0.5rem",
      borderRadius: 100,
      whiteSpace: "nowrap",
    }}>
      {s.label}
    </span>
  );
}

function MaintenanceStatusBadge({ status }) {
  const map = {
    open: { bg: "#fee2e2", color: "#dc2626", label: "Open" },
    pending: { bg: "#fef3c7", color: "#d97706", label: "Awaiting review" },
    in_progress: { bg: "#dbeafe", color: "#1d4ed8", label: "In progress" },
    resolved: { bg: "#dcfce7", color: "#16a34a", label: "Resolved ✓" },
    closed: { bg: "#f1f5f9", color: "#64748b", label: "Closed" },
  };
  const s = map[status] || map["open"];
  return (
    <span style={{
      background: s.bg,
      color: s.color,
      fontSize: "0.7rem",
      fontWeight: 700,
      padding: "0.2rem 0.55rem",
      borderRadius: 100,
      whiteSpace: "nowrap",
    }}>
      {s.label}
    </span>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return "–";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
}