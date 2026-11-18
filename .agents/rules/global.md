# Regra global — manutenção e governança

- Spec-driven: não desenvolver requisito sem RF e SPEC, nem mudar requisito sem registrar a decisão.
- Antes de editar, validar estado git e ler relatórios/ADRs existentes. Não sobrescrever trabalho de outro autor.
- Código-fonte legível, responsabilidades específicas, sem wrappers vazios nem abstrações especulativas.
- Interfaces e tipos do domínio em `*.model.ts`; componentes Three.js e painéis separados por responsabilidade; TS/HTML/CSS separados onde aplicável.
- ESLint + Prettier + editorconfig + Husky (precommit enxuto) + Vitest; CI reprodutível. Preferir versões estáveis compatíveis verificadas na Fase 01.
- Nomes de código em inglês; textos da UI inicialmente em inglês, preparados para tradução posterior se simples.
- Sem emoji como ícone de UI; cores não são o único veículo de status. Dark UI com contraste e foco visível.
- Arquivos em UTF-8; paths relativos; Windows e CI Linux devem funcionar.
- Conventional Commits; releases com tags SemVer; relatório final com evidências, gaps e arquivos afetados.
