# REPORT-PHASE-15 — Release candidate audit

> Data/hora: 2026-11-18 14:11 BRT  
> Status: PARTIAL  
> Gate: G15 — PARTIAL  
> Commit: não criado; branch `main` sem commits e arquivos do projeto não rastreados no worktree  
> Requisitos: RF-019, RNF-004, RNF-006, RNF-011, RNF-012, SPEC-008

## 1. Baseline verificada

- Foram relidos `AGENTS.md`, regras, GDD, visão, requisitos, roadmap, arquitetura, contratos/semântica, SPEC-008, traceability, relatório da Fase 14, README e checklist de release.
- G14 está PARTIAL: as duas sessões humanas estão NOT_RUN e Playwright continua falhando antes dos casos. Conforme orientação do usuário, a auditoria RC prosseguiu sem marcar gates anteriores como PASS.
- `npm ci` na raiz falhou duas vezes ao tentar remover o binário nativo do Rolldown (`EPERM: unlink ...rolldown-binding.win32-x64-msvc.node`), ainda aberto por outro processo. O npm estava offline; o cache local do projeto foi usado para restauração.
- A página oficial confirma tema SHIFT, repositório público GitHub, submissão separada via itch.io até 1 de dezembro de 2026 às 13:37 PST e declaração de uso de IA. O Game Off aceita qualquer linguagem/ferramenta e assets licenciados.
- A busca de assets externos não encontrou imagens, fontes, modelos ou arquivos de áudio. Geometria e sons estão gerados por código.

## 2. Plano executado

- Preparado freeze de features: após este RC, aceitar apenas correções de bloqueadores e documentação/testes associados; persistência de layout Sandbox segue P2 deferida.
- README atualizado com controles reais (Remove tool em vez de right-click), scripts de qualidade, procedência procedural e declaração de assistência IA em código/documentação.
- Rascunho de itch.io corrigido e atualizado com data/regra oficial, disclosure de IA e controles que correspondem ao produto.
- Criados `npm run audit:licenses` (metadados do lockfile, instalações requeridas) e `npm run manifest:update` (atualiza tamanhos/SHA-256 dos 68 arquivos registrados no manifesto fornecido). Manifesto atualizado para o caminho real do GDD.
- Checklist de RC documenta as verificações realizadas e pendências sem marcar publicação/compatibilidade como concluídas.
- Arquivos adicionados: `scripts/audit-licenses.mjs`, `scripts/update-manifest.mjs`, este relatório.
- Arquivos alterados: `package.json`, `README.md`, `MANIFEST.json`, `docs/release/ITCHIO-SUBMISSION.md`, `docs/release/RELEASE-CHECKLIST.md`, `docs/specifications/SPEC-008.md`, `docs/requirements/REQUIREMENTS.md`, `docs/qa/TRACEABILITY.md`, `docs/roadmap/BACKLOG.md`.

## 3. Evidências técnicas

| Comando/teste | Executado? | Resultado real | Observações |
|---|---:|---|---|
| `npm ci --cache .npm-cache --offline` na raiz | Sim | BLOCKED | Falhou ao remover o binário native Rolldown em uso com `EPERM`. A tentativa foi repetida após os testes e teve o mesmo resultado. |
| `npm ci --ignore-scripts --cache .npm-cache --offline` em cópia isolada de manifests | Sim | PASS | Instalou 201 pacotes com o lockfile; lifecycle hooks foram ignorados para não executar o `prepare` Husky dentro da cópia temporária. `npm ls --depth=0` listou as ferramentas e Three.js; pasta temporária removida. |
| `npm install --cache .npm-cache --offline --ignore-scripts` na raiz | Sim | PASS | Restaurou a instalação de desenvolvimento após a falha do `npm ci`; reportou 0 vulnerabilidades. |
| `npm run lint` | Sim | PASS | Exit code 0 na validação final. |
| `npm run typecheck` | Sim | PASS | Exit code 0 na validação final. |
| `npm test` | Sim | PASS | 21 arquivos, 86 testes aprovados. |
| `npm run test:fixtures` | Sim | PASS | L01: RESULT, 30 ticks, 6 peças, 3 emitidos, 0 rejeições, 3 estrelas; L02: 65, 1, 6, 0, 3; L03: 70, 6, 6, 0, 3. |
| `npm run build` | Sim | PASS | JS minificado 606.54 kB; warning Vite para chunk >500 kB. |
| `npm run audit:licenses` | Sim | PASS | 233 entradas com metadados: MIT 172, MIT-0 2, Apache-2.0 21, BlueOak-1.0.0 3, Python-2.0 1, BSD-2-Clause 9, BSD-3-Clause 3, ISC 8, MPL-2.0 12, CC0-1.0 1, 0BSD 1; nenhuma licença ausente, instalações obrigatórias presentes. Pacotes opcionais de outras plataformas não precisam estar instalados. |
| `npm audit --offline` | Sim | PASS | 0 vulnerabilidades conhecidas no snapshot local; resultado limitado à base/cache disponível offline. |
| `npm run manifest:update` | Sim | PASS | Atualizou hashes/tamanhos de 68 entradas documentais. |
| `npx playwright test --list` | Sim | PASS | Descobriu 7 casos em 5 arquivos; sem executar browser. |
| `npm run test:e2e -- --workers=1 --reporter=list` | Sim | BLOCKED | `spawn EPERM` ao criar worker antes de qualquer teste. |
| Vite Preview, port 3002, HTML/JS estáticos | Sim | PASS | GET `/` e `/assets/index-BBVi75bM.js` retornaram HTTP 200; preview encerrado após smoke. |
| Screenshots, janela anônima, 1280×720/1920×1080 e itch iframe | Não | NOT_RUN | Playwright não inicia. O runtime `node_repl/@oai/sky` da skill `computer-use` não está habilitado nesta sessão. |
| Upload itch.io, página pública, tag/release | Não | NOT_RUN | Nenhuma conta/página/remote público foi configurado ou alterado; nenhuma submissão foi feita. |

