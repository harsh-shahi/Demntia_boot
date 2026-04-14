"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle2, Volume2 } from "lucide-react"
import { useEffect, useState } from "react"

interface ConsentScreenProps {
  onNext: () => void
}

export function ConsentScreen({ onNext }: ConsentScreenProps) {
  const [isMounted, setIsMounted] = useState(true)

  useEffect(() => {
    return () => {
      setIsMounted(false)
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  const consentText =
    "Before we begin. This memory check will ask you some simple questions. Your answers are completely private. You can stop at any time. There are no wrong answers. Please click I Agree to start."

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isMounted) {
        speak(consentText)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [isMounted])

  const speak = (text: string) => {
    if (typeof window !== "undefined" && window.speechSynthesis && isMounted) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.85
      utterance.pitch = 1
      window.speechSynthesis.speak(utterance)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] animate-slide-up">
      <Card className="w-full max-w-lg p-8 md:p-12 rounded-3xl shadow-xl border-2">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-2xl mb-6">
            <CheckCircle2 className="w-12 h-12 text-primary" strokeWidth={2.5} />
          </div>

          <h2 className="text-3xl font-bold mb-6 text-foreground">Before We Begin</h2>

          <div className="space-y-4 text-xl text-left leading-relaxed text-foreground/90">
            <p>✓ This memory check will ask you some simple questions</p>
            <p>✓ Your answers are completely private</p>
            <p>✓ You can stop at any time</p>
            <p>✓ There are no wrong answers</p>
          </div>
        </div>

        <div className="space-y-4">
          <Button
            onClick={onNext}
            size="lg"
            className="w-full h-20 text-2xl rounded-2xl shadow-lg hover:scale-105 transition-transform"
          >
            I Agree - {"Let's"} Start
          </Button>

          <Button
            onClick={() => speak(consentText)}
            variant="outline"
            size="lg"
            className="w-full h-16 text-lg rounded-2xl"
          >
            <Volume2 className="w-6 h-6 mr-2" />
            Listen Again
          </Button>
        </div>
      </Card>
    </div>
  )
}
