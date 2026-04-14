"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Palette, Volume2, Send, Zap } from "lucide-react"
import { assessmentStorage } from "@/lib/assessment-storage"

interface StroopScreenProps {
  onNext: (score: number) => void
}

const stroopItems = [
  { text: "RED", color: "text-blue-500", hex: "blue" },
  { text: "BLUE", color: "text-green-500", hex: "green" },
  { text: "GREEN", color: "text-red-500", hex: "red" },
  { text: "YELLOW", color: "text-purple-500", hex: "purple" },
  { text: "PURPLE", color: "text-yellow-500", hex: "yellow" },
]

export function StroopScreen({ onNext }: StroopScreenProps) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [totalScore, setTotalScore] = useState(0)
  const [userInput, setUserInput] = useState("")
  const isMounted = useRef(true)

  const speak = (text: string) => {
    if ("speechSynthesis" in window && isMounted.current) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      window.speechSynthesis.speak(utterance)
    }
  }

  useEffect(() => {
    isMounted.current = true
    speak("Type the color you see, not the word you read.")
    return () => {
      isMounted.current = false
      window.speechSynthesis.cancel()
    }
  }, [])

  const handleSubmit = () => {
    const input = userInput.toLowerCase().trim()
    if (!input) return

    const correctColor = stroopItems[currentIdx].hex
    const isCorrect = input === correctColor
    
    /**
     * --- MARKING LOGIC ---
     * 2 points per correct color identification.
     * Total possible: 10 points.
     */
    const earned = isCorrect ? 2 : 0
    const newScore = totalScore + earned

    if (currentIdx < stroopItems.length - 1) {
      setTotalScore(newScore)
      setCurrentIdx((prev) => prev + 1)
      setUserInput("")
    } else {
      // Final Section Save to Storage
      assessmentStorage.saveScore("orientation", newScore)
      onNext(newScore)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 animate-slide-up">
      <Card className="w-full max-w-lg p-8 md:p-12 rounded-3xl shadow-xl border-2">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-6">
            <Zap className="w-8 h-8 text-primary" strokeWidth={2.5} />
          </div>

          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">What color is this?</h2>
          <p className="text-muted-foreground mb-8 text-lg">Ignore the text, type the color.</p>

          <div className="mb-8 p-12 bg-secondary/10 rounded-3xl border-2 border-dashed border-primary/20">
            <p className={`text-7xl font-black tracking-tighter animate-in zoom-in duration-300 ${stroopItems[currentIdx].color}`}>
              {stroopItems[currentIdx].text}
            </p>
          </div>

          <Input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type color name..."
            className="h-16 text-xl text-center rounded-2xl border-2 focus:border-primary"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            autoComplete="off"
          />
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleSubmit}
            size="lg"
            className="w-full h-20 text-2xl rounded-2xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
            disabled={!userInput.trim()}
          >
            <Send className="w-6 h-6 mr-3" />
            Next Task
          </Button>

          <Button
            onClick={() => speak("What color is this text?")}
            variant="ghost"
            size="lg"
            className="w-full h-14 text-muted-foreground"
          >
            <Volume2 className="w-5 h-5 mr-2" />
            Repeat Instruction
          </Button>

          <div className="flex justify-center gap-2 mt-4">
            {stroopItems.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-2 rounded-full transition-all duration-500 ${
                  idx <= currentIdx ? "w-8 bg-primary" : "w-2 bg-muted"
                }`} 
              />
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}