import { useState, useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════════════════════
   C.I.C. — Cofre Inteligente Comportamental
   Dashboard MVP — Tela 3
   Aesthetic: Military-grade dark + warm amber accents
   "O treinador financeiro que protege os sonhos dos motoristas"
═══════════════════════════════════════════════════════════════ */

const FL = () => (
  <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@300;400;500;600;700;800;900&family=Barlow:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
);

/* ── PALETTE ── */
const T = {
  bg:      "#060608",
  bg2:     "#0C0C10",
  surface: "#111116",
  card:    "#16161C",
  border:  "#1E1E28",
  border2: "#252530",
  amber:   "#F5A623",
  amberL:  "#FFB84D",
  amberD:  "#C47F0A",
  green:   "#22C55E",
  red:     "#EF4444",
  yellow:  "#EAB308",
  blue:    "#3B82F6",
  white:   "#F0EDE6",
  offwhite:"#C8C5BE",
  mid:     "#6B6870",
  dim:     "#2A2830",
  dimL:    "#363444",
};

/* ── DATA ── */
const COFRES = [
  {
    id:1, nome:"Troca de Carro", icon:"🚗",
    meta:18000, saldo:11240, prazo:"2026-12-01",
    cor:T.amber, img:"🚙",
    streak:34, autoMode:true,
    historico:[320,280,450,380,520,480,600,540,680],
  },
  {
    id:2, nome:"Reserva de Emergência", icon:"🛡️",
    meta:5000, saldo:2180, prazo:"2026-09-01",
    cor:T.blue, img:"🏦",
    streak:18, autoMode:false,
    historico:[100,120,80,150,100,130,90,120,110],
  },
  {
    id:3, nome:"Entrada da Casa", icon:"🏠",
    meta:50000, saldo:8400, prazo:"2028-06-01",
    cor:T.green, img:"🏡",
    streak:9, autoMode:true,
    historico:[200,150,300,250,180,220,280,200,240],
  },
  {
    id:4, nome:"IPVA 2027", icon:"📋",
    meta:2400, saldo:2400, prazo:"2027-01-10",
    cor:"#9333EA", img:"✅",
    streak:52, autoMode:true,
    historico:[200,200,200,200,200,200,200,200,200],
  },
];

const CONQUISTAS = [
  {icon:"🔥", nome:"Primeira Semana",   desbloqueado:true},
  {icon:"💰", nome:"R$1.000 Guardados", desbloqueado:true},
  {icon:"🛡️", nome:"30 dias sem saque", desbloqueado:true},
  {icon:"🎯", nome:"Meta Concluída",    desbloqueado:true},
  {icon:"⚡", nome:"Modo Automático",   desbloqueado:true},
  {icon:"💎", nome:"R$10.000 Guardados",desbloqueado:false},
  {icon:"👑", nome:"Lendário",          desbloqueado:false},
  {icon:"🏆", nome:"1 Ano de Hábito",   desbloqueado:false},
];

const MISSOES = [
  {texto:"Fazer 3 aportes esta semana", progresso:2, total:3, xp:50},
  {texto:"Não sacar em 7 dias",         progresso:5, total:7, xp:100},
  {texto:"Atingir 80% de uma meta",     progresso:62,total:80,xp:150},
];

/* ── HELPERS ── */
const R    = v => `R$\u00a0${Number(v).toLocaleString("pt-BR",{minimumFractionDigits:2})}`;
const pct  = (s,m) => Math.min(100,Math.round((s/m)*100));
const dias = p => Math.max(0,Math.ceil((new Date(p)-new Date())/86400000));

function ILFColor(score) {
  if(score>=70) return T.green;
  if(score>=40) return T.yellow;
  return T.red;
}
function ScoreNivel(score) {
  if(score>=90) return{nome:"LENDÁRIO",   cor:"#C084FC"};
  if(score>=75) return{nome:"DIAMANTE",   cor:"#67E8F9"};
  if(score>=60) return{nome:"OURO",       cor:T.amber};
  if(score>=40) return{nome:"PRATA",      cor:T.offwhite};
  return             {nome:"BRONZE",      cor:"#CD7F32"};
}

/* ── MICRO COMPONENTS ── */
function MiniSpark({vals,color,h=32}){
  const mx=Math.max(...vals,1);
  return(
    <div style={{display:"flex",gap:3,alignItems:"flex-end",height:h}}>
      {vals.map((v,i)=>(
        <div key={i} style={{
          flex:1,borderRadius:"2px 2px 0 0",
          background:i===vals.length-1?color:`${color}44`,
          height:`${(v/mx)*100}%`,minHeight:3,
          transition:"height 0.6s ease",
        }}/>
      ))}
    </div>
  );
}

function Ring({p,color,size=60,thick=4,children}){
  const r=(size-thick)/2, c=2*Math.PI*r;
  return(
    <div style={{position:"relative",width:size,height:size,flexShrink:0}}>
      <svg width={size} height={size} style={{transform:"rotate(-90deg)",position:"absolute",inset:0}}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={T.dim} strokeWidth={thick}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={thick}
          strokeDasharray={c} strokeDashoffset={c-(p/100)*c}
          strokeLinecap="round"
          style={{transition:"stroke-dashoffset 1.4s cubic-bezier(.4,0,.2,1)"}}/>
      </svg>
      <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
        {children}
      </div>
    </div>
  );
}

function ScoreGauge({score}){
  const nivel = ScoreNivel(score);
  const angle = (score/100)*180 - 90;
  return(
    <div style={{position:"relative",width:160,height:90,margin:"0 auto"}}>
      <svg width={160} height={95} viewBox="0 0 160 95">
        {/* Track */}
        <path d="M 16 80 A 64 64 0 0 1 144 80" fill="none" stroke={T.dim} strokeWidth={10} strokeLinecap="round"/>
        {/* Red zone */}
        <path d="M 16 80 A 64 64 0 0 1 53 28" fill="none" stroke={`${T.red}55`} strokeWidth={10} strokeLinecap="round"/>
        {/* Yellow zone */}
        <path d="M 53 28 A 64 64 0 0 1 107 28" fill="none" stroke={`${T.yellow}55`} strokeWidth={10} strokeLinecap="round"/>
        {/* Green zone */}
        <path d="M 107 28 A 64 64 0 0 1 144 80" fill="none" stroke={`${T.green}55`} strokeWidth={10} strokeLinecap="round"/>
        {/* Active fill */}
        <path d="M 16 80 A 64 64 0 0 1 144 80"
          fill="none" stroke={nivel.cor} strokeWidth={10} strokeLinecap="round"
          strokeDasharray={`${(score/100)*201} 201`}
          style={{transition:"stroke-dasharray 1.5s cubic-bezier(.4,0,.2,1)"}}/>
        {/* Needle */}
        <g transform={`rotate(${angle}, 80, 80)`}>
          <line x1="80" y1="80" x2="80" y2="26" stroke={nivel.cor} strokeWidth={2.5} strokeLinecap="round"/>
          <circle cx="80" cy="80" r="5" fill={nivel.cor}/>
        </g>
        {/* Score */}
        <text x="80" y="78" textAnchor="middle" fill={T.white} fontSize="22" fontWeight="800" fontFamily="'Barlow Condensed',sans-serif">{score}</text>
      </svg>
      <div style={{textAlign:"center",marginTop:-6}}>
        <span style={{fontSize:10,fontWeight:800,letterSpacing:2,color:nivel.cor,fontFamily:"'Barlow Condensed',sans-serif"}}>{nivel.nome}</span>
      </div>
    </div>
  );
}

function ILFBar({score}){
  const color=ILFColor(score);
  const label=score>=70?"SAUDÁVEL":score>=40?"ATENÇÃO":"RISCO";
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
        <span style={{fontSize:10,color:T.mid,letterSpacing:1.5,fontWeight:700}}>ÍNDICE DE LIBERDADE FINANCEIRA</span>
        <span style={{fontSize:11,color,fontWeight:800,letterSpacing:1,fontFamily:"'Barlow Condensed',sans-serif"}}>{label}</span>
      </div>
      <div style={{height:8,background:T.dim,borderRadius:4,overflow:"hidden",position:"relative"}}>
        <div style={{
          position:"absolute",inset:0,
          background:`linear-gradient(90deg,${T.red} 0%,${T.yellow} 40%,${T.green} 70%)`,
          opacity:0.3,
        }}/>
        <div style={{
          height:"100%",borderRadius:4,
          background:color,
          width:`${score}%`,
          transition:"width 1.4s cubic-bezier(.4,0,.2,1)",
          boxShadow:`0 0 12px ${color}88`,
        }}/>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",marginTop:5}}>
        {["Alto Risco","Atenção","Saudável"].map((l,i)=>(
          <span key={l} style={{fontSize:9,color:T.mid,letterSpacing:0.5}}>{l}</span>
        ))}
      </div>
    </div>
  );
}

