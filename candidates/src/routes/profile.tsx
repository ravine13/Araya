import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Award,
  BookOpen,
  Briefcase,
  Calendar,
  CheckCircle2,
  Circle,
  Download,
  FileText,
  GraduationCap,
  Languages,
  Linkedin,
  Mail,
  MapPin,
  Pencil,
  Phone,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  User,
  Wrench,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatLPA } from "@/lib/format";
import { hydrateProfileFromApi } from "@/lib/hydrate";
import { requireCandidateAuth } from "@/lib/requireAuth";
import { useProfile } from "@/store/profileStore";
import { useEffect, useState } from "react";
import type { Profile } from "@/data/profile";

export const Route = createFileRoute("/profile")({
  beforeLoad: () => requireCandidateAuth("/profile"),
  head: () => ({
    meta: [
      { title: "My Profile — ApronHanger" },
      { name: "description", content: "Your professional healthcare profile and CV." },
    ],
  }),
  component: ProfilePage,
});

/* ─── Styles ──────────────────────────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');

  :root {
    --ph-teal:       #1a56db;
    --ph-teal-mid:   #1e64f0;
    --ph-teal-light: #eef4ff;
    --ph-teal-xlight:#f5f8ff;
    --ph-teal-border:#c7d9f8;
    --ph-ink:        #111827;
    --ph-ink-2:      #374151;
    --ph-ink-3:      #6b7280;
    --ph-ink-4:      #9ca3af;
    --ph-surface:    #ffffff;
    --ph-surface-2:  #f8faff;
    --ph-surface-3:  #f0f5ff;
    --ph-border:     #e4eaf7;
    --ph-shadow-sm:  0 1px 3px rgb(0 0 0 / 0.06), 0 1px 2px rgb(0 0 0 / 0.04);
    --ph-shadow-md:  0 4px 16px rgb(0 0 0 / 0.07), 0 2px 6px rgb(0 0 0 / 0.04);
    --ph-shadow-lg:  0 8px 32px rgb(0 0 0 / 0.08), 0 2px 8px rgb(0 0 0 / 0.04);
    --ph-font-display: 'DM Serif Display', Georgia, serif;
    --ph-font-body:    'Plus Jakarta Sans', system-ui, sans-serif;
    --ph-radius:     14px;
    --ph-radius-sm:  8px;
  }

  /* ── Entrance animations ── */
  @keyframes ph-up {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes ph-fade {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes ph-avatar-in {
    from { opacity: 0; transform: scale(0.88); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes ph-ring {
    0%, 100% { box-shadow: 0 0 0 0 rgba(26,86,219,0.25); }
    60%       { box-shadow: 0 0 0 7px rgba(26,86,219,0); }
  }
  @keyframes ph-stat-in {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes ph-skeleton {
    0%, 100% { background-color: #eef2f2; }
    50%       { background-color: #e3ecea; }
  }

  .ph-wrapper {
    font-family: var(--ph-font-body);
    background: var(--ph-surface-2);
    min-height: 100vh;
    color: var(--ph-ink);
  }

  /* ─── Hero ─── */
  .ph-hero {
    background: var(--ph-surface);
    border-bottom: 1px solid var(--ph-border);
    position: relative;
    overflow: hidden;
  }

  /* Watermark cross pattern — subtle medical reference */
  .ph-hero::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
      radial-gradient(ellipse 55% 80% at 100% 110%, rgba(26,86,219,0.06) 0%, transparent 70%),
      radial-gradient(ellipse 40% 60% at -5% -10%, rgba(26,86,219,0.04) 0%, transparent 60%);
    pointer-events: none;
  }

  /* Faint dot grid */
  .ph-hero::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image: radial-gradient(circle, rgba(26,86,219,0.12) 1px, transparent 1px);
    background-size: 28px 28px;
    mask-image: radial-gradient(ellipse 60% 80% at 95% 110%, black 0%, transparent 70%);
    pointer-events: none;
  }

  .ph-hero-inner {
    position: relative;
    z-index: 1;
    max-width: 1200px;
    margin: 0 auto;
    padding: 1.5rem 2.5rem 0;
  }

  @media (max-width: 640px) {
    .ph-hero-inner { padding: 1.25rem 1.25rem 0; }
  }

  .ph-hero-top {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: center;
    justify-content: space-between;
    animation: ph-up 0.55s cubic-bezier(0.22,1,0.36,1) both;
  }

  .ph-hero-left {
    display: flex;
    gap: 1rem;
    align-items: center;
    flex-wrap: wrap;
  }

  /* Avatar */
  .ph-avatar-wrap {
    animation: ph-avatar-in 0.6s cubic-bezier(0.22,1,0.36,1) 0.05s both;
  }
  .ph-avatar-outer {
    padding: 3px;
    border-radius: 9999px;
    background: linear-gradient(135deg, var(--ph-teal), var(--ph-teal-mid));
    display: inline-flex;
    animation: ph-ring 3.5s ease-in-out 1.5s infinite;
  }
  .ph-avatar-inner {
    border-radius: 9999px;
    border: 2px solid var(--ph-surface);
    overflow: hidden;
  }

  /* Name block */
  .ph-name {
    font-family: var(--ph-font-display);
    font-size: clamp(1.375rem, 3vw, 1.875rem);
    font-weight: 400;
    color: #2d3a4a;
    line-height: 1.2;
    letter-spacing: -0.005em;
    margin: 0;
  }
  .ph-headline {
    font-size: 0.8125rem;
    font-weight: 400;
    color: #8a96a4;
    margin: 0.25rem 0 0;
    letter-spacing: 0.01em;
  }

  .ph-verified-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.2rem 0.625rem;
    border-radius: 9999px;
    background: var(--ph-teal-light);
    border: 1px solid var(--ph-teal-border);
    font-size: 0.6875rem;
    font-weight: 600;
    color: var(--ph-teal);
    letter-spacing: 0.04em;
    text-transform: uppercase;
    margin-bottom: 0.5rem;
    width: fit-content;
  }

  .ph-contact-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1.25rem;
    margin-top: 0.625rem;
  }
  .ph-contact-item {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.75rem;
    color: var(--ph-ink-3);
    font-weight: 400;
  }
  .ph-contact-item svg { color: var(--ph-teal); }
  .ph-contact-item a {
    color: var(--ph-teal);
    text-decoration: none;
    font-weight: 500;
  }
  .ph-contact-item a:hover { text-decoration: underline; }

  /* Action buttons */
  .ph-hero-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    padding-bottom: 4px;
    animation: ph-up 0.55s cubic-bezier(0.22,1,0.36,1) 0.08s both;
  }

  .ph-btn-ghost {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.5rem 1rem;
    border-radius: 9999px;
    border: 1px solid var(--ph-border);
    background: var(--ph-surface);
    color: var(--ph-ink-2);
    font-size: 0.8125rem;
    font-weight: 500;
    cursor: pointer;
    font-family: var(--ph-font-body);
    transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
    box-shadow: var(--ph-shadow-sm);
    text-decoration: none;
  }
  .ph-btn-ghost:hover {
    border-color: var(--ph-teal-border);
    background: var(--ph-teal-xlight);
    color: var(--ph-teal);
  }

  .ph-btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.5rem 1.125rem;
    border-radius: 9999px;
    border: none;
    background: var(--ph-teal);
    color: #fff;
    font-size: 0.8125rem;
    font-weight: 500;
    cursor: pointer;
    font-family: var(--ph-font-body);
    transition: background 0.18s, box-shadow 0.18s;
    box-shadow: 0 2px 8px rgba(13,123,110,0.25);
    text-decoration: none;
  }
  .ph-btn-primary:hover {
    background: var(--ph-teal-mid);
    box-shadow: 0 4px 14px rgba(13,123,110,0.3);
  }

  /* ── Stats strip ── */
  .ph-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    border-top: 1px solid var(--ph-border);
    margin-top: 2rem;
    max-width: 1200px;
    margin-left: auto;
    margin-right: auto;
  }
  @media (max-width: 500px) {
    .ph-stats { grid-template-columns: repeat(2, 1fr); }
  }

  .ph-stat {
    padding: 0.875rem 1.5rem;
    border-right: 1px solid var(--ph-border);
    animation: ph-stat-in 0.5s ease both;
    position: relative;
  }
  .ph-stat:last-child { border-right: none; }
  .ph-stat-label {
    font-size: 0.625rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--ph-ink-4);
  }
  .ph-stat-value {
    font-family: var(--ph-font-display);
    font-size: 1.1875rem;
    font-weight: 400;
    color: #2d3a4a;
    margin-top: 0.125rem;
  }

  /* ── Body layout ── */
  .ph-body {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1.75rem 2.5rem 4rem;
    display: grid;
    grid-template-columns: minmax(0,1fr) 300px;
    gap: 1.5rem;
    align-items: start;
  }
  @media (max-width: 960px) {
    .ph-body {
      grid-template-columns: 1fr;
      padding: 1.25rem 1.25rem 3rem;
    }
  }

  .ph-main { display: flex; flex-direction: column; gap: 1.25rem; }
  .ph-aside { display: flex; flex-direction: column; gap: 1.25rem; }

  /* ── Cards ── */
  .ph-card {
    background: var(--ph-surface);
    border: 1px solid var(--ph-border);
    border-radius: var(--ph-radius);
    box-shadow: var(--ph-shadow-sm);
    overflow: hidden;
    animation: ph-up 0.5s cubic-bezier(0.22,1,0.36,1) both;
    transition: box-shadow 0.2s;
  }
  .ph-card:hover { box-shadow: var(--ph-shadow-md); }

  .ph-card-hd {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.875rem 1.25rem;
    border-bottom: 1px solid var(--ph-border);
    background: var(--ph-surface-3);
  }
  .ph-card-hd-left {
    display: flex;
    align-items: center;
    gap: 0.625rem;
  }
  .ph-card-hd-icon {
    width: 1.875rem;
    height: 1.875rem;
    border-radius: var(--ph-radius-sm);
    background: var(--ph-teal-light);
    display: grid;
    place-items: center;
    color: var(--ph-teal);
    flex-shrink: 0;
  }
  .ph-card-hd-title {
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--ph-ink);
    letter-spacing: 0.005em;
  }
  .ph-card-hd-edit {
    font-size: 0.6875rem;
    font-weight: 500;
    color: var(--ph-teal);
    text-decoration: none;
    opacity: 0.75;
    transition: opacity 0.15s;
  }
  .ph-card-hd-edit:hover { opacity: 1; }

  .ph-card-bd { padding: 1.25rem; }
  .ph-card-bd--sm { padding: 1rem 1.25rem; }

  /* About */
  .ph-about-text {
    font-size: 0.875rem;
    line-height: 1.75;
    color: var(--ph-ink-2);
    margin: 0;
  }

  /* ── Timeline ── */
  .ph-tl-item {
    display: flex;
    gap: 0.875rem;
    padding-bottom: 1.5rem;
    position: relative;
  }
  .ph-tl-item:last-child { padding-bottom: 0; }
  .ph-tl-line {
    position: absolute;
    left: 13px;
    top: 28px;
    bottom: 0;
    width: 1px;
    background: linear-gradient(to bottom, var(--ph-teal-border), transparent);
  }
  .ph-tl-dot {
    position: relative;
    z-index: 1;
    flex-shrink: 0;
    width: 28px;
    height: 28px;
    margin-top: 2px;
    border-radius: var(--ph-radius-sm);
    background: var(--ph-teal-light);
    border: 1px solid var(--ph-teal-border);
    display: grid;
    place-items: center;
    color: var(--ph-teal);
  }
  .ph-tl-role { font-size: 0.875rem; font-weight: 600; color: var(--ph-ink); }
  .ph-tl-dates { font-size: 0.6875rem; color: var(--ph-ink-4); font-variant-numeric: tabular-nums; }
  .ph-tl-hosp { font-size: 0.75rem; color: var(--ph-teal); font-weight: 500; margin-top: 2px; }
  .ph-tl-summary {
    font-size: 0.75rem;
    line-height: 1.65;
    color: var(--ph-ink-3);
    margin-top: 0.4rem;
  }

  /* ── Education ── */
  .ph-edu { display: flex; gap: 0.875rem; align-items: flex-start; }
  .ph-edu-icon {
    flex-shrink: 0;
    width: 2.25rem;
    height: 2.25rem;
    border-radius: var(--ph-radius-sm);
    background: var(--ph-teal-light);
    border: 1px solid var(--ph-teal-border);
    display: grid;
    place-items: center;
    color: var(--ph-teal);
  }
  .ph-edu-degree { font-size: 0.875rem; font-weight: 600; color: var(--ph-ink); }
  .ph-edu-inst { font-size: 0.75rem; color: var(--ph-ink-3); margin-top: 2px; }
  .ph-edu-year { font-size: 0.6875rem; color: var(--ph-teal); margin-top: 2px; font-weight: 500; }

  /* ── Procedures ── */
  .ph-proc-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
    gap: 0.5rem;
  }
  .ph-proc-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5625rem 0.875rem;
    border-radius: var(--ph-radius-sm);
    border: 1px solid var(--ph-border);
    background: var(--ph-surface-2);
    transition: border-color 0.15s, background 0.15s;
  }
  .ph-proc-item:hover {
    border-color: var(--ph-teal-border);
    background: var(--ph-teal-xlight);
  }
  .ph-proc-name { font-size: 0.75rem; font-weight: 500; color: var(--ph-ink-2); }
  .ph-proc-count {
    font-family: var(--ph-font-display);
    font-size: 0.9375rem;
    font-weight: 500;
    color: var(--ph-teal);
    min-width: 2rem;
    text-align: right;
  }

  /* ── Certifications ── */
  .ph-cert {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.6875rem 0;
    border-bottom: 1px solid var(--ph-border);
  }
  .ph-cert:first-child { padding-top: 0; }
  .ph-cert:last-child { padding-bottom: 0; border-bottom: none; }
  .ph-cert-name { font-size: 0.8125rem; font-weight: 500; color: var(--ph-ink); }
  .ph-cert-issuer { font-size: 0.6875rem; color: var(--ph-ink-4); margin-top: 2px; }
  .ph-cert-year {
    font-size: 0.6875rem;
    font-weight: 600;
    color: var(--ph-teal);
    white-space: nowrap;
    flex-shrink: 0;
  }

  /* ── Publications ── */
  .ph-pub {
    padding: 0.75rem 0.875rem;
    border-radius: var(--ph-radius-sm);
    border: 1px solid var(--ph-border);
    background: var(--ph-surface-2);
    font-size: 0.75rem;
    line-height: 1.7;
    color: var(--ph-ink-2);
  }

  /* ── Sidebar — profile strength ── */
  .ph-strength {
    background: var(--ph-surface);
    border: 1px solid var(--ph-border);
    border-radius: var(--ph-radius);
    padding: 1.25rem;
    box-shadow: var(--ph-shadow-sm);
    animation: ph-up 0.5s ease 0.06s both;
  }
  .ph-strength-top {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
  }
  .ph-ring-wrap { position: relative; width: 56px; height: 56px; flex-shrink: 0; }
  .ph-ring-pct {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.6875rem;
    font-weight: 700;
    color: var(--ph-teal);
  }
  .ph-strength-title { font-size: 0.875rem; font-weight: 600; color: var(--ph-ink); }
  .ph-strength-sub { font-size: 0.75rem; color: var(--ph-ink-4); margin-top: 2px; }

  .ph-check {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.75rem;
    padding: 0.25rem 0;
  }
  .ph-check--done { color: var(--ph-ink-2); }
  .ph-check--todo { color: var(--ph-ink-4); }

  /* ── Chips ── */
  .ph-chips { display: flex; flex-wrap: wrap; gap: 0.375rem; }
  .ph-chip {
    display: inline-flex;
    align-items: center;
    padding: 0.25rem 0.625rem;
    border-radius: 9999px;
    font-size: 0.6875rem;
    font-weight: 500;
    transition: box-shadow 0.15s;
    cursor: default;
  }
  .ph-chip:hover { box-shadow: 0 1px 4px rgba(0,0,0,0.1); }
  .ph-chip--teal {
    background: var(--ph-teal-light);
    border: 1px solid var(--ph-teal-border);
    color: var(--ph-teal);
  }
  .ph-chip--neutral {
    background: var(--ph-surface-3);
    border: 1px solid var(--ph-border);
    color: var(--ph-ink-2);
  }

  /* ── Reg / availability ── */
  .ph-dl-label {
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--ph-ink-4);
    margin-bottom: 2px;
  }
  .ph-dl-value { font-size: 0.875rem; font-weight: 500; color: var(--ph-ink); }
  .ph-dl-mono { font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.8125rem; color: var(--ph-teal); }

  /* ── CTA banner ── */
  .ph-cta {
    background: linear-gradient(135deg, var(--ph-teal-xlight), var(--ph-surface));
    border: 1px solid var(--ph-teal-border);
    border-radius: var(--ph-radius);
    padding: 1.25rem;
    animation: ph-up 0.5s ease 0.14s both;
    position: relative;
    overflow: hidden;
  }
  .ph-cta::before {
    content: '+';
    position: absolute;
    right: -12px;
    top: -10px;
    font-size: 8rem;
    font-weight: 200;
    color: var(--ph-teal-border);
    line-height: 1;
    pointer-events: none;
    user-select: none;
    font-family: var(--ph-font-body);
  }
  .ph-cta-title {
    font-family: var(--ph-font-display);
    font-size: 0.9375rem;
    font-weight: 500;
    color: var(--ph-ink);
    font-style: italic;
    position: relative;
  }
  .ph-cta-body {
    font-size: 0.75rem;
    line-height: 1.65;
    color: var(--ph-ink-3);
    margin-top: 0.375rem;
    margin-bottom: 1rem;
    position: relative;
  }

  /* ── Empty state ── */
  .ph-empty {
    min-height: 100vh;
    background: var(--ph-surface-2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--ph-font-body);
    padding: 2rem;
  }
  .ph-empty-inner {
    max-width: 540px;
    text-align: center;
    animation: ph-up 0.6s ease both;
    background: var(--ph-surface);
    border: 1px solid var(--ph-border);
    border-radius: 1.5rem;
    padding: 3rem 2.5rem;
    box-shadow: var(--ph-shadow-lg);
  }
  .ph-empty-icon {
    width: 52px;
    height: 52px;
    border-radius: 1rem;
    background: var(--ph-teal-light);
    display: grid;
    place-items: center;
    color: var(--ph-teal);
    margin: 0 auto 1.25rem;
  }
  .ph-empty-title {
    font-family: var(--ph-font-display);
    font-size: 1.625rem;
    font-weight: 500;
    color: var(--ph-ink);
    margin: 0 0 0.75rem;
    line-height: 1.25;
  }
  .ph-empty-body {
    font-size: 0.875rem;
    color: var(--ph-ink-3);
    line-height: 1.7;
    margin-bottom: 1.75rem;
  }

  /* ── Loading ── */
  .ph-skel {
    background: #eef2f2;
    border-radius: 12px;
    animation: ph-skeleton 1.6s ease-in-out infinite;
  }

  /* Stagger delays */
  .ph-d1 { animation-delay: 0.05s; }
  .ph-d2 { animation-delay: 0.10s; }
  .ph-d3 { animation-delay: 0.15s; }
  .ph-d4 { animation-delay: 0.20s; }
  .ph-d5 { animation-delay: 0.25s; }
  .ph-d6 { animation-delay: 0.30s; }

  .ph-divider { height: 1rem; }
