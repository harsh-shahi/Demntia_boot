"use client"

import type React from "react"

import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Pencil, Eraser, Volume2 } from "lucide-react"

interface DrawingScreenProps {
  onNext: (score: number) => void
}

export function DrawingScreen({ onNext }: DrawingScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasDrawn, setHasDrawn] = useState(false)

  const speak = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.8
      window.speechSynthesis.speak(utterance)
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Draw reference shape (diamond with cross)
    ctx.strokeStyle = "#ddd"
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])

    ctx.beginPath()
    ctx.moveTo(150, 50)
    ctx.lineTo(250, 150)
    ctx.lineTo(150, 250)
    ctx.lineTo(50, 150)
    ctx.closePath()
    ctx.stroke()

    ctx.moveTo(50, 150)
    ctx.lineTo(250, 150)
    ctx.stroke()

    ctx.moveTo(150, 50)
    ctx.lineTo(150, 250)
    ctx.stroke()

    ctx.setLineDash([])
  }, [])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    setIsDrawing(true)
    setHasDrawn(true)

    ctx.strokeStyle = "#38C776"
    ctx.lineWidth = 4
    ctx.lineCap = "round"

    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top

    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top

    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasDrawn(false)

    // Redraw reference
    ctx.strokeStyle = "#ddd"
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])

    ctx.beginPath()
    ctx.moveTo(150, 50)
    ctx.lineTo(250, 150)
    ctx.lineTo(150, 250)
    ctx.lineTo(50, 150)
    ctx.closePath()
    ctx.stroke()

    ctx.moveTo(50, 150)
    ctx.lineTo(250, 150)
    ctx.stroke()

    ctx.moveTo(150, 50)
    ctx.lineTo(150, 250)
    ctx.stroke()

    ctx.setLineDash([])
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] animate-slide-up">
      <Card className="w-full max-w-lg p-8 md:p-12 rounded-3xl shadow-xl border-2">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-secondary/20 rounded-2xl mb-6">
            <Pencil className="w-12 h-12 text-primary" strokeWidth={2.5} />
          </div>

          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">Draw the Shape</h2>

          <p className="text-lg text-foreground/90 mb-6">Copy the dotted shape by drawing on the canvas</p>
        </div>

        <div className="mb-6 bg-white rounded-2xl p-4 border-2 border-border">
          <canvas
            ref={canvasRef}
            width={300}
            height={300}
            className="border-2 border-dashed border-gray-300 rounded-xl cursor-crosshair touch-none"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>

        <div className="space-y-4">
          <Button
            onClick={() => onNext(5)}
            size="lg"
            className="w-full h-20 text-2xl rounded-2xl shadow-lg hover:scale-105 transition-transform"
            disabled={!hasDrawn}
          >
            Done Drawing
          </Button>

          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={clearCanvas}
              variant="outline"
              size="lg"
              className="h-16 text-lg rounded-2xl bg-transparent"
            >
              <Eraser className="w-5 h-5 mr-2" />
              Clear
            </Button>

            <Button
              onClick={() => speak("Copy the dotted shape by drawing on the canvas")}
              variant="outline"
              size="lg"
              className="h-16 text-lg rounded-2xl"
            >
              <Volume2 className="w-5 h-5 mr-2" />
              Help
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