/* ── APORTE RAPIDO MODAL ── */
function AporteRapido({cofre,onClose,onConfirm}){
  const [valor,setValor]=useState(null);
  const [custom,setCustom]=useState("");
  const [done,setDone]=useState(false);
  const btns=[
    {label:"Dia Difícil",sub:"🌧️",val:5},
    {label:"Dia Médio",  sub:"☁️",val:10},
    {label:"Dia Bom",    sub:"☀️",val:20},
    {label:"Dia Excelente",sub:"🌟",val:50},
  ];
  function confirmar(){
    const v=valor||(Number(custom)||0);
    if(!v) return;
    setDone(true);
    setTimeout(()=>{ onConfirm(v); onClose(); },1200);
  }
  if(done) return(
    <div style={{textAlign:"center",padding:"20px 0"}}>
      <div style={{fontSize:56,marginBottom:12,animation:"pop 0.4s cubic-bezier(.36,.07,.19,.97)"}}>🎉</div>
      <p style={{fontSize:22,fontWeight:800,color:T.amber,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:1}}>
        {R(valor||(Number(custom)||0))} guardado!
      </p>
      <p style={{color:T.mid,fontSize:13,marginTop:6}}>Barra de progresso atualizada ✓</p>
    </div>
  );
  return(
    <>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
        <span style={{fontSize:28}}>{cofre.icon}</span>
        <div>
          <p style={{margin:0,fontSize:18,fontWeight:800,color:T.white,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:0.5}}>{cofre.nome}</p>
          <p style={{margin:0,fontSize:12,color:T.mid}}>{pct(cofre.saldo,cofre.meta)}% concluído · {R(cofre.meta-cofre.saldo)} restante</p>
        </div>
      </div>
      <p style={{margin:"0 0 12px",fontSize:10,color:T.mid,letterSpacing:2,fontWeight:700}}>COMO FOI SEU DIA?</p>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
        {btns.map(b=>(
          <button key={b.val} onClick={()=>setValor(b.val)} style={{
            background:valor===b.val?`${T.amber}22`:T.surface,
            border:`1.5px solid ${valor===b.val?T.amber:T.border}`,
            borderRadius:14,padding:"14px 10px",cursor:"pointer",
            transition:"all 0.15s",textAlign:"center",
          }}>
            <div style={{fontSize:22,marginBottom:4}}>{b.sub}</div>
            <div style={{fontSize:12,fontWeight:700,color:valor===b.val?T.amber:T.offwhite,fontFamily:"'Barlow',sans-serif"}}>{b.label}</div>
            <div style={{fontSize:16,fontWeight:800,color:valor===b.val?T.amber:T.mid,fontFamily:"'Barlow Condensed',sans-serif",marginTop:2}}>R${b.val}</div>
          </button>
        ))}
      </div>
      <div style={{display:"flex",gap:10,alignItems:"center",background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:"10px 14px",marginBottom:18}}>
        <span style={{color:T.mid,fontSize:12}}>R$</span>
        <input type="number" value={custom} onChange={e=>{ setCustom(e.target.value); setValor(null); }} placeholder="Outro valor"
          style={{flex:1,background:"transparent",border:"none",outline:"none",color:T.white,fontFamily:"'DM Mono',monospace",fontSize:16,fontWeight:500}}/>
      </div>
      <button onClick={confirmar} disabled={!valor&&!custom} style={{
        width:"100%",padding:"15px",borderRadius:12,border:"none",
        background:(valor||(Number(custom)||0))?T.amber:T.dim,
        color:(valor||(Number(custom)||0))?"#000":T.mid,
        fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:18,letterSpacing:1,
        cursor:(valor||(Number(custom)||0))?"pointer":"not-allowed",
        boxShadow:(valor||(Number(custom)||0))?`0 8px 28px ${T.amber}55`:"none",
        transition:"all 0.2s",
      }}>GUARDAR AGORA →</button>
    </>
  );
}

