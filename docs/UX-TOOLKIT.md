# UX Toolkit — Progressive Disclosure & Hierarchy

Objetivo: reduzir densidade e aumentar decisão sem mexer no backend.

Principais tokens
- Spacing base: 8px. Use `p-4`, `p-6`, `gap-6` consistentemente.
- Card max-height: `max-h-card` (420px). Conteúdo maior → preview + drawer.

Componentes principais
- `PrimaryCard` — foco da tela (título curto, 1 ação). Use para KPI e painéis principais.
- `SecondaryCard` — contexto e supportive info, uso em listas e detalhes rápidos.
- `CompactRow` — linha de lista compacta, com possível `expand` para drawer.
- `Drawer` — detalhes/edição rápida. Mantém o user no contexto.

Guidelines rápidas
- 1 foco primário acima da dobra.
- Colapsar: textos > 3 linhas em cards viram preview com `ver mais`.
- Lista longa: paginar ou lazy-load; não apresentar tudo por default.

Sprint 1 (prioridade)
- Aplicar `PrimaryCard` ao Dashboard principal.
- Trocar listas para `CompactRow` com `Drawer` para detalhe.
- Validar: tempo até primeira ação (ideal reduzir 30%).

Notas de implementação
- Não alterar lógica de dados.
- Evitar modais para tarefas não críticas; usar `Drawer`.
