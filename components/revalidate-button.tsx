"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

interface RevalidateButtonProps {
  tag: string
}

export function RevalidateButton({ tag }: RevalidateButtonProps) {
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle")

  async function handleRevalidate() {
    setStatus("loading")
    try {
      const res = await fetch(`/api/revalidate?tag=${tag}`)
      const data = await res.json()
      if (data.revalidated) {
        setStatus("success")
        setTimeout(() => setStatus("idle"), 2000)
      } else {
        setStatus("error")
        setTimeout(() => setStatus("idle"), 3000)
      }
    } catch {
      setStatus("error")
      setTimeout(() => setStatus("idle"), 3000)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={handleRevalidate}
        disabled={status === "loading"}
        variant={status === "success" ? "outline" : "default"}
        className="gap-2"
      >
        <RefreshCw
          className={`size-4 ${status === "loading" ? "animate-spin" : ""}`}
        />
        {status === "idle" && "Revalidate now"}
        {status === "loading" && "Revalidating..."}
        {status === "success" && "Revalidated! Refresh the page."}
        {status === "error" && "Error. Try again."}
      </Button>
      {status === "success" && (
        <p className="text-xs text-muted-foreground">
          The cache has been purged. Refresh this page to see fresh data.
        </p>
      )}
    </div>
  )
}
