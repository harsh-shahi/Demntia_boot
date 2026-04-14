"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Hash, Volume2, Send, PenLine } from "lucide-react"
import { useTextRecall } from "@/hooks/useTextRecall"
import { assessmentStorage } from "@/lib/assessment-storage"

interface DigitSpanScreenProps {
  onNext: (score: number) => void
}

const sequences = [
  { digits: "4-2-9", type: "forward", spoken: "4, 2, 9" },
  { digits: "5-8-3-1", type: "forward", spoken: "5, 8, 3, 1" },
  { digits: "3-7", type: "backward", spoken: "3, 7", expected: "7-3" },
  { digits: "1-9-4", type: "backward", spoken: "1, 9, 4", expected: "4-9-1" },
]

export function DigitSpanScreen({ onNext }: DigitSpanScreenProps) {
  const [stage, setStage] = useState<"instruction" | "listening" | "responding">("instruction")
  const [currentSeq, setCurrentSeq] = useState(0)
  const [totalScore, setTotalScore] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Hook used for state management and clearing input
  const { userInput, setUserInput, clearInput } = useTextRecall()
  
  const isMounted = useRef(true)

  const speak = (text: string): Promise<void> => {
    return new Promise((resolve) => {
      if ("speechSynthesis" in window && isMounted.current) {
        window.speechSynthesis.cancel()
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = 0.8
        utterance.lang = "en-US"
        utterance.onend = () => resolve()
        utterance.onerror = () => resolve()
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
      if ("speechSynthesis" in window) window.speechSynthesis.cancel()
    }
  }, [])

  useEffect(() => {
    if (stage === "instruction") {
      const type = sequences[currentSeq].type
      speak(`Listen carefully and be ready to type these numbers ${type === "forward" ? "in the same order" : "in reverse order"}.`)
    }
  }, [stage, currentSeq])

  useEffect(() => {
    if (stage === "listening") {
      const playSequence = async () => {
        await speak(sequences[currentSeq].spoken)
        setTimeout(() => {
          if (isMounted.current) setStage("responding")
        }, 1000)
      }
      playSequence()
    }
  }, [stage, currentSeq])

  const handleSubmit = async () => {
    if (!userInput.trim()) return
    setIsProcessing(true)

    try {
      const currentConfig = sequences[currentSeq]
      
      /**
       * --- UPDATED MARKING LOGIC ---
       * 1. Get the target string (expected for backward, digits for forward).
       * 2. Clean both strings to compare only the digits.
       */
      const target = currentConfig.expected || currentConfig.digits
      const cleanTarget = target.replace(/\D/g, "")
      const cleanInput = userInput.replace(/\D/g, "")

      // Award 2.5 marks for an exact match
      const isCorrect = cleanTarget === cleanInput
      const earned = isCorrect ? 2.5 : 0
      
      const newScore = totalScore + earned
      setTotalScore(newScore)

      // Logic for moving between sequences or finishing the test
      if (currentSeq < sequences.length - 1) {
        setCurrentSeq(prev => prev + 1)
        setStage("instruction")
        clearInput()
      } else {
        /**
         * --- SAVING LOGIC ---
         * We send the final cumulative score to the storage helper.
         * The helper adds this to the total grand total automatically.
         */
        assessmentStorage.saveScore("digitSpan", newScore)
        onNext(newScore)
      }
    } catch (error) {
      console.error("Submission error:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  if (stage === "instruction") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] animate-slide-up">
        <Card className="w-full max-w-lg p-8 md:p-12 rounded-3xl shadow-xl border-2">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-2xl mb-6">
              <Hash className="w-12 h-12 text-primary" strokeWidth={2.5} />
            </div>
            <h2 className="text-3xl font-bold mb-4 text-foreground">Number Memory</h2>
            <p className="text-xl text-muted-foreground mb-8 text-balance">
              {sequences[currentSeq].type === "forward" 
                ? "Repeat the numbers in the same order." 
                : "Repeat the numbers in reverse order."}
            </p>
            <Button 
              onClick={() => setStage("listening")} 
              size="lg" 
              className="w-full h-20 text-2xl rounded-2xl shadow-lg transition-transform active:scale-95"
            >
              I{"'"}m Ready
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  if (stage === "listening") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <Card className="w-full max-w-lg p-12 rounded-3xl shadow-xl border-2 bg-secondary/5">
          <div className="text-center">
            <Volume2 className="w-20 h-20 text-primary mx-auto mb-6 animate-bounce" />
            <h2 className="text-3xl font-bold mb-4">Listen...</h2>
            <p className="text-xl text-muted-foreground">Remember the sequence</p>
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
            <PenLine className="w-12 h-12 text-primary" strokeWidth={2.5} />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-foreground">Type the numbers</h2>
          <p className="text-primary font-medium mb-6 uppercase tracking-widest text-sm">
            Mode: {sequences[currentSeq].type}
          </p>

          <Input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value.replace(/\D/g, ""))}
            placeholder="???"
            className="h-24 text-5xl text-center rounded-2xl border-2 tracking-[0.3em] font-mono focus:border-primary transition-all"
            autoFocus
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={isProcessing || !userInput}
          size="lg"
          className="w-full h-20 text-2xl rounded-2xl shadow-lg"
        >
          {isProcessing ? "Checking..." : <><Send className="w-6 h-6 mr-3" /> Submit Answer</>}
        </Button>
      </Card>
    </div>
  )
}