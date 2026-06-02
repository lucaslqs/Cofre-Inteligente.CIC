import { useState, useEffect, useRef } from "react";

/* ─── FONTS ─────────────────────────────────────────────────────────────── */
const FontLink = () => (
  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
);

/* ─── PALETTE ────────────────────────────────────────────────────────────── */
const C = {
  bg: "#080810",
  surface: "#10101C",
  card: "#14141F",
  border: "#1E1E2E",
  orange: "#FF4D1C",
  orangeL: "#FF6B35",
  teal: "#00C9A7",
  yellow: "#F5C842",
  purple: "#8B5CF6",
  white: "#F4F1EB",
  mid: "#6B6B85",
  dim: "#2E2E45",
};

/* ─── DATA ───────────────────────────────────────────────────────────────── */
const STREAK_TITLES = [
  { days: 0,  title: "Iniciante",        icon: "🌱" },
  { days: 7,  title: "Motorista Consciente", icon: "🔑" },
  { days: 30, title: "Guardião do Cofre", icon: "🛡️" },
  { days: 90, title: "Motorista de Elite", icon: "💎" },
];

const INITIAL_COFRES = [
  {
    id: 1, nome: "IPVA 2027", icon: "🚗", foto: null,
    meta: 1800, saldo: 1380, prazo: "2027-01-15",
    streak: 34, lockType: "carencia", lockDays: 180,
    status: "ativo", guardiao: "Maria (esposa)",
    historico: [80, 50, 100, 80, 70, 120, 80, 50, 150],
  },
  {
    id: 2, nome: "Viagem Nordeste", icon: "✈️", foto: null,
    meta: 3000, saldo: 870, prazo: "2026-12-20",
    streak: 12, lockType: "psicologico", lockDays: 0,
    status: "turbo", guardiao: "Pedro (irmão)",
    historico: [30, 50, 40, 30, 80, 40, 50, 100, 80],
  },
  {
    id: 3, nome: "Revisão Junho", icon: "🔧", foto: null,
    meta: 600, saldo: 600, prazo: "2026-06-15",
    streak: 24, lockType: "carencia", lockDays: 90,
    status: "completo", guardiao: null,
    historico: [50, 60, 80, 70, 100, 90, 80, 70, 0],
  },
];

