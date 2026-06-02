import { useState, useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════════════════════
   C.I.C. — Tela 7: Chat IA Treinador Comportamental
   Aesthetic: COMMAND CENTER meets CONFESSIONAL BOOTH
   O treinador que fala a língua do motorista.
   Nunca usa linguagem bancária. Sempre empático. Sempre ativo.
   Voz nativa + respostas contextuais + modo motorista (hands-free)
═══════════════════════════════════════════════════════════════ */

const FL = () => (
  <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=Barlow:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
);

const T = {
  bg:      "#05050A",
  surface: "#0C0C12",
  card:    "#11111A",
  border:  "#1A1A26",
  border2: "#222230",
  amber:   "#F5A623",
  amberL:  "#FFB84D",
  amberD:  "#B87A10",
  green:   "#22C55E",
  red:     "#EF4444",
  blue:    "#3B82F6",
  teal:    "#14B8A6",
  purple:  "#A78BFA",
  white:   "#EFECE5",
  offwhite:"#C5C2BB",
  mid:     "#68656E",
  dim:     "#1C1C28",
  dimL:    "#28283A",
};

const R = v => `R$\u00a0${Number(v).toLocaleString("pt-BR",{minimumFractionDigits:2})}`;

/* ── SYSTEM PROMPT ── */
const SYSTEM = `Você é o COACH do C.I.C. (Cofre Inteligente Comportamental), o treinador financeiro pessoal de motoristas de aplicativo no Brasil.

PERSONALIDADE:
- Parceiro real, não robô bancário
- Empático e motivador, nunca condescendente  
- Fala como amigo que entende de finanças E de corrida de app
- Usa linguagem simples, direta, às vezes informal
- Celebra conquistas com entusiasmo genuíno
- Nunca usa termos como "carteira de investimentos", "aportar capital", "rentabilidade"
- Usa: "guardar", "juntar", "sonho", "meta", "hábito", "corrida"

CONTEXTO DO USUÁRIO:
- Nome: João Silva
- Score de disciplina: 74/100 (nível OURO)
- Streak: 34 dias consecutivos
- Total guardado: R$24.020
- Meta principal: Troca de Carro (62% concluída, R$11.240 de R$18.000)
- Outras metas: Reserva de Emergência (43%), Entrada da Casa (16%)
- Guardião: Maria (esposa)

VOCÊ PODE AJUDAR COM:
- Motivação e manutenção do hábito de guardar
- Estratégias práticas para guardar mais no dia a dia
- Planejamento de metas financeiras para motoristas
- Orientação sobre IPVA, seguro, revisão, imposto de renda autônomo
- Cálculo de ganho líquido real (descontando combustível, depreciação)
- Apoio emocional em dias difíceis
- Celebração de conquistas

EXEMPLOS DE RESPOSTAS (tom e estilo):
Usuário: "Hoje rodei pouco"
Coach: "Tudo bem, João. Dia fraco acontece. O que importa é não quebrar o hábito. Guardar R$ 5 hoje mantém seu streak de 34 dias vivo. Vale muito mais do que o valor."

Usuário: "Hoje foi um dia bom"
Coach: "Isso! Dias assim são raros — aproveita. Que tal guardar R$ 30 agora? Você já está no automático, basta confirmar."

Usuário: "Quero sacar do cofre"
Coach: "Antes de qualquer coisa: você vai atrasar a meta do carro em uns 12 dias. E vai zerar 34 dias de streak. Me conta o que aconteceu — tem outra saída?"

FORMATO:
- Máximo 3 parágrafos curtos OU lista simples
- Sem markdown pesado
- Sempre termine com pergunta ou ação concreta
- Respostas curtas para modo voz (máximo 2 frases se estiver em modo motorista)`;

/* ── SUGESTÕES CONTEXTUAIS ── */
const SUGESTOES = [
  { emoji:"🌧️", texto:"Hoje foi um dia difícil" },
  { emoji:"🌟", texto:"Hoje foi um dia excelente!" },
  { emoji:"💸", texto:"Quero entender meu ganho líquido" },
  { emoji:"📊", texto:"Como está meu progresso?" },
  { emoji:"🚗", texto:"Quando vou conseguir o carro?" },
  { emoji:"💡", texto:"Dica para guardar mais" },
  { emoji:"😓", texto:"Estou pensando em sacar" },
  { emoji:"🏆", texto:"Completei uma meta!" },
];

/* ── HORA ── */
const hora = () => new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});

