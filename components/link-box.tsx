"use client"

import { ExternalLink, Check } from "lucide-react"
import { useRef } from "react"

interface LinkBoxProps {
  id: string
  title: string
  url: string
  color?: string
  size?: "small" | "medium" | "large"
  columns?: number
  isSelectionMode?: boolean
  isSelected?: boolean
  onDelete: (id: string) => void
  onLongPress?: (id: string) => void
  onSelect?: (id: string) => void
}

export function LinkBox({
  id, title, url, color = "bg-card", size = "medium", columns = 3,
  isSelectionMode = false, isSelected = false,
  onDelete, onLongPress, onSelect,
}: LinkBoxProps) {
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const didLongPress = useRef(false)

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

  const handlePointerDown = () => {
    didLongPress.current = false
    longPressTimer.current = setTimeout(() => {
      didLongPress.current = true
      onLongPress?.(id)
    }, 500)
  }

  const handlePointerUp = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current)
  }

  const handlePointerMove = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current)
  }

  const handleClick = (e: React.MouseEvent) => {
    if (isSelectionMode) {
      e.preventDefault()
      onSelect?.(id)
      return
    }
    if (didLongPress.current) {
      e.preventDefault()
    }
  }

  return (
    <div
      className={`relative aspect-square ${color} rounded-xl border transition-all duration-200 overflow-hidden
        ${isSelectionMode
          ? isSelected
            ? "border-primary scale-[0.96] ring-2 ring-primary"
            : "border-border scale-[0.96]"
          : "border-border hover:scale-[1.02] hover:border-primary/50 group"
        }`}
    >
      <a
        href={isSelectionMode ? undefined : url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col items-center justify-center h-full p-2 sm:p-3 gap-1.5 sm:gap-2 select-none"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerUp}
        onClick={handleClick}
        onContextMenu={(e) => e.preventDefault()}
        draggable={false}
      >
        {favicon ? (
          <img
            src={favicon}
            alt=""
            className={`${getIconSize()} rounded-md object-contain`}
            referrerPolicy="no-referrer"
          />
        ) : (
          <ExternalLink className={`${getIconSize()} text-muted-foreground`} />
        )}
        <span className={`${getTextSize()} font-medium text-foreground text-center line-clamp-2 px-1`}>
          {title}
        </span>
      </a>

      {isSelectionMode && (
        <div className={`absolute top-1.5 right-1.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
          ${isSelected ? "bg-primary border-primary" : "bg-background/80 border-muted-foreground/50"}`}>
          {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
        </div>
      )}
    </div>
  )
}
