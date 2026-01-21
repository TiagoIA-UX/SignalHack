import { AppHeader } from "@/components/AppHeader";
import { Badge, Button, Card, Container } from "@/components/ui";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="pt-24 pb-16">
        <section id="promessa" className="py-10">
          <Container>
            <div className="mx-auto max-w-5xl space-y-6">
              <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                <span className="uppercase tracking-[0.2em]">sem login • sem cadastro • uso imediato</span>
                <span className="text-zinc-600">•</span>
                <Badge>Sistema de decisão</Badge>
              </div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Em 7 dias, você decide com critério — ou descarta sem culpa.
              </h1>
              <p className="text-zinc-300">
                O SignalHack elimina achismo e hype. Você entra, registra sinais reais e conclui se vale investir ou abandonar.
              </p>
              <Card className="p-5">
                <div className="text-sm font-semibold text-emerald-100">Critério de sucesso (7 dias)</div>
                <div className="mt-2 text-sm text-zinc-300">
                  Sucesso = sinal confirmado e experimento válido. Falha = sinal fraco e decisão de descartar.
                </div>
              </Card>
              <div className="mt-2 text-sm text-zinc-400">
                Inimigo explícito: <strong>ideias</strong>, <strong>achismo</strong> e <strong>hype</strong>.
              </div>
              <div className="flex flex-wrap gap-3">
                <Button href="/app">Abrir painel</Button>
              </div>
            </div>
          </Container>
        </section>

        <section id="metodo" className="py-10 border-t border-white/5">
          <Container>
            <div className="mx-auto max-w-5xl space-y-5">
              <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">Método simples</div>
              <div className="grid gap-4 md:grid-cols-5">
                {[
                  { t: "SINAL", d: "Registre o que você viu no mercado ou no comportamento do público." },
                  { t: "TESE", d: "Escreva em uma frase por que isso pode ser dinheiro." },
                  { t: "EXPERIMENTO", d: "Defina o teste mínimo que valida a tese." },
                  { t: "MÉTRICA", d: "Escolha uma métrica objetiva para medir." },
                  { t: "DECISÃO", d: "Continuar, ajustar ou descartar — sem debate infinito." },
                ].map((s) => (
                  <Card key={s.t} className="p-4">
                    <div className="text-sm font-semibold text-zinc-100">{s.t}</div>
                    <div className="mt-2 text-sm text-zinc-300">{s.d}</div>
                  </Card>
                ))}
              </div>
            </div>
          </Container>
        </section>

        <section id="entrega" className="py-10 border-t border-white/5">
          <Container>
            <div className="mx-auto max-w-5xl space-y-4">
              <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">Entrega objetiva em 7 dias</div>
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="p-5">
                  <div className="text-sm font-semibold text-emerald-100">Você recebe</div>
                  <ul className="mt-3 space-y-2 text-sm text-zinc-300">
                    <li>- Lista de sinais registrados.</li>
                    <li>- Tese escrita em linguagem simples.</li>
                    <li>- Experimento executável em 7 dias.</li>
                    <li>- Métrica definida e medida.</li>
                    <li>- Decisão final registrada.</li>
                  </ul>
                </Card>
                <Card className="p-5">
                  <div className="text-sm font-semibold text-emerald-100">Você evita</div>
                  <ul className="mt-3 space-y-2 text-sm text-zinc-300">
                    <li>- Rodar semanas em ideias fracas.</li>
                    <li>- Decidir por opinião.</li>
                    <li>- Esperar “mais dados” indefinidamente.</li>
                  </ul>
                </Card>
              </div>
            </div>
          </Container>
        </section>

        <section id="para-quem" className="py-10 border-t border-white/5">
          <Container>
            <div className="mx-auto max-w-5xl space-y-4">
              <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">Para quem é</div>
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  "Operadores que precisam decidir rápido.",
                  "Times B2B com pouca margem para erro.",
                  "Quem testa ofertas em ciclos curtos.",
                ].map((t) => (
                  <Card key={t} className="p-4">
                    <div className="text-sm text-zinc-300">{t}</div>
                  </Card>
                ))}
              </div>
            </div>
          </Container>
        </section>

        <section id="nao-e" className="py-10 border-t border-white/5">
          <Container>
            <div className="mx-auto max-w-5xl space-y-4">
              <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">Para quem NÃO é</div>
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  "Quem quer inspiração ou motivação.",
                  "Quem busca promessas de resultado garantido.",
                  "Quem não vai executar o experimento.",
                ].map((t) => (
                  <Card key={t} className="p-4">
                    <div className="text-sm text-zinc-300">{t}</div>
                  </Card>
                ))}
              </div>
            </div>
          </Container>
        </section>

        <section id="comecar" className="py-10 border-t border-white/5">
          <Container>
            <div className="mx-auto max-w-5xl">
              <Card className="p-6">
                <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">Começar</div>
                <div className="mt-3 flex flex-wrap gap-3">
                  <Button href="/app">Registrar um sinal</Button>
                  <Button href="/app" variant="ghost">
                    Criar tese
                  </Button>
                  <Button href="/app" variant="ghost">
                    Rodar experimento
                  </Button>
                </div>
              </Card>
            </div>
          </Container>
        </section>

        <section id="ajuda" className="py-10 border-t border-white/5">
          <Container>
            <div className="mx-auto max-w-5xl space-y-4">
              <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">Ajuda / orientação</div>
              <Card className="p-6">
                <div className="text-sm font-semibold text-emerald-100">Como usar melhor</div>
                <ul className="mt-3 space-y-2 text-sm text-zinc-300">
                  <li>- Use sinais reais, não hipóteses vagas.</li>
                  <li>- Defina um teste que caiba em 7 dias.</li>
                  <li>- Se a métrica não mexer, descarte sem apego.</li>
                </ul>
              </Card>
              <Card className="p-6">
                <div className="text-sm font-semibold text-emerald-100">O que o sistema NÃO faz</div>
                <ul className="mt-3 space-y-2 text-sm text-zinc-300">
                  <li>- Não prevê o futuro.</li>
                  <li>- Não substitui decisão humana.</li>
                  <li>- Não executa por você.</li>
                </ul>
              </Card>
            </div>
          </Container>
        </section>
      </main>
    </div>
  );
}

