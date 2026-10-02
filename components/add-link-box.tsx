"use client"

import { Plus } from "lucide-react"

interface AddLinkBoxProps {
  onClick: () => void
}

export function AddLinkBox({ onClick }: AddLinkBoxProps) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-2 py-1 px-2.5 rounded-md text-primary/80 hover:text-primary hover:bg-primary/10 transition-colors w-full min-w-0 text-left cursor-pointer"
      aria-label="링크 추가"
    >
      <div className="w-4 h-4 rounded-xs bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0 group-hover:bg-primary/20">
        <Plus className="w-3 h-3 text-primary" strokeWidth={2.5} />
      </div>
      <span className="text-[13px] sm:text-sm font-medium truncate">
        + 링크 추가
      </span>
    </button>
  )
}


