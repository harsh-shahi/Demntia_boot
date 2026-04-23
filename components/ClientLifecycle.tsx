"use client"

import { useEffect } from "react"

export function ClientLifecycle() {
  useEffect(() => {
    // 1. REFRESH WARNING (The Fast Fix)
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Only warn if the user is logged in (has a hash)
      const hasSession = localStorage.getItem("userHashId")
      if (hasSession) {
        e.preventDefault()
        e.returnValue = "" 
        return ""
      }
    }

    // 2. SESSION RECOVERY (Prevent annoying logouts)
    // This ensures that even if they DO refresh, we grab their data 
    // and put it in sessionStorage immediately before the app renders.
    const savedHash = localStorage.getItem("userHashId")
    const savedName = localStorage.getItem("userName")
    if (savedHash) sessionStorage.setItem("userHashId", savedHash)
    if (savedName) sessionStorage.setItem("userName", savedName)

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [])

  return null // This component is invisible
}