/* ── ANTISAQUE ── */
function AntiSaque({cofre,onClose}){
  const [step,setStep]=useState(0);
  const [held,setHeld]=useState(0);
  const [holding,setHolding]=useState(false);
  const [done,setDone]=useState(false);
  const heldRef=useRef(null);
  const d=Math.ceil((cofre.meta-cofre.saldo)/600); // horas
  const atrasoDias=Math.ceil((cofre.meta-cofre.saldo)*.05/50); // dias de atraso

  function startHold(){
    setHolding(true);
    heldRef.current=setInterval(()=>{
      setHeld(h=>{
        if(h>=100){ clearInterval(heldRef.current); setDone(true); return 100; }
        return h+2.5;
      });
    },125);
  }
  function stopHold(){
    clearInterval(heldRef.current);
    setHolding(false);
    setHeld(0);
  }
  useEffect(()=>()=>clearInterval(heldRef.current),[]);

  const steps=[
    {
      icon:"⚠️",
      title:"Tem certeza que deseja sacar?",
      sub:"Esta ação afetará seu score de disciplina",
      action:()=>setStep(1),
      btnLabel:"VER IMPACTO →",
      btnColor:T.yellow,
    },
    {
      icon:"📅",
      title:`Esse saque atrasará sua meta em ${atrasoDias} dias`,
      sub:`Você estava a ${pct(cofre.saldo,cofre.meta)}% do objetivo`,
      action:()=>setStep(2),
      btnLabel:"CONTINUAR →",
      btnColor:T.yellow,
    },
    {
      icon:"⏱️",
      title:`Você precisará trabalhar ~${d} horas para recuperar`,
      sub:"São corridas extras no final de semana",
      action:()=>setStep(3),
      btnLabel:"VER OBJETIVO →",
      btnColor:T.red,
    },
  ];

  if(done) return(
    <div style={{textAlign:"center",padding:"16px 0"}}>
      <div style={{fontSize:52,marginBottom:12}}>💸</div>
      <p style={{fontSize:20,fontWeight:800,color:T.white,fontFamily:"'Barlow Condensed',sans-serif"}}>Saque processado</p>
      <p style={{color:T.mid,fontSize:13,marginTop:6}}>-15 pontos de disciplina</p>
      <button onClick={onClose} style={{marginTop:20,width:"100%",padding:"13px",borderRadius:12,border:`1px solid ${T.border}`,background:"transparent",color:T.mid,fontFamily:"'Barlow',sans-serif",fontWeight:600,fontSize:14,cursor:"pointer"}}>Fechar</button>
    </div>
  );

  if(step===3) return(
    <>
      {/* Tela 4 — imagem da meta */}
      <div style={{textAlign:"center",marginBottom:20}}>
        <div style={{fontSize:72,marginBottom:12}}>{cofre.img}</div>
        <p style={{fontSize:22,fontWeight:800,color:T.white,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:0.5}}>Vale a pena abrir mão disso agora?</p>
        <p style={{color:T.mid,fontSize:13,marginTop:6,lineHeight:1.6}}>Você guardou <strong style={{color:T.amber}}>{R(cofre.saldo)}</strong> para <strong style={{color:T.white}}>{cofre.nome}</strong>. Está a <strong style={{color:T.amber}}>{pct(cofre.saldo,cofre.meta)}%</strong> do sonho.</p>
      </div>
      {/* Tela 5 — botão segurar */}
      <div style={{marginBottom:16}}>
        <div style={{height:6,background:T.dim,borderRadius:3,marginBottom:12,overflow:"hidden"}}>
          <div style={{height:"100%",background:T.red,width:`${held}%`,transition:"width 0.1s linear",borderRadius:3}}/>
        </div>
        <button
          onPointerDown={startHold} onPointerUp={stopHold} onPointerLeave={stopHold}
          style={{
            width:"100%",padding:"16px",borderRadius:12,border:`2px solid ${T.red}`,
            background:holding?`${T.red}22`:"transparent",
            color:T.red,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:17,letterSpacing:1,
            cursor:"pointer",transition:"background 0.1s",userSelect:"none",
          }}>
          {held>0?`SEGURE... ${Math.round(held)}%`:"PRESSIONE E SEGURE 5s PARA SACAR"}
        </button>
      </div>
      <button onClick={onClose} style={{width:"100%",padding:"14px",borderRadius:12,border:"none",background:T.amber,color:"#000",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:17,letterSpacing:1,cursor:"pointer",boxShadow:`0 6px 24px ${T.amber}55`}}>
        NÃO, QUERO MANTER MEU SONHO 🛡️
      </button>
    </>
  );

  const s=steps[step];
  return(
    <>
      <div style={{textAlign:"center",marginBottom:22}}>
        <div style={{fontSize:48,marginBottom:12}}>{s.icon}</div>
        <p style={{fontSize:20,fontWeight:800,color:T.white,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:0.3,lineHeight:1.2}}>{s.title}</p>
        <p style={{color:T.mid,fontSize:13,marginTop:8}}>{s.sub}</p>
      </div>
      {/* Score impact preview */}
      <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:14,padding:16,marginBottom:20}}>
        <p style={{margin:"0 0 10px",fontSize:11,color:T.mid,letterSpacing:1.5,fontWeight:700}}>IMPACTO NO SEU PERFIL</p>
        {[
          ["Score de Disciplina","-15 pontos",T.red],
          ["Streak de dias",     `Zera ${cofre.streak} dias`,T.red],
          ["Nível",              "Pode regredir",T.yellow],
          ["Meta",               `+${atrasoDias} dias de atraso`,T.yellow],
        ].map(([k,v,c])=>(
          <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${T.border}`}}>
            <span style={{fontSize:13,color:T.offwhite}}>{k}</span>
            <span style={{fontSize:12,fontWeight:700,color:c,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:0.5}}>{v}</span>
          </div>
        ))}
      </div>
      <div style={{display:"flex",gap:10}}>
        <button onClick={onClose} style={{flex:1,padding:"14px",borderRadius:12,border:"none",background:T.amber,color:"#000",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:15,letterSpacing:1,cursor:"pointer",boxShadow:`0 4px 18px ${T.amber}44`}}>MANTER 🛡️</button>
        <button onClick={s.action} style={{flex:1,padding:"14px",borderRadius:12,border:`1px solid ${T.border}`,background:"transparent",color:T.mid,fontFamily:"'Barlow',sans-serif",fontWeight:500,fontSize:13,cursor:"pointer"}}>{s.btnLabel}</button>
      </div>
    </>
  );
}

/* ── MODAL SHELL ── */
function Modal({children,onClose,title}){
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",backdropFilter:"blur(16px)",zIndex:100,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}>
      <div style={{background:T.card,borderRadius:"24px 24px 0 0",padding:"28px 22px 52px",width:"100%",maxWidth:440,border:`1px solid ${T.border}`,borderBottom:"none",maxHeight:"90vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
        {title&&<p style={{margin:"0 0 20px",fontSize:11,color:T.mid,letterSpacing:2.5,fontWeight:700,textTransform:"uppercase"}}>{title}</p>}
        {children}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   DASHBOARD PRINCIPAL
══════════════════════════════════════════════════════════════ */
export default function CICDashboard(){
  const [cofres,setCofres]=useState(COFRES);
  const [modal,setModal]=useState(null); // {type:"aporte"|"saque", cofre}
  const [tab,setTab]=useState("cofres");
  const [animIn,setAnimIn]=useState(false);

  const score=74;
  const ilf=68;
  const totalGuardado=cofres.reduce((a,c)=>a+c.saldo,0);
  const metaPrincipal=cofres[0];

  useEffect(()=>{ setTimeout(()=>setAnimIn(true),100); },[]);

  function handleAporte(cofre){ setModal({type:"aporte",cofre}); }
  function handleSaque(cofre){  setModal({type:"saque",cofre});  }
  function confirmarAporte(valor){
    setCofres(p=>p.map(c=>c.id===modal.cofre.id?{...c,saldo:Math.min(c.meta,c.saldo+valor),streak:c.streak+1,historico:[...c.historico.slice(1),valor]}:c));
    setModal(null);
  }

  const nivel=ScoreNivel(score);

  return(
    <div style={{minHeight:"100vh",background:T.bg,fontFamily:"'Barlow',sans-serif",color:T.white,maxWidth:440,margin:"0 auto",position:"relative",overflowX:"hidden"}}>
      <FL/>
      <style>{`
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
        input::placeholder{color:#3a3a48;}
        ::-webkit-scrollbar{display:none;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pop{0%{transform:scale(0.5)}60%{transform:scale(1.2)}100%{transform:scale(1)}}
        @keyframes pulseAmber{0%,100%{box-shadow:0 0 0 0 ${T.amber}55}50%{box-shadow:0 0 0 8px ${T.amber}00}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .card-hover:hover{transform:translateY(-2px);box-shadow:0 8px 32px rgba(0,0,0,0.4)!important;}
        .card-hover{transition:transform 0.2s,box-shadow 0.2s;}
      `}</style>

      {/* ── AMBIENT GLOW ── */}
      <div style={{position:"fixed",top:-100,left:-80,width:320,height:320,background:`radial-gradient(circle,${T.amber}0C 0%,transparent 70%)`,pointerEvents:"none",zIndex:0}}/>
      <div style={{position:"fixed",bottom:80,right:-60,width:260,height:260,background:`radial-gradient(circle,${T.blue}08 0%,transparent 70%)`,pointerEvents:"none",zIndex:0}}/>

      <div style={{position:"relative",zIndex:1,paddingBottom:100,opacity:animIn?1:0,transform:animIn?"translateY(0)":"translateY(16px)",transition:"opacity 0.6s ease,transform 0.6s ease"}}>

        {/* ══ HEADER ══ */}
        <div style={{padding:"52px 20px 0",borderBottom:`1px solid ${T.border}`,paddingBottom:20}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
            <div>
              <p style={{margin:"0 0 3px",fontSize:10,color:T.mid,letterSpacing:3,fontWeight:700}}>PAINEL DO MOTORISTA</p>
              <h1 style={{margin:0,fontSize:28,fontWeight:900,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:-0.5,lineHeight:1}}>
                Olá, João <span style={{color:T.amber}}>Silva</span>
              </h1>
              <div style={{display:"flex",alignItems:"center",gap:8,marginTop:6}}>
                <span style={{fontSize:12,color:nivel.cor,fontWeight:700,letterSpacing:1,fontFamily:"'Barlow Condensed',sans-serif"}}>{nivel.nome}</span>
                <span style={{fontSize:10,color:T.dim}}>•</span>
                <span style={{fontSize:11,color:T.mid}}>🔥 {cofres.reduce((a,c)=>Math.max(a,c.streak),0)} dias de streak</span>
              </div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{width:48,height:48,borderRadius:16,background:`linear-gradient(135deg,${T.amber},${T.amberD})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:900,color:"#000",fontFamily:"'Barlow Condensed',sans-serif",boxShadow:`0 6px 20px ${T.amber}44`,animation:"pulseAmber 3s infinite"}}>JS</div>
              <p style={{margin:"6px 0 0",fontSize:9,color:T.mid,letterSpacing:1}}>ID: #4821</p>
            </div>
          </div>

          {/* ── SCORE + ILF ── */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
            {/* Score Card */}
            <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:18,padding:"16px 12px",textAlign:"center"}}>
              <p style={{margin:"0 0 8px",fontSize:9,color:T.mid,letterSpacing:2,fontWeight:700}}>SCORE DE DISCIPLINA</p>
              <ScoreGauge score={score}/>
            </div>
            {/* ILF + Total */}
            <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:18,padding:"16px 14px",display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
              <div>
                <p style={{margin:"0 0 4px",fontSize:9,color:T.mid,letterSpacing:2,fontWeight:700}}>TOTAL GUARDADO</p>
                <p style={{margin:0,fontSize:28,fontWeight:900,color:T.amber,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:-0.5,lineHeight:1}}>{R(totalGuardado)}</p>
                <p style={{margin:"3px 0 0",fontSize:10,color:T.mid}}>{cofres.filter(c=>pct(c.saldo,c.meta)>=100).length} meta(s) concluída(s)</p>
              </div>
              <ILFBar score={ilf}/>
            </div>
          </div>
        </div>

        {/* ══ META PRINCIPAL ══ */}
        <div style={{padding:"20px 20px 0"}}>
          <div style={{position:"relative",background:`linear-gradient(135deg,${T.amber}18,${T.amber}06)`,border:`1px solid ${T.amber}33`,borderRadius:20,padding:"20px",marginBottom:20,overflow:"hidden"}}>
            <div style={{position:"absolute",top:-20,right:-20,fontSize:80,opacity:0.07,transform:"rotate(-15deg)"}}>{metaPrincipal.img}</div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
              <div>
                <p style={{margin:"0 0 3px",fontSize:9,color:T.amber,letterSpacing:2,fontWeight:700}}>META PRINCIPAL</p>
                <p style={{margin:0,fontSize:20,fontWeight:800,color:T.white,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:0.3}}>{metaPrincipal.nome}</p>
              </div>
              <Ring p={pct(metaPrincipal.saldo,metaPrincipal.meta)} color={T.amber} size={56} thick={5}>
                <span style={{fontSize:12,fontWeight:800,color:T.amber,fontFamily:"'Barlow Condensed',sans-serif"}}>{pct(metaPrincipal.saldo,metaPrincipal.meta)}%</span>
              </Ring>
            </div>
            <div style={{marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <span style={{fontSize:12,color:T.offwhite,fontFamily:"'DM Mono',monospace"}}>{R(metaPrincipal.saldo)}</span>
                <span style={{fontSize:12,color:T.mid,fontFamily:"'DM Mono',monospace"}}>{R(metaPrincipal.meta)}</span>
              </div>
              <div style={{height:8,background:T.dim,borderRadius:4,overflow:"hidden"}}>
                <div style={{height:"100%",borderRadius:4,background:`linear-gradient(90deg,${T.amberD},${T.amber},${T.amberL})`,width:`${pct(metaPrincipal.saldo,metaPrincipal.meta)}%`,transition:"width 1.4s cubic-bezier(.4,0,.2,1)",boxShadow:`0 0 16px ${T.amber}66`}}/>
              </div>
            </div>
            <div style={{display:"flex",gap:12}}>
              <div style={{flex:1,background:"rgba(0,0,0,0.3)",borderRadius:10,padding:"8px 10px"}}>
                <p style={{margin:0,fontSize:9,color:T.mid,letterSpacing:1}}>FALTA</p>
                <p style={{margin:0,fontSize:14,fontWeight:800,color:T.white,fontFamily:"'Barlow Condensed',sans-serif"}}>{R(metaPrincipal.meta-metaPrincipal.saldo)}</p>
              </div>
              <div style={{flex:1,background:"rgba(0,0,0,0.3)",borderRadius:10,padding:"8px 10px"}}>
                <p style={{margin:0,fontSize:9,color:T.mid,letterSpacing:1}}>PRAZO</p>
                <p style={{margin:0,fontSize:14,fontWeight:800,color:T.white,fontFamily:"'Barlow Condensed',sans-serif"}}>{dias(metaPrincipal.prazo)}d</p>
              </div>
              <div style={{flex:1,background:"rgba(0,0,0,0.3)",borderRadius:10,padding:"8px 10px"}}>
                <p style={{margin:0,fontSize:9,color:T.mid,letterSpacing:1}}>POR DIA</p>
                <p style={{margin:0,fontSize:14,fontWeight:800,color:T.amber,fontFamily:"'Barlow Condensed',sans-serif"}}>{R(Math.ceil((metaPrincipal.meta-metaPrincipal.saldo)/Math.max(1,dias(metaPrincipal.prazo))))}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ══ APORTE RÁPIDO ══ */}
        <div style={{padding:"0 20px 20px"}}>
          <p style={{margin:"0 0 12px",fontSize:10,color:T.mid,letterSpacing:2,fontWeight:700}}>APORTE RÁPIDO</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
            {[
              {sub:"🌧️",label:"Difícil",val:5},
              {sub:"☁️",label:"Médio",val:10},
              {sub:"☀️",label:"Bom",val:20},
              {sub:"🌟",label:"Excelente",val:50},
            ].map(b=>(
              <button key={b.val} onClick={()=>{ setModal({type:"aporte",cofre:metaPrincipal,valorSugerido:b.val}); }} style={{
                background:T.surface,border:`1px solid ${T.border}`,
                borderRadius:14,padding:"12px 6px",cursor:"pointer",
                transition:"all 0.15s",textAlign:"center",
              }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=T.amber;e.currentTarget.style.background=`${T.amber}12`;}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.background=T.surface;}}
              >
                <div style={{fontSize:18,marginBottom:3}}>{b.sub}</div>
                <div style={{fontSize:9,color:T.mid,letterSpacing:0.5,marginBottom:2}}>{b.label}</div>
                <div style={{fontSize:14,fontWeight:800,color:T.amber,fontFamily:"'Barlow Condensed',sans-serif"}}>R${b.val}</div>
              </button>
            ))}
          </div>
        </div>

        {/* ══ TABS ══ */}
        <div style={{padding:"0 20px",marginBottom:16}}>
          <div style={{display:"flex",gap:6,background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:4}}>
            {["cofres","missões","conquistas"].map(t=>(
              <button key={t} onClick={()=>setTab(t)} style={{
                flex:1,padding:"8px 4px",borderRadius:9,border:"none",cursor:"pointer",
                fontFamily:"'Barlow',sans-serif",fontWeight:600,fontSize:11,letterSpacing:0.5,
                background:tab===t?T.amber:"transparent",
                color:tab===t?"#000":T.mid,
                transition:"all 0.2s",textTransform:"capitalize",
              }}>{t}</button>
            ))}
          </div>
        </div>

        {/* ══ COFRES LIST ══ */}
        {tab==="cofres"&&(
          <div style={{padding:"0 20px",display:"flex",flexDirection:"column",gap:12}}>
            {cofres.map((c,idx)=>{
              const p=pct(c.saldo,c.meta), done=p>=100;
              return(
                <div key={c.id} className="card-hover" style={{background:T.card,border:`1px solid ${done?c.cor+"55":T.border}`,borderRadius:18,padding:"16px",position:"relative",overflow:"hidden",animation:`fadeUp 0.4s ease ${idx*0.07}s both`}}>
                  {done&&<div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,${c.cor},${c.cor}00)`}}/>}
                  {c.autoMode&&<div style={{position:"absolute",top:12,right:12,background:`${T.green}22`,border:`1px solid ${T.green}44`,borderRadius:6,padding:"2px 7px",fontSize:9,color:T.green,fontWeight:700,letterSpacing:0.5}}>AUTO</div>}
                  <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                    <Ring p={p} color={done?"#22C55E":c.cor} size={58} thick={4}>
                      <span style={{fontSize:done?18:16,transform:done?"none":"none"}}>{done?"✅":c.icon}</span>
                    </Ring>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
                        <p style={{margin:0,fontSize:15,fontWeight:700,color:T.white,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:0.3}}>{c.nome}</p>
                        <span style={{fontSize:12,fontWeight:800,color:done?T.green:c.cor,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:0.5}}>{done?"CONCLUÍDO":p+"%"}</span>
                      </div>
                      <p style={{margin:"0 0 8px",fontSize:11,color:T.mid,fontFamily:"'DM Mono',monospace"}}>{R(c.saldo)} <span style={{color:T.dim}}>/ {R(c.meta)}</span></p>
                      <div style={{height:4,background:T.dim,borderRadius:2,marginBottom:8,overflow:"hidden"}}>
                        <div style={{height:"100%",borderRadius:2,background:done?T.green:c.cor,width:`${p}%`,transition:"width 1s ease",boxShadow:done?`0 0 8px ${T.green}55`:`0 0 8px ${c.cor}55`}}/>
                      </div>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
                        <div style={{display:"flex",gap:10}}>
                          {!done&&<span style={{fontSize:10,color:T.mid}}>📅 {dias(c.prazo)}d</span>}
                          <span style={{fontSize:10,color:T.amber}}>🔥 {c.streak}d</span>
                        </div>
                        <MiniSpark vals={c.historico} color={done?T.green:c.cor} h={24}/>
                      </div>
                    </div>
                  </div>
                  {!done&&(
                    <div style={{display:"flex",gap:8,marginTop:12}}>
                      <button onClick={()=>handleAporte(c)} style={{flex:2,padding:"10px",borderRadius:10,border:"none",background:T.amber,color:"#000",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:14,letterSpacing:0.5,cursor:"pointer",boxShadow:`0 4px 16px ${T.amber}44`}}>GUARDAR →</button>
                      <button onClick={()=>handleSaque(c)} style={{flex:1,padding:"10px",borderRadius:10,border:`1px solid ${T.border}`,background:"transparent",color:T.mid,fontFamily:"'Barlow',sans-serif",fontWeight:500,fontSize:12,cursor:"pointer"}}>Sacar</button>
                    </div>
                  )}
                </div>
              );
            })}
            {/* Novo cofre */}
            <button style={{background:"transparent",border:`2px dashed ${T.border}`,borderRadius:18,padding:"18px",color:T.dim,fontFamily:"'Barlow Condensed',sans-serif",fontSize:16,fontWeight:700,letterSpacing:0.5,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,transition:"all 0.2s"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=T.amber;e.currentTarget.style.color=T.amber;}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.color=T.dim;}}
            >+ CRIAR NOVO COFRE</button>
          </div>
        )}

        {/* ══ MISSÕES ══ */}
        {tab==="missões"&&(
          <div style={{padding:"0 20px",display:"flex",flexDirection:"column",gap:10}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
              <p style={{margin:0,fontSize:10,color:T.mid,letterSpacing:2,fontWeight:700}}>MISSÕES ATIVAS</p>
              <span style={{fontSize:11,color:T.amber,fontWeight:700}}>Redefine segunda-feira</span>
            </div>
            {MISSOES.map((m,i)=>{
              const p=Math.round((m.progresso/m.total)*100);
              return(
                <div key={i} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:"16px",animation:`fadeUp 0.4s ease ${i*0.08}s both`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                    <p style={{margin:0,fontSize:14,fontWeight:600,color:T.white,flex:1,paddingRight:12,lineHeight:1.4}}>{m.texto}</p>
                    <div style={{background:`${T.amber}18`,border:`1px solid ${T.amber}33`,borderRadius:8,padding:"4px 10px",flexShrink:0}}>
                      <span style={{fontSize:11,fontWeight:800,color:T.amber,fontFamily:"'Barlow Condensed',sans-serif"}}>+{m.xp} XP</span>
                    </div>
                  </div>
                  <div style={{marginBottom:8}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                      <span style={{fontSize:11,color:T.mid}}>{m.progresso} / {m.total}</span>
                      <span style={{fontSize:11,fontWeight:700,color:T.amber}}>{p}%</span>
                    </div>
                    <div style={{height:6,background:T.dim,borderRadius:3,overflow:"hidden"}}>
                      <div style={{height:"100%",borderRadius:3,background:p>=100?T.green:T.amber,width:`${p}%`,transition:"width 1s ease",boxShadow:`0 0 8px ${p>=100?T.green:T.amber}55`}}/>
                    </div>
                  </div>
                </div>
              );
            })}
            {/* Missão concluída */}
            <div style={{background:`${T.green}10`,border:`1px solid ${T.green}33`,borderRadius:16,padding:"14px 16px",display:"flex",alignItems:"center",gap:12}}>
              <span style={{fontSize:24}}>✅</span>
              <div>
                <p style={{margin:0,fontSize:14,fontWeight:600,color:T.green,textDecoration:"line-through",opacity:0.7}}>Fazer primeiro aporte do mês</p>
                <p style={{margin:"3px 0 0",fontSize:11,color:T.mid}}>Concluída · +50 XP ganhos</p>
              </div>
            </div>
          </div>
        )}

        {/* ══ CONQUISTAS ══ */}
        {tab==="conquistas"&&(
          <div style={{padding:"0 20px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <p style={{margin:0,fontSize:10,color:T.mid,letterSpacing:2,fontWeight:700}}>MEDALHAS</p>
              <span style={{fontSize:11,color:T.amber,fontWeight:700}}>{CONQUISTAS.filter(c=>c.desbloqueado).length} / {CONQUISTAS.length}</span>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
              {CONQUISTAS.map((c,i)=>(
                <div key={i} style={{background:c.desbloqueado?`${T.amber}12`:T.surface,border:`1px solid ${c.desbloqueado?T.amber+"44":T.border}`,borderRadius:14,padding:"14px 8px",textAlign:"center",opacity:c.desbloqueado?1:0.4,animation:`fadeUp 0.4s ease ${i*0.05}s both`,transition:"all 0.2s"}}>
                  <div style={{fontSize:26,marginBottom:6,filter:c.desbloqueado?"none":"grayscale(1)"}}>{c.icon}</div>
                  <p style={{margin:0,fontSize:9,color:c.desbloqueado?T.amber:T.mid,fontWeight:700,lineHeight:1.3,letterSpacing:0.3}}>{c.nome}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ══ BOTTOM NAV ══ */}
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:440,background:"rgba(6,6,8,0.97)",backdropFilter:"blur(24px)",borderTop:`1px solid ${T.border}`,padding:"12px 0 28px",display:"flex",justifyContent:"space-around",alignItems:"center",zIndex:50}}>
        {[["🏠","Início"],["🎯","Metas"],["📊","Relatório"],["🤖","C.I.C. IA"],["⚙️","Config"]].map(([ic,lb])=>(
          <button key={lb} style={{background:"none",border:"none",color:lb==="Início"?T.amber:T.dim,fontFamily:"'Barlow',sans-serif",fontSize:9,fontWeight:700,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:4,letterSpacing:0.5,textTransform:"uppercase",transition:"color 0.2s"}}
            onMouseEnter={e=>e.currentTarget.style.color=T.amber}
            onMouseLeave={e=>e.currentTarget.style.color=lb==="Início"?T.amber:T.dim}
          >
            <span style={{fontSize:22}}>{ic}</span>{lb}
          </button>
        ))}
      </div>

      {/* ══ MODALS ══ */}
      {modal?.type==="aporte"&&(
        <Modal onClose={()=>setModal(null)} title="Fazer Aporte">
          <AporteRapido cofre={modal.cofre} onClose={()=>setModal(null)} onConfirm={confirmarAporte}/>
        </Modal>
      )}
      {modal?.type==="saque"&&(
        <Modal onClose={()=>setModal(null)} title="Proteção Anti-Saque">
          <AntiSaque cofre={modal.cofre} onClose={()=>setModal(null)}/>
        </Modal>
      )}
    </div>
  );
}
