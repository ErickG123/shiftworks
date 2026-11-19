# Arquitetura de conteúdo e integração — diretrizes

```text
Repositório real (respeitar a organização em vigor)
  src/game/domain/         Equipment, Item, Recipe, Level, Rule, Progress, Achievement models
  src/game/simulation/     Estado autoritativo, step determinístico, execução, eventos
  src/game/editor/         Posicionamento, paths, undo/redo, validação de célula
  src/game/rendering/      Modelos procedural Three.js, animação, card preview
  src/game/ui/             Templates HTML, TS controladores, CSS de HUD/menus
  src/game/persistence/    Save versionado, migração, opções
  docs/                    GDD, SPEC, ADR, tests, reports, audits
  .agents/                 Regras/skills, não copiar organização sem inspecionar
```

## Invariantes

- Domínio/Simulação puros; não importam Three.js, DOM, CSS ou localStorage.
- Mecânica baseada em ticks; renderer apenas interpola eventos.
- Definição de nível/receita é dado declarativo, não condicional por nome de fase.
- Registries de equipamentos são adaptadores mínimos, sem duplicar domain model ou criar framework novo.
- `*.model.ts`, `*.types.ts`, `*.constants.ts`, `*.config.ts`, `.html`, `.css` sob convenção existente e com parcimônia.
- Validador e fixtures devem ser reutilizados por CI; não validar vitória por mocks de entrega que não passaram pelo step real.
- Garantir descarte correto de malhas, geometria, materiais e controles em previews; não consumir um segundo gameplay state.

## Migração e compatibilidade

- Manter IDs L01–L03 e T00/T01; registrar aliases se houver IDs antigos.
- Salvar progresso de missões L04–L20 e equips novos sob versão nova, lendo versões anteriores.
- Manter progresso e achievements existentes. Export/import e Sandbox não devem limpar campanha.
- i18n pt-BR default com en; chaves novas sob catálogo coerente; traduzir objetivos/erros/tutor/itens.

## Checkpoints

Auditar → introduzir contratos → adaptar motor/editor → publicar equipamentos → fixtures → novos níveis → UX de progressão → tutorial → QA → release.
