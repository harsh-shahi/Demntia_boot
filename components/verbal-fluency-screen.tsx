"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Timer, Volume2, PenLine, Send, CheckCircle2 } from "lucide-react"
import { assessmentStorage } from "@/lib/assessment-storage"

interface VerbalFluencyScreenProps {
  onNext: (score: number) => void
}

export function VerbalFluencyScreen({ onNext }: VerbalFluencyScreenProps) {
  const [stage, setStage] = useState<"instruction" | "active" | "complete">("instruction")
  const [timeLeft, setTimeLeft] = useState(20)
  const [currentInput, setCurrentInput] = useState("")
  const [wordList, setWordList] = useState<string[]>([])
  const isMounted = useRef(true)

  const speak = (text: string) => {
    if ("speechSynthesis" in window && isMounted.current) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.lang = "en-US"
      window.speechSynthesis.speak(utterance)
    }
  }

  useEffect(() => {
    isMounted.current = true
    if (stage === "instruction") {
      speak("Type as many words starting with the letter F as you can in 20 seconds. Ready?")
    }
    return () => {
      isMounted.current = false
      if ("speechSynthesis" in window) window.speechSynthesis.cancel()
    }
  }, [stage])

  useEffect(() => {
    if (stage === "active" && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000)
      return () => clearInterval(timer)
    } else if (stage === "active" && timeLeft === 0) {
      setStage("complete")
    }
  }, [stage, timeLeft])

  const handleAddWord = () => {
    const word = currentInput.trim().toLowerCase()
    
    // VALIDATION:
    // 1. Must start with 'f'
    // 2. Must be longer than 1 letter
    // 3. Must not be a duplicate
    if (word.startsWith("f") && word.length > 1 && !wordList.includes(word)) {
      setWordList((prev) => [...prev, word])
      setCurrentInput("")
    } else {
      // Small visual feedback or ignore
      setCurrentInput("")
    }
  }

  const handleFinish = () => {
    /**
     * --- MARKING SCHEME ---
     * In 20 seconds:
     * 0-2 words: 0 points
     * 3-5 words: 1 point
     * 6-8 words: 2 points
     * 9+ words: 3 points
     */
    let score = 0
    const count = wordList.length
    if (count >= 9) score = 3
    else if (count >= 6) score = 2
    else if (count >= 3) score = 1

    // Save to orientation or a new breakdown category if you have one
    assessmentStorage.saveScore("orientation", score)
    onNext(score)
  }

  if (stage === "instruction") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] animate-slide-up">
        <Card className="w-full max-w-lg p-8 md:p-12 rounded-3xl shadow-xl border-2">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-2xl mb-6">
              <PenLine className="w-12 h-12 text-primary" strokeWidth={2.5} />
            </div>

            <h2 className="text-3xl font-bold mb-6">Fluency Test</h2>

            <p className="text-xl leading-relaxed text-foreground/90 mb-8">
              Type as many words starting with the letter <strong className="text-primary text-2xl">"F"</strong> as you can in 20 seconds.
            </p>

            <div className="space-y-4">
              <Button
                onClick={() => setStage("active")}
                size="lg"
                className="w-full h-20 text-2xl rounded-2xl shadow-lg hover:scale-105 transition-transform"
              >
                Start Timer
              </Button>

              <Button
                onClick={() => speak("Type as many words starting with the letter F as you can in 20 seconds.")}
                variant="outline"
                size="lg"
                className="w-full h-16 text-lg rounded-2xl"
              >
                <Volume2 className="w-6 h-6 mr-2" />
                Listen Again
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  if (stage === "active") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <Card className="w-full max-w-lg p-8 md:p-10 rounded-3xl shadow-xl border-2">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
              <Timer className="w-5 h-5 text-primary" />
              <span className="text-2xl font-mono font-bold text-primary">{timeLeft}s</span>
            </div>
            <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
              Words: {wordList.length}
            </div>
          </div>

          <div className="space-y-6">
            <div className="relative">
              <Input
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddWord()}
                placeholder="Type 'F' word and press Enter"
                className="h-20 text-2xl text-center rounded-2xl border-2 focus:border-primary pr-16"
                autoFocus
                autoComplete="off"
              />
              <Button 
                onClick={handleAddWord}
                className="absolute right-2 top-2 h-16 w-16 rounded-xl"
                disabled={!currentInput.trim()}
              >
                <Send className="w-6 h-6" />
              </Button>
            </div>

            {/* Word Bubbles Container */}
            <div className="flex flex-wrap gap-2 min-h-[100px] p-4 bg-secondary/20 rounded-2xl border border-dashed">
              {wordList.length === 0 && (
                <p className="text-muted-foreground text-center w-full mt-6 italic">Words will appear here...</p>
              )}
              {wordList.map((word, i) => (
                <span key={i} className="px-4 py-2 bg-white rounded-full shadow-sm border text-primary font-medium animate-in zoom-in">
                  {word}
                </span>
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
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-2xl mb-6">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>

          <h2 className="text-3xl font-bold mb-4">Time{"'"}s Up!</h2>
          <p className="text-xl text-muted-foreground mb-8">
            You named <span className="text-primary font-bold">{wordList.length}</span> unique words starting with F.
          </p>

          <Button
            onClick={handleFinish}
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