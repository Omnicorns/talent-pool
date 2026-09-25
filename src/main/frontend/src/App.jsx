import React, { useEffect, useMemo, useRef, useState } from 'react';
import './styles.css';

// Base path aplikasi mengikuti `base` dari Vite.
// Production: /sarinah-talent-pool/
// Local default: /
const APP_BASE = String(import.meta.env.BASE_URL || '/')
  .replace(/\/+$/, '');

// Jika VITE_API_BASE_URL tersedia, gunakan nilainya.
// Jika tidak, API otomatis menggunakan prefix aplikasi yang sama.
// Contoh production:
//   /sarinah-talent-pool/api/backoffice/dashboard
const API_BASE = String(
  import.meta.env.VITE_API_BASE_URL ?? APP_BASE
).replace(/\/+$/, '');

const STATUS_OPTIONS = [
  'AVAILABLE',
  'SCREENED',
  'POTENTIAL',
  'ARCHIVED',
  'REJECTED',
  'SPAM',
  'BLOCKED',
  'WITHDRAWN',
  'HIRED',
];

const STATUS_LABEL = {
  AVAILABLE: 'Available',
  SCREENED: 'Screened',
  POTENTIAL: 'Potential',
  ARCHIVED: 'Archived',
  REJECTED: 'Rejected',
  SPAM: 'Spam',
  BLOCKED: 'Blocked',
  WITHDRAWN: 'Withdrawn',
  HIRED: 'Hired',
};

function Icon({ name, size = 18, strokeWidth = 1.8, className = '' }) {
  const paths = {
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
    dashboard: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    briefcase: <><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M3 12h18"/></>,
    user: <><path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="7" r="4"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/></>,
    chart: <><path d="M3 3v18h18"/><path d="m7 16 4-5 4 3 5-7"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06-2.83 2.83-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21h-4v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06-2.83-2.83.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3v-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06 2.83-2.83.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3h4v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06 2.83 2.83-.06.06A1.65 1.65 0 0 0 19.4 9c.12.36.19.73.2 1.11H21v4h-1.4c-.01.3-.08.6-.2.89Z"/></>,
    search: <><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>,
    upload: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5M12 3v12"/></>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5M12 15V3"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    x: <><path d="M18 6 6 18M6 6l12 12"/></>,
    check: <><path d="m20 6-11 11-5-5"/></>,
    chevronRight: <><path d="m9 18 6-6-6-6"/></>,
    chevronLeft: <><path d="m15 18-6-6 6-6"/></>,
    more: <><circle cx="5" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1" fill="currentColor" stroke="none"/></>,
    edit: <><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z"/></>,
    trash: <><path d="M3 6h18M8 6V4h8v2M19 6l-1 15H6L5 6M10 11v6M14 11v6"/></>,
    eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></>,
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h5"/></>,
    logout: <><path d="M10 17l5-5-5-5M15 12H3"/><path d="M21 19V5a2 2 0 0 0-2-2h-6"/></>,
    lock: <><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></>,
    phone: <><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92Z"/></>,
    location: <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/></>,
    external: <><path d="M15 3h6v6M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></>,
    refresh: <><path d="M20 6v5h-5M4 18v-5h5"/><path d="M18.5 9a7 7 0 0 0-12-3L4 8M5.5 15a7 7 0 0 0 12 3l2.5-2"/></>,
    info: <><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></>,
    menu: <><path d="M4 6h16M4 12h16M4 18h16"/></>,
  };
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name] || paths.info}
    </svg>
  );
}

function Logo({ compact = false, light = false }) {
  return (
    <div className={`brand sarinah-brand ${compact ? 'brand-compact' : ''} ${light ? 'brand-light' : ''}`}>
      <img className="sarinah-brand-logo" src={withAppBase('/images/sarinah.png')} alt="Sarinah"/>
      {!compact && (
        <span className="sarinah-brand-copy">
          <strong>Talent Management</strong>
          <small>Back Office</small>
        </span>
      )}
    </div>
  );
}

const BACKOFFICE_BRAND_CSS = `
/* =========================================================
   SARINAH BACKOFFICE — visual refresh only
   API, routing, state, and CRUD logic remain unchanged.
   ========================================================= */
:root{
  --bo-red:#d9271c;
  --bo-red-dark:#b81f17;
  --bo-red-soft:#fff1ef;
  --bo-ink:#191b20;
  --bo-muted:#707784;
  --bo-line:#e8e9ec;
  --bo-bg:#f6f7f8;
  --bo-card:#ffffff;
  --bo-shadow:0 10px 30px rgba(26,30,36,.06);
}
.backoffice-shell{background:var(--bo-bg)!important;min-height:100vh;color:var(--bo-ink)}
.backoffice-shell .sidebar{
  background:#fff!important;
  border-right:1px solid var(--bo-line)!important;
  box-shadow:none!important;
}
.backoffice-shell .sidebar-head{
  min-height:88px!important;
  padding:18px 20px!important;
  border-bottom:1px solid var(--bo-line)!important;
  display:flex;align-items:center;justify-content:space-between;gap:12px;
}
.sarinah-brand{display:flex!important;align-items:center!important;gap:13px!important;min-width:0}
.sarinah-brand-logo{display:block;width:106px!important;height:42px!important;object-fit:contain!important;object-position:left center!important;flex:0 0 auto}
.sarinah-brand-copy{display:flex!important;flex-direction:column!important;line-height:1.12!important;border-left:1px solid #e5e6e8;padding-left:12px;min-width:0}
.sarinah-brand-copy strong{font-size:12px!important;letter-spacing:.015em;color:#25282d!important;white-space:nowrap}
.sarinah-brand-copy small{font-size:10px!important;color:#8a9099!important;margin-top:4px;text-transform:uppercase;letter-spacing:.12em;font-weight:800}
.brand-light .sarinah-brand-logo{filter:brightness(0) invert(1)}
.brand-light .sarinah-brand-copy{border-left-color:rgba(255,255,255,.28)}
.brand-light .sarinah-brand-copy strong,.brand-light .sarinah-brand-copy small{color:#fff!important}
.backoffice-shell .sidebar nav{padding:18px 12px!important;display:grid;gap:5px}
.backoffice-shell .sidebar nav button{
  min-height:46px!important;border-radius:10px!important;border:0!important;background:transparent!important;
  color:#5f6670!important;padding:0 13px!important;font-weight:700!important;display:flex;align-items:center;gap:12px;
  transition:background .18s ease,color .18s ease,transform .18s ease!important;
}
.backoffice-shell .sidebar nav button:hover{background:#faf3f2!important;color:var(--bo-red)!important;transform:translateX(2px)}
.backoffice-shell .sidebar nav button.active{background:var(--bo-red-soft)!important;color:var(--bo-red)!important;box-shadow:inset 3px 0 0 var(--bo-red)}
.backoffice-shell .sidebar nav button.active svg{stroke-width:2.2}
.backoffice-shell .logout-button{
  margin:12px!important;border-radius:10px!important;border:1px solid #f1d5d2!important;background:#fff!important;color:#a82a21!important;
  min-height:44px!important;font-weight:800!important;
}
.backoffice-shell .logout-button:hover{background:#fff4f2!important;border-color:#efb4af!important}
.backoffice-main{background:var(--bo-bg)!important}
.backoffice-shell .topbar{
  background:rgba(255,255,255,.94)!important;
  border-bottom:1px solid var(--bo-line)!important;
  box-shadow:none!important;
  min-height:72px!important;
  backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);
}
.backoffice-shell .global-search{background:#f7f7f8!important;border:1px solid #e4e6e9!important;border-radius:12px!important;transition:.2s ease!important}
.backoffice-shell .global-search:focus-within{background:#fff!important;border-color:#e4aaa5!important;box-shadow:0 0 0 3px rgba(217,39,28,.08)!important}
.backoffice-shell .global-search svg{color:#8a919b!important}
.backoffice-shell .global-search kbd{background:#fff!important;border:1px solid #e3e5e8!important;color:#8a9199!important;box-shadow:none!important}
.backoffice-shell .notification,.backoffice-shell .icon-button{border-radius:10px!important}
.backoffice-shell .notification:hover,.backoffice-shell .icon-button:hover{background:#f7eeee!important;color:var(--bo-red)!important}
.backoffice-shell .avatar{background:linear-gradient(145deg,#d9271c,#b51f17)!important;color:#fff!important;box-shadow:none!important}
.backoffice-shell .user-menu strong{color:#22262b!important}.backoffice-shell .user-menu small{color:#8b919a!important}
.dashboard-content{padding:30px clamp(18px,3vw,42px) 44px!important}
.dashboard-heading{margin-bottom:24px!important;align-items:center!important}
.dashboard-heading h1{font-size:clamp(27px,2.5vw,36px)!important;letter-spacing:-.035em!important;color:#1d2025!important}
.dashboard-heading p{color:#737a84!important;margin-top:7px!important}
.access-note{background:#fff!important;border:1px solid var(--bo-line)!important;border-radius:10px!important;color:#606771!important;box-shadow:none!important}
.access-note svg{color:var(--bo-red)!important}
.kpi-grid{gap:16px!important}
.kpi-card{
  border:1px solid var(--bo-line)!important;border-radius:14px!important;background:#fff!important;box-shadow:none!important;
  transition:transform .2s ease,box-shadow .2s ease,border-color .2s ease!important;position:relative;overflow:hidden;
}
.kpi-card:before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--bo-red);opacity:.9}
.kpi-card:hover{transform:translateY(-2px)!important;box-shadow:var(--bo-shadow)!important;border-color:#dedfe3!important}
.kpi-card .kpi-icon{border-radius:11px!important;box-shadow:none!important}
.kpi-card strong{letter-spacing:-.035em!important;color:#1b1e23!important}
.talent-card,.dashboard-card,.analytics-chart-card,.settings-card,.report-card,.job-card,.candidate-card{
  border:1px solid var(--bo-line)!important;border-radius:14px!important;background:#fff!important;box-shadow:none!important;
}
.backoffice-shell table{border-collapse:separate!important;border-spacing:0!important}
.backoffice-shell thead th{background:#fafafa!important;color:#707782!important;font-size:11px!important;text-transform:uppercase!important;letter-spacing:.07em!important;border-bottom:1px solid var(--bo-line)!important}
.backoffice-shell tbody tr{transition:background .16s ease}.backoffice-shell tbody tr:hover{background:#fff9f8!important}
.backoffice-shell .button.primary{background:var(--bo-red)!important;border-color:var(--bo-red)!important;box-shadow:none!important}
.backoffice-shell .button.primary:hover{background:var(--bo-red-dark)!important;border-color:var(--bo-red-dark)!important}
.backoffice-shell input:focus,.backoffice-shell select:focus,.backoffice-shell textarea:focus{border-color:#e09b95!important;box-shadow:0 0 0 3px rgba(217,39,28,.08)!important;outline:none!important}
.backoffice-shell .status{border-radius:999px!important}

/* Login */
.login-page{
  min-height:100vh!important;
  background:#f4f5f6!important;
  display:grid!important;grid-template-columns:minmax(420px,1.05fr) minmax(440px,.95fr)!important;
  padding:0!important;
}
.login-decoration{
  min-height:100vh!important;padding:clamp(42px,6vw,84px)!important;
  background:
    radial-gradient(circle at 12% 14%,rgba(255,255,255,.16),transparent 28%),
    linear-gradient(145deg,#b71f17 0%,#d9271c 55%,#ed4438 100%)!important;
  color:#fff!important;display:flex!important;flex-direction:column!important;justify-content:space-between!important;position:relative;overflow:hidden;
}
.login-decoration:before,.login-decoration:after{content:'';position:absolute;border:1px solid rgba(255,255,255,.18);border-radius:50%;pointer-events:none}
.login-decoration:before{width:430px;height:430px;right:-190px;top:-160px}.login-decoration:after{width:290px;height:290px;left:-130px;bottom:-110px}
.login-decoration .brand{position:relative;z-index:1}.login-decoration .sarinah-brand-logo{width:150px!important;height:56px!important;filter:brightness(0) invert(1)}
.login-decoration .sarinah-brand-copy{border-left-color:rgba(255,255,255,.35)}
.login-decoration .sarinah-brand-copy strong,.login-decoration .sarinah-brand-copy small{color:#fff!important}
.login-decoration h1{position:relative;z-index:1;max-width:640px!important;color:#fff!important;font-size:clamp(42px,5vw,68px)!important;line-height:1.04!important;letter-spacing:-.05em!important;margin:0!important}
.login-decoration h1:after{content:'Human Capital • Talent Pool • Recruitment';display:block;margin-top:24px;font-size:12px;line-height:1.4;letter-spacing:.16em;text-transform:uppercase;font-weight:800;color:rgba(255,255,255,.72)}
.login-card{
  width:min(500px,calc(100% - 48px))!important;margin:auto!important;border:1px solid var(--bo-line)!important;border-radius:18px!important;
  background:#fff!important;box-shadow:0 22px 60px rgba(25,29,34,.09)!important;padding:36px!important;
}
.login-card>.brand{margin:24px 0 30px!important}.login-card .sarinah-brand-logo{width:126px!important}
.login-card h2{font-size:31px!important;letter-spacing:-.035em!important;margin-bottom:8px!important;color:#1f2227!important}
.login-card p{color:#777e87!important}.login-card .back-link{color:#6c737c!important;font-weight:750!important}.login-card .back-link:hover{color:var(--bo-red)!important}
.login-card .button.primary{background:var(--bo-red)!important;border-color:var(--bo-red)!important;min-height:48px!important;border-radius:10px!important}
.login-card .button.primary:hover{background:var(--bo-red-dark)!important}
.login-card input{min-height:46px!important;border-radius:10px!important}

@media(max-width:900px){
  .login-page{grid-template-columns:1fr!important}.login-decoration{display:none!important}.login-card{margin:40px auto!important}
  .backoffice-shell .sidebar-head{min-height:74px!important}.dashboard-content{padding:22px 16px 34px!important}
}
@media(max-width:620px){
  .sarinah-brand-logo{width:92px!important}.sarinah-brand-copy{display:none!important}
  .login-card{width:calc(100% - 28px)!important;padding:26px 22px!important;border-radius:14px!important}
  .dashboard-heading{align-items:flex-start!important}.access-note{display:none!important}
}


/* =========================================================
   BACK OFFICE LOGIN — polished standalone styles
   ========================================================= */
.login-page,.login-page *{box-sizing:border-box}
.login-page{
  min-height:100vh!important;
  grid-template-columns:minmax(520px,1.05fr) minmax(520px,.95fr)!important;
  background:#f5f6f7!important;
  font-family:Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif!important;
  overflow:hidden;
}
.login-page .login-decoration{
  min-width:0!important;
  padding:clamp(48px,6vw,92px)!important;
}
.login-page .login-decoration h1{
  font-family:Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif!important;
  font-size:clamp(46px,4.4vw,72px)!important;
  font-weight:850!important;
  line-height:1.02!important;
  max-width:680px!important;
}
.login-page .login-card{
  width:min(520px,calc(100% - 64px))!important;
  margin:auto!important;
  padding:38px 40px 40px!important;
  border:1px solid #e3e5e8!important;
  border-radius:20px!important;
  background:#fff!important;
  box-shadow:0 24px 70px rgba(25,29,34,.12)!important;
  display:flex!important;
  flex-direction:column!important;
  gap:0!important;
  min-width:0!important;
}
.login-page .login-card .back-link{
  align-self:flex-start!important;
  display:inline-flex!important;
  align-items:center!important;
  gap:7px!important;
  min-height:36px!important;
  padding:0 2px!important;
  margin:0 0 24px!important;
  border:0!important;
  background:transparent!important;
  color:#68717d!important;
  font-size:13px!important;
  font-weight:750!important;
  cursor:pointer!important;
}
.login-page .login-card .back-link:hover{color:var(--bo-red)!important}
.login-page .login-card>.brand{margin:0 0 30px!important}
.login-page .login-card h2{
  margin:0 0 8px!important;
  font-family:Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif!important;
  font-size:32px!important;
  line-height:1.15!important;
  font-weight:850!important;
  letter-spacing:-.035em!important;
}
.login-page .login-card h2+p{margin:0 0 28px!important;font-size:14px!important;line-height:1.6!important;color:#737b87!important}
.login-page .login-card .field{
  display:grid!important;
  gap:8px!important;
  width:100%!important;
  margin:0 0 18px!important;
  color:#30343b!important;
  font-size:13px!important;
  font-weight:800!important;
}
.login-page .login-card .field>span{display:block!important;line-height:1.25!important}
.login-page .login-card .field em{color:var(--bo-red)!important;font-style:normal!important;margin-left:2px!important}
.login-page .login-card .input-icon{
  width:100%!important;
  min-height:52px!important;
  display:flex!important;
  align-items:center!important;
  gap:11px!important;
  padding:0 14px!important;
  border:1px solid #dfe2e7!important;
  border-radius:12px!important;
  background:#fff!important;
  color:#8b93a0!important;
  transition:border-color .18s ease,box-shadow .18s ease!important;
}
.login-page .login-card .input-icon:focus-within{
  border-color:#e8918a!important;
  box-shadow:0 0 0 4px rgba(217,39,28,.08)!important;
}
.login-page .login-card .input-icon svg{flex:0 0 auto!important;width:19px!important;height:19px!important}
.login-page .login-card .input-icon input{
  flex:1!important;
  min-width:0!important;
  width:100%!important;
  height:50px!important;
  min-height:0!important;
  padding:0!important;
  margin:0!important;
  border:0!important;
  border-radius:0!important;
  outline:0!important;
  background:transparent!important;
  box-shadow:none!important;
  color:#1d2127!important;
  font-size:14px!important;
}
.login-page .login-card .button.primary.full{
  width:100%!important;
  min-height:52px!important;
  margin-top:4px!important;
  padding:0 18px!important;
  border:0!important;
  border-radius:12px!important;
  background:var(--bo-red)!important;
  color:#fff!important;
  display:flex!important;
  align-items:center!important;
  justify-content:center!important;
  font-size:14px!important;
  font-weight:850!important;
  cursor:pointer!important;
  box-shadow:0 10px 22px rgba(217,39,28,.18)!important;
}
.login-page .login-card .button.primary.full:hover{background:var(--bo-red-dark)!important;transform:translateY(-1px)!important}
.login-page .login-card .button.primary.full:disabled{opacity:.62!important;cursor:not-allowed!important;transform:none!important}
@media(max-width:1080px){
  .login-page{grid-template-columns:minmax(420px,.9fr) minmax(480px,1.1fr)!important}
  .login-page .login-decoration{padding:48px!important}
}
@media(max-width:900px){
  .login-page{display:flex!important;align-items:center!important;justify-content:center!important;padding:34px 18px!important;overflow:auto!important}
  .login-page .login-decoration{display:none!important}
  .login-page .login-card{width:min(520px,100%)!important;margin:auto!important}
}
@media(max-width:560px){
  .login-page{padding:18px 12px!important}
  .login-page .login-card{padding:28px 22px 30px!important;border-radius:16px!important}
  .login-page .login-card h2{font-size:28px!important}
}


/* =========================================================
   FINAL BACKOFFICE LOGIN POLISH
   ========================================================= */
html,body,#root{margin:0!important;padding:0!important;min-height:100%!important}
body{overflow-x:hidden!important;background:#f4f5f6!important}
.login-page,.login-page *{box-sizing:border-box!important;font-family:Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif!important}
.login-page{
  width:100%!important;min-height:100vh!important;margin:0!important;padding:0!important;
  display:grid!important;grid-template-columns:minmax(480px,1.02fr) minmax(520px,.98fr)!important;
  background:#f4f5f6!important;overflow:hidden!important;
}
.login-page .login-decoration{
  min-height:100vh!important;padding:54px clamp(48px,5vw,84px)!important;
  display:flex!important;flex-direction:column!important;justify-content:space-between!important;
  background:linear-gradient(145deg,#b91e17 0%,#d9271c 55%,#e43b30 100%)!important;
  position:relative!important;overflow:hidden!important;
}
.login-page .login-decoration:before{width:560px!important;height:560px!important;right:-250px!important;top:-260px!important;border-color:rgba(255,255,255,.14)!important}
.login-page .login-decoration:after{width:360px!important;height:360px!important;left:-170px!important;bottom:-190px!important;border-color:rgba(255,255,255,.11)!important}
.login-page .login-brand-row{position:relative!important;z-index:2!important}
.login-page .login-decoration .sarinah-brand-logo{width:146px!important;height:52px!important;filter:brightness(0) invert(1)!important}
.login-page .login-decoration .sarinah-brand-copy{border-left-color:rgba(255,255,255,.28)!important}
.login-page .login-decoration .sarinah-brand-copy strong,.login-page .login-decoration .sarinah-brand-copy small{color:#fff!important}
.login-page .login-hero-copy{position:relative!important;z-index:2!important;max-width:690px!important;margin:auto 0!important;padding:48px 0!important}
.login-page .login-kicker{display:block!important;margin-bottom:18px!important;color:rgba(255,255,255,.72)!important;font-size:11px!important;font-weight:850!important;letter-spacing:.17em!important;text-transform:uppercase!important}
.login-page .login-decoration h1{margin:0!important;max-width:660px!important;color:#fff!important;font-size:clamp(44px,4vw,68px)!important;font-weight:850!important;line-height:1.03!important;letter-spacing:-.05em!important}
.login-page .login-decoration h1:after{display:none!important}
.login-page .login-hero-copy p{margin:22px 0 0!important;max-width:570px!important;color:rgba(255,255,255,.76)!important;font-size:15px!important;line-height:1.7!important}
.login-page .login-footnote{position:relative!important;z-index:2!important;color:rgba(255,255,255,.58)!important;font-size:11px!important;font-weight:700!important;letter-spacing:.08em!important;text-transform:uppercase!important}
.login-page .login-panel{
  min-height:100vh!important;padding:44px clamp(28px,5vw,72px)!important;
  display:flex!important;align-items:center!important;justify-content:center!important;
  background:linear-gradient(180deg,#f7f8f9 0%,#eef0f2 100%)!important;
}
.login-page .login-card{
  width:min(470px,100%)!important;margin:0!important;padding:38px 40px 40px!important;
  border:1px solid #e1e4e8!important;border-radius:22px!important;background:#fff!important;
  box-shadow:0 24px 70px rgba(30,34,40,.10)!important;display:block!important;
}
.login-page .login-card .back-link{
  display:inline-flex!important;align-items:center!important;gap:7px!important;margin:0 0 30px!important;padding:0!important;
  min-height:auto!important;border:0!important;background:transparent!important;color:#66707d!important;
  font-size:13px!important;font-weight:750!important;line-height:1.2!important;
}
.login-page .login-card .back-link:hover{color:var(--bo-red)!important}
.login-page .login-card .login-card-kicker{display:block!important;margin:0 0 10px!important;color:var(--bo-red)!important;font-size:11px!important;font-weight:900!important;letter-spacing:.14em!important;text-transform:uppercase!important}
.login-page .login-card h2{margin:0 0 10px!important;color:#181b20!important;font-size:34px!important;font-weight:850!important;line-height:1.08!important;letter-spacing:-.04em!important}
.login-page .login-card .login-subtitle{margin:0 0 30px!important;color:#737b86!important;font-size:14px!important;line-height:1.65!important}
.login-page .login-card .field{display:block!important;width:100%!important;margin:0 0 18px!important;padding:0!important;color:#2b3037!important;font-size:13px!important;font-weight:800!important}
.login-page .login-card .field>span{display:block!important;margin:0 0 8px!important;color:#2f343a!important;font-size:13px!important;font-weight:800!important}
.login-page .login-card .input-icon{
  width:100%!important;height:54px!important;min-height:54px!important;margin:0!important;padding:0 15px!important;
  display:flex!important;align-items:center!important;gap:11px!important;border:1px solid #d9dde3!important;border-radius:12px!important;
  background:#fff!important;color:#9198a2!important;box-shadow:none!important;
}
.login-page .login-card .input-icon:focus-within{border-color:#dd7e77!important;box-shadow:0 0 0 4px rgba(217,39,28,.08)!important}
.login-page .login-card .input-icon input{
  flex:1!important;width:100%!important;height:52px!important;min-height:52px!important;margin:0!important;padding:0!important;
  border:0!important;border-radius:0!important;outline:none!important;background:transparent!important;box-shadow:none!important;
  color:#1b1f24!important;font-size:15px!important;font-weight:500!important;appearance:none!important;-webkit-appearance:none!important;
}
.login-page .login-card .input-icon input:-webkit-autofill{-webkit-box-shadow:0 0 0 1000px #fff inset!important;-webkit-text-fill-color:#1b1f24!important}
.login-page .login-card .button.primary.full{
  width:100%!important;height:54px!important;min-height:54px!important;margin:6px 0 0!important;padding:0 20px!important;
  border:0!important;border-radius:12px!important;background:linear-gradient(135deg,#d9271c,#c52017)!important;color:#fff!important;
  display:flex!important;align-items:center!important;justify-content:center!important;gap:9px!important;
  font-size:14px!important;font-weight:850!important;line-height:1!important;box-shadow:0 12px 24px rgba(198,32,23,.18)!important;
}
.login-page .login-card .button.primary.full:hover{background:linear-gradient(135deg,#c52017,#aa1913)!important;transform:translateY(-1px)!important}
.login-page .login-card .login-help{margin:20px 0 0!important;padding-top:18px!important;border-top:1px solid #eceef1!important;color:#8a919b!important;font-size:11px!important;line-height:1.55!important;text-align:center!important}
@media(max-width:1120px){
  .login-page{grid-template-columns:minmax(400px,.88fr) minmax(500px,1.12fr)!important}
  .login-page .login-decoration{padding:44px!important}.login-page .login-panel{padding:36px!important}
}
@media(max-width:900px){
  .login-page{display:block!important;min-height:100vh!important;overflow:auto!important;background:#f4f5f6!important}
  .login-page .login-decoration{display:none!important}
  .login-page .login-panel{min-height:100vh!important;padding:28px 18px!important}
  .login-page .login-card{width:min(500px,100%)!important;padding:34px 30px 36px!important}
}
@media(max-width:520px){
  .login-page .login-panel{padding:16px 12px!important}
  .login-page .login-card{padding:28px 22px 30px!important;border-radius:16px!important}
  .login-page .login-card h2{font-size:29px!important}
}
`;

function withAppBase(path = '/') {
  const rawPath = String(path || '/');

  // Kalau suatu saat navigate menerima URL absolut, jangan diberi prefix lagi.
  if (/^https?:\/\//i.test(rawPath)) {
    return rawPath;
  }

  const normalizedPath = rawPath.startsWith('/')
    ? rawPath
    : `/${rawPath}`;

  // Local / root deployment.
  if (!APP_BASE) {
    return normalizedPath;
  }

  // Hindari prefix ganda.
  if (
    normalizedPath === APP_BASE ||
    normalizedPath.startsWith(`${APP_BASE}/`)
  ) {
    return normalizedPath;
  }

  // Root portal kandidat.
  if (normalizedPath === '/') {
    return `${APP_BASE}/`;
  }

  return `${APP_BASE}${normalizedPath}`;
}

function getInternalPathname() {
  let pathname = window.location.pathname || '/';

  // Browser:
  // /sarinah-talent-pool/backoffice/login
  //
  // React internal route:
  // /backoffice/login
  if (APP_BASE) {
    if (pathname === APP_BASE) {
      return '/';
    }

    if (pathname.startsWith(`${APP_BASE}/`)) {
      pathname = pathname.slice(APP_BASE.length) || '/';
    }
  }

  return pathname.startsWith('/')
    ? pathname
    : `/${pathname}`;
}

function navigate(path) {
  const target = withAppBase(path);
  window.history.pushState({}, '', target);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

function usePathname() {
  const [pathname, setPathname] = useState(getInternalPathname);

  useEffect(() => {
    const listener = () => {
      setPathname(getInternalPathname());
    };

    window.addEventListener('popstate', listener);

    return () => {
      window.removeEventListener('popstate', listener);
    };
  }, []);

  return pathname;
}

async function parseError(response) {
  let body = null;

  try {
    body = await response.json();
  } catch {
    body = null;
  }

  // Prioritaskan detail validation error dari backend.
  // Contoh response:
  // { message: 'Validation failed', errors: { email: 'Email tidak valid' } }
  if (body?.errors && typeof body.errors === 'object') {
    const messages = Object.entries(body.errors)
      .flatMap(([field, value]) => {
        if (Array.isArray(value)) {
          return value.map((message) => `${field}: ${message}`);
        }

        if (value && typeof value === 'object') {
          return Object.entries(value).map(
            ([childField, message]) => `${field}.${childField}: ${message}`
          );
        }

        return [`${field}: ${value}`];
      })
      .filter(Boolean);

    if (messages.length) return messages.join(', ');
  }

  if (body?.message) return body.message;
  if (response.status === 401) return 'Username atau password tidak valid.';
  if (response.status === 403) return 'Akses ditolak. Fitur ini memerlukan role yang sesuai.';
  return `Request gagal (${response.status}).`;
}

function authHeader() {
  const token = sessionStorage.getItem('talentPoolBasicAuth');
  return token ? { Authorization: `Basic ${token}` } : {};
}

async function api(path, options = {}, secured = false) {
  const normalizedPath = String(path || '').startsWith('/')
    ? String(path || '')
    : `/${String(path || '')}`;

  const response = await fetch(`${API_BASE}${normalizedPath}`, {
    ...options,
    headers: {
      ...(secured ? authHeader() : {}),
      ...(options.headers || {}),
    },
  });
  if (!response.ok) throw new Error(await parseError(response));
  if (response.status === 204) return null;
  const contentType = response.headers.get('content-type') || '';
  return contentType.includes('application/json') ? response.json() : response;
}

function candidateAuthHeader() {
  try {
    const stored = sessionStorage.getItem(CANDIDATE_SESSION_KEY);
    const session = stored ? JSON.parse(stored) : null;
    return session?.accessToken
      ? { Authorization: `Bearer ${session.accessToken}` }
      : {};
  } catch {
    return {};
  }
}

async function candidateApi(path, options = {}) {
  const normalizedPath = String(path || '').startsWith('/')
    ? String(path || '')
    : `/${String(path || '')}`;

  const response = await fetch(`${API_BASE}${normalizedPath}`, {
    ...options,
    headers: {
      ...candidateAuthHeader(),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) throw new Error(await parseError(response));
  if (response.status === 204) return null;
  const contentType = response.headers.get('content-type') || '';
  return contentType.includes('application/json') ? response.json() : response;
}

function formatCurrency(value) {
  if (value == null || value === '') return '-';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(value));
}

function formatDateTime(value) {
  if (!value) return '-';
  const date = new Date(value);
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function formatMonthYear(value) {
  if (!value) return '-';
  const parsed = new Date(String(value).length === 10 ? value + 'T00:00:00' : value);
  if (Number.isNaN(parsed.getTime())) return String(value);
  return new Intl.DateTimeFormat('id-ID', { month: 'short', year: 'numeric' }).format(parsed);
}

function monthsToExperience(months) {
  if (!months) return '0 tahun';
  const years = Math.floor(months / 12);
  const remainder = months % 12;
  if (!remainder) return `${years} tahun`;
  return `${years} thn ${remainder} bln`;
}

function initials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'TP';
}

function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(onClose, 4200);
    return () => clearTimeout(timer);
  }, [toast, onClose]);
  if (!toast) return null;
  return (
    <div className={`toast toast-${toast.type || 'success'}`}>
      <span className="toast-icon"><Icon name={toast.type === 'error' ? 'x' : 'check'} size={16}/></span>
      <div><strong>{toast.type === 'error' ? 'Terjadi kesalahan' : 'Berhasil'}</strong><span>{toast.message}</span></div>
      <button onClick={onClose} aria-label="Tutup"><Icon name="x" size={16}/></button>
    </div>
  );
}

function Modal({ title, children, onClose, width = '620px' }) {
  useEffect(() => {
    const handler = (event) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);
  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <section className="modal" style={{ maxWidth: width }}>
        <header><h3>{title}</h3><button className="icon-button" onClick={onClose}><Icon name="x"/></button></header>
        {children}
      </section>
    </div>
  );
}

