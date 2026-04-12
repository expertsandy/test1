import { useState, useEffect, useReducer, useCallback } from "react";
import {
  fetchTemples, addTemple as dbAddTemple, updateTemple as dbUpdateTemple, deleteTemple as dbDeleteTemple,
  addPuja as dbAddPuja, deletePuja as dbDeletePuja,
  fetchRegistrations, addRegistration as dbAddRegistration, updateRegistrationStatus as dbUpdateStatus,
  fetchSocialLinks, addSocialLink as dbAddSocial, updateSocialLink as dbUpdateSocial, deleteSocialLink as dbDeleteSocial,
  signIn, signOut, getSession, onAuthChange,
} from "./supabase.js";

// ─── Logo ───
const LOGO_SRC = "data:image/png;base64,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";

// ─── State ───
const initialState = {
  temples: [], registrations: [], socialLinks: [],
  view: "home", selectedTemple: null, selectedPujas: [],
  adminTab: "registrations", editingTempleId: null,
  notification: null, loading: true, error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_DATA": return { ...state, temples: action.payload.temples, registrations: action.payload.registrations, socialLinks: action.payload.socialLinks || [], loading: false };
    case "SET_LOADING": return { ...state, loading: action.payload };
    case "SET_ERROR": return { ...state, error: action.payload, loading: false };
    case "SET_VIEW": return { ...state, view: action.payload };
    case "SET_ADMIN_TAB": return { ...state, adminTab: action.payload, editingTempleId: null };
    case "SELECT_TEMPLE": return { ...state, selectedTemple: action.payload, selectedPujas: [] };
    case "TOGGLE_PUJA": {
      const ex = state.selectedPujas.includes(action.payload);
      return { ...state, selectedPujas: ex ? state.selectedPujas.filter(id => id !== action.payload) : [...state.selectedPujas, action.payload] };
    }
    case "SET_TEMPLES": return { ...state, temples: action.payload };
    case "SET_REGISTRATIONS": return { ...state, registrations: action.payload };
    case "SET_EDITING_TEMPLE": return { ...state, editingTempleId: action.payload, adminTab: action.payload ? "edit-temple" : "temples" };
    case "SET_NOTIFICATION": return { ...state, notification: action.payload };
    case "CLEAR_NOTIFICATION": return { ...state, notification: null };
    case "SUBMITTED": return { ...state, view: "success", selectedPujas: [], notification: "Registration submitted!" };
    default: return state;
  }
}

// ─── Styles ───
const font = "'Noto Serif Devanagari', 'Playfair Display', Georgia, serif";
const sansFont = "'DM Sans', 'Segoe UI', sans-serif";
const C = { saffron: "#e8621e", saffronLight: "#fff3eb", saffronDark: "#c04d10", maroon: "#7b1a2c", gold: "#c9a84c", goldLight: "#faf4e0", cream: "#fdf8f0", dark: "#2d1810", mid: "#5c3d2e", light: "#8a6e5e", border: "#e8d5c4", success: "#2d7a4f", successBg: "#e8f5ee", pending: "#b8860b", pendingBg: "#fff8e1", cancelled: "#c0392b", cancelledBg: "#fde8e8" };
const inputStyle = { fontFamily: sansFont, fontSize: 14, padding: "12px 16px", borderRadius: 10, border: `1.5px solid ${C.border}`, width: "100%", boxSizing: "border-box", outline: "none", color: C.dark, background: "#fff" };
const labelStyle = { fontFamily: sansFont, fontSize: 13, fontWeight: 600, color: C.mid, marginBottom: 6, display: "block" };

function getPujaNames(t, ids) { return t ? t.pujas.filter(p => ids.includes(p.id)).map(p => p.name) : []; }

