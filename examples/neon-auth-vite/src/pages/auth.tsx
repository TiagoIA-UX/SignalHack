import { useState } from "react";
import { requestMagicLink } from "../lib/auth";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    try {
      await requestMagicLink(email);
      setStatus("Verifique seu email (link enviado). Se usar SMTP não configurado, o link aparece no console da API).");
    } catch (err) {
      setStatus("Erro ao enviar link.");
    }
  }

  return (
    <div>
      <h2>Solicitar Magic Link</h2>
      <form onSubmit={submit}>
        <input type="email" placeholder="seu@email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button style={{ marginLeft: 8 }}>Enviar</button>
      </form>
      {status ? <div style={{ marginTop: 10 }}>{status}</div> : null}
    </div>
  );
}
