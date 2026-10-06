"use client"

import { ExternalLink, Check, MoreHorizontal, Pencil, FolderInput, GripVertical, ListChecks, Trash2 } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface TabOption {
  id: string
  name: string
}

interface LinkBoxProps {
  id: string
  title: string
  url: string
  tabId?: string
  color?: string
  size?: "small" | "medium" | "large"
  columns?: number
  tabs?: TabOption[]
  isSelectionMode?: boolean
  isSelected?: boolean
  onDelete: (id: string) => void
  onRename?: (id: string, title: string) => void
  onMove?: (id: string, tabId: string) => void
  onReorder?: () => void
  onStartSelect?: (id: string) => void
  onSelect?: (id: string) => void
}

export function LinkBox({
  id, title, url, tabId, size = "medium", tabs = [],
  isSelectionMode = false, isSelected = false,
  onDelete, onRename, onMove, onReorder, onStartSelect, onSelect,
}: LinkBoxProps) {
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const didLongPress = useRef(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const [draftTitle, setDraftTitle] = useState(title)
  const inputRef = useRef<HTMLInputElement>(null)

  const hasMenu = !!(onRename || onMove || onReorder || onStartSelect)

  useEffect(() => {
    if (isRenaming) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [isRenaming])

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

  const clearLongPress = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current)
  }

  // 터치 길게 누르기 → 링크 메뉴 열기 (마우스는 우클릭/⋯ 버튼 사용)
  const handlePointerDown = (e: React.PointerEvent) => {
    didLongPress.current = false
    if (!hasMenu || isSelectionMode || e.pointerType === "mouse") return
    longPressTimer.current = setTimeout(() => {
      didLongPress.current = true
      setIsMenuOpen(true)
    }, 450)
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

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    if (hasMenu && !isSelectionMode) setIsMenuOpen(true)
  }

  const startRename = () => {
    setDraftTitle(title)
    setIsRenaming(true)
  }

  const commitRename = () => {
    const next = draftTitle.trim()
    if (next && next !== title) onRename?.(id, next)
    setIsRenaming(false)
  }

  const favNode = (
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
  )

  if (isRenaming) {
    return (
      <div className="relative rounded-lg ring-1 ring-primary bg-card min-w-0">
        <form
          className={`flex items-center gap-2.5 ${getRowPadding()} w-full min-w-0`}
          onSubmit={(e) => {
            e.preventDefault()
            commitRename()
          }}
        >
          {favNode}
          <input
            ref={inputRef}
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === "Escape") setIsRenaming(false)
            }}
            className={`${getTextSize()} flex-1 min-w-0 bg-transparent outline-none text-foreground`}
            aria-label="링크 이름"
          />
        </form>
      </div>
    )
  }

  return (
    <div
      className={`relative group rounded-lg transition-all duration-100 select-none min-w-0
        ${isSelectionMode
          ? isSelected
            ? "bg-primary/15 ring-1 ring-primary"
            : "hover:bg-muted/40"
          : isMenuOpen
            ? "bg-muted/70"
            : "hover:bg-muted/70 active:bg-muted"
        }`}
    >
      <a
        href={isSelectionMode ? undefined : url}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex items-center gap-2.5 ${getRowPadding()} w-full min-w-0 ${hasMenu && !isSelectionMode ? "pr-7" : ""}`}
        onPointerDown={handlePointerDown}
        onPointerUp={clearLongPress}
        onPointerMove={clearLongPress}
        onPointerLeave={clearLongPress}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
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

        {favNode}

        {/* Post Style Title (2 Lines Allowed) */}
        <span
          className={`${getTextSize()} font-normal text-foreground line-clamp-2 min-w-0 flex-1 leading-snug group-hover:text-primary transition-colors`}
        >
          {title}
        </span>
      </a>

      {/* 링크 메뉴: 호버 시 ⋯ 버튼, 우클릭, 터치 길게 누르기 */}
      {hasMenu && !isSelectionMode && (
        <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen} modal={false}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-background/80 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100 transition-opacity cursor-pointer"
              aria-label={`${title} 메뉴`}
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            {onRename && (
              <DropdownMenuItem onSelect={startRename}>
                <Pencil />
                이름 변경
              </DropdownMenuItem>
            )}
            {onMove && tabs.length > 1 && (
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="gap-2 [&_svg:not([class*='size-'])]:size-4 [&_svg]:text-muted-foreground">
                  <FolderInput />
                  다른 탭으로 이동
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {tabs.map((tab) => (
                    <DropdownMenuItem
                      key={tab.id}
                      disabled={tab.id === tabId}
                      onSelect={() => onMove(id, tab.id)}
                    >
                      {tab.name}
                      {tab.id === tabId && <Check className="ml-auto" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            )}
            {onReorder && (
              <DropdownMenuItem onSelect={onReorder}>
                <GripVertical />
                순서 변경
              </DropdownMenuItem>
            )}
            {onStartSelect && (
              <DropdownMenuItem onSelect={() => onStartSelect(id)}>
                <ListChecks />
                여러 개 선택
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => {
                if (confirm(`'${title}' 링크를 삭제하시겠습니까?`)) onDelete(id)
              }}
            >
              <Trash2 />
              삭제
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}
