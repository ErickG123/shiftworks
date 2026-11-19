# AUDIT-CNT-00 — Auditoria de Conteúdo, Integrações Reais e Lacunas (Conteúdo 2.0)

> **Data:** 2026-11-18  
> **Prompt:** `CNT-00` (`shiftworks-content-progression-prompts/prompts/00-auditoria-conteudo-e-integracoes.md`)  
> **Fontes lidas:** `AGENTS.md`, `.agents/rules/*`, `docs/design/GDD.md`, `docs/reports/REPORT-EXP-23-documentacao-release-e-consolidacao.md`, `shiftworks-content-progression-prompts/docs/00..05`, `src/game/**`.

---

## 1. Matriz Real: 8 Equipamentos Alvo × Camadas de Integração

> Distinção estrita entre **Contrato/Modelo**, **Motor Ativo (`simulation-engine.ts`)**, **Construção/Editor**, **Render 3D (`component-view.ts`)**, **Preview 3D (`equipment-preview-card.ts`)**, **Tutorial**, **Fases Jogáveis** e **E2E Real**.

| Equipamento | Contrato / Modelo | Motor Ativo (`step()`) | Editor / Toolbar | Render Three.js | Preview 3D | Tutorial | Fases Jogáveis | E2E Real | Status Global |
|---|---|---|---|---|---|---|---|---|---|
| **CONVEYOR** | `component.model.ts` | Sim (`simulation-engine.ts`) | Sim (`[data-tool="CONVEYOR"]`) | Sim (`component-view.ts`) | Sim (`equipment-preview-card.ts`) | Sim (`T00`) | `L01–L03`, `SANDBOX` | Sim (`keyboard-ux`, `l03-victory`, `expansion-features`) | **COMPLETO** |
| **PROCESSOR** | `component.model.ts` | Sim (`CUT`/`PRESS`, shift 2t + proc 3t) | Sim (`[data-tool="PROCESSOR"]`) | Sim (`component-view.ts`) | Sim (`equipment-preview-card.ts`) | Parcial (texto em `L02`) | `L02–L03`, `SANDBOX` | Sim (`l03-victory`) | **COMPLETO** |
| **DIVERTER** | `component.model.ts` | Sim (rotas `A`/`B`) | Sim (`[data-tool="DIVERTER"]`) | Sim (`component-view.ts`) | Sim (`equipment-preview-card.ts`) | Parcial (texto em `L03`) | `L03`, `SANDBOX` | Sim (`l03-victory`) | **COMPLETO** |
| **BUFFER** | `advanced-systems.model.ts` (`FifoBufferState`) | **NÃO** (apenas helper puro isolado) | **NÃO** | **NÃO** | **NÃO** | **NÃO** | Nenhuma (`L05` planejada) | **NÃO** | **SOMENTE CONTRATO/UNIT** |
| **SENSOR** | `advanced-systems.model.ts` (`SensorRule`) | **NÃO** (apenas helper puro isolado) | **NÃO** | **NÃO** | **NÃO** | **NÃO** | Nenhuma (`L09` planejada) | **NÃO** | **SOMENTE CONTRATO/UNIT** |
| **SPLITTER** | **NÃO** | **NÃO** | **NÃO** | **NÃO** | **NÃO** | **NÃO** | Nenhuma (`L10` planejada) | **NÃO** | **AUSENTE** |
| **MERGER** | **NÃO** | **NÃO** | **NÃO** | **NÃO** | **NÃO** | **NÃO** | Nenhuma (`L11` planejada) | **NÃO** | **AUSENTE** |
| **ASSEMBLER** | **NÃO** | **NÃO** | **NÃO** | **NÃO** | **NÃO** | **NÃO** | Nenhuma (`L14` planejada) | **NÃO** | **AUSENTE** |

*(Entidades fixas `SOURCE` e `OUTPUT` estão 100% integradas em domínio, motor, Three.js, preview 3D e E2E.)*

---

## 2. Matriz Real: 11 Itens e 7 Receitas Alvo

| Item / Receita | Estado Real no Código | Lacuna para Conteúdo 2.0 |
|---|---|---|
| `BLUE_BLANK`, `AMBER_BLANK`, `CUT_PLATE`, `PRESSED_BLOCK` | **COMPLETO** (`component.model.ts`, `simulation-engine.ts`, `item-view.ts`, `i18n`) | Nenhuma |
| `COPPER_BLANK`, `COPPER_STRIP`, `INSULATOR`, `CIRCUIT`, `FRAME`, `CONTROL_MODULE`, `AUTOMATION_UNIT` | **AUSENTE** (`advanced-systems.model.ts` tem apenas `REINFORCED_PANEL`/`MACHINED_CORE` como protótipo) | Unificar catálogo dos 11 itens e 7 receitas no domínio, motor (`step()`), `item-view.ts` e `i18n` (`CNT-08`, `CNT-09`). |

---

## 3. Matriz Real: 20 Fases em 5 Setores

| Setor | Fases | Estado Real |
|---|---|---|
| **Setor 01 — Fundamentos** | `L01`, `L02`, `L03` | **JOGÁVEL + FIXTURE + E2E** (`30`, `68`, `70` ciclos, 3★) |
| **Setor 01 — Fundamentos** | `L04` | **AUSENTE** (`CNT-12`) |
| **Setor 02 — Eficiência** | `L05–L08` | **AUSENTE** (`CNT-13`, depende de `BUFFER` em `CNT-04`) |
| **Setor 03 — Automação Inteligente** | `L09–L12` | **AUSENTE** (`CNT-14`, depende de `SENSOR`/`SPLITTER`/`MERGER` em `CNT-05..07`) |
| **Setor 04 — Produção Avançada** | `L13–L16` | **AUSENTE** (`CNT-15`, depende de 11 itens/receitas e `ASSEMBLER` em `CNT-08..09`) |
| **Setor 05 — SHIFT Master** | `L17–L20` | **AUSENTE** (`CNT-16`, depende de pedidos dinâmicos no motor) |

---

## 4. Plano Incremental e Go/No-Go

1. **P0 Imediato (`CNT-01 → CNT-02 → CNT-03 → CNT-11 → CNT-12`):** Consolidar contratos de Conteúdo 2.0, validador de schema/fixtures, plataforma de registro de equipamentos, progressão por setores/conquistas e publicar a **Fase L04** (*Linha Integrada*) fechando o Setor 01.
2. **P1 (`CNT-04 → CNT-10`, `CNT-13..15`, `CNT-17..18`, `CNT-20`):** Integrar `BUFFER`, `SENSOR`, `SPLITTER`, `MERGER`, catálogo de 11 itens + 7 receitas, `ASSEMBLER`, catálogo/previews 3D dos 8 equipamentos e fases `L05–L16` + seleção por setores.
3. **P2 (`CNT-16`, `CNT-19`):** Setor 05 (`L17–L20` com pedidos dinâmicos) e Sandbox com 8 equipamentos.
4. **QA e Release (`CNT-21`, `CNT-22`):** Executar ao fechar recorte jogável e novamente ao consolidar a campanha completa.
