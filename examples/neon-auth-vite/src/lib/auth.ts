// Minimal wrapper to interact with Neon Auth endpoints via fetch.
// Adjust according to the official `@neondatabase/neon-js` SDK when you use it.

const authUrl = import.meta.env.VITE_NEON_AUTH_URL as string;

export async function requestMagicLink(email: string) {
  if (!authUrl) throw new Error("VITE_NEON_AUTH_URL not set");
  // Neon Auth endpoints vary by configuration; this example assumes a POST /magic-link-like endpoint.
  const res = await fetch(`${authUrl.replace(/\/$/, "")}/auth/request`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error(String(await res.text()));
  return res.json();
}

export async function getSession() {
  if (!authUrl) throw new Error("VITE_NEON_AUTH_URL not set");
  const res = await fetch(`${authUrl.replace(/\/$/, "")}/auth/session`, { credentials: "include" });
  if (!res.ok) return null;
  return res.json();
}

export async function signOut() {
  if (!authUrl) throw new Error("VITE_NEON_AUTH_URL not set");
  await fetch(`${authUrl.replace(/\/$/, "")}/auth/logout`, { method: "POST", credentials: "include" });
}
