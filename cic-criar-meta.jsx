import { useState, useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════════════════════
   C.I.C. — Tela 2: Criar Meta
   IA sugere valor, prazo, probabilidade de conclusão
   Aesthetic: editorial precision meets industrial warmth
   Every field feels intentional. Every step builds momentum.
═══════════════════════════════════════════════════════════════ */

const FL = () => (
  <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@300;400;500;600;700;800;900&family=Barlow:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
);

const T = {
  bg:      "#060608",
  bg2:     "#0C0C10",
  surface: "#111116",
  card:    "#16161C",
  border:  "#1E1E28",
  amber:   "#F5A623",
  amberL:  "#FFB84D",
  amberD:  "#C47F0A",
  green:   "#22C55E",
  red:     "#EF4444",
  yellow:  "#EAB308",
  blue:    "#3B82F6",
  teal:    "#14B8A6",
  white:   "#F0EDE6",
  offwhite:"#C8C5BE",
  mid:     "#6B6870",
  dim:     "#2A2830",
};

/* ── METAS SUGERIDAS ── */
const METAS_CATALOGO = [
  { id:"carro",    icon:"🚗", nome:"Trocar de Carro",      valorBase:18000, meses:18, desc:"Entrada ou troca direta", cor:T.amber  },
  { id:"casa",     icon:"🏠", nome:"Entrada da Casa",      valorBase:50000, meses:36, desc:"10% do imóvel",          cor:T.blue   },
  { id:"reserva",  icon:"🛡️", nome:"Reserva de Emergência",valorBase:5000,  meses:8,  desc:"6 meses de despesas",    cor:T.teal   },
  { id:"ipva",     icon:"📋", nome:"IPVA + Licenciamento", valorBase:2400,  meses:10, desc:"Planejamento anual",      cor:T.yellow },
  { id:"moto",     icon:"🏍️", nome:"Comprar uma Moto",     valorBase:12000, meses:14, desc:"Moto seminova",          cor:"#E879F9" },
  { id:"seguro",   icon:"🛡️", nome:"Seguro do Carro",      valorBase:3600,  meses:12, desc:"Proteção completa",      cor:T.green  },
  { id:"revisao",  icon:"🔧", nome:"Revisão do Carro",     valorBase:800,   meses:3,  desc:"Preventiva semestral",   cor:"#FB923C" },
  { id:"estudos",  icon:"📚", nome:"Estudos / Cursos",     valorBase:4000,  meses:12, desc:"Investimento em você",   cor:T.blue   },
  { id:"dividas",  icon:"💳", nome:"Quitar Dívidas",       valorBase:0,     meses:12, desc:"Valor personalizado",    cor:T.red    },
  { id:"ferias",   icon:"✈️", nome:"Férias em Família",    valorBase:6000,  meses:8,  desc:"Viagem dos sonhos",      cor:"#F472B6" },
  { id:"celular",  icon:"📱", nome:"Celular Novo",         valorBase:3000,  meses:6,  desc:"Aparelho de trabalho",   cor:T.teal   },
  { id:"livre",    icon:"🎯", nome:"Meta Personalizada",   valorBase:0,     meses:0,  desc:"Você define tudo",       cor:T.amber  },
];

const REGRAS_AUTO = [
  { id:"diario",   label:"R$ fixo por dia",    icon:"📅", exemplo:"R$ 15/dia" },
  { id:"semanal",  label:"R$ fixo por semana", icon:"🗓️", exemplo:"R$ 80/semana" },
  { id:"percentual",label:"% da receita semanal",icon:"📊",exemplo:"5% da receita" },
  { id:"manual",   label:"Aportes manuais",    icon:"✋", exemplo:"Quando quiser" },
];

/* ── HELPERS ── */
const R   = v => `R$\u00a0${Number(v).toLocaleString("pt-BR",{minimumFractionDigits:2})}`;
const fmtM = m => m>=12?`${Math.floor(m/12)}a${m%12?` ${m%12}m`:""}`:`${m}m`;

function calcProb(valorMeta, meses, aporteMensal) {
  if(!valorMeta||!meses||!aporteMensal) return 0;
  const necessario = valorMeta / meses;
  const ratio = aporteMensal / necessario;
  if(ratio >= 1.2) return 95;
  if(ratio >= 1.0) return 82;
  if(ratio >= 0.8) return 65;
  if(ratio >= 0.6) return 44;
  return 22;
}

function probColor(p) {
  if(p>=80) return T.green;
  if(p>=50) return T.yellow;
  return T.red;
}

function probLabel(p) {
  if(p>=80) return "Alta probabilidade";
  if(p>=50) return "Probabilidade média";
  return "Probabilidade baixa";
}

/* ── TYPING EFFECT ── */
function useTyping(text, speed=28, trigger=true) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    if(!trigger) return;
    setDisplayed("");
    let i = 0;
    const t = setInterval(() => {
      i++;
      setDisplayed(text.slice(0,i));
      if(i>=text.length) clearInterval(t);
    }, speed);
    return () => clearInterval(t);
  }, [text, trigger]);
  return displayed;
}

