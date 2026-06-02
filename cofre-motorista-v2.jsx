import { useState, useEffect } from "react";

// ─── DATA ────────────────────────────────────────────────────────────────────
const METAS_SUGERIDAS = [
  { icon: "🚗", nome: "IPVA", valor: 1800, meses: 8 },
  { icon: "🔧", nome: "Revisão", valor: 600, meses: 3 },
  { icon: "🛡️", nome: "Seguro", valor: 2400, meses: 10 },
  { icon: "✈️", nome: "Viagem", valor: 3000, meses: 12 },
  { icon: "📱", nome: "Celular", valor: 2000, meses: 6 },
  { icon: "🎯", nome: "Outra meta", valor: null, meses: null },
];

const INITIAL_COFRES = [
  { id: 1, icon: "🚗", nome: "IPVA 2027", meta: 1800, saldo: 1240, prazo: "2027-01-10", chave: "PIX-COFRE-001", status: "ativo", streak: 18 },
  { id: 2, icon: "🔧", nome: "Revisão Junho", meta: 600, saldo: 600, prazo: "2026-06-15", chave: "PIX-COFRE-002", status: "completo", streak: 24 },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function pct(saldo, meta) { return Math.min(100, Math.round((saldo / meta) * 100)); }
function fmtBRL(v) { return v.toLocaleString("pt-BR", { minimumFractionDigits: 2 }); }
function diasRestantes(prazo) {
  const d = Math.ceil((new Date(prazo) - new Date()) / 86400000);
  return d > 0 ? d : 0;
}

// ─── SUB-COMPONENTS ──────────────────────────────────────────────────────────
function Ring({ p, color, size = 76 }) {
  const r = (size - 10) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={5}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={5}
        strokeDasharray={c} strokeDashoffset={c - (p/100)*c} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)" }}/>
    </svg>
  );
}

function Pill({ children, color = "#FF6B35", bg }) {
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase",
      color, background: bg || `${color}22`, padding: "3px 10px", borderRadius: 100,
    }}>{children}</span>
  );
}

function Btn({ children, onClick, disabled, full, ghost, small, color = "#FF6B35" }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: full ? "100%" : "auto",
      padding: small ? "10px 20px" : "15px 24px",
      borderRadius: 14, border: ghost ? `1.5px solid rgba(255,255,255,0.12)` : "none",
      background: ghost ? "transparent" : disabled ? "rgba(255,255,255,0.06)" : `linear-gradient(135deg, ${color}, ${color}cc)`,
      color: ghost ? "#888" : disabled ? "#444" : "#fff",
      fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: small ? 13 : 15,
      cursor: disabled ? "not-allowed" : "pointer",
      boxShadow: (!ghost && !disabled) ? `0 8px 28px ${color}44` : "none",
      transition: "all 0.2s ease", letterSpacing: 0.3,
    }}>{children}</button>
  );
}

function Input({ label, value, onChange, type = "text", placeholder }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <p style={{ margin: "0 0 8px", fontSize: 12, color: "#666", letterSpacing: 1.5, textTransform: "uppercase" }}>{label}</p>}
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{
          width: "100%", padding: "14px 16px", borderRadius: 12, boxSizing: "border-box",
          background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
          color: "#F0EDE8", fontFamily: "'DM Mono', monospace", fontSize: 15,
          outline: "none",
        }}
      />
    </div>
  );
}

// ─── SCREENS ─────────────────────────────────────────────────────────────────

function SplashScreen({ onNext }) {
  useEffect(() => { setTimeout(onNext, 2200); }, []);
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100vh", gap:16 }}>
      <div style={{
        width: 88, height: 88, borderRadius: 28,
        background: "linear-gradient(135deg, #FF6B35 0%, #FF3E00 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 44, boxShadow: "0 20px 60px rgba(255,107,53,0.45)",
        animation: "pulse 1.8s ease infinite",
      }}>🔒</div>
      <h1 style={{ fontSize: 32, fontWeight: 800, margin: 0, letterSpacing: -1 }}>Cofre</h1>
      <p style={{ color: "#555", margin: 0, fontSize: 14, letterSpacing: 2 }}>PARA MOTORISTAS</p>
      <style>{`@keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.06)} }`}</style>
    </div>
  );
}

