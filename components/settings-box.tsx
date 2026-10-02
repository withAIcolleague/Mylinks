"use client"

import { Settings } from "lucide-react"

interface SettingsBoxProps {
  onClick: () => void
}

export function SettingsBox({ onClick }: SettingsBoxProps) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-2.5 py-1.5 px-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors w-full min-w-0 text-left cursor-pointer"
      aria-label="설정"
    >
      <div className="w-5 h-5 rounded bg-muted/60 flex items-center justify-center shrink-0 group-hover:bg-muted">
        <Settings className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground" />
      </div>
      <span className="text-[13px] sm:text-sm md:text-[14px] font-medium truncate">
        설정
      </span>
    </button>
  )
}



