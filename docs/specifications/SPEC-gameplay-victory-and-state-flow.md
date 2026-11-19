# SPEC — Gameplay State Machine (`EDITING` / `RUNNING` / `PAUSED` / `RESULT`) & Victory Overlay

> **Status:** IMPLEMENTED & VERIFIED  
> **Data:** 2026-11-18  
> **Requisitos associados:** `RF-010`, `RF-011`, `RF-014`, `RF-016`, `RF-018`

---

## 1. Matriz de Permissões por Estado da Sessão

| Estado | Selecionar / Inspecionar | Colocar / Girar / Remover / Salvar Regras | Comandos Habilitados | Feedback Visual no HUD |
|---|---|---|---|---|
| `EDITING` | Sim (seleciona peça e abre inspetor editável) | Sim (sujeito ao orçamento da fase e células livres) | `Iniciar`, `Girar (R)`, `Cancelar (Esc)`, troca de fase/modo | Badge `MODO EDIÇÃO`, prévia `ghost` ativa, contadores de peças nos botões |
| `RUNNING` | Sim (inspeção somente leitura ao clicar em peça) | Não (`NOT_EDITING`) | `Pausar` (primário), `Editar fábrica`, `Reiniciar tentativa` | Badge verde `EM EXECUÇÃO`, itens e máquinas animados |
| `PAUSED` | Sim (inspeção somente leitura ao clicar em peça) | Não até acionar `Editar fábrica` | `Retomar`, `Editar fábrica` (CTA primário destacado), `Reiniciar tentativa` | Badge âmbar `SIMULAÇÃO PAUSADA` + Banner `#paused-callout-banner` com CTA `Editar fábrica` |
| `RESULT` | Resultados no Overlay Central (ou `Editar fábrica` / `Esc` para voltar à edição) | Não até acionar `Editar fábrica` | `Próxima fase`, `Repetir fase`, `Editar fábrica`, `Selecionar fase`, `Menu principal` | Overlay modal central `#result-panel` com scrim sobre o viewport 3D |

---

## 2. Transições Seguras e Prevenção de Ferramentas Travadas

1. **`PAUSED → EDITING` (`Editar fábrica`):**
   - Para o timer de ticks (`stopTimer()`).
   - Reinicia contadores de tentativa (`tick = 0`, slots vazios, diagnósticos limpos) preservando integralmente os componentes posicionados e suas regras (`editSession`).
   - Reabilita todos os botões da toolbar de acordo com `getToolAvailability` e o orçamento real (`state.inventory`).
   - Oculta `#paused-callout-banner` e `#result-panel`.
2. **Navegação entre telas (`GAMEPLAY → MAIN_MENU / LEVEL_SELECT`):**
   - `NavigationController.setScreen` invoca `simulation.ensureEditingMode()` ao sair de `GAMEPLAY`, garantindo que nenhum `setInterval` continue ativo em background e que `EditorController` retorne ao modo `EDITING` antes de qualquer troca de fase ou modo.

---

## 3. Tela / Overlay Central de Vitória (`#result-panel`)

- **Estrutura:** `<section id="result-panel" class="victory-overlay" role="dialog" aria-modal="true" aria-labelledby="result-heading">`.
- **Elementos Obrigatórios:**
  - Título localizado: `"Fábrica concluída!"` (`pt-BR`) / `"Factory Complete!"` (`en`).
  - Identificação da fase: `<id> · <título traduzido>`.
  - Destaque gráfico de estrelas (`#result-stars-visual`): 3 ícones SVG (`[data-star-index="1".."3"]`) com `data-earned="true|false"` + texto acessível `#result-stars`.
  - Badge de recorde (`#result-record-badge`): indica `"Novo recorde da fase!"` ou compara com a melhor marca salva (`bestResultsByLevel`).
  - Grade de 5 cartões de métricas: Ciclos totais, Itens entregues, Rejeitados, Trocas SHIFT e Peças usadas.
  - 5 botões de ação: `Próxima fase` (habilitado somente quando `getNextLevelId()` existe), `Repetir fase`, `Editar fábrica`, `Selecionar fase` e `Menu principal`.
- **Acessibilidade e Persistência:**
  - Ao abrir, move o foco para `Próxima fase` (ou `Repetir fase` na última fase).
  - Pressionar `Escape` fecha o overlay retornando para `EDITING` (`Editar fábrica`) e restaura o foco.
  - Desbloqueio e melhor resultado são persistidos uma única vez por conclusão em `recordLevelCompletion`.
