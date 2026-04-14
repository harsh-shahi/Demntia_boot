"use client"

import type React from "react"
import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Pencil, Eraser, Volume2, CheckCircle2 } from "lucide-react"
import { assessmentStorage } from "@/lib/assessment-storage"

interface DrawingScreenProps {
  onNext: (score: number) => void
}

export function DrawingScreen({ onNext }: DrawingScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasDrawn, setHasDrawn] = useState(false)
  const isMounted = useRef(true)

  const speak = (text: string) => {
    if ("speechSynthesis" in window && isMounted.current) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.8
      window.speechSynthesis.speak(utterance)
    }
  }

  // Draw the reference dotted shape
  const drawReference = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = "#e2e8f0"
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])
    
    // Diamond
    ctx.beginPath()
    ctx.moveTo(150, 50)
    ctx.lineTo(250, 150)
    ctx.lineTo(150, 250)
    ctx.lineTo(50, 150)
    ctx.closePath()
    ctx.stroke()

    // Cross lines
    ctx.moveTo(50, 150); ctx.lineTo(250, 150); ctx.stroke()
    ctx.moveTo(150, 50); ctx.lineTo(150, 250); ctx.stroke()
    
    ctx.setLineDash([]) // Reset for user drawing
  }

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (ctx) drawReference(ctx)
    
    return () => { isMounted.current = false }
  }, [])

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    setIsDrawing(true)
    setHasDrawn(true)
    ctx.strokeStyle = "#3b82f6" // Primary Blue
    ctx.lineWidth = 4
    ctx.lineCap = "round"
    ctx.lineJoin = "round"

    const x = "touches" in e ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left
    const y = "touches" in e ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top

    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    const rect = canvas?.getBoundingClientRect()
    const ctx = canvas?.getContext("2d")
    if (!ctx || !rect) return

    const x = "touches" in e ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left
    const y = "touches" in e ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top

    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const calculateScore = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!ctx || !canvas) return 0

    /**
     * MARKING LOGIC:
     * We check specific key points on the diamond/cross.
     * If the user painted those pixels (blue), they get points.
     */
    const keyPoints = [
      {x: 150, y: 50}, {x: 250, y: 150}, {x: 150, y: 250}, {x: 50, y: 150}, // Corners
      {x: 150, y: 150}, {x: 100, y: 100}, {x: 200, y: 200} // Center and mid-lines
    ]
    
    let hits = 0
    keyPoints.forEach(p => {
      const pixel = ctx.getImageData(p.x, p.y, 1, 1).data
      // If the pixel has blue component (user's color)
      if (pixel[2] > 200) hits++
    })

    const ratio = hits / keyPoints.length
    if (ratio > 0.8) return 5
    if (ratio > 0.5) return 3
    if (ratio > 0.2) return 1
    return 0
  }

  const handleFinish = () => {
    const finalScore = calculateScore()
    assessmentStorage.saveScore("orientation", finalScore)
    onNext(finalScore)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      drawReference(ctx)
      setHasDrawn(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] animate-slide-up p-4">
      <Card className="w-full max-w-lg p-8 md:p-12 rounded-3xl shadow-xl border-2">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-2xl mb-6">
            <Pencil className="w-12 h-12 text-primary" strokeWidth={2.5} />
          </div>
          <h2 className="text-3xl font-bold mb-2">Visuospatial Test</h2>
          <p className="text-muted-foreground mb-6">Carefully trace and complete the shape below</p>
        </div>

        <div className="mb-8 flex justify-center">
          <canvas
            ref={canvasRef}
            width={300}
            height={300}
            className="bg-white border-4 border-muted rounded-3xl cursor-crosshair touch-none shadow-inner"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={() => setIsDrawing(false)}
            onMouseLeave={() => setIsDrawing(false)}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={() => setIsDrawing(false)}
          />
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleFinish}
            size="lg"
            className="w-full h-20 text-2xl rounded-2xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
            disabled={!hasDrawn}
          >
            <CheckCircle2 className="w-6 h-6 mr-3" />
            Finish Drawing
          </Button>

          <div className="grid grid-cols-2 gap-4">
            <Button onClick={clearCanvas} variant="outline" className="h-14 rounded-2xl border-2">
              <Eraser className="w-5 h-5 mr-2" /> Clear
            </Button>
            <Button onClick={() => speak("Trace the shape carefully")} variant="ghost" className="h-14 rounded-2xl text-muted-foreground">
              <Volume2 className="w-5 h-5 mr-2" /> Help
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}