"use client"

import { useState, useCallback } from "react"

interface TextRecallHook {
  userInput: string
  setUserInput: (text: string) => void
  isProcessing: boolean
  setIsProcessing: (loading: boolean) => void
  calculateScore: (targetWords: string[]) => number
  clearInput: () => void
}

export function useTextRecall(): TextRecallHook {
  const [userInput, setUserInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const clearInput = useCallback(() => {
    setUserInput("")
  }, [])

  const calculateScore = useCallback((targetWords: string[]) => {
    // Clean user input: split by spaces/commas, lowercase, and remove empty strings
    const userWords = userInput
      .toLowerCase()
      .split(/[,\s]+/)
      .map(w => w.replace(/[^\w]/g, "")) // Remove punctuation
      .filter(w => w.length > 0)

    const targets = targetWords.map(w => w.toLowerCase())
    
    // Count how many targets appear in the user's list
    const matchedWords = targets.filter(target => userWords.includes(target))
    return matchedWords.length
  }, [userInput])

  return {
    userInput,
    setUserInput,
    isProcessing,
    setIsProcessing,
    calculateScore,
    clearInput,
  }
}