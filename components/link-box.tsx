"use client"

import { ExternalLink, Trash2 } from "lucide-react"
import { useState } from "react"

interface LinkBoxProps {
  id: string
  title: string
  url: string
  color?: string
  size?: "small" | "medium" | "large"
  columns?: number
  onDelete: (id: string) => void
}

export function LinkBox({ id, title, url, color = "bg-card", size = "medium", columns = 3, onDelete }: LinkBoxProps) {
  const [faviconError, setFaviconError] = useState(false)

  const getFaviconUrl = (siteUrl: string) => {
    try {
      const domain = new URL(siteUrl).hostname
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
    } catch {
      return null
    }
  }

  const favicon = getFaviconUrl(url)

  const getIconSize = () => {
    if (columns >= 5) {
      return { small: "w-5 h-5 sm:w-6 sm:h-6", medium: "w-6 h-6 sm:w-7 sm:h-7", large: "w-7 h-7 sm:w-8 sm:h-8" }[size] ?? "w-6 h-6 sm:w-7 sm:h-7"
    }
    if (columns === 4) {
      return { small: "w-5 h-5 sm:w-6 sm:h-6", medium: "w-7 h-7 sm:w-8 sm:h-8", large: "w-8 h-8 sm:w-10 sm:h-10" }[size] ?? "w-7 h-7 sm:w-8 sm:h-8"
    }
    return { small: "w-6 h-6 sm:w-7 sm:h-7", medium: "w-8 h-8 sm:w-10 sm:h-10", large: "w-10 h-10 sm:w-12 sm:h-12" }[size] ?? "w-8 h-8 sm:w-10 sm:h-10"
  }

  const getTextSize = () => {
    if (columns >= 5) {
      return { small: "text-[8px] sm:text-[10px]", medium: "text-[9px] sm:text-[11px]", large: "text-[10px] sm:text-xs" }[size] ?? "text-[9px] sm:text-[11px]"
    }
    if (columns === 4) {
      return { small: "text-[9px] sm:text-[10px]", medium: "text-[10px] sm:text-xs", large: "text-xs sm:text-sm" }[size] ?? "text-[10px] sm:text-xs"
    }
    return { small: "text-[10px] sm:text-xs", medium: "text-xs sm:text-sm", large: "text-sm sm:text-base" }[size] ?? "text-xs sm:text-sm"
  }

  return (
    <div
      className={`relative aspect-square ${color} rounded-xl border border-border overflow-hidden transition-all duration-200 hover:scale-[1.02] hover:border-primary/50 group`}
    >
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col items-center justify-center h-full p-2 sm:p-3 gap-1.5 sm:gap-2"
      >
        {favicon && !faviconError ? (
          <img
            src={favicon}
            alt=""
            className={`${getIconSize()} rounded-md object-contain`}
            onError={() => setFaviconError(true)}
            referrerPolicy="no-referrer"
          />
        ) : (
          <ExternalLink className={`${getIconSize()} text-muted-foreground`} />
        )}
        <span className={`${getTextSize()} font-medium text-foreground text-center line-clamp-2 px-1`}>
          {title}
        </span>
      </a>

      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onDelete(id)
        }}
        className={`absolute top-1.5 right-1.5 sm:top-2 sm:right-2 p-1 sm:p-1.5 rounded-md bg-destructive/90 text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-destructive`}
        aria-label="삭제"
      >
        <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
      </button>
    </div>
  )
}
