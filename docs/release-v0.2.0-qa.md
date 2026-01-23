# QA checklist — Release v0.2.0

Objetivo: confirmar que Playbook Advanced Mode e cache invalidation funcionam corretamente em Desktop/Tablet/Mobile.

Tempo estimado: 2 minutos por plataforma.

Passos rápidos (ordem mínima):

1. Ambiente
   - URL: https://signalhack.vercel.app/app
   - Abra em modo anônimo (ou limpe dados do site) antes do teste.

2. Testes principais
   - Fluxo principal (sem login)
     - Ver (desktop e tablet): seção **Playbook pré-preenchido (automático)** está visível e não exibe campos manuais por padrão.
     - Botão **Confirmar Negócio em Potencial** deve estar desabilitado quando a métrica for inválida.
   - Auto-recomendar
     - Clique **Auto-recomendar playbook**: campos de oportunidade / ação / métrica aparecem preenchidos com números (ex.: "20 contatos → 3 respostas").
     - Confirme que a métrica preenchida é reconhecida como válida e habilita o botão **Confirmar...**.
   - Modo Avançado
     - Clique **Abrir modo avançado**: campos manuais (Oportunidade / Ação / Métrica) devem aparecer e ser editáveis.
     - Edite a métrica para algo inválido e veja o botão de salvar/confirmar ficar desabilitado.
   - Save path
     - Salve um playbook com métrica válida; verifique que aparece em **Minhas Validações**.

3. Verificações técnicas
   - Service Worker
     - /sw.js deve conter `CACHE_NAME = "zairix-cache-v2"` (bump aplicado).
     - Em caso de problemas no tablet, limpar dados do site ou forçar reload para ativar novo SW.
   - Endpoints
     - /api/health → 200
     - /api/debug-db → 200
   - Logs
     - Verificar Sentry (se ativo) por erros de client/server durante o teste.

4. O que reportar em regressão
   - Plataforma (desktop/tablet/mobile), user-agent, hora, passo exato que falhou.
   - HTML (snippet) ou screenshot mostrando campos indevidos ou versão antiga.
   - Cabeçalho de /sw.js (ex.: CACHE_NAME) e resposta de /api/health.

5. Observações
   - Se o tablet mostrar versão antiga, pedir ao usuário para limpar dados do site; caso persista, registrar passo a passo e a hora para investigação.

Arquivo de referência: `.github/RELEASE_NOTES/v0.2.0-internal.md`

---

Feito por: GitHub Copilot (Raptor mini) — monitoração inicial: 24h