// ─── Photo Upload ───
function PhotoUpload({ label, value, onChange, size = 120 }) {
  const handleFile = (e) => { const f = e.target.files[0]; if (f) { const r = new FileReader(); r.onload = (ev) => onChange(ev.target.result); r.readAsDataURL(f); } };
  const uid = "photo_" + label.replace(/\s/g, "_") + Math.random().toString(36).slice(2, 6);
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div onClick={() => document.getElementById(uid).click()} style={{ width: size, height: size, borderRadius: 14, border: `2px dashed ${value ? C.saffron : C.border}`, background: value ? "transparent" : C.cream, cursor: "pointer", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
        <input type="file" id={uid} accept="image/*" onChange={handleFile} style={{ display: "none" }} />
        {value ? (<><img src={value} alt={label} style={{ width: "100%", height: "100%", objectFit: "cover" }} /><div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(0,0,0,0.5)", color: "#fff", fontFamily: sansFont, fontSize: 10, textAlign: "center", padding: "4px 0" }}>Change</div></>) : (<div style={{ textAlign: "center" }}><span style={{ fontSize: 28, display: "block" }}>📷</span><span style={{ fontFamily: sansFont, fontSize: 11, color: C.light }}>Upload</span></div>)}
      </div>
      {value && <button onClick={(e) => { e.stopPropagation(); onChange(null); }} style={{ fontFamily: sansFont, fontSize: 11, color: C.cancelled, background: "none", border: "none", cursor: "pointer", marginTop: 4, padding: 0 }}>Remove photo</button>}
    </div>
  );
}

// ─── Temple Banner ───
function TempleBanner({ temple, height = 120, style: extra = {} }) {
  const photo = temple.templePhoto || temple.deityPhoto;
  if (photo) return (
    <div style={{ height, position: "relative", overflow: "hidden", ...extra }}>
      <img src={photo} alt={temple.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.4), transparent)" }} />
      {temple.deityPhoto && temple.templePhoto && <div style={{ position: "absolute", bottom: 10, right: 10, width: 48, height: 48, borderRadius: 10, overflow: "hidden", border: "2px solid rgba(255,255,255,0.7)" }}><img src={temple.deityPhoto} alt="Deity" style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>}
    </div>
  );
  return <div style={{ height, background: `linear-gradient(135deg, ${C.maroon}, ${C.saffronDark})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 56, ...extra }}>{temple.icon}</div>;
}

// ─── Notification ───
function Notification({ message, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [message]);
  return <div style={{ position: "fixed", top: 20, right: 20, zIndex: 1000, background: C.success, color: "#fff", padding: "14px 24px", borderRadius: 10, fontFamily: sansFont, fontSize: 14, fontWeight: 500, boxShadow: "0 8px 30px rgba(0,0,0,0.15)", animation: "slideIn 0.3s ease" }}>✓ {message}</div>;
}

// ─── Header ───
function Header({ state, dispatch, adminUser, onLogout }) {
  const publicNav = [{ label: "🏠 Home", view: "home" }, { label: "📋 Register", view: "register" }, { label: "ℹ️ About", view: "about" }];
  const adminNav = adminUser ? [{ label: "⚙️ Admin", view: "admin" }] : [];
  const nav = [...publicNav, ...adminNav];
  return (
    <header style={{ background: `linear-gradient(135deg, ${C.maroon} 0%, ${C.saffronDark} 50%, ${C.saffron} 100%)`, position: "sticky", top: 0, zIndex: 100, boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "10px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }} onClick={() => { dispatch({ type: "SET_VIEW", payload: "home" }); dispatch({ type: "SELECT_TEMPLE", payload: null }); }}>
          <img src={LOGO_SRC} alt="Logo" style={{ width: 52, height: 52, borderRadius: 12, objectFit: "cover", border: "2px solid rgba(255,255,255,0.3)", boxShadow: "0 2px 12px rgba(0,0,0,0.25)" }} />
          <div><h1 style={{ fontFamily: font, fontSize: 20, color: C.gold, margin: 0 }}>श्री दत्तराज गुरुमाऊली</h1><p style={{ fontFamily: sansFont, fontSize: 10, color: "rgba(255,255,255,0.7)", margin: 0, letterSpacing: 1.5, textTransform: "uppercase" }}>Temple Puja Registration</p></div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {nav.map(n => <button key={n.view} onClick={() => { dispatch({ type: "SET_VIEW", payload: n.view }); if (n.view === "home") dispatch({ type: "SELECT_TEMPLE", payload: null }); }} style={{ fontFamily: sansFont, fontSize: 12, fontWeight: 600, padding: "8px 14px", borderRadius: 8, border: "none", cursor: "pointer", background: state.view === n.view ? "rgba(255,255,255,0.2)" : "transparent", color: state.view === n.view ? "#fff" : "rgba(255,255,255,0.75)" }}>{n.label}</button>)}
          {!adminUser ? (
            <button onClick={() => dispatch({ type: "SET_VIEW", payload: "login" })} style={{ fontFamily: sansFont, fontSize: 11, fontWeight: 600, padding: "6px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.3)", cursor: "pointer", background: "transparent", color: "rgba(255,255,255,0.6)", marginLeft: 4 }}>🔐 Admin</button>
          ) : (
            <button onClick={onLogout} style={{ fontFamily: sansFont, fontSize: 11, fontWeight: 600, padding: "6px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.3)", cursor: "pointer", background: "transparent", color: "rgba(255,255,255,0.6)", marginLeft: 4 }}>Logout</button>
          )}
        </div>
      </div>
    </header>
  );
}

// ─── Admin Login ───
function AdminLogin({ dispatch, onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) { setError("Enter email and password"); return; }
    setLoading(true); setError("");
    try {
      await signIn(email, password);
      onLogin();
      dispatch({ type: "SET_VIEW", payload: "admin" });
    } catch (e) {
      setError(e.message || "Invalid credentials");
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 400, margin: "60px auto", textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🔐</div>
      <h2 style={{ fontFamily: font, fontSize: 24, color: C.maroon, margin: "0 0 8px" }}>Admin Login</h2>
      <p style={{ fontFamily: sansFont, fontSize: 14, color: C.light, margin: "0 0 28px" }}>Sign in to manage temples, pujas & registrations</p>
      <div style={{ background: "#fff", borderRadius: 16, padding: 28, border: `1px solid ${C.border}`, textAlign: "left" }}>
        {error && <div style={{ fontFamily: sansFont, fontSize: 13, color: C.cancelled, background: C.cancelledBg, padding: "10px 14px", borderRadius: 8, marginBottom: 16 }}>⚠️ {error}</div>}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@example.com" style={inputStyle} type="email" onKeyDown={e => e.key === "Enter" && handleSubmit()} />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>Password</label>
          <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" style={inputStyle} type="password" onKeyDown={e => e.key === "Enter" && handleSubmit()} />
        </div>
        <button onClick={handleSubmit} disabled={loading}
          style={{ width: "100%", fontFamily: sansFont, fontSize: 15, fontWeight: 700, padding: "13px", borderRadius: 10, border: "none", cursor: "pointer", background: `linear-gradient(135deg, ${C.saffron}, ${C.saffronDark})`, color: "#fff", opacity: loading ? 0.5 : 1 }}>
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </div>
      <button onClick={() => dispatch({ type: "SET_VIEW", payload: "home" })} style={{ fontFamily: sansFont, fontSize: 13, color: C.saffron, background: "none", border: "none", cursor: "pointer", marginTop: 16, fontWeight: 600 }}>← Back to Home</button>
    </div>
  );
}

// ─── Social Icons Map ───
const SOCIAL_ICONS = {
  facebook: { color: "#1877F2", svg: '<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>' },
  instagram: { color: "#E4405F", svg: '<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>' },
  youtube: { color: "#FF0000", svg: '<path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>' },
  twitter: { color: "#000000", svg: '<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>' },
  whatsapp: { color: "#25D366", svg: '<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>' },
  telegram: { color: "#0088CC", svg: '<path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0h-.056zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>' },
  linkedin: { color: "#0A66C2", svg: '<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>' },
  website: { color: "#e8621e", svg: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>' },
};

function SocialIcon({ platform, size = 22 }) {
  const icon = SOCIAL_ICONS[platform] || SOCIAL_ICONS.website;
  return <svg width={size} height={size} viewBox="0 0 24 24" fill={icon.color} dangerouslySetInnerHTML={{ __html: icon.svg }} />;
}

// ─── About Page ───
function AboutPage({ socialLinks = [] }) {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <div style={{ width: 140, height: 140, borderRadius: 70, margin: "0 auto 20px", overflow: "hidden", border: `4px solid ${C.gold}`, boxShadow: "0 8px 32px rgba(201,168,76,0.3)" }}><img src={LOGO_SRC} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>
        <h2 style={{ fontFamily: font, fontSize: 30, color: C.maroon, margin: "0 0 6px" }}>श्री दत्तराज गुरुमाऊली</h2>
        <p style={{ fontFamily: font, fontSize: 18, color: C.gold, margin: "0 0 4px" }}>Shree Dattaraj Gurumauli</p>
        <p style={{ fontFamily: sansFont, fontSize: 14, color: C.light }}>A divine initiative for devotees and temple services</p>
      </div>
      <div style={{ background: "#fff", borderRadius: 16, padding: "28px 32px", border: `1px solid ${C.border}`, marginBottom: 20 }}>
        <h3 style={{ fontFamily: font, fontSize: 20, color: C.saffron, margin: "0 0 14px" }}>🙏 Our Mission</h3>
        <p style={{ fontFamily: sansFont, fontSize: 15, color: C.mid, lineHeight: 1.7, margin: "0 0 14px" }}>This platform is an initiative driven by <strong style={{ color: C.maroon }}>Shree Dattaraj Gurumauli</strong> to bring sacred traditions of temple worship closer to every devotee.</p>
        <p style={{ fontFamily: sansFont, fontSize: 15, color: C.mid, lineHeight: 1.7, margin: 0 }}>Our goal is to provide a seamless way for devotees to register for pujas and rituals at various temples, preserving traditions while embracing modern convenience.</p>
      </div>
      {socialLinks.length > 0 && (
        <div style={{ background: `linear-gradient(135deg, ${C.maroon}, ${C.saffronDark})`, borderRadius: 16, padding: "28px 32px", marginBottom: 20, color: "#fff", textAlign: "center" }}>
          <h3 style={{ fontFamily: font, fontSize: 20, margin: "0 0 12px", color: C.gold }}>🙏 Connect With Us</h3>
          <p style={{ fontFamily: sansFont, fontSize: 14, opacity: 0.85, margin: "0 0 20px", lineHeight: 1.7 }}>Follow us for updates on pujas, events, and community gatherings.</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
            {socialLinks.map(link => (
              <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: 10, fontFamily: sansFont, fontSize: 14, fontWeight: 700, padding: "12px 24px", borderRadius: 12, background: "#fff", color: C.maroon, textDecoration: "none", boxShadow: "0 4px 16px rgba(0,0,0,0.2)", transition: "transform 0.2s" }}>
                <SocialIcon platform={link.platform} />
                {link.label || link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Temple Card ───
function TempleCard({ temple, onSelect }) {
  const [h, setH] = useState(false);
  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} onClick={() => onSelect(temple)}
      style={{ background: "#fff", borderRadius: 16, overflow: "hidden", cursor: "pointer", border: `1px solid ${h ? C.saffron : C.border}`, boxShadow: h ? "0 12px 36px rgba(232,98,30,0.12)" : "0 2px 12px rgba(0,0,0,0.04)", transition: "all 0.3s ease", transform: h ? "translateY(-4px)" : "none" }}>
      <TempleBanner temple={temple} height={140} />
      <div style={{ padding: "18px 20px" }}>
        <h3 style={{ fontFamily: font, fontSize: 17, color: C.dark, margin: "0 0 4px" }}>{temple.name}</h3>
        <p style={{ fontFamily: sansFont, fontSize: 13, color: C.light, margin: "0 0 4px" }}>📍 {temple.location}</p>
        {temple.description && <p style={{ fontFamily: sansFont, fontSize: 12, color: C.mid, margin: "0 0 10px", lineHeight: 1.5 }}>{temple.description}</p>}
        <div style={{ fontFamily: sansFont, fontSize: 12, color: C.saffron, fontWeight: 600, background: C.saffronLight, padding: "6px 12px", borderRadius: 20, display: "inline-block" }}>{temple.pujas.length} Puja{temple.pujas.length !== 1 ? "s" : ""}</div>
      </div>
    </div>
  );
}

// ─── Puja Checkbox Card ───
function PujaCheckCard({ puja, selected, onToggle }) {
  return (
    <div onClick={onToggle} style={{ background: selected ? C.saffronLight : "#fff", borderRadius: 12, padding: "16px 20px", cursor: "pointer", border: `2px solid ${selected ? C.saffron : C.border}`, display: "flex", alignItems: "center", gap: 14, transition: "all 0.2s" }}>
      <div style={{ width: 24, height: 24, borderRadius: 7, flexShrink: 0, border: `2px solid ${selected ? C.saffron : C.border}`, background: selected ? C.saffron : "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>{selected && <span style={{ color: "#fff", fontSize: 15, fontWeight: 700 }}>✓</span>}</div>
      <div style={{ flex: 1, minWidth: 0 }}><h4 style={{ fontFamily: font, fontSize: 15, color: C.dark, margin: "0 0 3px" }}>{puja.name}</h4><p style={{ fontFamily: sansFont, fontSize: 12, color: C.light, margin: 0 }}>{puja.description}</p></div>
      <div style={{ textAlign: "right", flexShrink: 0 }}><span style={{ fontFamily: sansFont, fontSize: 16, fontWeight: 700, color: C.saffron }}>₹{puja.price}</span><br /><span style={{ fontFamily: sansFont, fontSize: 11, color: C.light }}>⏱ {puja.duration}</span></div>
    </div>
  );
}

// ─── Home Page ───
function HomePage({ state, dispatch }) {
  const sel = state.selectedTemple ? state.temples.find(t => t.id === state.selectedTemple) : null;
  const cnt = state.selectedPujas.length;
  const total = sel ? sel.pujas.filter(p => state.selectedPujas.includes(p.id)).reduce((s, p) => s + p.price, 0) : 0;
  return (
    <div>
      {!sel ? (<>
        <div style={{ textAlign: "center", marginBottom: 32 }}><h2 style={{ fontFamily: font, fontSize: 28, color: C.maroon, margin: "0 0 8px" }}>🙏 Select a Temple</h2><p style={{ fontFamily: sansFont, fontSize: 15, color: C.light }}>Choose a temple to book puja & rituals</p></div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>{state.temples.map(t => <TempleCard key={t.id} temple={t} onSelect={() => dispatch({ type: "SELECT_TEMPLE", payload: t.id })} />)}</div>
        {state.temples.length === 0 && !state.loading && <div style={{ textAlign: "center", padding: 60, color: C.light, fontFamily: sansFont }}><p style={{ fontSize: 48 }}>🛕</p><p>No temples yet. Go to Admin to add.</p></div>}
      </>) : (<>
        <button onClick={() => dispatch({ type: "SELECT_TEMPLE", payload: null })} style={{ fontFamily: sansFont, fontSize: 13, color: C.saffron, background: "none", border: "none", cursor: "pointer", marginBottom: 16, padding: 0, fontWeight: 600 }}>← Back to all temples</button>
        <div style={{ borderRadius: 16, overflow: "hidden", marginBottom: 28 }}><TempleBanner temple={sel} height={180} /><div style={{ background: `linear-gradient(135deg, ${C.maroon}, ${C.saffronDark})`, padding: "20px 32px", color: "#fff" }}><h2 style={{ fontFamily: font, fontSize: 26, margin: "0 0 4px" }}>{sel.name}</h2><p style={{ fontFamily: sansFont, fontSize: 14, opacity: 0.8, margin: 0 }}>📍 {sel.location}</p></div></div>
        <h3 style={{ fontFamily: font, fontSize: 20, color: C.maroon, margin: "0 0 18px" }}>Select Pujas & Rituals</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{sel.pujas.map(p => <PujaCheckCard key={p.id} puja={p} selected={state.selectedPujas.includes(p.id)} onToggle={() => dispatch({ type: "TOGGLE_PUJA", payload: p.id })} />)}</div>
        {cnt > 0 && <div style={{ position: "sticky", bottom: 16, marginTop: 24, background: "#fff", borderRadius: 14, padding: "16px 24px", border: `2px solid ${C.saffron}`, boxShadow: "0 -4px 24px rgba(232,98,30,0.12)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div><span style={{ fontFamily: sansFont, fontSize: 14, fontWeight: 600, color: C.dark }}>{cnt} Puja{cnt > 1 ? "s" : ""}</span><br /><span style={{ fontFamily: sansFont, fontSize: 12, color: C.light }}>{getPujaNames(sel, state.selectedPujas).join(", ")}</span></div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}><span style={{ fontFamily: sansFont, fontSize: 20, fontWeight: 700, color: C.saffron }}>₹{total}</span><button onClick={() => dispatch({ type: "SET_VIEW", payload: "register" })} style={{ fontFamily: sansFont, fontSize: 14, fontWeight: 700, padding: "11px 28px", borderRadius: 10, border: "none", cursor: "pointer", background: `linear-gradient(135deg, ${C.saffron}, ${C.saffronDark})`, color: "#fff" }}>Proceed →</button></div>
        </div>}
      </>)}
    </div>
  );
}

// ─── Registration Form ───
function RegistrationForm({ state, dispatch, onRefresh }) {
  const [form, setForm] = useState({ devoteeName: "", phone: "", email: "", gotra: "", templeId: state.selectedTemple || "", pujaIds: [...state.selectedPujas], date: "", time: "", members: 1, paymentScreenshot: null, screenshotName: "" });
  const [saving, setSaving] = useState(false);
  const temple = state.temples.find(t => t.id === form.templeId);
  const selPujas = temple ? temple.pujas.filter(p => form.pujaIds.includes(p.id)) : [];
  const grandTotal = selPujas.reduce((s, p) => s + p.price, 0) * form.members;
  const togglePuja = (id) => setForm(f => ({ ...f, pujaIds: f.pujaIds.includes(id) ? f.pujaIds.filter(x => x !== id) : [...f.pujaIds, id] }));

  const handleSubmit = async () => {
    if (!form.devoteeName || !form.phone || !form.templeId || form.pujaIds.length === 0 || !form.date) { alert("Fill all required fields & select puja"); return; }
    setSaving(true);
    try {
      await dbAddRegistration({ id: "r" + Date.now(), ...form });
      await onRefresh();
      dispatch({ type: "SUBMITTED" });
    } catch (e) { alert("Error: " + e.message); }
    setSaving(false);
  };

  const handleFile = (e) => { const f = e.target.files[0]; if (f) { const r = new FileReader(); r.onload = (ev) => setForm(fm => ({ ...fm, paymentScreenshot: ev.target.result, screenshotName: f.name })); r.readAsDataURL(f); } };

  return (
    <div style={{ maxWidth: 680, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}><h2 style={{ fontFamily: font, fontSize: 26, color: C.maroon, margin: "0 0 6px" }}>📝 Puja Registration</h2></div>
      <div style={{ background: "#fff", borderRadius: 16, padding: 28, border: `1px solid ${C.border}` }}>
        <div style={{ marginBottom: 24, padding: "18px 20px", background: C.saffronLight, borderRadius: 12 }}>
          <h3 style={{ fontFamily: font, fontSize: 16, color: C.saffron, margin: "0 0 14px" }}>🛕 Temple & Pujas</h3>
          <div style={{ marginBottom: 14 }}><label style={labelStyle}>Temple *</label><select value={form.templeId} onChange={e => setForm(f => ({ ...f, templeId: e.target.value, pujaIds: [] }))} style={{ ...inputStyle, cursor: "pointer" }}><option value="">Select Temple</option>{state.temples.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
          {temple && <div><label style={{ ...labelStyle, marginBottom: 10 }}>Pujas *</label><div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{temple.pujas.map(p => { const ck = form.pujaIds.includes(p.id); return (<div key={p.id} onClick={() => togglePuja(p.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 10, cursor: "pointer", background: ck ? "#fff" : "#fefcfa", border: `1.5px solid ${ck ? C.saffron : C.border}` }}><div style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0, border: `2px solid ${ck ? C.saffron : C.border}`, background: ck ? C.saffron : "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>{ck && <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>✓</span>}</div><div style={{ flex: 1 }}><span style={{ fontFamily: sansFont, fontSize: 14, fontWeight: 600, color: C.dark }}>{p.name}</span></div><span style={{ fontFamily: sansFont, fontSize: 14, fontWeight: 700, color: C.saffron }}>₹{p.price}</span></div>); })}</div></div>}
          {selPujas.length > 0 && <div style={{ marginTop: 14, padding: "14px 16px", background: "#fff", borderRadius: 10, border: `1px solid ${C.gold}`, fontFamily: sansFont, fontSize: 13 }}><div style={{ fontWeight: 700, color: C.maroon, marginBottom: 6 }}>🛒 Summary</div>{selPujas.map(p => <div key={p.id} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", color: C.mid }}><span>{p.name}</span><span>₹{p.price}</span></div>)}<div style={{ borderTop: `1px solid ${C.border}`, marginTop: 8, paddingTop: 8, display: "flex", justifyContent: "space-between" }}><span style={{ color: C.light }}>× {form.members}</span><span style={{ fontWeight: 700, fontSize: 16, color: C.saffron }}>Total: ₹{grandTotal}</span></div></div>}
        </div>
        <div style={{ marginBottom: 24 }}><h3 style={{ fontFamily: font, fontSize: 16, color: C.saffron, margin: "0 0 14px" }}>🙏 Devotee Details</h3><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}><div><label style={labelStyle}>Full Name *</label><input value={form.devoteeName} onChange={e => setForm(f => ({ ...f, devoteeName: e.target.value }))} placeholder="Enter full name" style={inputStyle} /></div><div><label style={labelStyle}>Gotra</label><input value={form.gotra} onChange={e => setForm(f => ({ ...f, gotra: e.target.value }))} placeholder="e.g. Kashyap" style={inputStyle} /></div><div><label style={labelStyle}>Phone *</label><input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="10-digit" style={inputStyle} type="tel" /></div><div><label style={labelStyle}>Email</label><input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@example.com" style={inputStyle} type="email" /></div></div></div>
        <div style={{ marginBottom: 24 }}><h3 style={{ fontFamily: font, fontSize: 16, color: C.saffron, margin: "0 0 14px" }}>📅 Schedule</h3><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}><div><label style={labelStyle}>Date *</label><input value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={inputStyle} type="date" /></div><div><label style={labelStyle}>Time</label><input value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} style={inputStyle} type="time" /></div><div><label style={labelStyle}>Members</label><input value={form.members} onChange={e => setForm(f => ({ ...f, members: Math.max(1, parseInt(e.target.value) || 1) }))} style={inputStyle} type="number" min="1" /></div></div></div>
        <div style={{ marginBottom: 28 }}><h3 style={{ fontFamily: font, fontSize: 16, color: C.saffron, margin: "0 0 14px" }}>💳 Payment</h3>{selPujas.length > 0 && <div style={{ background: C.goldLight, borderRadius: 10, padding: "14px 18px", marginBottom: 14, fontFamily: sansFont, fontSize: 14, border: `1px solid ${C.gold}` }}><strong>Total: ₹{grandTotal}</strong><br /><span style={{ fontSize: 12, color: C.light }}>Pay via UPI, upload screenshot</span></div>}<label style={labelStyle}>Payment Screenshot</label><div style={{ border: `2px dashed ${form.paymentScreenshot ? C.success : C.border}`, borderRadius: 12, padding: 24, textAlign: "center", cursor: "pointer", background: form.paymentScreenshot ? C.successBg : C.cream }} onClick={() => document.getElementById("fileInput").click()}><input type="file" id="fileInput" accept="image/*" onChange={handleFile} style={{ display: "none" }} />{form.paymentScreenshot ? <div>✅ <span style={{ fontFamily: sansFont, fontSize: 13, color: C.success }}>{form.screenshotName}</span></div> : <div>📤 <span style={{ fontFamily: sansFont, fontSize: 13, color: C.light }}>Click to upload</span></div>}</div></div>
        <button onClick={handleSubmit} disabled={form.pujaIds.length === 0 || saving} style={{ width: "100%", fontFamily: sansFont, fontSize: 16, fontWeight: 700, padding: 14, borderRadius: 12, border: "none", cursor: "pointer", background: `linear-gradient(135deg, ${C.saffron}, ${C.saffronDark})`, color: "#fff", opacity: form.pujaIds.length === 0 || saving ? 0.5 : 1 }}>{saving ? "Submitting..." : `🙏 Submit (${selPujas.length} Puja${selPujas.length !== 1 ? "s" : ""})`}</button>
      </div>
    </div>
  );
}

function SuccessPage({ dispatch }) {
  return (<div style={{ textAlign: "center", padding: "60px 20px" }}><span style={{ fontSize: 72 }}>🎉</span><h2 style={{ fontFamily: font, fontSize: 28, color: C.maroon, margin: "16px 0 8px" }}>Registration Successful!</h2><p style={{ fontFamily: sansFont, fontSize: 15, color: C.light, maxWidth: 420, margin: "0 auto 28px" }}>Our coordinator will confirm shortly.</p><div style={{ display: "flex", gap: 12, justifyContent: "center" }}><button onClick={() => dispatch({ type: "SET_VIEW", payload: "home" })} style={{ fontFamily: sansFont, fontSize: 14, fontWeight: 600, padding: "12px 28px", borderRadius: 10, border: `2px solid ${C.saffron}`, cursor: "pointer", background: "transparent", color: C.saffron }}>← Home</button></div></div>);
}

function StatusBadge({ status }) {
  const m = { confirmed: { bg: C.successBg, c: C.success, l: "✓ Confirmed" }, pending: { bg: C.pendingBg, c: C.pending, l: "⏳ Pending" }, cancelled: { bg: C.cancelledBg, c: C.cancelled, l: "✗ Cancelled" } };
  const s = m[status] || m.pending;
  return <span style={{ fontFamily: sansFont, fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 6, background: s.bg, color: s.c, textTransform: "uppercase" }}>{s.l}</span>;
}

// ─── Admin ───
function AdminPanel({ state, dispatch, onRefresh }) {
  const tabs = [{ key: "registrations", label: "📋 Registrations", count: state.registrations.length }, { key: "temples", label: "🛕 Temples", count: state.temples.length }, { key: "add-temple", label: "➕ Add Temple" }, { key: "add-puja", label: "➕ Add Puja" }, { key: "social-links", label: "🔗 Social Links" }];
  return (
    <div>
      <h2 style={{ fontFamily: font, fontSize: 26, color: C.maroon, margin: "0 0 20px" }}>⚙️ Admin Dashboard</h2>
      <div style={{ display: "flex", gap: 6, marginBottom: 24, flexWrap: "wrap" }}>{tabs.map(t => <button key={t.key} onClick={() => dispatch({ type: "SET_ADMIN_TAB", payload: t.key })} style={{ fontFamily: sansFont, fontSize: 13, fontWeight: 600, padding: "10px 18px", borderRadius: 10, border: `1.5px solid ${state.adminTab === t.key ? C.saffron : C.border}`, cursor: "pointer", background: state.adminTab === t.key ? C.saffronLight : "#fff", color: state.adminTab === t.key ? C.saffron : C.mid }}>{t.label} {t.count !== undefined && <span style={{ background: C.saffron, color: "#fff", borderRadius: 10, padding: "2px 8px", marginLeft: 6, fontSize: 11 }}>{t.count}</span>}</button>)}</div>
      {state.adminTab === "registrations" && <RegistrationsList state={state} dispatch={dispatch} onRefresh={onRefresh} />}
      {state.adminTab === "temples" && <TemplesList state={state} dispatch={dispatch} onRefresh={onRefresh} />}
      {state.adminTab === "add-temple" && <AddTempleForm dispatch={dispatch} onRefresh={onRefresh} />}
      {state.adminTab === "edit-temple" && <EditTempleForm state={state} dispatch={dispatch} onRefresh={onRefresh} />}
      {state.adminTab === "add-puja" && <AddPujaForm state={state} dispatch={dispatch} onRefresh={onRefresh} />}
      {state.adminTab === "social-links" && <SocialLinksManager state={state} dispatch={dispatch} onRefresh={onRefresh} />}
      <div style={{ marginTop: 36, padding: "12px 18px", background: C.successBg, borderRadius: 10, fontFamily: sansFont, fontSize: 13, color: C.success }}>💾 Connected to Supabase — all data synced to cloud database</div>
    </div>
  );
}

// ─── Registrations List ───
function RegistrationsList({ state, dispatch, onRefresh }) {
  const [exp, setExp] = useState(null);
  const handleStatus = async (id, status) => {
    try { await dbUpdateStatus(id, status); await onRefresh(); dispatch({ type: "SET_NOTIFICATION", payload: `Status: ${status}` }); }
    catch (e) { alert("Error: " + e.message); }
  };
  return (
    <div>{state.registrations.length === 0 ? <div style={{ textAlign: "center", padding: 48, color: C.light, fontFamily: sansFont }}>No registrations yet.</div> : <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{state.registrations.map(r => {
      const temple = state.temples.find(t => t.id === r.templeId); const ids = r.pujaIds || []; const bk = temple ? temple.pujas.filter(p => ids.includes(p.id)) : []; const amt = bk.reduce((s, p) => s + p.price, 0) * (r.members || 1); const open = exp === r.id;
      return (<div key={r.id} style={{ background: "#fff", borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden" }}>
        <div onClick={() => setExp(open ? null : r.id)} style={{ padding: "16px 20px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}><div style={{ width: 40, height: 40, borderRadius: 10, background: C.saffronLight, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font, fontSize: 18, color: C.saffron, fontWeight: 700 }}>{r.devoteeName.charAt(0)}</div><div><h4 style={{ fontFamily: sansFont, fontSize: 14, fontWeight: 600, color: C.dark, margin: 0 }}>{r.devoteeName}</h4><p style={{ fontFamily: sansFont, fontSize: 12, color: C.light, margin: 0 }}>{temple?.name || "—"} — {bk.map(p => p.name).join(", ") || "—"}</p></div></div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>{bk.length > 1 && <span style={{ fontFamily: sansFont, fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 6, background: C.goldLight, color: C.gold }}>{bk.length}</span>}<span style={{ fontFamily: sansFont, fontSize: 12, color: C.light }}>{r.date}</span><StatusBadge status={r.status} /><span style={{ fontSize: 12, color: C.light }}>{open ? "▲" : "▼"}</span></div>
        </div>
        {open && <div style={{ padding: "0 20px 20px", borderTop: `1px solid ${C.border}` }}>
          <div style={{ marginTop: 16, marginBottom: 16, padding: "14px 16px", background: C.saffronLight, borderRadius: 10, fontFamily: sansFont, fontSize: 13 }}><div style={{ fontWeight: 700, color: C.maroon, marginBottom: 8 }}>🪔 Booked Pujas</div>{bk.map(p => <div key={p.id} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", color: C.mid }}><span>{p.name}</span><span>₹{p.price}</span></div>)}<div style={{ borderTop: `1px solid ${C.border}`, marginTop: 8, paddingTop: 8, display: "flex", justifyContent: "space-between" }}><span style={{ color: C.light }}>× {r.members || 1}</span><span style={{ fontWeight: 700, color: C.saffron }}>₹{amt}</span></div></div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14 }}>{[{ l: "Phone", v: r.phone }, { l: "Email", v: r.email || "—" }, { l: "Gotra", v: r.gotra || "—" }, { l: "Time", v: r.time || "Flexible" }].map(i => <div key={i.l}><p style={{ fontFamily: sansFont, fontSize: 11, color: C.light, margin: "0 0 2px", textTransform: "uppercase" }}>{i.l}</p><p style={{ fontFamily: sansFont, fontSize: 14, color: C.dark, margin: 0, fontWeight: 500 }}>{i.v}</p></div>)}</div>
          {r.paymentScreenshot && <div style={{ marginTop: 14 }}><img src={r.paymentScreenshot} alt="Payment" style={{ maxWidth: 240, borderRadius: 8, border: `1px solid ${C.border}` }} /></div>}
          <div style={{ marginTop: 16, display: "flex", gap: 8 }}>{["confirmed", "pending", "cancelled"].map(s => <button key={s} onClick={() => handleStatus(r.id, s)} style={{ fontFamily: sansFont, fontSize: 12, fontWeight: 600, padding: "7px 16px", borderRadius: 8, cursor: "pointer", textTransform: "capitalize", border: r.status === s ? "none" : `1px solid ${C.border}`, background: r.status === s ? C.saffron : "#fff", color: r.status === s ? "#fff" : C.mid }}>{s}</button>)}</div>
        </div>}
      </div>);
    })}</div>}</div>
  );
}

// ─── Temples List ───
function TemplesList({ state, dispatch, onRefresh }) {
  const handleDelete = async (id) => { if (!confirm("Remove temple?")) return; try { await dbDeleteTemple(id); await onRefresh(); dispatch({ type: "SET_NOTIFICATION", payload: "Temple removed" }); } catch (e) { alert(e.message); } };
  const handleDeletePuja = async (id) => { try { await dbDeletePuja(id); await onRefresh(); dispatch({ type: "SET_NOTIFICATION", payload: "Puja removed" }); } catch (e) { alert(e.message); } };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>{state.temples.map(t => (
      <div key={t.id} style={{ background: "#fff", borderRadius: 14, border: `1px solid ${C.border}`, overflow: "hidden" }}>
        {(t.templePhoto || t.deityPhoto) && <TempleBanner temple={t} height={100} />}
        <div style={{ padding: "16px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>{!t.templePhoto && !t.deityPhoto && <span style={{ fontSize: 32 }}>{t.icon}</span>}<div><h3 style={{ fontFamily: font, fontSize: 17, color: C.dark, margin: 0 }}>{t.name}</h3><p style={{ fontFamily: sansFont, fontSize: 13, color: C.light, margin: 0 }}>📍 {t.location}</p></div></div>
            <div style={{ display: "flex", gap: 6 }}><button onClick={() => dispatch({ type: "SET_EDITING_TEMPLE", payload: t.id })} style={{ fontFamily: sansFont, fontSize: 12, padding: "6px 14px", borderRadius: 8, border: `1px solid ${C.saffron}`, background: "transparent", color: C.saffron, cursor: "pointer" }}>✏️ Edit</button><button onClick={() => handleDelete(t.id)} style={{ fontFamily: sansFont, fontSize: 12, padding: "6px 14px", borderRadius: 8, border: `1px solid ${C.cancelled}`, background: "transparent", color: C.cancelled, cursor: "pointer" }}>Remove</button></div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{t.pujas.map(p => <div key={p.id} style={{ fontFamily: sansFont, fontSize: 13, padding: "8px 14px", borderRadius: 8, background: C.cream, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10 }}><span>{p.name} — ₹{p.price}</span><button onClick={() => handleDeletePuja(p.id)} style={{ background: "none", border: "none", cursor: "pointer", color: C.cancelled, fontSize: 14 }}>✕</button></div>)}</div>
        </div>
      </div>
    ))}</div>
  );
}

// ─── Add Temple ───
function AddTempleForm({ dispatch, onRefresh }) {
  const [f, setF] = useState({ name: "", location: "", icon: "🛕", description: "", deityPhoto: null, templePhoto: null });
  const [saving, setSaving] = useState(false);
  const emojis = ["🛕", "🕉️", "🪷", "🔱", "⛩️", "🙏", "🪔", "📿"];
  const handleSubmit = async () => {
    if (!f.name || !f.location) { alert("Fill name & location"); return; }
    setSaving(true);
    try { await dbAddTemple({ id: "t" + Date.now(), ...f, pujas: [] }); await onRefresh(); dispatch({ type: "SET_ADMIN_TAB", payload: "temples" }); dispatch({ type: "SET_NOTIFICATION", payload: "Temple added!" }); }
    catch (e) { alert(e.message); }
    setSaving(false);
  };
  return (
    <div style={{ maxWidth: 560, background: "#fff", borderRadius: 14, padding: 28, border: `1px solid ${C.border}` }}>
      <h3 style={{ fontFamily: font, fontSize: 18, color: C.maroon, margin: "0 0 18px" }}>➕ Add New Temple</h3>
      <div style={{ marginBottom: 16 }}><label style={labelStyle}>Name *</label><input value={f.name} onChange={e => setF(x => ({ ...x, name: e.target.value }))} placeholder="e.g. Shree Kashi Vishwanath" style={inputStyle} /></div>
      <div style={{ marginBottom: 16 }}><label style={labelStyle}>Location *</label><input value={f.location} onChange={e => setF(x => ({ ...x, location: e.target.value }))} placeholder="e.g. Varanasi, UP" style={inputStyle} /></div>
      <div style={{ marginBottom: 16 }}><label style={labelStyle}>Description</label><textarea value={f.description} onChange={e => setF(x => ({ ...x, description: e.target.value }))} placeholder="Brief description" rows={2} style={{ ...inputStyle, resize: "vertical" }} /></div>
      <div style={{ marginBottom: 16 }}><label style={labelStyle}>Icon</label><div style={{ display: "flex", gap: 6 }}>{emojis.map(e => <button key={e} onClick={() => setF(x => ({ ...x, icon: e }))} style={{ fontSize: 24, padding: "6px 10px", borderRadius: 8, cursor: "pointer", border: f.icon === e ? `2px solid ${C.saffron}` : `1px solid ${C.border}`, background: f.icon === e ? C.saffronLight : "#fff" }}>{e}</button>)}</div></div>
      <div style={{ display: "flex", gap: 24, marginBottom: 20 }}><PhotoUpload label="Deity Photo" value={f.deityPhoto} onChange={v => setF(x => ({ ...x, deityPhoto: v }))} /><PhotoUpload label="Temple Photo" value={f.templePhoto} onChange={v => setF(x => ({ ...x, templePhoto: v }))} /></div>
      <button onClick={handleSubmit} disabled={saving} style={{ fontFamily: sansFont, fontSize: 14, fontWeight: 700, padding: "12px 32px", borderRadius: 10, border: "none", cursor: "pointer", background: C.saffron, color: "#fff", opacity: saving ? 0.5 : 1 }}>{saving ? "Adding..." : "➕ Add Temple"}</button>
    </div>
  );
}

// ─── Edit Temple ───
function EditTempleForm({ state, dispatch, onRefresh }) {
  const temple = state.temples.find(t => t.id === state.editingTempleId);
  const [f, setF] = useState(temple ? { name: temple.name, location: temple.location, icon: temple.icon, description: temple.description || "", deityPhoto: temple.deityPhoto, templePhoto: temple.templePhoto } : {});
  const [saving, setSaving] = useState(false);
  const emojis = ["🛕", "🕉️", "🪷", "🔱", "⛩️", "🙏", "🪔", "📿"];
  if (!temple) return <p>Temple not found.</p>;
  const handleSave = async () => {
    if (!f.name || !f.location) { alert("Fill name & location"); return; }
    setSaving(true);
    try { await dbUpdateTemple({ id: temple.id, ...f }); await onRefresh(); dispatch({ type: "SET_ADMIN_TAB", payload: "temples" }); dispatch({ type: "SET_NOTIFICATION", payload: "Temple updated!" }); }
    catch (e) { alert(e.message); }
    setSaving(false);
  };
  return (
    <div style={{ maxWidth: 560, background: "#fff", borderRadius: 14, padding: 28, border: `1px solid ${C.border}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}><h3 style={{ fontFamily: font, fontSize: 18, color: C.maroon, margin: 0 }}>✏️ Edit Temple</h3><button onClick={() => dispatch({ type: "SET_EDITING_TEMPLE", payload: null })} style={{ fontFamily: sansFont, fontSize: 13, color: C.saffron, background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>← Back</button></div>
      <div style={{ marginBottom: 16 }}><label style={labelStyle}>Name *</label><input value={f.name} onChange={e => setF(x => ({ ...x, name: e.target.value }))} style={inputStyle} /></div>
      <div style={{ marginBottom: 16 }}><label style={labelStyle}>Location *</label><input value={f.location} onChange={e => setF(x => ({ ...x, location: e.target.value }))} style={inputStyle} /></div>
      <div style={{ marginBottom: 16 }}><label style={labelStyle}>Description</label><textarea value={f.description} onChange={e => setF(x => ({ ...x, description: e.target.value }))} rows={2} style={{ ...inputStyle, resize: "vertical" }} /></div>
      <div style={{ marginBottom: 16 }}><label style={labelStyle}>Icon</label><div style={{ display: "flex", gap: 6 }}>{emojis.map(e => <button key={e} onClick={() => setF(x => ({ ...x, icon: e }))} style={{ fontSize: 24, padding: "6px 10px", borderRadius: 8, cursor: "pointer", border: f.icon === e ? `2px solid ${C.saffron}` : `1px solid ${C.border}`, background: f.icon === e ? C.saffronLight : "#fff" }}>{e}</button>)}</div></div>
      <div style={{ display: "flex", gap: 24, marginBottom: 24 }}><PhotoUpload label="Deity Photo" value={f.deityPhoto} onChange={v => setF(x => ({ ...x, deityPhoto: v }))} /><PhotoUpload label="Temple Photo" value={f.templePhoto} onChange={v => setF(x => ({ ...x, templePhoto: v }))} /></div>
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={handleSave} disabled={saving} style={{ fontFamily: sansFont, fontSize: 14, fontWeight: 700, padding: "12px 32px", borderRadius: 10, border: "none", cursor: "pointer", background: C.saffron, color: "#fff", opacity: saving ? 0.5 : 1 }}>{saving ? "Saving..." : "💾 Save"}</button>
        <button onClick={() => dispatch({ type: "SET_EDITING_TEMPLE", payload: null })} style={{ fontFamily: sansFont, fontSize: 14, padding: "12px 24px", borderRadius: 10, border: `1.5px solid ${C.border}`, cursor: "pointer", background: "#fff", color: C.mid }}>Cancel</button>
      </div>
    </div>
  );
}

// ─── Add Puja ───
function AddPujaForm({ state, dispatch, onRefresh }) {
  const [f, setF] = useState({ templeId: "", name: "", price: "", duration: "", description: "" });
  const [saving, setSaving] = useState(false);
  const handleSubmit = async () => {
    if (!f.templeId || !f.name || !f.price) { alert("Fill required fields"); return; }
    setSaving(true);
    try { await dbAddPuja(f.templeId, { id: "p" + Date.now(), name: f.name, price: parseInt(f.price), duration: f.duration || "30 min", description: f.description }); await onRefresh(); dispatch({ type: "SET_ADMIN_TAB", payload: "temples" }); dispatch({ type: "SET_NOTIFICATION", payload: "Puja added!" }); }
    catch (e) { alert(e.message); }
    setSaving(false);
  };
  return (
    <div style={{ maxWidth: 480, background: "#fff", borderRadius: 14, padding: 28, border: `1px solid ${C.border}` }}>
      <h3 style={{ fontFamily: font, fontSize: 18, color: C.maroon, margin: "0 0 18px" }}>➕ Add Puja</h3>
      <div style={{ marginBottom: 16 }}><label style={labelStyle}>Temple *</label><select value={f.templeId} onChange={e => setF(x => ({ ...x, templeId: e.target.value }))} style={{ ...inputStyle, cursor: "pointer" }}><option value="">Select</option>{state.temples.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
      <div style={{ marginBottom: 16 }}><label style={labelStyle}>Puja Name *</label><input value={f.name} onChange={e => setF(x => ({ ...x, name: e.target.value }))} placeholder="e.g. Rudrabhishek" style={inputStyle} /></div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}><div><label style={labelStyle}>Price (₹) *</label><input value={f.price} onChange={e => setF(x => ({ ...x, price: e.target.value }))} placeholder="1100" style={inputStyle} type="number" /></div><div><label style={labelStyle}>Duration</label><input value={f.duration} onChange={e => setF(x => ({ ...x, duration: e.target.value }))} placeholder="1 hr" style={inputStyle} /></div></div>
      <div style={{ marginBottom: 20 }}><label style={labelStyle}>Description</label><textarea value={f.description} onChange={e => setF(x => ({ ...x, description: e.target.value }))} placeholder="Brief description" rows={3} style={{ ...inputStyle, resize: "vertical" }} /></div>
      <button onClick={handleSubmit} disabled={saving} style={{ fontFamily: sansFont, fontSize: 14, fontWeight: 700, padding: "12px 32px", borderRadius: 10, border: "none", cursor: "pointer", background: C.saffron, color: "#fff", opacity: saving ? 0.5 : 1 }}>{saving ? "Adding..." : "➕ Add Puja"}</button>
    </div>
  );
}

// ─── Social Links Manager ───
function SocialLinksManager({ state, dispatch, onRefresh }) {
  const platforms = ["facebook", "instagram", "youtube", "twitter", "whatsapp", "telegram", "linkedin", "website"];
  const [f, setF] = useState({ platform: "facebook", url: "", label: "" });
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!f.url) { alert("Enter a URL"); return; }
    setSaving(true);
    try {
      await dbAddSocial({ id: "sl" + Date.now(), platform: f.platform, url: f.url, label: f.label, sort_order: state.socialLinks.length });
      await onRefresh();
      setF({ platform: "facebook", url: "", label: "" });
      dispatch({ type: "SET_NOTIFICATION", payload: "Social link added!" });
    } catch (e) { alert(e.message); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    try { await dbDeleteSocial(id); await onRefresh(); dispatch({ type: "SET_NOTIFICATION", payload: "Link removed" }); }
    catch (e) { alert(e.message); }
  };

  return (
    <div style={{ maxWidth: 600 }}>
      <h3 style={{ fontFamily: font, fontSize: 18, color: C.maroon, margin: "0 0 18px" }}>🔗 Manage Social Links</h3>
      <p style={{ fontFamily: sansFont, fontSize: 13, color: C.light, margin: "0 0 20px" }}>These links appear on the About page for devotees to follow you.</p>

      {/* Existing links */}
      {state.socialLinks.length > 0 && (
        <div style={{ marginBottom: 24, display: "flex", flexDirection: "column", gap: 10 }}>
          {state.socialLinks.map(link => (
            <div key={link.id} style={{ background: "#fff", borderRadius: 12, padding: "14px 18px", border: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 14 }}>
              <SocialIcon platform={link.platform} size={28} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={{ fontFamily: sansFont, fontSize: 14, fontWeight: 600, color: C.dark, margin: "0 0 2px", textTransform: "capitalize" }}>{link.label || link.platform}</h4>
                <p style={{ fontFamily: sansFont, fontSize: 12, color: C.light, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{link.url}</p>
              </div>
              <button onClick={() => handleDelete(link.id)} style={{ fontFamily: sansFont, fontSize: 12, padding: "6px 12px", borderRadius: 8, border: `1px solid ${C.cancelled}`, background: "transparent", color: C.cancelled, cursor: "pointer" }}>Remove</button>
            </div>
          ))}
        </div>
      )}

      {state.socialLinks.length === 0 && (
        <div style={{ textAlign: "center", padding: 32, background: C.cream, borderRadius: 12, marginBottom: 24, fontFamily: sansFont, color: C.light }}>
          <span style={{ fontSize: 32, display: "block", marginBottom: 8 }}>🔗</span>
          No social links yet. Add your first one below.
        </div>
      )}

      {/* Add new link */}
      <div style={{ background: "#fff", borderRadius: 14, padding: 24, border: `1px solid ${C.border}` }}>
        <h4 style={{ fontFamily: sansFont, fontSize: 15, fontWeight: 700, color: C.dark, margin: "0 0 16px" }}>➕ Add New Link</h4>
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Platform</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {platforms.map(p => (
              <button key={p} onClick={() => setF(x => ({ ...x, platform: p }))}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, cursor: "pointer", fontFamily: sansFont, fontSize: 13, fontWeight: 600, textTransform: "capitalize", border: f.platform === p ? `2px solid ${C.saffron}` : `1px solid ${C.border}`, background: f.platform === p ? C.saffronLight : "#fff", color: f.platform === p ? C.saffron : C.mid }}>
                <SocialIcon platform={p} size={18} /> {p}
              </button>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>URL *</label>
          <input value={f.url} onChange={e => setF(x => ({ ...x, url: e.target.value }))} placeholder="https://www.facebook.com/yourpage" style={inputStyle} />
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>Button Label <span style={{ fontWeight: 400, color: C.light }}>(optional, defaults to platform name)</span></label>
          <input value={f.label} onChange={e => setF(x => ({ ...x, label: e.target.value }))} placeholder="e.g. Follow on Facebook" style={inputStyle} />
        </div>
        <button onClick={handleAdd} disabled={saving}
          style={{ fontFamily: sansFont, fontSize: 14, fontWeight: 700, padding: "12px 28px", borderRadius: 10, border: "none", cursor: "pointer", background: C.saffron, color: "#fff", opacity: saving ? 0.5 : 1 }}>
          {saving ? "Adding..." : "➕ Add Social Link"}
        </button>
      </div>
    </div>
  );
}

// ─── App ───
export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [adminUser, setAdminUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const refreshData = useCallback(async () => {
    try {
      const [temples, registrations, socialLinks] = await Promise.all([fetchTemples(), fetchRegistrations(), fetchSocialLinks()]);
      dispatch({ type: "SET_DATA", payload: { temples, registrations, socialLinks } });
    } catch (e) {
      dispatch({ type: "SET_ERROR", payload: e.message });
    }
  }, []);

  // Check existing session & listen for auth changes
  useEffect(() => {
    getSession().then(session => {
      setAdminUser(session?.user || null);
      setAuthLoading(false);
    });
    const { data: { subscription } } = onAuthChange(session => {
      setAdminUser(session?.user || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => { refreshData(); }, [refreshData]);

  const handleLogout = async () => {
    await signOut();
    setAdminUser(null);
    dispatch({ type: "SET_VIEW", payload: "home" });
    dispatch({ type: "SET_NOTIFICATION", payload: "Logged out" });
  };

  const handleLoginSuccess = async () => {
    const session = await getSession();
    setAdminUser(session?.user || null);
  };

  if (state.loading || authLoading) return (
    <div style={{ minHeight: "100vh", background: C.cream, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <img src={LOGO_SRC} alt="Loading" style={{ width: 80, height: 80, borderRadius: 20, border: `3px solid ${C.gold}`, animation: "pulse 1.5s infinite" }} />
      <p style={{ fontFamily: sansFont, fontSize: 15, color: C.mid }}>Loading...</p>
      <style>{`@keyframes pulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.7; transform:scale(0.95); } }`}</style>
    </div>
  );

  if (state.error) return (
    <div style={{ minHeight: "100vh", background: C.cream, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, padding: 40, textAlign: "center" }}>
      <span style={{ fontSize: 48 }}>⚠️</span>
      <h2 style={{ fontFamily: font, fontSize: 22, color: C.maroon }}>Connection Error</h2>
      <p style={{ fontFamily: sansFont, fontSize: 14, color: C.mid, maxWidth: 400 }}>Could not connect to database. Check your .env.local file has the correct VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.</p>
      <p style={{ fontFamily: sansFont, fontSize: 12, color: C.light }}>{state.error}</p>
      <button onClick={refreshData} style={{ fontFamily: sansFont, fontSize: 14, fontWeight: 600, padding: "12px 28px", borderRadius: 10, border: "none", cursor: "pointer", background: C.saffron, color: "#fff" }}>Retry</button>
    </div>
  );

  // If someone tries to access admin without login, redirect to login
  const showAdmin = state.view === "admin" && adminUser;
  const showLogin = state.view === "admin" && !adminUser || state.view === "login";

  return (
    <div style={{ minHeight: "100vh", background: C.cream, fontFamily: sansFont }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@400;500;600;700&family=Noto+Serif+Devanagari:wght@400;600;700&display=swap');
        @keyframes slideIn { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        * { box-sizing: border-box; }
        input:focus, select:focus, textarea:focus { border-color: #e8621e !important; box-shadow: 0 0 0 3px rgba(232,98,30,0.1); }
        button:hover { opacity: 0.92; }
      `}</style>
      {state.notification && <Notification message={state.notification} onClose={() => dispatch({ type: "CLEAR_NOTIFICATION" })} />}
      <Header state={state} dispatch={dispatch} adminUser={adminUser} onLogout={handleLogout} />
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px 60px" }}>
        {state.view === "home" && <HomePage state={state} dispatch={dispatch} />}
        {state.view === "register" && <RegistrationForm state={state} dispatch={dispatch} onRefresh={refreshData} />}
        {state.view === "about" && <AboutPage socialLinks={state.socialLinks} />}
        {showLogin && <AdminLogin dispatch={dispatch} onLogin={handleLoginSuccess} />}
        {showAdmin && <AdminPanel state={state} dispatch={dispatch} onRefresh={refreshData} />}
        {state.view === "success" && <SuccessPage dispatch={dispatch} />}
      </main>
      <footer style={{ textAlign: "center", padding: "20px", fontFamily: sansFont, fontSize: 12, color: C.light, borderTop: `1px solid ${C.border}` }}>
        <img src={LOGO_SRC} alt="" style={{ width: 22, height: 22, borderRadius: 5, verticalAlign: "middle", marginRight: 8 }} />
        श्री दत्तराज गुरुमाऊली — Temple Puja Registration
      </footer>
    </div>
  );
}
