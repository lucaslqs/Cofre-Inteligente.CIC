import { useState } from "react";
import Chat from "./cic-chat-ia";
import Cadastro from "./cic-cadastro";

export default function App() {
  const [logado, setLogado] = useState(!!localStorage.getItem("cic_usuario"));

  if (!logado) return <Cadastro onComplete={() => setLogado(true)} />;
  return <Chat />;
}
