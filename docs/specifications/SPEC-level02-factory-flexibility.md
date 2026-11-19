# SPEC — Level 02 Rebalancing & Factory Flexibility

> **Status:** IMPLEMENTED & VERIFIED  
> **Data:** 2026-11-18  
> **Requisitos associados:** `RF-007`, `RF-008`, `RF-013`, `RF-014`

---

## 1. Problema Identificado na Definição Anterior da L02

Na versão anterior de `src/game/domain/level-catalog.model.ts`, a Fase `L02` (*One Machine, Two Jobs*) possuía:
- `source-1` fixa em `(0, 3)` (`direction: 'E'`)
- `dock` fixo em `(2, 3)` (`direction: 'E'`)
- `inventory: { CONVEYOR: 0, PROCESSOR: 1, DIVERTER: 0 }`

Isso deixava apenas uma única célula `(1, 3)` entre a fonte e a doca, desabilitava completamente a ferramenta `Esteira` (`CONVEYOR: 0`) e impedia o jogador de construir e conectar a linha de produção com esteiras.

---

## 2. Nova Especificação da Fase L02

| Propriedade | Valor Especificado | Justificativa |
|---|---|---|
| `id` | `L02` | Identificador estável de campanha |
| `width × height` | `8 × 8` | Tabuleiro padrão |
| `source-1` (fixa) | `(0, 3)`, direção `E`, sequência `['BLUE_BLANK', 'AMBER_BLANK']`, `intervalTicks: 10` | Emite blocos azuis e âmbar alternadamente |
| `dock` (fixa) | `(5, 3)`, direção `E`, `acceptedTypes: ['CUT_PLATE', 'PRESSED_BLOCK']` | Espaçamento de 4 células livres `(1, 3)..(4, 3)` entre fonte e doca |
| `inventory` | `{ CONVEYOR: 10, PROCESSOR: 1, DIVERTER: 0 }` | Permite conectar o Processador com esteiras e testar diferentes posicionamentos |
| `goals` | `3 CUT_PLATE` em `dock` + `3 PRESSED_BLOCK` em `dock` | Valida a comutação automática `CUT ↔ PRESS` no mesmo Processador |
| `twoStarMaxTicks` | `76` | Margem calibrada sobre a solução de referência (`68` ciclos) |
| `threeStarMaxTicks` | `70` | Exige fluxo contínuo sem atrasos (`68 < 70`) |
| `threeStarMaxPieces` | `4` | `1 Processador + 3 Esteiras` |

---

## 3. Múltiplas Soluções Válidas Verificadas

Qualquer permutação na linha `y = 3` (`x ∈ {1, 2, 3, 4}`) contendo `1 PROCESSOR` (direção `E`, regras `BLUE_BLANK → CUT` e `AMBER_BLANK → PRESS`) e `3 CONVEYOR` (direção `E` nas demais posições entre `(1, 3)` e `(4, 3)`) completa os dois objetivos em **68 ciclos**, com **0 rejeições**, **5 trocas de modo (`SHIFT`)** e **3 estrelas**:

1. **Solução de Referência (`processorX = 1`):** `Processor(1,3)E → Conveyor(2,3)E → Conveyor(3,3)E → Conveyor(4,3)E`
2. **Solução Alternativa B (`processorX = 2`):** `Conveyor(1,3)E → Processor(2,3)E → Conveyor(3,3)E → Conveyor(4,3)E`
3. **Solução Alternativa C (`processorX = 3`):** `Conveyor(1,3)E → Conveyor(2,3)E → Processor(3,3)E → Conveyor(4,3)E`
4. **Solução Alternativa D (`processorX = 4`):** `Conveyor(1,3)E → Conveyor(2,3)E → Conveyor(3,3)E → Processor(4,3)E`

Todas as 4 soluções estão cobertas e verificadas automaticamente em `src/game/simulation/level-reference.test.ts`.
