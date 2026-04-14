"use client"

import { useState, useRef, useCallback } from "react"

interface AudioRecorderHook {
  isRecording: boolean
  audioURL: string | null
  audioBlob: Blob | null
  startRecording: () => Promise<void>
  stopRecording: () => Promise<Blob | null> // Return promise with blob
  clearRecording: () => void
  error: string | null
}

export function useAudioRecorder(): AudioRecorderHook {
  const [isRecording, setIsRecording] = useState(false)
  const [audioURL, setAudioURL] = useState<string | null>(null)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [error, setError] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const stopResolverRef = useRef<((blob: Blob | null) => void) | null>(null)

  const startRecording = useCallback(async () => {
    try {
      console.log("[v0] Starting audio recording")
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        console.log("[v0] Audio recording stopped")
        const blob = new Blob(chunksRef.current, { type: "audio/webm" })
        const url = URL.createObjectURL(blob)
        setAudioURL(url)
        setAudioBlob(blob)
        stream.getTracks().forEach((track) => track.stop())

        if (stopResolverRef.current) {
          stopResolverRef.current(blob)
          stopResolverRef.current = null
        }
      }

      mediaRecorder.start()
      setIsRecording(true)
      setError(null)
    } catch (err) {
      console.error("[v0] Error starting recording:", err)
      setError("Failed to access microphone")
    }
  }, [])

  const stopRecording = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (mediaRecorderRef.current && isRecording) {
        console.log("[v0] Stopping audio recording")
        stopResolverRef.current = resolve
        mediaRecorderRef.current.stop()
        setIsRecording(false)
      } else {
        resolve(null)
      }
    })
  }, [isRecording])

  const clearRecording = useCallback(() => {
    if (audioURL) {
      URL.revokeObjectURL(audioURL)
    }
    setAudioURL(null)
    setAudioBlob(null)
    chunksRef.current = []
  }, [audioURL])

  return {
    isRecording,
    audioURL,
    audioBlob,
    startRecording,
    stopRecording,
    clearRecording,
    error,
  }
}
