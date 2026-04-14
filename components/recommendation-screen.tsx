"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Heart, FileText, RotateCcw, BarChart3, History, Timer, Trophy } from "lucide-react"
import { assessmentStorage, type AssessmentData } from "@/lib/assessment-storage"

interface RecommendationScreenProps {
  totalScore: number
  onRestart: () => void
}

export function RecommendationScreen({ onRestart }: RecommendationScreenProps) {
  const [results, setResults] = useState<AssessmentData | null>(null)
  const [history, setHistory] = useState<any[]>([])
  const [loadingHistory, setLoadingHistory] = useState(true)

  useEffect(() => {
    // 1. Pull current results
    const savedData = assessmentStorage.get()
    setResults(savedData)

    // 2. Fetch history from backend
    const hashId = localStorage.getItem("userHashId")
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"

    if (hashId && hashId !== "guest_mode") {
      fetch(`${baseUrl}/user/${hashId}`)
        .then((res) => res.json())
        .then((data) => {
          // Sort history by sessionId (newest first)
          const sortedSessions = (data.sessions || []).sort((a: any, b: any) => 
            b.sessionId.localeCompare(a.sessionId)
          )
          setHistory(sortedSessions)
        })
        .catch((err) => console.error("History fetch failed", err))
        .finally(() => setLoadingHistory(false))
    } else {
      setLoadingHistory(false)
    }
  }, [])

  if (!results) return null

  const totalScore = Math.round(results.totalScore)
  let interpretation = ""
  let recommendation = ""
  let bgColor = "from-primary/5 to-secondary/5"
  let statusColor = "text-primary"

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
    recommendation = "We recommend scheduling an appointment with a healthcare professional for a full assessment."
    bgColor = "from-orange-50 to-red-50"
    statusColor = "text-red-600"
  }

  const handleRestart = () => {
    assessmentStorage.clear()
    onRestart()
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 animate-slide-up space-y-6">
      <Card className={`w-full max-w-lg p-8 md:p-12 rounded-3xl shadow-xl border-2 bg-gradient-to-br ${bgColor} transition-colors duration-1000`}>
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl mb-6 shadow-sm">
            <Heart className={`w-12 h-12 ${statusColor}`} strokeWidth={2.5} />
          </div>

          <h2 className="text-3xl font-bold mb-4 text-foreground">Assessment Complete</h2>

          <div className="mb-6 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border">
            <p className={`text-2xl font-black mb-1 ${statusColor}`}>{interpretation}</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-4xl font-bold text-foreground">{totalScore}</span>
              <span className="text-xl text-muted-foreground font-medium">/ 100</span>
            </div>
          </div>

          {/* Performance Breakdown */}
          <div className="mb-6 p-6 bg-white/50 rounded-2xl text-left border border-dashed border-foreground/10">
            <h3 className="flex items-center font-bold text-sm uppercase tracking-wider mb-4 text-foreground/70">
              <BarChart3 className="w-4 h-4 mr-2" />
              Performance Breakdown
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-foreground/80">Memory & Recall</span>
                <span className="font-bold">{results.breakdown.recall} pts</span>
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

          {/* History Section */}
          <div className="mb-8 text-left">
            <h3 className="flex items-center font-bold text-sm uppercase tracking-wider mb-4 text-foreground/70">
              <History className="w-4 h-4 mr-2" />
              Recent History
            </h3>
            <div className="max-h-48 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              {loadingHistory ? (
                <p className="text-sm text-center text-muted-foreground">Loading history...</p>
              ) : history.length > 0 ? (
                history.map((sess, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-white/40 rounded-xl border border-white/60">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <Trophy className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">{sess.score}/100</p>
                        <p className="text-[10px] text-muted-foreground uppercase">{sess.data.testType}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium flex items-center justify-end gap-1">
                        <Timer className="w-3 h-3" /> {sess.data.timeTaken}s
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(parseInt(sess.sessionId.split('_')[1])).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm italic text-muted-foreground text-center">No previous sessions recorded.</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <Button
              onClick={handleRestart}
              className="w-full h-16 text-xl rounded-2xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
            >
              <RotateCcw className="w-6 h-6 mr-2" />
              Retake Assessment
            </Button>
            
            <p className="text-[10px] text-foreground/50 leading-tight italic">
              This screening is for informational purposes only and does not constitute a medical diagnosis.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}