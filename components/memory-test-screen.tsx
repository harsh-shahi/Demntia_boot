"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Brain, Volume2 } from "lucide-react"

interface MemoryTestScreenProps {
  onNext: (score: number) => void
}

const words = ["Rain", "Market", "Spoon", "Flower", "Tiger", "Window"]

export function MemoryTestScreen({ onNext }: MemoryTestScreenProps) {
  const [stage, setStage] = useState<"instruction" | "speaking" | "complete">("instruction")
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const isMounted = useRef(true)
  const continueReminderTimer = useRef<NodeJS.Timeout>()

  const speak = (text: string, rate = 0.8) => {
    if ("speechSynthesis" in window && isMounted.current) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = rate
      utterance.lang = "en-US"
      window.speechSynthesis.speak(utterance)
    }
  }

  const speakAllWords = () => {
    const text = `Listen carefully to these words and try to remember them: ${words.join(", ")}`
    speak(text, 0.7)
  }

  const startSpeaking = () => {
    setStage("speaking")
    setCurrentWordIndex(0)
    speak("Listen carefully to these six words. Try to remember them.", 0.8)
    setTimeout(() => {
      speakWord(0)
    }, 3000)
  }

  const speakWord = (index: number) => {
    if (index < words.length) {
      speak(words[index], 0.7)
    }
  }

  useEffect(() => {
    if (stage === "instruction") {
      speak(
        "I'll say some words out loud. Listen carefully and try to remember them. We'll ask you to recall them later.",
      )
    }
    if (stage === "speaking" && currentWordIndex < words.length) {
      const timer = setTimeout(() => {
        if (currentWordIndex < words.length - 1) {
          setCurrentWordIndex((prev) => prev + 1)
          speakWord(currentWordIndex + 1)
        } else {
          setTimeout(() => {
            setStage("complete")
            speak("Good! Try to keep those words in your mind. We'll ask you to recall them later.")
          }, 1500)
        }
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [stage, currentWordIndex])

  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel()
      }
      if (continueReminderTimer.current) {
        clearTimeout(continueReminderTimer.current)
      }
    }
  }, [])

  useEffect(() => {
    if (stage === "complete") {
      continueReminderTimer.current = setTimeout(() => {
        speak("When you're ready, press the Continue button to move to the next test")
      }, 10000)

      return () => {
        if (continueReminderTimer.current) {
          clearTimeout(continueReminderTimer.current)
        }
      }
    }
  }, [stage])

  if (stage === "instruction") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] animate-slide-up">
        <Card className="w-full max-w-lg p-8 md:p-12 rounded-3xl shadow-xl border-2">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-2xl mb-6">
              <Brain className="w-12 h-12 text-primary" strokeWidth={2.5} />
            </div>

            <h2 className="text-3xl font-bold mb-6 text-foreground">Memory Test</h2>

            <p className="text-xl leading-relaxed text-foreground/90 mb-8">
              {"I'll"} say some words out loud. Listen carefully and try to remember them. {"We'll"} ask you to recall
              them later.
            </p>

            <div className="space-y-4">
              <Button
                onClick={startSpeaking}
                size="lg"
                className="w-full h-20 text-2xl rounded-2xl shadow-lg hover:scale-105 transition-transform"
              >
                {"I'm"} Ready to Listen
              </Button>

              <Button
                onClick={speakAllWords}
                variant="outline"
                size="lg"
                className="w-full h-16 text-lg rounded-2xl bg-transparent"
              >
                <Volume2 className="w-6 h-6 mr-2" />
                Preview Instructions
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  if (stage === "speaking") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <Card className="w-full max-w-lg p-12 md:p-16 rounded-3xl shadow-xl border-2 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="text-center">
            <Volume2 className="w-20 h-20 text-primary mx-auto mb-8 animate-pulse" strokeWidth={2.5} />

            <h2 className="text-3xl font-bold text-foreground mb-4">Listen Carefully</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Word {currentWordIndex + 1} of {words.length}
            </p>

            <div className="flex justify-center gap-2">
              {words.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-3 h-3 rounded-full transition-all ${
                    idx === currentWordIndex ? "bg-primary w-8" : idx < currentWordIndex ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] animate-slide-up">
      <Card className="w-full max-w-lg p-8 md:p-12 rounded-3xl shadow-xl border-2">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-2xl mb-6">
            <span className="text-4xl">✓</span>
          </div>

          <h2 className="text-3xl font-bold mb-6 text-foreground">Great Job!</h2>

          <p className="text-xl leading-relaxed text-foreground/90 mb-8">
            {"You've"} heard all the words. Try to keep them in your mind. {"We'll"} ask you to remember them in a few
            minutes.
          </p>

          <Button
            onClick={() => onNext(6)}
            size="lg"
            className="w-full h-20 text-2xl rounded-2xl shadow-lg hover:scale-105 transition-transform"
          >
            Continue
          </Button>
        </div>
      </Card>
    </div>
  )
}
