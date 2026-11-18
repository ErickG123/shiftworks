# SPEC-MENU-NAVIGATION-REDESIGN

> Data: 2026-11-18  
> Status: IMPLEMENTADO

## 1. Requisitos
- **RF-MENU-01 (Tela de Menu Independente)**: Ao iniciar em `MAIN_MENU`, nenhum elemento do HUD de gameplay (`.game-header`, `.left-rail`, `.viewport-toolbar`, `.right-inspector`, `.bottom-bar`) pode ficar visível ao fundo.
- **RF-MENU-02 (Diorama 3D Animado)**: O menu principal deve exibir uma linha 3D demonstrativa real em funcionamento (Fonte, Processador SHIFT alternando `CUT/PRESS`, Esteiras, Desviador `A/B` e Itens em movimento), isolada do estado do jogador.
- **RF-MENU-03 (Seleção de Fases Dedicada)**: `LEVEL_SELECT` deve funcionar como tela dedicada com estados `DISPONÍVEL`, `BLOQUEADA` (com pré-requisito traduzido) e `CONCLUÍDA`.
- **RF-I18N-01 (100% PT-BR / EN)**: Todas as mensagens dinâmicas e estáticas do Menu, Seleção de Fases, Configurações, Editor e Simulação devem respeitar o idioma ativo (`pt-BR` padrão na primeira visita, `en` selecionável).