function Field({ label, required, hint, className = '', children }) {
  return (
    <label className={`field ${className}`}>
      <span>{label}{required && <em>*</em>}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}

function FileDrop({ label, file, onChange, accept, multiple = false, help }) {
  const inputRef = useRef(null);
  const names = multiple ? Array.from(file || []).map((f) => f.name) : file?.name ? [file.name] : [];
  return (
    <div className="file-drop" onClick={() => inputRef.current?.click()}>
      <input ref={inputRef} hidden type="file" accept={accept} multiple={multiple} onChange={(event) => onChange(multiple ? event.target.files : event.target.files?.[0] || null)}/>
      <span className="file-drop-icon"><Icon name="upload" size={24}/></span>
      <strong>{names.length ? names.join(', ') : label}</strong>
      <small>{help}</small>
    </div>
  );
}

const emptyEducation = () => ({
  type: 'FORMAL',
  level: '',
  institution: '',
  major: '',
  startYear: '',
  endYear: '',
  ipk: '',
  description: ''
});
const emptyExperience = () => ({ companyName: '', position: '', startDate: '', endDate: '', currentJob: false, description: '' });
const emptyPortfolio = () => ({ title: 'Portfolio', url: '' });



const CANDIDATE_SESSION_KEY = 'sarinahCandidateSession';

// Autentikasi kandidat menggunakan API JWT Talent Portal.
const CANDIDATE_AUTH_MODE = 'api';

const CAREER_PUBLIC_CSS = `
.candidate-site.career-public{
  --career-red:#e52b1f;
  --career-red-dark:#bd1f17;
  --career-ink:#111318;
  --career-muted:#667085;
  --career-soft:#f6f7f8;
  --career-line:#e6e8ec;
  --career-card:#ffffff;
  background:#fff;
  min-height:100vh;
  color:#15171b;
  overflow-x:hidden;
}
.career-public *{box-sizing:border-box}
.career-public .career-header{height:82px;background:rgba(255,255,255,.96);border-bottom:1px solid rgba(18,18,18,.08);position:sticky;top:0;z-index:80;backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px)}
.career-public .career-header-inner{width:min(1500px,100%);height:100%;margin:auto;padding:0 30px;display:grid;grid-template-columns:210px 1fr 210px;align-items:center;gap:24px;position:relative}
.career-public .career-logo-left,.career-public .career-logo-right{display:flex;align-items:center;min-width:0}
.career-public .career-logo-left img{width:164px;height:54px;display:block;object-fit:contain;object-position:left center}
.career-public .career-logo-right{justify-content:flex-end}
.career-public .career-logo-right img{width:148px;height:54px;display:block;object-fit:contain;object-position:right center}
.career-public .career-nav{height:100%;display:flex;justify-content:center;align-items:stretch;gap:42px}
.career-public .career-nav button{border:0;background:transparent;color:#17191d;font-size:16px;font-weight:760;letter-spacing:-.01em;white-space:nowrap;padding:0;position:relative;cursor:pointer;transition:color .2s ease}
.career-public .career-nav button:hover,.career-public .career-nav button.active{color:var(--career-red)}
.career-public .career-nav button.active:after{content:'';position:absolute;left:0;right:0;bottom:18px;height:3px;background:var(--career-red);border-radius:999px}
.career-public .career-menu-button{display:none;width:42px;height:42px;border:1px solid var(--career-line);border-radius:12px;background:#fff;align-items:center;justify-content:center;color:#18191d}
.career-public .career-menu-button svg{transition:transform .2s ease}

.career-public .career-home{background:#fff}
.career-public .career-home-hero{min-height:650px;display:grid;grid-template-columns:minmax(470px,.88fr) minmax(600px,1.12fr);background:var(--career-ink);color:#fff;position:relative;overflow:hidden}
.career-public .career-home-copy{padding:88px clamp(34px,5vw,86px);display:flex;flex-direction:column;justify-content:center;position:relative;z-index:2}
.career-public .career-home-copy:before{content:'';position:absolute;width:340px;height:340px;border-radius:50%;border:1px solid rgba(255,255,255,.09);left:-190px;top:50%;transform:translateY(-50%)}
.career-public .career-eyebrow{display:inline-flex;align-items:center;gap:9px;width:max-content;padding:8px 12px;border:1px solid rgba(255,255,255,.18);border-radius:999px;background:rgba(255,255,255,.07);font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#fff;margin-bottom:22px}
.career-public .career-eyebrow i{width:7px;height:7px;border-radius:50%;background:#ff4438;box-shadow:0 0 0 5px rgba(255,68,56,.13)}
.career-public .career-home-copy h1{margin:0;font-size:clamp(50px,5vw,78px);line-height:1.02;letter-spacing:-.055em;color:#fff;max-width:760px}
.career-public .career-home-copy h1 span{color:#ff4438}
.career-public .career-home-copy>p{margin:24px 0 0;max-width:670px;font-size:clamp(18px,1.5vw,23px);line-height:1.55;color:rgba(255,255,255,.78)}
.career-public .career-hero-actions{display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin-top:34px}
.career-public .career-cta{min-height:52px;border:0;border-radius:999px;padding:0 26px;background:var(--career-red);color:#fff;font-weight:850;font-size:15px;display:inline-flex;align-items:center;justify-content:center;gap:10px;box-shadow:0 14px 30px rgba(229,43,31,.22);transition:transform .2s ease,background .2s ease,box-shadow .2s ease}
.career-public .career-cta:hover{background:#f13b2f;transform:translateY(-2px);box-shadow:0 18px 34px rgba(229,43,31,.28)}
.career-public .career-text-button{min-height:52px;border:1px solid rgba(255,255,255,.18);border-radius:999px;padding:0 22px;background:rgba(255,255,255,.06);color:#fff;font-weight:750;display:inline-flex;align-items:center;gap:9px;transition:.2s ease}
.career-public .career-text-button:hover{background:rgba(255,255,255,.12)}
.career-public .career-home-visual{min-height:650px;position:relative;background-image:linear-gradient(90deg,rgba(17,19,24,.42),rgba(17,19,24,.06) 35%,rgba(17,19,24,.08)),url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1800&q=88');background-size:cover;background-position:center}
.career-public .career-home-visual:after{content:'';position:absolute;inset:auto 0 0 0;height:44%;background:linear-gradient(180deg,transparent,rgba(17,19,24,.35))}
.career-public .career-floating-card{position:absolute;left:34px;bottom:34px;z-index:2;width:min(390px,calc(100% - 68px));padding:20px 22px;border:1px solid rgba(255,255,255,.24);border-radius:18px;background:rgba(17,19,24,.72);backdrop-filter:blur(12px);color:#fff;box-shadow:0 18px 50px rgba(0,0,0,.2)}
.career-public .career-floating-card strong{display:block;font-size:18px;margin-bottom:6px}.career-public .career-floating-card span{font-size:13px;line-height:1.55;color:rgba(255,255,255,.72)}
.career-public .career-trustbar{background:#fff;border-bottom:1px solid var(--career-line)}
.career-public .career-trustbar-inner{width:min(1420px,calc(100% - 56px));margin:auto;display:grid;grid-template-columns:repeat(4,1fr);padding:26px 0}
.career-public .career-trust-item{display:flex;align-items:center;gap:14px;padding:4px 28px;border-right:1px solid var(--career-line)}
.career-public .career-trust-item:first-child{padding-left:0}.career-public .career-trust-item:last-child{border-right:0;padding-right:0}
.career-public .career-trust-icon{width:44px;height:44px;border-radius:13px;display:grid;place-items:center;background:#fff1ef;color:var(--career-red);flex:0 0 auto}
.career-public .career-trust-item strong{display:block;font-size:14px;margin-bottom:3px}.career-public .career-trust-item small{display:block;color:#737a86;font-size:12px;line-height:1.4}

.career-public .career-section{padding:104px 30px}
.career-public .career-container{width:min(1340px,100%);margin:auto}
.career-public .career-section-head{display:flex;justify-content:space-between;align-items:end;gap:34px;margin-bottom:42px}
.career-public .career-kicker{display:block;color:var(--career-red);font-size:12px;font-weight:900;letter-spacing:.15em;text-transform:uppercase;margin-bottom:12px}
.career-public .career-section-head h2,.career-public .career-life-copy h2,.career-public .career-ready-copy h2{margin:0;font-size:clamp(36px,4vw,58px);line-height:1.04;letter-spacing:-.045em;color:#17191d}
.career-public .career-section-head p{margin:0;max-width:540px;color:#737984;font-size:16px;line-height:1.7}
.career-public .career-special-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:18px}
.career-public .career-special-card{min-height:310px;border:1px solid var(--career-line);border-radius:24px;padding:26px;background:#fff;display:flex;flex-direction:column;position:relative;overflow:hidden;transition:transform .25s ease,box-shadow .25s ease,border-color .25s ease}
.career-public .career-special-card:before{content:'';position:absolute;width:160px;height:160px;border-radius:50%;background:radial-gradient(circle,rgba(229,43,31,.11),transparent 68%);right:-42px;top:-42px;pointer-events:none}
.career-public .career-special-card:hover{transform:translateY(-7px);border-color:#f0beb9;box-shadow:0 22px 45px rgba(17,19,24,.09)}
.career-public .career-special-icon{width:54px;height:54px;border-radius:16px;background:#fff2f0;color:var(--career-red);display:grid;place-items:center;margin-bottom:auto}
.career-public .career-special-card h3{margin:32px 0 10px;font-size:21px;letter-spacing:-.02em}.career-public .career-special-card p{margin:0;color:#737984;line-height:1.65;font-size:14px}
.career-public .career-special-card em{display:block;margin-top:18px;color:var(--career-red);font-style:normal;font-weight:800;font-size:12px}

.career-public .career-life-band{padding:104px 30px;background:#111318;color:#fff;position:relative;overflow:hidden}
.career-public .career-life-band:before{content:'';position:absolute;width:440px;height:440px;border:1px solid rgba(255,255,255,.07);border-radius:50%;right:-180px;top:-170px}
.career-public .career-life-layout{width:min(1340px,100%);margin:auto;display:grid;grid-template-columns:1.05fr .95fr;gap:72px;align-items:center;position:relative}
.career-public .career-life-gallery{display:grid;grid-template-columns:1.1fr .9fr;grid-template-rows:220px 220px;gap:14px}
.career-public .career-life-photo{border-radius:22px;background-size:cover;background-position:center;overflow:hidden;position:relative}
.career-public .career-life-photo.large{grid-row:1/3;background-image:url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=86')}
.career-public .career-life-photo.one{background-image:url('https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=900&q=86')}
.career-public .career-life-photo.two{background-image:url('https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=86')}
.career-public .career-life-photo:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,transparent 50%,rgba(0,0,0,.22))}
.career-public .career-life-copy .career-kicker{color:#ff5a50}.career-public .career-life-copy h2{color:#fff}.career-public .career-life-copy>p{margin:22px 0 0;color:rgba(255,255,255,.68);font-size:16px;line-height:1.75}
.career-public .career-life-points{display:grid;gap:14px;margin:28px 0 0}.career-public .career-life-point{display:flex;gap:13px;align-items:flex-start}.career-public .career-life-point i{width:26px;height:26px;border-radius:50%;background:#e53125;color:#fff;display:grid;place-items:center;font-style:normal;font-size:13px;flex:0 0 auto}.career-public .career-life-point strong{display:block;font-size:14px}.career-public .career-life-point small{display:block;color:rgba(255,255,255,.58);margin-top:4px;line-height:1.5}

.career-public .career-ready{padding:86px 30px;background:#f7f7f8}
.career-public .career-ready-panel{width:min(1340px,100%);margin:auto;padding:60px clamp(28px,5vw,70px);border-radius:30px;background:linear-gradient(125deg,#cf2118,#ef382c 58%,#ff5b50);display:flex;align-items:center;justify-content:space-between;gap:40px;position:relative;overflow:hidden;color:#fff;box-shadow:0 24px 55px rgba(198,30,20,.18)}
.career-public .career-ready-panel:after{content:'';position:absolute;width:300px;height:300px;border:1px solid rgba(255,255,255,.22);border-radius:50%;right:-100px;top:-150px}
.career-public .career-ready-copy{position:relative;z-index:1}.career-public .career-ready-copy .career-kicker{color:#fff}.career-public .career-ready-copy h2{color:#fff;max-width:760px}.career-public .career-ready-copy p{margin:14px 0 0;color:rgba(255,255,255,.84);line-height:1.65}.career-public .career-ready .career-cta{background:#fff;color:#d3251a;box-shadow:none;flex:0 0 auto;position:relative;z-index:1}.career-public .career-ready .career-cta:hover{background:#fff4f2}

.career-public .life-page{background:#f6f6f7;min-height:calc(100vh - 82px)}
.career-public .life-page-hero{min-height:430px;padding:72px 30px;display:flex;align-items:end;background-image:linear-gradient(90deg,rgba(15,17,21,.92),rgba(15,17,21,.56),rgba(15,17,21,.12)),url('https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1900&q=88');background-size:cover;background-position:center;color:#fff}
.career-public .life-page-hero>div{width:min(1340px,100%);margin:auto}.career-public .life-page-hero h1{margin:0;font-size:clamp(50px,6vw,80px);letter-spacing:-.055em;line-height:1;color:#fff}.career-public .life-page-hero p{max-width:780px;margin:22px 0 0;font-size:19px;line-height:1.7;color:rgba(255,255,255,.8)}
.career-public .life-content{padding:78px 30px 100px}.career-public .life-grid-wrap{width:min(1340px,100%);margin:auto}.career-public .life-grid{display:grid;grid-template-columns:repeat(12,1fr);gap:18px}.career-public .life-card{grid-column:span 4;min-height:310px;border-radius:22px;background-size:cover;background-position:center;position:relative;overflow:hidden;box-shadow:0 14px 34px rgba(17,19,24,.08);transition:transform .25s ease}.career-public .life-card:nth-child(1),.career-public .life-card:nth-child(4){grid-column:span 5}.career-public .life-card:nth-child(2),.career-public .life-card:nth-child(5){grid-column:span 3}.career-public .life-card:nth-child(3),.career-public .life-card:nth-child(6){grid-column:span 4}.career-public .life-card:hover{transform:translateY(-5px)}.career-public .life-card:before{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.02) 25%,rgba(0,0,0,.82) 100%)}.career-public .life-card-content{position:absolute;left:24px;right:24px;bottom:22px;color:#fff;z-index:1}.career-public .life-card-content h3{margin:0 0 8px;font-size:21px;color:#fff}.career-public .life-card-content p{margin:0;color:rgba(255,255,255,.8);font-size:13px;line-height:1.55}

.career-public .open-page{background:#f6f6f7;min-height:calc(100vh - 82px)}
.career-public .open-hero{min-height:500px;background:#111318;color:#fff;display:grid;place-items:center;text-align:center;padding:74px 30px;position:relative;overflow:hidden}.career-public .open-hero:before,.career-public .open-hero:after{content:'';position:absolute;border-radius:50%;border:1px solid rgba(255,255,255,.09)}.career-public .open-hero:before{width:420px;height:420px;left:-180px;top:-150px}.career-public .open-hero:after{width:520px;height:520px;right:-250px;bottom:-280px}.career-public .open-hero-inner{max-width:980px;position:relative;z-index:1}.career-public .open-availability{display:inline-flex;align-items:center;gap:9px;padding:8px 13px;border:1px solid rgba(255,255,255,.17);border-radius:999px;background:rgba(255,255,255,.06);font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase}.career-public .open-availability i{width:8px;height:8px;border-radius:50%;background:#ff493e}.career-public .open-hero h1{margin:20px 0 0;font-size:clamp(48px,6vw,78px);line-height:1.02;letter-spacing:-.05em;color:#fff}.career-public .open-hero p{max-width:800px;margin:22px auto 0;color:rgba(255,255,255,.7);font-size:18px;line-height:1.7}.career-public .open-hero .career-cta{margin-top:32px}
.career-public .open-content{padding:78px 30px 96px}.career-public .open-panel{width:min(1120px,100%);margin:auto;background:#fff;border:1px solid var(--career-line);border-radius:28px;padding:42px;box-shadow:0 18px 46px rgba(17,19,24,.06)}.career-public .open-panel-head{text-align:center;max-width:720px;margin:0 auto 34px}.career-public .open-panel-head h2{margin:0;font-size:32px;letter-spacing:-.03em}.career-public .open-panel-head p{margin:12px 0 0;color:#747b87;line-height:1.65}.career-public .open-steps{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.career-public .open-step{padding:24px;border-radius:18px;background:#fafafa;border:1px solid #eceef1}.career-public .open-step span{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:#fff0ee;color:var(--career-red);font-weight:900;margin-bottom:18px}.career-public .open-step strong{display:block;margin-bottom:7px}.career-public .open-step p{margin:0;color:#747b87;font-size:13px;line-height:1.55}

.career-public .public-jobs-section{padding:76px 30px 20px;background:#f6f6f7}
.career-public .public-jobs-wrap{width:min(1340px,100%);margin:auto}
.career-public .public-jobs-head{display:flex;align-items:end;justify-content:space-between;gap:32px;margin-bottom:30px}
.career-public .public-jobs-head h2{margin:0;font-size:clamp(34px,4vw,52px);line-height:1.06;letter-spacing:-.04em;color:#17191d}
.career-public .public-jobs-head p{margin:0;max-width:520px;color:#737984;line-height:1.7}
.career-public .public-jobs-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}
.career-public .public-job-card{background:#fff;border:1px solid #e3e5e8;padding:26px 28px;display:flex;flex-direction:column;min-height:270px;transition:border-color .2s ease,transform .2s ease,box-shadow .2s ease}
.career-public .public-job-card:hover{border-color:#efb3ae;transform:translateY(-3px);box-shadow:0 16px 34px rgba(17,19,24,.07)}
.career-public .public-job-top{display:flex;align-items:flex-start;justify-content:space-between;gap:18px}
.career-public .public-job-department{font-size:11px;font-weight:900;letter-spacing:.12em;text-transform:uppercase;color:var(--career-red)}
.career-public .public-job-card h3{margin:9px 0 0;font-size:25px;line-height:1.22;letter-spacing:-.025em;color:#17191d}
.career-public .public-job-openings{flex:0 0 auto;background:#fff2f0;color:#c9241a;padding:7px 10px;font-size:11px;font-weight:850}
.career-public .public-job-meta{display:flex;flex-wrap:wrap;gap:10px 18px;margin:18px 0 0;color:#656d79;font-size:13px}
.career-public .public-job-meta span{display:inline-flex;align-items:center;gap:6px}
.career-public .public-job-description{margin:18px 0 0;color:#747b87;line-height:1.65;font-size:14px;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.career-public .public-job-footer{margin-top:auto;padding-top:24px;display:flex;align-items:center;justify-content:space-between;gap:16px;border-top:1px solid #eceef0}
.career-public .public-job-deadline{font-size:12px;color:#747b87}.career-public .public-job-deadline strong{color:#2a2e34}
.career-public .public-job-apply{min-height:44px;border:0;background:var(--career-red);color:#fff;padding:0 18px;font-weight:850;display:inline-flex;align-items:center;gap:8px;cursor:pointer}
.career-public .public-job-apply:hover{background:var(--career-red-dark)}
.career-public .public-jobs-state{min-height:220px;background:#fff;border:1px solid #e3e5e8;display:grid;place-items:center;text-align:center;padding:38px}
.career-public .public-jobs-state-inner{max-width:560px}.career-public .public-jobs-state svg{color:var(--career-red);margin-bottom:10px}
.career-public .public-jobs-state strong{display:block;font-size:19px;margin-bottom:7px}.career-public .public-jobs-state p{margin:0;color:#747b87;line-height:1.6}
.career-public .public-jobs-actions{margin-top:18px;display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap}
.career-public .public-jobs-retry{min-height:42px;border:1px solid #d9dde2;background:#fff;color:#24282f;padding:0 16px;font-weight:800;cursor:pointer}
.career-public .public-jobs-retry:hover{border-color:#b9bec6;background:#fafafa}

.career-public .faq-page{min-height:calc(100vh - 82px);padding:86px 30px 100px;background:#f6f6f7}.career-public .faq-layout{width:min(1120px,100%);margin:auto;display:grid;grid-template-columns:.7fr 1.3fr;gap:72px}.career-public .faq-intro h1{margin:0;font-size:clamp(44px,5vw,66px);letter-spacing:-.05em}.career-public .faq-intro p{color:#747b87;line-height:1.7;margin:18px 0 0}.career-public .faq-list{display:grid;gap:12px}.career-public .faq-item{border:1px solid var(--career-line);border-radius:18px;background:#fff;overflow:hidden}.career-public .faq-question{width:100%;min-height:64px;border:0;background:#fff;padding:18px 20px;display:flex;align-items:center;justify-content:space-between;gap:20px;text-align:left;font-weight:800;color:#1a1c21}.career-public .faq-question span:last-child{width:28px;height:28px;border-radius:50%;background:#fff1ef;color:var(--career-red);display:grid;place-items:center;flex:0 0 auto}.career-public .faq-answer{padding:0 20px 20px;color:#747b87;line-height:1.65;font-size:14px}

.career-public .apply-shell{padding:22px 22px 42px;background:#f4f5f6;min-height:calc(100vh - 82px)}.career-public .apply-titlebar{max-width:1440px;margin:12px auto 16px;display:flex;align-items:center;justify-content:space-between;gap:18px}.career-public .apply-titlebar h1{margin:0;font-size:28px;letter-spacing:-.03em}.career-public .apply-titlebar p{margin:5px 0 0;color:#68758f;font-size:13px}.career-public .apply-titlebar button{border:0;background:#fff;border-radius:999px;padding:10px 14px;color:var(--career-red);font-weight:800;box-shadow:0 4px 15px rgba(17,19,24,.05)}.career-public .apply-progress{max-width:1440px;margin:0 auto 12px;height:5px;background:#e6e8ec;border-radius:999px;overflow:hidden}.career-public .apply-progress i{display:block;height:100%;background:linear-gradient(90deg,#d92318,#ff4e43);border-radius:999px;transition:width .25s ease}.career-public .apply-shell .candidate-form{margin:0 auto;max-width:1440px;border-radius:24px;overflow:hidden;box-shadow:0 15px 38px rgba(32,44,61,.08);border:1px solid #e5e8ed}.career-public .apply-shell .stepper button.active span{background:var(--career-red);box-shadow:0 6px 14px rgba(229,43,31,.23)}.career-public .apply-shell .button.primary{background:var(--career-red);border-color:var(--career-red)}.career-public .apply-shell .button.primary:hover{background:var(--career-red-dark);border-color:var(--career-red-dark)}
.career-public .success-page{min-height:calc(100vh - 82px);background:radial-gradient(circle at 15% 20%,rgba(229,43,31,.08),transparent 28%),#f6f6f7}
.career-public .success-card{border:1px solid var(--career-line);box-shadow:0 20px 50px rgba(17,19,24,.08)}
.career-public .success-icon{background:#fff0ee;color:var(--career-red)}
.career-public .career-success-logo{width:150px;height:62px;object-fit:contain;margin:0 auto 8px}
.career-public .success-card .button.primary{background:var(--career-red);border-color:var(--career-red)}

.career-public .career-footer{background:#0f1115;color:#fff;padding:58px 30px 26px}.career-public .career-footer-inner{width:min(1340px,100%);margin:auto;display:grid;grid-template-columns:1.25fr .75fr .85fr;gap:70px}.career-public .career-footer-brand img{width:158px;height:62px;object-fit:contain;object-position:left center;filter:brightness(0) invert(1);margin-bottom:16px}.career-public .career-footer-brand p{max-width:460px;margin:0;color:rgba(255,255,255,.62);line-height:1.7;font-size:13px}.career-public .career-footer h4{margin:0 0 16px;font-size:13px;letter-spacing:.1em;text-transform:uppercase;color:#fff}.career-public .career-footer-links{display:grid;gap:10px}.career-public .career-footer-links button{border:0;background:transparent;padding:0;color:rgba(255,255,255,.68);text-align:left;font-size:13px;cursor:pointer}.career-public .career-footer-links button:hover{color:#fff}.career-public .career-footer-contact p{margin:0 0 9px;color:rgba(255,255,255,.68);font-size:13px;line-height:1.5}.career-public .career-footer-bottom{width:min(1340px,100%);margin:38px auto 0;padding-top:20px;border-top:1px solid rgba(255,255,255,.11);display:flex;justify-content:space-between;gap:20px;color:rgba(255,255,255,.42);font-size:11px}

/* =========================================================
   EDITORIAL CLEANUP — clean corporate, less card/border-heavy
   ========================================================= */
.career-public .career-eyebrow,
.career-public .open-availability{padding:0;border:0;border-radius:0;background:transparent;letter-spacing:.14em}
.career-public .career-eyebrow i,.career-public .open-availability i{box-shadow:none}
.career-public .career-cta,.career-public .career-text-button{border-radius:4px;box-shadow:none}
.career-public .career-text-button{border-color:rgba(255,255,255,.28);background:transparent}
.career-public .career-cta:hover{box-shadow:none}
.career-public .career-floating-card{left:0;bottom:0;width:min(520px,82%);padding:22px 28px;border:0;border-radius:0;background:rgba(17,19,24,.88);box-shadow:none;backdrop-filter:none}
.career-public .career-trustbar{border-bottom:0}
.career-public .career-trustbar-inner{border-bottom:1px solid #ededed}
.career-public .career-trust-item{border-right:0;position:relative}
.career-public .career-trust-item:not(:last-child):after{content:'';position:absolute;right:0;top:8px;bottom:8px;width:1px;background:#ececec}
.career-public .career-trust-icon{width:38px;height:38px;border-radius:4px;background:#f7e8e6}
.career-public .career-special-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:0;border-top:1px solid #dedede;border-bottom:1px solid #dedede}
.career-public .career-special-card{min-height:300px;border:0;border-radius:0;padding:32px 28px;background:#fff;box-shadow:none}
.career-public .career-special-card:not(:last-child){border-right:1px solid #e5e5e5}
.career-public .career-special-card:before{display:none}
.career-public .career-special-card:hover{transform:none;border-color:transparent;box-shadow:none;background:#fafafa}
.career-public .career-special-icon{border-radius:4px;background:#f7e8e6}
.career-public .career-life-photo,.career-public .life-card{border-radius:4px;box-shadow:none}
.career-public .career-ready-panel{border-radius:4px;box-shadow:none;background:#d9271c}
.career-public .career-ready-panel:after{display:none}
.career-public .open-panel{border:0;border-radius:0;box-shadow:none;padding:0}
.career-public .open-steps{gap:0;border-top:1px solid #dadde2;border-bottom:1px solid #dadde2}
.career-public .open-step{border:0;border-radius:0;background:#fff;padding:30px 28px}
.career-public .open-step:not(:last-child){border-right:1px solid #e1e3e7}
.career-public .open-step span{border-radius:4px}
.career-public .faq-page{background:#fff}
.career-public .faq-item{border:0;border-radius:0;border-bottom:1px solid #dedede;background:transparent}
.career-public .faq-list{gap:0;border-top:1px solid #dedede}
.career-public .faq-question{padding:22px 0;background:transparent;font-size:16px}
.career-public .faq-question span:last-child{border-radius:0;background:transparent;font-size:23px;font-weight:400}
.career-public .faq-answer{padding:0 48px 24px 0;max-width:780px}
.career-public .career-home-faq{padding:96px 30px;background:#fff}
.career-public .career-home-faq-inner{width:min(1180px,100%);margin:auto}
.career-public .career-home-faq-head{display:grid;grid-template-columns:1fr .8fr;gap:60px;align-items:end;margin-bottom:34px}
.career-public .career-home-faq-head h2{margin:0;font-size:clamp(36px,4vw,54px);line-height:1.06;letter-spacing:-.04em}
.career-public .career-home-faq-head p{margin:0;color:#737984;line-height:1.7;max-width:460px}
.career-public .career-home-faq-list{border-top:1px solid #dcdcdc}
.career-public .career-home-faq-item{border-bottom:1px solid #dcdcdc}
.career-public .career-home-faq-question{width:100%;border:0;background:transparent;padding:23px 0;display:flex;justify-content:space-between;align-items:center;gap:28px;text-align:left;color:#17191d;font-size:17px;font-weight:800}
.career-public .career-home-faq-question span:last-child{font-size:25px;font-weight:400;color:var(--career-red)}
.career-public .career-home-faq-answer{padding:0 52px 24px 0;color:#6f7580;line-height:1.7;max-width:880px}
.career-public .career-faq-more{margin-top:24px;border:0;background:transparent;padding:0;color:var(--career-red);font-weight:850;display:inline-flex;align-items:center;gap:7px}
.career-public .apply-shell .candidate-form{border:0;border-radius:8px;box-shadow:0 10px 30px rgba(32,44,61,.06)}

@media(max-width:760px){
  .career-public .career-home-faq{padding:64px 22px}
  .career-public .career-home-faq-head{grid-template-columns:1fr;gap:14px;margin-bottom:24px}
  .career-public .career-home-faq-question{font-size:15px;padding:20px 0}
  .career-public .career-home-faq-answer{padding:0 34px 20px 0;font-size:14px}
  .career-public .career-special-grid{grid-template-columns:1fr}
  .career-public .career-special-card:not(:last-child){border-right:0;border-bottom:1px solid #e5e5e5}
  .career-public .open-steps{grid-template-columns:1fr}
  .career-public .open-step:not(:last-child){border-right:0;border-bottom:1px solid #e1e3e7}
  .career-public .career-trust-item:not(:last-child):after{display:none}
}

@media(max-width:1180px){
  .career-public .career-header-inner{grid-template-columns:180px 1fr 170px}.career-public .career-nav{gap:24px}
  .career-public .career-home-hero{grid-template-columns:1fr 1fr}.career-public .career-home-copy{padding-left:40px;padding-right:40px}
  .career-public .career-trustbar-inner{grid-template-columns:repeat(2,1fr);gap:0}.career-public .career-trust-item:nth-child(2){border-right:0}.career-public .career-trust-item:nth-child(3),.career-public .career-trust-item:nth-child(4){margin-top:20px}
  .career-public .career-special-grid{grid-template-columns:repeat(2,1fr)}
  .career-public .career-life-layout{gap:42px}
  .career-public .life-card,.career-public .life-card:nth-child(n){grid-column:span 6}
}
@media(max-width:860px){
  .career-public .career-header{height:74px}.career-public .career-header-inner{grid-template-columns:1fr auto;padding:0 18px}.career-public .career-logo-left img{width:138px;height:48px}.career-public .career-logo-right{display:flex;gap:8px}.career-public .career-logo-right img{width:104px;height:44px}.career-public .career-menu-button{display:inline-flex}
  .career-public .career-nav{display:none;position:absolute;left:14px;right:14px;top:68px;height:auto;padding:12px;background:#fff;border:1px solid var(--career-line);border-radius:16px;box-shadow:0 20px 45px rgba(17,19,24,.14);flex-direction:column;align-items:stretch;gap:2px}.career-public .career-nav.open{display:flex}.career-public .career-nav button{min-height:46px;text-align:left;padding:0 14px;border-radius:10px}.career-public .career-nav button.active{background:#fff1ef}.career-public .career-nav button.active:after{display:none}
  .career-public .career-home-hero{grid-template-columns:1fr}.career-public .career-home-copy{padding:66px 28px 56px;min-height:500px}.career-public .career-home-visual{min-height:420px}.career-public .career-floating-card{left:20px;bottom:20px;width:calc(100% - 40px)}
  .career-public .career-trustbar-inner{width:calc(100% - 28px)}.career-public .career-trust-item{padding:10px 14px}.career-public .career-trust-item:first-child{padding-left:14px}
  .career-public .career-section{padding:78px 22px}.career-public .career-section-head{align-items:start;flex-direction:column;margin-bottom:30px}
  .career-public .career-life-band{padding:76px 22px}.career-public .career-life-layout{grid-template-columns:1fr}.career-public .career-life-gallery{order:2}.career-public .career-life-copy{order:1}
  .career-public .career-ready{padding:66px 22px}.career-public .career-ready-panel{align-items:flex-start;flex-direction:column}
  .career-public .life-page-hero{min-height:360px;padding:54px 22px}.career-public .life-content{padding:56px 22px 76px}.career-public .open-content{padding:56px 22px 76px}.career-public .open-steps{grid-template-columns:1fr}.career-public .faq-page{padding:64px 22px 80px}.career-public .faq-layout{grid-template-columns:1fr;gap:34px}
  .career-public .public-jobs-section{padding:56px 22px 10px}.career-public .public-jobs-head{align-items:flex-start;flex-direction:column;gap:12px}.career-public .public-jobs-grid{grid-template-columns:1fr}
  .career-public .career-footer-inner{grid-template-columns:1fr 1fr}.career-public .career-footer-brand{grid-column:1/-1}.career-public .career-footer{padding-left:22px;padding-right:22px}
}
@media(max-width:620px){
  .career-public .career-logo-right img{width:86px}.career-public .career-home-copy h1{font-size:44px}.career-public .career-home-copy>p{font-size:17px}.career-public .career-hero-actions{align-items:stretch;flex-direction:column}.career-public .career-cta,.career-public .career-text-button{width:100%}
  .career-public .career-trustbar-inner{grid-template-columns:1fr}.career-public .career-trust-item,.career-public .career-trust-item:nth-child(n){border-right:0;border-bottom:1px solid var(--career-line);margin-top:0;padding:14px}.career-public .career-trust-item:last-child{border-bottom:0}
  .career-public .career-special-grid{grid-template-columns:1fr}.career-public .career-special-card{min-height:260px}
  .career-public .career-life-gallery{grid-template-columns:1fr;grid-template-rows:260px 190px 190px}.career-public .career-life-photo.large{grid-row:auto}
  .career-public .career-ready-panel{padding:38px 24px;border-radius:24px}.career-public .career-ready-copy h2{font-size:38px}
  .career-public .life-grid{grid-template-columns:1fr}.career-public .life-card,.career-public .life-card:nth-child(n){grid-column:1;min-height:300px}.career-public .open-hero{min-height:430px;padding-left:22px;padding-right:22px}.career-public .open-panel{padding:26px 20px}.career-public .faq-intro h1{font-size:44px}
  .career-public .public-job-card{padding:22px 20px}.career-public .public-job-top{flex-direction:column}.career-public .public-job-footer{align-items:stretch;flex-direction:column}.career-public .public-job-apply{justify-content:center;width:100%}
  .career-public .apply-shell{padding:14px 8px 28px}.career-public .apply-titlebar{align-items:flex-start;flex-direction:column;padding:0 6px}.career-public .apply-titlebar button{align-self:flex-start}.career-public .apply-shell .candidate-form{border-radius:18px}.career-public .apply-shell .stepper{grid-template-columns:repeat(7,142px);overflow-x:auto;padding-left:16px;padding-right:16px}.career-public .apply-shell .step-content{padding:24px 18px}.career-public .apply-shell .form-footer{align-items:stretch;flex-direction:column}.career-public .apply-shell .form-footer>div:last-child{width:100%;display:grid;grid-template-columns:1fr 1fr}.career-public .apply-shell .form-footer>div:last-child .button:only-child{grid-column:1/-1}
  .career-public .career-footer-inner{grid-template-columns:1fr;gap:34px}.career-public .career-footer-brand{grid-column:auto}.career-public .career-footer-bottom{flex-direction:column}
}


/* =========================================================
   CANDIDATE SIGN-IN PAGE
   ========================================================= */
.career-public .candidate-signin-page{
  min-height:calc(100vh - 82px);
  background:#f5f6f7;
  display:grid;
  place-items:center;
  padding:54px 24px 72px;
}
.career-public .candidate-signin-layout{
  width:min(1080px,100%);
  display:grid;
  grid-template-columns:minmax(0,.95fr) minmax(420px,.72fr);
  background:#fff;
  border:1px solid #e5e7eb;
  box-shadow:0 22px 60px rgba(17,19,24,.10);
  overflow:hidden;
  min-height:610px;
}
.career-public .candidate-signin-visual{
  position:relative;
  padding:54px;
  color:#fff;
  display:flex;
  flex-direction:column;
  justify-content:flex-end;
  background:
    linear-gradient(180deg,rgba(17,19,24,.14),rgba(17,19,24,.88)),
    url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=85') center/cover;
}
.career-public .candidate-signin-visual:before{
  content:'';
  position:absolute;
  width:310px;
  height:310px;
  border:1px solid rgba(255,255,255,.15);
  border-radius:50%;
  top:-120px;
  left:-120px;
}
.career-public .candidate-signin-visual>*{position:relative;z-index:1}
.career-public .candidate-signin-visual .candidate-signin-kicker{
  display:inline-flex;
  align-items:center;
  gap:9px;
  width:max-content;
  margin-bottom:18px;
  font-size:12px;  font-weight:900;
  letter-spacing:.13em;
  text-transform:uppercase;
}
.career-public .candidate-signin-visual .candidate-signin-kicker i{
  width:8px;
  height:8px;
  border-radius:50%;
  background:#ff4438;
}
.career-public .candidate-signin-visual h1{
  margin:0;
  max-width:620px;
  color:#fff;
  font-size:clamp(44px,5vw,68px);
  line-height:1.02;
  letter-spacing:-.05em;
}
.career-public .candidate-signin-visual p{
  margin:20px 0 0;
  max-width:560px;
  color:rgba(255,255,255,.76);
  font-size:16px;
  line-height:1.7;
}
.career-public .candidate-signin-panel{
  padding:52px 48px;
  display:flex;
  flex-direction:column;
  justify-content:center;
}
.career-public .candidate-signin-back{
  align-self:flex-start;
  border:0;
  background:transparent;
  padding:0;
  margin:0 0 34px;
  display:inline-flex;
  align-items:center;
  gap:7px;
  color:#6d7480;
  font-weight:750;
  cursor:pointer;
}
.career-public .candidate-signin-back:hover{color:var(--career-red)}
.career-public .candidate-signin-panel h2{
  margin:0;
  font-size:32px;
  letter-spacing:-.04em;
  color:#17191d;
}
.career-public .candidate-signin-panel>p{
  margin:9px 0 26px;
  color:#707887;
  font-size:14px;
  line-height:1.6;
}
.career-public .candidate-signin-target{
  margin:0 0 22px;
  padding:12px 13px;
  background:#fff7f6;
  border-left:3px solid var(--career-red);
  color:#555d69;
  font-size:12px;
  line-height:1.55;
}
.career-public .candidate-signin-target strong{color:#202329}
.career-public .candidate-signin-form{display:grid;gap:16px}
.career-public .candidate-signin-field{display:grid;gap:7px}
.career-public .candidate-signin-field>span{
  font-size:12px;
  font-weight:850;
  color:#333840;
}
.career-public .candidate-signin-input{
  height:50px;
  border:1px solid #dfe2e7;
  border-radius:10px;
  padding:0 13px;
  display:flex;
  align-items:center;
  gap:10px;
  background:#fff;
}
.career-public .candidate-signin-input:focus-within{
  border-color:#eb8d86;
  box-shadow:0 0 0 3px rgba(229,43,31,.08);
}
.career-public .candidate-signin-input svg{color:#8c94a1;flex:0 0 auto}
.career-public .candidate-signin-input input{
  flex:1;
  min-width:0;
  height:100%;
  border:0;
  outline:0;
  background:transparent;
  font:inherit;
  color:#17191d;
}
.career-public .candidate-signin-submit{
  height:50px;
  border:0;
  border-radius:10px;
  background:var(--career-red);
  color:#fff;
  font-weight:900;
  display:flex;
  align-items:center;
  justify-content:center;
  gap:8px;
  cursor:pointer;
}
.career-public .candidate-signin-submit:hover{background:var(--career-red-dark)}
.career-public .candidate-signin-submit:disabled{opacity:.6;cursor:not-allowed}
.career-public .candidate-signin-demo{
  margin-top:18px;
  padding:13px 14px;
  border:1px solid #f0dfad;
  background:#fff9e9;
  color:#735f28;
  border-radius:10px;
  display:flex;
  gap:9px;
  align-items:flex-start;
  font-size:11px;
  line-height:1.55;
}
.career-public .candidate-signin-demo svg{flex:0 0 auto;margin-top:1px}
.career-public .candidate-signin-footer{
  margin-top:20px;
  color:#8a919d;
  font-size:11px;
  line-height:1.55;
}

@media(max-width:860px){
  .career-public .candidate-signin-page{min-height:calc(100vh - 74px);padding:28px 16px 48px}
  .career-public .candidate-signin-layout{grid-template-columns:1fr;min-height:auto}
  .career-public .candidate-signin-visual{min-height:300px;padding:34px}
  .career-public .candidate-signin-panel{padding:36px 30px 42px}
}
@media(max-width:560px){
  .career-public .candidate-signin-page{padding-left:0;padding-right:0;padding-top:0}
  .career-public .candidate-signin-layout{border-left:0;border-right:0;box-shadow:none}
  .career-public .candidate-signin-visual{min-height:230px;padding:26px 22px}
  .career-public .candidate-signin-visual h1{font-size:40px}
  .career-public .candidate-signin-panel{padding:30px 22px 38px}
}

/* =========================================================
   CANDIDATE LOGIN — frontend mock, API-ready
   ========================================================= */
.career-public .career-logo-right{gap:12px}
.career-public .candidate-login-button{
  height:40px;
  padding:0 16px;
  border:1px solid #dfe2e7;
  border-radius:999px;
  background:#fff;
  color:#17191d;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:8px;
  font-size:13px;
  font-weight:850;
  cursor:pointer;
  white-space:nowrap;
  transition:.2s ease;
}
.career-public .candidate-login-button:hover{
  color:var(--career-red);
  border-color:#efb4af;
  background:#fff8f7;
}
.career-public .candidate-account{position:relative}
.career-public .candidate-account-button{
  height:42px;
  max-width:190px;
  padding:0 10px 0 6px;
  border:1px solid #dfe2e7;
  border-radius:999px;
  background:#fff;
  display:flex;
  align-items:center;
  gap:9px;
  cursor:pointer;
  color:#17191d;
}
.career-public .candidate-avatar{
  width:30px;
  height:30px;
  border-radius:50%;
  display:grid;
  place-items:center;
  background:#fce8e6;
  color:var(--career-red);
  font-size:11px;
  font-weight:900;
  flex:0 0 auto;
}
.career-public .candidate-account-copy{
  min-width:0;
  display:flex;
  flex-direction:column;
  align-items:flex-start;
  line-height:1.15;
}
.career-public .candidate-account-copy strong{
  max-width:125px;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
  font-size:12px;
}
.career-public .candidate-account-copy small{
  max-width:125px;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
  margin-top:3px;
  color:#7a828f;
  font-size:10px;
}
.career-public .candidate-account-menu{
  position:absolute;
  top:50px;
  right:0;
  min-width:210px;
  padding:8px;
  background:#fff;
  border:1px solid #e3e5e9;
  border-radius:12px;
  box-shadow:0 18px 45px rgba(17,19,24,.14);
  z-index:120;
}
.career-public .candidate-account-menu button{
  width:100%;
  min-height:40px;
  padding:0 12px;
  border:0;
  border-radius:8px;
  background:transparent;
  color:#202329;
  display:flex;
  align-items:center;
  gap:9px;
  font-weight:750;
  cursor:pointer;
  text-align:left;
}
.career-public .candidate-account-menu button:hover{background:#f7f7f8}
.career-public .candidate-account-menu button.danger{color:#c3261c}

.career-public .candidate-auth-backdrop{
  position:fixed;
  inset:0;
  z-index:220;
  background:rgba(10,12,16,.58);
  backdrop-filter:blur(5px);
  -webkit-backdrop-filter:blur(5px);
  display:grid;
  place-items:center;
  padding:22px;
}
.career-public .candidate-auth-card{
  width:min(460px,100%);
  background:#fff;
  border-radius:20px;
  overflow:hidden;
  box-shadow:0 28px 80px rgba(0,0,0,.26);
  animation:candidateAuthIn .18s ease-out;
}
@keyframes candidateAuthIn{
  from{opacity:0;transform:translateY(8px) scale(.985)}
  to{opacity:1;transform:none}
}
.career-public .candidate-auth-top{
  padding:24px 26px 18px;
  border-bottom:1px solid #eceef1;
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap:20px;
}
.career-public .candidate-auth-brand{
  display:flex;
  align-items:center;
  gap:13px;
}
.career-public .candidate-auth-brand img{
  width:92px;
  height:42px;
  object-fit:contain;
  object-position:left center;
}
.career-public .candidate-auth-brand div{
  width:1px;
  height:30px;
  background:#e2e4e8;
}
.career-public .candidate-auth-brand strong{
  font-size:14px;
  color:#191b20;
}
.career-public .candidate-auth-close{
  width:36px;
  height:36px;
  border:0;
  border-radius:9px;
  background:#f5f6f7;
  display:grid;
  place-items:center;
  color:#4d5562;
  cursor:pointer;
}
.career-public .candidate-auth-body{padding:26px}
.career-public .candidate-auth-body h2{
  margin:0;
  font-size:27px;
  letter-spacing:-.035em;
  color:#17191d;
}
.career-public .candidate-auth-body>p{
  margin:8px 0 22px;
  color:#707887;
  font-size:13px;
  line-height:1.6;
}
.career-public .candidate-auth-field{
  display:grid;
  gap:7px;
  margin-bottom:15px;
}
.career-public .candidate-auth-field span{
  font-size:12px;
  font-weight:800;
  color:#30343b;
}
.career-public .candidate-auth-input{
  height:48px;
  border:1px solid #dfe2e7;
  border-radius:10px;
  display:flex;
  align-items:center;
  gap:10px;
  padding:0 13px;
  background:#fff;
}
.career-public .candidate-auth-input:focus-within{
  border-color:#ee8c85;
  box-shadow:0 0 0 3px rgba(229,43,31,.08);
}
.career-public .candidate-auth-input svg{color:#8a93a2;flex:0 0 auto}
.career-public .candidate-auth-input input{
  width:100%;
  height:100%;
  border:0;
  outline:0;
  background:transparent;
  font:inherit;
  color:#17191d;
}
.career-public .candidate-auth-submit{
  width:100%;
  height:50px;
  margin-top:4px;
  border:0;
  border-radius:10px;
  background:var(--career-red);
  color:#fff;
  display:flex;
  align-items:center;
  justify-content:center;
  gap:9px;
  font-weight:900;
  cursor:pointer;
}
.career-public .candidate-auth-submit:hover{background:var(--career-red-dark)}
.career-public .candidate-auth-submit:disabled{opacity:.6;cursor:not-allowed}
.career-public .candidate-auth-note{
  margin-top:16px;
  padding:12px 13px;
  border-radius:10px;
  background:#fff8e8;
  border:1px solid #f4dfaa;
  color:#725c1f;
  font-size:11px;
  line-height:1.5;
  display:flex;
  gap:8px;
  align-items:flex-start;
}
.career-public .candidate-auth-note svg{flex:0 0 auto;margin-top:1px}
.career-public .candidate-auth-target{
  margin:0 0 18px;
  padding:11px 12px;
  border-left:3px solid var(--career-red);
  background:#fafafa;
  color:#555e6c;
  font-size:12px;
  line-height:1.5;
}
.career-public .candidate-auth-target strong{color:#202329}

@media(max-width:1180px){
  .career-public .career-header-inner{grid-template-columns:180px 1fr 290px}
}
@media(max-width:860px){
  .career-public .career-header-inner{grid-template-columns:1fr auto}
  .career-public .career-logo-right{gap:7px}
  .career-public .candidate-account-copy{display:none}
  .career-public .candidate-account-button{width:42px;padding:0;justify-content:center}
  .career-public .candidate-login-button{height:38px;padding:0 11px;font-size:0}
  .career-public .candidate-login-button svg{width:18px;height:18px}
}
@media(max-width:620px){
  .career-public .career-logo-right img{display:none}
  .career-public .candidate-auth-card{border-radius:16px}
  .career-public .candidate-auth-top,.career-public .candidate-auth-body{padding-left:20px;padding-right:20px}
}


.career-public .candidate-auth-tabs{display:grid;grid-template-columns:1fr 1fr;gap:5px;padding:4px;background:#f2f3f5;border-radius:11px;margin:0 0 22px}
.career-public .candidate-auth-tab{height:38px;border:0;border-radius:8px;background:transparent;color:#6b7280;font-weight:850;cursor:pointer}
.career-public .candidate-auth-tab.active{background:#fff;color:var(--career-red);box-shadow:0 3px 10px rgba(17,19,24,.07)}
.career-public .candidate-register-grid{display:grid;grid-template-columns:1fr 1fr;gap:0 12px}
.career-public .candidate-register-grid .full{grid-column:1/-1}
.career-public .candidate-auth-switch{margin-top:16px;text-align:center;color:#737b87;font-size:12px}
.career-public .candidate-auth-switch button{border:0;background:transparent;color:var(--career-red);font-weight:850;cursor:pointer}
.career-public .candidate-portal-page{min-height:calc(100vh - 82px);padding:72px 30px 96px;background:#f6f7f8}
.career-public .candidate-portal-wrap{width:min(1180px,100%);margin:auto}
.career-public .candidate-portal-head{display:flex;justify-content:space-between;align-items:flex-end;gap:24px;margin-bottom:28px}
.career-public .candidate-portal-head h1{margin:8px 0 0;font-size:42px;letter-spacing:-.045em;color:#17191d}
.career-public .candidate-portal-head p{margin:10px 0 0;color:#737b87;line-height:1.65}
.career-public .candidate-portal-actions{display:flex;gap:9px;flex-wrap:wrap}
.career-public .candidate-portal-button{min-height:42px;border:1px solid #dfe2e7;background:#fff;color:#22262d;padding:0 15px;font-weight:800;cursor:pointer}
.career-public .candidate-portal-button.primary{background:var(--career-red);border-color:var(--career-red);color:#fff}
.career-public .candidate-summary-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:20px}
.career-public .candidate-summary-card{background:#fff;border:1px solid #e3e5e8;padding:22px 24px;min-height:130px}
.career-public .candidate-summary-card span{display:block;color:#747b87;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.08em}
.career-public .candidate-summary-card strong{display:block;margin-top:10px;font-size:28px;letter-spacing:-.035em;color:#181b20}
.career-public .candidate-portal-panel{background:#fff;border:1px solid #e3e5e8;padding:26px}
.career-public .candidate-portal-panel-head{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:18px}
.career-public .candidate-portal-panel-head h2{margin:0;font-size:22px;letter-spacing:-.025em}
.career-public .candidate-app-list{display:grid;gap:10px}
.career-public .candidate-app-item{border:1px solid #eceef1;background:#fff;padding:16px 18px;display:flex;align-items:center;justify-content:space-between;gap:18px}
.career-public .candidate-app-item h3{margin:0 0 6px;font-size:16px}.career-public .candidate-app-item p{margin:0;color:#737b87;font-size:12px}
.career-public .candidate-app-side{text-align:right;display:grid;gap:7px;justify-items:end}
.career-public .candidate-status{display:inline-flex;padding:5px 9px;background:#eef8f2;color:#18794e;font-size:11px;font-weight:850}.career-public .candidate-status.withdrawn{background:#fff5df;color:#8a6500}.career-public .candidate-status.rejected{background:#fff0ef;color:#ba2d25}
.career-public .candidate-withdraw{border:0;background:transparent;color:#b42a22;font-size:11px;font-weight:800;cursor:pointer}
.career-public .candidate-empty{padding:38px 20px;border:1px dashed #d7dbe0;background:#fafafa;text-align:center;color:#737b87}
.career-public .candidate-security-card{max-width:620px;background:#fff;border:1px solid #e3e5e8;padding:28px}
.career-public .candidate-security-card h2{margin:0 0 7px}.career-public .candidate-security-card>p{margin:0 0 22px;color:#737b87}
@media(max-width:760px){.career-public .candidate-register-grid,.career-public .candidate-summary-grid{grid-template-columns:1fr}.career-public .candidate-portal-head{align-items:flex-start;flex-direction:column}.career-public .candidate-app-item{align-items:flex-start;flex-direction:column}.career-public .candidate-app-side{text-align:left;justify-items:start}}



/* =========================================================
   CANDIDATE AUTH — final responsive polish
   ========================================================= */
.career-public .candidate-signin-page,
.career-public .candidate-signin-page *{box-sizing:border-box}
.career-public .candidate-signin-page{
  min-height:calc(100vh - 82px);
  padding:32px 24px 46px;
  background:#f5f6f7;
  place-items:center;
  font-family:Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
}
.career-public .candidate-signin-layout{
  width:min(1260px,calc(100vw - 48px));
  min-height:620px;
  grid-template-columns:minmax(0,1.08fr) minmax(460px,.82fr);
  border-radius:20px;
  border:1px solid #e3e5e8;
  box-shadow:0 24px 64px rgba(17,19,24,.10);
  overflow:hidden;
}
.career-public .candidate-signin-layout.register-mode{
  grid-template-columns:minmax(0,1fr) minmax(520px,.88fr);
}
.career-public .candidate-signin-visual{
  min-width:0;
  min-height:620px;
  padding:48px 56px;
}
.career-public .candidate-signin-visual h1{
  font-family:Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
  font-size:clamp(44px,4.5vw,68px);
  font-weight:850;
  line-height:1.01;
  letter-spacing:-.055em;
}
.career-public .candidate-signin-panel{
  min-width:0;
  width:100%;
  padding:38px 44px 42px;
  justify-content:center;
  overflow:hidden;
}
.career-public .register-mode .candidate-signin-panel{
  padding-top:30px;
  padding-bottom:30px;
}
.career-public .candidate-signin-back{margin-bottom:24px;font-size:13px}
.career-public .candidate-auth-tabs{
  width:100%;
  grid-template-columns:minmax(0,1fr) minmax(0,1fr);
  gap:4px;
  margin:0 0 24px;
  padding:4px;
  border-radius:12px;
}
.career-public .candidate-auth-tab{width:100%;height:42px;border-radius:9px;font-size:13px}
.career-public .candidate-signin-panel h2{
  font-family:Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
  font-size:32px;
  font-weight:850;
  line-height:1.12;
  letter-spacing:-.04em;
}
.career-public .candidate-signin-panel>p{margin:8px 0 20px;font-size:13px}
.career-public .candidate-signin-target{margin-bottom:18px;border-radius:0 9px 9px 0}
.career-public .candidate-signin-form{width:100%;min-width:0;gap:13px}
.career-public .candidate-register-grid{
  width:100%;
  min-width:0;
  grid-template-columns:minmax(0,1fr) minmax(0,1fr);
  column-gap:12px;
  row-gap:0;
}
.career-public .candidate-register-grid>*{min-width:0}
.career-public .candidate-signin-field{
  width:100%;
  min-width:0;
  gap:7px;
  margin:0;
}
.career-public .candidate-signin-field>span{font-size:12px;line-height:1.25}
.career-public .candidate-signin-input{
  width:100%;
  min-width:0;
  height:50px;
  padding:0 14px;
  border-radius:11px;
}
.career-public .candidate-signin-input input{
  width:100%;
  min-width:0;
  height:48px;
  padding:0;
  margin:0;
  border:0;
  box-shadow:none;
  font-size:14px;
}
.career-public .candidate-terms{
  width:100%;
  min-width:0;
  display:grid!important;
  grid-template-columns:18px minmax(0,1fr)!important;
  align-items:start!important;
  gap:9px!important;
  margin:2px 0 0!important;
  color:#4f5661!important;
  font-size:12px!important;
  line-height:1.5!important;
  font-weight:600!important;
}
.career-public .candidate-terms input{width:16px!important;height:16px!important;margin:1px 0 0!important}
.career-public .candidate-terms span{min-width:0!important;white-space:normal!important;overflow-wrap:anywhere!important}
.career-public .candidate-signin-submit{
  width:100%;
  min-width:0;
  height:50px;
  margin-top:2px;
  border-radius:11px;
  box-shadow:0 9px 20px rgba(229,43,31,.16);
}
.career-public .candidate-auth-switch{margin-top:2px;line-height:1.5}
.career-public .candidate-signin-demo{margin-top:14px;border-radius:11px}
@media(max-width:1100px){
  .career-public .candidate-signin-layout,
  .career-public .candidate-signin-layout.register-mode{grid-template-columns:minmax(0,.9fr) minmax(480px,1.1fr)}
  .career-public .candidate-signin-visual{padding:42px;min-height:600px}
  .career-public .candidate-signin-visual h1{font-size:50px}
  .career-public .candidate-signin-panel{padding:34px 36px 38px}
}
@media(max-width:860px){
  .career-public .candidate-signin-page{padding:20px 16px 36px}
  .career-public .candidate-signin-layout,
  .career-public .candidate-signin-layout.register-mode{width:min(680px,100%);grid-template-columns:1fr;min-height:auto;border-radius:18px}
  .career-public .candidate-signin-visual{min-height:250px;padding:30px 32px}
  .career-public .candidate-signin-visual h1{font-size:42px;max-width:560px}
  .career-public .candidate-signin-visual p{font-size:14px;margin-top:14px}
  .career-public .candidate-signin-panel,
  .career-public .register-mode .candidate-signin-panel{padding:32px 30px 36px}
}
@media(max-width:560px){
  .career-public .candidate-signin-page{padding:0 0 24px}
  .career-public .candidate-signin-layout,
  .career-public .candidate-signin-layout.register-mode{width:100%;border-radius:0;border-left:0;border-right:0;box-shadow:none}
  .career-public .candidate-signin-visual{min-height:210px;padding:24px 20px}
  .career-public .candidate-signin-visual h1{font-size:34px}
  .career-public .candidate-signin-panel,
  .career-public .register-mode .candidate-signin-panel{padding:26px 20px 32px}
  .career-public .candidate-register-grid{grid-template-columns:1fr}
  .career-public .candidate-register-grid .full{grid-column:auto}
  .career-public .candidate-signin-panel h2{font-size:28px}
}

@media(prefers-reduced-motion:reduce){.career-public *{scroll-behavior:auto!important;transition:none!important;animation:none!important}}


/* =========================================================
   FINAL CAREER LANDING POLISH
   ========================================================= */
html,body,#root{margin:0!important;padding:0!important;min-height:100%!important}
body{overflow-x:hidden!important;background:#fff!important}
.candidate-site.career-public,.candidate-site.career-public *{box-sizing:border-box!important}
.candidate-site.career-public{font-family:Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif!important;background:#fff!important}
.career-public button,.career-public input,.career-public textarea,.career-public select{font:inherit!important}
.career-public .career-header{
  height:78px!important;background:rgba(255,255,255,.97)!important;border-bottom:1px solid #eceef1!important;
  box-shadow:0 1px 0 rgba(17,24,39,.02)!important;backdrop-filter:blur(16px)!important;-webkit-backdrop-filter:blur(16px)!important;
}
.career-public .career-header-inner{
  width:min(1380px,calc(100% - 48px))!important;height:78px!important;margin:0 auto!important;padding:0!important;
  grid-template-columns:190px minmax(420px,1fr) 285px!important;gap:24px!important;
}
.career-public .career-logo-left img{width:154px!important;height:42px!important;object-fit:contain!important;object-position:left center!important}
.career-public .career-logo-right{gap:14px!important;justify-content:flex-end!important}
.career-public .career-logo-right>img{width:126px!important;height:40px!important;object-fit:contain!important;object-position:right center!important}
.career-public .career-nav{height:78px!important;gap:34px!important;align-items:stretch!important}
.career-public .career-nav button{height:78px!important;padding:0 2px!important;color:#353a41!important;font-size:14px!important;font-weight:750!important;letter-spacing:-.005em!important}
.career-public .career-nav button.active,.career-public .career-nav button:hover{color:#d9271c!important}
.career-public .career-nav button.active:after{bottom:0!important;height:3px!important;border-radius:3px 3px 0 0!important;background:#d9271c!important}
.career-public .candidate-login-button{
  height:40px!important;min-width:94px!important;padding:0 15px!important;border:1px solid #dfe2e7!important;border-radius:999px!important;
  background:#fff!important;color:#282d33!important;font-size:13px!important;font-weight:800!important;box-shadow:none!important;
}
.career-public .candidate-login-button:hover{border-color:#e7aaa5!important;background:#fff7f6!important;color:#d9271c!important;transform:none!important}
.career-public .career-home{background:#fff!important}
.career-public .career-home-hero{
  width:min(1440px,100%)!important;min-height:590px!important;margin:0 auto!important;
  grid-template-columns:minmax(430px,.9fr) minmax(560px,1.1fr)!important;background:#111318!important;
}
.career-public .career-home-copy{min-width:0!important;padding:76px clamp(44px,5vw,78px)!important;background:linear-gradient(135deg,#111318 0%,#171a20 100%)!important}
.career-public .career-home-copy:before{display:none!important}
.career-public .career-eyebrow{margin:0 0 20px!important;padding:0!important;border:0!important;background:transparent!important;color:#ff6258!important;font-size:11px!important;font-weight:900!important;letter-spacing:.16em!important}
.career-public .career-eyebrow i{width:7px!important;height:7px!important;background:#f03a2f!important;box-shadow:none!important}
.career-public .career-home-copy h1{
  max-width:650px!important;margin:0!important;color:#fff!important;font-family:Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif!important;
  font-size:clamp(48px,4.5vw,70px)!important;font-weight:850!important;line-height:1.01!important;letter-spacing:-.055em!important;
}
.career-public .career-home-copy h1 span{color:#f04438!important}
.career-public .career-home-copy>p{max-width:610px!important;margin:24px 0 0!important;color:rgba(255,255,255,.70)!important;font-size:17px!important;line-height:1.7!important}
.career-public .career-hero-actions{margin-top:32px!important;gap:12px!important}
.career-public .career-cta,.career-public .career-text-button{height:48px!important;min-height:48px!important;border-radius:10px!important;padding:0 20px!important;font-size:13px!important;font-weight:850!important;box-shadow:none!important}
.career-public .career-cta{background:#d9271c!important}.career-public .career-cta:hover{background:#c32017!important;transform:translateY(-1px)!important}
.career-public .career-text-button{border:1px solid rgba(255,255,255,.24)!important;background:transparent!important;color:#fff!important}
.career-public .career-home-visual{
  min-height:590px!important;background-position:center 45%!important;
  box-shadow:inset 16px 0 30px rgba(17,19,24,.12)!important;
}
.career-public .career-floating-card{
  left:28px!important;bottom:28px!important;width:min(390px,calc(100% - 56px))!important;padding:18px 20px!important;
  border:1px solid rgba(255,255,255,.15)!important;border-radius:14px!important;background:rgba(17,19,24,.80)!important;
  backdrop-filter:blur(10px)!important;-webkit-backdrop-filter:blur(10px)!important;box-shadow:0 16px 38px rgba(0,0,0,.18)!important;
}
.career-public .career-floating-card strong{font-size:16px!important}.career-public .career-floating-card span{font-size:12px!important;line-height:1.55!important}
.career-public .career-trustbar{background:#fff!important;border:0!important}
.career-public .career-trustbar-inner{
  width:min(1320px,calc(100% - 48px))!important;padding:24px 0!important;border-bottom:1px solid #eceef1!important;
  grid-template-columns:repeat(4,1fr)!important;
}
.career-public .career-trust-item{padding:4px 24px!important;border:0!important;min-height:64px!important}
.career-public .career-trust-item:first-child{padding-left:0!important}.career-public .career-trust-item:last-child{padding-right:0!important}
.career-public .career-trust-item:not(:last-child):after{display:block!important;background:#eceef1!important}
.career-public .career-trust-icon{width:42px!important;height:42px!important;border-radius:12px!important;background:#fff1ef!important;color:#d9271c!important}
.career-public .career-trust-item strong{font-size:13px!important}.career-public .career-trust-item small{font-size:11px!important;color:#808690!important}
.career-public .career-section{padding:88px 24px!important}
.career-public .career-container{width:min(1260px,100%)!important}
.career-public .career-section-head{margin-bottom:34px!important;align-items:end!important}
.career-public .career-kicker{margin-bottom:10px!important;color:#d9271c!important;font-size:11px!important;font-weight:900!important;letter-spacing:.15em!important}
.career-public .career-section-head h2,.career-public .career-life-copy h2,.career-public .career-ready-copy h2{font-family:Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif!important;font-weight:850!important}
.career-public .career-section-head h2{font-size:clamp(34px,3.5vw,48px)!important}
.career-public .career-section-head p{max-width:500px!important;font-size:14px!important;line-height:1.7!important}
.career-public .career-special-grid{gap:14px!important;border:0!important;grid-template-columns:repeat(4,1fr)!important}
.career-public .career-special-card{
  min-height:270px!important;padding:24px!important;border:1px solid #e6e8ec!important;border-radius:16px!important;background:#fff!important;
  box-shadow:0 8px 22px rgba(17,24,39,.035)!important;
}
.career-public .career-special-card:not(:last-child){border-right:1px solid #e6e8ec!important}
.career-public .career-special-card:hover{transform:translateY(-3px)!important;background:#fff!important;border-color:#ecc0bc!important;box-shadow:0 16px 34px rgba(17,24,39,.07)!important}
.career-public .career-special-icon{width:48px!important;height:48px!important;border-radius:12px!important;background:#fff1ef!important;color:#d9271c!important}
.career-public .career-special-card h3{margin:28px 0 9px!important;font-size:19px!important}.career-public .career-special-card p{font-size:13px!important;line-height:1.65!important}
.career-public .career-special-card em{font-size:11px!important;margin-top:16px!important}
.career-public .career-life-band{padding:88px 24px!important;background:#121419!important}
.career-public .career-life-layout{width:min(1260px,100%)!important;gap:54px!important}
.career-public .career-life-photo{border-radius:14px!important}.career-public .career-life-copy h2{font-size:clamp(36px,3.8vw,52px)!important}.career-public .career-life-copy>p{font-size:14px!important;line-height:1.75!important}
.career-public .career-ready{padding:72px 24px!important;background:#f6f7f8!important}
.career-public .career-ready-panel{width:min(1260px,100%)!important;padding:48px 54px!important;border-radius:18px!important;background:linear-gradient(135deg,#c92017,#e33328)!important}
.career-public .career-ready-copy h2{font-size:clamp(34px,3.6vw,50px)!important}.career-public .career-ready .career-cta{background:#fff!important;color:#c92017!important}
.career-public .career-home-faq{padding:82px 24px!important}.career-public .career-home-faq-inner{width:min(1080px,100%)!important}
.career-public .career-home-faq-head{gap:42px!important}.career-public .career-home-faq-head h2{font-family:Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif!important;font-weight:850!important}
.career-public .career-footer{padding:50px 24px 24px!important}.career-public .career-footer-inner,.career-public .career-footer-bottom{width:min(1260px,100%)!important}
@media(max-width:1180px){
  .career-public .career-header-inner{width:calc(100% - 36px)!important;grid-template-columns:170px 1fr 240px!important;gap:18px!important}
  .career-public .career-nav{gap:22px!important}.career-public .career-home-hero{grid-template-columns:1fr 1fr!important}
  .career-public .career-special-grid{grid-template-columns:repeat(2,1fr)!important}.career-public .career-special-card:not(:last-child){border-right:1px solid #e6e8ec!important}
}
@media(max-width:860px){
  .career-public .career-header{height:72px!important}.career-public .career-header-inner{height:72px!important;width:calc(100% - 28px)!important;grid-template-columns:1fr auto!important}
  .career-public .career-logo-left img{width:136px!important;height:38px!important}.career-public .career-logo-right>img{display:none!important}
  .career-public .career-nav{top:64px!important;height:auto!important}.career-public .career-nav button{height:44px!important}
  .career-public .career-home-hero{grid-template-columns:1fr!important;min-height:0!important}.career-public .career-home-copy{padding:58px 24px 50px!important}.career-public .career-home-visual{min-height:390px!important}
  .career-public .career-trustbar-inner{width:calc(100% - 28px)!important;grid-template-columns:repeat(2,1fr)!important}.career-public .career-trust-item{padding:10px 14px!important}
  .career-public .career-section{padding:66px 20px!important}.career-public .career-section-head{align-items:flex-start!important}
  .career-public .career-special-grid{grid-template-columns:repeat(2,1fr)!important}.career-public .career-life-band{padding:66px 20px!important}.career-public .career-ready{padding:58px 20px!important}
}
@media(max-width:620px){
  .career-public .career-home-copy h1{font-size:42px!important}.career-public .career-home-copy>p{font-size:15px!important}.career-public .career-hero-actions{flex-direction:column!important}
  .career-public .career-trustbar-inner{grid-template-columns:1fr!important}.career-public .career-trust-item{border-bottom:1px solid #eceef1!important}.career-public .career-trust-item:last-child{border-bottom:0!important}
  .career-public .career-special-grid{grid-template-columns:1fr!important}.career-public .career-special-card:not(:last-child){border-right:1px solid #e6e8ec!important}
  .career-public .career-ready-panel{padding:34px 24px!important;border-radius:14px!important}
}

/* =========================================================
   CANDIDATE PROFILE — premium portal inspired layout
   ========================================================= */
.career-public .candidate-portal-page.profile-redesign{
  padding:34px 28px 84px;
  background:#f5f7f8;
  color:#172026;
}
.career-public .candidate-portal-page.profile-redesign .candidate-portal-wrap{
  width:min(1240px,100%);
}
.career-public .candidate-profile-hero{
  background:#fff;
  border:1px solid #dfe4e8;
  border-radius:18px;
  box-shadow:0 8px 26px rgba(18,29,38,.035);
  padding:26px 28px 0;
  overflow:hidden;
}
.career-public .candidate-profile-main{
  display:grid;
  grid-template-columns:auto minmax(0,1fr) auto;
  gap:20px;
  align-items:center;
  padding-bottom:24px;
}
.career-public .candidate-profile-avatar{
  width:76px;height:76px;border-radius:16px;
  display:grid;place-items:center;
  background:linear-gradient(145deg,#fff1ef,#f8dad6);
  border:1px solid #f0cbc7;
  color:#c9281e;
  font-size:27px;font-weight:900;letter-spacing:-.04em;
  flex:0 0 auto;
}
.career-public .candidate-profile-identity{min-width:0}
.career-public .candidate-profile-name-row{
  display:flex;align-items:center;gap:10px;flex-wrap:wrap;
}
.career-public .candidate-profile-name-row h1{
  margin:0;
  font-size:clamp(24px,2.4vw,32px);
  line-height:1.15;
  letter-spacing:-.035em;
  color:#182028;
}
.career-public .candidate-profile-name-row .candidate-pronoun{
  color:#89919b;font-size:15px;font-weight:600;
}
.career-public .candidate-profile-headline{
  margin:8px 0 0;color:#626b76;font-size:14px;line-height:1.55;
}
.career-public .candidate-profile-actions{
  display:flex;align-items:center;justify-content:flex-end;gap:12px;flex-wrap:wrap;
}
.career-public .candidate-availability{
  display:inline-flex;align-items:center;gap:9px;
  min-height:40px;padding:0 12px;
  color:#59636d;font-size:13px;font-weight:700;
  white-space:nowrap;
}
.career-public .candidate-availability i{
  width:8px;height:8px;border-radius:50%;background:#42a5a8;
  box-shadow:0 0 0 4px rgba(66,165,168,.09);
}
.career-public .candidate-profile-edit{
  min-height:40px;padding:0 15px;
  border:1px solid #dfaca7;border-radius:8px;
  background:#fff;color:#c72a20;font-size:13px;font-weight:800;
  display:inline-flex;align-items:center;gap:8px;cursor:pointer;
  transition:.18s ease;
}
.career-public .candidate-profile-edit:hover{
  background:#fff5f3;border-color:#d87971;transform:translateY(-1px);
}
.career-public .candidate-contact-row{
  border-top:1px solid #e7eaed;
  min-height:66px;
  display:grid;
  grid-template-columns:repeat(4,minmax(0,1fr));
  align-items:center;
}
.career-public .candidate-contact-item{
  min-width:0;
  display:flex;align-items:center;gap:9px;
  padding:15px 16px 15px 0;
  color:#68727d;font-size:13px;
}
.career-public .candidate-contact-item svg{color:#278d92;flex:0 0 auto}
.career-public .candidate-contact-item span,
.career-public .candidate-contact-item a{
  min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
  color:inherit;text-decoration:none;
}
.career-public .candidate-contact-item a:hover{color:#c9281e}
.career-public .candidate-profile-tabs-card{
  margin-top:22px;background:#fff;border:1px solid #dfe4e8;border-radius:18px;
  box-shadow:0 8px 26px rgba(18,29,38,.025);overflow:hidden;
}
.career-public .candidate-profile-tabs{
  min-height:58px;padding:0 22px;
  display:flex;align-items:flex-end;gap:8px;
  border-bottom:1px solid #e3e7ea;
  overflow-x:auto;scrollbar-width:none;
}
.career-public .candidate-profile-tabs::-webkit-scrollbar{display:none}
.career-public .candidate-profile-tab{
  min-height:58px;padding:0 15px;border:0;background:transparent;
  color:#707984;font-size:13px;font-weight:720;white-space:nowrap;
  position:relative;cursor:pointer;
}
.career-public .candidate-profile-tab:hover{color:#c9281e}
.career-public .candidate-profile-tab.active{color:#192128;font-weight:850}
.career-public .candidate-profile-tab.active:after{
  content:'';position:absolute;left:10px;right:10px;bottom:-1px;height:2px;
  background:#d9271c;border-radius:999px;
}
.career-public .candidate-profile-content{padding:26px}
.career-public .candidate-profile-section{
  border-top:1px solid #edf0f2;
  padding:26px 0;
  scroll-margin-top:100px;
}
.career-public .candidate-profile-section:first-child{border-top:0;padding-top:0}
.career-public .candidate-profile-section:last-child{padding-bottom:2px}
.career-public .candidate-section-heading{
  min-height:46px;
  display:flex;align-items:center;justify-content:space-between;gap:16px;
  padding:0 16px;margin-bottom:20px;
  background:#f8f9fa;border-radius:10px;
}
.career-public .candidate-section-heading h2{
  margin:0;font-size:17px;letter-spacing:-.02em;color:#182028;
}
.career-public .candidate-section-action{
  border:0;background:transparent;color:#278d92;font-size:12px;font-weight:850;
  display:inline-flex;align-items:center;gap:6px;cursor:pointer;white-space:nowrap;
}
.career-public .candidate-section-action:hover{color:#c9281e}
.career-public .candidate-about-copy{
  margin:0;padding:4px 2px 0;
  color:#626d78;font-size:14px;line-height:1.8;
}
.career-public .candidate-timeline{display:grid;gap:0}
.career-public .candidate-timeline-item{
  display:grid;grid-template-columns:22px 46px minmax(0,1fr) auto;
  gap:12px;position:relative;padding:5px 0 25px;
}
.career-public .candidate-timeline-item:last-child{padding-bottom:0}
.career-public .candidate-timeline-marker{
  position:relative;display:flex;justify-content:center;padding-top:9px;
}
.career-public .candidate-timeline-marker:before{
  content:'';width:10px;height:10px;border-radius:50%;
  border:2px solid #53aeb0;background:#fff;z-index:2;
}
.career-public .candidate-timeline-item:not(:last-child) .candidate-timeline-marker:after{
  content:'';position:absolute;top:20px;bottom:-9px;width:1px;background:#dfe5e8;
}
.career-public .candidate-timeline-icon{
  width:38px;height:38px;border-radius:8px;
  display:grid;place-items:center;background:#e9f7f7;color:#278d92;
}
.career-public .candidate-timeline-body{min-width:0;padding-top:1px}
.career-public .candidate-timeline-title{
  display:flex;align-items:center;gap:8px;flex-wrap:wrap;
}
.career-public .candidate-timeline-title h3{
  margin:0;font-size:15px;color:#182028;letter-spacing:-.01em;
}
.career-public .candidate-timeline-title button{
  border:0;background:transparent;color:#329a9e;padding:0;cursor:pointer;display:grid;place-items:center;
}
.career-public .candidate-timeline-meta{
  margin:5px 0 0;color:#707984;font-size:12px;line-height:1.55;
}
.career-public .candidate-timeline-description{
  margin:8px 0 0;color:#66717d;font-size:13px;line-height:1.65;
}
.career-public .candidate-timeline-period{
  padding-top:2px;color:#9299a2;font-size:11px;white-space:nowrap;text-align:right;
}
.career-public .candidate-profile-empty{
  border:1px dashed #d8dde1;background:#fafbfb;border-radius:10px;
  padding:22px;color:#7a838d;font-size:13px;text-align:center;line-height:1.6;
}
.career-public .candidate-info-grid{
  display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;
}
.career-public .candidate-info-box{
  min-width:0;border:1px solid #e6eaed;border-radius:10px;padding:15px 16px;background:#fff;
}
.career-public .candidate-info-box>span{
  display:block;margin-bottom:7px;color:#9299a2;font-size:10px;font-weight:850;
  letter-spacing:.08em;text-transform:uppercase;
}
.career-public .candidate-info-box>strong{
  display:block;color:#252d35;font-size:13px;line-height:1.55;overflow-wrap:anywhere;
}
.career-public .candidate-skill-list{
  display:flex;flex-wrap:wrap;gap:7px;margin-top:8px;
}
.career-public .candidate-skill{
  display:inline-flex;align-items:center;min-height:28px;padding:0 9px;
  border-radius:999px;background:#f1f4f5;color:#59636d;font-size:11px;font-weight:750;
}
.career-public .candidate-portfolio-links{display:grid;gap:8px;margin-top:10px}
.career-public .candidate-portfolio-link{
  display:flex;align-items:center;justify-content:space-between;gap:10px;
  color:#278d92;text-decoration:none;font-size:12px;font-weight:800;
}
.career-public .candidate-portal-applications{
  margin-top:22px;background:#fff;border:1px solid #dfe4e8;border-radius:18px;
  padding:24px 26px;box-shadow:0 8px 26px rgba(18,29,38,.025);
}
.career-public .candidate-portal-applications .candidate-portal-panel-head{margin-bottom:16px}
.career-public .candidate-profile-loading{
  min-height:280px;display:grid;place-items:center;background:#fff;border:1px solid #dfe4e8;border-radius:18px;
  color:#7a838d;
}
@media(max-width:900px){
  .career-public .candidate-profile-main{grid-template-columns:auto minmax(0,1fr)}
  .career-public .candidate-profile-actions{grid-column:1/-1;justify-content:flex-start;padding-left:96px}
  .career-public .candidate-contact-row{grid-template-columns:repeat(2,minmax(0,1fr))}
  .career-public .candidate-info-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
}
@media(max-width:640px){
  .career-public .candidate-portal-page.profile-redesign{padding:16px 12px 52px}
  .career-public .candidate-profile-hero{padding:20px 18px 0;border-radius:14px}
  .career-public .candidate-profile-main{grid-template-columns:58px minmax(0,1fr);gap:13px}
  .career-public .candidate-profile-avatar{width:58px;height:58px;border-radius:12px;font-size:21px}
  .career-public .candidate-profile-name-row h1{font-size:21px}
  .career-public .candidate-profile-headline{font-size:12px}
  .career-public .candidate-profile-actions{padding-left:0;gap:7px}
  .career-public .candidate-availability{padding-left:0;font-size:11px}
  .career-public .candidate-profile-edit{min-height:36px;font-size:11px}
  .career-public .candidate-contact-row{grid-template-columns:1fr}
  .career-public .candidate-contact-item{padding:10px 0}
  .career-public .candidate-profile-tabs-card{margin-top:14px;border-radius:14px}
  .career-public .candidate-profile-tabs{padding:0 10px}
  .career-public .candidate-profile-tab{padding:0 10px;font-size:11px}
  .career-public .candidate-profile-content{padding:18px}
  .career-public .candidate-section-heading{padding:0 12px}
  .career-public .candidate-timeline-item{grid-template-columns:18px 38px minmax(0,1fr)}
  .career-public .candidate-timeline-icon{width:34px;height:34px}
  .career-public .candidate-timeline-period{grid-column:3;justify-self:start;text-align:left;padding-top:0;margin-top:-15px}
  .career-public .candidate-info-grid{grid-template-columns:1fr}
  .career-public .candidate-portal-applications{margin-top:14px;padding:20px 18px;border-radius:14px}
}

`;

function CandidatePortal({ onToast }) {
  const formRef = useRef(null);
  const [publicPage, setPublicPage] = useState('home');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState(0);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const [cv, setCv] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [portfolioFiles, setPortfolioFiles] = useState(null);
  const [candidateSession, setCandidateSession] = useState(() => {
    try {
      const stored = sessionStorage.getItem(CANDIDATE_SESSION_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [candidateAuth, setCandidateAuth] = useState(null);
  const [candidateAuthLoading, setCandidateAuthLoading] = useState(false);
  const [candidateAccountOpen, setCandidateAccountOpen] = useState(false);
  const [candidateLoginForm, setCandidateLoginForm] = useState({
    email: '',
    password: '',
  });
  const [candidateAuthMode, setCandidateAuthMode] = useState('login');
  const [candidateRegisterForm, setCandidateRegisterForm] = useState({
    fullName: '', email: '', phone: '', password: '', termsAccepted: false,
  });
  const [candidateProfile, setCandidateProfile] = useState(null);
  const [candidateApplications, setCandidateApplications] = useState([]);
  const [candidatePortalLoading, setCandidatePortalLoading] = useState(false);
  const [candidatePasswordForm, setCandidatePasswordForm] = useState({
    currentPassword: '', newPassword: '', confirmPassword: '',
  });
  const [publicJobs, setPublicJobs] = useState([]);
  const [publicJobsLoading, setPublicJobsLoading] = useState(false);
  const [publicJobsError, setPublicJobsError] = useState('');
  const [publicJobsLoaded, setPublicJobsLoaded] = useState(false);
  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', birthDate: '', identityNumber: '',
    languanges: '', religion: '',
    citizenIdAddress: '', residentialAddress: '', sameAsCitizenIdAddress: false,
    currentSalary: '', expectedSalary: '', source: 'Website', termsAccepted: false,
    relatedIndustries: '', relatedJobPositions: '', tools: '',
    jobInterests: '', preferredLocations: '',
    educations: [emptyEducation()], workExperiences: [emptyExperience()], portfolioLinks: [emptyPortfolio()],
  });

  const steps = ['Upload CV', 'Informasi Pribadi', 'Pendidikan', 'Pengalaman Kerja', 'Kompensasi', 'Portofolio', 'Additional Info'];

  const setValue = (name, value) => setForm((current) => ({ ...current, [name]: value }));
  const updateArray = (key, index, name, value) => setForm((current) => ({
    ...current,
    [key]: current[key].map((item, idx) => idx === index ? { ...item, [name]: value } : item),
  }));
  const addArray = (key, factory) => setForm((current) => ({ ...current, [key]: [...current[key], factory()] }));
  const removeArray = (key, index) => setForm((current) => ({ ...current, [key]: current[key].filter((_, idx) => idx !== index) }));

  const scrollToForm = () => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const goPublicPage = (page) => {
    setPublicPage(page);
    setMobileNavOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  function normalizePublicJobList(result) {
    if (Array.isArray(result)) return result;
    if (Array.isArray(result?.content)) return result.content;
    if (Array.isArray(result?.data)) return result.data;
    if (Array.isArray(result?.items)) return result.items;
    return [];
  }

  function isPublicJobOpen(job) {
    if (!job) return false;

    // Jika backend mengirim status, halaman publik hanya menampilkan PUBLISHED.
    if (job.status && String(job.status).toUpperCase() !== 'PUBLISHED') {
      return false;
    }

    // Deadline kosong berarti mengikuti status dari backend.
    if (!job.applicationDeadline) return true;

    const deadline = new Date(`${job.applicationDeadline}T23:59:59`);
    return Number.isNaN(deadline.getTime()) || deadline.getTime() >= Date.now();
  }

  async function loadPublicJobs(force = false) {
    if (publicJobsLoading) return;
    if (publicJobsLoaded && !force) return;

    setPublicJobsLoading(true);
    setPublicJobsError('');

    try {
      const params = new URLSearchParams({
        page: '0',
        size: '100',
        sort: 'updatedAt,desc',
      });

      // PUBLIC API YANG DIPAKAI HALAMAN OPEN POSITIONS.
      // Endpoint backend yang dibutuhkan:
      // GET /api/public/job-listings?page=0&size=100&sort=updatedAt,desc
      const result = await api(`/api/public/job-listings?${params}`);
      const jobs = normalizePublicJobList(result).filter(isPublicJobOpen);

      setPublicJobs(jobs);
      setPublicJobsLoaded(true);
    } catch (error) {
      console.error('LOAD PUBLIC JOB LISTINGS ERROR:', error);
      setPublicJobs([]);
      setPublicJobsError(
        error?.message || 'Job listing gagal dimuat dari API.'
      );
    } finally {
      setPublicJobsLoading(false);
    }
  }

  useEffect(() => {
    if (publicPage === 'open') {
      loadPublicJobs();
    }
  }, [publicPage]);

  function persistCandidateSession(result) {
    const session = {
      id: result.candidateId,
      fullName: result.fullName || '',
      email: result.email || '',
      accessToken: result.accessToken,
      tokenType: result.tokenType || 'Bearer',
      expiresIn: result.expiresIn || 0,
    };

    sessionStorage.setItem(CANDIDATE_SESSION_KEY, JSON.stringify(session));
    setCandidateSession(session);
    return session;
  }

  function profileToForm(profile) {
    if (!profile) return;
    setCandidateProfile(profile);
    setForm((current) => ({
      ...current,
      fullName: profile.fullName || '',
      email: profile.email || '',
      phone: profile.phone || '',
      birthDate: profile.birthDate || '',
      identityNumber: profile.identityNumber || '',
      languanges: profile.languanges || '',
      religion: profile.religion || '',
      citizenIdAddress: profile.citizenIdAddress || '',
      residentialAddress: profile.residentialAddress || '',
      sameAsCitizenIdAddress: Boolean(profile.sameAsCitizenIdAddress),
      currentSalary: profile.currentSalary ?? '',
      expectedSalary: profile.expectedSalary ?? '',
      source: profile.source || 'Talent Portal',
      termsAccepted: profile.termsAccepted !== false,
      relatedIndustries: (profile.relatedIndustries || []).join(', '),
      relatedJobPositions: (profile.relatedJobPositions || []).join(', '),
      tools: (profile.tools || []).join(', '),
      jobInterests: (profile.jobInterests || []).join(', '),
      preferredLocations: (profile.preferredLocations || []).join(', '),
      educations: (profile.educations?.length ? profile.educations : [emptyEducation()]).map((item) => ({
        type: item.type || 'FORMAL', level: item.level || '', institution: item.institution || '',
        major: item.major || '', startYear: item.startYear ?? '', endYear: item.endYear ?? '',
        ipk: item.ipk ?? '', description: item.description || '',
      })),
      workExperiences: (profile.workExperiences?.length ? profile.workExperiences : [emptyExperience()]).map((item) => ({
        companyName: item.companyName || '', position: item.position || '', startDate: item.startDate || '',
        endDate: item.endDate || '', currentJob: Boolean(item.currentJob), description: item.description || '',
      })),
      portfolioLinks: ((profile.portfolios || []).filter((item) => item.type === 'LINK').length
        ? (profile.portfolios || []).filter((item) => item.type === 'LINK')
        : [emptyPortfolio()]).map((item) => ({ title: item.title || 'Portfolio', url: item.url || '' })),
    }));
  }

  async function loadCandidateProfile() {
    const profile = await candidateApi('/api/talent/profile');
    profileToForm(profile);
    return profile;
  }

  async function loadCandidateApplications() {
    const result = await candidateApi('/api/talent/applications?page=0&size=100&sort=updatedAt,desc');
    const rows = Array.isArray(result?.content) ? result.content : [];
    setCandidateApplications(rows);
    return rows;
  }

  async function openCandidatePortal() {
    setCandidateAccountOpen(false);
    setPublicPage('account');
    setCandidatePortalLoading(true);
    try {
      await Promise.all([loadCandidateProfile(), loadCandidateApplications(), loadPublicJobs()]);
    } catch (error) {
      onToast({ type: 'error', message: error.message });
    } finally {
      setCandidatePortalLoading(false);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function openTalentPoolForm() {
    setPublicPage('apply');
    setMobileNavOpen(false);
    setCandidateAccountOpen(false);

    try {
      const profile = candidateProfile || await loadCandidateProfile();
      if (profile) profileToForm(profile);
    } catch (error) {
      onToast({ type: 'error', message: error.message });
    }

    requestAnimationFrame(() => {
      setTimeout(() => scrollToForm(), 0);
    });
  }

  async function applyCandidateToJob(job) {
    if (!job?.id) {
      onToast({ type: 'error', message: 'ID lowongan tidak ditemukan.' });
      return;
    }

    setCandidatePortalLoading(true);
    try {
      await candidateApi(`/api/talent/jobs/${job.id}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: 'Dilamar melalui Sarinah Career Portal' }),
      });
      onToast({ message: `Lamaran untuk ${job.title || 'posisi'} berhasil dikirim.` });
      await loadCandidateApplications();
      setPublicPage('account');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      onToast({ type: 'error', message: error.message });
    } finally {
      setCandidatePortalLoading(false);
    }
  }

  async function continueCandidateAction(action, payload = null) {
    if (action === 'talent-pool') {
      await openTalentPoolForm();
      return;
    }

    if (action === 'job') {
      await applyCandidateToJob(payload);
      return;
    }

    await openCandidatePortal();
  }

  function requireCandidateLogin(action = 'none', payload = null) {
    setCandidateAccountOpen(false);

    if (candidateSession?.accessToken) {      continueCandidateAction(action, payload);
      return;
    }

    setCandidateLoginForm({ email: '', password: '' });
    setCandidateRegisterForm({ fullName: '', email: '', phone: '', password: '', termsAccepted: false });
    setCandidateAuthMode('login');
    setCandidateAuth({ action, payload });
    setPublicPage('signin');
    setMobileNavOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const goToApply = () => {
    requireCandidateLogin('talent-pool');
  };

  const goToJobApply = (job) => {
    requireCandidateLogin('job', job);
  };

  async function submitCandidateLogin(event) {
    event.preventDefault();

    const email = candidateLoginForm.email.trim().toLowerCase();
    const password = candidateLoginForm.password;

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      onToast({ type: 'error', message: 'Masukkan email kandidat yang valid.' });
      return;
    }

    if (!password || password.length < 8) {
      onToast({ type: 'error', message: 'Password minimal 8 karakter.' });
      return;
    }

    setCandidateAuthLoading(true);

    try {
      const result = await api('/api/talent/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const session = persistCandidateSession(result);
      setForm((current) => ({ ...current, email: session.email, fullName: session.fullName || current.fullName }));

      const pending = candidateAuth;
      setCandidateAuth(null);
      setCandidateLoginForm({ email: '', password: '' });
      onToast({ message: 'Sign in berhasil.' });

      setTimeout(() => {
        continueCandidateAction(pending?.action || 'none', pending?.payload || null);
      }, 0);
    } catch (error) {
      onToast({ type: 'error', message: error.message });
    } finally {
      setCandidateAuthLoading(false);
    }
  }

  async function submitCandidateRegister(event) {
    event.preventDefault();
    const payload = {
      fullName: candidateRegisterForm.fullName.trim(),
      email: candidateRegisterForm.email.trim().toLowerCase(),
      phone: candidateRegisterForm.phone.trim(),
      password: candidateRegisterForm.password,
      termsAccepted: Boolean(candidateRegisterForm.termsAccepted),
    };

    if (!payload.fullName) {
      onToast({ type: 'error', message: 'Nama lengkap wajib diisi.' });
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(payload.email)) {
      onToast({ type: 'error', message: 'Email tidak valid.' });
      return;
    }
    if (payload.password.length < 8) {
      onToast({ type: 'error', message: 'Password minimal 8 karakter.' });
      return;
    }
    if (!payload.termsAccepted) {
      onToast({ type: 'error', message: 'Persetujuan penggunaan data wajib dicentang.' });
      return;
    }

    setCandidateAuthLoading(true);
    try {
      const result = await api('/api/talent/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const session = persistCandidateSession(result);
      setForm((current) => ({ ...current, fullName: session.fullName, email: session.email, phone: payload.phone, termsAccepted: true }));

      const pending = candidateAuth;
      setCandidateAuth(null);
      onToast({ message: 'Akun kandidat berhasil dibuat.' });
      setTimeout(() => {
        continueCandidateAction(pending?.action || 'none', pending?.payload || null);
      }, 0);
    } catch (error) {
      onToast({ type: 'error', message: error.message });
    } finally {
      setCandidateAuthLoading(false);
    }
  }

  async function withdrawCandidateApplication(application) {
    if (!application?.id) return;
    if (!window.confirm(`Tarik lamaran ${application.jobTitle || ''}?`)) return;
    try {
      await candidateApi(`/api/talent/applications/${application.id}/withdraw`, { method: 'PATCH' });
      onToast({ message: 'Lamaran berhasil ditarik.' });
      await loadCandidateApplications();
    } catch (error) {
      onToast({ type: 'error', message: error.message });
    }
  }

  async function submitCandidatePassword(event) {
    event.preventDefault();
    if (candidatePasswordForm.newPassword.length < 8) {
      onToast({ type: 'error', message: 'Password baru minimal 8 karakter.' });
      return;
    }
    if (candidatePasswordForm.newPassword !== candidatePasswordForm.confirmPassword) {
      onToast({ type: 'error', message: 'Konfirmasi password baru tidak sama.' });
      return;
    }

    setCandidateAuthLoading(true);
    try {
      await candidateApi('/api/talent/auth/change-password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: candidatePasswordForm.currentPassword,
          newPassword: candidatePasswordForm.newPassword,
        }),
      });
      setCandidatePasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      onToast({ message: 'Password berhasil diubah.' });
    } catch (error) {
      onToast({ type: 'error', message: error.message });
    } finally {
      setCandidateAuthLoading(false);
    }
  }

  function logoutCandidate() {
    sessionStorage.removeItem(CANDIDATE_SESSION_KEY);
    setCandidateSession(null);
    setCandidateProfile(null);
    setCandidateApplications([]);
    setCandidateAccountOpen(false);
    onToast({ message: 'Anda telah keluar dari akun kandidat.' });

    if (['apply', 'account', 'security'].includes(publicPage)) {
      goPublicPage('open');
    }
  }

  const lifeCards = [
    { title: 'Work–Life Harmony', description: 'Flexible arrangements and understanding leadership that prioritizes your well-being and personal life.', image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=82' },
    { title: 'Collaborative Spirit', description: "Ideas flow freely in our open environment where everyone contributes to each other's success.", image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=82' },
    { title: 'Team Bonding', description: 'Our team members share laughs and build genuine friendships that extend beyond work hours.', image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=82' },
    { title: 'Celebratory Culture', description: 'We celebrate every milestone together — from birthdays to project launches and personal achievements.', image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=82' },
    { title: 'Supportive Leaders', description: 'Senior team members actively guide and support newcomers, creating a nurturing learning environment.', image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=82' },
    { title: 'Diverse & Inclusive', description: 'A multicultural family where every voice is heard and every background is celebrated.', image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=82' },
  ];

  const faqItems = [
    ['Apa itu Sarinah Talent Pool?', 'Talent Pool adalah kumpulan profil kandidat yang dapat dipertimbangkan tim rekrutmen Sarinah ketika ada kebutuhan yang sesuai.'],
    ['Apakah saya harus melamar posisi tertentu?', 'Tidak. Anda tetap dapat bergabung ke Talent Pool meskipun saat ini belum ada posisi yang sesuai dengan profil Anda.'],
    ['Dokumen apa yang perlu saya siapkan?', 'Siapkan CV terbaru. Anda juga dapat melengkapi foto profil, pengalaman kerja, pendidikan, portofolio, dan informasi pendukung lainnya.'],
    ['Bagaimana proses setelah profil dikirim?', 'Profil akan tersimpan di Talent Pool. Tim rekrutmen dapat meninjau dan menghubungi kandidat apabila terdapat peluang yang relevan.'],
    ['Apakah bergabung ke Talent Pool menjamin saya diterima?', 'Tidak. Talent Pool membantu profil Anda ditemukan untuk peluang yang relevan, tetapi setiap proses rekrutmen tetap mengikuti kebutuhan dan tahapan seleksi perusahaan.'],
    ['Apakah data pribadi saya aman?', 'Data kandidat digunakan untuk keperluan rekrutmen dan pengelolaan Talent Pool sesuai proses perusahaan.'],
  ];

  function validateStep(index) {
    if (index === 0 && !cv && !candidateProfile?.cvOriginalName) {
      return 'CV wajib diunggah terlebih dahulu.';
    }

    if (
      index === 1 &&
      (!form.fullName.trim() || !form.email.trim() || !form.phone.trim())
    ) {
      return 'Nama, email, dan nomor telepon wajib diisi.';
    }

    // termsAccepted sengaja TIDAK divalidasi di sini.
    // Validasi checkbox hanya dilakukan ketika user benar-benar menekan Submit.
    return null;
  }

  function goNext() {
    const message = validateStep(step);
    if (message) return onToast({ type: 'error', message });
    setStep((value) => Math.min(value + 1, steps.length - 1));
  }

  function cleanArrayText(value) {
    return String(value || '').split(',').map((item) => item.trim()).filter(Boolean).slice(0, 3);
  }

  function buildPayload() {
    return {
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      birthDate: form.birthDate || null,
      identityNumber: form.identityNumber || null,
      languanges: form.languanges || null,
      religion: form.religion || null,
      citizenIdAddress: form.citizenIdAddress || null,
      residentialAddress: form.sameAsCitizenIdAddress ? form.citizenIdAddress : (form.residentialAddress || null),
      sameAsCitizenIdAddress: form.sameAsCitizenIdAddress,
      currentSalary: form.currentSalary === '' ? null : Number(form.currentSalary),
      expectedSalary: form.expectedSalary === '' ? null : Number(form.expectedSalary),
      source: form.source || 'Website',
      termsAccepted: form.termsAccepted,
      relatedIndustries: cleanArrayText(form.relatedIndustries),
      relatedJobPositions: cleanArrayText(form.relatedJobPositions),
      tools: cleanArrayText(form.tools),
      jobInterests: cleanArrayText(form.jobInterests),
      preferredLocations: cleanArrayText(form.preferredLocations),
      educations: form.educations
        .filter((item) => String(item.institution || '').trim())
        .map((item) => ({
          ...item,
          institution: String(item.institution || '').trim(),
          level: String(item.level || '').trim() || null,
          major: String(item.major || '').trim() || null,
          startYear: item.startYear === '' ? null : Number(item.startYear),
          endYear: item.endYear === '' ? null : Number(item.endYear),
          ipk: item.ipk === '' ? null : Number(item.ipk),
          description: String(item.description || '').trim() || null,
        })),
      workExperiences: form.workExperiences.filter((item) => item.companyName && item.position && item.startDate).map((item) => ({
        ...item,
        startDate: item.startDate || null,
        endDate: item.currentJob ? null : (item.endDate || null),
      })),
      portfolioLinks: form.portfolioLinks.filter((item) => item.url),
    };
  }

  function handleFormKeyDown(event) {
    // Hindari browser melakukan implicit submit saat ENTER ditekan pada input.
    // ENTER pada textarea tetap diperbolehkan untuk membuat baris baru.
    if (event.key === 'Enter' && event.target.tagName !== 'TEXTAREA') {
      event.preventDefault();
    }
  }

  async function submit(event) {
    event.preventDefault();

    // Submit hanya boleh berjalan ketika sudah berada di step terakhir.
    if (step !== steps.length - 1) return;

    // Validasi semua step sebelum Additional Info.
    for (let i = 0; i < steps.length - 1; i += 1) {
      const message = validateStep(i);

      if (message) {
        setStep(i);
        onToast({ type: 'error', message });
        return;
      }
    }

    // Checkbox persetujuan divalidasi hanya saat benar-benar Submit.
    if (!form.termsAccepted) {
      onToast({
        type: 'error',
        message: 'Syarat dan ketentuan harus disetujui.',
      });
      return;
    }

    setLoading(true);

    try {
      const body = new FormData();
      const payload = buildPayload();

      body.append(
        'data',
        new Blob([JSON.stringify(payload)], { type: 'application/json' })
      );
      if (cv) {
        body.append('cv', cv);
      }

      if (profilePicture) {
        body.append('profilePicture', profilePicture);
      }

      Array.from(portfolioFiles || []).forEach((file) => {
        body.append('portfolioFiles', file);
      });

      const result = candidateSession?.accessToken
        ? await candidateApi('/api/talent/profile', { method: 'PUT', body })
        : await api('/api/public/talents', { method: 'POST', body });

      setSubmitted(result || { message: 'Profil berhasil diperbarui.' });
      if (candidateSession?.accessToken && result) {
        profileToForm(result);
      }
      onToast({
        message: result?.message || (candidateSession?.accessToken
          ? 'Profil Talent Pool berhasil diperbarui.'
          : 'Profil berhasil ditambahkan ke Talent Pool.'),
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('SUBMIT TALENT ERROR:', error);
      onToast({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="candidate-site career-public">
        <style>{CAREER_PUBLIC_CSS}</style>
        <main className="success-page">
          <div className="success-card">
            <span className="success-icon"><Icon name="check" size={34}/></span>
            <img className="career-success-logo" src={withAppBase('/images/sarinah.png')} alt="Sarinah"/>
            <h1>Profil berhasil disimpan</h1>
            <p>Data Talent Pool Anda sudah tersimpan. Profil ini dapat diperbarui kembali kapan saja melalui Portal Kandidat.</p>
            <button className="button primary" type="button" onClick={() => window.location.reload()}>Kembali ke Home</button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="candidate-site career-public">
      <style>{CAREER_PUBLIC_CSS}</style>

      <header className="career-header">
        <div className="career-header-inner">
          <div className="career-logo-left">
            <img src={withAppBase('/images/Danantara_Indonesia.png')} alt="Danantara Indonesia" />
          </div>

          <nav className={`career-nav ${mobileNavOpen ? 'open' : ''}`} aria-label="Navigasi karier">
            <button type="button" className={publicPage === 'home' ? 'active' : ''} onClick={() => goPublicPage('home')}>Home</button>
            <button type="button" className={publicPage === 'life' ? 'active' : ''} onClick={() => goPublicPage('life')}>Life at Sarinah</button>
            <button type="button" className={publicPage === 'open' || publicPage === 'apply' || publicPage === 'signin' ? 'active' : ''} onClick={() => goPublicPage('open')}>Open Positions</button>
            <button type="button" className={publicPage === 'faq' ? 'active' : ''} onClick={() => goPublicPage('faq')}>FAQ</button>
          </nav>

          <div className="career-logo-right">
            {candidateSession ? (
              <div className="candidate-account">
                <button
                  type="button"
                  className="candidate-account-button"
                  onClick={() => setCandidateAccountOpen((value) => !value)}
                  aria-expanded={candidateAccountOpen}
                  title={candidateSession.email}
                >
                  <span className="candidate-avatar">
                    {initials(candidateSession.fullName || candidateSession.email)}
                  </span>
                  <span className="candidate-account-copy">
                    <strong>{candidateSession.fullName || 'Kandidat'}</strong>
                    <small>{candidateSession.email}</small>
                  </span>
                </button>

                {candidateAccountOpen && (
                  <div className="candidate-account-menu">
                    <button type="button" onClick={openCandidatePortal}>
                      <Icon name="dashboard" size={16}/>
                      Portal Kandidat
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCandidateAccountOpen(false);
                        requireCandidateLogin('talent-pool');
                      }}
                    >
                      <Icon name="user" size={16}/>
                      Profil / Talent Pool
                    </button>
                    <button type="button" onClick={() => { setCandidateAccountOpen(false); setPublicPage('security'); }}>
                      <Icon name="lock" size={16}/>
                      Keamanan Akun
                    </button>
                    <button type="button" className="danger" onClick={logoutCandidate}>
                      <Icon name="logout" size={16}/>
                      Keluar
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                className="candidate-login-button"
                onClick={() => requireCandidateLogin('none')}
              >
                <Icon name="user" size={16}/>
                Masuk
              </button>
            )}

            <img src={withAppBase('/images/sarinah.png')} alt="Sarinah" />

            <button
              type="button"
              className="career-menu-button"
              aria-label="Buka menu"
              aria-expanded={mobileNavOpen}
              onClick={() => setMobileNavOpen((value) => !value)}
            >
              <Icon name={mobileNavOpen ? 'x' : 'menu'} size={21}/>
            </button>
          </div>
        </div>
      </header>

      {publicPage === 'home' && (
        <main className="career-home">
          <section className="career-home-hero">
            <div className="career-home-copy">
              <span className="career-eyebrow"><i/> Sarinah Career</span>
              <h1>Build a legacy through <span>creative retail.</span></h1>
              <p>Temukan ruang untuk bertumbuh, berkolaborasi, dan menciptakan pengalaman ritel Indonesia yang relevan untuk generasi berikutnya.</p>
              <div className="career-hero-actions">
                <button type="button" className="career-cta" onClick={() => goPublicPage('open')}>
                  Explore Opportunities <Icon name="chevronRight" size={18}/>
                </button>
                <button type="button" className="career-text-button" onClick={() => goPublicPage('life')}>
                  Discover Life at Sarinah <Icon name="chevronRight" size={17}/>
                </button>
              </div>
            </div>

            <div className="career-home-visual" aria-label="Kolaborasi tim Sarinah">
              <div className="career-floating-card">
                <strong>Grow with purpose.</strong>
                <span>Berkarya bersama talenta yang membawa produk lokal, budaya, dan pengalaman Indonesia lebih dekat kepada masyarakat.</span>
              </div>
            </div>
          </section>

          <section className="career-trustbar" aria-label="Keunggulan Talent Pool Sarinah">
            <div className="career-trustbar-inner">
              <div className="career-trust-item"><span className="career-trust-icon"><Icon name="users" size={21}/></span><div><strong>Talent Community</strong><small>Terhubung dengan peluang Sarinah.</small></div></div>
              <div className="career-trust-item"><span className="career-trust-icon"><Icon name="chart" size={21}/></span><div><strong>Growth Opportunity</strong><small>Ruang berkembang sesuai kompetensi.</small></div></div>
              <div className="career-trust-item"><span className="career-trust-icon"><Icon name="briefcase" size={21}/></span><div><strong>Meaningful Work</strong><small>Berikan dampak bagi retail Indonesia.</small></div></div>
              <div className="career-trust-item"><span className="career-trust-icon"><Icon name="lock" size={21}/></span><div><strong>Secure Information</strong><small>Data hanya untuk proses rekrutmen.</small></div></div>
            </div>
          </section>

          <section className="career-section">
            <div className="career-container">
              <div className="career-section-head">
                <div><span className="career-kicker">Why Sarinah</span><h2>More than a workplace.</h2></div>
                <p>Lingkungan kerja yang memberi ruang untuk belajar, berkolaborasi, dan berkontribusi pada perjalanan retail Indonesia.</p>
              </div>

              <div className="career-special-grid">
                <article className="career-special-card"><span className="career-special-icon"><Icon name="users" size={24}/></span><h3>Collaborative Culture</h3><p>Bangun ide bersama lintas fungsi dan tumbuh melalui kolaborasi yang terbuka.</p><em>Work together →</em></article>
                <article className="career-special-card"><span className="career-special-icon"><Icon name="chart" size={24}/></span><h3>Continuous Growth</h3><p>Kembangkan kapasitas melalui pengalaman nyata, feedback, dan tantangan baru.</p><em>Keep learning →</em></article>
                <article className="career-special-card"><span className="career-special-icon"><Icon name="briefcase" size={24}/></span><h3>Creative Retail Impact</h3><p>Berpartisipasi menghadirkan pengalaman retail yang dekat dengan budaya dan produk Indonesia.</p><em>Create impact →</em></article>
                <article className="career-special-card"><span className="career-special-icon"><Icon name="check" size={24}/></span><h3>Inclusive Environment</h3><p>Setiap perspektif dihargai untuk menciptakan ide dan pengalaman yang lebih baik.</p><em>Be yourself →</em></article>
              </div>
            </div>
          </section>

          <section className="career-life-band">
            <div className="career-life-layout">
              <div className="career-life-gallery" aria-hidden="true">
                <div className="career-life-photo large"/><div className="career-life-photo one"/><div className="career-life-photo two"/>
              </div>
              <div className="career-life-copy">
                <span className="career-kicker">Life at Sarinah</span>
                <h2>People, culture, and experiences that move together.</h2>
                <p>Di Sarinah, pekerjaan bukan hanya tentang target. Ini tentang bagaimana kita bertumbuh sebagai tim, berbagi pengalaman, dan menciptakan sesuatu yang berarti.</p>
                <div className="career-life-points">
                  <div className="career-life-point"><i>✓</i><div><strong>Collaborative Spirit</strong><small>Ide terbaik lahir dari percakapan dan kolaborasi.</small></div></div>
                  <div className="career-life-point"><i>✓</i><div><strong>Supportive Leaders</strong><small>Dukungan untuk belajar, mencoba, dan berkembang.</small></div></div>
                  <div className="career-life-point"><i>✓</i><div><strong>Celebratory Culture</strong><small>Merayakan perjalanan dan pencapaian bersama.</small></div></div>
                </div>
                <button type="button" className="career-cta" onClick={() => goPublicPage('life')}>Explore Life at Sarinah <Icon name="chevronRight" size={18}/></button>
              </div>
            </div>
          </section>

          <section className="career-home-faq">
            <div className="career-home-faq-inner">
              <div className="career-home-faq-head">
                <div>
                  <span className="career-kicker">FAQ</span>
                  <h2>Hal yang sering ditanyakan.</h2>
                </div>
                <p>Informasi singkat sebelum Anda bergabung ke Talent Pool Sarinah.</p>
              </div>
              <div className="career-home-faq-list">
                {faqItems.slice(0, 4).map(([question, answer], index) => (
                  <article className="career-home-faq-item" key={question}>
                    <button
                      type="button"
                      className="career-home-faq-question"
                      onClick={() => setFaqOpen(faqOpen === index ? -1 : index)}
                      aria-expanded={faqOpen === index}
                    >
                      <span>{question}</span>
                      <span aria-hidden="true">{faqOpen === index ? '−' : '+'}</span>
                    </button>
                    {faqOpen === index && <div className="career-home-faq-answer">{answer}</div>}
                  </article>
                ))}
              </div>
              <button type="button" className="career-faq-more" onClick={() => goPublicPage('faq')}>Lihat semua FAQ <Icon name="chevronRight" size={16}/></button>
            </div>
          </section>

          <section className="career-ready">
            <div className="career-ready-panel">
              <div className="career-ready-copy"><span className="career-kicker">Your Next Chapter</span><h2>Ready to create your next story with Sarinah?</h2><p>Lihat peluang yang tersedia atau bergabung ke Talent Pool untuk kesempatan di masa mendatang.</p></div>
              <button type="button" className="career-cta" onClick={() => goPublicPage('open')}>View Open Positions <Icon name="chevronRight" size={18}/></button>
            </div>
          </section>
        </main>
      )}

      {publicPage === 'life' && (
        <main className="life-page">
          <section className="life-page-hero">
            <div>
              <span className="career-eyebrow"><i/> Life at Sarinah</span>
              <h1>Inside Sarinah.</h1>
              <p>Temukan budaya kerja yang hidup, kolaboratif, dan memberi ruang bagi setiap orang untuk berkembang serta menciptakan dampak.</p>
            </div>
          </section>

          <section className="life-content">
            <div className="life-grid-wrap">
              <div className="career-section-head">
                <div><span className="career-kicker">Our Culture</span><h2>Where people grow together.</h2></div>
                <p>Momen keseharian, kolaborasi, dan kebersamaan yang membentuk pengalaman bekerja di Sarinah.</p>
              </div>
              <div className="life-grid">
                {lifeCards.map((card) => (
                  <article key={card.title} className="life-card" style={{ backgroundImage: `url(${card.image})` }}>
                    <div className="life-card-content"><h3>{card.title}</h3><p>{card.description}</p></div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="career-ready">
            <div className="career-ready-panel">
              <div className="career-ready-copy"><span className="career-kicker">Be Part of the Story</span><h2>Bring your perspective. Build something meaningful.</h2><p>Mulai perjalanan karier Anda bersama Sarinah.</p></div>
              <button type="button" className="career-cta" onClick={() => goPublicPage('open')}>Explore Opportunities <Icon name="chevronRight" size={18}/></button>
            </div>
          </section>
        </main>
      )}

      {publicPage === 'signin' && (
        <main className="candidate-signin-page">
          <section className={`candidate-signin-layout ${candidateAuthMode === 'register' ? 'register-mode' : 'login-mode'}`}>
            <div className="candidate-signin-visual">
              <span className="candidate-signin-kicker"><i/> Sarinah Career</span>
              <h1>Build your career journey with Sarinah.</h1>
              <p>
                Masuk atau buat akun untuk melamar posisi, memperbarui profil Talent Pool,
                dan memantau status lamaran Anda.
              </p>
            </div>

            <div className="candidate-signin-panel">
              <button
                type="button"
                className="candidate-signin-back"
                onClick={() => {
                  setCandidateAuth(null);
                  goPublicPage('open');
                }}
              >
                <Icon name="chevronLeft" size={16}/>
                Kembali ke Open Positions
              </button>

              <div className="candidate-auth-tabs">
                <button type="button" className={`candidate-auth-tab ${candidateAuthMode === 'login' ? 'active' : ''}`} onClick={() => setCandidateAuthMode('login')}>Sign In</button>
                <button type="button" className={`candidate-auth-tab ${candidateAuthMode === 'register' ? 'active' : ''}`} onClick={() => setCandidateAuthMode('register')}>Sign Up</button>
              </div>

              <h2>{candidateAuthMode === 'login' ? 'Sign In' : 'Sign Up'}</h2>
              <p>{candidateAuthMode === 'login' ? 'Gunakan akun Talent Portal Anda untuk melanjutkan.' : 'Buat akun kandidat untuk mengelola profil, lowongan, dan lamaran Anda.'}</p>

              {candidateAuth?.action === 'talent-pool' && (
                <div className="candidate-signin-target">
                  Setelah autentikasi Anda akan langsung diarahkan ke <strong>Talent Pool Sarinah</strong>.
                </div>
              )}

              {candidateAuth?.action === 'job' && (
                <div className="candidate-signin-target">
                  Setelah autentikasi Anda akan langsung melamar{' '}
                  <strong>{candidateAuth?.payload?.title || 'posisi yang dipilih'}</strong>.
                </div>
              )}

              {candidateAuthMode === 'login' ? (
                <form className="candidate-signin-form" onSubmit={submitCandidateLogin}>
                  <label className="candidate-signin-field">
                    <span>Email</span>
                    <div className="candidate-signin-input">
                      <Icon name="mail" size={18}/>
                      <input
                        type="email"
                        value={candidateLoginForm.email}
                        onChange={(event) => setCandidateLoginForm((current) => ({ ...current, email: event.target.value }))}
                        placeholder="nama@email.com"
                        autoComplete="email"
                        autoFocus
                      />
                    </div>
                  </label>

                  <label className="candidate-signin-field">
                    <span>Password</span>
                    <div className="candidate-signin-input">
                      <Icon name="lock" size={18}/>
                      <input
                        type="password"
                        value={candidateLoginForm.password}
                        onChange={(event) => setCandidateLoginForm((current) => ({ ...current, password: event.target.value }))}
                        placeholder="Minimal 8 karakter"
                        autoComplete="current-password"
                      />
                    </div>
                  </label>

                  <button type="submit" className="candidate-signin-submit" disabled={candidateAuthLoading}>
                    {candidateAuthLoading ? 'Memproses...' : 'Sign In'}
                    {!candidateAuthLoading && <Icon name="chevronRight" size={17}/>}
                  </button>
                  <div className="candidate-auth-switch">
                    Belum punya akun?{' '}
                    <button type="button" onClick={() => setCandidateAuthMode('register')}>Sign Up</button>
                  </div>
                </form>
              ) : (
                <form className="candidate-signin-form" onSubmit={submitCandidateRegister}>
                  <div className="candidate-register-grid">
                    <label className="candidate-signin-field full">
                      <span>Nama lengkap</span>
                      <div className="candidate-signin-input"><Icon name="user" size={18}/><input value={candidateRegisterForm.fullName} onChange={(e) => setCandidateRegisterForm((c) => ({ ...c, fullName: e.target.value }))} placeholder="Nama lengkap"/></div>
                    </label>
                    <label className="candidate-signin-field">
                      <span>Email</span>
                      <div className="candidate-signin-input"><Icon name="mail" size={18}/><input type="email" value={candidateRegisterForm.email} onChange={(e) => setCandidateRegisterForm((c) => ({ ...c, email: e.target.value }))} placeholder="nama@email.com"/></div>
                    </label>
                    <label className="candidate-signin-field">
                      <span>WhatsApp</span>
                      <div className="candidate-signin-input"><Icon name="phone" size={18}/><input value={candidateRegisterForm.phone} onChange={(e) => setCandidateRegisterForm((c) => ({ ...c, phone: e.target.value }))} placeholder="08xxxxxxxxxx"/></div>
                    </label>
                    <label className="candidate-signin-field full">
                      <span>Password</span>
                      <div className="candidate-signin-input"><Icon name="lock" size={18}/><input type="password" value={candidateRegisterForm.password} onChange={(e) => setCandidateRegisterForm((c) => ({ ...c, password: e.target.value }))} placeholder="Minimal 8 karakter" autoComplete="new-password"/></div>
                    </label>
                  </div>
                  <label className="checkbox-row candidate-terms"><input type="checkbox" checked={candidateRegisterForm.termsAccepted} onChange={(e) => setCandidateRegisterForm((c) => ({ ...c, termsAccepted: e.target.checked }))}/><span>Saya menyetujui penggunaan data untuk proses rekrutmen Sarinah.</span></label>
                  <button type="submit" className="candidate-signin-submit" disabled={candidateAuthLoading}>
                    {candidateAuthLoading ? 'Membuat akun...' : 'Sign Up'}
                    {!candidateAuthLoading && <Icon name="chevronRight" size={17}/>}
                  </button>
                  <div className="candidate-auth-switch">
                    Sudah punya akun?{' '}
                    <button type="button" onClick={() => setCandidateAuthMode('login')}>Sign In</button>
                  </div>
                </form>
              )}

              <div className="candidate-signin-demo">
                <Icon name="info" size={16}/>
                <span>
                  Akun kandidat diamankan dengan JWT. Setelah login, profil dan lamaran yang tampil hanya milik akun Anda.
                </span>
              </div>
            </div>
          </section>
        </main>
      )}

      {publicPage === 'account' && (
        <main className="candidate-portal-page profile-redesign">
          <div className="candidate-portal-wrap">
            {candidatePortalLoading && !candidateProfile ? (
              <div className="candidate-profile-loading">
                <div className="table-loading"><span/><p>Memuat profil kandidat...</p></div>
              </div>
            ) : (
              <>
                <section className="candidate-profile-hero">
                  <div className="candidate-profile-main">
                    <div className="candidate-profile-avatar" aria-hidden="true">
                      {initials(candidateProfile?.fullName || candidateSession?.fullName || 'Kandidat')}
                    </div>

                    <div className="candidate-profile-identity">
                      <div className="candidate-profile-name-row">
                        <h1>{candidateProfile?.fullName || candidateSession?.fullName || 'Kandidat Sarinah'}</h1>
                      </div>
                      <p className="candidate-profile-headline">
                        {candidateProfile?.workExperiences?.find((item) => item.currentJob)?.position
                          ? `${candidateProfile.workExperiences.find((item) => item.currentJob).position} di ${candidateProfile.workExperiences.find((item) => item.currentJob).companyName}`
                          : candidateProfile?.relatedJobPositions?.[0]
                            ? `Minat posisi: ${candidateProfile.relatedJobPositions[0]}`
                            : candidateProfile?.educations?.[0]?.institution
                              ? `${candidateProfile.educations[0].major || candidateProfile.educations[0].level || 'Kandidat'} • ${candidateProfile.educations[0].institution}`
                              : 'Talent Pool Candidate • PT Sarinah'}
                      </p>
                    </div>

                    <div className="candidate-profile-actions">
                      <span className="candidate-availability">
                        <i/>
                        {candidateProfile?.status === 'AVAILABLE'
                          ? 'Terbuka dengan peluang'
                          : candidateProfile?.status
                            ? enumLabel(candidateProfile.status)
                            : 'Talent Pool Sarinah'}
                      </span>
                      <button
                        type="button"
                        className="candidate-profile-edit"
                        onClick={() => requireCandidateLogin('talent-pool')}
                      >
                        <Icon name="edit" size={16}/> Edit Profil
                      </button>
                    </div>
                  </div>

                  <div className="candidate-contact-row">
                    <div className="candidate-contact-item">
                      <Icon name="mail" size={18}/>
                      <span>{candidateProfile?.email || candidateSession?.email || '-'}</span>
                    </div>
                    <div className="candidate-contact-item">
                      <Icon name="phone" size={18}/>
                      <span>{candidateProfile?.phone || 'Tambahkan nomor WhatsApp'}</span>
                    </div>
                    <div className="candidate-contact-item">
                      <Icon name="location" size={18}/>
                      <span>{candidateProfile?.preferredLocations?.length ? candidateProfile.preferredLocations.join(', ') : 'Lokasi belum ditentukan'}</span>
                    </div>
                    <div className="candidate-contact-item">
                      <Icon name="external" size={18}/>
                      {candidateProfile?.portfolios?.find((item) => item.url) ? (
                        <a href={candidateProfile.portfolios.find((item) => item.url).url} target="_blank" rel="noreferrer">
                          {candidateProfile.portfolios.find((item) => item.url).title || 'Portfolio'}
                        </a>
                      ) : (
                        <span>Portfolio belum ditambahkan</span>
                      )}
                    </div>
                  </div>
                </section>

                <section className="candidate-profile-tabs-card">
                  <nav className="candidate-profile-tabs" aria-label="Navigasi profil kandidat">
                    <button type="button" className="candidate-profile-tab active" onClick={() => document.getElementById('candidate-about')?.scrollIntoView({ behavior: 'smooth' })}>About</button>
                    <button type="button" className="candidate-profile-tab" onClick={() => document.getElementById('candidate-experience')?.scrollIntoView({ behavior: 'smooth' })}>Experiences</button>
                    <button type="button" className="candidate-profile-tab" onClick={() => document.getElementById('candidate-education')?.scrollIntoView({ behavior: 'smooth' })}>Education</button>
                    <button type="button" className="candidate-profile-tab" onClick={() => document.getElementById('candidate-training')?.scrollIntoView({ behavior: 'smooth' })}>Training & Certification</button>
                    <button type="button" className="candidate-profile-tab" onClick={() => document.getElementById('candidate-additional')?.scrollIntoView({ behavior: 'smooth' })}>Additional Information</button>
                  </nav>

                  <div className="candidate-profile-content">
                    <section id="candidate-about" className="candidate-profile-section">
                      <div className="candidate-section-heading">
                        <h2>About</h2>
                        <button type="button" className="candidate-section-action" onClick={() => requireCandidateLogin('talent-pool')}>
                          <Icon name="edit" size={15}/> Edit
                        </button>
                      </div>
                      <p className="candidate-about-copy">
                        {candidateProfile?.workExperiences?.find((item) => item.description)?.description
                          || candidateProfile?.educations?.find((item) => item.description)?.description
                          || 'Lengkapi deskripsi pengalaman atau pendidikan Anda agar recruiter dapat memahami profil profesional Anda dengan lebih baik.'}
                      </p>
                    </section>

                    <section id="candidate-experience" className="candidate-profile-section">
                      <div className="candidate-section-heading">
                        <h2>Work Experience</h2>
                        <button type="button" className="candidate-section-action" onClick={() => requireCandidateLogin('talent-pool')}>
                          <Icon name="plus" size={15}/> Add
                        </button>
                      </div>

                      {candidateProfile?.workExperiences?.length ? (
                        <div className="candidate-timeline">
                          {candidateProfile.workExperiences.map((experience, index) => (
                            <article className="candidate-timeline-item" key={experience.id || `experience-${index}`}>
                              <div className="candidate-timeline-marker"/>
                              <div className="candidate-timeline-icon"><Icon name="briefcase" size={18}/></div>
                              <div className="candidate-timeline-body">
                                <div className="candidate-timeline-title">
                                  <h3>{experience.position || 'Posisi'}</h3>
                                  <button type="button" onClick={() => requireCandidateLogin('talent-pool')} aria-label="Edit pengalaman kerja">
                                    <Icon name="edit" size={15}/>
                                  </button>
                                </div>
                                <p className="candidate-timeline-meta">{experience.companyName || '-'}</p>
                                {experience.description && <p className="candidate-timeline-description">{experience.description}</p>}
                              </div>
                              <div className="candidate-timeline-period">
                                {formatMonthYear(experience.startDate)} — {experience.currentJob ? 'Sekarang' : formatMonthYear(experience.endDate)}
                              </div>
                            </article>
                          ))}
                        </div>
                      ) : (
                        <div className="candidate-profile-empty">Belum ada pengalaman kerja. Tambahkan pengalaman untuk memperkuat profil Talent Pool Anda.</div>
                      )}
                    </section>

                    <section id="candidate-education" className="candidate-profile-section">
                      <div className="candidate-section-heading">
                        <h2>Education</h2>
                        <button type="button" className="candidate-section-action" onClick={() => requireCandidateLogin('talent-pool')}>
                          <Icon name="plus" size={15}/> Add
                        </button>
                      </div>

                      {candidateProfile?.educations?.filter((item) => item.type === 'FORMAL').length ? (
                        <div className="candidate-timeline">
                          {candidateProfile.educations.filter((item) => item.type === 'FORMAL').map((education, index) => (
                            <article className="candidate-timeline-item" key={education.id || `education-${index}`}>
                              <div className="candidate-timeline-marker"/>
                              <div className="candidate-timeline-icon"><Icon name="file" size={18}/></div>
                              <div className="candidate-timeline-body">
                                <div className="candidate-timeline-title">
                                  <h3>{education.institution || 'Institusi Pendidikan'}</h3>
                                  <button type="button" onClick={() => requireCandidateLogin('talent-pool')} aria-label="Edit pendidikan">
                                    <Icon name="edit" size={15}/>
                                  </button>
                                </div>
                                <p className="candidate-timeline-meta">
                                  {[education.level, education.major].filter(Boolean).join(' • ') || '-'}
                                  {education.ipk ? ` • IPK ${education.ipk}` : ''}
                                </p>
                                {education.description && <p className="candidate-timeline-description">{education.description}</p>}
                              </div>
                              <div className="candidate-timeline-period">
                                {education.startYear || '-'} — {education.endYear || 'Sekarang'}
                              </div>
                            </article>
                          ))}
                        </div>
                      ) : (
                        <div className="candidate-profile-empty">Belum ada pendidikan formal yang ditambahkan.</div>
                      )}
                    </section>

                    <section id="candidate-training" className="candidate-profile-section">
                      <div className="candidate-section-heading">
                        <h2>Training & Certification</h2>
                        <button type="button" className="candidate-section-action" onClick={() => requireCandidateLogin('talent-pool')}>
                          <Icon name="plus" size={15}/> Add
                        </button>
                      </div>

                      {candidateProfile?.educations?.filter((item) => item.type === 'INFORMAL').length ? (
                        <div className="candidate-timeline">
                          {candidateProfile.educations.filter((item) => item.type === 'INFORMAL').map((education, index) => (
                            <article className="candidate-timeline-item" key={education.id || `training-${index}`}>
                              <div className="candidate-timeline-marker"/>
                              <div className="candidate-timeline-icon"><Icon name="check" size={18}/></div>
                              <div className="candidate-timeline-body">
                                <div className="candidate-timeline-title">
                                  <h3>{education.major || education.level || 'Training / Certification'}</h3>
                                  <button type="button" onClick={() => requireCandidateLogin('talent-pool')} aria-label="Edit training">
                                    <Icon name="edit" size={15}/>
                                  </button>
                                </div>
                                <p className="candidate-timeline-meta">{education.institution || '-'}</p>
                                {education.description && <p className="candidate-timeline-description">{education.description}</p>}
                              </div>
                              <div className="candidate-timeline-period">
                                {education.startYear || '-'}{education.endYear ? ` — ${education.endYear}` : ''}
                              </div>
                            </article>
                          ))}
                        </div>
                      ) : (
                        <div className="candidate-profile-empty">Belum ada training atau sertifikasi. Gunakan tipe pendidikan Informal saat menambahkan data.</div>
                      )}
                    </section>

                    <section id="candidate-additional" className="candidate-profile-section">
                      <div className="candidate-section-heading">
                        <h2>Additional Information</h2>
                        <button type="button" className="candidate-section-action" onClick={() => requireCandidateLogin('talent-pool')}>
                          <Icon name="edit" size={15}/> Edit
                        </button>
                      </div>

                      <div className="candidate-info-grid">
                        <div className="candidate-info-box">
                          <span>Languages</span>
                          <strong>{candidateProfile?.languanges || '-'}</strong>
                        </div>
                        <div className="candidate-info-box">
                          <span>Religion</span>
                          <strong>{candidateProfile?.religion || '-'}</strong>
                        </div>
                        <div className="candidate-info-box">
                          <span>Expected Salary</span>
                          <strong>{candidateProfile?.expectedSalary != null ? formatCurrency(candidateProfile.expectedSalary) : '-'}</strong>
                        </div>
                        <div className="candidate-info-box">
                          <span>Job Interests</span>
                          <strong>{candidateProfile?.jobInterests?.length ? candidateProfile.jobInterests.join(', ') : '-'}</strong>
                        </div>
                        <div className="candidate-info-box">
                          <span>Preferred Locations</span>
                          <strong>{candidateProfile?.preferredLocations?.length ? candidateProfile.preferredLocations.join(', ') : '-'}</strong>
                        </div>
                        <div className="candidate-info-box">
                          <span>Related Industries</span>
                          <strong>{candidateProfile?.relatedIndustries?.length ? candidateProfile.relatedIndustries.join(', ') : '-'}</strong>
                        </div>
                      </div>

                      {!!candidateProfile?.tools?.length && (
                        <div className="candidate-skill-list">
                          {candidateProfile.tools.map((tool, index) => <span className="candidate-skill" key={`${tool}-${index}`}>{tool}</span>)}
                        </div>
                      )}

                      {!!candidateProfile?.portfolios?.filter((item) => item.url).length && (
                        <div className="candidate-portfolio-links">
                          {candidateProfile.portfolios.filter((item) => item.url).map((portfolio, index) => (
                            <a className="candidate-portfolio-link" href={portfolio.url} target="_blank" rel="noreferrer" key={portfolio.id || `portfolio-${index}`}>
                              <span>{portfolio.title || 'Portfolio'}</span><Icon name="external" size={15}/>
                            </a>
                          ))}
                        </div>
                      )}
                    </section>
                  </div>
                </section>

                <section className="candidate-portal-applications">
                  <div className="candidate-portal-panel-head">
                    <div>
                      <h2>Lamaran Saya</h2>
                      <p style={{ margin: '5px 0 0', color: '#7a838d', fontSize: '12px' }}>Pantau status proses rekrutmen yang sedang berjalan.</p>
                    </div>
                    <button type="button" className="candidate-portal-button" onClick={() => goPublicPage('open')}>Lihat Lowongan</button>
                  </div>

                  {candidateApplications.length === 0 ? (
                    <div className="candidate-empty">Belum ada lamaran. Pilih posisi yang sesuai dari Open Positions.</div>
                  ) : (
                    <div className="candidate-app-list">
                      {candidateApplications.map((application) => (
                        <article className="candidate-app-item" key={application.id}>
                          <div>
                            <h3>{application.jobTitle}</h3>
                            <p>Melamar {formatDateTime(application.appliedAt)} • Tahap {enumLabel(application.stage)}</p>
                          </div>
                          <div className="candidate-app-side">
                            <span className={`candidate-status ${String(application.status || '').toLowerCase()}`}>{enumLabel(application.status)}</span>
                            {application.status === 'ACTIVE' && (
                              <button type="button" className="candidate-withdraw" onClick={() => withdrawCandidateApplication(application)}>
                                Tarik lamaran
                              </button>
                            )}
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </section>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px' }}>
                  <button type="button" className="candidate-portal-button" onClick={() => setPublicPage('security')}>
                    <Icon name="lock" size={16}/> Keamanan Akun
                  </button>
                </div>
              </>
            )}
          </div>
        </main>
      )}

      {publicPage === 'security' && (
        <main className="candidate-portal-page">
          <div className="candidate-portal-wrap">
            <div className="candidate-portal-head">
              <div><span className="career-kicker">Account Security</span><h1>Keamanan Akun</h1><p>Perbarui password kandidat Anda secara berkala.</p></div>
              <button type="button" className="candidate-portal-button" onClick={openCandidatePortal}><Icon name="chevronLeft" size={16}/> Kembali ke Portal</button>
            </div>
            <form className="candidate-security-card" onSubmit={submitCandidatePassword}>
              <h2>Ubah Password</h2><p>Password baru minimal 8 karakter.</p>
              <label className="candidate-signin-field"><span>Password saat ini</span><div className="candidate-signin-input"><Icon name="lock" size={18}/><input type="password" value={candidatePasswordForm.currentPassword} onChange={(e) => setCandidatePasswordForm((c) => ({ ...c, currentPassword: e.target.value }))}/></div></label>
              <label className="candidate-signin-field"><span>Password baru</span><div className="candidate-signin-input"><Icon name="lock" size={18}/><input type="password" value={candidatePasswordForm.newPassword} onChange={(e) => setCandidatePasswordForm((c) => ({ ...c, newPassword: e.target.value }))}/></div></label>
              <label className="candidate-signin-field"><span>Ulangi password baru</span><div className="candidate-signin-input"><Icon name="lock" size={18}/><input type="password" value={candidatePasswordForm.confirmPassword} onChange={(e) => setCandidatePasswordForm((c) => ({ ...c, confirmPassword: e.target.value }))}/></div></label>
              <button type="submit" className="candidate-signin-submit" disabled={candidateAuthLoading}>{candidateAuthLoading ? 'Menyimpan...' : 'Ubah Password'}</button>
            </form>
          </div>
        </main>
      )}

      {publicPage === 'open' && (
        <main className="open-page">
          <section className="open-hero">
            <div className="open-hero-inner">
              <span className="open-availability"><i/> Open Positions</span>
              <h1>Your next opportunity starts here.</h1>
              <p>Lihat posisi yang sedang dibuka di Sarinah. Jika belum menemukan posisi yang sesuai, Anda tetap dapat bergabung ke Talent Pool untuk peluang berikutnya.</p>
              <button type="button" className="career-cta" onClick={goToApply}>Gabung Talent Pool Sarinah <Icon name="chevronRight" size={18}/></button>
            </div>
          </section>

          <section className="public-jobs-section">
            <div className="public-jobs-wrap">
              <div className="public-jobs-head">
                <div>
                  <span className="career-kicker">Current Opportunities</span>
                  <h2>Posisi yang sedang dibuka.</h2>
                </div>
            
              </div>

              {publicJobsLoading ? (
                <div className="public-jobs-state">
                  <div className="public-jobs-state-inner">
                    <div className="table-loading"><span/><p>Memuat lowongan...</p></div>
                  </div>
                </div>
              ) : publicJobsError ? (
                <div className="public-jobs-state">
                  <div className="public-jobs-state-inner">
                    <Icon name="info" size={34}/>
                    <strong>Job listing belum dapat dimuat</strong>
                    <p>{publicJobsError}</p>
                    <div className="public-jobs-actions">
                      <button type="button" className="public-jobs-retry" onClick={() => loadPublicJobs(true)}>
                        <Icon name="refresh" size={16}/> Coba lagi
                      </button>
                      <button type="button" className="career-cta" onClick={goToApply}>
                        Gabung Talent Pool
                      </button>
                    </div>
                  </div>
                </div>
              ) : publicJobs.length === 0 ? (
                <div className="public-jobs-state">
                  <div className="public-jobs-state-inner">
                    <Icon name="briefcase" size={34}/>
                    <strong>Belum ada posisi yang sedang dibuka</strong>
                    <p>Anda tetap dapat bergabung ke Talent Pool Sarinah agar profil Anda dapat dipertimbangkan ketika ada kebutuhan yang sesuai.</p>
                    <div className="public-jobs-actions">
                      <button type="button" className="career-cta" onClick={goToApply}>
                        Gabung Talent Pool <Icon name="chevronRight" size={17}/>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="public-jobs-grid">
                  {publicJobs.map((job) => (
                    <article className="public-job-card" key={job.id || `${job.title}-${job.location}`}>
                      <div className="public-job-top">
                        <div>
                          <span className="public-job-department">{job.department || 'SARINAH'}</span>
                          <h3>{job.title || 'Untitled Position'}</h3>
                        </div>
                        <span className="public-job-openings">
                          {Number(job.openings || 1)} posisi
                        </span>
                      </div>

                      <div className="public-job-meta">
                        <span><Icon name="location" size={15}/>{job.location || 'Jakarta'}</span>
                        <span><Icon name="briefcase" size={15}/>{enumLabel(job.employmentType || 'FULL_TIME')}</span>
                      </div>

                      {job.description && (
                        <p className="public-job-description">{job.description}</p>
                      )}

                      <div className="public-job-footer">
                        <span className="public-job-deadline">
                          {job.applicationDeadline
                            ? <>Batas lamaran: <strong>{job.applicationDeadline}</strong></>
                            : <>Batas lamaran: <strong>Tidak ditentukan</strong></>}
                        </span>

                        <button
                          type="button"
                          className="public-job-apply"
                          onClick={() => goToJobApply(job)}
                        >
                          Lamar Posisi <Icon name="chevronRight" size={17}/>
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="open-content">
            <div className="open-panel">
              <div className="open-panel-head"><span className="career-kicker">How it works</span><h2>Satu profil untuk peluang berikutnya.</h2><p>Lengkapi data Anda sekali, lalu biarkan tim rekrutmen menemukan kecocokan dengan kebutuhan yang tersedia.</p></div>
              <div className="open-steps">
                <article className="open-step"><span>1</span><strong>Upload CV</strong><p>Kirim CV terbaru sebagai dokumen utama profil Anda.</p></article>
                <article className="open-step"><span>2</span><strong>Lengkapi Profil</strong><p>Isi informasi pribadi, pendidikan, pengalaman, dan preferensi.</p></article>
                <article className="open-step"><span>3</span><strong>Stay Discoverable</strong><p>Profil Anda tersimpan di Talent Pool untuk peluang yang sesuai.</p></article>
              </div>
            </div>
          </section>
        </main>
      )}

      {publicPage === 'faq' && (
        <main className="faq-page">
          <div className="faq-layout">
            <section className="faq-intro"><span className="career-kicker">FAQ</span><h1>Questions, answered.</h1><p>Informasi singkat mengenai Talent Pool Sarinah dan proses pengisian profil kandidat.</p></section>
            <section className="faq-list">
              {faqItems.map(([question, answer], index) => (
                <article className="faq-item" key={question}>
                  <button type="button" className="faq-question" onClick={() => setFaqOpen(faqOpen === index ? -1 : index)} aria-expanded={faqOpen === index}>
                    <span>{question}</span><span>{faqOpen === index ? '−' : '+'}</span>
                  </button>
                  {faqOpen === index && <div className="faq-answer">{answer}</div>}
                </article>
              ))}
            </section>
          </div>
        </main>
      )}

      {publicPage === 'apply' && (
        <main className="apply-shell">
          <section className="apply-titlebar">
            <div><h1>Gabung Talent Pool Sarinah</h1><p>Lengkapi profil Anda melalui 7 langkah berikut.</p></div>
            <button type="button" onClick={() => goPublicPage('open')}>← Kembali ke Open Positions</button>
          </section>
          <div className="apply-progress" aria-hidden="true"><i style={{ width: `${((step + 1) / steps.length) * 100}%` }}/></div>
              <form
                ref={formRef}
                id="process"
                className="candidate-form"
                onSubmit={submit}
                onKeyDown={handleFormKeyDown}
              >
                <div className="stepper">
          {steps.map((label, index) => (
            <button
              type="button"
              key={label}
              className={
                index === step
                  ? "active"
                  : index < step
                  ? "done"
                  : ""
              }
              disabled
            >
              <span>
                {index < step ? (
                  <Icon name="check" size={14} />
                ) : (
                  index + 1
                )}
              </span>
              {label}
            </button>
          ))}
        </div>

                <div className="step-content">
                  {step === 0 && <section className="form-step"><div className="step-heading"><span>01</span><div><h2>Upload CV</h2><p>Unggah CV terbaru agar recruiter dapat meninjau pengalaman Anda.</p></div></div><div className="upload-grid"><FileDrop label="Klik atau seret CV ke sini" file={cv} onChange={setCv} accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" help="PDF, JPG, PNG, DOC atau DOCX · Maks. 10 MB"/><div className="upload-note"><Icon name="info"/><div><strong>CV akan diproses sebagai dokumen utama</strong><p>Pastikan informasi kontak dan pengalaman kerja pada CV sudah terbaru.</p></div></div></div></section>}

                  {step === 1 && <section className="form-step"><div className="step-heading"><span>02</span><div><h2>Informasi Pribadi</h2><p>Isi data utama kandidat dengan lengkap dan benar.</p></div></div><div className="form-grid four"><Field label="Nama Lengkap" required><input value={form.fullName} onChange={(e) => setValue('fullName', e.target.value)} placeholder="Contoh: Andi Pratama"/></Field><Field label="Email" required><input type="email" value={form.email} onChange={(e) => setValue('email', e.target.value)} placeholder="contoh@email.com"/></Field><Field label="Nomor Telepon" required><input value={form.phone} onChange={(e) => setValue('phone', e.target.value)} placeholder="0812 3456 7890"/></Field><Field label="Tanggal Lahir"><input type="date" value={form.birthDate} onChange={(e) => setValue('birthDate', e.target.value)}/></Field><Field label="Nomor Identitas"><input value={form.identityNumber} onChange={(e) => setValue('identityNumber', e.target.value)} placeholder="NIK / Passport"/></Field><Field label="Bahasa" hint="Pisahkan dengan koma jika lebih dari satu"><input value={form.languanges} onChange={(e) => setValue('languanges', e.target.value)} placeholder="Contoh: Indonesia, Inggris, Jawa"/></Field><Field label="Agama"><select value={form.religion} onChange={(e) => setValue('religion', e.target.value)}><option value="">Pilih agama</option><option value="Islam">Islam</option><option value="Kristen">Kristen</option><option value="Katolik">Katolik</option><option value="Hindu">Hindu</option><option value="Buddha">Buddha</option><option value="Konghucu">Konghucu</option><option value="Lainnya">Lainnya</option></select></Field><Field label="Alamat KTP" className="span-3"><textarea value={form.citizenIdAddress} onChange={(e) => setValue('citizenIdAddress', e.target.value)} placeholder="Alamat sesuai identitas"/></Field><label className="check-line span-4"><input type="checkbox" checked={form.sameAsCitizenIdAddress} onChange={(e) => setValue('sameAsCitizenIdAddress', e.target.checked)}/> Alamat tempat tinggal sama dengan alamat KTP</label>{!form.sameAsCitizenIdAddress && <Field label="Alamat Tempat Tinggal" className="span-4"><textarea value={form.residentialAddress} onChange={(e) => setValue('residentialAddress', e.target.value)} placeholder="Alamat tempat tinggal saat ini"/></Field>}</div></section>}

                 {step === 2 && (
          <section className="form-step">

            <div className="step-heading">
              <span>03</span>

              <div>
                <h2>Pendidikan</h2>
                <p>Tambahkan pendidikan formal maupun informal.</p>
              </div>
            </div>

            {form.educations.map((education, index) => (
              <div className="repeat-card" key={index}>

                <div className="repeat-head">
                  <h3>Pendidikan {index + 1}</h3>

                  {form.educations.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArray('educations', index)}
                    >
                      <Icon name="trash" />
                      Hapus
                    </button>
                  )}
                </div>

                <div className="form-grid three">

                  <Field label="Jenis">
                    <select
                      value={education.type}
                      onChange={(e) =>
                        updateArray(
                          'educations',
                          index,
                          'type',
                          e.target.value
                        )
                      }
                    >
                      <option value="FORMAL">Formal</option>
                      <option value="INFORMAL">Informal</option>
                    </select>
                  </Field>

                  <Field label="Jenjang / Sertifikasi">                    <input
                      value={education.level}
                      onChange={(e) =>
                        updateArray(
                          'educations',
                          index,
                          'level',
                          e.target.value
                        )
                      }
                      placeholder="S1 / Bootcamp"
                    />
                  </Field>

                  <Field label="Institusi">
                    <input
                      value={education.institution}
                      onChange={(e) =>
                        updateArray(
                          'educations',
                          index,
                          'institution',
                          e.target.value
                        )
                      }
                      placeholder="Nama universitas/lembaga"
                    />
                  </Field>

                  <Field label="Jurusan">
                    <input
                      value={education.major}
                      onChange={(e) =>
                        updateArray(
                          'educations',
                          index,
                          'major',
                          e.target.value
                        )
                      }
                      placeholder="Sistem Informasi"
                    />
                  </Field>

                  <Field label="Tahun Mulai">
                    <input
                      type="number"
                      value={education.startYear}
                      onChange={(e) =>
                        updateArray(
                          'educations',
                          index,
                          'startYear',
                          e.target.value
                        )
                      }
                      placeholder="2019"
                    />
                  </Field>

                  <Field label="Tahun Selesai">
                    <input
                      type="number"
                      value={education.endYear}
                      onChange={(e) =>
                        updateArray(
                          'educations',
                          index,
                          'endYear',
                          e.target.value
                        )
                      }
                      placeholder="2023"
                    />
                  </Field>

                  {/* TAMBAHAN IPK */}
                  <Field label="IPK">
                    <input
                      type="number"
                      min="0"
                      max="4"
                      step="0.01"
                      value={education.ipk}
                      onChange={(e) =>
                        updateArray(
                          'educations',
                          index,
                          'ipk',
                          e.target.value
                        )
                      }
                      placeholder="Contoh: 3.75"
                    />
                  </Field>

                  <Field
                    label="Keterangan"
                    className="span-3"
                  >
                    <textarea
                      value={education.description}
                      onChange={(e) =>
                        updateArray(
                          'educations',
                          index,
                          'description',
                          e.target.value
                        )
                      }
                      placeholder="Prestasi atau informasi tambahan"
                    />
                  </Field>

                </div>

              </div>
            ))}

            <button
              type="button"
              className="button secondary add-row"
              onClick={() =>
                addArray('educations', emptyEducation)
              }
            >
              <Icon name="plus" />
              Tambah Pendidikan
            </button>

          </section>
        )}

                  {step === 3 && <section className="form-step"><div className="step-heading"><span>04</span><div><h2>Pengalaman Kerja</h2><p>Masukkan riwayat pekerjaan yang paling relevan.</p></div></div>{form.workExperiences.map((experience, index) => <div className="repeat-card" key={index}><div className="repeat-head"><h3>Pengalaman {index + 1}</h3>{form.workExperiences.length > 1 && <button type="button" onClick={() => removeArray('workExperiences', index)}><Icon name="trash"/> Hapus</button>}</div><div className="form-grid three"><Field label="Perusahaan"><input value={experience.companyName} onChange={(e) => updateArray('workExperiences', index, 'companyName', e.target.value)} placeholder="PT Contoh Indonesia"/></Field><Field label="Posisi"><input value={experience.position} onChange={(e) => updateArray('workExperiences', index, 'position', e.target.value)} placeholder="Product Manager"/></Field><Field label="Tanggal Mulai"><input type="date" value={experience.startDate} onChange={(e) => updateArray('workExperiences', index, 'startDate', e.target.value)}/></Field><Field label="Tanggal Selesai"><input disabled={experience.currentJob} type="date" value={experience.endDate} onChange={(e) => updateArray('workExperiences', index, 'endDate', e.target.value)}/></Field><label className="check-line field-align"><input type="checkbox" checked={experience.currentJob} onChange={(e) => updateArray('workExperiences', index, 'currentJob', e.target.checked)}/> Masih bekerja di sini</label><Field label="Deskripsi" className="span-3"><textarea value={experience.description} onChange={(e) => updateArray('workExperiences', index, 'description', e.target.value)} placeholder="Tanggung jawab dan pencapaian utama"/></Field></div></div>)}<button type="button" className="button secondary add-row" onClick={() => addArray('workExperiences', emptyExperience)}><Icon name="plus"/> Tambah Pengalaman</button></section>}

                  {step === 4 && <section className="form-step"><div className="step-heading"><span>05</span><div><h2>Kompensasi</h2><p>Informasi ini membantu recruiter menyesuaikan peluang dengan ekspektasi Anda.</p></div></div><div className="form-grid two compensation"><Field label="Gaji Saat Ini per Bulan"><div className="money-input"><span>Rp</span><input type="number" min="0" value={form.currentSalary} onChange={(e) => setValue('currentSalary', e.target.value)} placeholder="15000000"/></div></Field><Field label="Gaji yang Diharapkan per Bulan"><div className="money-input"><span>Rp</span><input type="number" min="0" value={form.expectedSalary} onChange={(e) => setValue('expectedSalary', e.target.value)} placeholder="18000000"/></div></Field></div></section>}

                  {step === 5 && <section className="form-step"><div className="step-heading"><span>06</span><div><h2>Profil & Portofolio</h2><p>Tambahkan foto profil, dokumen pendukung, dan tautan portofolio.</p></div></div><div className="upload-grid two"><FileDrop label="Upload foto profil" file={profilePicture} onChange={setProfilePicture} accept="image/*" help="JPG atau PNG · Maks. 10 MB"/><FileDrop label="Upload file portofolio" file={portfolioFiles} onChange={setPortfolioFiles} accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" multiple help="Dapat memilih lebih dari satu file"/></div>{form.portfolioLinks.map((portfolio, index) => <div className="portfolio-link" key={index}><Field label={`Judul Link ${index + 1}`}><input value={portfolio.title} onChange={(e) => updateArray('portfolioLinks', index, 'title', e.target.value)} placeholder="Portfolio"/></Field><Field label="URL"><input type="url" value={portfolio.url} onChange={(e) => updateArray('portfolioLinks', index, 'url', e.target.value)} placeholder="https://portfolio.example.com"/></Field>{form.portfolioLinks.length > 1 && <button type="button" className="icon-button danger" onClick={() => removeArray('portfolioLinks', index)}><Icon name="trash"/></button>}</div>)}<button type="button" className="button secondary add-row" onClick={() => addArray('portfolioLinks', emptyPortfolio)}><Icon name="plus"/> Tambah Link</button></section>}

                  {step === 6 && <section className="form-step"><div className="step-heading"><span>07</span><div><h2>Preferensi & Informasi Tambahan</h2><p>Lengkapi minat pekerjaan, lokasi penempatan, dan informasi pendukung kandidat. Maksimal tiga data per kolom, pisahkan dengan tanda koma.</p></div></div><div className="form-grid three"><Field label="Minat Kerja" hint="Contoh: Technology, Finance, Marketing"><input value={form.jobInterests} onChange={(e) => setValue('jobInterests', e.target.value)} placeholder="Maksimal 3 minat kerja"/></Field><Field label="Lokasi Penempatan" hint="Contoh: Jakarta, Bandung, Surabaya"><input value={form.preferredLocations} onChange={(e) => setValue('preferredLocations', e.target.value)} placeholder="Maksimal 3 lokasi"/></Field><Field label="Related Industries" hint="Contoh: Teknologi Informasi, Perbankan"><input value={form.relatedIndustries} onChange={(e) => setValue('relatedIndustries', e.target.value)} placeholder="Maksimal 3 industri"/></Field><Field label="Related Job Positions" hint="Contoh: Product Manager, Business Analyst"><input value={form.relatedJobPositions} onChange={(e) => setValue('relatedJobPositions', e.target.value)} placeholder="Maksimal 3 posisi"/></Field><Field label="Tools" hint="Contoh: Jira, Figma, SQL"><input value={form.tools} onChange={(e) => setValue('tools', e.target.value)} placeholder="Maksimal 3 tools"/></Field><Field label="Sumber Kandidat"><select value={form.source} onChange={(e) => setValue('source', e.target.value)}><option>Website</option><option>LinkedIn</option><option>Referral</option><option>Job Fair</option><option>Instagram</option><option>Lainnya</option></select></Field></div><label className="terms-card"><input type="checkbox" checked={form.termsAccepted} onChange={(e) => setValue('termsAccepted', e.target.checked)}/><span><strong>Saya setuju dengan Syarat & Ketentuan</strong><small>Saya menyetujui penggunaan data untuk proses rekrutmen dan pengelolaan Talent Pool.</small></span></label></section>}
                </div>

                <div className="form-footer"><div className="form-info"><Icon name="info"/> Pastikan semua data wajib telah diisi dengan benar.</div><div>{step > 0 && <button type="button" className="button secondary" onClick={() => setStep((value) => value - 1)}><Icon name="chevronLeft"/> Sebelumnya</button>}{step < steps.length - 1 ? <button type="button" className="button primary" onClick={goNext}>Selanjutnya <Icon name="chevronRight"/></button> : <button type="submit" className="button primary" disabled={loading}>{loading ? 'Mengirim...' : 'Submit and Continue'} <Icon name="chevronRight"/></button>}</div></div>
              </form>
        </main>
      )}

      {publicPage !== 'apply' && publicPage !== 'signin' && (
        <footer className="career-footer">
          <div className="career-footer-inner">
            <div className="career-footer-brand"><img src={withAppBase('/images/sarinah.png')} alt="Sarinah"/><p>Tempat bertemunya karya, budaya, produk lokal, dan talenta yang ingin ikut membangun pengalaman retail Indonesia.</p></div>
            <div><h4>Quick Links</h4><div className="career-footer-links"><button type="button" onClick={() => goPublicPage('home')}>Home</button><button type="button" onClick={() => goPublicPage('life')}>Life at Sarinah</button><button type="button" onClick={() => goPublicPage('open')}>Open Positions</button><button type="button" onClick={() => goPublicPage('faq')}>FAQ</button></div></div>
            <div className="career-footer-contact"><h4>Contact</h4><p>PT Sarinah</p><p>Jl. M. H. Thamrin No.11, Jakarta Pusat</p><p>Telp (021) 31923008</p><p>div.sekretariat@sarinah.co.id</p></div>
          </div>
          <div className="career-footer-bottom"><span>© 2026 PT Sarinah. All rights reserved.</span><span>Talent Pool & Career Portal</span></div>
        </footer>
      )}
    </div>
  );
}

function LoginPage({ onToast }) {
  const [username, setUsername] = useState('recruiter');
  const [password, setPassword] = useState('Recruiter123!');
  const [loading, setLoading] = useState(false);

  async function login(event) {
    event.preventDefault();
    setLoading(true);
    const token = btoa(`${username}:${password}`);
    sessionStorage.setItem('talentPoolBasicAuth', token);
    sessionStorage.setItem('talentPoolUser', username);
    try {
      await api('/api/backoffice/talents/summary', {}, true);
      navigate('/backoffice/dashboard');
    } catch (error) {
      sessionStorage.removeItem('talentPoolBasicAuth');
      onToast({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <style>{BACKOFFICE_BRAND_CSS}</style>

      <section className="login-decoration" aria-hidden="true">
        <div className="login-brand-row"><Logo light /></div>
        <div className="login-hero-copy">
          <span className="login-kicker">Human Capital • Talent Pool • Recruitment</span>
          <h1>Kelola kandidat terbaik dalam satu tempat.</h1>
          <p>Kelola pipeline rekrutmen, kandidat, interview, dan Talent Pool Sarinah melalui satu back office yang terintegrasi.</p>
        </div>
        <div className="login-footnote">PT Sarinah • Talent Management</div>
      </section>

      <section className="login-panel">
        <form className="login-card" onSubmit={login}>
          <button type="button" className="back-link" onClick={() => navigate('/')}>
            <Icon name="chevronLeft" size={16}/> Kembali ke portal kandidat
          </button>

          <span className="login-card-kicker">Back Office Access</span>
          <h2>Masuk Back Office</h2>
          <p className="login-subtitle">Gunakan akun Admin atau Recruiter yang telah terdaftar.</p>

          <Field label="Username" required>
            <div className="input-icon">
              <Icon name="user" size={19}/>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                placeholder="Masukkan username"
              />
            </div>
          </Field>

          <Field label="Password" required>
            <div className="input-icon">
              <Icon name="lock" size={19}/>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="Masukkan password"
              />
            </div>
          </Field>

          <button className="button primary full" disabled={loading}>
            {loading ? 'Memeriksa...' : <>Masuk <Icon name="chevronRight" size={17}/></>}
          </button>
          <p className="login-help">Akses back office hanya untuk pengguna internal yang berwenang.</p>
        </form>
      </section>
    </main>
  );
}

function StatusBadge({ status }) {
  return <span className={`status status-${String(status || '').toLowerCase()}`}><i/>{STATUS_LABEL[status] || status || '-'}</span>;
}

function KpiCard({ icon, label, value, note, tone }) {
  return <article className="kpi-card"><span className={`kpi-icon ${tone}`}><Icon name={icon} size={22}/></span><div><small>{label}</small><strong>{Number(value || 0).toLocaleString('id-ID')}</strong><em>{note}</em></div></article>;
}


const BACKOFFICE_MENUS = [
  { key: 'dashboard', icon: 'dashboard', label: 'Dashboard', path: '/backoffice/dashboard' },
  { key: 'job-listings', icon: 'briefcase', label: 'Job Listing', path: '/backoffice/job-listings' },
  { key: 'candidates', icon: 'user', label: 'Candidates', path: '/backoffice/candidates' },
  { key: 'talent-pool', icon: 'users', label: 'Talent Pool', path: '/backoffice/talent-pool' },
  { key: 'interviews', icon: 'calendar', label: 'Interview', path: '/backoffice/interviews' },
  { key: 'reports', icon: 'chart', label: 'Reports', path: '/backoffice/reports' },
  { key: 'settings', icon: 'settings', label: 'Settings', path: '/backoffice/settings' },
];

function enumLabel(value) {
  if (!value) return '-';
  return String(value)
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function BackofficeLayout({ active, children, searchValue = '', onSearchChange, onSearchEnter }) {
  const [mobileMenu, setMobileMenu] = useState(false);
  const username = sessionStorage.getItem('talentPoolUser') || 'Recruiter';

  useEffect(() => {
    if (!sessionStorage.getItem('talentPoolBasicAuth')) navigate('/backoffice/login');
  }, []);

  function logout() {
    sessionStorage.clear();
    navigate('/backoffice/login');
  }

  return (
    <div className="backoffice-shell">
      <style>{BACKOFFICE_BRAND_CSS}</style>
      <aside className={`sidebar ${mobileMenu ? 'open' : ''}`}>
        <div className="sidebar-head">
          <Logo/>
          <button className="icon-button sidebar-close" onClick={() => setMobileMenu(false)}><Icon name="x"/></button>
        </div>
        <nav>
          {BACKOFFICE_MENUS.map((item) => (
            <button
              key={item.key}
              className={active === item.key ? 'active' : ''}
              onClick={() => { setMobileMenu(false); navigate(item.path); }}
            >
              <Icon name={item.icon}/>{item.label}
            </button>
          ))}
        </nav>
        <button className="logout-button" onClick={logout}><Icon name="logout"/> Keluar</button>
      </aside>

      <div className="backoffice-main">
        <header className="topbar">
          <button className="icon-button mobile-menu" onClick={() => setMobileMenu(true)}><Icon name="menu"/></button>
          <div className="global-search">
            <Icon name="search"/>
            <input
              placeholder="Cari kandidat, skill, posisi, atau perusahaan..."
              value={searchValue}
              onChange={(event) => onSearchChange?.(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && onSearchEnter?.(event)}
            />
            <kbd>⌘ K</kbd>
          </div>
          <button className="notification"><Icon name="bell"/></button>
          <div className="user-menu"><div className="avatar">{initials(username)}</div><span><strong>{username}</strong><small>Recruiter</small></span></div>
        </header>
        <main className="dashboard-content">{children}</main>
      </div>
    </div>
  );
}

function PageHeading({ title, description, action }) {
  return (
    <section className="dashboard-heading">
      <div><h1>{title}</h1><p>{description}</p></div>
      {action || <div className="access-note"><Icon name="info"/><span><strong>Back Office</strong></span></div>}
    </section>
  );
}


const DASHBOARD_ANALYTICS_CSS = `
  .analytics-chart-card {
    background: #fff;
    border: 1px solid #dfe7f2;
    border-radius: 18px;
    padding: 20px 22px;
    margin-bottom: 18px;
    box-shadow: 0 1px 2px rgba(15, 23, 42, .03);
  }

  .analytics-chart-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 10px;
  }

  .analytics-chart-head h3 {
    margin: 0;
    font-size: 16px;
    color: #13213c;
  }

  .analytics-chart-head p {
    margin: 5px 0 0;
    font-size: 12px;
    color: #8190a8;
  }

  .chart-legend {
    display: flex;
    align-items: center;
    gap: 18px;
    flex-wrap: wrap;
    font-size: 12px;
    color: #64748b;
  }

  .chart-legend span {
    display: inline-flex;
    align-items: center;
    gap: 7px;
  }

  .chart-legend i {
    width: 10px;
    height: 10px;
    border-radius: 3px;
    display: inline-block;
  }

  .chart-legend .candidate-dot { background: #2563eb; }
  .chart-legend .moved-dot { background: #16a34a; }

  .recruitment-chart {
    width: 100%;
    min-height: 270px;
    display: block;
  }

  .analytics-preference-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
    margin-bottom: 18px;
  }

  .preference-card {
    background: #fff;
    border: 1px solid #dfe7f2;
    border-radius: 16px;
    padding: 18px;
    min-width: 0;
  }

  .preference-card-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 16px;
  }

  .preference-card-icon {
    width: 38px;
    height: 38px;
    border-radius: 11px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: #eff6ff;
    color: #2563eb;
    flex: 0 0 auto;
  }

  .preference-card-header h4 {
    margin: 0;
    color: #13213c;
    font-size: 14px;
  }

  .preference-card-header small {
    display: block;
    margin-top: 2px;
    color: #8b98ad;
    font-size: 11px;
  }

  .preference-bars {
    display: grid;
    gap: 13px;
  }

  .preference-bar-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 6px 12px;
    align-items: center;
  }

  .preference-bar-row > span {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #334155;
    font-size: 12px;
    font-weight: 600;
  }

  .preference-bar-row > strong {
    color: #13213c;
    font-size: 12px;
  }

  .preference-bar-track {
    grid-column: 1 / -1;
    height: 7px;
    border-radius: 999px;
    background: #eef2f7;
    overflow: hidden;
  }

  .preference-bar-fill {
    height: 100%;
    min-width: 4px;
    border-radius: inherit;
    background: #2563eb;
  }

  .preference-empty {
    margin: 8px 0 2px;
    color: #8b98ad;
    font-size: 12px;
  }

  .candidate-preference-box {
    margin-top: 16px;
    padding: 14px;
    border: 1px solid #e3eaf4;
    border-radius: 14px;
    background: #f8fafc;
  }

  .candidate-preference-box h4 {
    margin: 0 0 12px;
    font-size: 13px;
    color: #172554;
  }

  .candidate-preference-grid {
    display: grid;
    gap: 12px;
  }

  .candidate-preference-item small {
    display: block;
    margin-bottom: 7px;
    color: #8492a6;
    font-size: 11px;
  }

  .candidate-preference-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .candidate-preference-tags span {
    padding: 5px 9px;
    border-radius: 999px;
    background: #eaf2ff;
    color: #1d4ed8;
    font-size: 11px;
    font-weight: 700;
  }

  .candidate-preference-tags em {
    color: #94a3b8;
    font-size: 12px;
    font-style: normal;
  }

  @media (max-width: 980px) {
    .analytics-preference-grid {
      grid-template-columns: 1fr;
    }

    .analytics-chart-head {
      flex-direction: column;
    }
  }
`;

function getLastSevenDays() {
  const result = [];
  const today = new Date();

  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date(today);
    date.setHours(0, 0, 0, 0);
    date.setDate(today.getDate() - offset);

    const key = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0'),
    ].join('-');

    result.push({
      key,
      label: new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
      }).format(date),
    });
  }

  return result;
}

function dateKey(value) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

function buildCandidateActivity(rows = []) {
  const days = getLastSevenDays();
  const counters = new Map(
    days.map((day) => [
      day.key,
      {
        candidates: 0,
        moved: 0,
      },
    ])
  );

  rows.forEach((candidate) => {
    const key = dateKey(candidate.updatedAt || candidate.createdAt);
    if (!key || !counters.has(key)) return;

    const counter = counters.get(key);
    counter.candidates += 1;

    if (candidate.movedToJobListing) {
      counter.moved += 1;
    }
  });

  return days.map((day) => ({
    ...day,
    candidates: counters.get(day.key).candidates,
    moved: counters.get(day.key).moved,
  }));
}

function collectTopValues(rows = [], extractor, limit = 5) {
  const counter = new Map();

  rows.forEach((row) => {
    const raw = extractor(row);
    const values = Array.isArray(raw)
      ? raw
      : raw
        ? [raw]
        : [];

    values.forEach((value) => {
      const label = String(value || '').trim();
      if (!label) return;

      counter.set(label, (counter.get(label) || 0) + 1);
    });
  });

  return Array.from(counter.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label))
    .slice(0, limit);
}

function RecruitmentLineChart({ rows }) {
  const width = 900;
  const height = 280;
  const padding = {
    top: 30,
    right: 30,
    bottom: 45,
    left: 48,
  };

  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  const maximum = Math.max(
    1,
    ...rows.flatMap((row) => [row.candidates, row.moved])
  );

  const yMax = Math.max(4, maximum);

  const x = (index) => (
    padding.left +
    (rows.length <= 1 ? 0 : (plotWidth * index) / (rows.length - 1))
  );

  const y = (value) => (
    padding.top +
    plotHeight -
    (Number(value || 0) / yMax) * plotHeight
  );

  const candidatePoints = rows
    .map((row, index) => `${x(index)},${y(row.candidates)}`)
    .join(' ');

  const movedPoints = rows
    .map((row, index) => `${x(index)},${y(row.moved)}`)
    .join(' ');

  const gridValues = Array.from({ length: 5 }, (_, index) => (
    Math.round((yMax * index) / 4)
  ));

  return (
    <svg
      className="recruitment-chart"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Grafik aktivitas kandidat tujuh hari terakhir"
    >
      {gridValues.map((value) => (
        <g key={value}>
          <line
            x1={padding.left}
            x2={width - padding.right}
            y1={y(value)}
            y2={y(value)}
            stroke="#e7edf5"
            strokeWidth="1"
          />
          <text
            x={padding.left - 12}
            y={y(value) + 4}
            textAnchor="end"
            fill="#94a3b8"
            fontSize="11"
          >
            {value}
          </text>
        </g>
      ))}

      <polyline
        points={candidatePoints}
        fill="none"
        stroke="#2563eb"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <polyline
        points={movedPoints}
        fill="none"
        stroke="#16a34a"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {rows.map((row, index) => (
        <g key={row.key}>
          <circle
            cx={x(index)}
            cy={y(row.candidates)}
            r="4.5"
            fill="#fff"
            stroke="#2563eb"
            strokeWidth="3"
          >
            <title>{`${row.label}: ${row.candidates} aktivitas kandidat`}</title>
          </circle>

          <circle
            cx={x(index)}
            cy={y(row.moved)}
            r="4.5"
            fill="#fff"
            stroke="#16a34a"
            strokeWidth="3"
          >
            <title>{`${row.label}: ${row.moved} kandidat ke job listing`}</title>
          </circle>

          <text
            x={x(index)}
            y={height - 15}
            textAnchor="middle"
            fill="#8a98ad"
            fontSize="11"
            fontWeight="600"
          >
            {row.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

function PreferenceCard({ icon, title, note, items }) {
  const maximum = Math.max(1, ...(items || []).map((item) => item.value));

  return (
    <article className="preference-card">
      <div className="preference-card-header">
        <span className="preference-card-icon">
          <Icon name={icon} size={19}/>
        </span>
        <div>
          <h4>{title}</h4>
          <small>{note}</small>
        </div>
      </div>

      {(items || []).length ? (
        <div className="preference-bars">
          {items.map((item) => (
            <div className="preference-bar-row" key={item.label}>
              <span title={item.label}>{item.label}</span>
              <strong>{item.value}</strong>
              <div className="preference-bar-track">
                <div
                  className="preference-bar-fill"
                  style={{ width: `${Math.max(5, (item.value / maximum) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="preference-empty">
          Belum ada data pada response API.
        </p>
      )}
    </article>
  );
}

function DashboardPage({ onToast }) {
  const [data, setData] = useState(null);
  const [talentRows, setTalentRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      setLoading(true);

      try {
        const [dashboardData, talentData] = await Promise.all([
          api('/api/backoffice/dashboard', {}, true),
          api('/api/backoffice/talents?page=0&size=100&sort=updatedAt,desc', {}, true)
            .catch(() => ({ content: [] })),
        ]);

        if (!active) return;

        setData(dashboardData);
        setTalentRows(talentData?.content || []);
      } catch (error) {
        if (active) {
          onToast({ type: 'error', message: error.message });
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  const activityRows = useMemo(
    () => buildCandidateActivity(talentRows),
    [talentRows]
  );

  // Job Interest sekarang mengambil data utama langsung dari
  // GET /api/backoffice/dashboard.
  // Response backend berbentuk: { name, count }
  // sedangkan PreferenceCard membutuhkan: { label, value }.
  const topJobInterests = useMemo(() => {
    const dashboardItems = (data?.jobInterests || [])
      .map((item) => ({
        label: String(item?.name ?? item?.label ?? '').trim(),
        value: Number(item?.count ?? item?.value ?? 0),
      }))
      .filter((item) => item.label);

    // Fallback agar dashboard tetap bekerja jika field belum tersedia
    // pada response dashboard.
    return dashboardItems.length
      ? dashboardItems
      : collectTopValues(
          talentRows,
          (candidate) => candidate.jobInterests
        );
  }, [data, talentRows]);

  // Preferred Location juga mengambil data langsung dari dashboard API.
  const topPreferredLocations = useMemo(() => {
    const dashboardItems = (data?.preferredLocations || [])
      .map((item) => ({
        label: String(item?.name ?? item?.label ?? '').trim(),
        value: Number(item?.count ?? item?.value ?? 0),
      }))
      .filter((item) => item.label);

    return dashboardItems.length
      ? dashboardItems
      : collectTopValues(
          talentRows,
          (candidate) => candidate.preferredLocations
        );
  }, [data, talentRows]);

  const topPreferredPositions = useMemo(
    () => collectTopValues(
      talentRows,
      (candidate) =>
        candidate.relatedJobPositions?.length
          ? candidate.relatedJobPositions
          : candidate.relatedPosition
    ),
    [talentRows]
  );

  return (
    <BackofficeLayout active="dashboard">
      <style>{DASHBOARD_ANALYTICS_CSS}</style>

      <PageHeading
        title="Dashboard Rekrutmen"
        description="Ringkasan kandidat, tren Talent Pool, preferensi kandidat, lowongan, dan interview terbaru."
      />

      <section className="kpi-grid">
        <KpiCard
          icon="users"
          label="Total Candidates"
          value={data?.totalCandidates}
          note="Semua kandidat"
          tone="blue"
        />

        <KpiCard
          icon="check"
          label="Active Candidates"
          value={data?.activeCandidates}
          note="Kandidat aktif"
          tone="green"
        />

        <KpiCard
          icon="briefcase"
          label="Open Job Listings"
          value={data?.openJobListings}
          note={`${data?.totalJobListings || 0} total lowongan`}
          tone="purple"
        />

        <KpiCard
          icon="calendar"
          label="Upcoming Interviews"
          value={data?.upcomingInterviews}
          note={`${data?.interviewsToday || 0} hari ini`}
          tone="amber"
        />
      </section>

      <section className="analytics-chart-card">
        <div className="analytics-chart-head">
          <div>
            <h3>Grafik Aktivitas Kandidat (7 Hari Terakhir)</h3>
            <p>
              Grafik dihitung dari aktivitas kandidat Talent Pool berdasarkan Updated At.
            </p>
          </div>

          <div className="chart-legend">
            <span>
              <i className="candidate-dot"/>
              Aktivitas Kandidat
            </span>

            <span>
              <i className="moved-dot"/>
              Move to Job Listing
            </span>
          </div>
        </div>

        <RecruitmentLineChart rows={activityRows}/>
      </section>

      <section className="analytics-preference-grid">
        <PreferenceCard
          icon="briefcase"
          title="Job Interest"
          note="Minat kerja kandidat teratas"
          items={topJobInterests}
        />

        <PreferenceCard
          icon="location"
          title="Preferred Location"
          note="Lokasi penempatan teratas"
          items={topPreferredLocations}
        />

        <PreferenceCard
          icon="user"
          title="Preferred Position"
          note="Posisi yang paling diminati"
          items={topPreferredPositions}
        />      </section>

      <section className="talent-card">
        <div className="table-toolbar">
          <span><strong>Kandidat terbaru</strong></span>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nama</th>
                <th>Email</th>
                <th>Posisi</th>
                <th>Status</th>
                <th>Updated At</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5">
                    <div className="table-loading">
                      <span/>
                      <p>Memuat dashboard...</p>
                    </div>
                  </td>
                </tr>
              ) : !(data?.recentCandidates?.length) ? (
                <tr>
                  <td colSpan="5">
                    <div className="empty-state">
                      <Icon name="users"/>
                      <strong>Belum ada kandidat</strong>
                    </div>
                  </td>
                </tr>
              ) : (
                data.recentCandidates.map((candidate) => (
                  <tr
                    key={candidate.id}
                    onClick={() => navigate('/backoffice/talent-pool')}
                  >
                    <td>
                      <div className="candidate-cell">
                        <div className="avatar">
                          {initials(candidate.fullName)}
                        </div>

                        <span>
                          <strong>{candidate.fullName}</strong>
                          <small>{candidate.phone || '-'}</small>
                        </span>
                      </div>
                    </td>

                    <td>{candidate.email}</td>
                    <td>{candidate.relatedPosition || '-'}</td>
                    <td><StatusBadge status={candidate.status}/></td>
                    <td>{formatDateTime(candidate.updatedAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="talent-card">
        <div className="table-toolbar">
          <span><strong>Interview mendatang</strong></span>

          <button
            className="button secondary"
            onClick={() => navigate('/backoffice/interviews')}
          >
            Lihat Semua
          </button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Kandidat</th>
                <th>Lowongan</th>
                <th>Jadwal</th>
                <th>Interviewer</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {!(data?.upcomingInterviewItems?.length) ? (
                <tr>
                  <td colSpan="5">
                    <div className="empty-state">
                      <Icon name="calendar"/>
                      <strong>Belum ada interview mendatang</strong>
                    </div>
                  </td>
                </tr>
              ) : (
                data.upcomingInterviewItems.map((item) => (
                  <tr key={item.id}>
                    <td>{item.candidateName}</td>
                    <td>{item.jobTitle || '-'}</td>
                    <td>{formatDateTime(item.scheduledAt)}</td>
                    <td>{item.interviewer}</td>
                    <td>{enumLabel(item.status)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </BackofficeLayout>
  );
}

function JobListingEditor({ job, onClose, onSaved, onToast }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: job?.title || '', department: job?.department || '', location: job?.location || '',
    employmentType: job?.employmentType || 'FULL_TIME', description: job?.description || '',
    openings: job?.openings || 1, applicationDeadline: job?.applicationDeadline || '', status: job?.status || 'DRAFT',
  });
  const setValue = (name, value) => setForm((current) => ({ ...current, [name]: value }));

  async function save(event) {
    event.preventDefault();
    if (!form.title.trim()) return onToast({ type: 'error', message: 'Judul lowongan wajib diisi.' });
    setLoading(true);
    try {
      const payload = { ...form, openings: Number(form.openings), applicationDeadline: form.applicationDeadline || null };
      const result = await api(job ? `/api/backoffice/job-listings/${job.id}` : '/api/backoffice/job-listings', {
        method: job ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      }, true);
      onToast({ message: job ? 'Lowongan berhasil diperbarui.' : 'Lowongan berhasil dibuat.' });
      onSaved(result);
    } catch (error) { onToast({ type: 'error', message: error.message }); }
    finally { setLoading(false); }
  }

  return (
    <Modal title={job ? 'Edit Job Listing' : 'Tambah Job Listing'} onClose={onClose} width="760px">
      <form className="modal-body" onSubmit={save}>
        <div className="form-grid two">
          <Field label="Judul Lowongan" required><input value={form.title} onChange={(e) => setValue('title', e.target.value)}/></Field>
          <Field label="Departemen"><input value={form.department} onChange={(e) => setValue('department', e.target.value)}/></Field>
          <Field label="Lokasi"><input value={form.location} onChange={(e) => setValue('location', e.target.value)}/></Field>
          <Field label="Tipe Pekerjaan" required><select value={form.employmentType} onChange={(e) => setValue('employmentType', e.target.value)}><option value="FULL_TIME">Full Time</option><option value="PART_TIME">Part Time</option><option value="CONTRACT">Contract</option><option value="INTERNSHIP">Internship</option><option value="TEMPORARY">Temporary</option></select></Field>
          <Field label="Jumlah Kebutuhan" required><input type="number" min="1" value={form.openings} onChange={(e) => setValue('openings', e.target.value)}/></Field>
          <Field label="Batas Lamaran"><input type="date" value={form.applicationDeadline} onChange={(e) => setValue('applicationDeadline', e.target.value)}/></Field>
          <Field label="Status" required><select value={form.status} onChange={(e) => setValue('status', e.target.value)}><option value="DRAFT">Draft</option><option value="PUBLISHED">Published</option><option value="CLOSED">Closed</option></select></Field>
          <Field label="Deskripsi" className="span-2"><textarea value={form.description} onChange={(e) => setValue('description', e.target.value)}/></Field>
        </div>
        <div className="modal-actions"><button type="button" className="button secondary" onClick={onClose}>Batal</button><button className="button primary" disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan'}</button></div>
      </form>
    </Modal>
  );
}

function JobListingPage({ onToast }) {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [data, setData] = useState({ content: [], page: 0, totalPages: 0, totalElements: 0, first: true, last: true });
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [applications, setApplications] = useState([]);

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: '0', size: '50', sort: 'updatedAt,desc' });
      if (q) params.set('q', q);
      if (status) params.set('status', status);
      const [list, summaryData] = await Promise.all([
        api(`/api/backoffice/job-listings?${params}`, {}, true),
        api('/api/backoffice/job-listings/summary', {}, true),
      ]);
      setData(list); setSummary(summaryData);
    } catch (error) { onToast({ type: 'error', message: error.message }); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [status]);

  async function changeStatus(job, nextStatus) {
    try {
      await api(`/api/backoffice/job-listings/${job.id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: nextStatus }) }, true);
      onToast({ message: `Status lowongan diubah menjadi ${enumLabel(nextStatus)}.` });
      await load();
    } catch (error) { onToast({ type: 'error', message: error.message }); }
  }

  async function remove(job) {
    if (!window.confirm(`Hapus lowongan ${job.title}?`)) return;
    try { await api(`/api/backoffice/job-listings/${job.id}`, { method: 'DELETE' }, true); onToast({ message: 'Lowongan berhasil dihapus.' }); await load(); }
    catch (error) { onToast({ type: 'error', message: error.message }); }
  }

  async function openApplications(job) {
    try {
      const result = await api(`/api/backoffice/job-listings/${job.id}/applications?page=0&size=100`, {}, true);
      setApplications(result.content || []); setModal({ type: 'applications', job });
    } catch (error) { onToast({ type: 'error', message: error.message }); }
  }

  return (
    <BackofficeLayout active="job-listings" searchValue={q} onSearchChange={setQ} onSearchEnter={load}>
      <PageHeading title="Job Listing" description="Buat, publish, tutup, dan kelola lowongan pekerjaan." action={<button className="button primary" onClick={() => setModal({ type: 'create' })}><Icon name="plus"/> Tambah Lowongan</button>}/>
      <section className="kpi-grid"><KpiCard icon="briefcase" label="Total" value={summary.total} note="Semua lowongan" tone="blue"/><KpiCard icon="edit" label="Draft" value={summary.draft} note="Belum dipublish" tone="amber"/><KpiCard icon="check" label="Published" value={summary.published} note="Sedang dibuka" tone="green"/><KpiCard icon="x" label="Closed" value={summary.closed} note="Sudah ditutup" tone="purple"/></section>
      <section className="talent-card">
        <form className="filters" onSubmit={(e) => { e.preventDefault(); load(); }}><Field label="Cari Lowongan"><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Judul, departemen, lokasi..."/></Field><Field label="Status"><select value={status} onChange={(e) => setStatus(e.target.value)}><option value="">Semua status</option><option value="DRAFT">Draft</option><option value="PUBLISHED">Published</option><option value="CLOSED">Closed</option></select></Field><button className="button primary filter-button"><Icon name="search"/> Cari</button></form>
        <div className="table-wrap"><table><thead><tr><th>Lowongan</th><th>Departemen</th><th>Lokasi</th><th>Tipe</th><th>Openings</th><th>Pelamar</th><th>Status</th><th>Deadline</th><th>Aksi</th></tr></thead><tbody>
          {loading ? <tr><td colSpan="9"><div className="table-loading"><span/><p>Memuat job listing...</p></div></td></tr> : !data.content.length ? <tr><td colSpan="9"><div className="empty-state"><Icon name="briefcase"/><strong>Belum ada job listing</strong></div></td></tr> : data.content.map((job) => (
            <tr key={job.id}><td><strong>{job.title}</strong></td><td>{job.department || '-'}</td><td>{job.location || '-'}</td><td>{enumLabel(job.employmentType)}</td><td>{job.openings}</td><td><button className="button secondary small" onClick={() => openApplications(job)}>{job.applicationCount}</button></td><td>{enumLabel(job.status)}</td><td>{job.applicationDeadline || '-'}</td><td className="action-cell"><button className="icon-button" title="Edit" onClick={() => setModal({ type: 'edit', job })}><Icon name="edit"/></button>{job.status !== 'PUBLISHED' && <button className="icon-button" title="Publish" onClick={() => changeStatus(job, 'PUBLISHED')}><Icon name="check"/></button>}{job.status !== 'CLOSED' && <button className="icon-button" title="Tutup" onClick={() => changeStatus(job, 'CLOSED')}><Icon name="x"/></button>}<button className="icon-button" title="Kelola kandidat" onClick={() => navigate(`/backoffice/candidates?jobListingId=${encodeURIComponent(job.id)}`)}><Icon name="users"/></button><button className="icon-button danger" title="Hapus" onClick={() => remove(job)}><Icon name="trash"/></button></td></tr>
          ))}
        </tbody></table></div>
      </section>
      {modal?.type === 'create' && <JobListingEditor onClose={() => setModal(null)} onSaved={() => { setModal(null); load(); }} onToast={onToast}/>} 
      {modal?.type === 'edit' && <JobListingEditor job={modal.job} onClose={() => setModal(null)} onSaved={() => { setModal(null); load(); }} onToast={onToast}/>} 
      {modal?.type === 'applications' && <Modal title={`Pelamar — ${modal.job.title}`} onClose={() => setModal(null)} width="900px"><div className="modal-body"><div className="table-wrap"><table><thead><tr><th>Kandidat</th><th>Stage</th><th>Status</th><th>Applied At</th></tr></thead><tbody>{applications.length ? applications.map((item) => <tr key={item.id}><td>{item.candidateName}</td><td>{enumLabel(item.stage)}</td><td>{enumLabel(item.status)}</td><td>{formatDateTime(item.appliedAt)}</td></tr>) : <tr><td colSpan="4">Belum ada pelamar.</td></tr>}</tbody></table></div></div></Modal>}
    </BackofficeLayout>
  );
}

function CandidatesPage({ onToast }) {
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const requestedJobId = new URLSearchParams(window.location.search).get('jobListingId') || '';
    api('/api/backoffice/job-listings?page=0&size=100&sort=updatedAt,desc', {}, true)
      .then((result) => {
        const rows = result.content || [];
        setJobs(rows);
        const validRequestedJob = rows.some((job) => job.id === requestedJobId);
        setSelectedJobId(validRequestedJob ? requestedJobId : (rows[0]?.id || ''));
      })
      .catch((error) => onToast({ type: 'error', message: error.message }));
  }, []);

  async function loadApplications(jobId = selectedJobId) {
    if (!jobId) { setApplications([]); setLoading(false); return; }
    setLoading(true);
    try { const result = await api(`/api/backoffice/job-listings/${jobId}/applications?page=0&size=100&sort=updatedAt,desc`, {}, true); setApplications(result.content || []); }
    catch (error) { onToast({ type: 'error', message: error.message }); }
    finally { setLoading(false); }
  }

  useEffect(() => { if (selectedJobId) loadApplications(selectedJobId); else setLoading(false); }, [selectedJobId]);

  async function updateStage(application, stage) {
    const status = stage === 'HIRED' ? 'HIRED' : stage === 'REJECTED' ? 'REJECTED' : 'ACTIVE';
    try {
      await api(`/api/backoffice/applications/${application.id}/stage`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ stage, status, notes: application.notes || null }) }, true);
      onToast({ message: `Tahapan ${application.candidateName} berhasil diperbarui.` });
      await loadApplications();
    } catch (error) { onToast({ type: 'error', message: error.message }); }
  }

  return (
    <BackofficeLayout active="candidates">
      <PageHeading title="Candidates" description="Kelola kandidat yang sudah dimasukkan ke pipeline job listing."/>
      <section className="talent-card">
        <div className="filters"><Field label="Pilih Job Listing"><select value={selectedJobId} onChange={(e) => setSelectedJobId(e.target.value)}><option value="">Pilih lowongan</option>{jobs.map((job) => <option key={job.id} value={job.id}>{job.title} — {enumLabel(job.status)}</option>)}</select></Field><button className="button secondary filter-button" onClick={() => loadApplications()}><Icon name="refresh"/> Refresh</button></div>
        <div className="table-toolbar"><span>Jumlah kandidat: <strong>{applications.length}</strong></span><button className="button primary" disabled={!selectedJobId} onClick={() => navigate(`/backoffice/talent-pool?jobListingId=${encodeURIComponent(selectedJobId)}`)}><Icon name="users"/> Ambil dari Talent Pool</button></div>
        <div className="table-wrap"><table><thead><tr><th>Kandidat</th><th>Lowongan</th><th>Hiring Stage</th><th>Status</th><th>Applied At</th><th>Updated At</th></tr></thead><tbody>
          {loading ? <tr><td colSpan="6"><div className="table-loading"><span/><p>Memuat candidates...</p></div></td></tr> : !applications.length ? <tr><td colSpan="6"><div className="empty-state"><Icon name="user"/><strong>Belum ada kandidat pada lowongan ini</strong><p>Pindahkan kandidat dari menu Talent Pool.</p></div></td></tr> : applications.map((item) => (
            <tr key={item.id}><td><strong>{item.candidateName}</strong></td><td>{item.jobTitle}</td><td><select value={item.stage} onChange={(e) => updateStage(item, e.target.value)}><option value="NEW_CANDIDATE">New Candidate</option><option value="SCREENING">Screening</option><option value="INTERVIEW">Interview</option><option value="OFFER">Offer</option><option value="HIRED">Hired</option><option value="REJECTED">Rejected</option></select></td><td>{enumLabel(item.status)}</td><td>{formatDateTime(item.appliedAt)}</td><td>{formatDateTime(item.updatedAt)}</td></tr>
          ))}
        </tbody></table></div>
      </section>
    </BackofficeLayout>
  );
}

function InterviewEditor({ candidates, jobs, onClose, onSaved, onToast }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ candidateId: candidates[0]?.id || '', jobListingId: '', scheduledAt: '', durationMinutes: 60, mode: 'ONLINE', locationOrLink: '', interviewer: '', notes: '' });
  const setValue = (name, value) => setForm((current) => ({ ...current, [name]: value }));

  async function save(event) {
    event.preventDefault();
    if (!form.candidateId || !form.scheduledAt || !form.interviewer) return onToast({ type: 'error', message: 'Kandidat, jadwal, dan interviewer wajib diisi.' });
    setLoading(true);
    try {
      const payload = { ...form, jobListingId: form.jobListingId || null, scheduledAt: new Date(form.scheduledAt).toISOString(), durationMinutes: Number(form.durationMinutes) };
      const result = await api('/api/backoffice/interviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }, true);
      onToast({ message: 'Interview berhasil dijadwalkan.' }); onSaved(result);
    } catch (error) { onToast({ type: 'error', message: error.message }); }
    finally { setLoading(false); }
  }

  return <Modal title="Jadwalkan Interview" onClose={onClose} width="760px"><form className="modal-body" onSubmit={save}><div className="form-grid two"><Field label="Kandidat" required><select value={form.candidateId} onChange={(e) => setValue('candidateId', e.target.value)}><option value="">Pilih kandidat</option>{candidates.map((candidate) => <option key={candidate.id} value={candidate.id}>{candidate.fullName}</option>)}</select></Field><Field label="Job Listing"><select value={form.jobListingId} onChange={(e) => setValue('jobListingId', e.target.value)}><option value="">Tanpa job listing</option>{jobs.map((job) => <option key={job.id} value={job.id}>{job.title}</option>)}</select></Field><Field label="Jadwal" required><input type="datetime-local" value={form.scheduledAt} onChange={(e) => setValue('scheduledAt', e.target.value)}/></Field><Field label="Durasi (menit)" required><input type="number" min="15" max="480" value={form.durationMinutes} onChange={(e) => setValue('durationMinutes', e.target.value)}/></Field><Field label="Mode" required><select value={form.mode} onChange={(e) => setValue('mode', e.target.value)}><option value="ONLINE">Online</option><option value="ONSITE">Onsite</option><option value="PHONE">Phone</option></select></Field><Field label="Lokasi / Link"><input value={form.locationOrLink} onChange={(e) => setValue('locationOrLink', e.target.value)}/></Field><Field label="Interviewer" required><input value={form.interviewer} onChange={(e) => setValue('interviewer', e.target.value)}/></Field><Field label="Catatan" className="span-2"><textarea value={form.notes} onChange={(e) => setValue('notes', e.target.value)}/></Field></div><div className="modal-actions"><button type="button" className="button secondary" onClick={onClose}>Batal</button><button className="button primary" disabled={loading}>{loading ? 'Menyimpan...' : 'Jadwalkan'}</button></div></form></Modal>;
}

function InterviewPage({ onToast }) {
  const [status, setStatus] = useState('');
  const [data, setData] = useState({ content: [] });
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: '0', size: '100', sort: 'scheduledAt,asc' });
      if (status) params.set('status', status);
      const [interviews, talentData, jobData] = await Promise.all([
        api(`/api/backoffice/interviews?${params}`, {}, true),
        api('/api/backoffice/talents?page=0&size=100&sort=updatedAt,desc', {}, true),
        api('/api/backoffice/job-listings?page=0&size=100&sort=updatedAt,desc', {}, true),
      ]);
      setData(interviews); setCandidates(talentData.content || []); setJobs(jobData.content || []);
    } catch (error) { onToast({ type: 'error', message: error.message }); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [status]);

  async function setInterviewStatus(item, nextStatus, result = null) {
    try {
      await api(`/api/backoffice/interviews/${item.id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: nextStatus, result, feedback: null }) }, true);
      onToast({ message: `Status interview ${item.candidateName} diperbarui.` }); await load();
    } catch (error) { onToast({ type: 'error', message: error.message }); }
  }

  return (
    <BackofficeLayout active="interviews">
      <PageHeading title="Interview" description="Jadwalkan, pantau, selesaikan, atau batalkan interview kandidat." action={<button className="button primary" onClick={() => setModal(true)}><Icon name="plus"/> Jadwalkan Interview</button>}/>
      <section className="talent-card"><div className="filters"><Field label="Status"><select value={status} onChange={(e) => setStatus(e.target.value)}><option value="">Semua status</option><option value="SCHEDULED">Scheduled</option><option value="COMPLETED">Completed</option><option value="CANCELLED">Cancelled</option><option value="RESCHEDULED">Rescheduled</option></select></Field><button className="button secondary filter-button" onClick={load}><Icon name="refresh"/> Refresh</button></div>
        <div className="table-wrap"><table><thead><tr><th>Kandidat</th><th>Lowongan</th><th>Jadwal</th><th>Durasi</th><th>Mode</th><th>Interviewer</th><th>Status</th><th>Hasil</th><th>Aksi</th></tr></thead><tbody>
          {loading ? <tr><td colSpan="9"><div className="table-loading"><span/><p>Memuat interview...</p></div></td></tr> : !data.content.length ? <tr><td colSpan="9"><div className="empty-state"><Icon name="calendar"/><strong>Belum ada jadwal interview</strong></div></td></tr> : data.content.map((item) => (
            <tr key={item.id}><td><strong>{item.candidateName}</strong></td><td>{item.jobTitle || '-'}</td><td>{formatDateTime(item.scheduledAt)}</td><td>{item.durationMinutes} menit</td><td>{enumLabel(item.mode)}</td><td>{item.interviewer}</td><td>{enumLabel(item.status)}</td><td>{enumLabel(item.result)}</td><td className="action-cell">{item.status !== 'COMPLETED' && <button className="icon-button" title="Selesai/Lulus" onClick={() => setInterviewStatus(item, 'COMPLETED', 'PASSED')}><Icon name="check"/></button>}{item.status !== 'CANCELLED' && <button className="icon-button danger" title="Batalkan" onClick={() => setInterviewStatus(item, 'CANCELLED')}><Icon name="x"/></button>}</td></tr>
          ))}
        </tbody></table></div>
      </section>
      {modal && <InterviewEditor candidates={candidates} jobs={jobs} onClose={() => setModal(false)} onSaved={() => { setModal(false); load(); }} onToast={onToast}/>} 
    </BackofficeLayout>
  );
}

function CountTable({ title, data }) {
  const rows = Array.isArray(data) ? data.map((item) => [item.label || '-', item.count || 0]) : Object.entries(data || {});
  return <section className="talent-card"><div className="table-toolbar"><strong>{title}</strong></div><div className="table-wrap"><table><thead><tr><th>Label</th><th>Jumlah</th></tr></thead><tbody>{rows.length ? rows.map(([label, count]) => <tr key={label}><td>{enumLabel(label)}</td><td>{Number(count).toLocaleString('id-ID')}</td></tr>) : <tr><td colSpan="2">Belum ada data.</td></tr>}</tbody></table></div></section>;
}

function ReportsPage({ onToast }) {
  const [data, setData] = useState(null);
  useEffect(() => { api('/api/backoffice/reports/overview', {}, true).then(setData).catch((error) => onToast({ type: 'error', message: error.message })); }, []);
  return <BackofficeLayout active="reports"><PageHeading title="Reports" description="Laporan ringkas funnel rekrutmen dan conversion rate."/><section className="kpi-grid"><KpiCard icon="users" label="Total Candidates" value={data?.totalCandidates} note="Database kandidat" tone="blue"/><KpiCard icon="briefcase" label="Total Applications" value={data?.totalApplications} note="Masuk job listing" tone="purple"/><KpiCard icon="check" label="Total Hired" value={data?.totalHired} note="Kandidat direkrut" tone="green"/><KpiCard icon="chart" label="Hire Conversion" value={data ? Number(data.hireConversionRate).toFixed(2) : 0} note="Persentase konversi" tone="amber"/></section><CountTable title="Kandidat berdasarkan Status" data={data?.candidatesByStatus}/><CountTable title="Kandidat berdasarkan Sumber" data={data?.candidatesBySource}/><CountTable title="Job Listing berdasarkan Status" data={data?.jobsByStatus}/><CountTable title="Applications berdasarkan Stage" data={data?.applicationsByStage}/></BackofficeLayout>;
}

function SettingsPage({ onToast }) {
  const [form, setForm] = useState({ companyName: '', defaultInterviewDuration: 60, timezone: 'Asia/Jakarta', emailNotifications: true, candidateAutoArchiveDays: 365 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const setValue = (name, value) => setForm((current) => ({ ...current, [name]: value }));

  useEffect(() => {
    api('/api/backoffice/settings', {}, true).then((result) => setForm(result)).catch((error) => onToast({ type: 'error', message: error.message })).finally(() => setLoading(false));
  }, []);

  async function save(event) {
    event.preventDefault(); setSaving(true);
    try {
      const payload = { companyName: form.companyName, defaultInterviewDuration: Number(form.defaultInterviewDuration), timezone: form.timezone, emailNotifications: Boolean(form.emailNotifications), candidateAutoArchiveDays: Number(form.candidateAutoArchiveDays) };
      const result = await api('/api/backoffice/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }, true);
      setForm(result); onToast({ message: 'Settings berhasil disimpan.' });
    } catch (error) { onToast({ type: 'error', message: error.message }); }
    finally { setSaving(false); }
  }

  return <BackofficeLayout active="settings"><PageHeading title="Settings" description="Konfigurasi perusahaan dan proses rekrutmen."/><section className="talent-card">{loading ? <div className="table-loading"><span/><p>Memuat settings...</p></div> : <form className="modal-body" onSubmit={save}><div className="form-grid two"><Field label="Nama Perusahaan" required><input value={form.companyName || ''} onChange={(e) => setValue('companyName', e.target.value)}/></Field><Field label="Timezone" required><input value={form.timezone || ''} onChange={(e) => setValue('timezone', e.target.value)} placeholder="Asia/Jakarta"/></Field><Field label="Durasi Interview Default"><input type="number" min="15" max="480" value={form.defaultInterviewDuration} onChange={(e) => setValue('defaultInterviewDuration', e.target.value)}/></Field><Field label="Auto Archive Kandidat (hari)"><input type="number" min="0" max="3650" value={form.candidateAutoArchiveDays} onChange={(e) => setValue('candidateAutoArchiveDays', e.target.value)}/></Field><label className="check-line span-2"><input type="checkbox" checked={Boolean(form.emailNotifications)} onChange={(e) => setValue('emailNotifications', e.target.checked)}/> Aktifkan email notification</label></div><div className="modal-actions"><button className="button primary" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan Settings'}</button></div><p className="empty-inline">Perubahan settings hanya dapat dilakukan oleh akun dengan role ADMIN.</p></form>}</section></BackofficeLayout>;
}

function CandidateDetail({ candidate, onClose, onEdit, onMove, onDownload }) {
  if (!candidate) return null;

  const preferredPositions =
    candidate.relatedJobPositions?.length
      ? candidate.relatedJobPositions
      : candidate.jobPosition
        ? [candidate.jobPosition]
        : [];

  const jobInterests = candidate.jobInterests || [];
  const preferredLocations = candidate.preferredLocations || [];

  const mainPosition =
    preferredPositions[0] || 'Belum ditentukan';

  return (
    <aside className="detail-drawer">
      <style>{DASHBOARD_ANALYTICS_CSS}</style>

      <header>
        <h3>Detail Kandidat</h3>

        <button
          className="icon-button"
          onClick={onClose}
        >
          <Icon name="x"/>
        </button>
      </header>

      <div className="detail-scroll">
        <div className="candidate-identity">
          <div className="avatar large">
            {initials(candidate.fullName)}
          </div>

          <StatusBadge status={candidate.status}/>

          <h2>{candidate.fullName}</h2>
          <p>{mainPosition}</p>
        </div>

        <div className="contact-list">
          <span>
            <Icon name="location"/>
            {candidate.residentialAddress ||
              candidate.citizenIdAddress ||
              'Lokasi belum diisi'}
          </span>

          <span>
            <Icon name="mail"/>
            {candidate.email}
          </span>

          <span>
            <Icon name="phone"/>
            {candidate.phone}
          </span>
        </div>

        <div className="tag-list">
          {(candidate.tools || []).map((tag) => (
            <span key={tag}>{tag}</span>
          ))}

          {(candidate.relatedIndustries || []).map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>

        <section className="candidate-preference-box">
          <h4>Preferensi Kandidat</h4>

          <div className="candidate-preference-grid">
            <div className="candidate-preference-item">
              <small>Job Interest</small>

              <div className="candidate-preference-tags">
                {jobInterests.length ? (
                  jobInterests.map((item) => (
                    <span key={item}>{item}</span>
                  ))
                ) : (
                  <em>Belum diisi</em>
                )}
              </div>
            </div>

            <div className="candidate-preference-item">
              <small>Preferred Location</small>

              <div className="candidate-preference-tags">
                {preferredLocations.length ? (
                  preferredLocations.map((item) => (
                    <span key={item}>{item}</span>
                  ))
                ) : (
                  <em>Belum diisi</em>
                )}
              </div>
            </div>

            <div className="candidate-preference-item">
              <small>Preferred Position</small>

              <div className="candidate-preference-tags">
                {preferredPositions.length ? (
                  preferredPositions.map((item) => (
                    <span key={item}>{item}</span>
                  ))
                ) : (
                  <em>Belum diisi</em>
                )}
              </div>
            </div>
          </div>
        </section>

        <div className="detail-two">
          <div>
            <small>Ekspektasi Gaji</small>
            <strong>
              {formatCurrency(candidate.expectedSalary)} / bulan
            </strong>
          </div>

          <div>
            <small>Sumber</small>
            <strong>{candidate.source || '-'}</strong>
          </div>

          <div>
            <small>Current Salary</small>
            <strong>{formatCurrency(candidate.currentSalary)}</strong>
          </div>

          <div>
            <small>Updated At</small>
            <strong>{formatDateTime(candidate.updatedAt)}</strong>
          </div>
        </div>

        {candidate.portfolios?.length > 0 && (
          <section className="detail-section">
            <h4>Portfolio</h4>

            {candidate.portfolios.map((item) => (
              <a
                key={item.id || item.url}
                href={item.url || '#'}
                target="_blank"
                rel="noreferrer"
              >
                <Icon name="external"/>
                {item.title || item.originalName || 'Portfolio'}
              </a>
            ))}
          </section>
        )}

        <section className="detail-section">
          <h4>Pendidikan</h4>

          {candidate.educations?.length ? (
            candidate.educations.map((item) => (
              <article key={item.id}>
                <i/>

                <div>
                  <strong>
                    {item.level}
                    {item.major ? ` – ${item.major}` : ''}
                  </strong>

                  <span>{item.institution}</span>

                  <small>
                    {item.startYear || '-'} – {item.endYear || 'Sekarang'}
                    {item.ipk != null ? ` · IPK ${item.ipk}` : ''}
                  </small>
                </div>
              </article>
            ))
          ) : (
            <p className="empty-inline">
              Belum ada data pendidikan.
            </p>
          )}
        </section>

        <section className="detail-section">
          <h4>Pengalaman Kerja</h4>

          {candidate.workExperiences?.length ? (
            candidate.workExperiences.map((item) => (
              <article key={item.id}>
                <i/>

                <div>
                  <strong>{item.position}</strong>
                  <span>{item.companyName}</span>

                  <small>
                    {item.startDate || '-'} –{' '}
                    {item.currentJob
                      ? 'Sekarang'
                      : item.endDate || '-'}
                  </small>

                  {item.description && (
                    <p>{item.description}</p>
                  )}
                </div>
              </article>
            ))
          ) : (
            <p className="empty-inline">
              Belum ada pengalaman kerja.
            </p>
          )}
        </section>
      </div>

      <footer>
        <button
          className="button secondary"
          onClick={onEdit}
        >
          <Icon name="edit"/>
          Edit Data
        </button>

        <button
          className="button secondary"
          onClick={onDownload}
        >
          <Icon name="download"/>
          CV
        </button>

        <button
          className="button primary"
          onClick={onMove}
        >
          <Icon name="briefcase"/>
          Move to Job Listing
        </button>
      </footer>
    </aside>
  );
}

function CandidateEditor({ candidate, onClose, onSaved, onToast, mode = 'edit' }) {
  const [loading, setLoading] = useState(false);
  const [cv, setCv] = useState(null);

  const [form, setForm] = useState({
    fullName: candidate?.fullName || '',
    email: candidate?.email || '',
    phone: candidate?.phone || '',
    birthDate: candidate?.birthDate || '',
    identityNumber: candidate?.identityNumber || '',
    citizenIdAddress: candidate?.citizenIdAddress || '',
    residentialAddress: candidate?.residentialAddress || '',
    sameAsCitizenIdAddress: candidate?.sameAsCitizenIdAddress || false,
    currentSalary: candidate?.currentSalary ?? '',
    expectedSalary: candidate?.expectedSalary ?? '',
    source: candidate?.source || 'Back Office',
    relatedIndustries: (candidate?.relatedIndustries || []).join(', '),

    // existing relatedJobPositions dipakai sebagai Preferred Position
    relatedJobPositions: (candidate?.relatedJobPositions || []).join(', '),

    tools: (candidate?.tools || []).join(', '),

    // TAMBAHAN
    jobInterests: (candidate?.jobInterests || []).join(', '),
    preferredLocations: (candidate?.preferredLocations || []).join(', '),
  });

  const setValue = (name, value) => (
    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  );

  const split = (value) => (
    String(value || '')
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean)
      .slice(0, 3)
  );

  async function save(event) {
    event.preventDefault();

    if (!form.fullName || !form.email || !form.phone) {
      return onToast({
        type: 'error',
        message: 'Nama, email, dan telepon wajib diisi.',
      });
    }

    if (mode === 'create' && !cv) {
      return onToast({
        type: 'error',
        message: 'CV wajib dipilih untuk talent baru.',
      });
    }

    setLoading(true);

    try {
      const request = {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,

        birthDate:
          form.birthDate || null,

        identityNumber:
          form.identityNumber || null,

        citizenIdAddress:
          form.citizenIdAddress || null,

        residentialAddress:
          form.sameAsCitizenIdAddress
            ? form.citizenIdAddress
            : (form.residentialAddress || null),

        sameAsCitizenIdAddress:
          form.sameAsCitizenIdAddress,

        currentSalary:
          form.currentSalary === ''
            ? null
            : Number(form.currentSalary),

        expectedSalary:
          form.expectedSalary === ''
            ? null
            : Number(form.expectedSalary),

        source: form.source,
        termsAccepted: true,

        relatedIndustries:
          split(form.relatedIndustries),

        relatedJobPositions:
          split(form.relatedJobPositions),

        tools:
          split(form.tools),

        // TAMBAHAN
        jobInterests:
          split(form.jobInterests),

        preferredLocations:
          split(form.preferredLocations),

        educations:
          candidate?.educations?.map(({ id, ...item }) => item) || [],

        workExperiences:
          candidate?.workExperiences?.map(({ id, ...item }) => item) || [],

        portfolioLinks:
          candidate?.portfolios
            ?.filter((item) => item.url)
            .map((item) => ({
              title: item.title,
              url: item.url,
            })) || [],
      };

      const body = new FormData();

      body.append(
        'data',
        new Blob(
          [JSON.stringify(request)],
          { type: 'application/json' }
        )
      );

      if (cv) {
        body.append('cv', cv);
      }

      const path =
        mode === 'create'
          ? '/api/backoffice/talents'
          : `/api/backoffice/talents/${candidate.id}`;

      const result = await api(
        path,
        {
          method: mode === 'create' ? 'POST' : 'PUT',
          body,
        },
        true
      );

      onToast({
        message:
          mode === 'create'
            ? 'Talent baru berhasil ditambahkan.'
            : 'Data kandidat berhasil diperbarui.',
      });

      onSaved(result);
    } catch (error) {
      onToast({
        type: 'error',
        message: error.message,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      title={
        mode === 'create'
          ? 'Tambah Talent Baru'
          : 'Edit Data Kandidat'
      }
      onClose={onClose}
      width="760px"
    >
      <form
        className="modal-body"
        onSubmit={save}
      >
        <div className="form-grid two">
          <Field label="Nama Lengkap" required>
            <input
              value={form.fullName}
              onChange={(e) => setValue('fullName', e.target.value)}
            />
          </Field>

          <Field label="Email" required>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setValue('email', e.target.value)}
            />
          </Field>

          <Field label="Nomor Telepon" required>
            <input
              value={form.phone}
              onChange={(e) => setValue('phone', e.target.value)}
            />
          </Field>

          <Field label="Tanggal Lahir">
            <input
              type="date"
              value={form.birthDate}
              onChange={(e) => setValue('birthDate', e.target.value)}
            />
          </Field>

          <Field label="Nomor Identitas">
            <input
              value={form.identityNumber}
              onChange={(e) => setValue('identityNumber', e.target.value)}
            />
          </Field>

          <Field label="Sumber">
            <input
              value={form.source}
              onChange={(e) => setValue('source', e.target.value)}
            />
          </Field>

          <Field
            label="Alamat KTP"
            className="span-2"
          >
            <textarea
              value={form.citizenIdAddress}
              onChange={(e) =>
                setValue('citizenIdAddress', e.target.value)
              }
            />
          </Field>

          <Field
            label="Alamat Tempat Tinggal"
            className="span-2"
          >
            <textarea
              value={form.residentialAddress}
              onChange={(e) =>
                setValue('residentialAddress', e.target.value)
              }
            />
          </Field>

          <Field label="Current Salary">
            <input
              type="number"
              value={form.currentSalary}
              onChange={(e) =>
                setValue('currentSalary', e.target.value)
              }
            />
          </Field>

          <Field label="Expected Salary">
            <input
              type="number"
              value={form.expectedSalary}
              onChange={(e) =>
                setValue('expectedSalary', e.target.value)
              }
            />
          </Field>

          <Field
            label="Job Interest"
            hint="Maksimal 3, pisahkan dengan koma"
          >
            <input
              value={form.jobInterests}
              onChange={(e) =>
                setValue('jobInterests', e.target.value)
              }
              placeholder="Technology, Finance, Marketing"
            />
          </Field>

          <Field
            label="Preferred Location"
            hint="Maksimal 3, pisahkan dengan koma"
          >
            <input
              value={form.preferredLocations}
              onChange={(e) =>
                setValue('preferredLocations', e.target.value)
              }
              placeholder="Jakarta, Bandung, Surabaya"
            />
          </Field>

          <Field
            label="Preferred Position"
            hint="Maksimal 3, pisahkan dengan koma"
          >
            <input
              value={form.relatedJobPositions}
              onChange={(e) =>
                setValue('relatedJobPositions', e.target.value)
              }
              placeholder="Backend Engineer, Business Analyst"
            />
          </Field>

          <Field label="Industries">
            <input
              value={form.relatedIndustries}
              onChange={(e) =>
                setValue('relatedIndustries', e.target.value)
              }
              placeholder="Pisahkan dengan koma"
            />
          </Field>

          <Field
            label="Tools"
            className="span-2"
          >
            <input
              value={form.tools}
              onChange={(e) =>
                setValue('tools', e.target.value)
              }
              placeholder="Pisahkan dengan koma"
            />
          </Field>

          <Field
            label={
              mode === 'create'
                ? 'CV'
                : 'Ganti CV (opsional)'
            }
            className="span-2"
          >
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={(e) =>
                setCv(e.target.files?.[0] || null)
              }
            />
          </Field>
        </div>

        <div className="modal-actions">
          <button
            type="button"            className="button secondary"
            onClick={onClose}
          >
            Batal
          </button>

          <button
            className="button primary"
            disabled={loading}
          >
            {loading ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Backoffice({ onToast }) {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [summary, setSummary] = useState({});
  const [pageData, setPageData] = useState({ content: [], page: 0, totalPages: 0, totalElements: 0, first: true, last: true });
  const [filters, setFilters] = useState({ q: '', industry: '', position: '', source: '', status: '' });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [rowMenu, setRowMenu] = useState(null);
  const [modal, setModal] = useState(null);
  const [importFiles, setImportFiles] = useState(null);
  const [jobListings, setJobListings] = useState([]);
  const requestedJobListingId = new URLSearchParams(window.location.search).get('jobListingId') || '';
  const username = sessionStorage.getItem('talentPoolUser') || 'Recruiter';

  useEffect(() => {
    const closeRowMenu = () => setRowMenu(null);

    document.addEventListener('click', closeRowMenu);
    window.addEventListener('resize', closeRowMenu);
    window.addEventListener('scroll', closeRowMenu, true);

    return () => {
      document.removeEventListener('click', closeRowMenu);
      window.removeEventListener('resize', closeRowMenu);
      window.removeEventListener('scroll', closeRowMenu, true);
    };
  }, []);

  function toggleRowMenu(event, candidate) {
    event.stopPropagation();

    if (rowMenu?.candidate.id === candidate.id) {
      setRowMenu(null);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const menuWidth = 220;
    const menuHeight = 190;
    const gap = 8;

    const left = Math.max(
      12,
      Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - 12)
    );

    const openAbove = rect.bottom + menuHeight + gap > window.innerHeight;
    const top = openAbove
      ? Math.max(12, rect.top - menuHeight - gap)
      : rect.bottom + gap;

    setRowMenu({ candidate, top, left });
  }

  useEffect(() => {
    if (!sessionStorage.getItem('talentPoolBasicAuth')) navigate('/backoffice/login');
  }, []);

  const queryString = useMemo(() => {
    const params = new URLSearchParams({ page: String(page), size: '10', sort: 'updatedAt,desc' });
    Object.entries(appliedFilters).forEach(([key, value]) => value && params.set(key === 'q' ? 'q' : key, value));
    return params.toString();
  }, [appliedFilters, page]);

  async function loadData() {
    setLoading(true);
    try {
      const [summaryData, listData] = await Promise.all([
        api('/api/backoffice/talents/summary', {}, true),
        api(`/api/backoffice/talents?${queryString}`, {}, true),
      ]);
      setSummary(summaryData);
      setPageData(listData);
    } catch (error) {
      if (error.message.toLowerCase().includes('password')) logout();
      onToast({ type: 'error', message: error.message });
    } finally { setLoading(false); }
  }

  useEffect(() => { loadData(); }, [queryString]);

  useEffect(() => {
    api('/api/backoffice/job-listings?page=0&size=100&sort=title,asc', {}, true)
      .then((result) => setJobListings((result.content || []).filter((job) => job.status !== 'CLOSED')))
      .catch((error) => onToast({ type: 'error', message: error.message }));
  }, []);

  async function openDetail(id) {
    setSelectedId(id); setDetailLoading(true); setRowMenu(null);
    try { setDetail(await api(`/api/backoffice/talents/${id}`, {}, true)); }
    catch (error) { onToast({ type: 'error', message: error.message }); }
    finally { setDetailLoading(false); }
  }

  function closeDetail() { setSelectedId(null); setDetail(null); }
  function applyFilters(event) { event?.preventDefault(); setPage(0); setAppliedFilters({ ...filters }); }
  function resetFilters() { const empty = { q: '', industry: '', position: '', source: '', status: '' }; setFilters(empty); setAppliedFilters(empty); setPage(0); }
  function logout() { sessionStorage.clear(); navigate('/backoffice/login'); }

  async function updateStatus(id, status) {
    try {
      await api(`/api/backoffice/talents/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }, true);
      onToast({ message: `Status kandidat diubah menjadi ${STATUS_LABEL[status]}.` });
      setModal(null); await loadData(); if (selectedId === id) await openDetail(id);
    } catch (error) { onToast({ type: 'error', message: error.message }); }
  }

  async function moveToJob(id, jobListingId, hiringStage) {
    if (!jobListingId) {
      onToast({ type: 'error', message: 'Pilih job listing terlebih dahulu.' });
      return;
    }
    try {
      await api(`/api/backoffice/talents/${id}/move-to-job-listing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobListingId, hiringStage }),
      }, true);
      onToast({ message: 'Kandidat berhasil masuk ke pipeline job listing.' });
      setModal(null);
      navigate(`/backoffice/candidates?jobListingId=${encodeURIComponent(jobListingId)}`);
    } catch (error) { onToast({ type: 'error', message: error.message }); }
  }

  async function deleteCandidate(id) {
    try {
      await api(`/api/backoffice/talents/${id}`, { method: 'DELETE' }, true);
      onToast({ message: 'Kandidat berhasil dihapus permanen.' });
      setModal(null); closeDetail(); await loadData();
    } catch (error) { onToast({ type: 'error', message: error.message }); }
  }

  async function downloadCv(candidate = detail) {
    if (!candidate) return;
    try {
      const response = await api(`/api/backoffice/talents/${candidate.id}/cv`, {}, true);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a'); anchor.href = url; anchor.download = candidate.cvOriginalName || `${candidate.fullName}-CV`; anchor.click(); URL.revokeObjectURL(url);
    } catch (error) { onToast({ type: 'error', message: error.message }); }
  }

  async function importCv(event) {
    event.preventDefault();
    const files = Array.from(importFiles || []);
    if (!files.length) return onToast({ type: 'error', message: 'Pilih minimal satu file CV.' });
    if (files.length > 10) return onToast({ type: 'error', message: 'Maksimal 10 CV sekali unggah.' });
    try {
      const body = new FormData(); files.forEach((file) => body.append('files', file));
      await api('/api/backoffice/talents/import', { method: 'POST', body }, true);
      onToast({ message: `${files.length} CV berhasil diimpor.` }); setModal(null); setImportFiles(null); await loadData();
    } catch (error) { onToast({ type: 'error', message: error.message }); }
  }

  const selectedListItem = pageData.content.find((item) => item.id === selectedId);

  return (
    <div className="backoffice-shell">
      <style>{BACKOFFICE_BRAND_CSS}</style>
      <aside className={`sidebar ${mobileMenu ? 'open' : ''}`}><div className="sidebar-head"><Logo/><button className="icon-button sidebar-close" onClick={() => setMobileMenu(false)}><Icon name="x"/></button></div><nav>{BACKOFFICE_MENUS.map((item) => <button key={item.key} className={item.key === 'talent-pool' ? 'active' : ''} onClick={() => { setMobileMenu(false); navigate(item.path); }}><Icon name={item.icon}/>{item.label}</button>)}</nav><button className="logout-button" onClick={logout}><Icon name="logout"/> Keluar</button></aside>

      <div className="backoffice-main"><header className="topbar"><button className="icon-button mobile-menu" onClick={() => setMobileMenu(true)}><Icon name="menu"/></button><div className="global-search"><Icon name="search"/><input placeholder="Cari kandidat, skill, posisi, atau perusahaan..." value={filters.q} onChange={(e) => setFilters((current) => ({ ...current, q: e.target.value }))} onKeyDown={(e) => e.key === 'Enter' && applyFilters(e)}/><kbd>⌘ K</kbd></div><button className="notification"><Icon name="bell"/><i>8</i></button><div className="user-menu"><div className="avatar">{initials(username)}</div><span><strong>{username}</strong><small>Recruiter</small></span></div></header>

        <main className={`dashboard-content ${selectedId ? 'with-drawer' : ''}`}><section className="dashboard-heading"><div><h1>Kelola Talent Pool</h1><p>Kelola, filter, dan pindahkan kandidat ke job listing dengan mudah.</p></div><div className="access-note"><Icon name="info"/><span><strong>Akses Role: Recruiter</strong></span></div></section>

          <section className="kpi-grid"><KpiCard icon="users" label="Total Talent" value={summary.totalTalent} note="Semua kandidat" tone="blue"/><KpiCard icon="check" label="Active Candidates" value={summary.activeCandidates} note="Kandidat aktif" tone="green"/><KpiCard icon="user" label="Ready to Hire" value={summary.readyToHire} note="Potensial direkrut" tone="amber"/><KpiCard icon="briefcase" label="Moved to Job Listing" value={summary.movedToJobListing} note="Sudah dipindahkan" tone="purple"/></section>

          <section className="talent-card"><form className="filters" onSubmit={applyFilters}><Field label="Cari kandidat"><div className="input-icon"><Icon name="search"/><input value={filters.q} onChange={(e) => setFilters((current) => ({ ...current, q: e.target.value }))} placeholder="Nama, email, skill..."/></div></Field><Field label="Industri"><input value={filters.industry} onChange={(e) => setFilters((current) => ({ ...current, industry: e.target.value }))} placeholder="Semua industri"/></Field><Field label="Posisi Terkait"><input value={filters.position} onChange={(e) => setFilters((current) => ({ ...current, position: e.target.value }))} placeholder="Semua posisi"/></Field><Field label="Sumber"><select value={filters.source} onChange={(e) => setFilters((current) => ({ ...current, source: e.target.value }))}><option value="">Semua sumber</option><option>Website</option><option>LinkedIn</option><option>Referral</option><option>Job Fair</option><option>Back Office</option></select></Field><Field label="Status"><select value={filters.status} onChange={(e) => setFilters((current) => ({ ...current, status: e.target.value }))}><option value="">Semua status</option>{STATUS_OPTIONS.map((status) => <option key={status} value={status}>{STATUS_LABEL[status]}</option>)}</select></Field><button className="button secondary filter-button" type="button" onClick={resetFilters}><Icon name="refresh"/> Reset</button><button className="button primary filter-button" type="submit"><Icon name="search"/> Terapkan</button></form>

            <div className="table-toolbar"><span>Menampilkan <strong>{pageData.content.length}</strong> dari <strong>{pageData.totalElements || 0}</strong> kandidat</span><div><button className="button secondary" onClick={() => setModal({ type: 'import' })}><Icon name="upload"/> Import CV</button><button className="button secondary" onClick={() => onToast({ message: 'Export dapat ditambahkan sebagai endpoint CSV pada backend.' })}><Icon name="download"/> Export</button><button className="button primary" onClick={() => setModal({ type: 'create' })}><Icon name="plus"/> Add Talent</button></div></div>

            <div className="table-wrap"><table><thead><tr><th>Nama Kandidat</th><th>Posisi Terkait</th><th>Industri</th><th>Pengalaman</th><th>Ekspektasi Gaji</th><th>Status</th><th>Sumber</th><th>Pipeline</th><th>Updated At</th><th>Aksi</th></tr></thead><tbody>{loading ? <tr><td colSpan="10"><div className="table-loading"><span/><p>Memuat data kandidat...</p></div></td></tr> : pageData.content.length === 0 ? <tr><td colSpan="10"><div className="empty-state"><Icon name="users" size={34}/><strong>Belum ada kandidat</strong><p>Ubah filter atau tambahkan talent baru.</p></div></td></tr> : pageData.content.map((candidate) => <tr key={candidate.id} className={candidate.id === selectedId ? 'selected' : ''} onClick={() => openDetail(candidate.id)}><td><div className="candidate-cell"><div className="avatar">{initials(candidate.fullName)}</div><span><strong>{candidate.fullName}</strong><small>{candidate.email}</small></span></div></td><td>{candidate.relatedPosition || '-'}</td><td>{candidate.industry || '-'}</td><td>{monthsToExperience(candidate.experienceMonths)}</td><td>{formatCurrency(candidate.expectedSalary)}</td><td><StatusBadge status={candidate.status}/></td><td>{candidate.source || '-'}</td><td>{candidate.movedToJobListing ? <span className="status status-screened"><i/>In Job Listing</span> : <span className="status status-available"><i/>Talent Pool</span>}</td><td>{formatDateTime(candidate.updatedAt)}</td><td className="action-cell"><button className="icon-button" aria-label={`Aksi ${candidate.fullName}`} aria-expanded={rowMenu?.candidate.id === candidate.id} onClick={(event) => toggleRowMenu(event, candidate)}><Icon name="more"/></button></td></tr>)}</tbody></table></div>

            <div className="pagination"><span>Rows per page: <strong>10</strong></span><div><button disabled={pageData.first} onClick={() => setPage((value) => Math.max(0, value - 1))}><Icon name="chevronLeft"/></button><span>Halaman <strong>{pageData.page + 1}</strong> dari <strong>{Math.max(pageData.totalPages, 1)}</strong></span><button disabled={pageData.last} onClick={() => setPage((value) => value + 1)}><Icon name="chevronRight"/></button></div></div>
          </section>
        </main>
      </div>

      {rowMenu && (
        <div
          className="row-menu"
          style={{ top: rowMenu.top, left: rowMenu.left }}
          onClick={(event) => event.stopPropagation()}
        >
          <button onClick={() => openDetail(rowMenu.candidate.id)}>
            <Icon name="eye"/> View details
          </button>
          <button onClick={async () => {
            const id = rowMenu.candidate.id;
            setRowMenu(null);
            await openDetail(id);
            setModal({ type: 'edit', id });
          }}>
            <Icon name="edit"/> Edit data
          </button>
          <button onClick={() => {
            const candidate = rowMenu.candidate;
            setRowMenu(null);
            downloadCv(candidate);
          }}>
            <Icon name="file"/> Preview / Download CV
          </button>
          <button onClick={() => {
            const candidate = rowMenu.candidate;
            setRowMenu(null);
            setModal({ type: 'move', candidate });
          }}>
            <Icon name="briefcase"/> Move to job listing
          </button>
          <button className="danger" onClick={() => {
            const candidate = rowMenu.candidate;
            setRowMenu(null);
            setModal({ type: 'delete', candidate });
          }}>
            <Icon name="trash"/> Delete
          </button>
        </div>
      )}

      {detailLoading && selectedId && <aside className="detail-drawer loading-drawer"><div className="drawer-loader"><span/><p>Memuat detail...</p></div></aside>}
      {!detailLoading && detail && <CandidateDetail candidate={detail} onClose={closeDetail} onEdit={() => setModal({type:'edit', id:detail.id})} onMove={() => setModal({type:'move', candidate:detail})} onDownload={() => downloadCv(detail)}/>} 

      {modal?.type === 'import' && <Modal title="Import CV Massal" onClose={() => setModal(null)}><form className="modal-body" onSubmit={importCv}><FileDrop label="Pilih maksimal 10 CV" file={importFiles} onChange={setImportFiles} accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" multiple help="Sistem akan membuat draft kandidat berdasarkan nama file."/><div className="modal-actions"><button type="button" className="button secondary" onClick={() => setModal(null)}>Batal</button><button className="button primary"><Icon name="upload"/> Import CV</button></div></form></Modal>}
      {modal?.type === 'create' && <CandidateEditor mode="create" onClose={() => setModal(null)} onSaved={() => {setModal(null); loadData();}} onToast={onToast}/>} 
      {modal?.type === 'edit' && detail && detail.id === modal.id && <CandidateEditor candidate={detail} onClose={() => setModal(null)} onSaved={(updated) => {setModal(null); setDetail(updated); loadData();}} onToast={onToast}/>} 
      {modal?.type === 'move' && <MoveModal candidate={modal.candidate} jobs={jobListings} defaultJobListingId={requestedJobListingId} onClose={() => setModal(null)} onSubmit={moveToJob}/>} 
      {modal?.type === 'delete' && <Modal title="Hapus Kandidat" onClose={() => setModal(null)}><div className="modal-body confirm-delete"><span><Icon name="trash" size={26}/></span><h3>Hapus {modal.candidate.fullName}?</h3><p>Data kandidat, CV, pendidikan, pengalaman, dan portofolio akan dihapus permanen dan tidak dapat dikembalikan.</p><div className="modal-actions"><button className="button secondary" onClick={() => setModal(null)}>Batal</button><button className="button danger-button" onClick={() => deleteCandidate(modal.candidate.id)}>Hapus Permanen</button></div></div></Modal>}
    </div>
  );
}

function MoveModal({ candidate, jobs, defaultJobListingId, onClose, onSubmit }) {
  const availableJobs = (jobs || []).filter((job) => job.status !== 'CLOSED');
  const initialJobId = availableJobs.some((job) => job.id === defaultJobListingId)
    ? defaultJobListingId
    : (availableJobs[0]?.id || '');
  const [jobListingId, setJobListingId] = useState(initialJobId);
  const [hiringStage, setHiringStage] = useState('NEW_CANDIDATE');

  return (
    <Modal title="Move to Job Listing" onClose={onClose}>
      <form className="modal-body" onSubmit={(event) => { event.preventDefault(); onSubmit(candidate.id, jobListingId, hiringStage); }}>
        <div className="candidate-mini"><div className="avatar">{initials(candidate.fullName)}</div><span><strong>{candidate.fullName}</strong><small>{candidate.email}</small></span></div>
        <Field label="Job Listing" required>
          <select value={jobListingId} onChange={(event) => setJobListingId(event.target.value)}>
            <option value="">Pilih job listing</option>
            {availableJobs.map((job) => <option key={job.id} value={job.id}>{job.title} — {enumLabel(job.status)}</option>)}
          </select>
        </Field>
        <Field label="Hiring Stage" required>
          <select value={hiringStage} onChange={(event) => setHiringStage(event.target.value)}>
            <option value="NEW_CANDIDATE">New Candidate</option>
            <option value="SCREENING">Screening</option>
            <option value="INTERVIEW">Interview</option>
            <option value="OFFER">Offer</option>
          </select>
        </Field>
        {!availableJobs.length && <p className="empty-inline">Belum ada job listing aktif. Buat atau publish job listing terlebih dahulu.</p>}
        <div className="modal-actions"><button type="button" className="button secondary" onClick={onClose}>Batal</button><button className="button primary" disabled={!jobListingId}><Icon name="briefcase"/> Pindahkan</button></div>
      </form>
    </Modal>
  );
}

export default function App() {
  const pathname = usePathname();
  const [toast, setToast] = useState(null);
  const showToast = (value) => setToast({ ...value, key: Date.now() });

  let page;
  if (pathname === '/backoffice/login') page = <LoginPage onToast={showToast}/>;
  else if (pathname === '/backoffice' || pathname === '/backoffice/dashboard') page = <DashboardPage onToast={showToast}/>;
  else if (pathname === '/backoffice/job-listings') page = <JobListingPage onToast={showToast}/>;
  else if (pathname === '/backoffice/candidates') page = <CandidatesPage onToast={showToast}/>;
  else if (pathname === '/backoffice/talent-pool') page = <Backoffice onToast={showToast}/>;
  else if (pathname === '/backoffice/interviews') page = <InterviewPage onToast={showToast}/>;
  else if (pathname === '/backoffice/reports') page = <ReportsPage onToast={showToast}/>;
  else if (pathname === '/backoffice/settings') page = <SettingsPage onToast={showToast}/>;
  else if (pathname.startsWith('/backoffice')) page = <DashboardPage onToast={showToast}/>;
  else page = <CandidatePortal onToast={showToast}/>;

  return <>{page}<Toast toast={toast} onClose={() => setToast(null)}/></>;
}