// src/context/GameDataContext.tsx
import { createContext, useContext, useState } from "react"

interface GameData {
  name: string
  email: string
  age: string
  game: string
  score: number
  level: string
  timeTaken: number
}

interface GameDataContextType {
  gameData: GameData[]
  addGameData: (data: GameData) => void
  clearGameData: () => void
}

const GameDataContext = createContext<GameDataContextType | undefined>(undefined)

export function GameDataProvider({ children }: { children: React.ReactNode }) {
  const [gameData, setGameData] = useState<GameData[]>([])

  const addGameData = (data: GameData) => {
    setGameData((prevData) => [...prevData, data])
  }

  const clearGameData = () => {
    setGameData([])
  }

  return (
    <GameDataContext.Provider value={{ gameData, addGameData, clearGameData }}>
      {children}
    </GameDataContext.Provider>
  )
}

export function useGameData() {
  const context = useContext(GameDataContext)
  if (!context) {
    throw new Error("useGameData must be used within a GameDataProvider")
  }
  return context
}