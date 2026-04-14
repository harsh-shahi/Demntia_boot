"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Trophy, Sparkles } from "lucide-react"

interface ScoreSummaryScreenProps {
  totalScore: number
  onNext: () => void
}

export function ScoreSummaryScreen({ totalScore, onNext }: ScoreSummaryScreenProps) {
  const maxScore = 100
  const percentage = Math.round((totalScore / maxScore) * 100)

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] animate-bounce-in">
      <Card className="w-full max-w-lg p-8 md:p-12 rounded-3xl shadow-xl border-2 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="text-center">
          <div className="relative inline-block mb-8">
            <div className="w-32 h-32 bg-primary rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <Trophy className="w-16 h-16 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <Sparkles className="w-8 h-8 text-yellow-400 absolute -top-2 -right-2 animate-bounce" />
          </div>

          <h2 className="text-4xl font-bold mb-4 text-foreground">Great Job!</h2>

          <p className="text-xl text-foreground/90 mb-8">{"You've"} completed the memory check</p>

          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-40 h-40 bg-white rounded-full border-8 border-primary shadow-lg mb-4">
              <span className="text-5xl font-bold text-primary">{percentage}%</span>
            </div>
            <p className="text-lg text-muted-foreground">
              Score: {totalScore} / {maxScore}
            </p>
          </div>

          <div className="space-y-3 mb-8 text-left">
            <div className="flex items-center gap-3 p-4 bg-white rounded-xl">
              <span className="text-3xl">🧠</span>
              <span className="text-lg">Memory tasks completed</span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white rounded-xl">
              <span className="text-3xl">🎯</span>
              <span className="text-lg">Attention tests finished</span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white rounded-xl">
              <span className="text-3xl">✨</span>
              <span className="text-lg">All exercises done</span>
            </div>
          </div>

          <Button
            onClick={onNext}
            size="lg"
            className="w-full h-20 text-2xl rounded-2xl shadow-lg hover:scale-105 transition-transform"
          >
            View Results
          </Button>
        </div>
      </Card>
    </div>
  )
}
