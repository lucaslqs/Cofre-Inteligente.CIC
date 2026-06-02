import { useState, useEffect, useRef } from "react";

// --- 1. CONFIGURAÇÕES E ESTILOS ---
const T = { bg: "#05050A", card: "#11111A", amber: "#F5A623", amberD: "#B87A10", white: "#EFECE5", mid: "#68656E", green: "#22C55E" };
const hora = () => new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});

// --- 2. LÓGICA DO PROMPT (O CÉREBRO) ---
const getSystemPrompt = (u) => `Você é o COACH do C.I.C. 
CONTEXTO: Nome: ${u.nome || "Motorista"}, Meta: ${u.meta || "Carro"}. 
PERSONALIDADE: Amigo e parceiro de corrida. Evite termos bancários. Use "guardar" e "meta". 
FORMATO: Respostas curtas (até 3 parágrafos).`;

// --- 3. COMPONENTE PRINCIPAL ---
export default function CICChat() {
  const [msgs, setMsgs] = useState([{role:"assistant", content:"E aí! Como foi a corrida hoje?", time:hora()}]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Função de voz simples
  const falar = (texto) => {
    const u = new SpeechSynthesisUtterance(texto);
    u.lang = "pt-BR";
    window.speechSynthesis.speak(u);
  };

  // Função de envio para o GROQ (IA Gratuita)
  async function enviar() {
    if (!input.trim() || loading) return;
    const q = input.trim();
    setInput("");
    const hist = [...msgs, {role: "user", content: q, time: hora()}];
    setMsgs(hist);
    setLoading(true);

    const usuario = JSON.parse(localStorage.getItem("cic_usuario") || "{}");

    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`

        body: JSON.stringify({
          model: "llama3-8b-8192",
          messages: [
            { role: "system", content: getSystemPrompt(usuario) },
            ...hist.map(m => ({ role: m.role, content: m.content }))
          ]
        }),
      });

      const data = await res.json();
      const resposta = data.choices[0].message.content;
      setMsgs(p => [...p, {role: "assistant", content: resposta, time: hora()}]);
      falar(resposta);
    } catch (e) {
      alert("Erro na conexão: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{background:T.bg, color:T.white, minHeight:"100vh", padding:20, maxWidth:440, margin:"0 auto"}}>
      {msgs.map((m, i) => (
        <div key={i} style={{marginBottom:15, padding:10, background: m.role === "user" ? T.amber : T.card}}>
          <p>{m.content}</p>
        </div>
      ))}
      
      {loading && <p style={{color:T.amber}}>Coach está pensando...</p>}

      <div style={{position:"fixed", bottom:20, width:"100%", maxWidth:400, display:"flex"}}>
        <input value={input} onChange={e => setInput(e.target.value)} style={{flex:1}} />
        <button onClick={enviar}>Enviar</button>
      </div>
    </div>
  );
}
