# REL-001 — Checklist de release (executar, não presumir)

## Auditoria do candidato (2026-11-18)

### Atualização — Fase 16 (2026-11-18 14:17 BRT)

- Validações repetidas: lint, typecheck, 86 testes unitários, build e fixtures passaram; bundle JS 606.54 kB (aviso acima de 500 kB). E2E tentou 7 casos, mas falhou antes do primeiro por `spawn EPERM`.
- O repositório remoto ainda não foi criado; branch `main` sem commits. `gh auth status` reportou tokens GitHub inválidos, e a CLI `butler` do itch.io não está instalada. Nenhuma URL pública, upload ou confirmação de submissão está disponível.
- Gate G16 BLOCKED. Para desbloquear: publicar o código em repositório GitHub público; fazer upload do ZIP HTML5 em página itch.io pública e validar o player; anexar screenshots reais; enviar a página à jam (ação separada); registrar URLs e confirmação. Não criar tag antes dos gates e de um commit aprovado.
- O prazo oficial aparece como 1º de dezembro de 2026 às 13:37 PST na [página da jam](https://itch.io/jam/game-off-2026) e no [FAQ do host](https://itch.io/jam/game-off-2026/topic/7290154/frequently-asked-questions-faq). Reconfirmar no envio.

- G08/G13/G14 não estão PASS; o candidato não está liberado para publicar.
- `npm ci` falhou no worktree porque o binário nativo do Rolldown está aberto por outro processo (`EPERM`). A instalação por lockfile passou em diretório isolado com `npm ci --ignore-scripts --cache .npm-cache --offline` (201 pacotes), sem rodar lifecycle hooks.
- Lint, typecheck, 86 unit tests, build, fixtures e smoke local do `dist/` foram executados em fases 13/14. Playwright, screenshots e itch iframe seguem NOT_RUN.
- `npm run audit:licenses` revisou 233 pacotes do lockfile; todos têm metadado de licença, instalações requeridas existem. `npm audit --offline` encontrou 0 vulnerabilidades conhecidas no snapshot local.
- Sem arte/fontes/modelos/áudio de terceiros; geometria e efeitos de áudio são gerados pelo código. Uso de assistência IA em código/documentação está descrito no README e no rascunho de submissão.
- Regras oficiais conferidas em 2026-11-18: [página Game Off 2026](https://itch.io/jam/game-off-2026) e [FAQ do host](https://itch.io/jam/game-off-2026/topic/7290154/frequently-asked-questions-faq). Conferir novamente perto do envio.
- 0 screenshots reais disponíveis. Nenhum upload, tag, página pública ou submissão foi criado.
- Congelamento: não adicionar features P1/P2 depois deste RC; somente corrigir bloqueadores de release e atualizar testes/documentação.

## Congelamento de funcionalidades

- [ ] G08 vertical slice PASS; G13 QA PASS ou escopo reduzido explicitamente.
- [ ] Sem bugs P0 ou regressões críticas conhecidas.
- [ ] Apenas conteúdo preparado para release; nenhum mock de menu ou "em breve" bloqueando gameplay.

## Qualidade e estabilidade

- [ ] `npm ci` reproduz instalação.
- [ ] Lint, typecheck, tests, build e smoke `dist/` PASS.
- [ ] Eventos não duplicam itens sob congestionamento.
- [ ] Fases publicadas têm soluções de referência vencedoras.
- [ ] Lógica não varia com FPS e Pause/Edit/Reset não deixam timers pendentes.
- [ ] 1280×720, 1920×1080 e Chrome/Edge verificados (Firefox desejável).
- [ ] Graceful fallback para WebGL indisponível.

## UX

- [ ] Controles explicados no menu/itch.io.
- [ ] Feedback visual de SHIFT e regras corretas.
- [ ] Sem texto cortado, áreas de clique invisíveis ou rolagem invertida.
- [ ] Pausa, reset, mute e fechamento de modal funcionam.
- [ ] Indicadores não dependem apenas de cor; menus navegáveis por teclado.

## Conteúdo, licenças e segurança

- [ ] Ícones, sons, assets, fontes e dependências com origem e licença registradas.
- [ ] Sem conteúdo não licenciado ou material sujeito a copyright indevido.
- [ ] Uso de assistentes de IA declarado conforme regras do Game Off vigentes.
- [ ] Sem tokens/credenciais, coleta desnecessária de dados ou bibliotecas suspeitas.

## Distribuição

- [ ] README com versão, descrição SHIFT, stack, install/build, controles e licença.
- [ ] Título/slug conferidos para evitar marca conflitante.
- [ ] Build carregado em itch.io como HTML5, rodando sem backend.
- [ ] Frame/viewport, fullscreen quando permitido, teclado e áudio testados no **iframe público**.
- [ ] 3 capturas reais e descrição do jogo.
- [ ] Repositório GitHub público, documentação e commits adequados.
- [ ] Regras, limite e fuso do evento reconfirmados com página oficial.
- [ ] Página pública e submissão verificadas, URL e timestamp em relatório.
- [ ] Tag `vX.Y.Z` somente depois de commit aprovado.

**Gate G16:** não pode ser PASS sem confirmação pública de submissão e jogo executável.
