# Regra — determinismo do motor

- Estado puro/serializável, sem `Date.now`, `Math.random` não injetado, IDs aleatórios, timers, Three.js ou mutação fora de reducer.
- Tick discreto; `250ms` é cadência de apresentação, nunca uma duração medida pelo FPS.
- Uma célula/equipamento tem capacidade definida. Transferências simultâneas usam snapshot e reserva; concorrência resolvida de forma estável.
- Zero criação/destruição silenciosa de itens. Emissão, transformação, entrega e rejeição geram eventos auditáveis.
- Receitas, timers e regras usam estruturas tipadas; validar antes de iniciar simulação.
- Testes de determinismo com estado inicial idêntico, conflitos e bordas; consultar `docs/architecture/SIMULATION-SEMANTICS.md`.
- Mudanças de semântica requerem atualização da documentação de contratos e teste de regressão reproduzível.
