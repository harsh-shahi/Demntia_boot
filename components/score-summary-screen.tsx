"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Trophy, Sparkles, Brain, Target, CheckCircle2 } from "lucide-react"
import { assessmentStorage } from "@/lib/assessment-storage"

interface ScoreSummaryScreenProps {
  totalScore: number
  onNext: () => void
}

export function ScoreSummaryScreen({ onNext }: ScoreSummaryScreenProps) {
  const [totalScore, setTotalScore] = useState(0)
  const maxScore = 30

  useEffect(() => {
    // Pull the final compiled marks from LocalStorage
    const savedData = assessmentStorage.get()
    setTotalScore(Math.round(savedData.totalScore))
  }, [])

  const percentage = Math.min(30, Math.round((totalScore / maxScore) * 100))

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] animate-slide-up p-4">
      <Card className="w-full max-w-lg p-8 md:p-12 rounded-3xl shadow-xl border-2 bg-gradient-to-br from-primary/5 to-secondary/5 relative overflow-hidden">
        {/* Background Decorative Sparkles */}
        <Sparkles className="w-12 h-12 text-primary/10 absolute -top-2 -left-2 rotate-12" />
        
        <div className="text-center relative z-10">
          <div className="relative inline-block mb-8">
            <div className="w-32 h-32 bg-primary rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <Trophy className="w-16 h-16 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <div className="absolute -top-2 -right-2 bg-yellow-400 p-2 rounded-full shadow-md animate-bounce">
               <Sparkles className="w-5 h-5 text-white" />
            </div>
          </div>

          <h2 className="text-4xl font-bold mb-2 text-foreground">Great Job!</h2>
          <p className="text-xl text-muted-foreground mb-10">You've completed the assessment</p>

          <div className="mb-10 relative inline-flex items-center justify-center">
            {/* Circular Progress Display */}
            <div className="w-44 h-44 bg-white rounded-full border-[10px] border-primary/10 flex flex-col items-center justify-center shadow-inner relative">
                <div 
                    className="absolute inset-0 rounded-full border-[10px] border-primary border-t-transparent -rotate-45"
                    style={{ clipPath: `polygon(0 0, 100% 0, 100% ${percentage}%, 0 ${percentage}%)` }} // Simple visual fill
                />
              <span className="text-5xl font-black text-primary">{percentage}%</span>
              <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest mt-1">Score</span>
            </div>
          </div>

          <div className="space-y-3 mb-10 text-left">
            <div className="flex items-center gap-4 p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-primary/5">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-lg font-medium text-foreground/80">Memory tasks completed</span>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-primary/5">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-lg font-medium text-foreground/80">Attention tests finished</span>
            </div>

            <div className="flex items-center gap-4 p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-primary/5">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-lg font-medium text-foreground/80">All exercises validated</span>
            </div>
          </div>

          <Button
            onClick={onNext}
            size="lg"
            className="w-full h-20 text-2xl rounded-2xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all group"
          >
            View Detailed Results
            <Trophy className="w-6 h-6 ml-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Button>

          <p className="mt-6 text-muted-foreground font-medium italic">
            Final Score: {totalScore} / {maxScore}
          </p>
        </div>
      </Card>
    </div>
  )
}