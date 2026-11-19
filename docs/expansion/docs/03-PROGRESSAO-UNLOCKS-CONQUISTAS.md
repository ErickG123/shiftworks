# Proposta de progressão, desbloqueios e conquistas

**Não é implementação atual.** Codex deve inventariar estados reais, preservar saves e adaptar a proposta por ADR.

## Regras canônicas

- Campanha mantém L01 First Line → L02 One Machine, Two Jobs → L03 Smart Routing; `T00` e `T01` são tutoriais disponíveis e repetíveis e não bloqueiam acesso à campanha. Layouts anteriores continuam carregando.
- Sector progression amplia a campanha depois das fases existentes. Concluir a última fase obrigatória de um setor destrava o próximo setor. Bônus, desafios extras e estrelas **não são requisitos de progressão** para o caminho básico.
- Desbloqueios de **equipamentos** são distinguíveis de disponibilidade **no inventário da fase**: botão pode estar (a) bloqueado pela campanha, (b) desbloqueado porém indisponível na fase, (c) disponível com quantidade. Tooltip explica exatamente a condição. L01 pode oferecer 0 processors sem isso ser bug; L02 deve ser solucionável com recursos previstos.
- Progresso cumulativo: uma fase desbloqueada/concluída nunca volta a bloqueada pela pior tentativa; recorde de stars/ticks é monotônico conforme métrica correta. Jogador pode repetir fase sem perder progresso.
- `achievementId`, `levelId`, `sectorId`, `equipmentId` estáveis e independentes de idioma; metadados apresentados via dicionário PT/EN.
- Cada desbloqueio tem **fonte rastreável**: evento de vitória válida do motor + condição configurada. Não aceitar vitória de estado de UI; não depender da exibição do modal para persistir.
- Sem remote backend, leaderboard público, login ou monetização. Estado salvo `localStorage` com versão/migração; falha de storage não impede jogar (com aviso).

## Proposta de setores

| Setor | Níveis | Foco |
|---|---|---|
| Logística | L01 e lições de esteiras | Fluxo e direção |
| Processamento | L02 | SHIFT e regras CUT/PRESS |
| Roteamento | L03 | Saídas corretas e desvio |
| Controle | L04+ (novo, mediante testes) | Sensores e buffers |
| Adaptação | L05+ (novo) | Pedidos mutáveis e receitas |
| Otimização | L06+ (novo) | Limites de ciclos e recursos |

Criar fases novas por dados, com pelo menos uma solução de referência que o teste percorre até vitória. Não renumerar IDs já persistidos sem migração.

## Conquistas sugeridas

| Achievement ID | Critério determinístico de desbloqueio |
|---|---|
| FIRST_DELIVERY | Concluir a primeira entrega válida em uma tentativa |
| FIRST_AUTOMATION | Concluir L01 |
| FIRST_SHIFT | Produzir 1 placa e 1 bloco no mesmo processor em uma tentativa válida |
| CLEAN_RUN | Completar qualquer fase sem rejeições, com pelo menos 1 item entregue |
| SMART_ROUTING | Concluir L03 com duas saídas corretas |
| EFFICIENT_BUILDER | Vencer um desafio com limite de peças aferido por componente realmente gasto |
| QUICK_THINKER | Completar um desafio de tempo/ciclos com limite calibrado e validado |
| NO_HANDS | Concluir uma fase com pedido dinâmico sem editar depois do Start |
| FIRST_BLUEPRINT | Salvar e reusar com sucesso um blueprint válido |
| TUTORIAL_GRADUATE | Concluir passos obrigatórios de T00 e T01 com eventos reais, não apenas Skip |

Critérios de conquista devem ser `AchievementRule` tipados, com testes; não conceder conquista de feature indisponível antecipadamente. Mensagens toast não devem bloquear cena ou fluxo; menu de conquistas deve oferecer lista, descrição, bloqueado/conquistado, data local opcional e progresso somente quando quantificável de forma real.

## Esquema sugerido (adaptar ao repositório)

- `schemaVersion`, `completedLevelIds`, `unlockedLevelIds`, `unlockedSectorIds`, `unlockedEquipmentIds`, `bestScoresByLevel`, `achievementsById`, `tutorialProgress`, `updatedAt`.
- Migração idempotente, tolerância a dados corrompidos, preservação de conquistas já dadas, sem uso de identificadores baseados em título traduzido.
- Regra de reconciliação: a versão persistida não deve poder desbloquear conteúdo inconsistente; para saves legados válidos, derivar setor e equipamentos a partir das conclusões antigas sem apagar conquistas.

## Aceites

- Perfil limpo abre L01; L02 bloqueada; L03 bloqueada. Após vitória L01, L02 libera no mesmo fluxo, persiste em reload. Após L02, L03 idem.
- Equipamento desbloqueado mas indisponível na fase informa o motivo correto. Conquistas ocorrem uma única vez por evento (idempotência), mesmo com replays/reload.
- Pular tutorial NÃO concede `TUTORIAL_GRADUATE`, mas não bloqueia campanha.
- Falha de gravação de storage tem fallback funcional e mensagem traduzida.
