# ARC-004 — Dados de fase, layout, progresso e migração

## Persistência e localização

O jogo da jam não precisa de backend. LevelDefinitions ficam no bundle, importados como dados tipados; progresso e preferências opcionais ficam em `localStorage` com tratamento de indisponibilidade. Nunca permitir que dados salvos não validados derrubem a sessão.

## Schema de LevelDefinition

Definido em `CONTRACTS.md`. Exigir em validação runtime:

- id não vazio e único; `width/height` inteiros positivos compatíveis com limite de UI.
- `fixedComponents` e obstacles dentro da grade, sem sobreposição; IDs únicos.
- Source com sequência de materiais não vazia e intervalo positivo.
- Output com tipo aceito explícito, coerente com metas por `outputId` existente.
- Inventário com limites não negativos e sem editar peças fixas.
- Rules sem condições duplicadas; `CUT` apenas para BLUE e `PRESS` apenas para AMBER (política inicial), se restrição de receita for ativada.
- `referenceLayoutId` aponta para fixture de teste real.

## Exemplo de dados simplificado

```json
{
  "id": "L03",
  "width": 8,
  "height": 8,
  "fixedComponents": [
    { "id": "source-1", "type": "SOURCE", "position": {"x": 0, "y": 3}, "direction": "E", "sequence": ["BLUE_BLANK", "AMBER_BLANK"], "intervalTicks": 5 },
    { "id": "out-a", "type": "OUTPUT", "position": {"x": 7, "y": 2}, "direction": "E", "acceptedTypes": ["CUT_PLATE"], "label": "A" },
    { "id": "out-b", "type": "OUTPUT", "position": {"x": 6, "y": 6}, "direction": "S", "acceptedTypes": ["PRESSED_BLOCK"], "label": "B" }
  ],
  "inventory": {"CONVEYOR": 16, "PROCESSOR": 1, "DIVERTER": 1},
  "goals": [
    {"outputId": "out-a", "itemType": "CUT_PLATE", "quantity": 3},
    {"outputId": "out-b", "itemType": "PRESSED_BLOCK", "quantity": 3}
  ],
  "obstacles": [],
  "referenceLayoutId": "reference-l03"
}
```

**O exemplo é descritivo, não garante solução geométrica.** Uma fixture de layout jogável deve comprovar que as orientações e distâncias permitem atender às metas; não tratar este snippet como nível pronto.

## Dados persistidos

```ts
type SaveEnvelope<T> = { version: 1; savedAt: string; data: T };
type Preferences = { muted: boolean; volume: number; reducedMotion: boolean };
type Progress = { completedLevels: string[]; bestScores: Record<string, number> };
```

- Guardar apenas dados necessários, sem timestamp usado como seed de jogo.
- `try/catch` leitura/gravação. JSON malformado → defaults + aviso não bloqueante.
- Dados de futuras versões → não aplicar silenciosamente; suporte a migração explícita quando adicionada.
- Namespace: `shiftworks.preferences.v1`, `shiftworks.progress.v1`, `shiftworks.sandbox.v1` (último P2).
- Preferências e progresso armazenados só no navegador; botão de reset com confirmação.

## Segurança e licenças

- Não executar strings do usuário como código; rules estruturadas, não `eval`.
- Nenhuma conexão com API para jogar. Pode existir hospedagem do build, sem telemetria obrigatória.
- Assets de terceiros demandam inventário e prova de licença em release checklist.
