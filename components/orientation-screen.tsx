"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Volume2, Send, HelpCircle } from "lucide-react"
import { assessmentStorage } from "@/lib/assessment-storage"

interface OrientationScreenProps {
  onNext: (score: number) => void
}

const questions = [
  {
    key: "day",
    q: "What day of the week is today?",
    answer: new Date().toLocaleDateString("en-US", { weekday: "long" }),
    type: "strict"
  },
  { 
    key: "month", 
    q: "What month is it?", 
    answer: new Date().toLocaleDateString("en-US", { month: "long" }),
    type: "strict"
  },
  { 
    key: "year", 
    q: "What year is it?", 
    answer: new Date().getFullYear().toString(),
    type: "strict"
  },
  { 
    key: "place", 
    q: "Where are you right now?", 
    type: "open" // Logic: Accept any sensible string (Home, Hospital, Office)
  },
  { 
    key: "city", 
    q: "What city are you in currently?", 
    type: "open" // Logic: Accept any string > 2 chars
  },
]

export function OrientationScreen({ onNext }: OrientationScreenProps) {
  const [currentQ, setCurrentQ] = useState(0)
  const [totalScore, setTotalScore] = useState(0)
  const [userAnswer, setUserAnswer] = useState("")
  const isMounted = useRef(true)

  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isMounted.current) {
        speak(questions[currentQ].q)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [currentQ])

  const speak = (text: string) => {
    if (typeof window !== "undefined" && window.speechSynthesis && isMounted.current) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.85
      window.speechSynthesis.speak(utterance)
    }
  }

  const handleSubmit = () => {
    const input = userAnswer.toLowerCase().trim()
    if (!input) return

    let isCorrect = false
    const config = questions[currentQ]

    if (config.type === "strict") {
      // Strict matching for Date/Month/Year
      isCorrect = input === config.answer?.toLowerCase().trim()
    } else {
      /**
       * --- OPEN QUESTION LOGIC ---
       * For "Place" and "City", we verify that:
       * 1. The input isn't just a single character.
       * 2. It doesn't contain nonsense (optional: you could add a list of blocked words).
       */
      isCorrect = input.length >= 2 
    }

    const earned = isCorrect ? 2 : 0
    const newScore = totalScore + earned

    if (currentQ < questions.length - 1) {
      setTotalScore(newScore)
      setCurrentQ((prev) => prev + 1)
      setUserAnswer("")
    } else {
      // Final Section Save
      assessmentStorage.saveScore("orientation", newScore)
      onNext(newScore)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 animate-slide-up">
      <Card className="w-full max-w-lg p-8 md:p-12 rounded-3xl shadow-xl border-2">
        <div className="text-center mb-8">
          {/* Using a neutral icon instead of specific hints like Calendar or Map */}
          <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-2xl mb-6">
            <HelpCircle className="w-8 h-8 text-muted-foreground/50" />
          </div>

          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-foreground tracking-tight">
            {questions[currentQ].q}
          </h2>

          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            className="w-full h-20 px-6 text-2xl text-center rounded-2xl border-2 border-input bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            autoComplete="off"
            autoCorrect="off"
          />
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleSubmit}
            size="lg"
            className="w-full h-20 text-2xl rounded-2xl shadow-lg hover:scale-[1.01] active:scale-95 transition-all"
            disabled={!userAnswer.trim()}
          >
            <Send className="w-6 h-6 mr-3" />
            Next Question
          </Button>

          <Button
            onClick={() => speak(questions[currentQ].q)}
            variant="ghost"
            size="lg"
            className="w-full h-14 text-muted-foreground hover:text-primary transition-colors"
          >
            <Volume2 className="w-5 h-5 mr-2" />
            Repeat Question
          </Button>

          {/* Minimalist Progress Indicator */}
          <div className="pt-6 flex justify-center items-center gap-3">
            {questions.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  idx <= currentQ ? "w-6 bg-primary/40" : "w-2 bg-muted"
                } ${idx === currentQ ? "bg-primary w-10" : ""}`} 
              />
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}