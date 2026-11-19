# Instruções operacionais para agentes — SHIFTWORKS

> Leia este arquivo antes de qualquer alteração. Documentação SDD aprovada como referência inicial; implementação ainda a construir.

## Leituras mandatórias, nesta ordem

1. `docs/design/GDD.md` e `docs/vision/VISION.md`.
2. `docs/requirements/REQUIREMENTS.md`, especificação relacionada e `docs/qa/TRACEABILITY.md`.
3. `docs/architecture/OVERVIEW.md`, `SIMULATION-SEMANTICS.md`, `CONTRACTS.md` e ADRs relevantes.
4. Último relatório de `docs/reports/` (se houver); não avançar ignorando bloqueios.
5. `docs/roadmap/GATES.md` e o prompt da fase atual.

## Restrições vinculantes

- Stack P0/P1: Vite + TypeScript estrito + Three.js + CSS modular; Vitest; Playwright quando aplicável. **Não substituir por Angular, React ou engine** sem ADR aprovada.
- Separar TS, HTML e CSS quando houver templates/estilos; nada de markup ou CSS extensos dentro de `.ts`. Tipos de domínio em arquivos `*.model.ts`; usar discriminated unions e impedir `any` no domínio.
- Simulação determinística pura, jamais acoplada a Three.js, GSAP, UI, áudio, câmera ou FPS.
- Controles e ownership de eventos: `R` exclusivo para girar peça selecionada ou prévia (`ghost`) em `EDITING`; `WASD` (pan) e `Q/E` (rotação orbital de 90°) exclusivos do `CameraController`; atalhos bloqueados quando `input`, `select`, `textarea` ou modal (`[role="dialog"]`) estiverem em foco.
- Máquina de estados de sessão (`EDITING` / `RUNNING` / `PAUSED` / `RESULT`): `PAUSED` permite inspeção somente leitura e destaca o CTA **Editar fábrica** para retornar a `EDITING` preservando o layout; sair de `GAMEPLAY` garante retorno seguro a `EDITING`.
- Design modular, acessível, responsivo desktop (1024×768 a 1920×1080), com suporte a tema escuro e i18n completo (`pt-BR` e `en`) sem expor IDs técnicos internos (`BLUE_BLANK`, `CONVEYOR`, etc.) na UI; sem emojis usados como ícones de UI. Usar SVG/Lucide licenciado ou geometria própria.
- Modificar apenas o escopo da fase; não antecipar P2/pós-jam.
- Nenhuma exclusão/refatoração destrutiva sem auditoria e justificação; proteger dados e documentos existentes.
- Não introduzir assets sem licença, telemetria ou login não previstos; registrar fontes/licenças quando necessário.
- Nunca escrever que rodou testes sem ter rodado. Se ambiente impedir, documentar bloqueio e comando a repetir.
- Commits com Conventional Commits; CI deve validar build, lint, tipo e testes; releases `vX.Y.Z` somente após gate.

## Protocolo por fase

1. Inspecionar arquivos/repositório; listar diferenças entre esperado e realidade.
2. Definir plano compacto e citar `SPEC-*`/`RF-*`/`RNF-*` relevantes.
3. Implementar mudanças mínimas coerentes com o contrato, mantendo integração funcional.
4. Criar testes unitários/integrados/e2e correspondentes, incluindo negativos e bordas.
5. Executar verificações e registrar resultado/ambiente/logs reprodutíveis.
6. Atualizar especificações, ADRs e `docs/qa/TRACEABILITY.md` apenas quando houver justificativa/evidência.
7. Salvar `docs/reports/REPORT-PHASE-XX-*.md`, seguindo `docs/templates/PHASE-REPORT-TEMPLATE.md`.
8. Abrir pendências com IDs e severidade; não ocultar regressões; se gate falhar, **não avançar**.

## Ordem de trabalho

`prompts/00-baseline.md` até `prompts/16-release.md`, respeitando dependências. `prompts/17-postjam.md` é opcional **após** publicação. Um prompt completo por execução; o próximo relê o anterior.

## Matriz de prioridades

1. P0: mecânica SHIFT jogável, determinismo, edição, vitória e deploy estático.
2. P1: três fases, UX entendível, QA, balanceamento e acabamento.
3. P2: extras sob tempo e gate.

Quando o tempo apertar, cortar **features**, não confiabilidade da vertical slice nem a submissão.
