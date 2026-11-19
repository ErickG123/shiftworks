# SHIFTWORKS — Gameplay UX, HUD Hierarchy & 3D Readability

> **Versão:** 1.0  
> **Data:** 2026-11-18  
> **Escopo:** Diretrizes visuais e de interação do HUD in-game, leitura 3D do tabuleiro, feedback contextual, tutorial coachmark e overlay de vitória.

---

## 1. Hierarquia Espacial do HUD In-Game

O layout desktop (`1024×768`, `1280×720`, `1600×900`, `1920×1080`) prioriza o viewport Three.js no centro:

1. **Barra Superior (`.game-header`):**
   - Navegação (`Menu`), identidade `SHIFTWORKS`, seletores de `Modo` e `Fase` (habilitados em `EDITING`), seletor rápido de idioma (`Português (Brasil)` / `English`), `Configurações`, `Tutorial / Ajuda` e controle de áudio.
2. **Coluna Esquerda — Ferramentas e Alvo de Rotação (`.left-rail`, `168px`):**
   - Indicador contextual `#editor-target-mode`: informa explicitamente se a tecla `[R]` atua sobre a **Prévia (Ghost)** da ferramenta ativa ou sobre a **Peça Selecionada**.
   - Botões de ferramentas com ícone SVG, nome traduzido, badge numérico de estoque (`data-tool-count`) e subtítulo de motivo quando indisponível (`Indisponível`, `Esgotado`, `Bloqueado`).
   - Ações `Girar (R)`, `Cancelar (Esc)` e seletor `Direção` (`Norte (N)`, `Leste (E)`, `Sul (S)`, `Oeste (W)`).
3. **Viewport Central 3D (`.viewport-center`):**
   - Barra de topo do viewport (`.viewport-toolbar`) com badge `Tabuleiro 8 × 8`, coordenadas da célula sob o cursor, ângulo atual da câmera (`Visão 45°..315°`), dica rápida de teclado (`WASD`, `Q/E`, `R`, `Scroll`) e botões acessíveis de câmera (`Q ↺`, `E ↻`, `-`, `100%`, `+`).
   - Banner contextual de pausa (`#paused-callout-banner`) exibido apenas em `PAUSED` com explicação clara e botão primário **Editar fábrica**.
   - Coachmark não bloqueante do tutorial (`#tutorial-banner`, `pointer-events: none` no wrapper) com indicadores de progresso por etapa (`4 dots`) e botão `Pular`.
4. **Coluna Direita — Inspetor Contextual (`.right-inspector`, `296px`):**
   - **Objetivo da Fase** em destaque no topo com pílula de progresso traduzida (`Bloco azul na Doca: 0/3`).
   - **Inspetor de Peça** com tipo traduzido, posição `(x, y)` e direção, seguido dos painéis contextuais de regras (`Receitas do Processador SHIFT` ou `Rotas do Desviador`) apenas quando o respectivo equipamento está selecionado.
   - **Diagnóstico e Portas** com status em tempo real das máquinas e mensagens acionáveis para bloqueios (`porta desconectada`, `regra ausente`, `célula ocupada`).
   - **Orçamento de Peças e Armazenamento** em bloco `<details>` recolhível.
5. **Barra Inferior (`.bottom-bar`):**
   - Pílula de estado (`MODO EDIÇÃO`, `EM EXECUÇÃO`, `SIMULAÇÃO PAUSADA`, `FASE CONCLUÍDA`), botões de controle com destaque automático para o CTA contextual (`Iniciar` em edição, `Pausar` em execução, `Editar fábrica` em pausa), contador de ciclo e telemetria traduzida.

---

## 2. Leitura 3D e Diferenciação Não Dependente Apenas de Cor

- **Tabuleiro:** Base elevada (`plinth`) com ladrilhos alternados de alto contraste (`#31455e` / `#26374d`) sobre fundo `#0d1526` e realce âmbar para a célula sob o cursor.
- **Anel de Seleção 3D:** Peça selecionada recebe um anel luminoso (`RingGeometry` azul `#60a5fa`) na base da célula.
- **Silhuetas e Portas:**
  - `Fonte (Source)`: Silo cilíndrico alto com tampa clara e faixa escura.
  - `Esteira (Conveyor)`: Trilho retangular com 3 roletes transversais que rotacionam junto com a direção da esteira.
  - `Processador (Processor)`: Pórtico cúbico com cabeçote móvel vertical e esfera indicadora de modo (`CORTE` / `PRENSA`).
  - `Desviador (Diverter)`: Mesa com braço mecânico pivotante e duas portas de saída (`A` frontal, `B` lateral direita).
  - `Saída (Output)`: Plataforma hexagonal com disco receptor central.
  - Todos os componentes e a prévia (`ghost`) exibem cone direcional frontal e marcadores esféricos de porta (entrada ciano, saída amarela).
