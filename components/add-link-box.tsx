"use client"

import { Plus } from "lucide-react"

interface AddLinkBoxProps {
  onClick: () => void
}

export function AddLinkBox({ onClick }: AddLinkBoxProps) {
  return (
    <button
      onClick={onClick}
      className="aspect-square bg-primary/10 border-2 border-dashed border-primary/40 rounded-xl flex flex-col items-center justify-center gap-2 transition-all duration-200 hover:bg-primary/20 hover:border-primary hover:scale-[1.02] active:scale-[0.98]"
      aria-label="링크 추가"
    >
      <Plus className="w-8 h-8 sm:w-10 sm:h-10 text-primary" strokeWidth={2.5} />
    </button>
  )
}
