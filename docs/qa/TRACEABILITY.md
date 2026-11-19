# QA-002 — Matriz de rastreabilidade

**Estado inicial:** `PLANNED` para todos os itens. Atualizar somente após evidência.  
**Links de teste:** IDs referem-se a `TEST-PLAN.md`, não a testes implementados.

| Requirement | Specification | Testes planejados | Gate | Status |
|---|---|---|---|---|
| RF-001/002/003 | SPEC-001 | TC-001–005, TC-027, TC-029–035 (`editor-reducer.test.ts`, `ports.model.test.ts`) | G02/G03 | PLANNED |
| RF-004 | SPEC-002 | TC-006, TC-036, TC-038/039 (`simulation-engine.test.ts`, `transfer-resolver.test.ts`) | G04 | PLANNED |
| RF-011 | SPEC-002/005 | TC-021, TC-022, TC-037 (`simulation-engine.test.ts`) | G04/G08 | PLANNED |
| RF-004/005/006 | SPEC-002 | TC-005–010, TC-028, TC-036–039, TC-041 (`simulation-engine.test.ts`, `transfer-resolver.test.ts`, `item-projection.test.ts`, `l03-reference.test.ts`) | G04/G05/G08 | PLANNED |
| RF-007/008/009 | SPEC-003 | TC-011–018 (`simulation/processor.test.ts`, `simulation/routing-output.test.ts`, `simulation/simulation-engine.test.ts`, `editor/editor-reducer.test.ts`, `domain/layout-validator.test.ts`, `domain/ports.model.test.ts`) | G06/G07 | PLANNED |
| RF-010/011/012 | SPEC-002/004/005 | TC-019–022, TC-025, E2E-002 (`l03-reference.test.ts`, `e2e/l03-victory.spec.ts`) | G08 | PLANNED |
| RF-013/014 | SPEC-004 | TC-023-025 (`level-reference.test.ts`), progression (`level-progression.test.ts`), E2E-001 (`e2e/l03-victory.spec.ts`) | G09 | PLANNED |
| RF-015 | SPEC-006 | TC-042 (`interpolation.test.ts`), `sound-effects.test.ts`, E2E-009 (`e2e/visual-audio.spec.ts`), manual visual | G12 | PLANNED |
| RF-016 | SPEC-005/006 | E2E-004 (`e2e/responsive-ux.spec.ts`), E2E-005 (`e2e/keyboard-ux.spec.ts`), manual acessibilidade | G11 | PLANNED |
| RF-017/018/020 | SPEC-007 | TC-026 (`storage-adapter.test.ts`, `sandbox.test.ts`, `editor-reducer.test.ts`), E2E-006 (`e2e/sandbox.spec.ts`) | G10 | PLANNED |
| RF-019 | SPEC-008 | E2E-007/008, `docs/release/RELEASE-CHECKLIST.md`, `docs/release/ITCHIO-SUBMISSION.md` | G15/G16 | PLANNED |
| RF-021 | SPEC-009 | planejamento pós-jam | POST | PLANNED |
| RNF-001/002/005/013 | SPEC-002/003 | TC-006–020, TC-036–040 (`simulation-engine.test.ts`, `transfer-resolver.test.ts`, `layout-validator.test.ts`) | G04–G08 | PLANNED |
| RNF-003/004 | SPEC-000/008 | TC-000, lint/typecheck/test/build CI | G01/G13 | PLANNED |
| RNF-006/007/008/009 | SPEC-005/006 | E2E-004/005 (`e2e/responsive-ux.spec.ts`, `e2e/keyboard-ux.spec.ts`), E2E-009 (`e2e/visual-audio.spec.ts`), perf manual | G11/G12 | PLANNED |
| RNF-010 | SPEC-007 | TC-026 (`storage-adapter.test.ts`), E2E-006 (`e2e/sandbox.spec.ts`) | G10 | PLANNED |
| RNF-011/012/014 | SPEC-008 | legal/docs/itchio, diagnóstico | G15/G16 | PLANNED |

### Evidência de release (Fase 16, 2026-11-18)

- RF-019 e RNF-012 continuam PLANNED/BLOCKED: nenhum commit/remote público, upload, URL pública ou confirmação de submissão existe. O gate G16 exige evidência externa, registrada como pendência em `docs/reports/REPORT-PHASE-16-release.md`.
- Build, lint, typecheck, 86 testes unitários e fixtures passaram. E2E não iniciou casos por erro do ambiente Playwright (`spawn EPERM`); portanto RNF-011/RNF-014 não são promovidos a VERIFIED.

### Evidência de estabilização integrada (2026-11-18)

- `RF-001/002/003`, `RF-004/005/006`, `RF-007/008/009`, `RF-010/011/012`, `RF-013/014`, `RF-015`, `RF-016`, `RF-017/018` e `RNF-001..010`, `RNF-013` verificados por `111` testes unitários/integrados (`26` arquivos Vitest, incluindo `camera-controller.test.ts`, `editor-interaction.test.ts`, `keyboard-shortcuts.test.ts`, `level-reference.test.ts`, `i18n.service.test.ts`) e `11` cenários E2E Playwright reais (`e2e/keyboard-ux.spec.ts`, `e2e/l03-victory.spec.ts`, `e2e/responsive-ux.spec.ts`, `e2e/sandbox.spec.ts`, `e2e/visual-audio.spec.ts`). Ver `docs/reports/REPORT-gameplay-controls-camera-level02-victory.md`.

## Processo de atualização

1. Ao criar teste, acrescentar caminho do arquivo real e commit na linha correspondente.
2. Ao executar, registrar resultado, versão, data e evidência em REPORT-PHASE.
3. Só trocar `PLANNED` por `VERIFIED` quando requisito, teste e gate forem demonstrados.
4. Qualquer teste que falhe reabre a linha e a decisão correspondente.
