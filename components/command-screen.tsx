"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Hand, Volume2 } from "lucide-react"

interface CommandScreenProps {
  onNext: (score: number) => void
}

const commands = [
  { text: "Touch the green button", correctColor: "green" },
  { text: "Touch the blue button", correctColor: "blue" },
  { text: "Touch the yellow button", correctColor: "yellow" },
]

export function CommandScreen({ onNext }: CommandScreenProps) {
  const [stage, setStage] = useState<"testing">("testing")
  const [currentCmd, setCurrentCmd] = useState(0)
  const [score, setScore] = useState(0)

  const speak = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.8
      window.speechSynthesis.speak(utterance)
    }
  }

  useEffect(() => {
    if (stage === "testing") {
      speak(commands[currentCmd].text)
    }
  }, [stage, currentCmd])

  const handleButtonClick = (color: string) => {
    const isCorrect = color === commands[currentCmd].correctColor
    if (isCorrect) {
      setScore((prev) => prev + 1.67)
    }

    if (currentCmd < commands.length - 1) {
      setCurrentCmd((prev) => prev + 1)
    } else {
      onNext(score + (isCorrect ? 1.67 : 0))
    }
  }

  const colors = {
    green: "bg-primary hover:bg-primary/90",
    blue: "bg-blue-500 hover:bg-blue-600",
    yellow: "bg-yellow-400 hover:bg-yellow-500",
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] animate-slide-up">
      <Card className="w-full max-w-lg p-8 md:p-12 rounded-3xl shadow-xl border-2">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-secondary/20 rounded-2xl mb-6">
            <Hand className="w-12 h-12 text-primary" strokeWidth={2.5} />
          </div>

          <h2 className="text-3xl font-bold mb-8 text-foreground">{commands[currentCmd].text}</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 mb-6">
          <Button
            onClick={() => handleButtonClick("green")}
            className={`h-24 text-2xl rounded-2xl shadow-lg hover:scale-105 transition-transform ${colors.green}`}
          >
            Green
          </Button>
          <Button
            onClick={() => handleButtonClick("blue")}
            className={`h-24 text-2xl rounded-2xl shadow-lg hover:scale-105 transition-transform ${colors.blue}`}
          >
            Blue
          </Button>
          <Button
            onClick={() => handleButtonClick("yellow")}
            className={`h-24 text-2xl rounded-2xl shadow-lg hover:scale-105 transition-transform ${colors.yellow} text-gray-800`}
          >
            Yellow
          </Button>
        </div>

        <Button
          onClick={() => speak(commands[currentCmd].text)}
          variant="outline"
          size="lg"
          className="w-full h-16 text-lg rounded-2xl"
        >
          <Volume2 className="w-6 h-6 mr-2" />
          Repeat Instruction
        </Button>

        <div className="text-center text-sm text-muted-foreground mt-4">
          {currentCmd + 1} of {commands.length}
        </div>
      </Card>
    </div>
  )
}