`;

function StyleInjector() {
  useEffect(() => {
    const id = "ph-profile-light-styles";
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = STYLES;
    document.head.appendChild(el);
    return () => el.remove();
  }, []);
  return null;
}

/* ═══════════════════════════════════════ PAGE ════════════════════════════════ */
function ProfilePage() {
  const c = useProfile();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!c) setLoading(true);
    void hydrateProfileFromApi().finally(() => setLoading(false));
  }, []);

  return (
    <>
      <StyleInjector />
      {loading ? <LoadingSkeleton /> : !c ? <EmptyState /> : <ProfileFull c={c} />}
    </>
  );
}

function LoadingSkeleton() {
  return (
    <div style={{ background: "#f9fbfb", minHeight: "100vh", padding: "2rem 2.5rem" }}>
      <div className="ph-skel" style={{ height: 260, marginBottom: 24 }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="ph-skel" style={{ height: 140 }} />
          <div className="ph-skel" style={{ height: 220 }} />
        </div>
        <div className="ph-skel" style={{ height: 300 }} />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="ph-empty">
      <div className="ph-empty-inner">
        <div className="ph-empty-icon">
          <FileText size={22} />
        </div>
        <h1 className="ph-empty-title">Your CV hasn't been built yet</h1>
        <p className="ph-empty-body">
          ApronHanger builds your professional CV from a single structured form. Once it's done,
          you can Quick Apply to any verified role with one tap.
        </p>
        <Link to="/build-cv">
          <button className="ph-btn-primary" style={{ margin: "0 auto" }}>
            <FileText size={14} /> Fill the form
          </button>
        </Link>
      </div>
    </div>
  );
}

/* ─── Full profile ───────────────────────────────────────────────────────── */
function ProfileFull({ c }: { c: Profile }) {
  const location = [c.city, c.state].filter(Boolean).join(", ");
  const checklist = profileChecklist(c);
  const totalProcs = c.procedures.reduce((a, p) => a + p.count, 0);

  return (
    <div className="ph-wrapper">

      {/* ── HERO ── */}
      <div className="ph-hero">
        <div className="ph-hero-inner">
          <div className="ph-hero-top">
            <div className="ph-hero-left">
              {/* Avatar */}
              <div className="ph-avatar-wrap">
                <div className="ph-avatar-outer">
                  <div className="ph-avatar-inner">
                    <Avatar style={{ width: 58, height: 58 }}>
                      <AvatarFallback style={{
                        background: "linear-gradient(135deg, #eef4ff, #c7d9f8)",
                        color: "var(--ph-teal)",
                        fontSize: "1.125rem",
                        fontWeight: 600,
                        fontFamily: "var(--ph-font-display)",
                      }}>
                        {c.avatar}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
              </div>

              {/* Name + meta */}
              <div style={{ paddingBottom: 0 }}>
                {c.verified && (
                  <div className="ph-verified-badge">
                    <ShieldCheck size={10} /> Verified {c.role}
                  </div>
                )}
                <h1 className="ph-name">
                  {c.name}
                </h1>
                <p className="ph-headline">{c.headline}</p>
                <div className="ph-contact-row">
                  {location && (
                    <span className="ph-contact-item"><MapPin size={12} /> {location}</span>
                  )}
                  {c.email && (
                    <span className="ph-contact-item"><Mail size={12} /> {c.email}</span>
                  )}
                  {c.phone && (
                    <span className="ph-contact-item"><Phone size={12} /> {c.phone}</span>
                  )}
                  {c.linkedinUrl && (
                    <span className="ph-contact-item">
                      <Linkedin size={12} />
                      <a
                        href={c.linkedinUrl.startsWith("http") ? c.linkedinUrl : `https://${c.linkedinUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        LinkedIn
                      </a>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="ph-hero-actions">
              <Link to="/build-cv">
                <button className="ph-btn-ghost"><Pencil size={13} /> Edit profile</button>
              </Link>
              <Link to="/cv-preview">
                <button className="ph-btn-primary"><Download size={13} /> View CV</button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="ph-stats" style={{ marginTop: "1.25rem" }}>
          {[
            { label: "Experience", value: `${c.yearsExperience} yrs`, d: "0.3s" },
            { label: "Procedures", value: totalProcs.toLocaleString(), d: "0.36s" },
            { label: "Certifications", value: String(c.certifications.length), d: "0.42s" },
            {
              label: "Expected CTC",
              value: (c.expectedSalaryMin || c.expectedSalaryMax) > 0
                ? formatLPA(c.expectedSalaryMin, c.expectedSalaryMax)
                : "—",
              d: "0.48s"
            },
          ].map((s) => (
            <div key={s.label} className="ph-stat" style={{ animationDelay: s.d }}>
              <div className="ph-stat-label">{s.label}</div>
              <div className="ph-stat-value">{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="ph-body">

        {/* Main */}
        <div className="ph-main">
          {c.summary && (
            <Card title="About" icon={User} delay="0.04s">
              <p className="ph-about-text">{c.summary}</p>
            </Card>
          )}

          {c.experience.length > 0 && (
            <Card title="Experience" icon={Briefcase} delay="0.08s">
              {c.experience.map((e, i) => (
                <div key={i} className="ph-tl-item">
                  {i < c.experience.length - 1 && <span className="ph-tl-line" />}
                  <span className="ph-tl-dot"><Briefcase size={12} /></span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", justifyContent: "space-between", gap: 6 }}>
                      <p className="ph-tl-role">{e.role}</p>
                      <p className="ph-tl-dates">{e.start} — {e.end}</p>
                    </div>
                    <p className="ph-tl-hosp">{e.hospital}{e.city ? ` · ${e.city}` : ""}</p>
                    {e.summary && <p className="ph-tl-summary">{e.summary}</p>}
                  </div>
                </div>
              ))}
            </Card>
          )}

          {c.qualifications.length > 0 && (
            <Card title="Education" icon={GraduationCap} delay="0.12s">
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {c.qualifications.map((q, i) => (
                  <div key={i} className="ph-edu">
                    <span className="ph-edu-icon"><GraduationCap size={14} /></span>
                    <div>
                      <p className="ph-edu-degree">{q.degree}</p>
                      <p className="ph-edu-inst">{q.institution}</p>
                      <p className="ph-edu-year">{q.year}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {c.procedures.length > 0 && (
            <Card title="Procedures & volume" icon={Stethoscope} delay="0.16s">
              <div className="ph-proc-grid">
                {c.procedures.map((p, i) => (
                  <div key={i} className="ph-proc-item">
                    <span className="ph-proc-name">{p.name}</span>
                    <span className="ph-proc-count">{p.count}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {c.certifications.length > 0 && (
            <Card title="Licenses & certifications" icon={Award} delay="0.20s">
              {c.certifications.map((cert, i) => (
                <div key={i} className="ph-cert">
                  <div>
                    <p className="ph-cert-name">{cert.name}</p>
                    <p className="ph-cert-issuer">{cert.issuer}</p>
                  </div>
                  <span className="ph-cert-year">{cert.year}</span>
                </div>
              ))}
            </Card>
          )}

          {c.publications.length > 0 && (
            <Card title="Publications & research" icon={BookOpen} delay="0.24s">
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {c.publications.map((pub, i) => (
                  <div key={i} className="ph-pub">{pub}</div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <aside className="ph-aside">
          <ProfileStrengthCard completeness={c.completeness} checklist={checklist} />

          {(c.registrationNumber || c.registrationCouncil) && (
            <Card title="Professional registration" icon={ShieldCheck} compact delay="0.08s">
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {c.registrationCouncil && (
                  <div>
                    <div className="ph-dl-label">Council</div>
                    <div className="ph-dl-value">{c.registrationCouncil}</div>
                  </div>
                )}
                {c.registrationNumber && (
                  <div>
                    <div className="ph-dl-label">Reg. number</div>
                    <div className="ph-dl-mono">{c.registrationNumber}</div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {c.availability && (
            <Card title="Availability" icon={Calendar} compact delay="0.12s">
              <p style={{ fontSize: "0.875rem", color: "var(--ph-ink-2)", margin: 0 }}>{c.availability}</p>
            </Card>
          )}

          {c.clinicalSkills.length > 0 && (
            <Card title="Clinical skills" icon={Stethoscope} compact delay="0.16s">
              <div className="ph-chips">
                {c.clinicalSkills.map((s) => (
                  <span key={s} className="ph-chip ph-chip--teal">{s}</span>
                ))}
              </div>
            </Card>
          )}

          {c.technicalSkills.length > 0 && (
            <Card title="Technical skills" icon={Wrench} compact delay="0.20s">
              <div className="ph-chips">
                {c.technicalSkills.map((s) => (
                  <span key={s} className="ph-chip ph-chip--neutral">{s}</span>
                ))}
              </div>
            </Card>
          )}

          {c.languages.length > 0 && (
            <Card title="Languages" icon={Languages} compact delay="0.24s">
              <div className="ph-chips">
                {c.languages.map((s) => (
                  <span key={s} className="ph-chip ph-chip--neutral">{s}</span>
                ))}
              </div>
            </Card>
          )}

          <div className="ph-cta">
            <p className="ph-cta-title">Your CV is recruiter‑ready.</p>
            <p className="ph-cta-body">
              Hospitals see this profile when you apply. Keep it updated for better shortlist rates.
            </p>
            <Link to="/applications">
              <button className="ph-btn-primary" style={{ width: "100%", justifyContent: "center", position: "relative" }}>
                View my applications
              </button>
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ─── Profile strength ───────────────────────────────────────────────────── */
function ProfileStrengthCard({
  completeness,
  checklist,
}: {
  completeness: number;
  checklist: { label: string; done: boolean }[];
}) {
  const doneCount = checklist.filter((x) => x.done).length;
  const r = 22;
  const circ = 2 * Math.PI * r;
  const offset = circ - (completeness / 100) * circ;

  return (
    <div className="ph-strength">
      <div className="ph-strength-top">
        <div className="ph-ring-wrap">
          <svg viewBox="0 0 52 52" style={{ transform: "rotate(-90deg)", width: 56, height: 56 }}>
            <circle cx="26" cy="26" r={r} fill="none" stroke="#eef4ff" strokeWidth={3.5} />
            <circle
              cx="26" cy="26" r={r} fill="none"
              stroke="var(--ph-teal)"
              strokeWidth={3.5}
              strokeDasharray={circ}
              strokeDashoffset={offset}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(0.4,0,0.2,1)" }}
            />
          </svg>
          <span className="ph-ring-pct">{completeness}%</span>
        </div>
        <div>
          <div className="ph-strength-title">Profile strength</div>
          <div className="ph-strength-sub">{doneCount} of {checklist.length} complete</div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        {checklist.map((item) => (
          <div
            key={item.label}
            className={`ph-check ${item.done ? "ph-check--done" : "ph-check--todo"}`}
          >
            {item.done
              ? <CheckCircle2 size={13} style={{ color: "var(--ph-teal)", flexShrink: 0 }} />
              : <Circle size={13} style={{ flexShrink: 0 }} />}
            {item.label}
          </div>
        ))}
      </div>

      {completeness < 100 && (
        <Link to="/build-cv">
          <button className="ph-btn-ghost" style={{ marginTop: "0.875rem", width: "100%", justifyContent: "center" }}>
            Complete profile
          </button>
        </Link>
      )}
    </div>
  );
}

/* ─── Card ───────────────────────────────────────────────────────────────── */
function Card({
  title,
  icon: Icon,
  children,
  compact,
  delay = "0s",
}: {
  title: string;
  icon: typeof Briefcase;
  children: React.ReactNode;
  compact?: boolean;
  delay?: string;
}) {
  return (
    <section className="ph-card" style={{ animationDelay: delay }}>
      <div className="ph-card-hd">
        <div className="ph-card-hd-left">
          <span className="ph-card-hd-icon">
            <Icon size={13} strokeWidth={2} />
          </span>
          <span className="ph-card-hd-title">{title}</span>
        </div>
        <Link to="/build-cv" className="ph-card-hd-edit">Edit</Link>
      </div>
      <div className={compact ? "ph-card-bd--sm" : "ph-card-bd"}>{children}</div>
    </section>
  );
}

/* ─── Checklist helper ───────────────────────────────────────────────────── */
function profileChecklist(c: Profile) {
  return [
    { label: "Contact details", done: !!(c.email && c.phone) },
    { label: "Location", done: !!(c.state || c.city) },
    { label: "Registration", done: !!c.registrationNumber },
    { label: "Professional summary", done: !!c.summary },
    { label: "Work experience", done: c.experience.length > 0 },
    { label: "Education", done: c.qualifications.length > 0 },
    { label: "Clinical skills", done: c.clinicalSkills.length > 0 },
    { label: "Certifications", done: c.certifications.length > 0 },
  ];
}