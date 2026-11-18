# UX-002 — Design system minimalista

## Conceito visual

Miniatura industrial 3D, fundo grafite/azul escuro, metais suaves e sinais energéticos com contraste. Coesão por geometria simples, luz direcional, silhouettes diferentes por máquina; **não** simular UI corporativa pesada dentro de um jogo.

## Tokens sugeridos (não vinculados a valores finais)

| Token | Sugestão | Uso |
|---|---|---|
| Surface | `#151D2A` | Background HUD/painéis |
| Raised | `#222E3D` | Painéis contextualizados |
| Text | `#EDF2F6` | Texto principal |
| Muted | `#A8B5C5` | Secundário |
| Accent | `#38B6AD` | Seleção e ações |
| Warn | `#E2AD52` | Troca de modo/atenção |
| Error | `#E56B71` | Erros |
| Blue input | `#4F97D6` | BLUE_BLANK (também forma quadrada) |
| Amber input | `#DBA04C` | AMBER_BLANK (também forma chanfrada) |

Validar contraste real em CSS e protótipos antes do release; cores são propostas, não resultado auditado. Layout em tokens CSS, espaçamento consistente, sem gradientes exagerados.

## Silhuetas 3D

- SOURCE: silo vertical com válvula/indicador de direção.
- CONVEYOR: corpo baixo, roletes e seta.
- PROCESSOR: bloco robusto com cabeçote móvel e display de modo.
- DIVERTER: caminho em T/Y, pivot físico com duas saídas etiquetadas A/B.
- OUTPUT: plataforma ampla com ícone de produto e contador.
- Item BLUE: cubo de face lisa com marca de corte.
- Item AMBER: prisma chanfrado ou corpo hexagonal com marca de prensa.

## Estados de UI

`default`, `hover`, `focused`, `selected`, `invalid`, `disabled`, `busy`, `success`. Peças inválidas recebem contorno e texto, não apenas cor. Canvas deve indicar mudança de ferramenta no cursor.

## Motion e áudio

- Transit interpola entre posições de ticks sem falsear estado.
- SHIFT mostra deslocamento do cabeçote + luz de modo; duração visual em sincronia com contador.
- Evitar excesso de partículas, pós-processamento pesado ou flashes rápidos.
- SFX sintéticos próprios para place, start, shift, processed, delivered, error, result. Mute e redução de movimento.

## UI separada

Painéis em HTML/CSS modular, lógica em TS, modelos em `*.model.ts`; estilos não inline por convenção, exceto valores dinâmicos calculados indispensáveis.
