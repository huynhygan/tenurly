import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";

export default function Onboarding() {
  const navigate = useNavigate();
  useEffect(() => { document.title = 'Get started — Tenurly'; }, []);
  const [selected, setSelected] = useState(null);
  const [tenantExpanded, setTenantExpanded] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleContinue() {
    if (!selected) return;
    setSaving(true);
    try {
      await base44.auth.updateMe({ current_mode: selected });
    } catch (e) {
      // non-blocking
    }
    navigate("/dashboard");
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
      fontFamily: "var(--font-jakarta, system-ui, sans-serif)",
    }}>
      {/* Logo */}
      <div style={{ marginBottom: "2.5rem", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: "0.5rem" }}>
          <div style={{ width: 38, height: 38, background: "#0f1f3d", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
              <rect x="1" y="6" width="16" height="11" rx="1.5" stroke="white" strokeWidth="1.5"/>
              <path d="M5 6V4.5a4 4 0 0 1 8 0V6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="9" cy="11.5" r="1.5" fill="white"/>
            </svg>
          </div>
          <span style={{ fontSize: "1.6rem", fontWeight: 700, color: "#0f1f3d" }}>Tenurly</span>
        </div>
        <p style={{ fontSize: "0.85rem", color: "#64748b", margin: 0 }}>
          Smart property management for self-managed landlords and their tenants.
        </p>
      </div>

      {/* Card */}
      <div style={{ background: "white", borderRadius: 20, boxShadow: "0 8px 40px rgba(15,31,61,0.1)", padding: "2.5rem 2rem", width: "100%", maxWidth: 520 }}>
        <h1 style={{ fontSize: "1.7rem", fontWeight: 700, color: "#0f1f3d", textAlign: "center", marginBottom: "0.5rem" }}>
          Welcome — who are you?
        </h1>
        <p style={{ textAlign: "center", color: "#64748b", fontSize: "0.9rem", marginBottom: "2rem", lineHeight: 1.5 }}>
          Choose your role to personalise your experience.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
          {/* Landlord */}
          <button
            onClick={() => { setSelected("landlord"); setTenantExpanded(false); }}
            style={{
              all: "unset", cursor: "pointer", display: "block",
              border: selected === "landlord" ? "2px solid #0f1f3d" : "1.5px solid #e2e8f0",
              borderRadius: 12, padding: "1.25rem",
              background: selected === "landlord" ? "#f0f4ff" : "white",
              transition: "all 0.18s",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ width: 48, height: 48, background: selected === "landlord" ? "#0f1f3d" : "#eef2ff", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", flexShrink: 0 }}>🏠</div>
              <div style={{ flex: 1, textAlign: "left" }}>
                <div style={{ fontWeight: 600, fontSize: "1rem", color: "#0f1f3d", marginBottom: "0.2rem" }}>I'm a landlord</div>
                <div style={{ fontSize: "0.82rem", color: "#64748b", lineHeight: 1.4 }}>I own or manage properties and want to track rent, handle maintenance, and manage tenants.</div>
              </div>
              <div style={{ width: 20, height: 20, borderRadius: "50%", border: selected === "landlord" ? "none" : "2px solid #e2e8f0", background: selected === "landlord" ? "#0f1f3d" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {selected === "landlord" && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
            </div>
          </button>

          {/* Tenant */}
          <button
            onClick={() => { setSelected("tenant"); setTenantExpanded(true); }}
            style={{
              all: "unset", cursor: "pointer", display: "block",
              border: selected === "tenant" ? "2px solid #0d9e7e" : "1.5px solid #e2e8f0",
              borderRadius: 12, padding: "1.25rem",
              background: selected === "tenant" ? "#e8f7f3" : "white",
              transition: "all 0.18s",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ width: 48, height: 48, background: selected === "tenant" ? "#0d9e7e" : "#e8f7f3", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", flexShrink: 0 }}>🔑</div>
              <div style={{ flex: 1, textAlign: "left" }}>
                <div style={{ fontWeight: 600, fontSize: "1rem", color: "#0f1f3d", marginBottom: "0.2rem" }}>I'm a tenant</div>
                <div style={{ fontSize: "0.82rem", color: "#64748b", lineHeight: 1.4 }}>I rent a property and want to view my rent, submit repairs, and access my documents.</div>
              </div>
              <div style={{ width: 20, height: 20, borderRadius: "50%", border: selected === "tenant" ? "none" : "2px solid #e2e8f0", background: selected === "tenant" ? "#0d9e7e" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {selected === "tenant" && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
            </div>
            {selected === "tenant" && tenantExpanded && (
              <div style={{ marginTop: "1rem", padding: "0.9rem 1rem", background: "rgba(13,158,126,0.07)", borderRadius: 8, border: "1px solid rgba(13,158,126,0.2)", fontSize: "0.82rem", color: "#0f4d3a", lineHeight: 1.55 }}>
                <strong style={{ display: "block", marginBottom: "0.3rem" }}>📩 You'll need an invite from your landlord</strong>
                Tenants can't sign up directly — your landlord sends you an invite link by email.
                If you have an invite link, <a href="/accept-invite" style={{ color: "#0d9e7e", textDecoration: "underline" }}>click here to use it</a>.
                Already accepted? Continue below to access your dashboard.
              </div>
            )}
          </button>
        </div>

        <button
          onClick={handleContinue}
          disabled={!selected || saving}
          style={{
            width: "100%", padding: "0.85rem", borderRadius: 10, border: "none",
            background: selected ? "#0f1f3d" : "#e2e8f0",
            color: selected ? "white" : "#94a3b8",
            fontSize: "0.95rem", fontWeight: 600,
            cursor: selected ? "pointer" : "not-allowed",
            transition: "all 0.18s", fontFamily: "inherit",
          }}
        >
          {saving ? "Setting up…" : selected ? `Continue as ${selected === "landlord" ? "Landlord" : "Tenant"} →` : "Select your role to continue"}
        </button>

        <div style={{ marginTop: "1.25rem", display: "flex", alignItems: "flex-start", gap: 8, padding: "0.75rem 0.9rem", background: "#f8fafc", borderRadius: 8, fontSize: "0.78rem", color: "#64748b", lineHeight: 1.5 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0d9e7e" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          Your data is private and encrypted. Tenurly never shares your information with third parties, advertisers, or real estate agents.
        </div>
      </div>

      <p style={{ marginTop: "1.5rem", fontSize: "0.85rem", color: "#64748b", textAlign: "center" }}>
        Already have an account?{" "}
        <a href="/dashboard" style={{ color: "#0d9e7e", textDecoration: "none", fontWeight: 500 }}>Go to my dashboard</a>
      </p>
    </div>
  );
}