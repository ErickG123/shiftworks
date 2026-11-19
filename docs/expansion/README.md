# SHIFTWORKS — Pacote SDD de expansão: 15 melhorias + tutorial/preview 3D + conquistas

**Finalidade:** conjunto de prompts de implementação para Codex; **não é o código final do jogo**. Baseado no GDD v0.1 e nas funcionalidades relatadas (Three.js, Vite/TypeScript, campanha L01–L03, T00/T01, i18n PT-BR/EN, simulação determinística). A implementação real deve ser auditada.

## Como instalar e executar

1. Extraia a pasta **`shiftworks-expansion-prompts/`** na raiz do repositório do SHIFTWORKS, sem sobrescrever `AGENTS.md`, `.agents/`, `docs/` ou código existente.
2. Leia `docs/00-PRINCIPIOS-E-REGRAS-EXECUCAO.md`, o `docs/01-MAPA-DE-REQUISITOS.md` e o `docs/05-MATRIZ-DE-TESTES-E-GATES.md` DENTRO deste pacote.
3. Execute `prompts/00-...md` no Codex, depois `01`, `02` etc. **Cada prompt exige leitura da implementação e relatório da fase anterior, testes e atualização SDD**. Não execute etapas dependentes em paralelo.
4. Use `EXECUTAR-ORQUESTRACAO.md` se estiver delegando uma sequência longa ao agente, mas exija gates e relatórios reais entre as fases.
5. Priorize correções P0 e estabilização da build antes de iniciar escopo P2. O prazo do evento não permite assumir que as 15 ideias cabem em uma única release; o pacote permite implementar tudo progressivamente e entregar por milestones.

## As 15 ideias abrangidas

| # | Melhoria | Prompt |
|---:|---|---|
| 1 | Construir esteiras por arrasto + Undo/Redo | 02 |
| 2 | Overlay de fluxo | 03 |
| 3 | Inspetor contextual | 04 |
| 4 | Sensores programáveis | 14 |
| 5 | Múltiplas receitas | 15 |
| 6 | Pedidos dinâmicos | 17 |
| 7 | Buffers intermediários | 16 |
| 8 | Passo a passo por tick | 05 |
| 9 | Diagnóstico de gargalos | 06 |
| 10 | Painel de eficiência | 07 |
| 11 | Campanha por setores | 12 |
| 12 | Desafios opcionais | 13 |
| 13 | Blueprints | 18 |
| 14 | Sandbox expandido | 19 |
| 15 | Desafios de eficiência | 20 |

## Melhorias extras solicitadas

- **Catálogo de equipamentos, descrições e tooltips em hover/foco:** 08.
- **Card flutuante com visualização Three.js do item em funcionamento:** 09.
- **Tutorial interativo T00/T01 e lições por máquina:** 10.
- **Sistema real de unlocks, níveis e conquistas persistentes:** 11.
- **Polimento do HUD/câmera/feedback/vitória e integração visual:** 21.
- **Auditoria, contratos, padronização `.agents/`, E2E, release:** 00, 01, 22, 23.

## Dependências e release

- **P0 imediatamente:** 00, 01, 02, 05, 08, 09, 10, 11; qualidade final 22/23 (realizar antes de uma release, ainda que outras fases estejam pendentes).
- **P1 melhoria da experiência:** 03, 04, 06, 07, 21.
- **P2/pós-jam:** 12–20. Construir apenas após P0 estável ou seguir como roadmap posterior. Todos prompts já estão prontos e aceites definidos.
- **Observação:** como os prompts são sequenciais e o 22 verifica a implementação existente, é permitido rodar gate 22/23 após um recorte P0, depois retomar P1/P2 e repetir 22/23 para a release seguinte.

## Conteúdo do pacote

- `prompts/` — 24 prompts numerados 00–23.
- `docs/00-...` — governança e execução.
- `docs/01-...` — rastreabilidade dos 15 itens e extras.
- `docs/02-...` — especificação UX do tooltip/card 3D.
- `docs/03-...` — progressão, equipamentos e conquistas.
- `docs/04-...` — semântica determinística para novos módulos.
- `docs/05-...` — matriz de testes, gates e casos de migração.
- `templates/` — modelo de relatório por fase.
- `references/` — GDD v0.1 **histórico**, não substituir GDD mais recente do repositório.
- `EXECUTAR-ORQUESTRACAO.md` — comando mestre para executar sequencialmente.

**IMPORTANTE:** este pacote é uma proposta de trabalho. Relatórios anteriores e código real da sua cópia local são a fonte final de verdade. Se um item já estiver implementado, auditar/testar e documentar; não reimplementar por hábito.