## 4. Critérios de aceite

| Critério | Status | Evidência |
|---|---|---|
| Checklist RC com evidências e pendências | PASS | `docs/release/RELEASE-CHECKLIST.md` registra o estado real de G08/G13/G14/G15. |
| Build reproduzida fora do dev server | PASS parcial | `npm run build` e Vite Preview entregam HTML/JS 200; interação visual do jogo não foi testada. |
| Inventário de assets/licenças e disclosure | PASS documental | Nenhum asset externo local; 233 licenças registradas; README e texto-base declaram IA. Reconfirmar o formulário do itch no envio. |
| Compatibilidade de browser/itch, sem blocker | NOT_RUN | E2E/screenshots/iframe não acessíveis; portanto não se afirma ausência de blocker. |
| 3–5 screenshots reais | NOT_RUN | Nenhuma imagem de browser gerada. |
| Freeze de features | PASS documental | Registrado no checklist; somente correções de blocker após RC. |
| G15 | PARTIAL | Ver decisão abaixo. |

## 5. Problemas, dívidas e riscos

- **F15-001 — BLOCKER para G15 — `npm ci` na raiz não consegue limpar o binário native em uso.** Reprodução: `npm ci --cache .npm-cache --offline`. A tentativa isolada do lockfile passou, mas a instalação do worktree ainda depende de um processo externo liberar o arquivo. Ação: encerrar/controlar esse processo no ambiente do usuário e repetir `npm ci` na raiz.
- **F15-002 — BLOCKER para release — Browser E2E e screenshots indisponíveis.** Reprodução: `npm run test:e2e -- --workers=1 --reporter=list` resulta em `spawn EPERM`. Consequência: não há evidência de screenshots, janela anônima, layout responsivo, áudio/browser ou iframe. Ação: executar em ambiente Playwright/browser funcional e revisar imagens/console.
- **F15-003 — HIGH — Não existe repositório remoto público nem página itch.io testada.** O tree está na branch `main` sem commits; a submissão exige publicar fonte e enviar a página de jogo separadamente. Ação: após gates e screenshots, preparar remote/upload e validar preview do iframe com autorização da conta.
- **F15-004 — MEDIUM — Bundle de 606.54 kB.** Build passa, mas excede advisory de 500 kB; medir antes de decidir code splitting.
- Nenhuma tag, upload ou submissão foi criado.

## 6. Mudanças documentais

- Checklist de release recebeu status RC, freeze, resultados dos audits, regras atuais e pendências.
- README e rascunho de itch alinham controles e disclosure de IA ao código.
- SPEC-008 indica G13/G15 parcial; requisitos e traceability mantêm RF-019/RNF-011/RNF-012 sem VERIFIED; BACKLOG lista bloqueios.
- Manifesto documental teve hashes renovados e `source_gdd` corrigido para `docs/design/GDD.md`.
- A página do host e o FAQ do Game Off 2026 foram consultados em 2026-11-18: [página oficial do jam](https://itch.io/jam/game-off-2026), [FAQ do host](https://itch.io/jam/game-off-2026/topic/7290154/frequently-asked-questions-faq), [anúncio no GitHub Blog](https://github.blog/open-source/gaming/game-off-2026-the-theme-is-shift/).

## 7. Decisão do gate

**G15: PARTIAL.** Os checks locais, fixtures, auditoria de licenças, `npm audit --offline`, build e smoke de preview passaram. Instalação limpa na raiz permanece bloqueada pelo arquivo Rolldown em uso (embora o lockfile tenha instalado numa cópia isolada), Playwright não executa, screenshots e itch iframe faltam. Não há evidência suficiente para liberar upload/tag ou declarar compatibilidade. Conforme a instrução do usuário para continuar as fases, a Fase 16 pode prosseguir documentalmente mantendo G15 PARTIAL, sem criar publicação fictícia.
