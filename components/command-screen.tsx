"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Hand, Volume2 } from "lucide-react"
import { assessmentStorage } from "@/lib/assessment-storage"

interface CommandScreenProps {
  onNext: (score: number) => void
}

const commands = [
  { text: "Touch the green button", correctColor: "green" },
  { text: "Touch the blue button", correctColor: "blue" },
  { text: "Touch the yellow button", correctColor: "yellow" },
]

export function CommandScreen({ onNext }: CommandScreenProps) {
  const [currentCmd, setCurrentCmd] = useState(0)
  const [totalScore, setTotalScore] = useState(0)
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
    speak(commands[currentCmd].text)
    return () => {
      isMounted.current = false
      if ("speechSynthesis" in window) window.speechSynthesis.cancel()
    }
  }, [currentCmd])

  const handleButtonClick = (color: string) => {
    const isCorrect = color === commands[currentCmd].correctColor
    
    /**
     * --- MARKING LOGIC ---
     * 3 commands total.
     * Each correct command = ~1.67 points.
     * Total = 5 points.
     */
    const earned = isCorrect ? 1.666 : 0
    const newScore = totalScore + earned

    if (currentCmd < commands.length - 1) {
      setTotalScore(newScore)
      setCurrentCmd((prev) => prev + 1)
    } else {
      // Round to 5 for the final store if all are correct
      const finalScore = Math.min(5, Math.round(newScore + (isCorrect ? 1.666 : 0)))
      
      /**
       * --- SAVING LOGIC ---
       */
      assessmentStorage.saveScore("orientation", finalScore)
      onNext(finalScore)
    }
  }

  // Removed text labels to ensure it tests auditory comprehension, not reading
  const colors = {
    green: "bg-green-500 hover:bg-green-600 ring-green-200",
    blue: "bg-blue-500 hover:bg-blue-600 ring-blue-200",
    yellow: "bg-yellow-400 hover:bg-yellow-500 ring-yellow-100",
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 animate-slide-up">
      <Card className="w-full max-w-lg p-8 md:p-12 rounded-3xl shadow-xl border-2">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-2xl mb-6">
            <Hand className="w-12 h-12 text-primary" strokeWidth={2.5} />
          </div>

          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground tracking-tight">
            Listen to the command
          </h2>
          <p className="text-muted-foreground text-lg italic">
            "Follow the spoken instruction..."
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 mb-8">
          {(["green", "blue", "yellow"] as const).map((color) => (
            <Button
              key={color}
              onClick={() => handleButtonClick(color)}
              className={`h-24 rounded-2xl shadow-md transition-all active:scale-95 border-4 border-white ring-4 ${colors[color]}`}
            >
              {/* No text inside, forces user to listen */}
            </Button>
          ))}
        </div>

        <div className="space-y-4">
          <Button
            onClick={() => speak(commands[currentCmd].text)}
            variant="ghost"
            size="lg"
            className="w-full h-16 text-lg rounded-2xl text-muted-foreground"
          >
            <Volume2 className="w-6 h-6 mr-2" />
            Repeat Instruction
          </Button>

          <div className="flex justify-center gap-4 mt-4">
            {commands.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentCmd ? "w-12 bg-primary" : "w-3 bg-muted"
                }`} 
              />
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}