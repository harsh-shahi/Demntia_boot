"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Calendar, MapPin, Volume2 } from "lucide-react"

interface OrientationScreenProps {
  onNext: (score: number) => void
}

const questions = [
  {
    q: "What day of the week is today?",
    icon: Calendar,
    answer: new Date().toLocaleDateString("en-US", { weekday: "long" }),
  },
  { q: "What month is it?", icon: Calendar, answer: new Date().toLocaleDateString("en-US", { month: "long" }) },
  { q: "What year is it?", icon: Calendar, answer: new Date().getFullYear().toString() },
  { q: "Where are you right now?", icon: MapPin, answer: "home" },
  { q: "What city are you in?", icon: MapPin, answer: "" },
]

export function OrientationScreen({ onNext }: OrientationScreenProps) {
  const [currentQ, setCurrentQ] = useState(0)
  const [score, setScore] = useState(0)
  const [userAnswer, setUserAnswer] = useState("")
  const [isMounted, setIsMounted] = useState(true)

  useEffect(() => {
    return () => {
      setIsMounted(false)
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isMounted) {
        speak(questions[currentQ].q)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [currentQ, isMounted])

  const speak = (text: string) => {
    if (typeof window !== "undefined" && window.speechSynthesis && isMounted) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.85
      window.speechSynthesis.speak(utterance)
    }
  }

  const handleAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      setScore((prev) => prev + 2)
    }

    if (currentQ < questions.length - 1) {
      setCurrentQ((prev) => prev + 1)
      setUserAnswer("")
    } else {
      onNext(score + (isCorrect ? 2 : 0))
    }
  }

  const CurrentIcon = questions[currentQ].icon

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] animate-slide-up">
      <Card className="w-full max-w-lg p-8 md:p-12 rounded-3xl shadow-xl border-2">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-secondary/20 rounded-2xl mb-6 animate-bounce-in">
            <CurrentIcon className="w-12 h-12 text-primary" strokeWidth={2.5} />
          </div>

          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-foreground leading-tight">{questions[currentQ].q}</h2>

          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Type your answer..."
            className="w-full h-16 px-6 text-xl text-center rounded-2xl border-2 border-input bg-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            autoFocus
          />
        </div>

        <div className="space-y-4">
          <Button
            onClick={() => handleAnswer(true)}
            size="lg"
            className="w-full h-20 text-2xl rounded-2xl shadow-lg hover:scale-105 transition-transform"
            disabled={!userAnswer.trim()}
          >
            Submit Answer
          </Button>

          <Button
            onClick={() => speak(questions[currentQ].q)}
            variant="outline"
            size="lg"
            className="w-full h-16 text-lg rounded-2xl"
          >
            <Volume2 className="w-6 h-6 mr-2" />
            Listen Again
          </Button>

          <div className="text-center text-sm text-muted-foreground mt-4">
            Question {currentQ + 1} of {questions.length}
          </div>
        </div>
      </Card>
    </div>
  )
}
