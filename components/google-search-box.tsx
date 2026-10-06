"use client"

import { Search, X, Sparkles } from "lucide-react"
import { useRef, useState } from "react"

export function GoogleSearchBox() {
  const [query, setQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    window.open(`https://www.google.com/search?q=${encodeURIComponent(q)}`, "_blank", "noopener,noreferrer")
  }

  // Google AI 모드 (udm=50). 검색어가 없으면 AI 모드 첫 화면으로 이동
  const handleAiSearch = () => {
    const q = query.trim()
    const url = q
      ? `https://www.google.com/search?udm=50&q=${encodeURIComponent(q)}`
      : "https://www.google.com/search?udm=50"
    window.open(url, "_blank", "noopener,noreferrer")
  }

  const handleClear = () => {
    setQuery("")
    inputRef.current?.focus()
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 h-[42vh] min-h-[200px] sm:h-36 md:h-40 bg-card/40 backdrop-blur-xs rounded-2xl sm:rounded-3xl border border-border shadow-xs mb-2 sm:mb-4">
      <span className="text-3xl sm:text-4xl font-semibold tracking-tight select-none">
        <span className="text-[#4285F4]">G</span>
        <span className="text-[#EA4335]">o</span>
        <span className="text-[#FBBC05]">o</span>
        <span className="text-[#4285F4]">g</span>
        <span className="text-[#34A853]">l</span>
        <span className="text-[#EA4335]">e</span>
      </span>
      <form onSubmit={handleSubmit} className="w-full max-w-md px-4 sm:px-6">
        <div className="flex items-center gap-2 bg-background border border-border rounded-full pl-5 pr-2 py-2 shadow-sm focus-within:border-primary transition-colors">
          <Search className="w-5 h-5 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Google 검색"
            onKeyDown={(e) => {
              if (e.key === "Escape") setQuery("")
            }}
            className="flex-1 min-w-0 bg-transparent outline-none text-base text-foreground placeholder:text-muted-foreground py-2"
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer shrink-0"
              aria-label="검색어 지우기"
              title="검색어 지우기 (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="w-px h-6 bg-border shrink-0" aria-hidden />
          <button
            type="button"
            onClick={handleAiSearch}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium text-foreground hover:bg-muted transition-colors cursor-pointer shrink-0"
            aria-label="Google AI 모드로 검색"
            title="Google AI 모드로 검색"
          >
            <Sparkles className="w-4 h-4 text-[#4285F4]" />
            AI 모드
          </button>
        </div>
      </form>
    </div>
  )
}
