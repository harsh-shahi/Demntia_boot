"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Volume2, Loader2, ArrowRight } from "lucide-react"
import { assessmentStorage } from "@/lib/assessment-storage"

interface ObjectNamingScreenProps {
  onNext: (score: number) => void
}

const objects = [
  { name: "Hammer", emoji: "🔨" },
  { name: "Banana", emoji: "🍌" },
  { name: "Chair", emoji: "🪑" },
  { name: "Clock", emoji: "🕐" },
  { name: "Dog", emoji: "🐕" },
]

export function ObjectNamingScreen({ onNext }: ObjectNamingScreenProps) {
  const [stage] = useState<"testing">("testing")
  const [currentObj, setCurrentObj] = useState(0)
  const [totalScore, setTotalScore] = useState(0)
  const [inputText, setInputText] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  
  // FIXED: Properly typed Ref to avoid the red error
  const submitReminderTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isMounted = useRef(true)

  const speak = (text: string) => {
    if ("speechSynthesis" in window && isMounted.current) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.8
      window.speechSynthesis.speak(utterance)
    }
  }

  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
      if ("speechSynthesis" in window) window.speechSynthesis.cancel()
      if (submitReminderTimer.current) clearTimeout(submitReminderTimer.current)
    }
  }, [])

  useEffect(() => {
    if (stage === "testing") {
      speak("What is this object? Please type your answer.")
    }
  }, [stage, currentObj])

  useEffect(() => {
    if (stage === "testing" && inputText.trim() && !isProcessing) {
      if (submitReminderTimer.current) clearTimeout(submitReminderTimer.current)
      
      submitReminderTimer.current = setTimeout(() => {
        speak("If you're done typing, please press the Next Object button to continue")
      }, 20000)

      return () => {
        if (submitReminderTimer.current) clearTimeout(submitReminderTimer.current)
      }
    }
  }, [inputText, isProcessing, stage])

  const handleSubmit = async () => {
    if (!inputText.trim()) return

    setIsProcessing(true)
    
    /**
     * --- FLEXIBLE MATCHING LOGIC ---
     * 1. Clean input: lowercase and trim whitespace.
     * 2. Handle articles: remove "a " or "an " from the start.
     */
    let userAnswer = inputText.toLowerCase().trim().replace(/^(a|an)\s+/, "")
    const correctAnswer = objects[currentObj].name.toLowerCase()
    
    const isCorrect = userAnswer === correctAnswer
    const earned = isCorrect ? 1 : 0
    const newScore = totalScore + earned

    // Simulate small delay for better UX
    setTimeout(() => {
      setTotalScore(newScore)
      
      if (currentObj < objects.length - 1) {
        // Move to next object
        setCurrentObj((prev) => prev + 1)
        setInputText("")
        setIsProcessing(false)
      } else {
        /**
         * --- SAVING LOGIC ---
         * Save final score (max 5) to the storage helper.
         */
        assessmentStorage.saveScore("orientation", newScore)
        onNext(newScore)
      }
    }, 600)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] animate-slide-up p-4">
      <Card className="w-full max-w-lg p-8 md:p-12 rounded-3xl shadow-xl border-2">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-foreground">
            What is this object?
          </h2>

          <div className="mb-8 p-12 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-3xl overflow-hidden">
            <p className="text-9xl animate-in zoom-in duration-500 select-none">
              {objects[currentObj].emoji}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <Input
            type="text"
            placeholder="Type your answer here..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="h-16 text-xl text-center rounded-2xl border-2 focus-visible:ring-primary"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit()
            }}
            autoFocus
          />

          <Button
            onClick={handleSubmit}
            size="lg"
            className="w-full h-20 text-2xl rounded-2xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
            disabled={!inputText.trim() || isProcessing}
          >
            {isProcessing ? (
              <span className="flex items-center justify-center">
                <Loader2 className="w-8 h-8 mr-3 animate-spin" />
                Checking...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <ArrowRight className="w-8 h-8 mr-3" />
                {currentObj < objects.length - 1 ? "Next Object" : "Finish Test"}
              </span>
            )}
          </Button>

          <Button
            onClick={() => speak("What is this object?")}
            variant="ghost"
            size="lg"
            className="w-full h-16 text-lg rounded-2xl text-muted-foreground"
            disabled={isProcessing}
          >
            <Volume2 className="w-6 h-6 mr-2" />
            Repeat Question
          </Button>

          <div className="text-center text-sm font-bold text-primary/60 mt-4 tracking-widest uppercase">
            Object {currentObj + 1} of {objects.length}
          </div>
        </div>
      </Card>
    </div>
  )
}