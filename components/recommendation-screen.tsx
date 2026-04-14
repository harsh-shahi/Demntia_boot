"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Heart, FileText, RotateCcw } from "lucide-react"

interface RecommendationScreenProps {
  totalScore: number
  onRestart: () => void
}

export function RecommendationScreen({ totalScore, onRestart }: RecommendationScreenProps) {
  let interpretation = ""
  let recommendation = ""
  let bgColor = "from-primary/5 to-secondary/5"

  if (totalScore >= 80) {
    interpretation = "Normal Cognitive Function"
    recommendation = "Your results look great! Keep staying active mentally and physically."
    bgColor = "from-green-50 to-emerald-50"
  } else if (totalScore >= 60) {
    interpretation = "Mild Cognitive Concerns"
    recommendation = "Consider discussing these results with your doctor for a comprehensive evaluation."
    bgColor = "from-yellow-50 to-orange-50"
  } else {
    interpretation = "Possible Early Impairment"
    recommendation = "We recommend scheduling an appointment with a healthcare professional for further assessment."
    bgColor = "from-orange-50 to-red-50"
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] animate-slide-up">
      <Card className={`w-full max-w-lg p-8 md:p-12 rounded-3xl shadow-xl border-2 bg-gradient-to-br ${bgColor}`}>
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-2xl mb-6">
            <Heart className="w-12 h-12 text-primary-foreground" strokeWidth={2.5} />
          </div>

          <h2 className="text-3xl font-bold mb-4 text-foreground">Your Results</h2>

          <div className="mb-6 p-6 bg-white rounded-2xl">
            <p className="text-2xl font-bold text-primary mb-2">{interpretation}</p>
            <p className="text-lg text-foreground/90">Score: {totalScore} / 100</p>
          </div>

          <div className="mb-8 p-6 bg-white rounded-2xl text-left">
            <h3 className="font-bold text-lg mb-3 text-foreground">Recommendation:</h3>
            <p className="text-lg leading-relaxed text-foreground/90">{recommendation}</p>
          </div>

          <div className="space-y-4">
            <Button
              size="lg"
              className="w-full h-20 text-xl rounded-2xl shadow-lg hover:scale-105 transition-transform"
            >
              <FileText className="w-6 h-6 mr-2" />
              Save Report
            </Button>

            <Button
              onClick={onRestart}
              variant="outline"
              size="lg"
              className="w-full h-16 text-lg rounded-2xl bg-transparent"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Take Test Again
            </Button>
          </div>

          <p className="text-sm text-foreground/70 mt-6 leading-relaxed">
            This screening tool is not a diagnosis. Please consult with a healthcare professional for a complete
            evaluation.
          </p>
        </div>
      </Card>
    </div>
  )
}
