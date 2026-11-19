# Especificação UX/funcional — Catálogo, tooltips e vitrine 3D dos equipamentos

## Fluxo obrigatório

1. Usuário vê peça na toolbar, catálogo/enciclopédia ou inspetor.
2. **Hover de mouse OU foco de teclado** abre tooltip discreto após atraso apropriado, sem capturar ponteiro: nome localizado, finalidade em uma frase, disponibilidade `disponível`, `0 restante` ou `desbloqueia no setor X` com fonte real, atalho e botão/indicação de "Ver detalhes".
3. **Clique no ícone de informações ou ação Ver detalhes** abre **card flutuante ancorado** (popover/dialog, não navegação ao gameplay), contendo representação Three.js real do equipamento, vista orbitável (se viável) e demo de funcionamento. Clique principal na ferramenta ainda seleciona ferramenta de construção: não causar conflito com placement. Suporte teclado Enter/Espaço e Esc; gerenciamento de foco; backdrop apenas se necessário.
4. Card mostra: nome, papel, portas de entrada/saída, direção, exemplos de receitas/itens, situação de desbloqueio, limitações, uso prático e controle para iniciar/pausar demo; incluir PT-BR e EN. Caso renderização WebGL falhe, fallback estático com instruções equivalentes, mas não declarar preview 3D implementado nesse caso.
5. Mudar idioma atualiza tooltip e card sem destruir preview nem estado da simulação; fechar libera os recursos visuais e listeners.

## Regras de montagem e acessibilidade

- Usar catálogo tipado por `equipmentId`, dados de tradução por chaves e feature flags coerentes com implementação real. Não duplicar descrições em vários componentes. Evitar HTML de usuário em `innerHTML`; preferir conteúdo textual seguro.
- Layout responsivo: card dentro da viewport 1280×720, 1024×768 e 1920×1080; reposicionar se estiver perto de bordas; por cima de outras regiões sem bloquear controle de fechar; z-index definido.
- Tooltip em hover e foco nunca bloqueia seleção, não aparece sobre o alvo em rota errada e some ao desabilitar/remover peça. Para touch futuro, ícone explícito de ajuda.
- Demonstração pode mostrar um item entrando na esteira, deslocando-se, processador trocando CUT/PRESS com custo simulado, desviador alternando a saída, buffer recebendo/liberando item e sensor acionando regra. Só mostrar equipamentos existentes; itens futuros indisponíveis recebem explicação honesta.
- Renderizar com renderer de preview reutilizável gerenciado (ou técnica de scissor viewport, após análise). Não criar múltiplos render loops persistentes. AnimationFrame cancelado ao fechar/sair; disposals e referências adequados; gráficos de preview não afetam seleções, câmera ou progresso reais.
- Respeitar `prefers-reduced-motion`, aba oculta e preferências de áudio. Rotação automática pausar quando card não estiver visível. Evitar shaders pesados desnecessários.

## Catálogo mínimo obrigatório (PT-BR / EN)

| ID estável | PT-BR: título e resumo | EN: title and summary | Demonstração |
|---|---|---|---|
| SOURCE | Fonte — gera materiais em intervalos definidos | Source — emits materials at configured intervals | Bloco surgindo e aguardando saída |
| CONVEYOR | Esteira — move um item na direção escolhida por tick | Conveyor — moves one item per tick in its configured direction | Item deslocando entre segmentos |
| PROCESSOR | Processador SHIFT — muda entre cortar e compactar | SHIFT Processor — switches between cutting and pressing | CUT azul/ PRESS âmbar com troca visível |
| DIVERTER | Desviador — escolhe saída segundo regra do produto | Diverter — routes an item based on a product rule | Dois materiais seguindo destinos distintos |
| OUTPUT | Doca — recebe e contabiliza itens permitidos | Dock — accepts and counts allowed items | Entrega válida e rejeição demonstradas |
| SENSOR (expansão) | Sensor — observa itens e emite sinais de controle | Sensor — observes items and emits control signals | Detecta bloco e troca indicador |
| BUFFER (expansão) | Buffer — armazena materiais temporariamente | Buffer — temporarily stores materials | FIFO, item entra e sai após liberação |

## Estado real x vitrine

- Dados de gameplay: `EquipmentModel`, regras, inventário e preços/tempos do motor atual.
- Dados da vitrine: receita e animação determinística **isoladas**, não modificam engine real. Labels de exemplo explicitamente "demonstração".
- Feedback de estado: destacar `bloqueado`, `sem estoque`, `disponível` e `em execução` com texto/ícone, não somente cor.

## Aceite

- Usuário descobre o propósito de Conveyor, Processor e Diverter sem adivinhar nomes técnicos.
- Tooltip abre por hover e foco; card abre por ação distinta de posicionar; fecha por Esc e mantém foco coerente.
- Preview 3D executa ciclo visual identificável do componente em tela, pausa ao abrir outra tela, sem alterar simulação nem FPS determinístico.
- Conteúdo PT/EN completo, não desborda; falhas WebGL acessíveis; teste de navegação repetida sem leaks.
