"use client"

import { Settings } from "lucide-react"

interface SettingsBoxProps {
  onClick: () => void
}

export function SettingsBox({ onClick }: SettingsBoxProps) {
  return (
    <button
      onClick={onClick}
      className="aspect-square bg-muted/50 rounded-xl border border-border border-dashed flex flex-col items-center justify-center gap-2 transition-all duration-200 hover:bg-muted hover:border-muted-foreground/50 hover:scale-[1.02] cursor-pointer"
      aria-label="설정"
    >
      <Settings className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground" />
      <span className="text-xs sm:text-sm font-medium text-muted-foreground">설정</span>
    </button>
  )
}
