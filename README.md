# PokéRunner — App Híbrido: Pokédex + Jogo 2D

Trabalho Prático — ADS306: Desenvolvimento para Dispositivos Móveis e Games  
Desenvolvido com **React Native** e **Expo**

---

## Sobre o App

Aplicativo híbrido composto por duas áreas integradas:

- **Pokédex (Utilitário):** consome a [PokeAPI](https://pokeapi.co) via Axios, lista os Pokémons em FlatList e permite visualizar os detalhes de cada um.
- **PokéRunner (Jogo 2D):** escolha seu Pokémon na Pokédex e use-o como personagem. Desvie de Pokémons inimigos terrestres e voadores em um runner 2D com física, pontuação e detecção de colisão.

---

## Tecnologias Utilizadas

| Tecnologia | Uso |
|---|---|
| React Native | Framework principal |
| Expo SDK 52 | Ecossistema de desenvolvimento |
| React Navigation | Tab Navigator + Stack Navigator |
| Axios | Requisições à PokeAPI |
| React Hooks | useState, useEffect, useRef, useContext |
| requestAnimationFrame | Game Loop nativo |

---

## Estrutura do Projeto

```
├── App.js
├── index.js
├── navigation/
│   └── AppNavigator.js
├── screens/
│   ├── PokemonListScreen.js
│   ├── PokemonDetailScreen.js
│   └── GameScreen.js
├── components/
│   ├── Button.js
│   ├── Card.js
│   └── Header.js
└── context/
    └── GameContext.js
```

---

## Como Executar

**Web (navegador):**
```bash
npm run web
```

**Celular (Expo Go):**
```bash
npm start
```
Escaneie o QR code com o app **Expo Go** (Android/iOS).

---

## Requisitos Técnicos Atendidos

- Componentização com componentes reutilizáveis (Button, Card, Header)
- Layout responsivo com Flexbox
- Hooks useState e useEffect em todas as telas
- Tab Navigator e Stack Navigator com React Navigation
- Consumo de API REST pública (PokeAPI) com tratamento de erros
- Game Loop com requestAnimationFrame
- Detecção de colisão AABB
- Pontuação em tempo real e sistema de recorde
