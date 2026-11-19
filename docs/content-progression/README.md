# SHIFTWORKS — Conteúdo e Progressão 2.0 (pacote SDD)

**23 prompts CNT-00..CNT-22** para implementar a ampliação da campanha para **20 níveis em cinco setores**, com **oito equipamentos construíveis**, **11 tipos de itens**, sete receitas e melhor integração de progressão, tutoriais, previews 3D, achievement, performance e Sandbox.

Este pacote **não implementa o jogo sozinho**: são instruções para um agente Codex com acesso ao repositório. Construído a partir das capturas e do relatório que o usuário apresentou ao final da expansão EXP-00..EXP-23, e do GDD original (referência histórica). O estado do repositório deve ser conferido antes de alterações.

## Instalação

1. Extrair a pasta `shiftworks-content-progression-prompts/` **dentro** da raiz do repo SHIFTWORKS. Não sobrescrever `AGENTS.md`, `.agents/`, `src/`, `docs/` ou scripts existentes.
2. Abrir `EXECUTAR-ORQUESTRACAO.md` e enviar seu conteúdo ao Codex no repositório local.
3. Rodar primeiro `prompts/00-auditoria-conteudo-e-integracoes.md`; depois avançar na ordem conforme os gates, sem saltar dependências.
4. Usar os documentos em `docs/` como **especificações propostas** e conciliar com GDD, SPECs e ADRs do projeto, registrando a decisão.
5. Cada fase precisa de relatório em `docs/reports/REPORT-CNT-XX-*.md` e critérios executados antes da próxima.

## Sequência e roadmap

| Prompt | Objetivo | Prioridade |
|---|---|---|
| CNT-00 | Auditoria da campanha e integrações existentes | P0 |
| CNT-01 | Especificações, ADRs e contratos de Conteúdo 2.0 | P0 |
| CNT-02 | Schema de níveis, validador e fixtures executáveis | P0 |
| CNT-03 | Plataforma única de equipamentos para editor, motor e Three.js | P0 |
| CNT-04 | Buffer FIFO integrado ao gameplay | P1 |
| CNT-05 | Sensor programável, sinais e regras | P1 |
| CNT-06 | Splitter: distribuição previsível de itens | P1 |
| CNT-07 | Merger: confluência, justiça e bloqueios | P1 |
| CNT-08 | Catálogo de 11 itens e grafo de receitas | P1 |
| CNT-09 | Assembler: fabricação com duas entradas | P1 |
| CNT-10 | Catálogo, desbloqueios visuais e previews 3D dos oito itens | P1 |
| CNT-11 | Progressão por setores, conquistas e avaliação versionada | P0 |
| CNT-12 | L04: linha integrada e fechamento do Setor 01 | P0 |
| CNT-13 | Setor 02: quatro fases de eficiência e buffer | P1 |
| CNT-14 | Setor 03: sensores, splitter, merger e regras | P1 |
| CNT-15 | Setor 04: cobre, montagem e receitas encadeadas | P1 |
| CNT-16 | Setor 05: SHIFT Master e demandas dinâmicas | P2 |
| CNT-17 | Seleção de 20 níveis e navegação por setores | P1 |
| CNT-18 | Tutoriais por mecânica com validação real | P1 |
| CNT-19 | Sandbox com oito equipamentos e receitas completas | P2 |
| CNT-20 | Balanceamento real, diversidade e experiência de jogo | P1 |
| CNT-21 | Gate final de QA, regressão, performance e acessibilidade | P0 |
| CNT-22 | Consolidação SDD, release e roteiro de publicação | P0 |

## Cortes de release

**Para a game jam**: proteger a publicação do jogo atual e buscar 8–10 níveis verdadeiramente jogáveis antes de prometer todos os vinte. Não há necessidade de começar 20 fases e deixar todas sem equilíbrio. **Pós-jam**: concluir até L20, conteúdos de automação avançada e Sandbox expandido. Pode executar QA CNT-21 e Release CNT-22 no corte reduzido, retomar o restante e repeti-los.

## Estrutura

- `prompts/`: 23 prompts detalhados para execução por etapas.
- `docs/`: campanha, catálogo, receitas, progressão, arquitetura, qualidade e governança.
- `templates/`: relatório de fase.
- `EXECUTAR-ORQUESTRACAO.md`: orquestrador para o Codex.
- `MANIFEST.json`: hashes/arquivos do pacote.

## Convenções de integração

- Preservar IDs L01–L03, T00/T01, achievements e progresso salvo.
- PT-BR padrão, inglês opção secundária, IDs internos sem tradução.
- Vite + TypeScript + Three.js, sem backend e sem alterar o motor determinístico.
- Atualizar `.agents/` e docs sem criar regras duplicadas.
- Conclusão exige jogabilidade e evidência, não apenas types/modelos e testes isolados.