function LoginScreen({ onLogin }) {
  const [tel, setTel] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  function handle() {
    setLoading(true);
    setTimeout(() => { setLoading(false); onLogin(); }, 1200);
  }
  return (
    <div style={{ padding: "60px 24px 40px", display: "flex", flexDirection: "column", height: "100vh", boxSizing: "border-box" }}>
      <div style={{ marginBottom: 40 }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>🔒</div>
        <h2 style={{ margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: -0.5 }}>Entrar</h2>
        <p style={{ color: "#555", margin: "6px 0 0", fontSize: 14 }}>Seu cofre está esperando por você</p>
      </div>
      <Input label="Telefone" value={tel} onChange={setTel} type="tel" placeholder="(11) 99999-9999" />
      <Input label="Senha" value={senha} onChange={setSenha} type="password" placeholder="••••••••" />
      <div style={{ marginTop: 8 }}>
        <Btn full onClick={handle} disabled={!tel || !senha || loading}>
          {loading ? "Entrando..." : "Entrar →"}
        </Btn>
      </div>
      <p style={{ textAlign: "center", color: "#444", fontSize: 13, marginTop: 20 }}>
        Não tem conta? <span style={{ color: "#FF6B35", fontWeight: 700, cursor: "pointer" }}>Cadastrar grátis</span>
      </p>
    </div>
  );
}

function OnboardingFintech({ onAutorizar, onPular }) {
  return (
    <div style={{ padding: "60px 24px 40px", display: "flex", flexDirection: "column", height: "100vh", boxSizing: "border-box" }}>
      <div style={{ flex: 1 }}>
        <div style={{
          width: 72, height: 72, borderRadius: 22,
          background: "linear-gradient(135deg, #00C9A7, #00968a)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 36, marginBottom: 28,
          boxShadow: "0 12px 40px rgba(0,201,167,0.35)",
        }}>🏦</div>
        <h2 style={{ margin: "0 0 12px", fontSize: 26, fontWeight: 800, letterSpacing: -0.5 }}>
          Seu dinheiro fica<br/>separado de verdade
        </h2>
        <p style={{ color: "#666", lineHeight: 1.7, fontSize: 15, margin: "0 0 32px" }}>
          Cada cofre tem uma <strong style={{ color: "#F0EDE8" }}>subconta exclusiva</strong> — o dinheiro sai da sua conta corrente e vai para um lugar separado, onde você não vê no dia a dia.
        </p>

        {[
          ["🔐", "Dinheiro fora da vista", "Some da conta corrente, fica na subconta do cofre"],
          ["📲", "Depósito via Pix", "Cada cofre tem uma chave Pix única e exclusiva"],
          ["💸", "Resgate quando quiser", "Na data ou antes — você decide, a gente processa"],
        ].map(([ic, t, d]) => (
          <div key={t} style={{ display:"flex", gap:14, marginBottom:20, alignItems:"flex-start" }}>
            <div style={{
              width:44, height:44, borderRadius:12, flexShrink:0,
              background:"rgba(255,255,255,0.05)",
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:20,
            }}>{ic}</div>
            <div>
              <p style={{ margin:0, fontWeight:700, fontSize:14 }}>{t}</p>
              <p style={{ margin:"3px 0 0", color:"#555", fontSize:13 }}>{d}</p>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        <Btn full onClick={onAutorizar} color="#00C9A7">Entendi, quero começar 🚀</Btn>
        <Btn full ghost onClick={onPular}>Configurar depois</Btn>
      </div>
    </div>
  );
}

function HomeScreen({ cofres, onNovoCofre, onCofre, onResgate }) {
  const total = cofres.reduce((a, c) => a + c.saldo, 0);
  const totalMeta = cofres.reduce((a, c) => a + c.meta, 0);
  const [tab, setTab] = useState("cofres");

  return (
    <div style={{ paddingBottom: 90 }}>
      {/* Header */}
      <div style={{ padding: "52px 24px 0", position:"relative" }}>
        <div style={{
          position:"absolute", top:0, right:0, width:200, height:200,
          background:"radial-gradient(circle, rgba(255,107,53,0.12) 0%, transparent 70%)",
          pointerEvents:"none",
        }}/>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
          <div>
            <p style={{ margin:0, color:"#555", fontSize:12, letterSpacing:2, textTransform:"uppercase" }}>Bem-vindo de volta</p>
            <h2 style={{ margin:"4px 0 0", fontSize:22, fontWeight:800 }}>João Silva 🚕</h2>
          </div>
          <div style={{
            width:42, height:42, borderRadius:"50%",
            background:"linear-gradient(135deg,#FF6B35,#FF3E00)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:18, fontWeight:800, color:"#fff",
            boxShadow:"0 4px 16px rgba(255,107,53,0.4)",
          }}>JS</div>
        </div>

        {/* Saldo total */}
        <div style={{
          background:"linear-gradient(135deg,#1C1C2E,#16213E)",
          borderRadius:22, padding:"24px", marginBottom:24,
          border:"1px solid rgba(255,255,255,0.07)",
          position:"relative", overflow:"hidden",
        }}>
          <div style={{
            position:"absolute", bottom:-30, right:-30, width:120, height:120,
            background:"radial-gradient(circle,rgba(255,107,53,0.18) 0%,transparent 70%)",
          }}/>
          <p style={{ margin:"0 0 6px", color:"#555", fontSize:11, letterSpacing:2, textTransform:"uppercase" }}>Total guardado</p>
          <div style={{ display:"flex", alignItems:"baseline", gap:6, marginBottom:16 }}>
            <span style={{ color:"#666", fontFamily:"'DM Mono',monospace", fontSize:14 }}>R$</span>
            <span style={{ fontSize:44, fontWeight:800, letterSpacing:-2, lineHeight:1 }}>{fmtBRL(total)}</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ flex:1, height:5, background:"rgba(255,255,255,0.07)", borderRadius:3 }}>
              <div style={{
                height:"100%", borderRadius:3,
                width:`${pct(total,totalMeta)}%`,
                background:"linear-gradient(90deg,#FF6B35,#FFD93D)",
                transition:"width 1s ease",
              }}/>
            </div>
            <span style={{ color:"#555", fontSize:12, fontFamily:"'DM Mono',monospace", whiteSpace:"nowrap" }}>
              {pct(total,totalMeta)}% das metas
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", gap:8, marginBottom:20 }}>
          {["cofres","histórico"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding:"8px 18px", borderRadius:100, border:"none", cursor:"pointer",
              fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:12, letterSpacing:0.5,
              background: tab===t ? "#FF6B35" : "rgba(255,255,255,0.06)",
              color: tab===t ? "#fff" : "#555",
              transition:"all 0.2s", textTransform:"capitalize",
            }}>{t}</button>
          ))}
        </div>
      </div>

      {/* Cofres */}
      {tab === "cofres" && (
        <div style={{ padding:"0 24px", display:"flex", flexDirection:"column", gap:14 }}>
          {cofres.map(c => {
            const p = pct(c.saldo, c.meta);
            const done = c.status === "completo";
            const dias = diasRestantes(c.prazo);
            return (
              <div key={c.id} onClick={() => done ? onResgate(c) : onCofre(c)} style={{
                background: done ? "rgba(0,201,167,0.07)" : "rgba(255,255,255,0.04)",
                border:`1px solid ${done ? "rgba(0,201,167,0.2)" : "rgba(255,255,255,0.06)"}`,
                borderRadius:20, padding:"18px 18px 16px",
                display:"flex", alignItems:"center", gap:16, cursor:"pointer",
                transition:"transform 0.15s",
              }}
                onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"}
                onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}
              >
                <div style={{ position:"relative", flexShrink:0 }}>
                  <Ring p={p} color={done?"#00C9A7":p>70?"#FFD93D":"#FF6B35"} size={72}/>
                  <div style={{
                    position:"absolute", inset:0, display:"flex",
                    alignItems:"center", justifyContent:"center",
                    fontSize:24, transform:"rotate(90deg)",
                  }}>{done?"✅":c.icon}</div>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                    <span style={{ fontWeight:800, fontSize:15 }}>{c.nome}</span>
                    <Pill color={done?"#00C9A7":p>70?"#FFD93D":"#FF6B35"}>{done?"RESGATAR":p+"%"}</Pill>
                  </div>
                  <p style={{ margin:0, fontFamily:"'DM Mono',monospace", fontSize:13, color:"#bbb" }}>
                    R$ {fmtBRL(c.saldo)}<span style={{color:"#444"}}> / {fmtBRL(c.meta)}</span>
                  </p>
                  <div style={{ display:"flex", gap:12, marginTop:6 }}>
                    {!done && <span style={{ fontSize:11, color:"#555" }}>📅 {dias}d restantes</span>}
                    <span style={{ fontSize:11, color:"#FF6B35" }}>🔥 {c.streak} dias</span>
                    <span style={{ fontSize:11, color:"#444" }}>🔑 subconta ativa</span>
                  </div>
                </div>
              </div>
            );
          })}

          <button onClick={onNovoCofre} style={{
            background:"transparent", border:"2px dashed rgba(255,255,255,0.09)",
            borderRadius:20, padding:20, color:"#444", fontFamily:"'Syne',sans-serif",
            fontSize:14, fontWeight:700, cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center", gap:8,
            transition:"all 0.2s",
          }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor="#FF6B35";e.currentTarget.style.color="#FF6B35"}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.09)";e.currentTarget.style.color="#444"}}
          >
            <span style={{fontSize:22}}>+</span> Criar novo cofre
          </button>
        </div>
      )}

      {tab === "histórico" && (
        <div style={{ padding:"0 24px" }}>
          {[
            {data:"Hoje 21:40", tipo:"Depósito", cofre:"IPVA 2027", valor:+80, icon:"🚗"},
            {data:"Ontem 19:15", tipo:"Depósito", cofre:"IPVA 2027", valor:+50, icon:"🚗"},
            {data:"25/05 08:30", tipo:"Depósito", cofre:"Revisão Junho", valor:+100, icon:"🔧"},
            {data:"23/05 22:10", tipo:"Resgate", cofre:"Revisão Junho", valor:-600, icon:"💸"},
            {data:"20/05 17:55", tipo:"Depósito", cofre:"IPVA 2027", valor:+150, icon:"🚗"},
          ].map((h,i)=>(
            <div key={i} style={{
              display:"flex", alignItems:"center", gap:14,
              padding:"14px 0", borderBottom:"1px solid rgba(255,255,255,0.04)",
            }}>
              <div style={{
                width:42, height:42, borderRadius:12, flexShrink:0,
                background:"rgba(255,255,255,0.05)",
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:19,
              }}>{h.icon}</div>
              <div style={{ flex:1 }}>
                <p style={{ margin:0, fontSize:14, fontWeight:700 }}>{h.cofre}</p>
                <p style={{ margin:"2px 0 0", fontSize:11, color:"#555" }}>{h.tipo} · {h.data}</p>
              </div>
              <span style={{
                fontFamily:"'DM Mono',monospace", fontSize:15, fontWeight:600,
                color: h.valor > 0 ? "#00C9A7" : "#FF6B35",
              }}>{h.valor>0?"+":""}R$ {Math.abs(h.valor)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function NovoCofre({ onCriar, onVoltar }) {
  const [step, setStep] = useState(0);
  const [metaSel, setMetaSel] = useState(null);
  const [nome, setNome] = useState("");
  const [valor, setValor] = useState("");
  const [prazo, setPrazo] = useState("");
  const [criando, setCriando] = useState(false);
  const [pixGerado, setPixGerado] = useState(false);

  function handleCriar() {
    setCriando(true);
    setTimeout(() => { setCriando(false); setPixGerado(true); }, 1800);
  }

  if (pixGerado) {
    const chave = "cofre-" + Math.random().toString(36).substr(2,8).toUpperCase();
    return (
      <div style={{ padding:"52px 24px 40px" }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ fontSize:56, marginBottom:12 }}>🎉</div>
          <h2 style={{ margin:0, fontSize:24, fontWeight:800 }}>Cofre criado!</h2>
          <p style={{ color:"#555", marginTop:8 }}>Sua subconta exclusiva está ativa</p>
        </div>

        <div style={{
          background:"rgba(0,201,167,0.08)", border:"1px solid rgba(0,201,167,0.2)",
          borderRadius:20, padding:24, marginBottom:24,
        }}>
          <p style={{ margin:"0 0 6px", color:"#555", fontSize:11, letterSpacing:2, textTransform:"uppercase" }}>Chave Pix do seu cofre</p>
          <p style={{ margin:0, fontFamily:"'DM Mono',monospace", fontSize:16, color:"#00C9A7", fontWeight:600, wordBreak:"break-all" }}>{chave}</p>
          <p style={{ margin:"10px 0 0", color:"#555", fontSize:12 }}>Envie Pix para essa chave para depositar no cofre {metaSel?.icon || "🎯"} {nome}</p>
        </div>

        <div style={{
          background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)",
          borderRadius:16, padding:20, marginBottom:28,
        }}>
          {[["Meta", `R$ ${fmtBRL(Number(valor))}`], ["Prazo", prazo], ["Subconta", "Ativa via Celcoin"], ["Rendimento", "100% CDI"]].map(([k,v])=>(
            <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
              <span style={{ color:"#555", fontSize:13 }}>{k}</span>
              <span style={{ fontFamily:"'DM Mono',monospace", fontSize:13, color:"#ccc" }}>{v}</span>
            </div>
          ))}
        </div>

        <Btn full onClick={() => onCriar({ nome, valor: Number(valor), prazo, icon: metaSel?.icon || "🎯", chave })}>
          Ver meu cofre 🔒
        </Btn>
      </div>
    );
  }

  return (
    <div style={{ padding:"52px 24px 40px" }}>
      <button onClick={onVoltar} style={{ background:"none", border:"none", color:"#555", cursor:"pointer", fontSize:22, marginBottom:24, padding:0 }}>←</button>

      {step === 0 && (
        <>
          <h2 style={{ margin:"0 0 6px", fontSize:24, fontWeight:800 }}>Novo cofre</h2>
          <p style={{ color:"#555", marginBottom:28, fontSize:14 }}>Escolha uma meta para começar</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            {METAS_SUGERIDAS.map(m => (
              <div key={m.nome} onClick={() => { setMetaSel(m); setNome(m.nome); setValor(m.valor||""); setStep(1); }} style={{
                background: "rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)",
                borderRadius:16, padding:"18px 14px", cursor:"pointer", textAlign:"center",
                transition:"all 0.15s",
              }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="#FF6B35";e.currentTarget.style.background="rgba(255,107,53,0.08)"}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.07)";e.currentTarget.style.background="rgba(255,255,255,0.04)"}}
              >
                <div style={{ fontSize:30, marginBottom:8 }}>{m.icon}</div>
                <p style={{ margin:0, fontWeight:700, fontSize:13 }}>{m.nome}</p>
                {m.valor && <p style={{ margin:"4px 0 0", color:"#555", fontSize:12, fontFamily:"'DM Mono',monospace" }}>~R${m.valor}</p>}
              </div>
            ))}
          </div>
        </>
      )}

      {step === 1 && (
        <>
          <div style={{ fontSize:40, marginBottom:16 }}>{metaSel?.icon}</div>
          <h2 style={{ margin:"0 0 6px", fontSize:24, fontWeight:800 }}>Detalhes do cofre</h2>
          <p style={{ color:"#555", marginBottom:28, fontSize:14 }}>Defina o valor e o prazo</p>
          <Input label="Nome do cofre" value={nome} onChange={setNome} placeholder="Ex: IPVA 2027" />
          <Input label="Valor da meta (R$)" value={valor} onChange={setValor} type="number" placeholder="1800" />
          <Input label="Prazo" value={prazo} onChange={setPrazo} type="date" />

          {valor && prazo && (
            <div style={{
              background:"rgba(255,107,53,0.08)", borderRadius:14, padding:16, marginBottom:20,
              border:"1px solid rgba(255,107,53,0.15)",
            }}>
              <p style={{ margin:0, color:"#FF6B35", fontSize:13 }}>
                💡 Para atingir a meta, guarde aproximadamente{" "}
                <strong>R$ {Math.ceil(Number(valor) / Math.max(1, diasRestantes(prazo)))} por dia</strong>
              </p>
            </div>
          )}

          <Btn full onClick={handleCriar} disabled={!nome||!valor||!prazo||criando}>
            {criando ? "Criando subconta..." : "Criar cofre e gerar Pix 🔐"}
          </Btn>
        </>
      )}
    </div>
  );
}

function DetalhesCofre({ cofre, onDepositar, onVoltar }) {
  const p = pct(cofre.saldo, cofre.meta);
  const dias = diasRestantes(cofre.prazo);
  return (
    <div style={{ padding:"52px 24px 40px" }}>
      <button onClick={onVoltar} style={{ background:"none", border:"none", color:"#555", cursor:"pointer", fontSize:22, marginBottom:24, padding:0 }}>←</button>

      <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:28 }}>
        <div style={{ position:"relative" }}>
          <Ring p={p} color={p>70?"#FFD93D":"#FF6B35"} size={80}/>
          <div style={{ position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,transform:"rotate(90deg)" }}>{cofre.icon}</div>
        </div>
        <div>
          <h2 style={{ margin:0, fontSize:22, fontWeight:800 }}>{cofre.nome}</h2>
          <Pill>{p}% completo</Pill>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:24 }}>
        {[
          ["💰","Guardado",`R$ ${fmtBRL(cofre.saldo)}`],
          ["🎯","Meta",`R$ ${fmtBRL(cofre.meta)}`],
          ["📅","Dias restantes",`${dias} dias`],
          ["🔥","Streak",`${cofre.streak} dias`],
        ].map(([ic,label,val])=>(
          <div key={label} style={{
            background:"rgba(255,255,255,0.04)", borderRadius:14, padding:"14px 16px",
            border:"1px solid rgba(255,255,255,0.06)",
          }}>
            <p style={{ margin:"0 0 4px", fontSize:18 }}>{ic}</p>
            <p style={{ margin:"0 0 2px", fontSize:11, color:"#555", letterSpacing:1 }}>{label.toUpperCase()}</p>
            <p style={{ margin:0, fontFamily:"'DM Mono',monospace", fontSize:14, fontWeight:600 }}>{val}</p>
          </div>
        ))}
      </div>

      {/* Chave Pix */}
      <div style={{
        background:"rgba(0,201,167,0.07)", border:"1px solid rgba(0,201,167,0.15)",
        borderRadius:16, padding:18, marginBottom:24,
      }}>
        <p style={{ margin:"0 0 6px", fontSize:11, color:"#555", letterSpacing:2, textTransform:"uppercase" }}>Chave Pix deste cofre</p>
        <p style={{ margin:0, fontFamily:"'DM Mono',monospace", fontSize:13, color:"#00C9A7", wordBreak:"break-all" }}>{cofre.chave}</p>
        <p style={{ margin:"8px 0 0", fontSize:12, color:"#555" }}>Envie Pix para essa chave — o dinheiro vai direto para a subconta deste cofre</p>
      </div>

      <div style={{ display:"flex", gap:10 }}>
        <Btn full onClick={onDepositar}>Depositar via Pix 💸</Btn>
      </div>
    </div>
  );
}

