# REPORT-PHASE-02 — Viewport 3D e grade isométrica

> Data/hora: 2026-11-18 11:23 America/Sao_Paulo (UTC−03:00)  
> Status: PARTIAL  
> Gate: G02 — PARTIAL  
> Commit: não realizado; branch `main` sem commits  
> Requisitos: RF-001; RNF-006; SPEC-001

## 1. Baseline verificada

- Relatório anterior lido: [REPORT-PHASE-01-foundation.md](REPORT-PHASE-01-foundation.md), G01 `PARTIAL`.
- O projeto contém scaffold/configurações e uma página de status, mas dependências npm ainda não estão instaladas; não há lockfile.
- O working tree está na branch `main`, sem commits. O registry continua inacessível por `ALL_PROXY=http://127.0.0.1:9`; npm em modo offline não resolve os manifests.
- A orientação mais recente do usuário solicita avançar as fases e criar os testes mesmo quando não for possível executar a aplicação ou os testes. Portanto, a Fase 02 prossegue com G01 parcial, registrando explicitamente a exceção e os limites da validação.
- Nenhuma aplicação ou servidor foi iniciado nesta fase.

## 2. Plano executado

- Criado modelo lógico puro de grid com dimensões, conversão centro de célula ↔ coordenada mundial, validação de limites e tamanho de célula.
- Criada cena Three.js com câmera ortográfica isométrica fixa, iluminação, 64 tiles alternados, source e dois outputs apenas demonstrativos.
- Adicionados colliders invisíveis e uma lista dedicada de alvos de picking; raycast consulta somente esses alvos, ignorando malhas decorativas. A seleção atualiza destaque e coordenada no HUD de debug.
- Implementados resize com `ResizeObserver` (fallback para `window.resize`), ajuste do frustum à proporção, zoom de roda limitado e limpeza de listeners, geometrias, materiais e renderer.
- Atualizada a página inicial para incluir o canvas, HUD de runtime e fallback WebGL existente.
- Criados testes Vitest planejados para transformações, limites, seleção de collider, clamps de zoom e proporção do frustum. Os testes do runner ainda não foram executados.
- Sem pan: era opcional no prompt e a câmera permanece fixa, conforme o escopo.

### Arquivos criados/alterados

- `src/game/domain/grid.model.ts`
- `src/game/domain/grid.model.test.ts`
- `src/game/interaction/grid-picking.ts`
- `src/game/interaction/grid-picking.test.ts`
- `src/game/rendering/grid-view.ts`
- `src/game/rendering/scene-manager.ts`
- `src/game/rendering/zoom.ts`
- `src/game/rendering/zoom.test.ts`
- `src/main.ts`, `src/status.ts`, `src/styles/main.css`, `index.html`, `README.md`
- `docs/qa/TEST-PLAN.md`, `docs/qa/TRACEABILITY.md`
- `docs/reports/REPORT-PHASE-02-scene-grid.md`

## 3. Evidências técnicas

| Comando/verificação | Executado? | Resultado real | Observações |
|---|---:|---|---|
| `node --check` em todos os 12 arquivos `src/**/*.ts` | Sim | PASS | Sintaxe apenas; não resolve imports nem faz typecheck. |
| Asserções Node sobre `gridToWorld`/`worldToGrid` em 64 células, limite externo, clamps de zoom e frustum em aspect 2 | Sim | PASS | Importou diretamente os módulos TypeScript puros com Node 24; não é execução do Vitest. |
| Asserção Node sobre picking via import de `grid-picking.ts` | Tentada | NOT_RUN | Node não resolve o import relativo sem extensão TS fora do bundler/Vitest; o caso existe em `grid-picking.test.ts`. |
| `npm run test` | Não nesta fase | NOT_RUN | Vitest segue ausente; Fase 01 registrou o comando falhando porque o binário não foi instalado. |
| `npm run lint` / `npm run typecheck` / `npm run build` | Não nesta fase | NOT_RUN | Dependências não instaladas; resultados anteriores estão no relatório da Fase 01. |
| `npm run dev -- --host 127.0.0.1 --port 3000` | Não nesta fase | NOT_RUN | Nenhum app foi iniciado; tentativa anterior falhou porque Vite não está instalado. |
| Resize/picking/zoom em browser e screenshot 1280×720 | Não | NOT_RUN | Exigiria executar a aplicação e renderer WebGL; não há screenshot. |

## 4. Critérios de aceite

| Critério | PASS/FAIL/NOT_RUN | Evidência |
|---|---|---|
| Grade lógica 8×8 com transformações centro/ mundo | PARTIAL | Modelo e testes escritos; 64 round-trips executados via Node, sem runner Vitest. |
| Grid 8×8 e amostras visuais em cena Three.js | PARTIAL | Cena e dados implementados; renderização não iniciada/inspecionada. |
| Raycast seleciona célula e ignora decorativos | PARTIAL | Alvos de colisão isolados e teste escrito; browser não executado. |
| Câmera ortográfica, resize e zoom com clamp | PARTIAL | Implementação e testes puros escritos; resize visual não comprovado. |
| Interação estável em 1280×720 com evidência visual | NOT_RUN | Sem navegador/screenshot. |
| Cleanup do renderer, geometria, material e listeners | PARTIAL | `dispose()` implementado; sem runtime para observar ciclo de criação/descarte. |

## 5. Problemas, dívidas e riscos

- **F02-001 — HIGH — Renderização não verificada.** Consequência: câmera, escala aparente, seleção e layout visual podem precisar de ajuste. Ação: executar a aplicação e inspecionar em 1280×720 e 1920×1080 quando o ambiente permitir.
- **F02-002 — HIGH — Testes Vitest não executados.** Consequência: import types, configuração e assertions do runner podem ter incompatibilidades. Ação: instalar dependências e executar `npm run test`, typecheck, lint e build.
- **F02-003 — MEDIUM — Raycaster depende da hierarquia de coordenadas Three.js.** As transformações lógicas são puras, mas cruzamento de ray/colliders não foi exercitado no navegador.
- **F02-004 — LOW — Pan da câmera não implementado.** Permanece opcional; zoom e câmera fixa cobrem o escopo requerido nesta fase.

## 6. Mudanças documentais

- Adicionados `TC-029` (grid/world), `TC-030` (picking) e `TC-031` (zoom/resize) ao plano de testes.
- A linha RF-001/002/003 na matriz agora inclui esses casos; status permanece `PLANNED`, pois Vitest e verificação visual não rodaram.
- Backlog, requisitos e SPEC-001 não foram marcados como verificados; não há evidência de gate completo.

## 7. Decisão do gate

**G02: PARTIAL.** O código da grade/câmera e os testes foram escritos, e as transformações/zoom puros passaram por asserções Node. Renderização real, picking WebGL, screenshot, lint, typecheck, Vitest e build não foram verificados.

**Continuidade:** por instrução explícita do usuário, o trabalho pode prosseguir para a Fase 03 mesmo com G01/G02 parciais e sem subir aplicação. Isso é uma exceção consciente ao fluxo original de gates, não uma declaração de que os gates passaram. Nenhuma validação visual ou de testes será alegada sem execução posterior.
