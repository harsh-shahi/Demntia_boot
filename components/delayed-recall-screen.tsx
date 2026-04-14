"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Mic, Volume2, MicOff, Send } from "lucide-react"
import { useAudioRecorder } from "@/lib/use-audio-recorder"
import { playBeep } from "@/lib/play-beep"

interface DelayedRecallScreenProps {
  onNext: (score: number) => void
}

const targetWords = ["Rain", "Market", "Spoon", "Flower", "Tiger", "Window"]

export function DelayedRecallScreen({ onNext }: DelayedRecallScreenProps) {
  const [stage, setStage] = useState<"instruction" | "listening">("instruction")
  const { isRecording, audioBlob, startRecording, stopRecording, clearRecording } = useAudioRecorder()
  const [isProcessing, setIsProcessing] = useState(false)

  const speak = (text: string): Promise<void> => {
    return new Promise((resolve) => {
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = 0.8
        utterance.lang = "en-US"
        utterance.onend = resolve
        window.speechSynthesis.speak(utterance)
      } else {
        resolve()
      }
    })
  }

  useEffect(() => {
    if (stage === "instruction") {
      speak("Can you tell me all the words you remember from earlier? Speak them out loud when you're ready.")
    }
  }, [stage])

  const startTest = async () => {
    setStage("listening")
    clearRecording()
    await speak("Speak after the beep")
    await playBeep()
    setTimeout(() => {
      startRecording()
    }, 500)
  }

  useEffect(() => {
    if (isRecording) {
      // Cancel any ongoing speech when microphone starts
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [isRecording])

  const handleSubmit = async () => {
    if (!audioBlob) return

    setIsProcessing(true)
    try {
      const formData = new FormData()
      formData.append("audio", audioBlob)
      formData.append("testType", "delayed-recall")

      const response = await fetch("/api/verify-audio", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()
      console.log("[v0] Delayed recall backend response:", data)

      onNext(6)
    } catch (e) {
      console.error(e)
    } finally {
      setIsProcessing(false)
    }
  }

  if (stage === "instruction") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] animate-slide-up">
        <Card className="w-full max-w-lg p-8 md:p-12 rounded-3xl shadow-xl border-2">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-secondary/20 rounded-2xl mb-6">
              <Mic className="w-12 h-12 text-primary" strokeWidth={2.5} />
            </div>

            <h2 className="text-3xl font-bold mb-6 text-foreground">Time to Remember!</h2>

            <p className="text-xl leading-relaxed text-foreground/90 mb-8">
              Can you tell me all the words you remember from earlier? Speak them out loud when you're ready.
            </p>

            <div className="space-y-4">
              <Button
                onClick={startTest}
                size="lg"
                className="w-full h-20 text-2xl rounded-2xl shadow-lg hover:scale-105 transition-transform"
              >
                Start Speaking
              </Button>

              <Button
                onClick={() => speak("Can you tell me all the words you remember from earlier?")}
                variant="outline"
                size="lg"
                className="w-full h-16 text-lg rounded-2xl"
              >
                <Volume2 className="w-6 h-6 mr-2" />
                Hear Instructions
              </Button>
            </div>
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
            {isRecording ? "Listening..." : audioBlob ? "Ready to Send" : "Ready to Record?"}
          </h2>

          <div className="mb-6 p-6 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl min-h-[160px] flex items-center justify-center">
            {isRecording ? (
              <p className="text-xl font-medium text-red-500 animate-pulse">Recording...</p>
            ) : audioBlob ? (
              <p className="text-xl font-medium text-green-600">Response Captured</p>
            ) : (
              <p className="text-lg text-muted-foreground">Speak the words you remember...</p>
            )}
          </div>

          {isRecording && (
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-muted-foreground">Recording your response...</span>
            </div>
          )}
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
              onClick={handleSubmit}
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

          <Button
            onClick={() => speak("Tell me all the words you remember from earlier")}
            variant="ghost"
            size="lg"
            className="w-full h-14 text-base rounded-2xl"
            disabled={isRecording || isProcessing}
          >
            <Volume2 className="w-5 h-5 mr-2" />
            Repeat Question
          </Button>
        </div>
      </Card>
    </div>
  )
}
