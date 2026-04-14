import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type")

    if (contentType?.includes("application/json")) {
      // Handle text-based input (like object naming)
      const body = await request.json()
      console.log("[v0] Received text for verification:", body)

      // Mock response for text verification
      await new Promise((resolve) => setTimeout(resolve, 300))

      return NextResponse.json({
        success: true,
        isCorrect: true,
        message: "Text received successfully",
      })
    } else {
      // Handle audio FormData
      const formData = await request.formData()
      const audio = formData.get("audio") as Blob | null
      const testType = formData.get("testType") as string

      if (!audio || audio.size === 0) {
        console.error("[v0] No audio data received")
        return NextResponse.json({ success: false, error: "No audio data provided" }, { status: 400 })
      }

      console.log("[v0] Received audio for backend processing:", { testType, size: audio.size })

      // Mock response that always returns success/correct for now
      await new Promise((resolve) => setTimeout(resolve, 500))

      return NextResponse.json({
        success: true,
        correct: true,
        score: 5,
        message: "Audio received successfully",
      })
    }
  } catch (error) {
    console.error("[v0] Audio verification error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to process audio" },
      { status: 500 },
    )
  }
}
