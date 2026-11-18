# REPORT-PHASE-16 — Publicação e submissão Game Off

> Data/hora: 2026-11-18 14:19 BRT (17:19 UTC)  
> Status: BLOCKED  
> Gate: G16 — BLOCKED  
> Commit: não criado; branch `main` sem commits e sem remote  
> Requisitos: RF-019, RNF-004, RNF-006, RNF-011, RNF-012, SPEC-008

## 1. Baseline verificada

- Seguidas as leituras mandatórias de `AGENTS.md`, regras e skills locais, GDD, visão, requisitos, roadmap, arquitetura, contratos, semântica, ADRs, SPEC-008, rastreabilidade, plano de testes, checklist de release e relatório da Fase 15.
- G15 está PARTIAL e o trabalho de publicação não estava materializado: ainda não existe repositório remoto, branch `main` sem commits, sem URL pública ou evidência de upload/submissão. O diretório de trabalho contém os arquivos do projeto como não rastreados.
- `gh auth status` foi consultado: tokens salvos do GitHub estão inválidos e requerem reautenticação. A CLI `butler` do itch.io não está instalada; não existe sessão autenticada de publicação disponível nesta execução.
- O usuário instruiu que o trabalho continue sem iniciar a aplicação. A validação foi feita por scripts automatizados; nenhuma janela de browser ou screenshot foi produzida.
- Regras oficiais reconsultadas em 2026-11-18: a janela de envio fecha em 2026-12-01 21:37 UTC (13:37 PST); a jam exige repositório público no GitHub e submissão separada via itch.io; uso de IA é permitido e precisa ser declarado no envio. Fontes: [página oficial](https://itch.io/jam/game-off-2026) e [FAQ do host](https://itch.io/jam/game-off-2026/topic/7290154/frequently-asked-questions-faq).

## 2. Plano executado

- Revalidar lint, tipos, unit tests, build, fixtures e execução Playwright.
- Não criar commit/tag nem simular publicação: não há remote, URL, confirmação ou sessão de publicação disponível.
- Atualizar SPEC, requisitos, rastreabilidade, backlog, checklist e este relatório com o resultado observado; renovar os hashes dos 68 arquivos documentais listados no manifesto.

Arquivos alterados nesta fase: `docs/specifications/SPEC-008.md`, `docs/requirements/REQUIREMENTS.md`, `docs/qa/TRACEABILITY.md`, `docs/roadmap/BACKLOG.md`, `docs/release/RELEASE-CHECKLIST.md`, `MANIFEST.json`; novo `docs/reports/REPORT-PHASE-16-release.md`. Nenhum código-fonte mudou nesta fase.

## 3. Evidências técnicas

| Comando/teste | Executado? | Resultado real | Observações |
|---|---:|---|---|
| `npm run lint` | Sim | PASS | Exit code 0. |
| `npm run typecheck` | Sim | PASS | `tsc --noEmit`, exit code 0. |
| `npm test` | Sim | PASS | 21 arquivos, 86 testes aprovados; execução ~46 s. |
| `npm run build` | Sim | PASS | Vite 8.3.8; HTML/CSS/JS gerados. JS minificado 606.54 kB, aviso informativo acima de 500 kB. |
| `npm run test:fixtures` | Sim | PASS | L01: RESULT/30 ticks/6 peças/3 emitidos/0 rejeições/3 estrelas; L02: RESULT/65/1/6/0/3; L03: RESULT/70/6/6/0/3. |
| `npm run manifest:update` | Sim | PASS | Renovados tamanhos/SHA-256 das 68 entradas declaradas no manifesto. |
| `npm run test:e2e -- --workers=1 --reporter=list` | Sim | BLOCKED | Playwright listou 7 testes, mas `spawn EPERM` impediu criar o worker antes de executar qualquer caso. |
| Browser visual, URL pública, itch iframe | Não | NOT_RUN | Não foi iniciada a aplicação; sem URL pública e sem captura real. |
| GitHub public push / itch upload / submissão da jam | Não | BLOCKED | Repositório remoto ainda não existe; `gh auth status` informa tokens GitHub inválidos; `butler` não está instalado. Não há confirmação externa para registrar. |

## 4. Critérios de aceite

| Critério | Status | Evidência |
|---|---|---|
| Regras/prazo oficiais conferidos | PASS documental | Página oficial e FAQ consultados em 2026-11-18; URLs acima. |
| Build HTML5 reproduzível e checks locais | PASS parcial | Lint, typecheck, 86 unit tests, build e fixtures passaram. |
| Repositório de código público no GitHub | NOT_RUN | Remote ainda não criado; tokens GitHub inválidos e branch sem commits. |
| Upload público HTML5 e player validado | NOT_RUN | Nenhuma URL pública, upload ou validação de iframe. |
| Screenshots reais e jornada completa no browser | NOT_RUN | Não há screenshots; execução E2E bloqueada antes dos casos. |
| Submissão à página do Game Off confirmada | NOT_RUN | Não submetida; código no GitHub, por si só, não substitui a submissão itch.io. |
| G16 | BLOCKED | Falta URL pública jogável e confirmação da submissão — ambos exigidos pelo gate. |

## 5. Problemas, dúvidas e riscos

- **F16-001 — BLOCKER — publicação externa ausente.** Repositório GitHub ainda não existe; `gh auth status` reporta tokens salvos inválidos. Também não há página/upload itch.io nem CLI `butler`. Consequência: não existe produto acessível publicamente. Ação: reautenticar GitHub, criar remote público, publicar o código e então criar página/upload HTML5, ativar o player e registrar as URLs reais.
- **F16-002 — BLOCKER — submissão da jam ausente.** A página do jogo precisa ser submetida separadamente na jam. Consequência: não há participação confirmada. Ação: concluir o fluxo de submissão itch.io e guardar a tela/URL e horário com fuso.
- **F16-003 — HIGH — E2E/browser não executa neste ambiente.** Reprodução: `npm run test:e2e -- --workers=1 --reporter=list`; falha `spawn EPERM` no runner antes dos testes. Consequência: controles, layout, áudio e uma fase não foram verificados no navegador. Ação: repetir em ambiente com permissão de spawn/browser e validar também o player público.
- **F16-004 — MEDIUM — bundle JS 606.54 kB.** Build passa, mas Vite avisa que excede 500 kB. Avaliar divisão de chunks se houver risco de carregamento; não é o bloqueio atual de G16.

## 6. Mudanças documentais

- SPEC-008 agora registra G16 BLOCKED junto dos gates parciais anteriores.
- Requisitos e traceability registram que publicação e submissão não foram demonstradas; nenhum requisito foi marcado VERIFIED.
- Checklist e backlog contêm as pendências concretas e a separação entre push GitHub e submissão da jam.

## 7. Decisão do gate

**G16: BLOCKED.** As verificações locais passaram, mas não há publicação externa, player jogável, browser E2E, screenshots nem confirmação da jam. O próximo passo é desbloquear F16-001/F16-002 e executar F16-003; só então registrar URL, commit, screenshots reais, confirmação e tag. Não declarar o release concluído nem avançar para o prompt 17.

Comandos repetíveis no ambiente com browser: `npm run test:e2e -- --workers=1 --reporter=list`, depois abrir a URL pública em janela independente e completar uma fase no player itch.io. A submissão deve ser feita pela página Game Off 2026 até o prazo oficial vigente, reconferido no próprio envio.
