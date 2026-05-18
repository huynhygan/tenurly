import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "@/api/entities";

/**
 * ONBOARDING — replaces the technical "RoleRouter" page
 *
 * What changed from critique:
 * - "Role Router" URL/name → friendly onboarding flow
 * - Landlord vs Tenant presented as a clear, inviting choice
 * - Tenants get an explanation: "you need an invite from your landlord"
 * - Trust signals added (privacy note, no-spam promise)
 * - No technical component names shown to users
 *
 * Usage in index.jsx routes:
 *   <Route path="/role-router" element={<Onboarding />} />
 *   <Route path="/onboarding"  element={<Onboarding />} />
 *   <Route path="/"            element={<Onboarding />} />
 */
export default function Onboarding() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [tenantExpanded, setTenantExpanded] = useState(false);

  async function handleContinue() {
    if (!selected) return;
    try {
      await User.updateMyUserData({ role: selected });
    } catch (e) {
      // non-blocking — role may already be set
    }
    if (selected === "landlord") {
      navigate("/LandlordDashboard");
    } else {
      navigate("/TenantDashboard");
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #f8faff 0%, #e8f7f3 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem 1rem",
      fontFamily: "'DM Sans', system-ui, sans-serif",
    }}>
      {/* Logo */}
      <div style={{ marginBottom: "2.5rem", textAlign: "center" }}>
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "0.5rem",
        }}>
          <div style={{
            width: 38, height: 38,
            background: "#0f1f3d",
            borderRadius: 9,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
              <rect x="1" y="6" width="16" height="11" rx="1.5" stroke="white" strokeWidth="1.5"/>
              <path d="M5 6V4.5a4 4 0 0 1 8 0V6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="9" cy="11.5" r="1.5" fill="white"/>
            </svg>
          </div>
          <span style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "1.6rem", color: "#0f1f3d" }}>
            Tenurly
          </span>
        </div>
        <p style={{ fontSize: "0.85rem", color: "#64748b", margin: 0 }}>
          Smart property management for self-managed landlords and their tenants.
        </p>
      </div>

      {/* Card */}
      <div style={{
        background: "white",
        borderRadius: 20,
        boxShadow: "0 8px 40px rgba(15,31,61,0.1)",
        padding: "2.5rem 2rem",
        width: "100%",
        maxWidth: 520,
      }}>
        <h1 style={{
          fontFamily: "'DM Serif Display', Georgia, serif",
          fontSize: "1.7rem",
          color: "#0f1f3d",
          textAlign: "center",
          marginBottom: "0.5rem",
          fontWeight: 400,
        }}>
          Welcome — who are you?
        </h1>
        <p style={{
          textAlign: "center",
          color: "#64748b",
          fontSize: "0.9rem",
          marginBottom: "2rem",
          lineHeight: 1.5,
        }}>
          Your experience is personalised based on your role. You can change this later in settings.
        </p>

        {/* Role cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
          {/* Landlord */}
          <button
            onClick={() => setSelected("landlord")}
            style={{
              all: "unset",
              cursor: "pointer",
              display: "block",
              border: selected === "landlord"
                ? "2px solid #0f1f3d"
                : "1.5px solid #e2e8f0",
              borderRadius: 12,
              padding: "1.25rem 1.25rem",
              background: selected === "landlord" ? "#f0f4ff" : "white",
              transition: "all 0.18s",
              position: "relative",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{
                width: 48, height: 48,
                background: selected === "landlord" ? "#0f1f3d" : "#eef2ff",
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.4rem",
                transition: "all 0.18s",
                flexShrink: 0,
              }}>
                {selected === "landlord" ? "🏠" : "🏠"}
              </div>
              <div style={{ flex: 1, textAlign: "left" }}>
                <div style={{
                  fontWeight: 600,
                  fontSize: "1rem",
                  color: "#0f1f3d",
                  marginBottom: "0.2rem",
                }}>
                  I'm a landlord
                </div>
                <div style={{ fontSize: "0.82rem", color: "#64748b", lineHeight: 1.4 }}>
                  I own or manage properties and want to track rent, handle maintenance, and manage tenants.
                </div>
              </div>
              <div style={{
                width: 20, height: 20,
                borderRadius: "50%",
                border: selected === "landlord" ? "none" : "2px solid #e2e8f0",
                background: selected === "landlord" ? "#0f1f3d" : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "all 0.18s",
              }}>
                {selected === "landlord" && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2.5 2.5L8 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
            </div>
          </button>

          {/* Tenant */}
          <button
            onClick={() => { setSelected("tenant"); setTenantExpanded(true); }}
            style={{
              all: "unset",
              cursor: "pointer",
              display: "block",
              border: selected === "tenant"
                ? "2px solid #0d9e7e"
                : "1.5px solid #e2e8f0",
              borderRadius: 12,
              padding: "1.25rem 1.25rem",
              background: selected === "tenant" ? "#e8f7f3" : "white",
              transition: "all 0.18s",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{
                width: 48, height: 48,
                background: selected === "tenant" ? "#0d9e7e" : "#e8f7f3",
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.4rem",
                flexShrink: 0,
                transition: "all 0.18s",
              }}>
                🔑
              </div>
              <div style={{ flex: 1, textAlign: "left" }}>
                <div style={{
                  fontWeight: 600,
                  fontSize: "1rem",
                  color: "#0f1f3d",
                  marginBottom: "0.2rem",
                }}>
                  I'm a tenant
                </div>
                <div style={{ fontSize: "0.82rem", color: "#64748b", lineHeight: 1.4 }}>
                  I rent a property and want to view my rent, submit repairs, and access my documents.
                </div>
              </div>
              <div style={{
                width: 20, height: 20,
                borderRadius: "50%",
                border: selected === "tenant" ? "none" : "2px solid #e2e8f0",
                background: selected === "tenant" ? "#0d9e7e" : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "all 0.18s",
              }}>
                {selected === "tenant" && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2.5 2.5L8 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
            </div>

            {/* Tenant explainer — only visible when selected */}
            {selected === "tenant" && tenantExpanded && (
              <div style={{
                marginTop: "1rem",
                padding: "0.9rem 1rem",
                background: "rgba(13,158,126,0.07)",
                borderRadius: 8,
                border: "1px solid rgba(13,158,126,0.2)",
                fontSize: "0.82rem",
                color: "#0f4d3a",
                lineHeight: 1.55,
              }}>
                <strong style={{ display: "block", marginBottom: "0.3rem" }}>📩 You'll need an invite from your landlord</strong>
                Tenants can't sign up directly — your landlord sends you an invite link by email.
                If you have an invite link, <a href="/accept-invite" style={{ color: "#0d9e7e", textDecoration: "underline" }}>click here to use it</a>.
                Already accepted? Continue below to access your dashboard.
              </div>
            )}
          </button>
        </div>

        {/* Continue button */}
        <button
          onClick={handleContinue}
          disabled={!selected}
          style={{
            width: "100%",
            padding: "0.85rem",
            borderRadius: 10,
            border: "none",
            background: selected ? "#0f1f3d" : "#e2e8f0",
            color: selected ? "white" : "#94a3b8",
            fontSize: "0.95rem",
            fontWeight: 600,
            cursor: selected ? "pointer" : "not-allowed",
            transition: "all 0.18s",
            fontFamily: "inherit",
          }}
        >
          {selected ? `Continue as ${selected === "landlord" ? "Landlord" : "Tenant"} →` : "Select your role to continue"}
        </button>

        {/* Privacy note */}
        <div style={{
          marginTop: "1.25rem",
          display: "flex",
          alignItems: "flex-start",
          gap: 8,
          padding: "0.75rem 0.9rem",
          background: "#f8fafc",
          borderRadius: 8,
          fontSize: "0.78rem",
          color: "#64748b",
          lineHeight: 1.5,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0d9e7e" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          Your data is private and encrypted. Tenurly never shares your information with third parties, advertisers, or real estate agents.
        </div>
      </div>

      {/* Already have an account */}
      <p style={{ marginTop: "1.5rem", fontSize: "0.85rem", color: "#64748b", textAlign: "center" }}>
        Already have an account?{" "}
        <a href="/role-router" style={{ color: "#0d9e7e", textDecoration: "none", fontWeight: 500 }}>
          Sign in
        </a>
      </p>
    </div>
  );
}