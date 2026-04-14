"use client"

import { Button } from "@/components/ui/button"
import { Brain, Sparkles, Volume2 } from "lucide-react"
import { useEffect, useState } from "react"

interface WelcomeScreenProps {
  onNext: () => void
}

export function WelcomeScreen({ onNext }: WelcomeScreenProps) {
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
        speak(
          "Welcome! Let's check your memory! This is a friendly test to help understand how your mind is doing today.",
        )
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [isMounted])

  const speak = (text: string) => {
    if (typeof window !== "undefined" && window.speechSynthesis && isMounted) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1
      window.speechSynthesis.speak(utterance)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center animate-bounce-in">
      <div className="relative mb-8">
        <div className="w-32 h-32 bg-primary rounded-3xl flex items-center justify-center shadow-lg relative animate-pulse">
          <Brain className="w-16 h-16 text-primary-foreground" strokeWidth={2.5} />
          <Sparkles className="w-6 h-6 text-yellow-400 absolute -top-2 -right-2 animate-bounce" />
        </div>
      </div>

      <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">{"Let's check your memory!"}</h1>

      <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-md leading-relaxed">
        This is a friendly test to help understand how your mind is doing today.
      </p>

      <div className="space-y-4">
        <Button
          onClick={onNext}
          size="lg"
          className="h-20 text-2xl px-12 rounded-2xl shadow-lg hover:scale-105 transition-transform"
        >
          Start Your Check
        </Button>

        <Button
          onClick={() =>
            speak(
              "Welcome! Let's check your memory! This is a friendly test to help understand how your mind is doing today.",
            )
          }
          variant="outline"
          size="lg"
          className="h-16 text-lg px-8 rounded-2xl ml-4"
        >
          <Volume2 className="w-6 h-6 mr-2" />
          Listen Again
        </Button>
      </div>

      <p className="text-sm text-muted-foreground mt-8">Takes about 15 minutes • Completely private</p>
    </div>
  )
}
