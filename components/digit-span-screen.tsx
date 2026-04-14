"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Hash, Volume2, Mic, MicOff, Send } from "lucide-react"
import { useSpeechRecognition } from "@/lib/use-speech-recognition"
import { useAudioRecorder } from "@/lib/use-audio-recorder"
import { playBeep } from "@/lib/play-beep"

interface DigitSpanScreenProps {
  onNext: (score: number) => void
}

const sequences = [
  { digits: "4-2-9", type: "forward", spoken: "4, 2, 9" },
  { digits: "5-8-3-1", type: "forward", spoken: "5, 8, 3, 1" },
  { digits: "3-7", type: "backward", spoken: "3, 7" },
  { digits: "1-9-4", type: "backward", spoken: "1, 9, 4" },
]

export function DigitSpanScreen({ onNext }: DigitSpanScreenProps) {
  const [stage, setStage] = useState<"instruction" | "listening" | "responding">("instruction")
  const [currentSeq, setCurrentSeq] = useState(0)
  const [score, setScore] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const { transcript, isListening, startListening, stopListening, resetTranscript } = useSpeechRecognition()
  const { isRecording, audioBlob, startRecording, stopRecording, clearRecording } = useAudioRecorder()
  const isMounted = useRef(true)
  const submitReminderTimer = useRef<NodeJS.Timeout>()

  const speak = (text: string): Promise<void> => {
    return new Promise((resolve) => {
      if ("speechSynthesis" in window && isMounted.current) {
        window.speechSynthesis.cancel()
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = 0.8
        utterance.pitch = 1.0
        utterance.lang = "en-US"

        utterance.onend = () => {
          console.log("[v0] Speech finished:", text)
          resolve()
        }

        utterance.onerror = () => {
          console.log("[v0] Speech error:", text)
          resolve()
        }

        console.log("[v0] Starting speech:", text)
        window.speechSynthesis.speak(utterance)
      } else {
        resolve()
      }
    })
  }

  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel()
      }
      if (submitReminderTimer.current) {
        clearTimeout(submitReminderTimer.current)
      }
    }
  }, [])

  useEffect(() => {
    if (stage === "instruction") {
      const instruction =
        sequences[currentSeq].type === "forward"
          ? "Listen carefully and repeat these numbers in the same order"
          : "Listen carefully and repeat these numbers in reverse order"
      speak(instruction)
    }
  }, [stage, currentSeq])

  useEffect(() => {
    if (stage === "listening") {
      const speakNumbers = async () => {
        await speak(sequences[currentSeq].spoken)
        // Wait a moment after speaking, then play beep and start recording
        setTimeout(async () => {
          if (isMounted.current) {
            await speak("Speak after the beep")
            await playBeep()
            setStage("responding")
            setTimeout(() => {
              if (isMounted.current) {
                startRecording()
              }
            }, 500)
          }
        }, 1000)
      }
      speakNumbers()
    }
  }, [stage, currentSeq])

  useEffect(() => {
    if (stage === "responding" && audioBlob && !isRecording) {
      submitReminderTimer.current = setTimeout(() => {
        speak("If you're done, please press the Submit Answer button to continue")
      }, 15000)

      return () => {
        if (submitReminderTimer.current) {
          clearTimeout(submitReminderTimer.current)
        }
      }
    }
  }, [stage, audioBlob, isRecording])

  useEffect(() => {
    if (isRecording) {
      // Cancel any ongoing speech when microphone starts
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [isRecording])

  const startTest = () => {
    setStage("listening")
    clearRecording()
  }

  const submitAudio = async () => {
    if (!audioBlob) {
      console.error("[v0] No audio blob to submit")
      return
    }

    setIsProcessing(true)
    try {
      const formData = new FormData()
      formData.append("audio", audioBlob, "recording.webm")
      formData.append("expectedAnswer", sequences[currentSeq].digits)
      formData.append("testType", "digit-span")

      console.log("[v0] Submitting audio, size:", audioBlob.size)

      const response = await fetch("/api/verify-audio", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const earnedScore = 2.5 // Max score per item
      console.log("[v0] Backend response received:", data)

      setScore((prev) => prev + earnedScore)

      if (currentSeq < sequences.length - 1) {
        setCurrentSeq((prev) => prev + 1)
        setStage("instruction")
        clearRecording()
      } else {
        onNext(score + earnedScore)
      }
    } catch (error) {
      console.error("[v0] Failed to submit audio:", error)
      alert("Failed to submit audio. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleStopAndSubmit = async () => {
    stopRecording()
  }

  if (stage === "instruction") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] animate-slide-up">
        <Card className="w-full max-w-lg p-8 md:p-12 rounded-3xl shadow-xl border-2">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-2xl mb-6">
              <Hash className="w-12 h-12 text-primary" strokeWidth={2.5} />
            </div>

            <span className="inline-block px-4 py-2 bg-secondary/20 text-primary rounded-xl text-lg font-medium mb-4">
              {sequences[currentSeq].type === "forward" ? "Forward" : "Backward"}
            </span>

            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-foreground">Number Memory Test</h2>

            <p className="text-xl leading-relaxed text-foreground/90 mb-8">
              {sequences[currentSeq].type === "forward"
                ? "I'll say some numbers. Please repeat them in the same order."
                : "I'll say some numbers. Please repeat them in reverse order."}
            </p>

            <div className="space-y-4">
              <Button
                onClick={startTest}
                size="lg"
                className="w-full h-20 text-2xl rounded-2xl shadow-lg hover:scale-105 transition-transform"
              >
                {"I'm"} Ready
              </Button>

              <Button
                onClick={() => {
                  speak(
                    sequences[currentSeq].type === "forward"
                      ? "Listen carefully and repeat the numbers in the same order"
                      : "Listen carefully and repeat the numbers in reverse order",
                  )
                }}
                variant="outline"
                size="lg"
                className="w-full h-16 text-lg rounded-2xl bg-transparent"
              >
                <Volume2 className="w-6 h-6 mr-2" />
                Hear Instructions
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Question {currentSeq + 1} of {sequences.length}
              </div>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  if (stage === "listening") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <Card className="w-full max-w-lg p-12 md:p-16 rounded-3xl shadow-xl border-2 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="text-center">
            <Volume2 className="w-20 h-20 text-primary mx-auto mb-6 animate-pulse" strokeWidth={2.5} />
            <h2 className="text-3xl font-bold text-foreground mb-4">Listen Carefully...</h2>
            <p className="text-xl text-muted-foreground">I{"'"}m about to say the numbers</p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] animate-slide-up">
      <Card className="w-full max-w-lg p-8 md:p-12 rounded-3xl shadow-xl border-2">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-secondary/20 rounded-2xl mb-6">
            {isRecording ? (
              <Mic className="w-12 h-12 text-red-500 animate-pulse" strokeWidth={2.5} />
            ) : audioBlob ? (
              <Send className="w-12 h-12 text-green-500" strokeWidth={2.5} />
            ) : (
              <MicOff className="w-12 h-12 text-muted-foreground" strokeWidth={2.5} />
            )}
          </div>

          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-foreground">
            {isRecording ? "Listening..." : audioBlob ? "Ready to Send" : "Get Ready"}
          </h2>

          <div className="mb-6 p-6 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl min-h-[120px] flex items-center justify-center">
            {isRecording ? (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <span className="text-xl text-foreground font-medium">Recording Answer...</span>
              </div>
            ) : audioBlob ? (
              <p className="text-xl text-green-600 font-medium">Audio Captured!</p>
            ) : (
              <p className="text-xl text-muted-foreground">Waiting to record...</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {isRecording ? (
            <Button
              onClick={stopRecording}
              size="lg"
              className="w-full h-20 text-2xl rounded-2xl shadow-lg bg-red-500 hover:bg-red-600 text-white"
            >
              <MicOff className="w-8 h-8 mr-3" />
              Stop Recording
            </Button>
          ) : audioBlob ? (
            <Button
              onClick={submitAudio}
              size="lg"
              className="w-full h-20 text-2xl rounded-2xl shadow-lg hover:scale-105 transition-transform"
              disabled={isProcessing}
            >
              {isProcessing ? "Sending..." : "Submit Answer"}
            </Button>
          ) : (
            <Button onClick={startRecording} size="lg" className="w-full h-20 text-2xl rounded-2xl shadow-lg">
              Start Recording
            </Button>
          )}

          {!isRecording && audioBlob && (
            <Button
              onClick={() => {
                clearRecording()
                startRecording()
              }}
              variant="outline"
              size="lg"
              className="w-full h-16 text-lg rounded-2xl"
              disabled={isProcessing}
            >
              Record Again
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
