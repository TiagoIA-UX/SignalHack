import { useEffect, useState } from "react";
import { getSession, signOut } from "../lib/auth";

export default function AccountPage() {
  const [session, setSession] = useState<any>(null);
  useEffect(() => {
    getSession().then(setSession).catch(() => setSession(null));
  }, []);

  return (
    <div>
      <h2>Conta</h2>
      <pre style={{ background: "#111", color: "#eee", padding: 12 }}>{JSON.stringify(session, null, 2)}</pre>
      <button onClick={() => signOut()}>Sair</button>
    </div>
  );
}
