"use client"

import { Plus } from "lucide-react"

interface AddLinkBoxProps {
  onClick: () => void
}

export function AddLinkBox({ onClick }: AddLinkBoxProps) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-2.5 py-1.5 px-3 rounded-lg text-primary/80 hover:text-primary hover:bg-primary/10 transition-colors w-full min-w-0 text-left cursor-pointer"
      aria-label="링크 추가"
    >
      <div className="w-5 h-5 rounded bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0 group-hover:bg-primary/20">
        <Plus className="w-3.5 h-3.5 text-primary" strokeWidth={2.5} />
      </div>
      <span className="text-[13px] sm:text-sm md:text-[14px] font-medium truncate">
        + 링크 추가
      </span>
    </button>
  )
}



