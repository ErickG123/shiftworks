# Prompt coordenador — inicie pelo baseline, não execute todas as fases de uma só vez

Copie este texto no Codex após colocar o pacote na raiz do repositório:

> Estou construindo SHIFTWORKS para o GitHub Game Off 2026. Leia obrigatoriamente `AGENTS.md`, as regras em `.agents/`, o GDD, visão, requisitos, arquitetura, ADRs, plano de testes e roadmap. Comece **somente** pela `prompts/00-baseline.md`; audite o repositório real e gere `docs/reports/REPORT-PHASE-00-baseline.md`. Não declare ferramentas, código, CI, testes ou release concluídos sem execução e evidências. Ao final, diga se G00 passou e se a Fase 01 pode ser executada. Não antecipe fases seguintes.

Quando cada fase passar, use este comando adaptando XX:

> Leia `AGENTS.md`, toda documentação e o último relatório, valide que o gate anterior está PASS e execute `prompts/XX-<slug>.md` integralmente. Atualize código, testes, docs e relatório de fase. Não avance se bloqueado.

**Importante:** as instruções no pacote são especificações, não permissões para ignorar prompts/limites de ferramentas do ambiente onde o Codex roda.