/* ── IA SUGESTAO ── */
function IASugestao({ meta, aporteMensal, meses, show }) {
  const prob = calcProb(meta?.valorBase||0, meses, aporteMensal);
  const porDia = aporteMensal ? Math.ceil(aporteMensal/30) : 0;
  const porSemana = aporteMensal ? Math.ceil(aporteMensal/4) : 0;

  let msg = "";
  if(!meta) msg = "Selecione uma meta acima e eu vou te ajudar a planejar.";
  else if(!aporteMensal) msg = `Para ${meta.nome}, eu recomendo guardar ${R(Math.ceil(meta.valorBase/meta.meses))} por mês. Isso garante alta probabilidade de concluir no prazo.`;
  else if(prob>=80) msg = `Perfeito! Com ${R(aporteMensal)}/mês você tem ${prob}% de chance de concluir ${meta.nome} em ${fmtM(meses)}. Continue assim! 💪`;
  else if(prob>=50) msg = `Você está no caminho certo, mas aumentar para ${R(Math.ceil(meta.valorBase/meses))} por mês vai garantir a meta. Posso ativar o modo automático pra te ajudar.`;
  else msg = `Com esse valor, o risco de não concluir é alto. Recomendo pelo menos ${R(Math.ceil(meta.valorBase/meses*0.8))}/mês. Cada R$10 a mais faz diferença.`;

  const typed = useTyping(msg, 22, show && !!msg);

  if(!show) return null;
  return (
    <div style={{
      background:`linear-gradient(135deg,${T.amber}10,${T.amber}05)`,
      border:`1px solid ${T.amber}33`,
      borderRadius:16, padding:"16px 18px",
      animation:"fadeUp 0.4s ease",
    }}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
        <div style={{width:32,height:32,borderRadius:10,background:`linear-gradient(135deg,${T.amber},${T.amberD})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>🤖</div>
        <span style={{fontSize:10,fontWeight:800,color:T.amber,letterSpacing:2}}>C.I.C. IA</span>
        <div style={{width:6,height:6,borderRadius:"50%",background:T.green,marginLeft:"auto",animation:"pulse 2s infinite"}}/>
      </div>
      <p style={{margin:0,fontSize:14,color:T.offwhite,lineHeight:1.65,fontFamily:"'Barlow',sans-serif",minHeight:44}}>{typed}<span style={{opacity:typed.length<msg.length?1:0,animation:"blink 0.8s infinite"}}>|</span></p>
      {meta && aporteMensal > 0 && (
        <div style={{display:"flex",gap:8,marginTop:14}}>
          {[
            {label:"Por dia",val:R(porDia)},
            {label:"Por semana",val:R(porSemana)},
            {label:"Probabilidade",val:`${prob}%`,color:probColor(prob)},
          ].map(({label,val,color})=>(
            <div key={label} style={{flex:1,background:"rgba(0,0,0,0.3)",borderRadius:10,padding:"8px 6px",textAlign:"center"}}>
              <p style={{margin:0,fontSize:8,color:T.mid,letterSpacing:1,marginBottom:3}}>{label.toUpperCase()}</p>
              <p style={{margin:0,fontSize:13,fontWeight:800,color:color||T.amber,fontFamily:"'Barlow Condensed',sans-serif"}}>{val}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── BARRA DE PROBABILIDADE ── */
function ProbBar({ prob }) {
  const color = probColor(prob);
  const label = probLabel(prob);
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <span style={{fontSize:10,color:T.mid,letterSpacing:1.5,fontWeight:700}}>PROBABILIDADE DE CONCLUSÃO</span>
        <span style={{fontSize:12,fontWeight:800,color,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:0.5}}>{prob}% — {label}</span>
      </div>
      <div style={{height:10,background:T.dim,borderRadius:5,overflow:"hidden",position:"relative"}}>
        <div style={{position:"absolute",inset:0,background:`linear-gradient(90deg,${T.red} 0%,${T.yellow} 45%,${T.green} 75%)`,opacity:0.25}}/>
        <div style={{height:"100%",borderRadius:5,background:color,width:`${prob}%`,transition:"width 0.8s cubic-bezier(.4,0,.2,1)",boxShadow:`0 0 14px ${color}88`}}/>
      </div>
    </div>
  );
}

/* ── STEP INDICATOR ── */
function Steps({ current, total=4 }) {
  const labels = ["Meta","Valores","Automação","Confirmar"];
  return (
    <div style={{display:"flex",gap:0,alignItems:"center"}}>
      {Array.from({length:total}).map((_,i)=>(
        <div key={i} style={{display:"flex",alignItems:"center",flex:i<total-1?1:"auto"}}>
          <div style={{
            width:28,height:28,borderRadius:"50%",
            background:i<current?T.amber:i===current?T.amber:T.dim,
            border:`2px solid ${i<=current?T.amber:T.border}`,
            display:"flex",alignItems:"center",justifyContent:"center",
            flexShrink:0,transition:"all 0.3s",
          }}>
            {i<current
              ? <span style={{fontSize:13}}>✓</span>
              : <span style={{fontSize:10,fontWeight:800,color:i===current?"#000":T.mid,fontFamily:"'Barlow Condensed',sans-serif"}}>{i+1}</span>
            }
          </div>
          {i<total-1&&<div style={{flex:1,height:2,background:i<current?T.amber:T.dim,margin:"0 4px",transition:"background 0.3s"}}/>}
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TELA CRIAR META
══════════════════════════════════════════════════════════════ */
export default function CriarMeta() {
  const [step, setStep] = useState(0);
  const [metaSel, setMetaSel] = useState(null);
  const [nomeCustom, setNomeCustom] = useState("");
  const [valorMeta, setValorMeta] = useState("");
  const [meses, setMeses] = useState("");
  const [aporteMensal, setAporteMensal] = useState("");
  const [regraAuto, setRegraAuto] = useState("diario");
  const [valorRegra, setValorRegra] = useState("");
  const [guardiao, setGuardiao] = useState("");
  const [lockType, setLockType] = useState("carencia");
  const [fotoEmoji, setFotoEmoji] = useState("");
  const [done, setDone] = useState(false);
  const [animIn, setAnimIn] = useState(false);
  const [iaVisible, setIaVisible] = useState(false);

  useEffect(()=>{ setTimeout(()=>setAnimIn(true),80); },[]);
  useEffect(()=>{
    if(step===1) setTimeout(()=>setIaVisible(true),600);
    else setIaVisible(false);
  },[step]);

  const prob = calcProb(
    Number(valorMeta)||metaSel?.valorBase||0,
    Number(meses)||metaSel?.meses||0,
    Number(aporteMensal)||(metaSel?Math.ceil((metaSel.valorBase||0)/(metaSel.meses||1)):0)
  );

  const valorFinal = Number(valorMeta)||metaSel?.valorBase||0;
  const mesesFinal = Number(meses)||metaSel?.meses||0;
  const aporteFinal = Number(aporteMensal)||(valorFinal&&mesesFinal?Math.ceil(valorFinal/mesesFinal):0);
  const porDia = aporteFinal?Math.ceil(aporteFinal/30):0;

  function handleMetaSel(m) {
    setMetaSel(m);
    setValorMeta(m.valorBase?String(m.valorBase):"");
    setMeses(m.meses?String(m.meses):"");
    setFotoEmoji(m.icon);
    setStep(1);
  }

  function confirmar() {
    setDone(true);
  }

  /* ── TELA SUCESSO ── */
  if(done) return (
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 24px",fontFamily:"'Barlow',sans-serif",color:T.white}}>
      <FL/>
      <style>{`@keyframes pop{0%{transform:scale(0.3);opacity:0}60%{transform:scale(1.15)}100%{transform:scale(1);opacity:1}} @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
      <div style={{fontSize:80,animation:"pop 0.6s cubic-bezier(.36,.07,.19,.97) both",marginBottom:24}}>🎯</div>
      <h1 style={{margin:"0 0 8px",fontSize:32,fontWeight:900,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:-0.5,textAlign:"center"}}>
        Cofre criado!
      </h1>
      <p style={{color:T.mid,textAlign:"center",marginBottom:32,fontSize:15}}>Sua meta está protegida e pronta para ser conquistada.</p>
      <div style={{width:"100%",maxWidth:360,background:T.card,border:`1px solid ${T.border}`,borderRadius:20,padding:24,marginBottom:24,animation:"fadeUp 0.5s ease 0.3s both"}}>
        <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:20}}>
          <span style={{fontSize:40}}>{fotoEmoji||metaSel?.icon||"🎯"}</span>
          <div>
            <p style={{margin:0,fontSize:20,fontWeight:800,color:T.white,fontFamily:"'Barlow Condensed',sans-serif"}}>{nomeCustom||metaSel?.nome}</p>
            <p style={{margin:"3px 0 0",fontSize:12,color:T.mid}}>Meta criada agora</p>
          </div>
        </div>
        {[
          ["Valor da meta",   R(valorFinal)],
          ["Prazo",           `${mesesFinal} meses`],
          ["Aporte mensal",   R(aporteFinal)],
          ["Guardar por dia", R(porDia)],
          ["Probabilidade",   `${prob}%`],
          ["Bloqueio",        lockType==="carencia"?"CDB com carência":"Psicológico"],
          ["Guardião",        guardiao||"Nenhum"],
          ["Automação",       regraAuto==="manual"?"Manual":REGRAS_AUTO.find(r=>r.id===regraAuto)?.label||"-"],
        ].map(([k,v])=>(
          <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${T.border}`}}>
            <span style={{fontSize:12,color:T.mid}}>{k}</span>
            <span style={{fontSize:12,fontWeight:700,color:T.white,fontFamily:"'DM Mono',monospace"}}>{v}</span>
          </div>
        ))}
      </div>
      <button onClick={()=>{ setStep(0); setDone(false); setMetaSel(null); }} style={{width:"100%",maxWidth:360,padding:"15px",borderRadius:12,border:"none",background:T.amber,color:"#000",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:18,letterSpacing:1,cursor:"pointer",boxShadow:`0 8px 28px ${T.amber}55`}}>
        IR PARA O DASHBOARD →
      </button>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:T.bg,fontFamily:"'Barlow',sans-serif",color:T.white,maxWidth:440,margin:"0 auto",position:"relative"}}>
      <FL/>
      <style>{`
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
        input::placeholder{color:#3a3a48;}
        ::-webkit-scrollbar{display:none;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes pop{0%{transform:scale(0.3);opacity:0}60%{transform:scale(1.15)}100%{transform:scale(1);opacity:1}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes shimmer{0%{opacity:0.5}50%{opacity:1}100%{opacity:0.5}}
        .meta-card:hover{transform:translateY(-3px)!important;border-color:var(--cor)!important;}
        .meta-card{transition:transform 0.18s,border-color 0.18s;}
      `}</style>

      {/* Ambient */}
      <div style={{position:"fixed",top:-80,left:-60,width:280,height:280,background:`radial-gradient(circle,${T.amber}0C 0%,transparent 70%)`,pointerEvents:"none",zIndex:0}}/>

      <div style={{position:"relative",zIndex:1,opacity:animIn?1:0,transform:animIn?"translateY(0)":"translateY(12px)",transition:"opacity 0.5s ease,transform 0.5s ease",paddingBottom:60}}>

        {/* ── HEADER ── */}
        <div style={{padding:"52px 20px 20px",borderBottom:`1px solid ${T.border}`}}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
            {step>0&&(
              <button onClick={()=>setStep(s=>Math.max(0,s-1))} style={{width:36,height:36,borderRadius:10,background:T.surface,border:`1px solid ${T.border}`,cursor:"pointer",color:T.mid,fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>←</button>
            )}
            <div style={{flex:1}}>
              <p style={{margin:"0 0 2px",fontSize:9,color:T.amber,letterSpacing:3,fontWeight:700}}>C.I.C. — CRIAR META</p>
              <h1 style={{margin:0,fontSize:24,fontWeight:900,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:-0.3}}>
                {step===0&&"Qual é o seu sonho?"}
                {step===1&&"Vamos planejar juntos"}
                {step===2&&"Proteção automática"}
                {step===3&&"Confirmar e criar"}
              </h1>
            </div>
          </div>
          <Steps current={step}/>
        </div>

        {/* ══ STEP 0 — ESCOLHER META ══ */}
        {step===0&&(
          <div style={{padding:"24px 20px"}}>
            <p style={{margin:"0 0 16px",fontSize:13,color:T.mid,lineHeight:1.6}}>Escolha uma meta ou crie uma personalizada. A IA vai te ajudar a calcular o valor e o prazo ideal.</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {METAS_CATALOGO.map((m,i)=>(
                <div key={m.id}
                  className="meta-card"
                  onClick={()=>handleMetaSel(m)}
                  style={{"--cor":m.cor,background:metaSel?.id===m.id?`${m.cor}18`:T.card,border:`1.5px solid ${metaSel?.id===m.id?m.cor:T.border}`,borderRadius:16,padding:"16px 14px",cursor:"pointer",animation:`fadeUp 0.4s ease ${i*0.04}s both`,position:"relative",overflow:"hidden"}}
                >
                  <div style={{position:"absolute",top:-8,right:-8,fontSize:36,opacity:0.07}}>{m.icon}</div>
                  <div style={{fontSize:26,marginBottom:8}}>{m.icon}</div>
                  <p style={{margin:"0 0 3px",fontSize:13,fontWeight:700,color:T.white,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:0.3,lineHeight:1.2}}>{m.nome}</p>
                  <p style={{margin:"0 0 8px",fontSize:10,color:T.mid}}>{m.desc}</p>
                  {m.valorBase>0&&(
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <div style={{width:4,height:4,borderRadius:"50%",background:m.cor,flexShrink:0}}/>
                      <span style={{fontSize:11,fontWeight:700,color:m.cor,fontFamily:"'Barlow Condensed',sans-serif"}}>~{R(m.valorBase)}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ STEP 1 — VALORES + IA ══ */}
        {step===1&&(
          <div style={{padding:"24px 20px",display:"flex",flexDirection:"column",gap:16}}>

            {/* Meta selecionada */}
            <div style={{background:T.card,border:`1.5px solid ${metaSel?.cor||T.amber}44`,borderRadius:16,padding:"14px 16px",display:"flex",alignItems:"center",gap:12}}>
              <span style={{fontSize:32}}>{metaSel?.icon||"🎯"}</span>
              <div style={{flex:1}}>
                <p style={{margin:0,fontSize:16,fontWeight:800,color:T.white,fontFamily:"'Barlow Condensed',sans-serif"}}>{metaSel?.nome}</p>
                <p style={{margin:"3px 0 0",fontSize:11,color:T.mid}}>{metaSel?.desc}</p>
              </div>
              <button onClick={()=>setStep(0)} style={{background:"transparent",border:`1px solid ${T.border}`,borderRadius:8,padding:"4px 10px",color:T.mid,fontSize:11,cursor:"pointer",fontFamily:"'Barlow',sans-serif",fontWeight:600}}>Trocar</button>
            </div>

            {/* Nome customizado */}
            {metaSel?.id==="livre"&&(
              <div>
                <p style={{margin:"0 0 8px",fontSize:10,color:T.mid,letterSpacing:1.5,fontWeight:700}}>NOME DA META</p>
                <input value={nomeCustom} onChange={e=>setNomeCustom(e.target.value)} placeholder="Ex: Quitação do Carro"
                  style={{width:"100%",padding:"13px 15px",borderRadius:11,background:T.surface,border:`1px solid ${T.border}`,color:T.white,fontFamily:"'Barlow',sans-serif",fontSize:15,outline:"none"}}/>
              </div>
            )}

            {/* Valor */}
            <div>
              <p style={{margin:"0 0 8px",fontSize:10,color:T.mid,letterSpacing:1.5,fontWeight:700}}>VALOR DA META</p>
              <div style={{display:"flex",alignItems:"center",gap:8,background:T.surface,border:`1.5px solid ${valorMeta?T.amber:T.border}`,borderRadius:12,padding:"12px 16px",transition:"border-color 0.2s"}}>
                <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:20,fontWeight:700,color:T.amber}}>R$</span>
                <input type="number" value={valorMeta} onChange={e=>setValorMeta(e.target.value)} placeholder={metaSel?.valorBase?String(metaSel.valorBase):"0"}
                  style={{flex:1,background:"transparent",border:"none",outline:"none",color:T.white,fontFamily:"'DM Mono',monospace",fontSize:22,fontWeight:600}}/>
              </div>
              {/* Sugestões rápidas de valor */}
              {metaSel?.valorBase>0&&(
                <div style={{display:"flex",gap:6,marginTop:8}}>
                  {[0.8,1,1.2].map(mult=>{
                    const v=Math.round(metaSel.valorBase*mult/100)*100;
                    return(
                      <button key={mult} onClick={()=>setValorMeta(String(v))} style={{flex:1,padding:"6px",borderRadius:8,border:`1px solid ${valorMeta===String(v)?T.amber:T.border}`,background:valorMeta===String(v)?`${T.amber}18`:"transparent",color:valorMeta===String(v)?T.amber:T.mid,fontFamily:"'DM Mono',monospace",fontSize:11,cursor:"pointer",transition:"all 0.15s"}}>
                        {R(v)}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Prazo */}
            <div>
              <p style={{margin:"0 0 8px",fontSize:10,color:T.mid,letterSpacing:1.5,fontWeight:700}}>PRAZO</p>
              <div style={{display:"flex",gap:8,alignItems:"center",background:T.surface,border:`1.5px solid ${meses?T.amber:T.border}`,borderRadius:12,padding:"12px 16px"}}>
                <input type="number" value={meses} onChange={e=>setMeses(e.target.value)} placeholder={metaSel?.meses?String(metaSel.meses):"12"}
                  style={{flex:1,background:"transparent",border:"none",outline:"none",color:T.white,fontFamily:"'DM Mono',monospace",fontSize:22,fontWeight:600}}/>
                <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:14,color:T.mid,fontWeight:600}}>MESES</span>
              </div>
              {/* Sugestões de prazo */}
              <div style={{display:"flex",gap:6,marginTop:8}}>
                {[3,6,12,18,24].map(m=>(
                  <button key={m} onClick={()=>setMeses(String(m))} style={{flex:1,padding:"6px 4px",borderRadius:8,border:`1px solid ${meses===String(m)?T.amber:T.border}`,background:meses===String(m)?`${T.amber}18`:"transparent",color:meses===String(m)?T.amber:T.mid,fontFamily:"'Barlow Condensed',sans-serif",fontSize:11,fontWeight:700,cursor:"pointer",transition:"all 0.15s"}}>
                    {m}m
                  </button>
                ))}
              </div>
            </div>

            {/* Aporte mensal */}
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <p style={{margin:0,fontSize:10,color:T.mid,letterSpacing:1.5,fontWeight:700}}>QUANTO PODE GUARDAR POR MÊS?</p>
                {valorMeta&&meses&&(
                  <button onClick={()=>setAporteMensal(String(Math.ceil(Number(valorMeta||metaSel?.valorBase||0)/Number(meses||metaSel?.meses||1))))} style={{background:`${T.amber}18`,border:`1px solid ${T.amber}33`,borderRadius:6,padding:"3px 8px",color:T.amber,fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"'Barlow',sans-serif"}}>
                    Usar sugerido
                  </button>
                )}
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8,background:T.surface,border:`1.5px solid ${aporteMensal?T.amber:T.border}`,borderRadius:12,padding:"12px 16px"}}>
                <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:20,fontWeight:700,color:T.amber}}>R$</span>
                <input type="number" value={aporteMensal} onChange={e=>setAporteMensal(e.target.value)} placeholder={valorMeta&&meses?String(Math.ceil(Number(valorMeta)/Number(meses))):"0"}
                  style={{flex:1,background:"transparent",border:"none",outline:"none",color:T.white,fontFamily:"'DM Mono',monospace",fontSize:22,fontWeight:600}}/>
                <span style={{fontSize:10,color:T.mid,fontFamily:"'Barlow',sans-serif"}}>/mês</span>
              </div>
            </div>

            {/* Prob bar */}
            {(valorMeta||metaSel?.valorBase)&&meses&&aporteMensal&&(
              <div style={{animation:"fadeIn 0.4s ease"}}>
                <ProbBar prob={prob}/>
              </div>
            )}

            {/* IA Sugestão */}
            <IASugestao
              meta={metaSel}
              aporteMensal={Number(aporteMensal)||(metaSel?Math.ceil((metaSel.valorBase||0)/(metaSel.meses||1)):0)}
              meses={Number(meses)||metaSel?.meses||0}
              show={iaVisible}
            />

            <button onClick={()=>setStep(2)} disabled={!valorMeta&&!metaSel?.valorBase} style={{width:"100%",padding:"15px",borderRadius:12,border:"none",background:(valorMeta||metaSel?.valorBase)?T.amber:"#2A2830",color:(valorMeta||metaSel?.valorBase)?"#000":T.mid,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:18,letterSpacing:1,cursor:(valorMeta||metaSel?.valorBase)?"pointer":"not-allowed",boxShadow:(valorMeta||metaSel?.valorBase)?`0 8px 28px ${T.amber}55`:"none",transition:"all 0.2s"}}>
              PRÓXIMO →
            </button>
          </div>
        )}

        {/* ══ STEP 2 — AUTOMAÇÃO + PROTEÇÃO ══ */}
        {step===2&&(
          <div style={{padding:"24px 20px",display:"flex",flexDirection:"column",gap:18}}>

            {/* Automação */}
            <div>
              <p style={{margin:"0 0 12px",fontSize:10,color:T.mid,letterSpacing:1.5,fontWeight:700}}>MODO DE APORTE</p>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {REGRAS_AUTO.map(r=>(
                  <div key={r.id} onClick={()=>setRegraAuto(r.id)} style={{background:regraAuto===r.id?`${T.amber}14`:T.card,border:`1.5px solid ${regraAuto===r.id?T.amber:T.border}`,borderRadius:14,padding:"14px 16px",cursor:"pointer",display:"flex",gap:12,alignItems:"center",transition:"all 0.15s"}}>
                    <div style={{width:36,height:36,borderRadius:10,background:regraAuto===r.id?`${T.amber}22`:T.surface,border:`1px solid ${regraAuto===r.id?T.amber:T.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0,transition:"all 0.15s"}}>{r.icon}</div>
                    <div style={{flex:1}}>
                      <p style={{margin:0,fontSize:13,fontWeight:700,color:regraAuto===r.id?T.amber:T.white,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:0.3}}>{r.label}</p>
                      <p style={{margin:"2px 0 0",fontSize:11,color:T.mid}}>{r.exemplo}</p>
                    </div>
                    <div style={{width:20,height:20,borderRadius:"50%",border:`2px solid ${regraAuto===r.id?T.amber:T.border}`,background:regraAuto===r.id?T.amber:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.15s"}}>
                      {regraAuto===r.id&&<div style={{width:8,height:8,borderRadius:"50%",background:"#000"}}/>}
                    </div>
                  </div>
                ))}
              </div>
              {regraAuto!=="manual"&&(
                <div style={{marginTop:12,background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:"12px 16px",display:"flex",gap:8,alignItems:"center"}}>
                  <span style={{color:T.mid,fontSize:12,fontFamily:"'Barlow',sans-serif"}}>Valor:</span>
                  <span style={{color:T.amber,fontFamily:"'Barlow Condensed',sans-serif",fontSize:16,fontWeight:700}}>R$</span>
                  <input type="number" value={valorRegra} onChange={e=>setValorRegra(e.target.value)} placeholder={regraAuto==="percentual"?"5":String(porDia||15)} style={{flex:1,background:"transparent",border:"none",outline:"none",color:T.white,fontFamily:"'DM Mono',monospace",fontSize:18,fontWeight:600}}/>
                  <span style={{color:T.mid,fontSize:11}}>{regraAuto==="percentual"?"%":"reais"}</span>
                </div>
              )}
            </div>

            {/* Bloqueio */}
            <div>
              <p style={{margin:"0 0 12px",fontSize:10,color:T.mid,letterSpacing:1.5,fontWeight:700}}>NÍVEL DE PROTEÇÃO</p>
              {[
                {id:"carencia",icon:"🔒",title:"Bloqueio Real — CDB",desc:"Dinheiro rende CDI. Sacar antes perde os últimos 30 dias de rendimento.",tag:"Recomendado",cor:T.amber},
                {id:"psicologico",icon:"🧠",title:"Bloqueio Comportamental",desc:"Fricção máxima no saque: 5 telas + botão de 5 segundos + guardião notificado.",tag:"Mais flexível",cor:T.teal},
              ].map(opt=>(
                <div key={opt.id} onClick={()=>setLockType(opt.id)} style={{background:lockType===opt.id?`${opt.cor}14`:T.card,border:`1.5px solid ${lockType===opt.id?opt.cor:T.border}`,borderRadius:14,padding:"14px 16px",cursor:"pointer",marginBottom:8,transition:"all 0.15s"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
                    <span style={{fontSize:22}}>{opt.icon}</span>
                    <span style={{flex:1,fontSize:14,fontWeight:700,color:T.white,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:0.3}}>{opt.title}</span>
                    <span style={{fontSize:9,fontWeight:800,color:opt.cor,background:`${opt.cor}18`,padding:"2px 8px",borderRadius:6,letterSpacing:1}}>{opt.tag}</span>
                  </div>
                  <p style={{margin:0,fontSize:12,color:T.mid,lineHeight:1.6}}>{opt.desc}</p>
                </div>
              ))}
            </div>

            {/* Guardião */}
            <div>
              <p style={{margin:"0 0 6px",fontSize:10,color:T.mid,letterSpacing:1.5,fontWeight:700}}>GUARDIÃO (OPCIONAL)</p>
              <p style={{margin:"0 0 10px",fontSize:12,color:T.mid,lineHeight:1.5}}>Alguém de confiança que será notificado se você tentar sacar antes do prazo. Aumenta 3x as chances de concluir a meta.</p>
              <input value={guardiao} onChange={e=>setGuardiao(e.target.value)} placeholder="Ex: Maria (esposa) · Pedro (irmão)"
                style={{width:"100%",padding:"13px 15px",borderRadius:11,background:T.surface,border:`1px solid ${guardiao?T.amber:T.border}`,color:T.white,fontFamily:"'Barlow',sans-serif",fontSize:14,outline:"none",transition:"border-color 0.2s"}}/>
            </div>

            <button onClick={()=>setStep(3)} style={{width:"100%",padding:"15px",borderRadius:12,border:"none",background:T.amber,color:"#000",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:18,letterSpacing:1,cursor:"pointer",boxShadow:`0 8px 28px ${T.amber}55`}}>
              PRÓXIMO →
            </button>
          </div>
        )}

        {/* ══ STEP 3 — CONFIRMAR ══ */}
        {step===3&&(
          <div style={{padding:"24px 20px"}}>
            {/* Preview da meta */}
            <div style={{background:`linear-gradient(135deg,${metaSel?.cor||T.amber}18,${metaSel?.cor||T.amber}06)`,border:`1px solid ${metaSel?.cor||T.amber}33`,borderRadius:20,padding:"20px",marginBottom:20,position:"relative",overflow:"hidden",animation:"fadeUp 0.4s ease"}}>
              <div style={{position:"absolute",top:-16,right:-16,fontSize:72,opacity:0.08}}>{metaSel?.icon}</div>
              <div style={{display:"flex",gap:14,alignItems:"center",marginBottom:16}}>
                <span style={{fontSize:40}}>{fotoEmoji||metaSel?.icon||"🎯"}</span>
                <div>
                  <p style={{margin:0,fontSize:22,fontWeight:900,color:T.white,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:-0.3}}>{nomeCustom||metaSel?.nome}</p>
                  <p style={{margin:"4px 0 0",fontSize:11,color:T.mid}}>Meta criada agora · Ativa imediatamente</p>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                {[
                  {label:"VALOR",val:R(valorFinal)},
                  {label:"PRAZO",val:`${mesesFinal}m`},
                  {label:"POR DIA",val:R(porDia)},
                ].map(({label,val})=>(
                  <div key={label} style={{background:"rgba(0,0,0,0.35)",borderRadius:10,padding:"10px 8px",textAlign:"center"}}>
                    <p style={{margin:"0 0 3px",fontSize:8,color:T.mid,letterSpacing:1,fontWeight:700}}>{label}</p>
                    <p style={{margin:0,fontSize:13,fontWeight:800,color:T.amber,fontFamily:"'Barlow Condensed',sans-serif"}}>{val}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Resumo */}
            <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:"16px",marginBottom:20,animation:"fadeUp 0.4s ease 0.1s both"}}>
              <p style={{margin:"0 0 12px",fontSize:10,color:T.mid,letterSpacing:1.5,fontWeight:700}}>RESUMO DA META</p>
              {[
                ["Probabilidade de conclusão",`${prob}%`,probColor(prob)],
                ["Modo de aporte",           REGRAS_AUTO.find(r=>r.id===regraAuto)?.label||"-", T.white],
                ["Proteção",                 lockType==="carencia"?"CDB com carência":"Bloqueio Comportamental", T.white],
                ["Guardião",                 guardiao||"Nenhum",T.white],
                ["Score estimado ao concluir","+25 pontos",T.green],
              ].map(([k,v,c])=>(
                <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:`1px solid ${T.border}`}}>
                  <span style={{fontSize:12,color:T.mid}}>{k}</span>
                  <span style={{fontSize:12,fontWeight:700,color:c||T.white,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:0.3}}>{v}</span>
                </div>
              ))}
            </div>

            {/* IA Final */}
            <div style={{background:`${T.amber}10`,border:`1px solid ${T.amber}28`,borderRadius:14,padding:"14px 16px",marginBottom:20,display:"flex",gap:10,alignItems:"flex-start",animation:"fadeUp 0.4s ease 0.2s both"}}>
              <span style={{fontSize:22,flexShrink:0}}>🤖</span>
              <p style={{margin:0,fontSize:13,color:T.offwhite,lineHeight:1.65}}>
                {prob>=80
                  ? `Tudo certo! Seu plano tem ${prob}% de chance de sucesso. Com consistência, você vai chegar lá. Vou te lembrar toda semana do seu progresso. 🚀`
                  : `Seu plano está pronto. Para aumentar a probabilidade, tente fazer um aporte extra sempre que tiver um dia bom. Cada R$10 a mais aproxima você do sonho.`
                }
              </p>
            </div>

            <button onClick={confirmar} style={{width:"100%",padding:"16px",borderRadius:12,border:"none",background:T.amber,color:"#000",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:20,letterSpacing:1.5,cursor:"pointer",boxShadow:`0 10px 32px ${T.amber}66`,animation:"fadeUp 0.4s ease 0.3s both"}}>
              CRIAR COFRE 🔒
            </button>
          </div>
        )}
      </div>
    </div>
  );
}