/* ── TYPING INDICATOR ── */
function Typing() {
  return (
    <div style={{display:"flex",alignItems:"center",gap:5,padding:"14px 16px"}}>
      {[0,1,2].map(i=>(
        <div key={i} style={{width:7,height:7,borderRadius:"50%",background:T.amber,animation:`bounce 1.2s ease infinite`,animationDelay:`${i*0.18}s`}}/>
      ))}
    </div>
  );
}

/* ── MENSAGEM ── */
function Msg({ msg, onSpeak }) {
  const isUser = msg.role === "user";
  const isCoach = msg.role === "assistant";
  return (
    <div style={{
      display:"flex",
      flexDirection: isUser ? "row-reverse" : "row",
      gap:10, marginBottom:16,
      animation:"fadeUp 0.25s ease",
    }}>
      {isCoach && (
        <div style={{
          width:36, height:36, borderRadius:12, flexShrink:0,
          background:`linear-gradient(135deg,${T.amber},${T.amberD})`,
          display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:18, marginTop:2,
          boxShadow:`0 4px 16px ${T.amber}44`,
        }}>🤖</div>
      )}
      <div style={{
        maxWidth:"80%",
        background: isUser
          ? `linear-gradient(135deg,${T.amber}CC,${T.amberD}BB)`
          : T.card,
        border: isUser ? "none" : `1px solid ${T.border}`,
        borderRadius: isUser ? "18px 4px 18px 18px" : "4px 18px 18px 18px",
        padding:"12px 15px",
        boxShadow: isUser ? `0 4px 20px ${T.amber}33` : "none",
        position:"relative",
      }}>
        {isCoach && msg.mood && (
          <div style={{
            position:"absolute",top:-10,left:12,
            background:T.surface,border:`1px solid ${T.border}`,
            borderRadius:20,padding:"2px 8px",
            fontSize:10,color:T.amber,fontWeight:700,letterSpacing:1,
          }}>{msg.mood}</div>
        )}
        <p style={{
          margin:0, fontSize:14, lineHeight:1.7,
          color: isUser ? "#000" : T.white,
          fontFamily:"'Barlow',sans-serif",
          whiteSpace:"pre-wrap",
          fontWeight: isUser ? 600 : 400,
        }}>{msg.content}</p>
        <div style={{
          display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:6,
        }}>
          <span style={{fontSize:10,color:isUser?"rgba(0,0,0,0.4)":T.mid,fontFamily:"'DM Mono',monospace"}}>{msg.time}</span>
          {isCoach && (
            <button onClick={()=>onSpeak(msg.content)} style={{
              background:"none",border:"none",cursor:"pointer",
              color:T.mid,fontSize:13,padding:"0 0 0 8px",lineHeight:1,
              transition:"color 0.2s",
            }}
              onMouseEnter={e=>e.currentTarget.style.color=T.amber}
              onMouseLeave={e=>e.currentTarget.style.color=T.mid}
              title="Ouvir resposta"
            >🔊</button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── MODO MOTORISTA (HANDS-FREE) ── */
function ModoMotorista({ onClose, onSend, listening, falando, onMic, transcript, msgs }) {
  const lastCoach = [...msgs].reverse().find(m=>m.role==="assistant");
  return (
    <div style={{
      position:"fixed",inset:0,zIndex:200,
      background:"rgba(5,5,10,0.97)",
      display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center",
      padding:"40px 24px",
      animation:"fadeIn 0.3s ease",
    }}>
      <FL/>
      {/* Header */}
      <div style={{position:"absolute",top:0,left:0,right:0,padding:"52px 24px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:`1px solid ${T.border}`}}>
        <div>
          <p style={{margin:0,fontSize:9,color:T.amber,letterSpacing:3,fontWeight:700}}>MODO MOTORISTA</p>
          <p style={{margin:"3px 0 0",fontSize:12,color:T.mid}}>Mãos livres — só falar</p>
        </div>
        <button onClick={onClose} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:10,padding:"8px 14px",color:T.mid,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'Barlow',sans-serif"}}>
          Fechar ✕
        </button>
      </div>

      {/* Última resposta do coach */}
      {lastCoach && (
        <div style={{
          background:T.card,border:`1px solid ${T.border}`,borderRadius:18,
          padding:"18px 20px",marginBottom:32,width:"100%",maxWidth:360,
          animation:"fadeUp 0.4s ease",
        }}>
          <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:10}}>
            <span style={{fontSize:16}}>🤖</span>
            <span style={{fontSize:10,color:T.amber,fontWeight:700,letterSpacing:1}}>COACH C.I.C.</span>
            {falando&&<div style={{width:6,height:6,borderRadius:"50%",background:T.green,animation:"pulse 1s infinite",marginLeft:"auto"}}/>}
          </div>
          <p style={{margin:0,fontSize:14,color:T.white,lineHeight:1.65,fontFamily:"'Barlow',sans-serif"}}>
            {lastCoach.content.length>200?lastCoach.content.slice(0,200)+"...":lastCoach.content}
          </p>
        </div>
      )}

      {/* Botão mic grande */}
      <div style={{position:"relative",marginBottom:28}}>
        {(listening||falando)&&[1,2,3].map(i=>(
          <div key={i} style={{
            position:"absolute",borderRadius:"50%",
            border:`2px solid ${listening?T.amber:T.green}`,
            width:80+i*44,height:80+i*44,
            top:"50%",left:"50%",
            transform:"translate(-50%,-50%)",
            opacity:0.5/i,
            animation:`ripple 1.6s ease-out infinite`,
            animationDelay:`${i*0.25}s`,
          }}/>
        ))}
        <button onPointerDown={onMic} style={{
          width:100,height:100,borderRadius:"50%",border:"none",
          background:listening
            ?`linear-gradient(135deg,${T.amber},${T.amberD})`
            :falando
            ?`linear-gradient(135deg,${T.green},${T.green}AA)`
            :T.surface,
          border:`2px solid ${listening?T.amber:falando?T.green:T.border}`,
          fontSize:40,cursor:"pointer",
          display:"flex",alignItems:"center",justifyContent:"center",
          boxShadow:listening?`0 0 48px ${T.amber}66`:falando?`0 0 48px ${T.green}66`:`0 4px 24px rgba(0,0,0,0.5)`,
          transition:"all 0.2s",
          animation:listening||falando?"voicePulse 1.4s ease infinite":"none",
        }}>
          {falando?"🔊":listening?"⏹":"🎙️"}
        </button>
      </div>

      {/* Status */}
      <div style={{textAlign:"center",marginBottom:32}}>
        <p style={{
          margin:0,fontSize:20,fontWeight:800,
          fontFamily:"'Barlow Condensed',sans-serif",
          color:listening?T.amber:falando?T.green:T.white,
          letterSpacing:0.5,
          animation:listening||falando?"voicePulse 1.4s ease infinite":"none",
        }}>
          {listening?"Ouvindo...":falando?"Coach respondendo...":"Toque para falar"}
        </p>
        {transcript&&(
          <p style={{margin:"8px 0 0",fontSize:13,color:T.mid,fontStyle:"italic"}}>"{transcript}"</p>
        )}
        {!listening&&!falando&&(
          <p style={{margin:"8px 0 0",fontSize:12,color:T.mid}}>Coach vai responder em voz alta automaticamente</p>
        )}
      </div>

      {/* Atalhos de voz */}
      <div style={{width:"100%",maxWidth:340}}>
        <p style={{margin:"0 0 10px",fontSize:9,color:T.mid,letterSpacing:2,textAlign:"center",fontWeight:700}}>OU TOQUE EM UMA OPÇÃO</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {["Hoje foi bom","Hoje foi difícil","Quanto falta pro carro?","Dica rápida"].map(t=>(
            <button key={t} onClick={()=>onSend(t)} style={{
              background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,
              padding:"12px 10px",color:T.offwhite,fontFamily:"'Barlow',sans-serif",
              fontSize:12,fontWeight:500,cursor:"pointer",textAlign:"center",
              transition:"all 0.15s",lineHeight:1.4,
            }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=T.amber;e.currentTarget.style.color=T.amber;}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.color=T.offwhite;}}
            >{t}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TELA PRINCIPAL
══════════════════════════════════════════════════════════════ */
export default function CICChat() {
  const [msgs, setMsgs] = useState([{
    role:"assistant",
    content:"E aí, João! 👋\n\nSeu streak está em 34 dias — você está no caminho certo para o carro novo. A meta está em 62%.\n\nComo foi hoje? Fala pra mim que eu te ajudo a decidir quanto guardar agora.",
    time:hora(),
    mood:"💪 MOTIVADO",
  }]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [erro, setErro]         = useState(null);
  const [modoMoto, setModoMoto] = useState(false);
  const [listening, setListening] = useState(false);
  const [falando, setFalando]   = useState(false);
  const [transcript, setTranscript] = useState("");
  const [animIn, setAnimIn]     = useState(false);

  const recRef    = useRef(null);
  const synthRef  = useRef(typeof window!=="undefined"?window.speechSynthesis:null);
  const bottomRef = useRef(null);
  const taRef     = useRef(null);

  useEffect(()=>{ setTimeout(()=>setAnimIn(true),80); },[]);
  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); },[msgs,loading]);

  /* ── Voz: inicialização ── */
  useEffect(()=>{
    const SR = window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR) return;
    const rec = new SR();
    rec.lang="pt-BR"; rec.continuous=false; rec.interimResults=true;
    rec.onresult=e=>{
      const t=Array.from(e.results).map(r=>r[0].transcript).join("");
      setTranscript(t);
      if(e.results[e.results.length-1].isFinal){
        setListening(false);
        setTranscript("");
        enviar(t);
      }
    };
    rec.onerror=()=>setListening(false);
    rec.onend=()=>setListening(false);
    recRef.current=rec;
  },[]);

  function falar(texto, curto=false) {
    if(!synthRef.current) return;
    synthRef.current.cancel();
    const limpo = texto.replace(/[\u{1F300}-\u{1FAFF}]/gu,"").replace(/[*_`#]/g,"").trim();
    const trecho = curto ? limpo.split(".")[0]+"." : limpo;
    const u = new SpeechSynthesisUtterance(trecho);
    u.lang="pt-BR"; u.rate=0.92; u.pitch=1.05;
    const vs = synthRef.current.getVoices();
    const vBR = vs.find(v=>v.lang==="pt-BR")||vs.find(v=>v.lang.startsWith("pt"));
    if(vBR) u.voice=vBR;
    u.onstart=()=>setFalando(true);
    u.onend=()=>setFalando(false);
    u.onerror=()=>setFalando(false);
    synthRef.current.speak(u);
  }

  function toggleMic() {
    if(!recRef.current) return;
    if(listening){ recRef.current.stop(); setListening(false); }
    else{ synthRef.current?.cancel(); setFalando(false); recRef.current.start(); setListening(true); setTranscript(""); }
  }

  /* ── Detecta humor na mensagem para mood tag ── */
  function detectMood(texto) {
    const t=texto.toLowerCase();
    if(t.includes("ótim")||t.includes("excelen")||t.includes("bom")) return "🎉 ANIMADO";
    if(t.includes("difícil")||t.includes("ruim")||t.includes("pouco")) return "💪 MOTIVANDO";
    if(t.includes("sacar")||t.includes("retirar")) return "🛡️ PROTEGENDO";
    if(t.includes("meta")||t.includes("carro")||t.includes("progresso")) return "📊 ANALISANDO";
    if(t.includes("imposto")||t.includes("ipva")||t.includes("seguro")) return "🧮 CALCULANDO";
    return "🤖 COACH";
  }

  async function enviar(texto) {
    const q=(texto||input).trim();
    if(!q||loading) return;
    setInput(""); setErro(null);
    const novaMsg={role:"user",content:q,time:hora()};
    const hist=[...msgs,novaMsg];
    setMsgs(hist); setLoading(true);
    try {
      const res=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:600,
          system:SYSTEM,
          messages:hist.map(m=>({role:m.role,content:m.content})),
        }),
      });
      if(!res.ok) throw new Error();
      const data=await res.json();
      const resp=data.content?.[0]?.text||"Não consegui responder agora. Tenta de novo?";
      const mood=detectMood(q);
      setMsgs(p=>[...p,{role:"assistant",content:resp,time:hora(),mood}]);
      if(modoMoto) falar(resp, true);
    } catch {
      setErro("Erro de conexão. Tenta de novo.");
    } finally {
      setLoading(false);
    }
  }

  const showSugestoes = msgs.length<=1;

  return (
    <div style={{minHeight:"100vh",background:T.bg,fontFamily:"'Barlow',sans-serif",color:T.white,maxWidth:440,margin:"0 auto",position:"relative",display:"flex",flexDirection:"column"}}>
      <FL/>
      <style>{`
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
        textarea::placeholder{color:#35353f;}
        ::-webkit-scrollbar{display:none;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-7px)}}
        @keyframes ripple{0%{transform:translate(-50%,-50%) scale(0.8);opacity:0.6}100%{transform:translate(-50%,-50%) scale(1);opacity:0}}
        @keyframes voicePulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
        @keyframes scan{0%{left:-10%}100%{left:110%}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        .sug-btn:hover{border-color:${T.amber}!important;color:${T.amber}!important;}
        .sug-btn{transition:border-color 0.15s,color 0.15s!important;}
      `}</style>

      {/* Ambient */}
      <div style={{position:"fixed",top:-80,right:-60,width:280,height:280,background:`radial-gradient(circle,${T.amber}0A 0%,transparent 70%)`,pointerEvents:"none",zIndex:0}}/>
      <div style={{position:"fixed",bottom:100,left:-60,width:220,height:220,background:`radial-gradient(circle,${T.purple}06 0%,transparent 70%)`,pointerEvents:"none",zIndex:0}}/>

      {/* ── HEADER ── */}
      <div style={{
        padding:"52px 20px 16px",
        background:`linear-gradient(180deg,${T.amber}0D 0%,transparent 100%)`,
        borderBottom:`1px solid ${T.border}`,
        flexShrink:0,
        position:"relative",zIndex:1,
      }}>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          {/* Avatar Coach */}
          <div style={{
            width:52,height:52,borderRadius:16,flexShrink:0,
            background:`linear-gradient(135deg,${T.amber},${T.amberD})`,
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:26,boxShadow:`0 6px 22px ${T.amber}55`,
            position:"relative",
          }}>
            🤖
            {/* Online dot */}
            <div style={{position:"absolute",bottom:2,right:2,width:10,height:10,borderRadius:"50%",background:T.green,border:`2px solid ${T.bg}`,animation:"pulse 2s infinite"}}/>
          </div>

          <div style={{flex:1}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <h2 style={{margin:0,fontSize:18,fontWeight:900,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:0.5}}>
                Coach C.I.C.
              </h2>
              <div style={{background:`${T.green}18`,border:`1px solid ${T.green}35`,borderRadius:100,padding:"2px 8px",display:"flex",alignItems:"center",gap:4}}>
                <div style={{width:5,height:5,borderRadius:"50%",background:T.green,animation:"pulse 2s infinite"}}/>
                <span style={{fontSize:9,color:T.green,fontWeight:800,letterSpacing:0.5}}>ONLINE</span>
              </div>
            </div>
            <p style={{margin:"2px 0 0",fontSize:11,color:T.mid}}>Treinador financeiro · só motoristas 🚕</p>
          </div>

          {/* Modo Motorista toggle */}
          <button onClick={()=>setModoMoto(true)} style={{
            background:T.surface,border:`1.5px solid ${T.border}`,
            borderRadius:12,padding:"8px 12px",cursor:"pointer",
            display:"flex",flexDirection:"column",alignItems:"center",gap:2,
            transition:"all 0.2s",flexShrink:0,
          }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=T.amber;}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;}}
          >
            <span style={{fontSize:20}}>🚗</span>
            <span style={{fontSize:8,color:T.mid,fontWeight:700,letterSpacing:0.5,fontFamily:"'Barlow Condensed',sans-serif"}}>MOTORISTA</span>
          </button>
        </div>

        {/* Mini stats do usuário */}
        <div style={{display:"flex",gap:8,marginTop:14}}>
          {[
            {ic:"📊",val:"74 pts",label:"Score",cor:T.amber},
            {ic:"🔥",val:"34d",label:"Streak",cor:T.amber},
            {ic:"🚗",val:"62%",label:"Carro",cor:T.green},
          ].map(s=>(
            <div key={s.label} style={{flex:1,background:T.surface,border:`1px solid ${T.border}`,borderRadius:10,padding:"7px 8px",textAlign:"center"}}>
              <div style={{fontSize:13,marginBottom:2}}>{s.ic}</div>
              <div style={{fontSize:12,fontWeight:800,color:s.cor,fontFamily:"'Barlow Condensed',sans-serif"}}>{s.val}</div>
              <div style={{fontSize:9,color:T.mid,letterSpacing:0.5}}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CHAT ── */}
      <div style={{flex:1,overflowY:"auto",padding:"20px 18px 0",position:"relative",zIndex:1,opacity:animIn?1:0,transition:"opacity 0.5s ease"}}>

        {/* Sugestões iniciais */}
        {showSugestoes&&(
          <div style={{marginBottom:22,animation:"fadeUp 0.4s ease"}}>
            <p style={{margin:"0 0 12px",fontSize:9,color:T.mid,letterSpacing:2,fontWeight:700}}>TOQUE PARA COMEÇAR</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {SUGESTOES.map(s=>(
                <button key={s.texto}
                  className="sug-btn"
                  onClick={()=>enviar(s.texto)}
                  style={{
                    background:T.card,border:`1px solid ${T.border}`,borderRadius:12,
                    padding:"11px 12px",cursor:"pointer",textAlign:"left",
                    display:"flex",gap:8,alignItems:"center",
                  }}
                >
                  <span style={{fontSize:17,flexShrink:0}}>{s.emoji}</span>
                  <span style={{fontSize:12,color:T.offwhite,fontFamily:"'Barlow',sans-serif",fontWeight:500,lineHeight:1.3}}>{s.texto}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Mensagens */}
        {msgs.map((m,i)=>(
          <Msg key={i} msg={m} onSpeak={(t)=>falar(t,false)}/>
        ))}

        {/* Typing */}
        {loading&&(
          <div style={{display:"flex",gap:10,marginBottom:16}}>
            <div style={{width:36,height:36,borderRadius:12,flexShrink:0,background:`linear-gradient(135deg,${T.amber},${T.amberD})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🤖</div>
            <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:"4px 18px 18px 18px"}}>
              <Typing/>
            </div>
          </div>
        )}

        {/* Erro */}
        {erro&&(
          <div style={{background:`${T.red}12`,border:`1px solid ${T.red}33`,borderRadius:12,padding:"11px 14px",marginBottom:14,display:"flex",gap:8,alignItems:"center"}}>
            <span>⚠️</span>
            <p style={{margin:0,fontSize:12,color:T.red}}>{erro}</p>
          </div>
        )}

        <div ref={bottomRef} style={{height:14}}/>
      </div>

      {/* ── INPUT ── */}
      <div style={{
        padding:"12px 18px 36px",borderTop:`1px solid ${T.border}`,
        background:T.bg,flexShrink:0,position:"relative",zIndex:1,
      }}>
        {/* Hint modo motorista */}
        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10}}>
          <span style={{fontSize:10}}>🚗</span>
          <span style={{fontSize:10,color:T.mid}}>Dirigindo? Use o <button onClick={()=>setModoMoto(true)} style={{background:"none",border:"none",color:T.amber,fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"'Barlow',sans-serif",padding:0}}>Modo Motorista</button> — mãos livres</span>
        </div>

        <div style={{
          display:"flex",gap:10,alignItems:"flex-end",
          background:T.surface,border:`1px solid ${T.border}`,
          borderRadius:18,padding:"10px 12px",
        }}>
          {/* Mic */}
          <button onPointerDown={toggleMic} style={{
            width:40,height:40,borderRadius:11,border:"none",flexShrink:0,
            background:listening?T.amber:T.dim,
            color:"#fff",fontSize:18,cursor:"pointer",
            display:"flex",alignItems:"center",justifyContent:"center",
            boxShadow:listening?`0 4px 16px ${T.amber}55`:"none",
            transition:"all 0.2s",
            animation:listening?"voicePulse 1.2s infinite":"none",
          }}>🎙️</button>

          {/* Textarea */}
          <textarea
            ref={taRef}
            value={input||transcript}
            onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();enviar();}}}
            placeholder={listening?"Ouvindo... 🎙️":"Fale ou escreva..."}
            rows={1}
            style={{
              flex:1,background:"transparent",border:"none",outline:"none",
              resize:"none",overflow:"hidden",color:T.white,
              fontFamily:"'Barlow',sans-serif",fontSize:14,lineHeight:1.5,
              paddingTop:3,maxHeight:90,overflowY:"auto",
              fontStyle:listening?"italic":"normal",
            }}
            onInput={e=>{
              e.target.style.height="auto";
              e.target.style.height=Math.min(e.target.scrollHeight,90)+"px";
            }}
          />

          {/* Enviar */}
          <button onClick={()=>enviar()} disabled={!(input||transcript).trim()||loading} style={{
            width:40,height:40,borderRadius:11,border:"none",flexShrink:0,
            background:(input||transcript).trim()&&!loading?T.amber:T.dim,
            color:(input||transcript).trim()&&!loading?"#000":T.mid,
            fontSize:18,cursor:"pointer",
            display:"flex",alignItems:"center",justifyContent:"center",
            boxShadow:(input||transcript).trim()&&!loading?`0 4px 16px ${T.amber}55`:"none",
            transition:"all 0.2s",
          }}>
            {loading
              ?<div style={{width:16,height:16,border:"2px solid rgba(0,0,0,0.3)",borderTopColor:"#000",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
              :"↑"
            }
          </button>
        </div>
      </div>

      {/* ── MODO MOTORISTA OVERLAY ── */}
      {modoMoto&&(
        <ModoMotorista
          onClose={()=>setModoMoto(false)}
          onSend={enviar}
          listening={listening}
          falando={falando}
          onMic={toggleMic}
          transcript={transcript}
          msgs={msgs}
        />
      )}
    </div>
  );
}