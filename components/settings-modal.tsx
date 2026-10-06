"use client"

import { X, Sun, Moon, Monitor } from "lucide-react"
import { useEffect } from "react"

interface Settings {
  theme: "system" | "dark" | "light"
  columns: number
  boxSize: "small" | "medium" | "large"
  tabPosition: "left" | "right"
}

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  settings: Settings
  onSettingsChange: (settings: Settings) => void
}

export function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
}: SettingsModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "hidden"
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = ""
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-card border border-border rounded-2xl w-full max-w-md max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">화면 설정</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="닫기"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                테마
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => onSettingsChange({ ...settings, theme: "system" })}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border transition-all ${
                    settings.theme === "system"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/50 text-foreground border-border hover:border-muted-foreground/50"
                  }`}
                >
                  <Monitor className="w-4 h-4" />
                  <span className="text-sm">시스템</span>
                </button>
                <button
                  onClick={() => onSettingsChange({ ...settings, theme: "dark" })}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border transition-all ${
                    settings.theme === "dark"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/50 text-foreground border-border hover:border-muted-foreground/50"
                  }`}
                >
                  <Moon className="w-4 h-4" />
                  <span className="text-sm">다크</span>
                </button>
                <button
                  onClick={() => onSettingsChange({ ...settings, theme: "light" })}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border transition-all ${
                    settings.theme === "light"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/50 text-foreground border-border hover:border-muted-foreground/50"
                  }`}
                >
                  <Sun className="w-4 h-4" />
                  <span className="text-sm">라이트</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                열 개수 (모바일 기준)
              </label>
              <div className="flex gap-2">
                {[2, 3, 4, 5].map((cols) => (
                  <button
                    key={cols}
                    onClick={() => onSettingsChange({ ...settings, columns: cols })}
                    className={`flex-1 py-3 rounded-xl border transition-all text-sm font-medium ${
                      settings.columns === cols
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted/50 text-foreground border-border hover:border-muted-foreground/50"
                    }`}
                  >
                    {cols}열
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                아이콘 크기
              </label>
              <div className="flex gap-2">
                {[
                  { value: "small", label: "작게" },
                  { value: "medium", label: "보통" },
                  { value: "large", label: "크게" },
                ].map((size) => (
                  <button
                    key={size.value}
                    onClick={() =>
                      onSettingsChange({
                        ...settings,
                        boxSize: size.value as "small" | "medium" | "large",
                      })
                    }
                    className={`flex-1 py-3 rounded-xl border transition-all text-sm font-medium ${
                      settings.boxSize === size.value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted/50 text-foreground border-border hover:border-muted-foreground/50"
                    }`}
                  >
                    {size.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                탭바 위치
              </label>
              <div className="flex gap-2">
                {[
                  { value: "left", label: "왼쪽" },
                  { value: "right", label: "오른쪽" },
                ].map((pos) => (
                  <button
                    key={pos.value}
                    onClick={() =>
                      onSettingsChange({
                        ...settings,
                        tabPosition: pos.value as "left" | "right",
                      })
                    }
                    className={`flex-1 py-3 rounded-xl border transition-all text-sm font-medium ${
                      settings.tabPosition === pos.value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted/50 text-foreground border-border hover:border-muted-foreground/50"
                    }`}
                  >
                    {pos.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
