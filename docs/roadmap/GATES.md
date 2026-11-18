# Gates verificáveis — SHIFTWORKS

**Status permitido:** `NOT_STARTED | PASS | PARTIAL | BLOCKED`. Todos iniciam `NOT_STARTED`.

| Gate | Critério mínimo com evidência |
|---|---|
| G00 | Auditoria base e escopo atualizados sem confundir documentação com código |
| G01 | dev, lint, typecheck, unit test e build funcionam; CI definida |
| G02 | Grid ortográfico visível; raycast identifica célula; zoom sem bugs |
| G03 | Construir/remover/rotacionar respeita modos, limites e conexões |
| G04 | Mesmo estado/comandos produzem mesmos snapshots/eventos por N ticks |
| G05 | Emissão/movimento/backpressure sem item duplicado; conflitos resolvidos |
| G06 | BLUE→CUT, AMBER→PRESS; custo de shift/processo exato |
| G07 | Regras visuais válidas/erros; roteamento A/B; rejects corretos |
| G08 | **Vertical slice** executada por navegador: 3 plates + 3 blocks, sem intervenção após Start; reset consistente; evidências E2E |
| G09 | 3 fases com soluções referência que vencem; tutorial e resultado utilizáveis |
| G10 | Sandbox compartilha engine; storage resiliente (se implementado) |
| G11 | Toolbar/painel/HUD legíveis em 1280×720 e 1920×1080; foco e diagnósticos |
| G12 | Sem vazamentos evidentes; áudio desativável; animações refletem eventos |
| G13 | Testes essenciais e E2E smoke em verde, build estável; nenhum blocker |
| G14 | Pelo menos 2 playtests registrados ou limitação documentada; bloqueios críticos resolvidos |
| G15 | RC validado em build local e upload experimental itch.io; licenças e README revisados |
| G16 | Página pública jogável; submissão oficial confirmada e evidenciada; tag vX.Y.Z |

## Evidência exigida

Relatório da fase com: commit/hash (se existente), arquivos alterados, testes executados e resultados, screenshots ou vídeo/capturas para UI, IDs de RF/RNF, regressões, riscos, gate e autorização explícita para a próxima fase.

**Não marcar PASS** se o teste-chave não pôde ser executado. Use PARTIAL e liste o motivo. Não fabricar confirmação de submissão, páginas públicas ou performance.
