"use client"

import { Search } from "lucide-react"
import { useState } from "react"

export function GoogleSearchBox() {
  const [query, setQuery] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    window.open(`https://www.google.com/search?q=${encodeURIComponent(q)}`, "_blank", "noopener,noreferrer")
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
        <div className="flex items-center gap-3 bg-background border border-border rounded-full px-5 py-4 shadow-sm focus-within:border-primary transition-colors">
          <Search className="w-5 h-5 text-muted-foreground shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Google 검색"
            className="flex-1 min-w-0 bg-transparent outline-none text-base text-foreground placeholder:text-muted-foreground"
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
          />
        </div>
      </form>
    </div>
  )
}
