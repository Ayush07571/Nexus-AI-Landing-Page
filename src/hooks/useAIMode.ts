import { useState } from 'react'

export function useAIMode() {
  const [aiMode, setAIMode] = useState(false)
  const toggleAIMode = () => setAIMode(prev => !prev)
  return { aiMode, toggleAIMode }
}
