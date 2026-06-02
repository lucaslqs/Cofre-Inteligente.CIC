import { useState, useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════════════════════
   C.I.C. — Tela 6: Saque Protegido
   Aesthetic: VAULT BREACH — industrial alarm system
   5 telas de fricção progressiva. Cada passo é mais pesado.
   O motorista deve sentir o peso real da decisão.
   A última tela exige pressionar por 5 segundos.
═══════════════════════════════════════════════════════════════ */

const FL = () => (
  <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@300;400;500;600;700;800;900&family=Barlow:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
);

const T = {
  bg:      "#060608",
  surface: "#0E0E14",
  card:    "#13131A",
  border:  "#1C1C26",
  amber:   "#F5A623",
  amberL:  "#FFB84D",
  green:   "#22C55E",
  red:     "#EF4444",
  redD:    "#B91C1C",
  redL:    "#FCA5A5",
  yellow:  "#EAB308",
  white:   "#F0EDE6",
  offwhite:"#C8C5BE",
  mid:     "#6B6870",
  dim:     "#1E1E28",
  dimL:    "#2A2A36",
};

const R = v => `R$\u00a0${Number(v).toLocaleString("pt-BR",{minimumFractionDigits:2})}`;

const COFRE = {
  nome: "Troca de Carro",
  icon: "🚗",
  img:  "🚙",
  meta: 18000,
  saldo: 11240,
  streak: 34,
  cor: T.amber,
  guardiao: "Maria (esposa)",
  mesesRestantes: 7,
};

/* ── HELPERS ── */
const pct   = (s,m) => Math.min(100,Math.round((s/m)*100));
const horas = (val) => Math.ceil(val / 42); // ~R$42/hora media motorista

/* ── COMPONENTES ── */

function AlarmLine() {
  return (
    <div style={{
      height:3,
      background:`linear-gradient(90deg,transparent,${T.red},${T.red},transparent)`,
      animation:"alarmScan 2s linear infinite",
      opacity:0.7,
    }}/>
  );
}

function WarningBadge({ children }) {
  return (
    <div style={{
      display:"inline-flex", alignItems:"center", gap:6,
      background:`${T.red}18`, border:`1px solid ${T.red}44`,
      borderRadius:8, padding:"4px 12px",
    }}>
      <div style={{width:6,height:6,borderRadius:"50%",background:T.red,animation:"blink 0.8s infinite"}}/>
      <span style={{fontSize:10,fontWeight:800,color:T.red,letterSpacing:2,fontFamily:"'Barlow Condensed',sans-serif"}}>{children}</span>
    </div>
  );
}

function ImpactRow({ label, value, color=T.offwhite, icon }) {
  return (
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${T.border}`}}>
      <div style={{display:"flex",gap:8,alignItems:"center"}}>
        {icon && <span style={{fontSize:16}}>{icon}</span>}
        <span style={{fontSize:13,color:T.offwhite}}>{label}</span>
      </div>
      <span style={{fontSize:13,fontWeight:800,color,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:0.5}}>{value}</span>
    </div>
  );
}

/* ── PROGRESS RING ── */
function Ring({p,color,size=70,thick=5}){
  const r=(size-thick)/2, c=2*Math.PI*r;
  return(
    <svg width={size} height={size} style={{transform:"rotate(-90deg)",flexShrink:0}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={T.dim} strokeWidth={thick}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={thick}
        strokeDasharray={c} strokeDashoffset={c-(p/100)*c} strokeLinecap="round"
        style={{transition:"stroke-dashoffset 1s cubic-bezier(.4,0,.2,1)"}}/>
    </svg>
  );
}

/* ── HOLD BUTTON (5 segundos) ── */
function HoldButton({ onComplete, duration=5000 }) {
  const [progress, setProgress] = useState(0);
  const [holding, setHolding]   = useState(false);
  const [done, setDone]         = useState(false);
  const intervalRef = useRef(null);
  const startRef    = useRef(null);

  function startHold(e) {
    e.preventDefault();
    if (done) return;
    startRef.current = Date.now();
    setHolding(true);
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startRef.current;
      const p = Math.min(100, (elapsed / duration) * 100);
      setProgress(p);
      if (p >= 100) {
        clearInterval(intervalRef.current);
        setDone(true);
        setHolding(false);
        setTimeout(onComplete, 300);
      }
    }, 30);
  }

  function stopHold() {
    if (done) return;
    clearInterval(intervalRef.current);
    setHolding(false);
    setProgress(0);
  }

  useEffect(() => () => clearInterval(intervalRef.current), []);

  const secondsLeft = Math.ceil((duration - (progress/100)*duration) / 1000);

  return (
    <div>
      {/* Progress track */}
      <div style={{height:8,background:T.dim,borderRadius:4,overflow:"hidden",marginBottom:14,position:"relative"}}>
        <div style={{
          height:"100%",borderRadius:4,
          background:done?T.green:`linear-gradient(90deg,${T.red},${T.redL})`,
          width:`${progress}%`,
          transition:holding?"none":"width 0.3s ease",
          boxShadow:`0 0 12px ${done?T.green:T.red}88`,
        }}/>
      </div>

      <button
        onPointerDown={startHold}
        onPointerUp={stopHold}
        onPointerLeave={stopHold}
        disabled={done}
        style={{
          width:"100%", padding:"18px", borderRadius:14,
          border:`2px solid ${done?T.green:holding?T.red:T.border}`,
          background:done?`${T.green}18`:holding?`${T.red}18`:"transparent",
          color:done?T.green:holding?T.red:T.mid,
          fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:17, letterSpacing:1,
          cursor:done?"default":"pointer", userSelect:"none", touchAction:"none",
          transition:"border-color 0.15s,background 0.15s,color 0.15s",
          animation:holding?"none":"none",
        }}
      >
        {done
          ? "✓ CONFIRMADO — PROCESSANDO..."
          : holding
          ? `SEGURE... ${secondsLeft}s`
          : "PRESSIONE E SEGURE POR 5 SEGUNDOS PARA SACAR"
        }
      </button>

      {!done && !holding && (
        <p style={{textAlign:"center",fontSize:11,color:T.mid,marginTop:10}}>
          Soltar antes cancela automaticamente
        </p>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TELA PRINCIPAL — SAQUE PROTEGIDO
══════════════════════════════════════════════════════════════ */
export default function SaqueProtegido() {
  const [step, setStep]         = useState(0);
  const [valor, setValor]       = useState("");
  const [animIn, setAnimIn]     = useState(false);
  const [concluido, setConcluido] = useState(false);

  useEffect(() => { setTimeout(()=>setAnimIn(true),80); }, []);

  const valorNum   = Number(valor) || 0;
  const metaApos   = COFRE.saldo - valorNum;
  const pctAtual   = pct(COFRE.saldo, COFRE.meta);
  const pctApos    = pct(Math.max(0,metaApos), COFRE.meta);
  const diasAtraso = Math.ceil(valorNum / Math.ceil((COFRE.meta-COFRE.saldo)/(COFRE.mesesRestantes*30)) / 30);
  const horasTrabalho = horas(valorNum);

  /* ── TELA FINAL: SACADO ── */
  if (concluido) return (
    <div style={{minHeight:"100vh",background:T.bg,fontFamily:"'Barlow',sans-serif",color:T.white,maxWidth:440,margin:"0 auto",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 24px"}}>
      <FL/>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}} @keyframes pop{0%{transform:scale(0.2);opacity:0}60%{transform:scale(1.2)}100%{transform:scale(1);opacity:1}}`}</style>
      <div style={{fontSize:64,marginBottom:16,animation:"pop 0.5s ease both"}}>💸</div>
      <h1 style={{margin:"0 0 8px",fontSize:30,fontWeight:900,fontFamily:"'Barlow Condensed',sans-serif",textAlign:"center"}}>Saque processado</h1>
      <p style={{color:T.mid,textAlign:"center",marginBottom:32,fontSize:14,lineHeight:1.6}}>{R(valorNum)} debitado do cofre.<br/>Seu score caiu <strong style={{color:T.red}}>-15 pontos</strong>.</p>
      <div style={{width:"100%",maxWidth:340,background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:20,marginBottom:28,animation:"fadeUp 0.4s ease 0.2s both"}}>
        {[
          ["Saldo restante",  R(metaApos),        T.white],
          ["Atraso na meta",  `+${diasAtraso} dias`, T.red],
          ["Score perdido",   "-15 pontos",       T.red],
          ["Streak",          "Zerado",            T.red],
        ].map(([k,v,c])=>(
          <ImpactRow key={k} label={k} value={v} color={c}/>
        ))}
      </div>
      <div style={{background:`${T.amber}10`,border:`1px solid ${T.amber}28`,borderRadius:14,padding:"14px 16px",width:"100%",maxWidth:340,marginBottom:28,animation:"fadeUp 0.4s ease 0.3s both",display:"flex",gap:10}}>
        <span style={{fontSize:20,flexShrink:0}}>🤖</span>
        <p style={{margin:0,fontSize:13,color:T.offwhite,lineHeight:1.65}}>Tudo bem. O importante é recomeçar amanhã. Cada aporte, por menor que seja, reconstrói o caminho para o seu sonho.</p>
      </div>
      <button onClick={()=>{setStep(0);setConcluido(false);setValor("");}} style={{width:"100%",maxWidth:340,padding:"15px",borderRadius:12,border:"none",background:T.amber,color:"#000",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:18,letterSpacing:1,cursor:"pointer",boxShadow:`0 8px 28px ${T.amber}55`}}>
        RECOMEÇAR AGORA →
      </button>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:T.bg,fontFamily:"'Barlow',sans-serif",color:T.white,maxWidth:440,margin:"0 auto",position:"relative",overflowX:"hidden"}}>
      <FL/>
      <style>{`
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
        input::placeholder{color:#35353f;}
        ::-webkit-scrollbar{display:none;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.2}}
        @keyframes alarmScan{0%{background-position:-100% 0}100%{background-position:200% 0}}
        @keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-6px)}40%,80%{transform:translateX(6px)}}
        @keyframes pulseRed{0%,100%{box-shadow:0 0 0 0 #EF444455}50%{box-shadow:0 0 0 12px #EF444400}}
        @keyframes pop{0%{transform:scale(0.2);opacity:0}60%{transform:scale(1.2)}100%{transform:scale(1);opacity:1}}
        @keyframes countDown{from{stroke-dashoffset:0}to{stroke-dashoffset:283}}
      `}</style>

      {/* Alarm scan line no topo (step > 0) */}
      {step > 0 && <AlarmLine/>}

      <div style={{position:"relative",zIndex:1,opacity:animIn?1:0,transform:animIn?"translateY(0)":"translateY(12px)",transition:"opacity 0.5s ease,transform 0.5s ease"}}>

        {/* ══ STEP 0 — SOLICITAR SAQUE ══ */}
        {step===0&&(
          <div style={{padding:"52px 20px 40px"}}>
            <p style={{margin:"0 0 4px",fontSize:9,color:T.mid,letterSpacing:3,fontWeight:700}}>C.I.C. — SAQUE PROTEGIDO</p>
            <h1 style={{margin:"0 0 6px",fontSize:30,fontWeight:900,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:-0.5}}>Você quer sacar?</h1>
            <p style={{margin:"0 0 28px",fontSize:13,color:T.mid,lineHeight:1.6}}>Antes de continuar, o sistema vai te mostrar o impacto real dessa decisão.</p>

            {/* Cofre */}
            <div style={{background:`${T.amber}10`,border:`1px solid ${T.amber}30`,borderRadius:18,padding:"18px 20px",marginBottom:24,display:"flex",gap:14,alignItems:"center",animation:"fadeUp 0.4s ease"}}>
              <div style={{position:"relative",flexShrink:0}}>
                <Ring p={pctAtual} color={T.amber} size={64} thick={5}/>
                <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{COFRE.icon}</div>
              </div>
              <div style={{flex:1}}>
                <p style={{margin:"0 0 3px",fontSize:17,fontWeight:800,color:T.white,fontFamily:"'Barlow Condensed',sans-serif"}}>{COFRE.nome}</p>
                <p style={{margin:"0 0 6px",fontSize:12,color:T.mid,fontFamily:"'DM Mono',monospace"}}>{R(COFRE.saldo)} / {R(COFRE.meta)}</p>
                <div style={{display:"flex",gap:10}}>
                  <span style={{fontSize:11,color:T.amber}}>🔥 {COFRE.streak} dias</span>
                  <span style={{fontSize:11,color:T.mid}}>📅 {COFRE.mesesRestantes} meses restantes</span>
                </div>
              </div>
            </div>

            {/* Valor */}
            <div style={{marginBottom:20}}>
              <p style={{margin:"0 0 10px",fontSize:10,color:T.mid,letterSpacing:1.5,fontWeight:700}}>QUANTO DESEJA SACAR?</p>
              <div style={{display:"flex",alignItems:"center",gap:8,background:T.card,border:`1.5px solid ${valor?T.red:T.border}`,borderRadius:14,padding:"14px 18px",transition:"border-color 0.2s"}}>
                <span style={{fontSize:22,fontWeight:700,color:T.red,fontFamily:"'Barlow Condensed',sans-serif",flexShrink:0}}>R$</span>
                <input type="number" value={valor} onChange={e=>setValor(e.target.value)} placeholder="0"
                  style={{flex:1,background:"transparent",border:"none",outline:"none",color:T.white,fontFamily:"'DM Mono',monospace",fontSize:24,fontWeight:600}}/>
              </div>
              {/* Atalhos */}
              <div style={{display:"flex",gap:6,marginTop:10}}>
                {[500,1000,2000].map(v=>(
                  <button key={v} onClick={()=>setValor(String(v))} style={{flex:1,padding:"7px 4px",borderRadius:9,border:`1px solid ${valor===String(v)?T.red:T.border}`,background:valor===String(v)?`${T.red}14`:"transparent",color:valor===String(v)?T.red:T.mid,fontFamily:"'DM Mono',monospace",fontSize:12,cursor:"pointer",transition:"all 0.15s"}}>
                    R${v.toLocaleString("pt-BR")}
                  </button>
                ))}
              </div>
            </div>

            {/* Aviso inicial */}
            {valorNum>0&&(
              <div style={{background:`${T.red}10`,border:`1px solid ${T.red}33`,borderRadius:12,padding:"12px 14px",marginBottom:20,display:"flex",gap:10,alignItems:"flex-start",animation:"fadeIn 0.3s ease"}}>
                <span style={{fontSize:16,flexShrink:0}}>⚠️</span>
                <p style={{margin:0,fontSize:12,color:T.offwhite,lineHeight:1.6}}>Este saque ativará o <strong style={{color:T.red}}>protocolo antissaque</strong> de 5 etapas. O sistema foi projetado para proteger seu sonho.</p>
              </div>
            )}

            <button onClick={()=>{if(valorNum>0) setStep(1);}} disabled={!valorNum} style={{
              width:"100%",padding:"15px",borderRadius:12,border:"none",
              background:valorNum?T.red:T.dim, color:valorNum?"#fff":T.mid,
              fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:18,letterSpacing:1,
              cursor:valorNum?"pointer":"not-allowed",
              boxShadow:valorNum?`0 8px 28px ${T.red}44`:"none",
              transition:"all 0.2s",
            }}>
              INICIAR PROTOCOLO DE SAQUE →
            </button>
          </div>
        )}

        {/* ══ STEP 1 — TEM CERTEZA? ══ */}
        {step===1&&(
          <div style={{padding:"52px 20px 40px",animation:"fadeUp 0.35s ease"}}>
            <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:28}}>
              <button onClick={()=>setStep(0)} style={{width:36,height:36,borderRadius:10,background:T.surface,border:`1px solid ${T.border}`,cursor:"pointer",color:T.mid,fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>←</button>
              <WarningBadge>ETAPA 1 DE 5</WarningBadge>
            </div>

            <div style={{textAlign:"center",marginBottom:28}}>
              <div style={{fontSize:60,marginBottom:14,animation:"shake 0.5s ease 0.3s both"}}>⚠️</div>
              <h1 style={{margin:"0 0 10px",fontSize:30,fontWeight:900,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:-0.3}}>Tem certeza?</h1>
              <p style={{color:T.mid,fontSize:14,lineHeight:1.6,margin:0}}>Você está prestes a sacar <strong style={{color:T.red,fontFamily:"'Barlow Condensed',sans-serif",fontSize:16}}>{R(valorNum)}</strong> do seu cofre.</p>
            </div>

            {/* Score impact */}
            <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:18,marginBottom:20}}>
              <p style={{margin:"0 0 12px",fontSize:10,color:T.mid,letterSpacing:1.5,fontWeight:700}}>IMPACTO NO SEU PERFIL</p>
              <ImpactRow label="Score de Disciplina" value="-15 pontos" color={T.red} icon="📊"/>
              <ImpactRow label={`Streak (${COFRE.streak} dias)`} value="Zerado" color={T.red} icon="🔥"/>
              <ImpactRow label="Nível" value="Pode regredir" color={T.yellow} icon="⬇️"/>
              <ImpactRow label="Guardião notificado" value={COFRE.guardiao} color={T.yellow} icon="👥"/>
            </div>

            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setStep(0)} style={{flex:2,padding:"15px",borderRadius:12,border:"none",background:T.green,color:"#000",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:17,letterSpacing:0.5,cursor:"pointer",boxShadow:`0 6px 22px ${T.green}44`}}>
                🛡️ MANTER MEU SONHO
              </button>
              <button onClick={()=>setStep(2)} style={{flex:1,padding:"15px",borderRadius:12,border:`1px solid ${T.border}`,background:"transparent",color:T.mid,fontFamily:"'Barlow',sans-serif",fontWeight:500,fontSize:13,cursor:"pointer"}}>
                Continuar →
              </button>
            </div>
          </div>
        )}

        {/* ══ STEP 2 — IMPACTO NA META ══ */}
        {step===2&&(
          <div style={{padding:"52px 20px 40px",animation:"fadeUp 0.35s ease"}}>
            <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:28}}>
              <button onClick={()=>setStep(1)} style={{width:36,height:36,borderRadius:10,background:T.surface,border:`1px solid ${T.border}`,cursor:"pointer",color:T.mid,fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>←</button>
              <WarningBadge>ETAPA 2 DE 5</WarningBadge>
            </div>

            <div style={{textAlign:"center",marginBottom:28}}>
              <div style={{fontSize:52,marginBottom:14}}>📅</div>
              <h1 style={{margin:"0 0 10px",fontSize:28,fontWeight:900,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:-0.3,lineHeight:1.1}}>
                Este saque atrasa<br/>sua meta em <span style={{color:T.red}}>{diasAtraso} dias</span>
              </h1>
              <p style={{color:T.mid,fontSize:13,margin:0}}>Você estava a {pctAtual}% do objetivo</p>
            </div>

            {/* Barra antes/depois */}
            <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:20,marginBottom:20}}>
              <p style={{margin:"0 0 14px",fontSize:10,color:T.mid,letterSpacing:1.5,fontWeight:700}}>PROGRESSO DA META</p>

              <div style={{marginBottom:14}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                  <span style={{fontSize:11,color:T.green,fontWeight:700}}>ANTES</span>
                  <span style={{fontSize:11,color:T.green,fontFamily:"'DM Mono',monospace"}}>{R(COFRE.saldo)} · {pctAtual}%</span>
                </div>
                <div style={{height:10,background:T.dim,borderRadius:5,overflow:"hidden"}}>
                  <div style={{height:"100%",background:T.green,width:`${pctAtual}%`,borderRadius:5,boxShadow:`0 0 10px ${T.green}66`}}/>
                </div>
              </div>

              <div>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                  <span style={{fontSize:11,color:T.red,fontWeight:700}}>DEPOIS DO SAQUE</span>
                  <span style={{fontSize:11,color:T.red,fontFamily:"'DM Mono',monospace"}}>{R(metaApos)} · {pctApos}%</span>
                </div>
                <div style={{height:10,background:T.dim,borderRadius:5,overflow:"hidden"}}>
                  <div style={{height:"100%",background:T.red,width:`${pctApos}%`,borderRadius:5,boxShadow:`0 0 10px ${T.red}66`}}/>
                </div>
              </div>

              <div style={{display:"flex",justifyContent:"center",marginTop:16}}>
                <div style={{background:`${T.red}18`,border:`1px solid ${T.red}33`,borderRadius:10,padding:"10px 20px",textAlign:"center"}}>
                  <p style={{margin:0,fontSize:10,color:T.mid,letterSpacing:1}}>RETROCESSO</p>
                  <p style={{margin:"4px 0 0",fontSize:22,fontWeight:900,color:T.red,fontFamily:"'Barlow Condensed',sans-serif"}}>-{pctAtual-pctApos} pontos percentuais</p>
                </div>
              </div>
            </div>

            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setStep(0)} style={{flex:2,padding:"15px",borderRadius:12,border:"none",background:T.green,color:"#000",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:17,letterSpacing:0.5,cursor:"pointer",boxShadow:`0 6px 22px ${T.green}44`}}>
                🛡️ DESISTIR DO SAQUE
              </button>
              <button onClick={()=>setStep(3)} style={{flex:1,padding:"15px",borderRadius:12,border:`1px solid ${T.border}`,background:"transparent",color:T.mid,fontFamily:"'Barlow',sans-serif",fontWeight:500,fontSize:13,cursor:"pointer"}}>
                Continuar →
              </button>
            </div>
          </div>
        )}

        {/* ══ STEP 3 — HORAS DE TRABALHO ══ */}
        {step===3&&(
          <div style={{padding:"52px 20px 40px",animation:"fadeUp 0.35s ease"}}>
            <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:28}}>
              <button onClick={()=>setStep(2)} style={{width:36,height:36,borderRadius:10,background:T.surface,border:`1px solid ${T.border}`,cursor:"pointer",color:T.mid,fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>←</button>
              <WarningBadge>ETAPA 3 DE 5</WarningBadge>
            </div>

            <div style={{textAlign:"center",marginBottom:28}}>
              <div style={{fontSize:52,marginBottom:14}}>⏱️</div>
              <h1 style={{margin:"0 0 10px",fontSize:28,fontWeight:900,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:-0.3,lineHeight:1.1}}>
                Você precisará rodar<br/><span style={{color:T.red}}>{horasTrabalho} horas</span> para recuperar
              </h1>
              <p style={{color:T.mid,fontSize:13,margin:0,lineHeight:1.6}}>São aproximadamente {Math.ceil(horasTrabalho/8)} dias de trabalho para recompor esse valor</p>
            </div>

            {/* Visualização das horas */}
            <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:20,marginBottom:20}}>
              <p style={{margin:"0 0 14px",fontSize:10,color:T.mid,letterSpacing:1.5,fontWeight:700}}>VISUALIZE O ESFORÇO</p>
              <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:14}}>
                {Array.from({length:Math.min(horasTrabalho,40)}).map((_,i)=>(
                  <div key={i} style={{width:24,height:24,borderRadius:4,background:`${T.red}${i<horasTrabalho?'CC':'33'}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,animation:`fadeUp 0.3s ease ${i*0.015}s both`}}>🕐</div>
                ))}
                {horasTrabalho>40&&(
                  <div style={{width:24,height:24,borderRadius:4,background:`${T.red}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:T.mid,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>+{horasTrabalho-40}</div>
                )}
              </div>
              <div style={{background:`${T.red}12`,borderRadius:10,padding:14}}>
                {[
                  [`${R(valorNum)} sacados`,     "Hoje"],
                  [`${horasTrabalho}h de corrida`, "Para recuperar"],
                  [`${Math.ceil(horasTrabalho/8)} dias extras`,  "De trabalho"],
                ].map(([v,l])=>(
                  <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${T.border}`}}>
                    <span style={{fontSize:13,fontWeight:700,color:T.offwhite,fontFamily:"'Barlow Condensed',sans-serif"}}>{v}</span>
                    <span style={{fontSize:11,color:T.mid}}>{l}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setStep(0)} style={{flex:2,padding:"15px",borderRadius:12,border:"none",background:T.green,color:"#000",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:17,letterSpacing:0.5,cursor:"pointer",boxShadow:`0 6px 22px ${T.green}44`}}>
                🛡️ NÃO VALE A PENA
              </button>
              <button onClick={()=>setStep(4)} style={{flex:1,padding:"15px",borderRadius:12,border:`1px solid ${T.border}`,background:"transparent",color:T.mid,fontFamily:"'Barlow',sans-serif",fontWeight:500,fontSize:13,cursor:"pointer"}}>
                Continuar →
              </button>
            </div>
          </div>
        )}

        {/* ══ STEP 4 — IMAGEM DO SONHO ══ */}
        {step===4&&(
          <div style={{padding:"52px 20px 40px",animation:"fadeUp 0.35s ease"}}>
            <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:24}}>
              <button onClick={()=>setStep(3)} style={{width:36,height:36,borderRadius:10,background:T.surface,border:`1px solid ${T.border}`,cursor:"pointer",color:T.mid,fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>←</button>
              <WarningBadge>ETAPA 4 DE 5</WarningBadge>
            </div>

            {/* Hero da meta */}
            <div style={{background:`linear-gradient(135deg,${T.amber}20,${T.amber}08)`,border:`1px solid ${T.amber}40`,borderRadius:22,padding:"32px 24px",marginBottom:22,textAlign:"center",position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:-20,right:-20,fontSize:120,opacity:0.06,transform:"rotate(-15deg)"}}>{COFRE.img}</div>
              <div style={{fontSize:72,marginBottom:16,animation:"pop 0.5s ease both"}}>{COFRE.img}</div>
              <h2 style={{margin:"0 0 8px",fontSize:26,fontWeight:900,fontFamily:"'Barlow Condensed',sans-serif",color:T.white,letterSpacing:-0.3}}>{COFRE.nome}</h2>
              <p style={{margin:"0 0 20px",fontSize:14,color:T.mid,lineHeight:1.6}}>
                Você guardou <strong style={{color:T.amber}}>{R(COFRE.saldo)}</strong> para este sonho.<br/>
                Está a <strong style={{color:T.amber}}>{pctAtual}%</strong> de chegar lá.
              </p>
              <div style={{display:"inline-block",background:`${T.amber}18`,border:`1px solid ${T.amber}44`,borderRadius:12,padding:"12px 24px"}}>
                <p style={{margin:0,fontSize:13,color:T.mid,marginBottom:4}}>Falta apenas</p>
                <p style={{margin:0,fontSize:26,fontWeight:900,color:T.amber,fontFamily:"'Barlow Condensed',sans-serif"}}>{R(COFRE.meta-COFRE.saldo)}</p>
              </div>
            </div>

            <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:"16px 18px",marginBottom:20,display:"flex",gap:12,alignItems:"center"}}>
              <span style={{fontSize:28,flexShrink:0}}>🤖</span>
              <p style={{margin:0,fontSize:13,color:T.offwhite,lineHeight:1.7}}>
                <strong style={{color:T.amber}}>Vale a pena abrir mão deste objetivo agora?</strong><br/>
                Com {COFRE.streak} dias de disciplina, você está mais perto do que imagina. Este saque vai atrasar tudo em {diasAtraso} dias.
              </p>
            </div>

            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setStep(0)} style={{flex:3,padding:"17px",borderRadius:12,border:"none",background:T.amber,color:"#000",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:18,letterSpacing:0.5,cursor:"pointer",boxShadow:`0 8px 28px ${T.amber}55`,animation:"pulseAmber 2s infinite"}}
                onMouseOver={e=>e.currentTarget.style.animation="none"}
                onMouseOut={e=>e.currentTarget.style.animation="pulseAmber 2s infinite"}
              >
                🛡️ MANTER MEU SONHO
              </button>
              <button onClick={()=>setStep(5)} style={{flex:1,padding:"17px",borderRadius:12,border:`1px solid ${T.border}`,background:"transparent",color:T.mid,fontFamily:"'Barlow',sans-serif",fontWeight:500,fontSize:12,cursor:"pointer",lineHeight:1.3,textAlign:"center"}}>
                Sacar<br/>mesmo assim
              </button>
            </div>
          </div>
        )}

        {/* ══ STEP 5 — BOTÃO DE 5 SEGUNDOS ══ */}
        {step===5&&(
          <div style={{padding:"52px 20px 40px",animation:"fadeUp 0.35s ease"}}>
            <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:28}}>
              <button onClick={()=>setStep(4)} style={{width:36,height:36,borderRadius:10,background:T.surface,border:`1px solid ${T.border}`,cursor:"pointer",color:T.mid,fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>←</button>
              <WarningBadge>ETAPA 5 DE 5 — CONFIRMAÇÃO FINAL</WarningBadge>
            </div>

            {/* Resumo do saque */}
            <div style={{background:`${T.red}0E`,border:`1px solid ${T.red}33`,borderRadius:18,padding:"20px",marginBottom:24,position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:0,left:0,right:0}}>
                <AlarmLine/>
              </div>
              <div style={{textAlign:"center",paddingTop:8}}>
                <p style={{margin:"0 0 6px",fontSize:10,color:T.red,letterSpacing:2,fontWeight:700}}>VOCÊ ESTÁ SACANDO</p>
                <p style={{margin:"0 0 4px",fontSize:44,fontWeight:900,fontFamily:"'Barlow Condensed',sans-serif",color:T.red,letterSpacing:-1}}>{R(valorNum)}</p>
                <p style={{margin:0,fontSize:12,color:T.mid}}>do cofre <strong style={{color:T.offwhite}}>{COFRE.nome}</strong></p>
              </div>
              <div style={{height:1,background:T.border,margin:"16px 0"}}/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {[
                  {label:"Score perdido",   val:"-15 pts", cor:T.red},
                  {label:"Streak perdido",  val:`${COFRE.streak}d zerado`, cor:T.red},
                  {label:"Atraso na meta",  val:`+${diasAtraso}d`, cor:T.yellow},
                  {label:"Guardião",        val:"Notificado", cor:T.yellow},
                ].map(({label,val,cor})=>(
                  <div key={label} style={{background:`${T.red}0A`,borderRadius:8,padding:"8px 10px",textAlign:"center"}}>
                    <p style={{margin:"0 0 3px",fontSize:9,color:T.mid,letterSpacing:0.5}}>{label}</p>
                    <p style={{margin:0,fontSize:13,fontWeight:800,color:cor,fontFamily:"'Barlow Condensed',sans-serif"}}>{val}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Aviso final */}
            <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:"14px 16px",marginBottom:24,display:"flex",gap:10}}>
              <span style={{fontSize:18,flexShrink:0}}>🤖</span>
              <p style={{margin:0,fontSize:12,color:T.mid,lineHeight:1.65}}>Esta é sua última chance de proteger o sonho. Se ainda quiser continuar, pressione e <strong style={{color:T.white}}>segure o botão por 5 segundos</strong> sem soltar.</p>
            </div>

            {/* Botão segurar */}
            <HoldButton duration={5000} onComplete={()=>setConcluido(true)}/>

            <button onClick={()=>setStep(0)} style={{width:"100%",marginTop:14,padding:"14px",borderRadius:12,border:"none",background:T.amber,color:"#000",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:16,letterSpacing:0.5,cursor:"pointer",boxShadow:`0 6px 20px ${T.amber}44`}}>
              🛡️ CANCELAR — PROTEGER MEU SONHO
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
