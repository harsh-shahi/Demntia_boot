"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { PenLine, Volume2, Send, RotateCcw } from "lucide-react"
import { useTextRecall } from "@/hooks/useTextRecall"

interface DelayedRecallScreenProps {
  onNext: (score: number) => void
}

const targetWords = ["Rain", "Market", "Spoon", "Flower", "Tiger", "Window"]

export function DelayedRecallScreen({ onNext }: DelayedRecallScreenProps) {
  const [stage, setStage] = useState<"instruction" | "typing">("instruction")
  const [isProcessing, setIsProcessing] = useState(false)
  const { userInput, setUserInput, calculateScore, clearInput } = useTextRecall()

  const speak = (text: string): Promise<void> => {
    return new Promise((resolve) => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel() // Stop any current speech
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = 0.8
        utterance.lang = "en-US"
        utterance.onend = () => resolve()
        window.speechSynthesis.speak(utterance)
      } else {
        resolve()
      }
    })
  }

  useEffect(() => {
    if (stage === "instruction") {
      speak("Can you type all the words you remember from earlier? Type them in when you're ready.")
    }
  }, [stage])

  const handleSubmit = async () => {
    if (!userInput.trim()) return

    setIsProcessing(true)
    try {
      const score = calculateScore(targetWords)
      
      // Sending text data to the backend instead of audio
      await fetch("/api/verify-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          testType: "delayed-recall",
          input: userInput,
          score: score 
        }),
      })

      onNext(score)
    } catch (e) {
      console.error("Submission error:", e)
      // Fallback: move forward even if API fails
      onNext(calculateScore(targetWords))
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
              <PenLine className="w-12 h-12 text-primary" strokeWidth={2.5} />
            </div>

            <h2 className="text-3xl font-bold mb-6 text-foreground">Time to Remember!</h2>

            <p className="text-xl leading-relaxed text-foreground/90 mb-8">
              Can you type all the words you remember from earlier? 
            </p>

            <div className="space-y-4">
              <Button
                onClick={() => setStage("typing")}
                size="lg"
                className="w-full h-20 text-2xl rounded-2xl shadow-lg hover:scale-105 transition-transform"
              >
                Start Typing
              </Button>

              <Button
                onClick={() => speak("Can you type all the words you remember from earlier?")}
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
        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 text-foreground">Type the words</h2>
          <p className="text-muted-foreground mb-6">Separate words with a space or comma</p>

          <Textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type here..."
            className="min-h-[150px] text-xl p-6 rounded-2xl border-2 focus-visible:ring-primary mb-4"
            autoFocus
          />
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleSubmit}
            size="lg"
            className="w-full h-20 text-2xl rounded-2xl shadow-lg hover:scale-105 transition-transform"
            disabled={isProcessing || !userInput.trim()}
          >
            {isProcessing ? "Processing..." : (
              <>
                <Send className="w-6 h-6 mr-2" />
                Submit Answer
              </>
            )}
          </Button>

          <div className="flex gap-2">
            <Button
              onClick={clearInput}
              variant="outline"
              size="lg"
              className="flex-1 h-14 rounded-2xl"
              disabled={isProcessing}
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Clear
            </Button>
            
            <Button
              onClick={() => speak("Type the words you remember from the list.")}
              variant="ghost"
              size="lg"
              className="flex-1 h-14 rounded-2xl"
              disabled={isProcessing}
            >
              <Volume2 className="w-5 h-5 mr-2" />
              Repeat
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}