/* ─── HELPERS ────────────────────────────────────────────────────────────── */
const fmtR = (v) => `R$\u00a0${Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
const pct  = (s, m) => Math.min(100, Math.round((s / m) * 100));
const dias = (prazo) => Math.max(0, Math.ceil((new Date(prazo) - new Date()) / 86400000));

function getTitle(streak) {
  let t = STREAK_TITLES[0];
  for (const s of STREAK_TITLES) { if (streak >= s.days) t = s; }
  return t;
}

/* ─── MICRO COMPONENTS ───────────────────────────────────────────────────── */
function Ring({ p, color, size = 80, thick = 6 }) {
  const r = (size - thick) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.dim} strokeWidth={thick} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={thick}
        strokeDasharray={circ} strokeDashoffset={circ - (p / 100) * circ}
        strokeLinecap="round" style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)" }} />
    </svg>
  );
}

function MiniBar({ vals, color }) {
  const max = Math.max(...vals, 1);
  return (
    <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 28 }}>
      {vals.map((v, i) => (
        <div key={i} style={{
          flex: 1, borderRadius: 2,
          background: i === vals.length - 1 ? color : `${color}55`,
          height: `${(v / max) * 100}%`,
          minHeight: 3,
          transition: "height 0.6s ease",
        }} />
      ))}
    </div>
  );
}

function Tag({ children, color = C.orange }) {
  return (
    <span style={{
      fontSize: 9, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase",
      color, background: `${color}18`, padding: "3px 8px", borderRadius: 6,
      fontFamily: "'DM Mono', monospace",
    }}>{children}</span>
  );
}

function Btn({ children, onClick, color = C.orange, ghost, full, disabled, small }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: full ? "100%" : "auto",
      padding: small ? "10px 18px" : "14px 22px",
      borderRadius: 12, border: ghost ? `1.5px solid ${C.border}` : "none",
      background: ghost ? "transparent" : disabled ? C.dim : color,
      color: ghost ? C.mid : disabled ? C.mid : "#fff",
      fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
      fontSize: small ? 13 : 15, cursor: disabled ? "not-allowed" : "pointer",
      boxShadow: (!ghost && !disabled) ? `0 6px 24px ${color}44` : "none",
      transition: "all 0.18s ease", letterSpacing: 0.2,
    }}>{children}</button>
  );
}

function Input({ label, value, onChange, type = "text", placeholder }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <p style={{ margin: "0 0 7px", fontSize: 11, color: C.mid, letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 600 }}>{label}</p>}
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{
          width: "100%", padding: "13px 15px", borderRadius: 11, boxSizing: "border-box",
          background: C.surface, border: `1px solid ${C.border}`,
          color: C.white, fontFamily: "'DM Mono', monospace", fontSize: 14, outline: "none",
        }} />
    </div>
  );
}

/* ─── MODAL SHELL ────────────────────────────────────────────────────────── */
function Modal({ children, onClose }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)",
      backdropFilter: "blur(12px)", zIndex: 60,
      display: "flex", alignItems: "flex-end", justifyContent: "center",
    }} onClick={onClose}>
      <div style={{
        background: C.card, borderRadius: "22px 22px 0 0",
        padding: "28px 22px 50px", width: "100%", maxWidth: 430,
        border: `1px solid ${C.border}`, borderBottom: "none",
        maxHeight: "90vh", overflowY: "auto",
      }} onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

/* ─── HOME ───────────────────────────────────────────────────────────────── */
function HomeScreen({ cofres, onNovo, onCofre, onResgate }) {
  const total = cofres.reduce((a, c) => a + c.saldo, 0);
  const totalMeta = cofres.reduce((a, c) => a + c.meta, 0);
  const [tab, setTab] = useState("cofres");
  const globalStreak = Math.max(...cofres.map(c => c.streak));
  const title = getTitle(globalStreak);

  return (
    <div style={{ paddingBottom: 90 }}>
      {/* Header */}
      <div style={{
        padding: "52px 20px 0",
        background: `linear-gradient(180deg, ${C.orange}08 0%, transparent 100%)`,
      }}>
        {/* Profile row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
              <span style={{ fontSize: 16 }}>{title.icon}</span>
              <span style={{ fontSize: 11, color: C.orange, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>
                {title.title}
              </span>
            </div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", color: C.white }}>
              João Silva 🚕
            </h2>
          </div>
          <div style={{
            width: 44, height: 44, borderRadius: "50%",
            background: `linear-gradient(135deg, ${C.orange}, ${C.orangeL})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, fontWeight: 800, color: "#fff",
            boxShadow: `0 4px 18px ${C.orange}55`,
            fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 1,
          }}>JS</div>
        </div>

        {/* Total card */}
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 20, padding: "22px 20px 18px", marginBottom: 20,
          position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: -40, right: -40, width: 160, height: 160,
            background: `radial-gradient(circle, ${C.orange}14 0%, transparent 70%)`,
          }} />
          <p style={{ margin: "0 0 4px", fontSize: 10, color: C.mid, letterSpacing: 2, textTransform: "uppercase", fontWeight: 600 }}>
            Total guardado
          </p>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 14 }}>
            <span style={{ fontSize: 11, color: C.mid, fontFamily: "'DM Mono', monospace" }}>R$</span>
            <span style={{ fontSize: 42, fontWeight: 700, color: C.white, letterSpacing: -2, lineHeight: 1, fontFamily: "'Bebas Neue', sans-serif" }}>
              {total.toLocaleString("pt-BR")}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ flex: 1, height: 4, background: C.dim, borderRadius: 2 }}>
              <div style={{
                height: "100%", borderRadius: 2,
                width: `${pct(total, totalMeta)}%`,
                background: `linear-gradient(90deg, ${C.orange}, ${C.yellow})`,
                transition: "width 1s ease",
              }} />
            </div>
            <span style={{ fontSize: 11, color: C.mid, fontFamily: "'DM Mono', monospace", whiteSpace: "nowrap" }}>
              {pct(total, totalMeta)}%
            </span>
          </div>
          {/* Global streak */}
          <div style={{ display: "flex", gap: 12, marginTop: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ fontSize: 14 }}>🔥</span>
              <span style={{ fontSize: 12, color: C.orange, fontWeight: 600 }}>{globalStreak} dias seguidos</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ fontSize: 14 }}>🏦</span>
              <span style={{ fontSize: 12, color: C.mid }}>{cofres.filter(c => c.lockType === "carencia").length} cofres bloqueados</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
          {["cofres", "histórico"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: "7px 16px", borderRadius: 100, border: "none", cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 12, letterSpacing: 0.3,
              background: tab === t ? C.orange : C.surface,
              color: tab === t ? "#fff" : C.mid,
              transition: "all 0.2s", textTransform: "capitalize",
            }}>{t}</button>
          ))}
        </div>
      </div>

      {/* Cofres list */}
      {tab === "cofres" && (
        <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 12 }}>
          {cofres.map(c => {
            const p = pct(c.saldo, c.meta);
            const done = c.status === "completo";
            const turbo = c.status === "turbo";
            const d = dias(c.prazo);
            const locked = c.lockType === "carencia";
            const color = done ? C.teal : turbo ? C.yellow : C.orange;

            return (
              <div key={c.id} onClick={() => done ? onResgate(c) : onCofre(c)}
                style={{
                  background: turbo
                    ? `linear-gradient(135deg, ${C.yellow}10, ${C.card})`
                    : done
                    ? `linear-gradient(135deg, ${C.teal}10, ${C.card})`
                    : C.card,
                  border: `1px solid ${turbo ? C.yellow + "44" : done ? C.teal + "44" : C.border}`,
                  borderRadius: 18, padding: "16px 16px 14px",
                  display: "flex", gap: 14, cursor: "pointer",
                  transition: "transform 0.15s, box-shadow 0.15s",
                  position: "relative", overflow: "hidden",
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 30px ${color}22`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
              >
                {/* Turbo banner */}
                {turbo && (
                  <div style={{
                    position: "absolute", top: 10, right: -22, background: C.yellow,
                    color: "#000", fontSize: 8, fontWeight: 800, padding: "3px 30px",
                    transform: "rotate(35deg)", letterSpacing: 1, zIndex: 2,
                  }}>TURBO</div>
                )}

                {/* Ring */}
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <Ring p={p} color={color} size={70} thick={5} />
                  <div style={{
                    position: "absolute", inset: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 22, transform: "rotate(90deg)",
                  }}>{done ? "✅" : c.icon}</div>
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: 15, color: C.white, fontFamily: "'DM Sans', sans-serif" }}>{c.nome}</span>
                    <Tag color={done ? C.teal : turbo ? C.yellow : C.orange}>
                      {done ? "Resgatar" : p + "%"}
                    </Tag>
                  </div>
                  <p style={{ margin: "0 0 8px", fontFamily: "'DM Mono', monospace", fontSize: 12, color: C.mid }}>
                    {fmtR(c.saldo)} <span style={{ color: C.dim }}>/ {fmtR(c.meta)}</span>
                  </p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", gap: 10 }}>
                      {!done && <span style={{ fontSize: 11, color: C.mid }}>📅 {d}d</span>}
                      <span style={{ fontSize: 11, color: C.orange }}>🔥 {c.streak}</span>
                      {locked && <span style={{ fontSize: 11, color: C.purple }}>🔒 CDB</span>}
                      {c.guardiao && <span style={{ fontSize: 11, color: C.mid }}>👥</span>}
                    </div>
                    <MiniBar vals={c.historico} color={color} />
                  </div>
                </div>
              </div>
            );
          })}

          {/* New cofre */}
          <button onClick={onNovo} style={{
            background: "transparent", border: `2px dashed ${C.border}`,
            borderRadius: 18, padding: 18, color: C.dim,
            fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            transition: "all 0.2s",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.orange; e.currentTarget.style.color = C.orange; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.dim; }}
          >
            <span style={{ fontSize: 20 }}>+</span> Criar novo cofre
          </button>
        </div>
      )}

      {tab === "histórico" && (
        <div style={{ padding: "0 20px" }}>
          {[
            { data: "Hoje 22:10", tipo: "Depósito", cofre: "IPVA 2027", valor: 80, icon: "🚗", cor: C.teal },
            { data: "Ontem 19:40", tipo: "Turbo ativado", cofre: "Viagem Nordeste", valor: 0, icon: "⚡", cor: C.yellow },
            { data: "25/05 09:20", tipo: "Depósito", cofre: "IPVA 2027", valor: 100, icon: "🚗", cor: C.teal },
            { data: "23/05 21:10", tipo: "Streak 30 dias", cofre: "Revisão Junho", valor: 0, icon: "🏆", cor: C.orange },
            { data: "21/05 18:30", tipo: "Depósito", cofre: "Viagem Nordeste", valor: 50, icon: "✈️", cor: C.teal },
          ].map((h, i) => (
            <div key={i} style={{ display: "flex", gap: 14, padding: "13px 0", borderBottom: `1px solid ${C.border}` }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                background: C.surface, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
              }}>{h.icon}</div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: C.white }}>{h.cofre}</p>
                <p style={{ margin: "2px 0 0", fontSize: 11, color: C.mid }}>{h.tipo} · {h.data}</p>
              </div>
              {h.valor > 0 && (
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, fontWeight: 600, color: h.cor }}>
                  +{fmtR(h.valor)}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── DETALHE COFRE ──────────────────────────────────────────────────────── */
function DetalheCofre({ cofre, onVoltar, onDepositar }) {
  const p = pct(cofre.saldo, cofre.meta);
  const d = dias(cofre.prazo);
  const t = getTitle(cofre.streak);
  const turbo = cofre.status === "turbo";
  const color = turbo ? C.yellow : C.orange;

  const [showSaqueAlert, setShowSaqueAlert] = useState(false);
  const [saqueStep, setSaqueStep] = useState(0);

  function handleSaqueAttempt() {
    setShowSaqueAlert(true);
    setSaqueStep(0);
  }

  return (
    <div style={{ padding: "52px 20px 40px" }}>
      <button onClick={onVoltar} style={{ background: "none", border: "none", color: C.mid, cursor: "pointer", fontSize: 22, marginBottom: 22, padding: 0 }}>←</button>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
        <div style={{ position: "relative" }}>
          <Ring p={p} color={color} size={82} thick={6} />
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, transform: "rotate(90deg)" }}>
            {cofre.icon}
          </div>
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.white, fontFamily: "'DM Sans', sans-serif" }}>{cofre.nome}</h2>
          <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
            <Tag color={color}>{p}% completo</Tag>
            {cofre.lockType === "carencia" && <Tag color={C.purple}>🔒 CDB ativo</Tag>}
            {turbo && <Tag color={C.yellow}>⚡ Modo Turbo</Tag>}
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        {[
          ["💰", "Guardado", fmtR(cofre.saldo)],
          ["🎯", "Meta", fmtR(cofre.meta)],
          ["📅", "Dias restantes", `${d} dias`],
          ["🔥", "Streak", `${cofre.streak} dias`],
        ].map(([ic, lbl, val]) => (
          <div key={lbl} style={{ background: C.surface, borderRadius: 14, padding: "14px 15px", border: `1px solid ${C.border}` }}>
            <p style={{ margin: "0 0 4px", fontSize: 18 }}>{ic}</p>
            <p style={{ margin: "0 0 2px", fontSize: 10, color: C.mid, letterSpacing: 1, textTransform: "uppercase" }}>{lbl}</p>
            <p style={{ margin: 0, fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 600, color: C.white }}>{val}</p>
          </div>
        ))}
      </div>

      {/* Streak title */}
      <div style={{
        background: `linear-gradient(135deg, ${C.orange}14, ${C.orange}06)`,
        border: `1px solid ${C.orange}28`, borderRadius: 14, padding: "14px 16px", marginBottom: 14,
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <span style={{ fontSize: 28 }}>{t.icon}</span>
        <div>
          <p style={{ margin: 0, fontSize: 11, color: C.orange, fontWeight: 700, letterSpacing: 1 }}>SEU TÍTULO ATUAL</p>
          <p style={{ margin: "2px 0 0", fontWeight: 700, fontSize: 15, color: C.white }}>{t.title}</p>
          <p style={{ margin: "2px 0 0", fontSize: 11, color: C.mid }}>
            {cofre.streak < 90 ? `Faltam ${90 - cofre.streak} dias para Motorista de Elite 💎` : "Nível máximo atingido!"}
          </p>
        </div>
      </div>

      {/* Lock info */}
      {cofre.lockType === "carencia" && (
        <div style={{
          background: `${C.purple}12`, border: `1px solid ${C.purple}30`,
          borderRadius: 14, padding: "14px 16px", marginBottom: 14,
        }}>
          <p style={{ margin: "0 0 4px", fontSize: 11, color: C.purple, fontWeight: 700, letterSpacing: 1 }}>🔒 BLOQUEIO REAL — CDB COM CARÊNCIA</p>
          <p style={{ margin: 0, fontSize: 12, color: C.mid, lineHeight: 1.6 }}>
            Seu dinheiro está rendendo CDI. Se sacar antes do prazo, perde os últimos 30 dias de rendimento.
            O capital sempre é seu — mas a disciplina tem recompensa.
          </p>
        </div>
      )}

      {/* Guardião */}
      {cofre.guardiao && (
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 14, padding: "13px 15px", marginBottom: 14,
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <span style={{ fontSize: 22 }}>👥</span>
          <div>
            <p style={{ margin: 0, fontSize: 11, color: C.mid, letterSpacing: 1, textTransform: "uppercase" }}>Guardião do cofre</p>
            <p style={{ margin: "2px 0 0", fontSize: 13, fontWeight: 600, color: C.white }}>{cofre.guardiao}</p>
            <p style={{ margin: "1px 0 0", fontSize: 11, color: C.mid }}>Será notificado se você tentar sacar antes do prazo</p>
          </div>
        </div>
      )}

      {/* Turbo alert */}
      {turbo && (
        <div style={{
          background: `${C.yellow}12`, border: `1px solid ${C.yellow}40`,
          borderRadius: 14, padding: "13px 15px", marginBottom: 14,
        }}>
          <p style={{ margin: "0 0 4px", fontSize: 12, color: C.yellow, fontWeight: 700 }}>⚡ Modo Turbo ativado</p>
          <p style={{ margin: 0, fontSize: 12, color: C.mid, lineHeight: 1.6 }}>
            Faltam {d} dias e você está em {p}% da meta. Para atingir o objetivo, guarde {fmtR(Math.ceil((cofre.meta - cofre.saldo) / Math.max(1, d)))} por dia.
          </p>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
        <Btn full onClick={onDepositar}>Depositar 💰</Btn>
        <Btn ghost small onClick={handleSaqueAttempt}>Sacar</Btn>
      </div>

      {/* Saque alert modal */}
      {showSaqueAlert && (
        <Modal onClose={() => setShowSaqueAlert(false)}>
          {saqueStep === 0 && (
            <>
              <div style={{ textAlign: "center", marginBottom: 22 }}>
                <div style={{ fontSize: 48, marginBottom: 10 }}>⚠️</div>
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.white }}>Tem certeza?</h3>
                <p style={{ color: C.mid, marginTop: 8, fontSize: 13, lineHeight: 1.6 }}>
                  Você está prestes a quebrar <strong style={{ color: C.orange }}>{cofre.streak} dias</strong> de disciplina e perder o título de <strong style={{ color: C.orange }}>{t.title}</strong>.
                </p>
              </div>
              <div style={{ background: C.surface, borderRadius: 14, padding: 16, marginBottom: 20 }}>
                <p style={{ margin: "0 0 8px", fontSize: 12, color: C.mid }}>O que você perde ao sacar agora:</p>
                {[
                  coffre => `🔥 ${coffre.streak} dias de streak zerado`,
                  coffre => `🏆 Título "${getTitle(coffre.streak).title}" perdido`,
                  coffre => cofre.lockType === "carencia" ? "💸 30 dias de rendimento CDI perdido" : null,
                  coffre => cofre.guardiao ? `👥 ${coffre.guardiao} será notificado` : null,
                ].filter(fn => fn(cofre)).map((fn, i) => (
                  <p key={i} style={{ margin: "6px 0 0", fontSize: 13, color: C.white, fontWeight: 500 }}>
                    {fn(cofre)}
                  </p>
                ))}
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <Btn full onClick={() => setShowSaqueAlert(false)} color={C.teal}>Manter o cofre 💪</Btn>
              </div>
              <button onClick={() => setSaqueStep(1)} style={{
                width: "100%", background: "none", border: "none",
                color: C.dim, fontSize: 12, cursor: "pointer", marginTop: 12, padding: "8px 0",
              }}>Continuar mesmo assim →</button>
            </>
          )}
          {saqueStep === 1 && (
            <>
              <div style={{ textAlign: "center", marginBottom: 22 }}>
                <div style={{ fontSize: 48, marginBottom: 10 }}>👥</div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.white }}>Notificar guardião?</h3>
                <p style={{ color: C.mid, marginTop: 8, fontSize: 13, lineHeight: 1.6 }}>
                  Seu guardião <strong style={{ color: C.white }}>{cofre.guardiao || "nenhum"}</strong> será notificado desta retirada antes do prazo.
                </p>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <Btn full onClick={() => setShowSaqueAlert(false)} color={C.teal}>Desistir — manter cofre</Btn>
              </div>
              <button onClick={() => { setSaqueStep(2); }} style={{
                width: "100%", background: "none", border: "none",
                color: C.dim, fontSize: 12, cursor: "pointer", marginTop: 12, padding: "8px 0",
              }}>Notificar e continuar →</button>
            </>
          )}
          {saqueStep === 2 && (
            <div style={{ textAlign: "center", padding: "10px 0" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📨</div>
              <h3 style={{ margin: 0, color: C.white, fontSize: 18, fontWeight: 700 }}>Guardião notificado</h3>
              <p style={{ color: C.mid, marginTop: 8, fontSize: 13 }}>
                Sua solicitação de saque foi enviada. O processamento leva até 1 dia útil.
              </p>
              <div style={{ marginTop: 20 }}>
                <Btn full onClick={() => setShowSaqueAlert(false)}>Entendido</Btn>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

/* ─── NOVO COFRE ─────────────────────────────────────────────────────────── */
function NovoCofre({ onCriar, onVoltar }) {
  const [step, setStep] = useState(0);
  const [nome, setNome] = useState("");
  const [valor, setValor] = useState("");
  const [prazo, setPrazo] = useState("");
  const [lockType, setLockType] = useState("carencia");
  const [guardiao, setGuardiao] = useState("");
  const [fotoPreview, setFotoPreview] = useState(null);
  const [criando, setCriando] = useState(false);
  const [done, setDone] = useState(false);
  const fileRef = useRef();

  const SUGESTOES = [
    { icon: "🚗", nome: "IPVA 2027", valor: "1800", meses: 8 },
    { icon: "🔧", nome: "Revisão", valor: "600", meses: 3 },
    { icon: "🛡️", nome: "Seguro", valor: "2400", meses: 10 },
    { icon: "✈️", nome: "Viagem", valor: "3000", meses: 12 },
    { icon: "📱", nome: "Celular", valor: "2000", meses: 6 },
    { icon: "🎯", nome: "Outro", valor: "", meses: null },
  ];

  function criar() {
    setCriando(true);
    setTimeout(() => { setCriando(false); setDone(true); }, 1800);
  }

  if (done) {
    const pixKey = "cofre-" + Math.random().toString(36).substr(2, 8).toUpperCase();
    const porDia = valor && prazo ? Math.ceil(Number(valor) / Math.max(1, dias(prazo))) : 0;
    return (
      <div style={{ padding: "52px 20px 40px" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 60, marginBottom: 12 }}>🎉</div>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: C.white }}>Cofre criado!</h2>
          <p style={{ color: C.mid, marginTop: 6 }}>Subconta exclusiva ativa via CDB</p>
        </div>
        <div style={{ background: `${C.teal}10`, border: `1px solid ${C.teal}30`, borderRadius: 16, padding: 20, marginBottom: 16 }}>
          <p style={{ margin: "0 0 6px", fontSize: 11, color: C.teal, fontWeight: 700, letterSpacing: 1 }}>CHAVE PIX DO COFRE</p>
          <p style={{ margin: 0, fontFamily: "'DM Mono', monospace", fontSize: 14, color: C.teal, wordBreak: "break-all" }}>{pixKey}</p>
          <p style={{ margin: "8px 0 0", fontSize: 12, color: C.mid }}>Envie Pix para essa chave para depositar neste cofre</p>
        </div>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 18, marginBottom: 22 }}>
          {[
            ["Meta", fmtR(Number(valor))],
            ["Prazo", prazo],
            ["Bloqueio", lockType === "carencia" ? "CDB com carência (real)" : "Psicológico"],
            ["Guardião", guardiao || "Nenhum"],
            ["Guardar por dia", fmtR(porDia)],
            ["Rendimento", "100% CDI"],
          ].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
              <span style={{ fontSize: 12, color: C.mid }}>{k}</span>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: C.white }}>{v}</span>
            </div>
          ))}
        </div>
        <Btn full onClick={() => onCriar({ nome, valor: Number(valor), prazo, lockType, guardiao })}>
          Ver meu cofre 🔒
        </Btn>
      </div>
    );
  }

  return (
    <div style={{ padding: "52px 20px 40px" }}>
      <button onClick={onVoltar} style={{ background: "none", border: "none", color: C.mid, cursor: "pointer", fontSize: 22, marginBottom: 22, padding: 0 }}>←</button>

      {/* Step indicators */}
      <div style={{ display: "flex", gap: 6, marginBottom: 28 }}>
        {["Meta", "Bloqueio", "Guardião", "Foto"].map((s, i) => (
          <div key={s} style={{ flex: 1 }}>
            <div style={{
              height: 3, borderRadius: 2,
              background: i <= step ? C.orange : C.dim,
              transition: "background 0.3s",
            }} />
            <p style={{ margin: "4px 0 0", fontSize: 9, color: i <= step ? C.orange : C.dim, textAlign: "center", letterSpacing: 0.5 }}>{s}</p>
          </div>
        ))}
      </div>

      {/* Step 0: escolher meta */}
      {step === 0 && (
        <>
          <h2 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 700, color: C.white }}>Qual a meta?</h2>
          <p style={{ color: C.mid, marginBottom: 20, fontSize: 14 }}>Escolha ou crie uma personalizada</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
            {SUGESTOES.map(s => (
              <div key={s.nome} onClick={() => { setNome(s.nome); setValor(s.valor || ""); }} style={{
                background: nome === s.nome ? `${C.orange}18` : C.surface,
                border: `1px solid ${nome === s.nome ? C.orange : C.border}`,
                borderRadius: 14, padding: "16px 12px", cursor: "pointer", textAlign: "center",
                transition: "all 0.15s",
              }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>{s.icon}</div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: C.white }}>{s.nome}</p>
                {s.valor && <p style={{ margin: "3px 0 0", fontSize: 11, color: C.mid, fontFamily: "'DM Mono', monospace" }}>~R${s.valor}</p>}
              </div>
            ))}
          </div>
          <Input label="Nome do cofre" value={nome} onChange={setNome} placeholder="Ex: IPVA 2027" />
          <Input label="Valor (R$)" value={valor} onChange={setValor} type="number" placeholder="1800" />
          <Input label="Prazo" value={prazo} onChange={setPrazo} type="date" />
          {valor && prazo && (
            <div style={{ background: `${C.orange}10`, border: `1px solid ${C.orange}25`, borderRadius: 12, padding: "12px 14px", marginBottom: 16 }}>
              <p style={{ margin: 0, fontSize: 12, color: C.orange }}>
                💡 Guarde <strong>R$ {Math.ceil(Number(valor) / Math.max(1, dias(prazo)))}/dia</strong> para atingir a meta no prazo
              </p>
            </div>
          )}
          <Btn full onClick={() => setStep(1)} disabled={!nome || !valor || !prazo}>Próximo →</Btn>
        </>
      )}

      {/* Step 1: tipo de bloqueio */}
      {step === 1 && (
        <>
          <h2 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 700, color: C.white }}>Tipo de bloqueio</h2>
          <p style={{ color: C.mid, marginBottom: 20, fontSize: 14 }}>Escolha o nível de comprometimento</p>
          {[
            {
              type: "carencia",
              icon: "🔒",
              title: "Bloqueio real — CDB",
              desc: "Dinheiro rende CDI. Se sacar antes do prazo, perde os últimos 30 dias de rendimento. Mais disciplina, mais recompensa.",
              color: C.purple,
              tag: "Recomendado",
            },
            {
              type: "psicologico",
              icon: "🧠",
              title: "Bloqueio psicológico",
              desc: "Pode sacar quando quiser, mas o app cria fricção emocional: streak zerado, guardião notificado, título perdido.",
              color: C.orange,
              tag: "Mais flexível",
            },
          ].map(opt => (
            <div key={opt.type} onClick={() => setLockType(opt.type)} style={{
              background: lockType === opt.type ? `${opt.color}14` : C.surface,
              border: `1px solid ${lockType === opt.type ? opt.color : C.border}`,
              borderRadius: 16, padding: "18px 16px", marginBottom: 12, cursor: "pointer",
              transition: "all 0.2s",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ fontSize: 24 }}>{opt.icon}</span>
                  <span style={{ fontWeight: 700, fontSize: 14, color: C.white }}>{opt.title}</span>
                </div>
                <Tag color={opt.color}>{opt.tag}</Tag>
              </div>
              <p style={{ margin: 0, fontSize: 12, color: C.mid, lineHeight: 1.6 }}>{opt.desc}</p>
            </div>
          ))}
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <Btn ghost small onClick={() => setStep(0)}>← Voltar</Btn>
            <Btn full onClick={() => setStep(2)}>Próximo →</Btn>
          </div>
        </>
      )}

      {/* Step 2: guardião */}
      {step === 2 && (
        <>
          <h2 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 700, color: C.white }}>Escolha um guardião</h2>
          <p style={{ color: C.mid, marginBottom: 8, fontSize: 14 }}>Alguém de confiança que será notificado se você tentar sacar antes do prazo</p>
          <div style={{ background: `${C.yellow}10`, border: `1px solid ${C.yellow}25`, borderRadius: 12, padding: "12px 14px", marginBottom: 18 }}>
            <p style={{ margin: 0, fontSize: 12, color: C.yellow }}>
              👥 O comprometimento público é o mecanismo de disciplina mais poderoso que existe. Pessoas que declaram metas publicamente têm <strong>3x mais chance</strong> de cumpri-las.
            </p>
          </div>
          <Input label="Nome do guardião" value={guardiao} onChange={setGuardiao} placeholder="Ex: Maria (esposa)" />
          <p style={{ fontSize: 11, color: C.dim, marginBottom: 18 }}>Opcional — mas muito recomendado</p>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn ghost small onClick={() => setStep(1)}>← Voltar</Btn>
            <Btn full onClick={() => setStep(3)}>Próximo →</Btn>
          </div>
        </>
      )}

      {/* Step 3: foto */}
      {step === 3 && (
        <>
          <h2 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 700, color: C.white }}>Foto da meta</h2>
          <p style={{ color: C.mid, marginBottom: 8, fontSize: 14 }}>Visualizar o objetivo aumenta o comprometimento em até 2x</p>
          <div style={{ background: `${C.teal}10`, border: `1px solid ${C.teal}25`, borderRadius: 12, padding: "12px 14px", marginBottom: 20 }}>
            <p style={{ margin: 0, fontSize: 12, color: C.teal }}>
              🖼️ Essa foto aparecerá toda vez que você abrir o cofre — uma lembrança visual do <strong>porquê</strong> você está guardando.
            </p>
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => {
            const f = e.target.files[0];
            if (f) setFotoPreview(URL.createObjectURL(f));
          }} />
          {fotoPreview ? (
            <div style={{ position: "relative", marginBottom: 20 }}>
              <img src={fotoPreview} alt="Meta" style={{ width: "100%", height: 180, objectFit: "cover", borderRadius: 14 }} />
              <button onClick={() => setFotoPreview(null)} style={{
                position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.7)",
                border: "none", color: "#fff", borderRadius: "50%", width: 28, height: 28, cursor: "pointer",
              }}>✕</button>
            </div>
          ) : (
            <button onClick={() => fileRef.current.click()} style={{
              width: "100%", background: C.surface, border: `2px dashed ${C.border}`,
              borderRadius: 14, padding: "36px 20px", color: C.mid,
              fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600,
              cursor: "pointer", textAlign: "center", marginBottom: 20,
            }}>
              📷 Adicionar foto da meta
              <p style={{ margin: "6px 0 0", fontSize: 12, fontWeight: 400 }}>Seu carro, destino de viagem, etc.</p>
            </button>
          )}
          <p style={{ fontSize: 11, color: C.dim, marginBottom: 18, textAlign: "center" }}>Opcional — mas recomendado</p>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn ghost small onClick={() => setStep(2)}>← Voltar</Btn>
            <Btn full onClick={criar} disabled={!nome || !valor || !prazo || criando} color={C.teal}>
              {criando ? "Criando subconta..." : "Criar cofre 🔒"}
            </Btn>
          </div>
        </>
      )}
    </div>
  );
}

/* ─── DEPOSITO MODAL ─────────────────────────────────────────────────────── */
function DepositoModal({ cofre, onClose }) {
  const [valor, setValor] = useState("");
  const [step, setStep] = useState(0);
  const [copiado, setCopiado] = useState(false);
  function copiar() { setCopiado(true); setTimeout(() => setCopiado(false), 2000); }

  return (
    <Modal onClose={onClose}>
      {step === 0 && (
        <>
          <h3 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700, color: C.white }}>Depositar no cofre</h3>
          <p style={{ color: C.mid, marginBottom: 22, fontSize: 13 }}>{cofre.icon} {cofre.nome}</p>
          <p style={{ margin: "0 0 10px", fontSize: 11, color: C.mid, letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 600 }}>Valor rápido</p>
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            {[20, 50, 100, 200].map(v => (
              <button key={v} onClick={() => setValor(String(v))} style={{
                flex: 1, padding: "11px 0", borderRadius: 10, border: "none",
                background: valor === String(v) ? C.orange : C.surface,
                color: valor === String(v) ? "#fff" : C.mid,
                fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer",
                transition: "all 0.15s",
              }}>R${v}</button>
            ))}
          </div>
          <Input value={valor} onChange={setValor} type="number" placeholder="Outro valor" />

          {/* % corrida suggestion */}
          <div style={{ background: `${C.orange}10`, border: `1px solid ${C.orange}25`, borderRadius: 12, padding: "12px 14px", marginBottom: 18 }}>
            <p style={{ margin: "0 0 8px", fontSize: 12, color: C.orange, fontWeight: 700 }}>⚡ Sugestão por porcentagem</p>
            <div style={{ display: "flex", gap: 8 }}>
              {["5%", "10%", "15%"].map(p => (
                <button key={p} onClick={() => setValor(String(Math.round(cofre.saldo * (parseInt(p) / 100))))} style={{
                  flex: 1, padding: "8px 0", borderRadius: 8, border: `1px solid ${C.orange}44`,
                  background: "transparent", color: C.orange,
                  fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 12, cursor: "pointer",
                }}>{p} dos ganhos</button>
              ))}
            </div>
          </div>
          <Btn full onClick={() => setStep(1)} disabled={!valor}>Ver Pix para depositar →</Btn>
        </>
      )}
      {step === 1 && (
        <>
          <h3 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700, color: C.white }}>Envie o Pix</h3>
          <p style={{ color: C.mid, marginBottom: 20, fontSize: 13 }}>Copie a chave e transfira pelo seu banco</p>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 12, color: C.mid }}>Chave Pix exclusiva</span>
              <button onClick={copiar} style={{
                background: "none", border: "none",
                color: copiado ? C.teal : C.orange,
                fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 12, cursor: "pointer",
              }}>{copiado ? "✓ Copiado!" : "Copiar"}</button>
            </div>
            <p style={{ margin: 0, fontFamily: "'DM Mono', monospace", fontSize: 13, color: C.white, wordBreak: "break-all" }}>
              {cofre.chave || "cofre-PIX-8A3F2C"}
            </p>
          </div>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, marginBottom: 22 }}>
            {[["Valor", fmtR(Number(valor))], ["Cofre", cofre.nome], ["Subconta", "Celcoin · ativa"], ["Rendimento", "100% CDI"]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 12, color: C.mid }}>{k}</span>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: C.white }}>{v}</span>
              </div>
            ))}
          </div>
          <Btn full onClick={onClose} color={C.teal}>Já enviei o Pix ✓</Btn>
          <p style={{ textAlign: "center", color: C.dim, fontSize: 11, marginTop: 10 }}>
            Saldo atualizado em até 10 segundos após o Pix
          </p>
        </>
      )}
    </Modal>
  );
}

/* ─── RESGATE MODAL ──────────────────────────────────────────────────────── */
function ResgateModal({ cofre, onClose }) {
  const [chave, setChave] = useState("");
  const [step, setStep] = useState(0);
  function processar() { setTimeout(() => setStep(1), 1800); setStep("loading"); }

  return (
    <Modal onClose={onClose}>
      {step === 0 && (
        <>
          <div style={{ textAlign: "center", marginBottom: 22 }}>
            <div style={{ fontSize: 52, marginBottom: 10 }}>🎉</div>
            <h3 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.white }}>Meta atingida!</h3>
            <p style={{ color: C.mid, marginTop: 6, fontSize: 13 }}>Parabéns! Você foi disciplinado e chegou lá.</p>
          </div>
          <div style={{ background: `${C.teal}10`, border: `1px solid ${C.teal}30`, borderRadius: 14, padding: 18, marginBottom: 20 }}>
            <p style={{ margin: "0 0 4px", fontSize: 11, color: C.teal, letterSpacing: 1, textTransform: "uppercase" }}>Total guardado</p>
            <p style={{ margin: 0, fontSize: 36, fontWeight: 700, color: C.teal, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 1 }}>
              {fmtR(cofre.saldo)}
            </p>
            <p style={{ margin: "6px 0 0", fontSize: 12, color: C.mid }}>+ rendimento CDI do período</p>
          </div>
          <Input label="Sua chave Pix para receber" value={chave} onChange={setChave} placeholder="CPF, telefone ou e-mail" />
          <Btn full onClick={processar} disabled={!chave} color={C.teal}>Resgatar agora 💸</Btn>
        </>
      )}
      {step === "loading" && (
        <div style={{ textAlign: "center", padding: "30px 0" }}>
          <div style={{ fontSize: 44, marginBottom: 12, animation: "pulse 1s infinite" }}>⏳</div>
          <p style={{ color: C.mid }}>Processando Pix...</p>
        </div>
      )}
      {step === 1 && (
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <div style={{ fontSize: 60, marginBottom: 14 }}>✅</div>
          <h3 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.teal }}>Pix enviado!</h3>
          <p style={{ color: C.mid, marginTop: 8, fontSize: 13, lineHeight: 1.6 }}>
            {fmtR(cofre.saldo)} a caminho da sua conta.<br />Obrigado por confiar no Cofre!
          </p>
          <div style={{ marginTop: 24 }}>
            <Btn full onClick={onClose}>Fechar</Btn>
          </div>
        </div>
      )}
    </Modal>
  );
}

/* ─── BOTTOM NAV ─────────────────────────────────────────────────────────── */
function BottomNav() {
  const [active, setActive] = useState("cofres");
  return (
    <div style={{
      position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
      width: "100%", maxWidth: 430,
      background: "rgba(8,8,16,0.95)", backdropFilter: "blur(20px)",
      borderTop: `1px solid ${C.border}`, padding: "10px 0 26px",
      display: "flex", justifyContent: "space-around", zIndex: 20,
    }}>
      {[["🏦", "cofres"], ["📊", "metas"], ["⚙️", "config"]].map(([ic, id]) => (
        <button key={id} onClick={() => setActive(id)} style={{
          background: "none", border: "none",
          color: active === id ? C.orange : C.dim,
          fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700,
          cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
          letterSpacing: 0.5, textTransform: "capitalize",
          transition: "color 0.2s",
        }}>
          <span style={{ fontSize: 22 }}>{ic}</span>{id}
        </button>
      ))}
    </div>
  );
}

/* ─── APP ROOT ───────────────────────────────────────────────────────────── */
export default function App() {
  const [screen, setScreen] = useState("home");
  const [cofres, setCofres] = useState(INITIAL_COFRES);
  const [sel, setSel] = useState(null);
  const [modal, setModal] = useState(null);

  function criarCofre(data) {
    setCofres(prev => [...prev, {
      id: Date.now(), nome: data.nome, icon: "🎯", foto: null,
      meta: data.valor, saldo: 0, prazo: data.prazo,
      streak: 0, lockType: data.lockType, lockDays: data.lockType === "carencia" ? 180 : 0,
      status: "ativo", guardiao: data.guardiao || null,
      historico: [0, 0, 0, 0, 0, 0, 0, 0, 0],
      chave: "cofre-" + Math.random().toString(36).substr(2, 8).toUpperCase(),
    }]);
    setScreen("home");
  }

  return (
    <div style={{
      minHeight: "100vh", background: C.bg,
      fontFamily: "'DM Sans', sans-serif", color: C.white,
      maxWidth: 430, margin: "0 auto", position: "relative",
    }}>
      <FontLink />
      <style>{`
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        input::placeholder { color: #444455; }
        @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
        ::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Ambient */}
      <div style={{ position: "fixed", top: -80, left: -60, width: 260, height: 260, background: `radial-gradient(circle, ${C.orange}10 0%, transparent 70%)`, pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: 60, right: -50, width: 220, height: 220, background: `radial-gradient(circle, ${C.teal}08 0%, transparent 70%)`, pointerEvents: "none", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        {screen === "home" && (
          <>
            <HomeScreen
              cofres={cofres}
              onNovo={() => setScreen("novo")}
              onCofre={c => { setSel(c); setScreen("detalhe"); }}
              onResgate={c => { setSel(c); setModal("resgate"); }}
            />
            <BottomNav />
          </>
        )}
        {screen === "novo" && <NovoCofre onCriar={criarCofre} onVoltar={() => setScreen("home")} />}
        {screen === "detalhe" && sel && (
          <DetalheCofre
            cofre={sel}
            onVoltar={() => setScreen("home")}
            onDepositar={() => setModal("deposito")}
          />
        )}
      </div>

      {modal === "deposito" && sel && <DepositoModal cofre={sel} onClose={() => setModal(null)} />}
      {modal === "resgate" && sel && <ResgateModal cofre={sel} onClose={() => { setModal(null); setScreen("home"); }} />}
    </div>
  );
}