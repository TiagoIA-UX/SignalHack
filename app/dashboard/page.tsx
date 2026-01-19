import { redirect } from "next/navigation";

export default function DashboardPage() {
  // Rota mantida para links antigos.
  // O sistema principal (FULL, sem login) está em `/app`.
  redirect("/app");
}

