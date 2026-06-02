import { useState, useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════════════════════
   C.I.C. — Tela 4: Guardar Dinheiro
   Zero atrito. Voz. Vibração. Animação. Optimistic UI.
   Aesthetic: Mission Control — cada aporte é uma conquista.
   O motorista deve sentir que está vencendo toda vez que guarda.
═══════════════════════════════════════════════════════════════ */

const FL = () => (
  <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@300;400;500;600;700;800;900&family=Barlow:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
);

const T = {
  bg:      "#060608",
  surface: "#0E0E14",
  card:    "#13131A",
  border:  "#1C1C26",
  border2: "#242430",
  amber:   "#F5A623",
  amberL:  "#FFB84D",
  amberD:  "#C47F0A",
  green:   "#22C55E",
  greenD:  "#16A34A",
  red:     "#EF4444",
  yellow:  "#EAB308",
  blue:    "#3B82F6",
  teal:    "#14B8A6",
  white:   "#F0EDE6",
  offwhite:"#C8C5BE",
  mid:     "#6B6870",
  dim:     "#222228",
  dimL:    "#2E2E3A",
};

const COFRES = [
  { id:1, nome:"Troca de Carro",         icon:"🚗", meta:18000, saldo:11240, cor:T.amber,  streak:34 },
  { id:2, nome:"Reserva de Emergência",  icon:"🛡️", meta:5000,  saldo:2180,  cor:T.blue,   streak:18 },
  { id:3, nome:"Entrada da Casa",        icon:"🏠", meta:50000, saldo:8400,  cor:T.green,  streak:9  },
];

const DIAS = [
  { id:"dificil",   label:"Dia Difícil",   emoji:"🌧️", val:5,  sub:"Corridas fracas",   cor:T.blue   },
  { id:"medio",     label:"Dia Médio",     emoji:"☁️", val:10, sub:"Dentro do normal",  cor:T.mid    },
  { id:"bom",       label:"Dia Bom",       emoji:"☀️", val:20, sub:"Acima da média",    cor:T.amber  },
  { id:"excelente", label:"Dia Excelente", emoji:"🌟", val:50, sub:"Dia de festa",      cor:T.green  },
];

const R   = v => `R$\u00a0${Number(v).toLocaleString("pt-BR",{minimumFractionDigits:2})}`;
const pct = (s,m) => Math.min(100,Math.round((s/m)*100));

/* ── PARTÍCULA DE CONFETTI ── */
function Particle({ x, y, color, delay }) {
  return (
    <div style={{
      position:"absolute", left:x, top:y,
      width:8, height:8,
      background:color,
      borderRadius:Math.random()>0.5?"50%":"2px",
      animation:`confetti 0.9s ease ${delay}s both`,
      pointerEvents:"none",
    }}/>
  );
}

/* ── BARRA DE PROGRESSO ANIMADA ── */
function ProgressBar({ saldo, meta, cor, animating, addedVal }) {
  const p = pct(saldo, meta);
  const pPrev = pct(saldo - addedVal, meta);
  return (
    <div style={{ position:"relative" }}>
      <div style={{ height:12, background:T.dim, borderRadius:6, overflow:"hidden", position:"relative" }}>
        {/* base */}
        <div style={{ height:"100%", borderRadius:6, background:cor, width:`${pPrev}%`, position:"absolute", top:0, left:0 }}/>
        {/* animated addition */}
        <div style={{
          height:"100%", borderRadius:6,
          background:`linear-gradient(90deg,${cor},${cor}CC)`,
          width:`${p}%`,
          position:"absolute", top:0, left:0,
          transition: animating ? "width 1.2s cubic-bezier(.4,0,.2,1)" : "none",
          boxShadow: `0 0 16px ${cor}88`,
        }}/>
        {/* shimmer */}
        {animating && (
          <div style={{
            position:"absolute", top:0, left:`${pPrev}%`, height:"100%", width:40,
            background:`linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)`,
            animation:"shimmer 0.8s ease 0.3s both",
          }}/>
        )}
      </div>
    </div>
  );
}

/* ── VOZ RECOGNITION HOOK ── */
function useVoiceInput(onResult) {
  const recRef = useRef(null);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = "pt-BR";
    rec.continuous = false;
    rec.interimResults = true;

    rec.onresult = (e) => {
      const t = Array.from(e.results).map(r => r[0].transcript).join("");
      setTranscript(t);
      if (e.results[e.results.length-1].isFinal) {
        setListening(false);
        // parse valor da fala: "guardar 20 reais", "vinte reais", "50"
        const num = t.match(/\d+/);
        if (num) onResult(Number(num[0]), t);
        setTranscript("");
      }
    };
    rec.onerror = () => setListening(false);
    rec.onend   = () => setListening(false);
    recRef.current = rec;
  }, []);

  function toggle() {
    if (!recRef.current) return false;
    if (listening) { recRef.current.stop(); setListening(false); }
    else { recRef.current.start(); setListening(true); setTranscript(""); }
    return true;
  }

  return { listening, transcript, toggle, supported: typeof window !== "undefined" && !!(window.SpeechRecognition || window.webkitSpeechRecognition) };
}

