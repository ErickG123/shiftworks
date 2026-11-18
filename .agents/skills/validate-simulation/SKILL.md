# Skill: validate-simulation

**Quando usar:** qualquer mudança em `src/game/domain` ou `src/game/simulation`.

## Casos obrigatórios

- Determinismo com o mesmo snapshot/configuração durante N ticks.
- Transferência simultânea para a mesma célula com desempate consistente.
- Ocupação bloqueada, source em backpressure e nenhum item duplicado.
- CUT/PRESS correto e modos alternados com custo exato.
- Regra ausente ou duplicada rejeitada/diagnosticada.
- Output incorreto rejeita, não soma ao objetivo.
- Pause/reset/restart mantém layout e recria estado inicial sem resíduos.
- Colisões de IDs, bordas do grid e célula fora do mapa.

**Evidência:** testes de estado final e da sequência de eventos de cada passo, com fixtures versionadas. Se falhar, bloquear gate.
