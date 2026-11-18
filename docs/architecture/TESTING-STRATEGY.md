# ARC-005 — Estratégia de testes e validação

## Pirâmide

1. **Unitários (Vitest):** regras puras, ports, receitas, tick, prioridade, constraints e estado de sessão.
2. **Integração (Vitest):** fixtures de fábricas inteiras e scripts de referência para fases 01–03.
3. **E2E (Playwright):** menu → construção → rules → Start → vitória; smoke de release.
4. **Manuais:** leitura de 3D, click accuracy, layout, controle por teclado, áudio e desempenho.

## Gates obrigatórios

- P0: 100% dos cenários críticos e invariantes da matriz de testes passando; não exigir porcentagem arbitrária de cobertura total.
- P1: Playwright smoke em Chrome/Chromium e testes de regressão das três fases.
- Asserções de snapshots/eventos em ticks de referência, não comparar imagens 3D como fonte da verdade do domínio.

## Fixtures e relógio

- Criar `testScenario(level, layout, steps)` que invoca `step` sem `setInterval`.
- Toda fixture tem estados esperados, eventos esperados e meta atingida (ou erro esperado).
- Para evitar testes frágeis, IDs previsíveis e clock controlado.
- Cobrir: round-trip de construção, orientações, emissão bloqueada, disputa de slot, faltas de regra, rejeição, pausa/reset e goal.

## E2E

- Preferir `data-testid` em controles e elementos DOM relevantes; não basear testes somente em coordenadas instáveis do canvas.
- Para manipulação de grade 3D, expor coordenadas de picking estáveis apenas em modo de teste (não shortcuts secretos no release).
- Testar 1280×720 e 1920×1080. Evidência de renderização e UX deve ter screenshots reais após build.
- WebGL sem suporte deve mostrar fallback honesto, não tela branca.

## CI

GitHub Actions em pull request e main: `npm ci` → lint → typecheck → unit/integration → build → E2E headless (ou job separado). Cache npm com lockfile. Nomes de scripts definidos na Fase 01. Arquivo de workflow é parte da **implementação**, não deste pacote documental.

## Critérios de resultado

- PASS: teste executado e resultado verdadeiro registrado.
- FAIL: execução revelou erro; abrir bug com passos e fixture.
- NOT_RUN: explicar ambiente/indisponibilidade, não converter em PASS.
- Bloqueio de G08/G13/G16 se caso crítico falhar ou não for verificável.
