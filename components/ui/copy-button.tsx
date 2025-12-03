"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"

interface CopyButtonProps {
  textToCopy: string
  feedbackDuration?: number
  className?: string
  tooltip?: string
}

export function CopyButton({ 
  textToCopy, 
  feedbackDuration = 2000,
  className = "",
  tooltip = "Copy to clipboard"
}: CopyButtonProps) {
  const [isCopied, setIsCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), feedbackDuration)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCopy}
      className={`h-8 w-8 p-0 hover:bg-primary/10 ${className}`}
      title={tooltip}
      disabled={isCopied}
    >
      {isCopied ? (
        <Check className="w-4 h-4 text-emerald-500" />
      ) : (
        <Copy className="w-4 h-4" />
      )}
    </Button>
  )
}
