"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Heart, FileText, RotateCcw, BarChart3 } from "lucide-react"
import { assessmentStorage, type AssessmentData } from "@/lib/assessment-storage"

interface RecommendationScreenProps {
  onRestart: () => void
}

export function RecommendationScreen({ onRestart }: RecommendationScreenProps) {
  const [results, setResults] = useState<AssessmentData | null>(null)

  useEffect(() => {
    // Pull the final compiled data from LocalStorage
    const savedData = assessmentStorage.get()
    setResults(savedData)
  }, [])

  if (!results) return null

  const totalScore = Math.round(results.totalScore)
  
  let interpretation = ""
  let recommendation = ""
  let bgColor = "from-primary/5 to-secondary/5"
  let statusColor = "text-primary"

  // Scoring Logic based on a 100-point scale
  if (totalScore >= 80) {
    interpretation = "Normal Cognitive Function"
    recommendation = "Your results look great! Keep staying active mentally and physically."
    bgColor = "from-green-50 to-emerald-50"
    statusColor = "text-green-600"
  } else if (totalScore >= 60) {
    interpretation = "Mild Cognitive Concerns"
    recommendation = "Consider discussing these results with your doctor for a comprehensive evaluation."
    bgColor = "from-yellow-50 to-orange-50"
    statusColor = "text-yellow-600"
  } else {
    interpretation = "Further Evaluation Suggested"
    recommendation = "We recommend scheduling an appointment with a healthcare professional for a full clinical assessment."
    bgColor = "from-orange-50 to-red-50"
    statusColor = "text-red-600"
  }

  const handleRestart = () => {
    assessmentStorage.clear() // Wipe the scores for a fresh start
    onRestart()
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 animate-slide-up">
      <Card className={`w-full max-w-lg p-8 md:p-12 rounded-3xl shadow-xl border-2 bg-gradient-to-br ${bgColor} transition-colors duration-1000`}>
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl mb-6 shadow-sm">
            <Heart className={`w-12 h-12 ${statusColor}`} strokeWidth={2.5} />
          </div>

          <h2 className="text-3xl font-bold mb-4 text-foreground">Assessment Complete</h2>

          {/* Main Score Display */}
          <div className="mb-6 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border">
            <p className={`text-2xl font-black mb-1 ${statusColor}`}>{interpretation}</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-4xl font-bold text-foreground">{totalScore}</span>
              <span className="text-xl text-muted-foreground font-medium">/ 100</span>
            </div>
          </div>

          {/* Breakdown Section */}
          <div className="mb-8 p-6 bg-white/50 rounded-2xl text-left border border-dashed border-foreground/10">
            <h3 className="flex items-center font-bold text-sm uppercase tracking-wider mb-4 text-foreground/70">
              <BarChart3 className="w-4 h-4 mr-2" />
              Performance Breakdown
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-foreground/80">Memory & Recall</span>
                <span className="font-bold">{results.breakdown.delayedRecall} pts</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground/80">Attention (Digits)</span>
                <span className="font-bold">{results.breakdown.digitSpan} pts</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground/80">Orientation & Language</span>
                <span className="font-bold">{results.breakdown.orientation} pts</span>
              </div>
            </div>
          </div>

          <div className="mb-8 p-6 bg-primary text-primary-foreground rounded-2xl text-left shadow-md">
            <h3 className="font-bold text-lg mb-2">Recommendation:</h3>
            <p className="leading-relaxed opacity-90">{recommendation}</p>
          </div>

          <div className="space-y-4">
            <Button
              size="lg"
              className="w-full h-16 text-xl rounded-2xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
            >
              <FileText className="w-6 h-6 mr-2" />
              Download Full Report
            </Button>

            <Button
              onClick={handleRestart}
              variant="outline"
              size="lg"
              className="w-full h-14 text-lg rounded-2xl bg-white/50 border-foreground/10 hover:bg-white transition-all"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Retake Assessment
            </Button>
          </div>

          <p className="text-[12px] text-foreground/50 mt-8 leading-tight italic">
            Notice: This screening is for informational purposes only and does not constitute a medical diagnosis.
          </p>
        </div>
      </Card>
    </div>
  )
}