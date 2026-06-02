import { useState } from "react";

const goals = [
  { id: 1, icon: "🚗", name: "IPVA 2027", target: 1800, saved: 1240, color: "#FF6B35", deadline: "Jan/2027" },
  { id: 2, icon: "✈️", name: "Viagem Nordeste", target: 3000, saved: 870, color: "#00C9A7", deadline: "Jul/2026" },
  { id: 3, icon: "🔧", name: "Revisão do Carro", target: 600, saved: 600, color: "#FFD93D", deadline: "Jun/2026" },
  { id: 4, icon: "📱", name: "Celular Novo", target: 2000, saved: 320, color: "#845EF7", deadline: "Dez/2026" },
];

const recentDeposits = [
  { date: "Hoje, 22:14", goal: "IPVA 2027", amount: 50, icon: "🚗" },
  { date: "Ontem, 18:30", goal: "Viagem Nordeste", amount: 30, icon: "✈️" },
  { date: "25/05, 09:12", goal: "IPVA 2027", amount: 100, icon: "🚗" },
  { date: "23/05, 21:45", goal: "Celular Novo", amount: 20, icon: "📱" },
];

function ProgressRing({ percent, color, size = 80 }) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={6} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={6}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1s ease" }}
      />
    </svg>
  );
}

export default function CofreMotorista() {
  const [activeTab, setActiveTab] = useState("cofres");
  const [depositModal, setDepositModal] = useState(null);
  const [depositValue, setDepositValue] = useState("");
  const [selectedGoal, setSelectedGoal] = useState(goals[0]);
  const [successAnim, setSuccessAnim] = useState(false);

  const totalSaved = goals.reduce((a, g) => a + g.saved, 0);
  const totalTarget = goals.reduce((a, g) => a + g.target, 0);

  function handleDeposit() {
    setSuccessAnim(true);
    setTimeout(() => {
      setSuccessAnim(false);
      setDepositModal(null);
      setDepositValue("");
    }, 1800);
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0D0D14",
      fontFamily: "'Syne', sans-serif",
      color: "#F0EDE8",
      maxWidth: 420,
      margin: "0 auto",
      position: "relative",
      overflow: "hidden",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />

      {/* Background glow */}
      <div style={{
        position: "fixed", top: -120, left: -80, width: 300, height: 300,
        background: "radial-gradient(circle, rgba(255,107,53,0.15) 0%, transparent 70%)",
        pointerEvents: "none", zIndex: 0,
      }} />
      <div style={{
        position: "fixed", bottom: 80, right: -60, width: 250, height: 250,
        background: "radial-gradient(circle, rgba(132,94,247,0.12) 0%, transparent 70%)",
        pointerEvents: "none", zIndex: 0,
      }} />

      {/* Header */}
      <div style={{ padding: "52px 24px 20px", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <div>
            <p style={{ color: "#888", fontSize: 13, margin: 0, letterSpacing: 2, textTransform: "uppercase" }}>Olá, João 👋</p>
            <h1 style={{ margin: "4px 0 0", fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>Meu Cofre</h1>
          </div>
          <div style={{
            width: 44, height: 44, borderRadius: "50%",
            background: "linear-gradient(135deg, #FF6B35, #FF3E00)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, boxShadow: "0 4px 20px rgba(255,107,53,0.4)",
          }}>🚕</div>
        </div>

        {/* Total card */}
        <div style={{
          background: "linear-gradient(135deg, #1A1A2E 0%, #16213E 100%)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 20, padding: "24px 24px 20px",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: -20, right: -20, width: 100, height: 100,
            background: "radial-gradient(circle, rgba(255,107,53,0.2) 0%, transparent 70%)",
          }} />
          <p style={{ color: "#666", fontSize: 12, letterSpacing: 2, textTransform: "uppercase", margin: "0 0 8px" }}>Total guardado</p>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span style={{ fontSize: 13, color: "#888", fontFamily: "'DM Mono', monospace" }}>R$</span>
            <span style={{ fontSize: 42, fontWeight: 800, letterSpacing: -2, lineHeight: 1 }}>
              {totalSaved.toLocaleString("pt-BR")}
            </span>
          </div>
          <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2 }}>
              <div style={{
                height: "100%", borderRadius: 2,
                width: `${(totalSaved / totalTarget) * 100}%`,
                background: "linear-gradient(90deg, #FF6B35, #FFD93D)",
                transition: "width 1s ease",
              }} />
            </div>
            <span style={{ fontSize: 12, color: "#888", fontFamily: "'DM Mono', monospace", whiteSpace: "nowrap" }}>
              {Math.round((totalSaved / totalTarget) * 100)}% da meta total
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", padding: "0 24px", gap: 8, position: "relative", zIndex: 1, marginBottom: 20 }}>
        {["cofres", "histórico"].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: "8px 20px", borderRadius: 100, border: "none", cursor: "pointer",
            fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: 13, letterSpacing: 0.5,
            background: activeTab === tab ? "#FF6B35" : "rgba(255,255,255,0.06)",
            color: activeTab === tab ? "#fff" : "#666",
            transition: "all 0.2s ease",
            textTransform: "capitalize",
          }}>{tab}</button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: "0 24px 100px", position: "relative", zIndex: 1 }}>
        {activeTab === "cofres" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {goals.map((g) => {
              const pct = Math.min(100, Math.round((g.saved / g.target) * 100));
              const done = pct >= 100;
              return (
                <div key={g.id} style={{
                  background: done
                    ? "linear-gradient(135deg, rgba(0,201,167,0.12), rgba(0,201,167,0.04))"
                    : "rgba(255,255,255,0.04)",
                  border: `1px solid ${done ? "rgba(0,201,167,0.25)" : "rgba(255,255,255,0.06)"}`,
                  borderRadius: 18, padding: "18px 18px 18px 20px",
                  display: "flex", alignItems: "center", gap: 16,
                  cursor: "pointer",
                  transition: "transform 0.15s ease, box-shadow 0.15s ease",
                }}
                  onClick={() => { setSelectedGoal(g); setDepositModal(true); }}
                  onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
                >
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <ProgressRing percent={pct} color={done ? "#00C9A7" : g.color} size={72} />
                    <div style={{
                      position: "absolute", inset: 0, display: "flex",
                      alignItems: "center", justifyContent: "center",
                      fontSize: 24, transform: "rotate(90deg)",
                    }}>{done ? "✅" : g.icon}</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <span style={{ fontWeight: 700, fontSize: 15 }}>{g.name}</span>
                      <span style={{
                        fontSize: 10, fontWeight: 700, letterSpacing: 1,
                        color: done ? "#00C9A7" : g.color,
                        background: done ? "rgba(0,201,167,0.15)" : `${g.color}22`,
                        padding: "3px 8px", borderRadius: 100,
                      }}>{done ? "COMPLETO" : `${pct}%`}</span>
                    </div>
                    <div style={{ marginTop: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: "#ccc" }}>
                        R$ {g.saved.toLocaleString("pt-BR")}
                        <span style={{ color: "#555" }}> / {g.target.toLocaleString("pt-BR")}</span>
                      </span>
                      <span style={{ fontSize: 11, color: "#555" }}>📅 {g.deadline}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Add new goal */}
            <button style={{
              background: "transparent", border: "2px dashed rgba(255,255,255,0.1)",
              borderRadius: 18, padding: 18, color: "#555", fontFamily: "'Syne', sans-serif",
              fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center", gap: 8,
              transition: "border-color 0.2s, color 0.2s",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#FF6B35"; e.currentTarget.style.color = "#FF6B35"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#555"; }}
            >
              <span style={{ fontSize: 20 }}>+</span> Criar novo cofre
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <p style={{ color: "#555", fontSize: 12, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>Últimos depósitos</p>
            {recentDeposits.map((d, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.04)",
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12, fontSize: 18,
                  background: "rgba(255,255,255,0.05)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>{d.icon}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{d.goal}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: "#555" }}>{d.date}</p>
                </div>
                <span style={{
                  fontFamily: "'DM Mono', monospace", fontSize: 15, fontWeight: 500,
                  color: "#00C9A7",
                }}>+R$ {d.amount}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 420,
        background: "rgba(13,13,20,0.9)", backdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: "12px 0 24px", display: "flex", justifyContent: "space-around",
        zIndex: 10,
      }}>
        {[["🏦", "Cofres"], ["📊", "Metas"], ["⚙️", "Config"]].map(([icon, label]) => (
          <button key={label} style={{
            background: "transparent", border: "none", color: label === "Cofres" ? "#FF6B35" : "#444",
            fontFamily: "'Syne', sans-serif", fontSize: 11, fontWeight: 600, cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
          }}>
            <span style={{ fontSize: 22 }}>{icon}</span>
            {label}
          </button>
        ))}
      </div>

      {/* Deposit Modal */}
      {depositModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(8px)", zIndex: 50,
          display: "flex", alignItems: "flex-end", justifyContent: "center",
        }} onClick={() => setDepositModal(null)}>
          <div style={{
            background: "#141420", borderRadius: "24px 24px 0 0",
            padding: "28px 24px 48px", width: "100%", maxWidth: 420,
            border: "1px solid rgba(255,255,255,0.08)",
          }} onClick={e => e.stopPropagation()}>
            {successAnim ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ fontSize: 60, marginBottom: 12 }}>🎉</div>
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#00C9A7" }}>Guardado com sucesso!</h3>
                <p style={{ color: "#555", marginTop: 8 }}>Continue assim, você chega lá!</p>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                  <span style={{ fontSize: 32 }}>{selectedGoal.icon}</span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>{selectedGoal.name}</h3>
                    <p style={{ margin: "4px 0 0", fontSize: 12, color: "#555" }}>
                      Falta R$ {(selectedGoal.target - selectedGoal.saved).toLocaleString("pt-BR")} para completar
                    </p>
                  </div>
                </div>
                <p style={{ color: "#666", fontSize: 12, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>Quanto guardar agora?</p>
                <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                  {[20, 50, 100, 200].map(v => (
                    <button key={v} onClick={() => setDepositValue(String(v))} style={{
                      flex: 1, padding: "10px 0", borderRadius: 10,
                      background: depositValue === String(v) ? "#FF6B35" : "rgba(255,255,255,0.06)",
                      border: "none", color: depositValue === String(v) ? "#fff" : "#888",
                      fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13,
                      cursor: "pointer", transition: "all 0.15s",
                    }}>R${v}</button>
                  ))}
                </div>
                <div style={{
                  display: "flex", alignItems: "center", gap: 10,
                  background: "rgba(255,255,255,0.04)", borderRadius: 12,
                  padding: "14px 16px", marginBottom: 20,
                  border: "1px solid rgba(255,255,255,0.08)",
                }}>
                  <span style={{ color: "#555", fontFamily: "'DM Mono', monospace" }}>R$</span>
                  <input
                    type="number" value={depositValue}
                    onChange={e => setDepositValue(e.target.value)}
                    placeholder="Outro valor"
                    style={{
                      background: "transparent", border: "none", outline: "none",
                      color: "#F0EDE8", fontFamily: "'DM Mono', monospace",
                      fontSize: 18, flex: 1, fontWeight: 500,
                    }}
                  />
                </div>
                <button onClick={handleDeposit} disabled={!depositValue} style={{
                  width: "100%", padding: "16px", borderRadius: 14, border: "none",
                  background: depositValue ? "linear-gradient(135deg, #FF6B35, #FF3E00)" : "rgba(255,255,255,0.06)",
                  color: depositValue ? "#fff" : "#444",
                  fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 16,
                  cursor: depositValue ? "pointer" : "not-allowed",
                  boxShadow: depositValue ? "0 8px 30px rgba(255,107,53,0.35)" : "none",
                  transition: "all 0.2s ease",
                }}>
                  🔒 Guardar no cofre
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
