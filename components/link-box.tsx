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
  id, title, url, size = "medium",
  isSelectionMode = false, isSelected = false,
  onLongPress, onSelect,
}: LinkBoxProps) {
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const didLongPress = useRef(false)

  const getFaviconUrl = (siteUrl: string) => {
    try {
      const domain = new URL(siteUrl).hostname
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
    } catch {
      return null
    }
  }

  const favicon = getFaviconUrl(url)

  const getRowPadding = () => {
    return {
      small: "py-1 px-2.5",
      medium: "py-1.5 px-3",
      large: "py-2 px-3.5",
    }[size] ?? "py-1.5 px-3"
  }

  const getFaviconSize = () => {
    return {
      small: "w-4 h-4",
      medium: "w-5 h-5",
      large: "w-6 h-6",
    }[size] ?? "w-5 h-5"
  }

  const getTextSize = () => {
    return {
      small: "text-xs sm:text-[13px]",
      medium: "text-[13px] sm:text-sm md:text-[14px]",
      large: "text-sm sm:text-base",
    }[size] ?? "text-[13px] sm:text-sm"
  }

  const handlePointerDown = () => {
    didLongPress.current = false
    longPressTimer.current = setTimeout(() => {
      didLongPress.current = true
      onLongPress?.(id)
    }, 300)
  }

  const handlePointerUp = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current)
  }

  const handlePointerMove = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current)
  }

  const handleClick = (e: React.MouseEvent) => {
    if (didLongPress.current) {
      e.preventDefault()
      didLongPress.current = false
      return
    }
    if (isSelectionMode) {
      e.preventDefault()
      onSelect?.(id)
    }
  }

  return (
    <div
      className={`relative group rounded-lg transition-all duration-100 select-none min-w-0
        ${isSelectionMode
          ? isSelected
            ? "bg-primary/15 ring-1 ring-primary"
            : "hover:bg-muted/40"
          : "hover:bg-muted/70 active:bg-muted"
        }`}
    >
      <a
        href={isSelectionMode ? undefined : url}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex items-center gap-2.5 ${getRowPadding()} w-full min-w-0`}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerUp}
        onClick={handleClick}
        onContextMenu={(e) => e.preventDefault()}
        draggable={false}
      >
        {/* Selection Checkbox */}
        {isSelectionMode && (
          <div
            className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors
              ${isSelected ? "bg-primary border-primary" : "border-muted-foreground/40 bg-background"}`}
          >
            {isSelected && <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />}
          </div>
        )}

        {/* Favicon */}
        <div className="shrink-0 flex items-center justify-center">
          {favicon ? (
            <img
              src={favicon}
              alt=""
              className={`${getFaviconSize()} rounded-xs object-contain`}
              referrerPolicy="no-referrer"
            />
          ) : (
            <ExternalLink className={`${getFaviconSize()} text-muted-foreground`} />
          )}
        </div>

        {/* Post Style Title (2 Lines Allowed) */}
        <span
          className={`${getTextSize()} font-normal text-foreground line-clamp-2 min-w-0 flex-1 leading-snug group-hover:text-primary transition-colors`}
        >
          {title}
        </span>
      </a>
    </div>
  )
}
