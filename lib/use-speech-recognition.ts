"use client"

import { useState, useEffect, useCallback } from "react"

interface SpeechRecognitionHook {
  transcript: string
  isListening: boolean
  startListening: () => void
  stopListening: () => void
  resetTranscript: () => void
  error: string | null
}

export function useSpeechRecognition(): SpeechRecognitionHook {
  const [transcript, setTranscript] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recognition, setRecognition] = useState<any>(null)

  useEffect(() => {
    if (typeof window === "undefined") return

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      setError("Speech recognition not supported in this browser")
      return
    }

    const recognitionInstance = new SpeechRecognition()
    recognitionInstance.continuous = true
    recognitionInstance.interimResults = true
    recognitionInstance.lang = "en-US"

    recognitionInstance.onresult = (event: any) => {
      let finalTranscript = ""
      let interimTranscript = ""

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPiece = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcriptPiece + " "
        } else {
          interimTranscript += transcriptPiece
        }
      }

      setTranscript((prev) => prev + finalTranscript + interimTranscript)
    }

    recognitionInstance.onerror = (event: any) => {
      console.error("[v0] Speech recognition error:", event.error)
      setError(`Recognition error: ${event.error}`)
      setIsListening(false)
    }

    recognitionInstance.onend = () => {
      console.log("[v0] Speech recognition ended")
      setIsListening(false)
    }

    setRecognition(recognitionInstance)
  }, [])

  const startListening = useCallback(() => {
    if (!recognition) return
    try {
      console.log("[v0] Starting speech recognition")
      recognition.start()
      setIsListening(true)
      setError(null)
    } catch (err) {
      console.error("[v0] Error starting recognition:", err)
      setError("Failed to start listening")
    }
  }, [recognition])

  const stopListening = useCallback(() => {
    if (!recognition) return
    try {
      console.log("[v0] Stopping speech recognition")
      recognition.stop()
      setIsListening(false)
    } catch (err) {
      console.error("[v0] Error stopping recognition:", err)
    }
  }, [recognition])

  const resetTranscript = useCallback(() => {
    setTranscript("")
  }, [])

  return {
    transcript,
    isListening,
    startListening,
    stopListening,
    resetTranscript,
    error,
  }
}
