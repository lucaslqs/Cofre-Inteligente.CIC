import { useState } from "react";

export default function CicCadastro({ onComplete }) {
  const [dados, setDados] = useState({
    nome: "", telefone: "", ganhoDiario: "", kmDiario: ""
  });

  const salvar = () => {
    if (!dados.nome || !dados.telefone) return alert("Preencha ao menos nome e telefone!");
    localStorage.setItem("cic_usuario", JSON.stringify(dados));
    onComplete(); // Isso avisa o App.jsx que o cadastro acabou
  };

  return (
    <div style={{ padding: "40px 20px", background: "#080810", minHeight: "100vh", color: "#F4F1EB", fontFamily: "'DM Sans', sans-serif" }}>
      <h1 style={{ color: "#FF4D1C" }}>Configurar Perfil</h1>
      <p style={{ fontSize: 14, color: "#6B6B85" }}>Insira seus dados para que a IA personalize seus cálculos financeiros.</p>
      
      <div style={{ marginTop: 20 }}>
        <input placeholder="Nome" onChange={e => setDados({...dados, nome: e.target.value})} style={inputStyle} />
        <input placeholder="WhatsApp" onChange={e => setDados({...dados, telefone: e.target.value})} style={inputStyle} />
        <input type="number" placeholder="Ganho médio diário (R$)" onChange={e => setDados({...dados, ganhoDiario: e.target.value})} style={inputStyle} />
        <input type="number" placeholder="KM médio diário" onChange={e => setDados({...dados, kmDiario: e.target.value})} style={inputStyle} />
        
        <button onClick={salvar} style={buttonStyle}>Confirmar e Iniciar</button>
      </div>
    </div>
  );
}

const inputStyle = { width: "100%", padding: "14px", margin: "10px 0", borderRadius: 12, border: "1px solid #2E2E45", background: "#10101C", color: "#fff", fontSize: 16 };
const buttonStyle = { width: "100%", padding: "16px", marginTop: 20, background: "#FF4D1C", border: "none", color: "#fff", borderRadius: 12, fontWeight: "bold", fontSize: 16, cursor: "pointer" };
