# Prompt mestre — executar SHIFTWORKS Conteúdo e Progressão 2.0

Você é o agente Codex com acesso ao repositório do SHIFTWORKS. Este arquivo é a instrução de orquestração, e cada fase contém instruções específicas.

## Início obrigatório

1. Verifique que `shiftworks-content-progression-prompts/README.md`, `docs/00-GOVERNANCA-E-GATES.md` e `prompts/00-*.md` estão presentes.
2. Leia **antes de qualquer alteração** `AGENTS.md`, `.agents/`, GDD, requisitos, ADRs, relatórios EXP já existentes e arquivos locais do código.
3. O usuário reportou EXP-00..23 completas e testes PASS; valide essa afirmação com o ambiente real, não infira que todo recurso está exposto ao jogador.
4. Execute **CNT-00** e gere o relatório com os resultados reais. Não reimplemente algo que já funciona.

## Execução por gates

- Leia `docs/01-CAMPANHA-20-FASES.md`, `02-EQUIPAMENTOS-RECEITAS.md`, `03-PROGRESSAO-CONQUISTAS-E-PONTUACAO.md`, `04-TESTES-ACEITE-E-FIXTURES.md`, `05-ARQUITETURA-E-MIGRACAO.md` deste pacote.
- Prossiga com `prompts/01-*.md`, `02-*.md` etc. **em sequência**. No começo de cada prompt leia o relatório CNT anterior e compare com código real.
- Execute auditoria → alteração efetiva → testes relevantes → docs → relatório, com status e evidências. Se falhar gate, corrija e reexecute; não passe como `CONCLUÍDO`.
- A cada quatro fases ou marco maior, valide demo jogável do fluxo novo no navegador, senão classificar integração como parcial.
- Sem perder a build anterior ou dados de `localStorage`; todas as migrações são versionadas e testadas.

## Metas finais

- 20 fases por cinco setores: L01–L03 preservadas; L04–L20 data-driven com fixtures válidas e solução demonstrada.
- 8 equipamentos operacionais (inclui buffer/sensor/splitter/merger/assembler) com UI/Three.js, não somente tipos.
- 11 itens e sete recipes (ver docs), encadeamento e pedidos dinâmicos comprovados pelo motor.
- Level select por setores, progressive unlock real, 1–3 estrelas calibradas, conquistas idempotentes, save/migração.
- Tooltip + card de preview 3D animado para cada equipamento, tutoriais por mecânica e idioma PT-BR/EN.
- E2E, fixtures por fase, QA, performance e documentação/relatório de publicação.

## Controle de prazo

Não assumir que tudo deve estar pronto antes do Game Off. Se a publicação estiver ameaçada, feche e teste um recorte de **8–10 fases** com CNT-21/22, registre L11–L20 (ou o que faltar) como planejadas, e continue depois. Nunca declare uma fase disponível sem solução real.

## Formato obrigatório após cada prompt

1. Arquivos alterados.
2. Requisitos e evidências de aceite.
3. Testes executados com resultados verdadeiros.
4. Relatório atualizado e decisões SDD.
5. Estado `CONCLUÍDO/PARCIAL/BLOQUEADO` e próxima fase autorizada.