function ModalDeposito({ cofre, onFechar }) {
  const [step, setStep] = useState(0);
  const [valor, setValor] = useState("");
  const [copiado, setCopiado] = useState(false);

  function copiar() { setCopiado(true); setTimeout(()=>setCopiado(false),2000); }

  return (
    <div style={{
      position:"fixed", inset:0, background:"rgba(0,0,0,0.75)",
      backdropFilter:"blur(10px)", zIndex:50,
      display:"flex", alignItems:"flex-end", justifyContent:"center",
    }} onClick={onFechar}>
      <div style={{
        background:"#141422", borderRadius:"24px 24px 0 0",
        padding:"28px 24px 48px", width:"100%", maxWidth:420,
        border:"1px solid rgba(255,255,255,0.07)",
      }} onClick={e=>e.stopPropagation()}>

        {step === 0 && (
          <>
            <h3 style={{ margin:"0 0 6px", fontSize:20, fontWeight:800 }}>Depositar no cofre</h3>
            <p style={{ color:"#555", marginBottom:24, fontSize:13 }}>{cofre.icon} {cofre.nome}</p>
            <p style={{ margin:"0 0 10px", fontSize:12, color:"#555", letterSpacing:2, textTransform:"uppercase" }}>Valor</p>
            <div style={{ display:"flex", gap:8, marginBottom:14 }}>
              {[30,50,100,200].map(v=>(
                <button key={v} onClick={()=>setValor(String(v))} style={{
                  flex:1, padding:"11px 0", borderRadius:10, border:"none",
                  background: valor===String(v) ? "#FF6B35" : "rgba(255,255,255,0.06)",
                  color: valor===String(v) ? "#fff" : "#666",
                  fontFamily:"'Syne',monospace", fontWeight:800, fontSize:13, cursor:"pointer",
                  transition:"all 0.15s",
                }}>R${v}</button>
              ))}
            </div>
            <Input value={valor} onChange={setValor} type="number" placeholder="Outro valor" />
            <Btn full onClick={()=>setStep(1)} disabled={!valor}>
              Continuar →
            </Btn>
          </>
        )}

        {step === 1 && (
          <>
            <h3 style={{ margin:"0 0 6px", fontSize:20, fontWeight:800 }}>Envie o Pix agora</h3>
            <p style={{ color:"#555", marginBottom:24, fontSize:13 }}>Copie a chave e faça o Pix pelo seu banco</p>

            <div style={{
              background:"rgba(255,255,255,0.04)", borderRadius:16, padding:18, marginBottom:16,
              border:"1px solid rgba(255,255,255,0.07)",
            }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
                <span style={{ color:"#555", fontSize:13 }}>Chave Pix</span>
                <button onClick={copiar} style={{
                  background:"none", border:"none", color: copiado?"#00C9A7":"#FF6B35",
                  fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:12, cursor:"pointer",
                }}>{copiado?"✓ Copiado!":"Copiar"}</button>
              </div>
              <p style={{ margin:0, fontFamily:"'DM Mono',monospace", fontSize:13, color:"#ccc", wordBreak:"break-all" }}>{cofre.chave}</p>
            </div>

            <div style={{
              background:"rgba(255,255,255,0.04)", borderRadius:16, padding:18, marginBottom:24,
              border:"1px solid rgba(255,255,255,0.07)",
            }}>
              {[["Valor","R$ "+fmtBRL(Number(valor))],["Destino",cofre.nome],["Subconta","Celcoin · ativa"]].map(([k,v])=>(
                <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                  <span style={{ color:"#555", fontSize:13 }}>{k}</span>
                  <span style={{ fontFamily:"'DM Mono',monospace", fontSize:13 }}>{v}</span>
                </div>
              ))}
            </div>

            <Btn full onClick={onFechar} color="#00C9A7">
              Já enviei o Pix ✓
            </Btn>
            <p style={{ textAlign:"center", color:"#444", fontSize:12, marginTop:12 }}>
              O saldo é atualizado em até 10 segundos após o Pix
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function ResgateModal({ cofre, onFechar }) {
  const [step, setStep] = useState(0);
  const [chave, setChave] = useState("");
  const [processando, setProcessando] = useState(false);

  function processar() {
    setProcessando(true);
    setTimeout(() => { setProcessando(false); setStep(1); }, 2000);
  }

  return (
    <div style={{
      position:"fixed", inset:0, background:"rgba(0,0,0,0.75)",
      backdropFilter:"blur(10px)", zIndex:50,
      display:"flex", alignItems:"flex-end", justifyContent:"center",
    }} onClick={onFechar}>
      <div style={{
        background:"#141422", borderRadius:"24px 24px 0 0",
        padding:"28px 24px 48px", width:"100%", maxWidth:420,
        border:"1px solid rgba(255,255,255,0.07)",
      }} onClick={e=>e.stopPropagation()}>

        {step === 0 && (
          <>
            <div style={{ textAlign:"center", marginBottom:24 }}>
              <div style={{ fontSize:44, marginBottom:10 }}>🎉</div>
              <h3 style={{ margin:0, fontSize:22, fontWeight:800 }}>Meta atingida!</h3>
              <p style={{ color:"#555", marginTop:6, fontSize:13 }}>Parabéns! R$ {fmtBRL(cofre.saldo)} guardados</p>
            </div>

            <div style={{
              background:"rgba(0,201,167,0.08)", border:"1px solid rgba(0,201,167,0.2)",
              borderRadius:16, padding:18, marginBottom:20,
            }}>
              <p style={{ margin:"0 0 6px", fontSize:12, color:"#555", letterSpacing:1.5, textTransform:"uppercase" }}>Você guardou no total</p>
              <p style={{ margin:0, fontSize:32, fontWeight:800, color:"#00C9A7", fontFamily:"'DM Mono',monospace" }}>
                R$ {fmtBRL(cofre.saldo)}
              </p>
            </div>

            <Input label="Sua chave Pix para receber" value={chave} onChange={setChave} placeholder="CPF, telefone ou e-mail" />

            <Btn full onClick={processar} disabled={!chave||processando} color="#00C9A7">
              {processando ? "Processando Pix..." : "Resgatar agora 💸"}
            </Btn>
          </>
        )}

        {step === 1 && (
          <div style={{ textAlign:"center", padding:"20px 0" }}>
            <div style={{ fontSize:60, marginBottom:16 }}>✅</div>
            <h3 style={{ margin:0, fontSize:22, fontWeight:800, color:"#00C9A7" }}>Pix enviado!</h3>
            <p style={{ color:"#555", marginTop:8, fontSize:14 }}>
              R$ {fmtBRL(cofre.saldo)} foram enviados para sua chave Pix em até 10 segundos.
            </p>
            <div style={{ marginTop:24 }}>
              <Btn full onClick={onFechar}>Fechar</Btn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("splash");
  const [cofres, setCofres] = useState(INITIAL_COFRES);
  const [cofreSel, setCofreSel] = useState(null);
  const [modal, setModal] = useState(null); // "deposito" | "resgate"

  function criarCofre(data) {
    const novo = {
      id: Date.now(), icon: data.icon, nome: data.nome,
      meta: data.valor, saldo: 0, prazo: data.prazo,
      chave: data.chave, status: "ativo", streak: 0,
    };
    setCofres(prev => [...prev, novo]);
    setScreen("home");
  }

  return (
    <div style={{
      minHeight:"100vh", background:"#0D0D14",
      fontFamily:"'Syne',sans-serif", color:"#F0EDE8",
      maxWidth:420, margin:"0 auto", position:"relative", overflow:"hidden",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet"/>

      {/* ambient glow */}
      <div style={{ position:"fixed",top:-100,left:-80,width:280,height:280,background:"radial-gradient(circle,rgba(255,107,53,0.1) 0%,transparent 70%)",pointerEvents:"none",zIndex:0 }}/>
      <div style={{ position:"fixed",bottom:60,right:-60,width:220,height:220,background:"radial-gradient(circle,rgba(0,201,167,0.08) 0%,transparent 70%)",pointerEvents:"none",zIndex:0 }}/>

      <div style={{ position:"relative",zIndex:1 }}>
        {screen==="splash" && <SplashScreen onNext={()=>setScreen("login")}/>}
        {screen==="login" && <LoginScreen onLogin={()=>setScreen("onboarding")}/>}
        {screen==="onboarding" && <OnboardingFintech onAutorizar={()=>setScreen("home")} onPular={()=>setScreen("home")}/>}

        {screen==="home" && (
          <>
            <HomeScreen
              cofres={cofres}
              onNovoCofre={()=>setScreen("novoCofre")}
              onCofre={c=>{setCofreSel(c);setScreen("detalhes")}}
              onResgate={c=>{setCofreSel(c);setModal("resgate")}}
            />
            {/* Bottom nav */}
            <div style={{
              position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",
              width:"100%",maxWidth:420,
              background:"rgba(13,13,20,0.92)",backdropFilter:"blur(20px)",
              borderTop:"1px solid rgba(255,255,255,0.05)",
              padding:"10px 0 24px",display:"flex",justifyContent:"space-around",zIndex:10,
            }}>
              {[["🏦","Cofres"],["📊","Relatório"],["⚙️","Config"]].map(([ic,lb])=>(
                <button key={lb} style={{
                  background:"none",border:"none",
                  color:lb==="Cofres"?"#FF6B35":"#3a3a4a",
                  fontFamily:"'Syne',sans-serif",fontSize:10,fontWeight:700,cursor:"pointer",
                  display:"flex",flexDirection:"column",alignItems:"center",gap:4,letterSpacing:0.5,
                }}>
                  <span style={{fontSize:22}}>{ic}</span>{lb}
                </button>
              ))}
            </div>
          </>
        )}

        {screen==="novoCofre" && <NovoCofre onCriar={criarCofre} onVoltar={()=>setScreen("home")}/>}

        {screen==="detalhes" && cofreSel && (
          <>
            <DetalhesCofre
              cofre={cofreSel}
              onDepositar={()=>setModal("deposito")}
              onVoltar={()=>setScreen("home")}
            />
          </>
        )}
      </div>

      {modal==="deposito" && cofreSel && <ModalDeposito cofre={cofreSel} onFechar={()=>setModal(null)}/>}
      {modal==="resgate" && cofreSel && <ResgateModal cofre={cofreSel} onFechar={()=>{setModal(null);setScreen("home")}}/>}
    </div>
  );
}