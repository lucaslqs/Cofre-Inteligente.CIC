import { useState, useEffect, useRef } from "react";

const T = { bg: "#05050A", surface: "#0C0C12", card: "#11111A", amber: "#F5A623", white: "#EFECE5" };

const getSystemPrompt = (u) => `
Você é o COACH do C.I.C., treinador financeiro de motoristas de app.
CONTEXTO: Nome: ${u.nome || "Motorista"}, Ganho: R$${u.ganhoDiario || "0"}, KM: ${u.kmDiario || "0"}.
PERSONALIDADE: Amigo motorista, empático. Evite termos bancários. Use: "guardar", "meta", "corrida".
FORMATO: Respostas curtas, máximo 3 parágrafos. Termine com uma pergunta ou ação.
`;

export default function CICChat() {
  const [msgs, setMsgs] = useState([{role:"assistant", content:"E aí! Como foi hoje? Fala pra mim que eu te ajudo a decidir quanto guardar."}]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function enviar() {
    if (!input.trim() || loading) return;
    const q = input.trim();
    setInput("");
    setMsgs(p => [...p, {role: "user", content: q}]);
    setLoading(true);

    const usuario = JSON.parse(localStorage.getItem("cic_usuario") || "{}");

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          "x-api-key": "SUA_CHAVE_AQUI", 
          "anthropic-version": "2023-06-01" 
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20240620",
          max_tokens: 600,
          system: getSystemPrompt(usuario),
          messages: [{role: "user", content: q}]
        }),
      });
      const data = await res.json();
      const resposta = data.content[0].text;
      setMsgs(p => [...p, {role: "assistant", content: resposta}]);
    } catch (e) {
      alert("Erro na conexão. Verifique sua API Key.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{minHeight:"100vh", background:T.bg, color:T.white, padding:20}}>
      {msgs.map((m, i) => (
        <div key={i} style={{margin:"10px 0", color: m.role === "user" ? T.amber : T.white}}>
          <strong>{m.role === "user" ? "Você: " : "Coach: "}</strong>{m.content}
        </div>
      ))}
      {loading && <p style={{color:T.amber}}>Coach está pensando...</p>}
      <div style={{position:"fixed", bottom:20, width:"90%"}}>
        <input value={input} onChange={e=>setInput(e.target.value)} style={{width:"80%"}} />
        <button onClick={enviar}>Enviar</button>
      </div>
    </div>
  );
}
