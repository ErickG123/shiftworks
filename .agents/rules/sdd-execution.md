# Regra — execução sequencial de prompts

1. Validar fase atual, dependências e último relatório: status `PASS`, `PARTIAL` ou `BLOCKED`.
2. Se último relatório for `PARTIAL/BLOCKED`, priorizar resolver bloqueios antes de avançar; documentar se replanejar.
3. Associar código a IDs RF/RNF/SPEC e testes; manter rastreabilidade.
4. Ao concluir, gerar relatório usando template e listar comandos de verificação executados, evidências e links locais de arquivos.
5. Nunca marcar `PASS` por inferência ou por existir código sem teste; distinguir resultado de teste, review de código e inspeção visual.
6. Na existência de mudança incompatível de contrato, criar ADR e registrar migração; não alterar GDD original silenciosamente.
7. Implementar o menor escopo capaz de passar o gate; acompanhar risco de entrega do evento.
