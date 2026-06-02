import { useState } from "react";

export default function CicCadastro({ onComplete }) {
  const [dados, setDados] = useState({
    nome: "", telefone: "", email: "", ganhoDiario: "", kmDiario: ""
  });

  const salvar = () => {
    if (!dados.nome || !dados.email) return alert("Nome e E-mail são obrigatórios!");
    localStorage.setItem("cic_usuario", JSON.stringify(dados));
    onComplete();
  };

  const resetarCadastro = () => {
    if (confirm("Isso apagará seus dados atuais. Tem certeza?")) {
      localStorage.removeItem("cic_usuario");
      alert("Dados removidos. A página será atualizada.");
      window.location.reload();
    }
  };

  return (
    <div style={{ padding: "40px 20px", background: "#080810", minHeight: "100vh", color: "#F4F1EB", fontFamily: "'DM Sans', sans-serif" }}>
      <h1 style={{ color: "#FF4D1C", fontSize: 24 }}>Configuração Inicial 🚕</h1>
      <p style={{ fontSize: 14, color: "#6B6B85" }}>Preencha seu perfil para personalizarmos seus cálculos financeiros.</p>
      
      <div style={{ marginTop: 20 }}>
        <input placeholder="Nome completo" onChange={e => setDados({...dados, nome: e.target.value})} style={inputStyle} />
        <input placeholder="WhatsApp" onChange={e => setDados({...dados, telefone: e.target.value})} style={inputStyle} />
        <input type="email" placeholder="Seu melhor e-mail" onChange={e => setDados({...dados, email: e.target.value})} style={inputStyle} />
        <input type="number" placeholder="Ganho médio diário (R$)" onChange={e => setDados({...dados, ganhoDiario: e.target.value})} style={inputStyle} />
        <input type="number" placeholder="KM médio rodado por dia" onChange={e => setDados({...dados, kmDiario: e.target.value})} style={inputStyle} />
        
        <button onClick={salvar} style={buttonStyle}>Confirmar e Iniciar</button>
      </div>

      <p onClick={resetarCadastro} style={{ textAlign: 'center', fontSize: 12, color: "#444", marginTop: 40, cursor: "pointer", textDecoration: "underline" }}>
        Esqueci meus dados / Resetar perfil
      </p>
    </div>
  );
}

const inputStyle = { width: "100%", padding: "14px", margin: "8px 0", borderRadius: 12, border: "1px solid #2E2E45", background: "#10101C", color: "#fff", fontSize: 16 };
const buttonStyle = { width: "100%", padding: "16px", marginTop: 20, background: "#FF4D1C", border: "none", color: "#fff", borderRadius: 12, fontWeight: "bold", fontSize: 16, cursor: "pointer" };
