import React, { createContext, useContext, useState } from 'react';

const GameContext = createContext();

export function GameProvider({ children }) {
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  return (
    <GameContext.Provider value={{ selectedPokemon, setSelectedPokemon }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}
