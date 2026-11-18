# UX-001 — Fluxos e estados de interação

## Fluxos principais

```text
Home → Level Select → Level Editor → Run ↔ Pause → Result
                              ↑          │       │
                              └─ Edit/Reset ─────┘
Home → Sandbox Editor → Run ↔ Pause → Edit/Reset
```

### Fluxo de construção

1. Selecionar Conveyor, Processor ou Diverter na toolbar.
2. Mover cursor sobre grade: ghost com rotação atual + seta de saída + indicação textual de valid/invalid.
3. Clique confirma placement em célula livre; orçamento decrementado; selecionar permite inspecionar ports.
4. `R` muda direção em 90°. Clique direito remove componente móvel, reembolsando inventário. `Esc` desmarca.
5. Painel contextual de Processor/Diverter apresenta no máximo duas regras com selects acessíveis e erro inline.
6. `Start` valida layout/rules. Se falhar, apresenta erro com origem e botão "Go to component"; não inicia estado inválido.

### Fluxo de simulação

- Em RUNNING: toolbar edição indisponível, botões Pause e Reset visíveis, HUD contagem, indicador de status e velocidade.
- Pause congela engine, interpolação e áudio de evento; Resume retoma tick futuro sem aplicar ticks durante suspensão.
- Edit exige confirmação de perda do progresso da tentativa, mas mantém máquinas e regras.
- Ao completar metas, Result congela simulação e mostra métricas e próximos passos.

### Mensagens obrigatórias

`Output blocked`, `Missing rule for incoming item`, `Invalid orientation`, `Cell occupied`, `Inventory limit reached`, `Wrong product rejected`, `Possible deadlock`, `Goal complete`. Exibir componente/célula responsável e instrução de resolução, sem spam por tick.

## Controle e foco

| Entrada | Ação | Restrição |
|---|---|---|
| Clique esquerdo | Colocar/selecionar | Canvas/editor |
| Clique direito | Remover | Só EDITING, preventDefault no canvas |
| R | Rotacionar | Só com canvas/ferramenta ativa e sem input textual |
| Espaço | Start/Pause/Resume | Não interferir em inputs e seletores |
| Esc | Cancelar ferramenta/modal | Respeitar foco |
| Wheel | Zoom ortográfico | Apenas quando pointer sobre viewport; clamp |
| Mouse médio | Pan (P1) | Sem eixos invertidos; opcional |

## Acessibilidade

- Indicadores CUT/PRESS distinguíveis por **forma + texto + cor**.
- Foco visível e labels/aria nos controles DOM; feedback de erro acessível no painel.
- Não usar apenas tooltip por hover; permitir click/selection.
- Animações reduzidas por preferência do sistema (`prefers-reduced-motion`) quando possível; nenhuma animação essencial à compreensão.
- Canvas não substitui todo texto de interface; HUD/controles em DOM.

## Responsividade desktop

1280×720 mínimo funcional, 1920×1080 ideal. Toolbar retrátil em largura insuficiente; painel de inspeção não tapa goal/HUD. UI não deve ter 2 barras de busca ou modais duplicados. Evitar scroll involuntário e navegação invertida.