/* ══════════════════════════════════════════════════════════════
   TELA PRINCIPAL
══════════════════════════════════════════════════════════════ */
export default function GuardarDinheiro() {
  const [cofres, setCofres] = useState(COFRES);
  const [cofreSel, setCofreSel] = useState(COFRES[0]);
  const [valorSel, setValorSel] = useState(null);     // valor do botão de dia
  const [customVal, setCustomVal] = useState("");      // valor digitado
  const [step, setStep] = useState("home");            // home | confirmar | sucesso | voz
  const [animating, setAnimating] = useState(false);
  const [lastAdded, setLastAdded] = useState(0);
  const [particles, setParticles] = useState([]);
  const [voiceMsg, setVoiceMsg] = useState("");
  const [streakAnim, setStreakAnim] = useState(false);
  const [totalHoje, setTotalHoje] = useState(0);
  const btnRef = useRef(null);

  const voice = useVoiceInput((val, raw) => {
    // interpreta o comando de voz
    setVoiceMsg(`"${raw}" → ${R(val)}`);
    setTimeout(() => {
      setValorSel(val);
      setStep("confirmar");
    }, 800);
  });

  const valorFinal = valorSel ?? (Number(customVal) || 0);
  const cofre = cofres.find(c => c.id === cofreSel.id) || cofres[0];
  const p = pct(cofre.saldo, cofre.meta);
  const pDepois = pct(cofre.saldo + valorFinal, cofre.meta);

  function gerarParticulas(x, y) {
    const cols = [T.amber, T.amberL, T.green, "#fff", T.yellow, T.blue];
    return Array.from({ length: 22 }, (_, i) => ({
      id: i,
      x: x + (Math.random() - 0.5) * 160,
      y: y + (Math.random() - 0.5) * 80,
      color: cols[i % cols.length],
      delay: Math.random() * 0.3,
    }));
  }

  function confirmarAporte() {
    if (!valorFinal) return;
    // Optimistic UI — atualiza na hora
    setCofres(prev => prev.map(c =>
      c.id === cofreSel.id
        ? { ...c, saldo: Math.min(c.meta, c.saldo + valorFinal), streak: c.streak + 1 }
        : c
    ));
    setLastAdded(valorFinal);
    setTotalHoje(t => t + valorFinal);
    setAnimating(true);
    setStreakAnim(true);
    // gera confetti centrado
    setParticles(gerarParticulas(200, 300));
    setTimeout(() => setParticles([]), 1200);
    setTimeout(() => { setAnimating(false); setStreakAnim(false); }, 1600);
    setStep("sucesso");
  }

  function resetar() {
    setStep("home");
    setValorSel(null);
    setCustomVal("");
    setVoiceMsg("");
  }

  /* ── TELA SUCESSO ── */
  if (step === "sucesso") {
    const cofre2 = cofres.find(c => c.id === cofreSel.id);
    const p2 = pct(cofre2.saldo, cofre2.meta);
    const metaConcluida = p2 >= 100;
    return (
      <div style={{ minHeight:"100vh", background:T.bg, fontFamily:"'Barlow',sans-serif", color:T.white, maxWidth:440, margin:"0 auto", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"40px 24px", position:"relative", overflow:"hidden" }}>
        <FL/>
        <style>{`
          @keyframes confetti{0%{opacity:1;transform:translateY(0) rotate(0deg)}100%{opacity:0;transform:translateY(-120px) rotate(720deg)}}
          @keyframes pop{0%{transform:scale(0.2);opacity:0}60%{transform:scale(1.3)}100%{transform:scale(1);opacity:1}}
          @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
          @keyframes shimmer{0%{left:-10%}100%{left:110%}}
          @keyframes pulseGreen{0%,100%{box-shadow:0 0 0 0 #22C55E55}50%{box-shadow:0 0 0 16px #22C55E00}}
          @keyframes countUp{0%{transform:scale(0.8);opacity:0}100%{transform:scale(1);opacity:1}}
        `}</style>

        {/* Partículas */}
        <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:99 }}>
          {particles.map(p => <Particle key={p.id} x={p.x} y={p.y} color={p.color} delay={p.delay}/>)}
        </div>

        {metaConcluida ? (
          <>
            <div style={{ fontSize:72, animation:"pop 0.6s cubic-bezier(.36,.07,.19,.97) both", marginBottom:16 }}>🏆</div>
            <h1 style={{ margin:"0 0 8px", fontSize:38, fontWeight:900, fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:-0.5, textAlign:"center", color:T.amber }}>META CONCLUÍDA!</h1>
            <p style={{ color:T.mid, textAlign:"center", marginBottom:32, fontSize:15 }}>Você chegou lá. Isso levou disciplina real.</p>
          </>
        ) : (
          <>
            <div style={{ fontSize:72, animation:"pop 0.5s cubic-bezier(.36,.07,.19,.97) both", marginBottom:16 }}>💰</div>
            <h1 style={{ margin:"0 0 4px", fontSize:44, fontWeight:900, fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:-1, textAlign:"center", animation:"countUp 0.4s ease 0.2s both" }}>
              +{R(lastAdded)}
            </h1>
            <p style={{ color:T.amber, fontSize:16, fontWeight:700, marginBottom:32, textAlign:"center", animation:"fadeUp 0.4s ease 0.3s both" }}>guardado agora! 🔒</p>
          </>
        )}

        {/* Card progresso */}
        <div style={{ width:"100%", maxWidth:360, background:T.card, border:`1px solid ${cofre.cor}44`, borderRadius:20, padding:22, marginBottom:24, animation:"fadeUp 0.5s ease 0.25s both" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <div style={{ display:"flex", gap:10, alignItems:"center" }}>
              <span style={{ fontSize:26 }}>{cofre.icon}</span>
              <span style={{ fontSize:16, fontWeight:800, fontFamily:"'Barlow Condensed',sans-serif" }}>{cofre.nome}</span>
            </div>
            <span style={{ fontSize:18, fontWeight:900, color:cofre.cor, fontFamily:"'Barlow Condensed',sans-serif" }}>{p2}%</span>
          </div>
          <ProgressBar saldo={cofre2.saldo} meta={cofre2.meta} cor={cofre.cor} animating={animating} addedVal={lastAdded}/>
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:10 }}>
            <span style={{ fontSize:12, color:T.mid, fontFamily:"'DM Mono',monospace" }}>{R(cofre2.saldo)}</span>
            <span style={{ fontSize:12, color:T.dim, fontFamily:"'DM Mono',monospace" }}>{R(cofre2.meta)}</span>
          </div>
        </div>

        {/* Stats do aporte */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, width:"100%", maxWidth:360, marginBottom:28, animation:"fadeUp 0.5s ease 0.35s both" }}>
          {[
            { label:"GUARDADO HOJE",  val:R(totalHoje),          cor:T.amber },
            { label:"STREAK",         val:`🔥 ${cofre2.streak}d`, cor:T.orange },
            { label:"FALTA",          val:R(cofre2.meta-cofre2.saldo), cor:T.mid },
          ].map(({ label, val, cor }) => (
            <div key={label} style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:12, padding:"12px 8px", textAlign:"center" }}>
              <p style={{ margin:"0 0 4px", fontSize:8, color:T.mid, letterSpacing:1, fontWeight:700 }}>{label}</p>
              <p style={{ margin:0, fontSize:13, fontWeight:800, color:cor, fontFamily:"'Barlow Condensed',sans-serif" }}>{val}</p>
            </div>
          ))}
        </div>

        <div style={{ display:"flex", gap:10, width:"100%", maxWidth:360, animation:"fadeUp 0.5s ease 0.4s both" }}>
          <button onClick={resetar} style={{ flex:1, padding:"15px", borderRadius:12, border:"none", background:T.amber, color:"#000", fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:17, letterSpacing:0.5, cursor:"pointer", boxShadow:`0 8px 28px ${T.amber}55` }}>
            GUARDAR MAIS →
          </button>
          <button style={{ flex:1, padding:"15px", borderRadius:12, border:`1px solid ${T.border}`, background:"transparent", color:T.mid, fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, fontSize:15, cursor:"pointer" }}>
            INÍCIO
          </button>
        </div>
      </div>
    );
  }

  /* ── TELA CONFIRMAR ── */
  if (step === "confirmar") {
    const diasAtentar = Math.ceil(valorFinal / 50);
    return (
      <div style={{ minHeight:"100vh", background:T.bg, fontFamily:"'Barlow',sans-serif", color:T.white, maxWidth:440, margin:"0 auto", padding:"52px 24px 40px" }}>
        <FL/>
        <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}} @keyframes shimmer{0%{left:-10%}100%{left:110%}}`}</style>

        <button onClick={()=>setStep("home")} style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:10, width:36, height:36, cursor:"pointer", color:T.mid, fontSize:18, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:24 }}>←</button>

        <p style={{ margin:"0 0 4px", fontSize:10, color:T.amber, letterSpacing:3, fontWeight:700 }}>CONFIRMAÇÃO</p>
        <h1 style={{ margin:"0 0 28px", fontSize:32, fontWeight:900, fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:-0.5 }}>Guardar agora?</h1>

        {/* Valor grande */}
        <div style={{ textAlign:"center", marginBottom:28, animation:"fadeUp 0.4s ease" }}>
          <div style={{ fontSize:62, fontWeight:900, fontFamily:"'Barlow Condensed',sans-serif", color:T.amber, letterSpacing:-2, lineHeight:1 }}>
            {R(valorFinal)}
          </div>
          {voiceMsg && (
            <p style={{ margin:"8px 0 0", fontSize:12, color:T.mid, fontStyle:"italic" }}>
              🎙️ {voiceMsg}
            </p>
          )}
        </div>

        {/* Preview do impacto */}
        <div style={{ background:`linear-gradient(135deg,${cofre.cor}14,${cofre.cor}06)`, border:`1px solid ${cofre.cor}33`, borderRadius:18, padding:20, marginBottom:20, animation:"fadeUp 0.4s ease 0.1s both" }}>
          <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:16 }}>
            <span style={{ fontSize:28 }}>{cofre.icon}</span>
            <div style={{ flex:1 }}>
              <p style={{ margin:0, fontSize:16, fontWeight:800, fontFamily:"'Barlow Condensed',sans-serif" }}>{cofre.nome}</p>
              <p style={{ margin:"3px 0 0", fontSize:11, color:T.mid }}>{p}% → <span style={{ color:cofre.cor, fontWeight:700 }}>{pDepois}%</span> após este aporte</p>
            </div>
          </div>

          {/* Barra antes/depois */}
          <div style={{ marginBottom:10 }}>
            <div style={{ height:10, background:T.dim, borderRadius:5, overflow:"hidden", position:"relative" }}>
              <div style={{ height:"100%", background:cofre.cor, width:`${p}%`, borderRadius:5, opacity:0.4, position:"absolute" }}/>
              <div style={{ height:"100%", background:`linear-gradient(90deg,${cofre.cor}CC,${cofre.cor})`, width:`${pDepois}%`, borderRadius:5, boxShadow:`0 0 14px ${cofre.cor}88`, position:"absolute", transition:"width 0.8s cubic-bezier(.4,0,.2,1)" }}/>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", marginTop:6 }}>
              <span style={{ fontSize:11, color:T.mid, fontFamily:"'DM Mono',monospace" }}>{R(cofre.saldo)}</span>
              <span style={{ fontSize:11, color:cofre.cor, fontWeight:700, fontFamily:"'DM Mono',monospace" }}>+{R(valorFinal)} → {R(cofre.saldo+valorFinal)}</span>
            </div>
          </div>
        </div>

        {/* Impacto positivo */}
        <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:14, padding:16, marginBottom:24, animation:"fadeUp 0.4s ease 0.15s both" }}>
          {[
            ["Progresso", `+${pDepois-p} pontos percentuais`, T.green],
            ["Streak continua", `🔥 ${cofre.streak+1} dias`, T.amber],
            ["Score de disciplina", "+3 pontos", T.amber],
            ["Falta para a meta", R(cofre.meta-cofre.saldo-valorFinal), T.mid],
          ].map(([k,v,c])=>(
            <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${T.border}` }}>
              <span style={{ fontSize:13, color:T.offwhite }}>{k}</span>
              <span style={{ fontSize:12, fontWeight:700, color:c, fontFamily:"'Barlow Condensed',sans-serif" }}>{v}</span>
            </div>
          ))}
        </div>

        <button onClick={confirmarAporte} style={{ width:"100%", padding:"17px", borderRadius:12, border:"none", background:`linear-gradient(135deg,${T.amber},${T.amberL})`, color:"#000", fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:20, letterSpacing:1.5, cursor:"pointer", boxShadow:`0 10px 32px ${T.amber}66`, animation:"fadeUp 0.4s ease 0.2s both" }}>
          GUARDAR AGORA 🔒
        </button>
      </div>
    );
  }

  /* ── TELA HOME ── */
  return (
    <div style={{ minHeight:"100vh", background:T.bg, fontFamily:"'Barlow',sans-serif", color:T.white, maxWidth:440, margin:"0 auto", position:"relative" }}>
      <FL/>
      <style>{`
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
        input::placeholder{color:#35353f;}
        ::-webkit-scrollbar{display:none;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pop{0%{transform:scale(0.2);opacity:0}60%{transform:scale(1.3)}100%{transform:scale(1);opacity:1}}
        @keyframes ripple{0%{transform:scale(0.8);opacity:0.7}100%{transform:scale(2.4);opacity:0}}
        @keyframes shimmer{0%{left:-40%}100%{left:140%}}
        @keyframes pulseAmber{0%,100%{box-shadow:0 0 0 0 #F5A62355}50%{box-shadow:0 0 0 10px #F5A62300}}
        @keyframes voicePulse{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}
        .dia-btn:active{transform:scale(0.94)!important;}
        .dia-btn{transition:transform 0.12s,background 0.15s,border-color 0.15s,box-shadow 0.15s;}
      `}</style>

      {/* Ambient */}
      <div style={{ position:"fixed", top:-100, left:-80, width:320, height:320, background:`radial-gradient(circle,${T.amber}0A 0%,transparent 70%)`, pointerEvents:"none", zIndex:0 }}/>
      <div style={{ position:"fixed", bottom:40, right:-60, width:240, height:240, background:`radial-gradient(circle,${T.green}06 0%,transparent 70%)`, pointerEvents:"none", zIndex:0 }}/>

      <div style={{ position:"relative", zIndex:1, paddingBottom:30 }}>

        {/* ── HEADER ── */}
        <div style={{ padding:"52px 20px 20px", borderBottom:`1px solid ${T.border}` }}>
          <p style={{ margin:"0 0 4px", fontSize:9, color:T.amber, letterSpacing:3, fontWeight:700 }}>C.I.C. — GUARDAR DINHEIRO</p>
          <h1 style={{ margin:"0 0 2px", fontSize:30, fontWeight:900, fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:-0.5 }}>Como foi seu dia?</h1>
          <p style={{ margin:0, fontSize:13, color:T.mid }}>Escolha, fale ou digita. Zero atrito.</p>
        </div>

        {/* ── SELETOR DE COFRE ── */}
        <div style={{ padding:"18px 20px 0" }}>
          <p style={{ margin:"0 0 10px", fontSize:9, color:T.mid, letterSpacing:2, fontWeight:700 }}>GUARDAR EM QUAL COFRE?</p>
          <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:4 }}>
            {cofres.map(c => {
              const sel = cofreSel.id === c.id;
              const pp = pct(c.saldo, c.meta);
              return (
                <div key={c.id} onClick={() => setCofreSel(c)} style={{
                  flexShrink:0, background:sel?`${c.cor}18`:T.card,
                  border:`1.5px solid ${sel?c.cor:T.border}`,
                  borderRadius:14, padding:"12px 14px", cursor:"pointer",
                  minWidth:130, transition:"all 0.18s",
                }}>
                  <div style={{ display:"flex", gap:6, alignItems:"center", marginBottom:8 }}>
                    <span style={{ fontSize:18 }}>{c.icon}</span>
                    <span style={{ fontSize:11, fontWeight:700, color:sel?c.cor:T.offwhite, fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:0.3 }}>{c.nome}</span>
                  </div>
                  <div style={{ height:4, background:T.dim, borderRadius:2, overflow:"hidden" }}>
                    <div style={{ height:"100%", background:c.cor, width:`${pp}%`, borderRadius:2 }}/>
                  </div>
                  <p style={{ margin:"5px 0 0", fontSize:10, color:T.mid, fontFamily:"'DM Mono',monospace" }}>{pp}% · 🔥{c.streak}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── BOTÕES DE DIA ── */}
        <div style={{ padding:"22px 20px 0" }}>
          <p style={{ margin:"0 0 12px", fontSize:9, color:T.mid, letterSpacing:2, fontWeight:700 }}>COMO FOI O DIA?</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            {DIAS.map((d, i) => {
              const sel = valorSel === d.val;
              return (
                <button key={d.id} ref={i===2?btnRef:null}
                  className="dia-btn"
                  onClick={() => { setValorSel(d.val); setCustomVal(""); setStep("confirmar"); }}
                  style={{
                    background:sel?`${d.cor}22`:T.card,
                    border:`1.5px solid ${sel?d.cor:T.border}`,
                    borderRadius:18, padding:"18px 14px", cursor:"pointer",
                    textAlign:"left", position:"relative", overflow:"hidden",
                    boxShadow:sel?`0 8px 24px ${d.cor}33`:"none",
                    animation:`fadeUp 0.4s ease ${i*0.06}s both`,
                  }}
                >
                  {/* Shimmer no hover */}
                  <div style={{ position:"absolute", top:0, left:"-40%", width:"40%", height:"100%", background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent)", animation:sel?"shimmer 1.2s ease infinite":"none", pointerEvents:"none" }}/>

                  <div style={{ fontSize:32, marginBottom:8 }}>{d.emoji}</div>
                  <div style={{ fontSize:13, fontWeight:700, color:sel?d.cor:T.offwhite, fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:0.3, marginBottom:2 }}>{d.label}</div>
                  <div style={{ fontSize:11, color:T.mid, marginBottom:10 }}>{d.sub}</div>
                  <div style={{
                    display:"inline-flex", alignItems:"center", gap:4,
                    background:sel?d.cor:T.surface,
                    border:`1px solid ${sel?d.cor:T.border}`,
                    borderRadius:8, padding:"5px 12px",
                    transition:"all 0.15s",
                  }}>
                    <span style={{ fontSize:15, fontWeight:900, color:sel?"#000":d.cor, fontFamily:"'Barlow Condensed',sans-serif" }}>R${d.val}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── VOZ ── */}
        <div style={{ padding:"22px 20px 0" }}>
          <p style={{ margin:"0 0 12px", fontSize:9, color:T.mid, letterSpacing:2, fontWeight:700 }}>GUARDAR COM A VOZ</p>
          <div style={{ background:T.card, border:`1.5px solid ${voice.listening?T.amber:T.border}`, borderRadius:18, padding:"18px 20px", position:"relative", overflow:"hidden", transition:"border-color 0.2s" }}>

            {/* Ondas */}
            {voice.listening && (
              <>
                {[1,2,3].map(i=>(
                  <div key={i} style={{ position:"absolute", borderRadius:"50%", border:`1.5px solid ${T.amber}`, width:40+i*40, height:40+i*40, top:"50%", left:60, transform:"translate(-50%,-50%)", opacity:0.5/i, animation:`ripple 1.4s ease infinite`, animationDelay:`${i*0.3}s`, pointerEvents:"none" }}/>
                ))}
              </>
            )}

            <div style={{ display:"flex", gap:16, alignItems:"center" }}>
              <button onClick={() => {
                if (!voice.supported) { alert("Voz não suportada neste navegador"); return; }
                voice.toggle();
              }} style={{
                width:60, height:60, borderRadius:"50%", border:"none", flexShrink:0,
                background:voice.listening ? `linear-gradient(135deg,${T.amber},${T.amberD})` : T.surface,
                boxShadow:voice.listening ? `0 0 32px ${T.amber}66, 0 0 0 0 ${T.amber}44` : `0 4px 16px rgba(0,0,0,0.4)`,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:26, cursor:"pointer",
                animation:voice.listening ? "voicePulse 1.2s ease infinite" : "none",
                border:`2px solid ${voice.listening?T.amber:T.border}`,
                transition:"all 0.2s",
              }}>
                {voice.listening ? "⏹" : "🎙️"}
              </button>
              <div style={{ flex:1 }}>
                {voice.listening ? (
                  <>
                    <p style={{ margin:"0 0 4px", fontSize:14, fontWeight:700, color:T.amber, animation:"blink 1s infinite" }}>Ouvindo...</p>
                    {voice.transcript
                      ? <p style={{ margin:0, fontSize:13, color:T.offwhite, fontStyle:"italic" }}>"{voice.transcript}"</p>
                      : <p style={{ margin:0, fontSize:12, color:T.mid }}>Fale: "guardar 20 reais"</p>
                    }
                  </>
                ) : (
                  <>
                    <p style={{ margin:"0 0 4px", fontSize:14, fontWeight:700, color:T.white }}>Fale o valor</p>
                    <p style={{ margin:0, fontSize:12, color:T.mid, lineHeight:1.5 }}>Ex: "guardar 30 reais" · "50 reais no cofre do carro"</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── VALOR CUSTOM ── */}
        <div style={{ padding:"16px 20px 0" }}>
          <p style={{ margin:"0 0 10px", fontSize:9, color:T.mid, letterSpacing:2, fontWeight:700 }}>OU DIGITE UM VALOR</p>
          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            <div style={{ flex:1, display:"flex", alignItems:"center", gap:8, background:T.card, border:`1.5px solid ${customVal?T.amber:T.border}`, borderRadius:14, padding:"14px 16px", transition:"border-color 0.2s" }}>
              <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:22, fontWeight:700, color:T.amber, flexShrink:0 }}>R$</span>
              <input type="number" value={customVal} onChange={e=>{ setCustomVal(e.target.value); setValorSel(null); }} placeholder="0"
                style={{ flex:1, background:"transparent", border:"none", outline:"none", color:T.white, fontFamily:"'DM Mono',monospace", fontSize:22, fontWeight:600 }}/>
            </div>
            <button onClick={()=>{ if(Number(customVal)>0){ setStep("confirmar"); } }} disabled={!Number(customVal)} style={{
              width:56, height:56, borderRadius:14, border:"none", flexShrink:0,
              background:Number(customVal)?T.amber:T.dim,
              color:Number(customVal)?"#000":T.mid,
              fontSize:22, cursor:Number(customVal)?"pointer":"not-allowed",
              fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900,
              boxShadow:Number(customVal)?`0 4px 18px ${T.amber}55`:"none",
              transition:"all 0.2s",
            }}>→</button>
          </div>
        </div>

        {/* ── HISTÓRICO HOJE ── */}
        {totalHoje > 0 && (
          <div style={{ margin:"20px 20px 0", background:`${T.green}10`, border:`1px solid ${T.green}33`, borderRadius:14, padding:"12px 16px", display:"flex", alignItems:"center", gap:12, animation:"fadeUp 0.4s ease" }}>
            <span style={{ fontSize:22 }}>✅</span>
            <div>
              <p style={{ margin:0, fontSize:12, fontWeight:700, color:T.green }}>Guardado hoje</p>
              <p style={{ margin:"2px 0 0", fontSize:16, fontWeight:900, color:T.white, fontFamily:"'Barlow Condensed',sans-serif" }}>{R(totalHoje)}</p>
            </div>
          </div>
        )}

        {/* ── DICA DA IA ── */}
        <div style={{ margin:"16px 20px 0", background:`${T.amber}0C`, border:`1px solid ${T.amber}22`, borderRadius:14, padding:"13px 16px", display:"flex", gap:10, alignItems:"flex-start" }}>
          <span style={{ fontSize:18, flexShrink:0 }}>🤖</span>
          <p style={{ margin:0, fontSize:13, color:T.offwhite, lineHeight:1.65 }}>
            {totalHoje > 0
              ? `Ótimo! Você já guardou ${R(totalHoje)} hoje. Cada aporte fortalece o hábito. Continue amanhã para manter o streak! 🔥`
              : `Faltam ${Math.ceil((cofre.meta-cofre.saldo)/30)}/dia para concluir "${cofre.nome}" no prazo. Qual foi seu dia hoje? Um aporte rápido faz diferença.`
            }
          </p>
        </div>

        <div style={{ height:32 }}/>
      </div>
    </div>
  );
}