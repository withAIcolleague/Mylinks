"use client"

import { X, Sun, Moon, Monitor, Trash2, Check, Bookmark, Copy, CheckCircle } from "lucide-react"
import { useEffect, useState } from "react"

interface Link {
  id: string
  title: string
  url: string
}

interface Settings {
  theme: "system" | "dark" | "light"
  columns: number
  boxSize: "small" | "medium" | "large"
}

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  settings: Settings
  onSettingsChange: (settings: Settings) => void
  links: Link[]
  onDeleteLinks: (ids: string[]) => void
}

export function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
  links,
  onDeleteLinks,
}: SettingsModalProps) {
  const [selectedLinks, setSelectedLinks] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<"display" | "manage" | "bookmarklet">("display")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setSelectedLinks([])
    }
  }, [isOpen])

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

  const toggleLink = (id: string) => {
    setSelectedLinks((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const selectAll = () => {
    if (selectedLinks.length === links.length) {
      setSelectedLinks([])
    } else {
      setSelectedLinks(links.map((l) => l.id))
    }
  }

  const handleDeleteSelected = () => {
    if (selectedLinks.length > 0) {
      onDeleteLinks(selectedLinks)
      setSelectedLinks([])
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-card border border-border rounded-2xl w-full max-w-md max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">설정</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="닫기"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab("display")}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === "display"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            화면 설정
          </button>
          <button
            onClick={() => setActiveTab("manage")}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === "manage"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            링크 관리
          </button>
          <button
            onClick={() => setActiveTab("bookmarklet")}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === "bookmarklet"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            빠른 추가
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === "display" ? (
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
                  {[2, 3, 4].map((cols) => (
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
                  박스 크기
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
            </div>
          ) : activeTab === "manage" ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={selectAll}
                  className="text-sm text-primary hover:underline"
                >
                  {selectedLinks.length === links.length ? "전체 해제" : "전체 선택"}
                </button>
                {selectedLinks.length > 0 && (
                  <button
                    onClick={handleDeleteSelected}
                    className="flex items-center gap-1.5 text-sm text-destructive hover:underline"
                  >
                    <Trash2 className="w-4 h-4" />
                    선택 삭제 ({selectedLinks.length})
                  </button>
                )}
              </div>

              {links.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  저장된 링크가 없습니다.
                </p>
              ) : (
                <div className="space-y-2">
                  {links.map((link) => (
                    <button
                      key={link.id}
                      onClick={() => toggleLink(link.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                        selectedLinks.includes(link.id)
                          ? "bg-primary/10 border-primary"
                          : "bg-muted/30 border-border hover:border-muted-foreground/50"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                          selectedLinks.includes(link.id)
                            ? "bg-primary border-primary"
                            : "border-muted-foreground/50"
                        }`}
                      >
                        {selectedLinks.includes(link.id) && (
                          <Check className="w-3 h-3 text-primary-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {link.title}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {link.url}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-foreground mb-2">
                  북마클릿 사용법
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  아래 버튼을 브라우저 북마크바로 드래그하세요. 웹사이트에서 클릭하면 바로 이 페이지에 추가됩니다.
                </p>
              </div>

              <div className="flex flex-col items-center gap-4 py-4">
                <a
                  href={`javascript:(function(){window.open('${typeof window !== 'undefined' ? window.location.origin : ''}?add=1&url='+encodeURIComponent(location.href)+'&title='+encodeURIComponent(document.title),'_blank')})();`}
                  onClick={(e) => e.preventDefault()}
                  draggable
                  className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium text-sm shadow-lg hover:opacity-90 transition-opacity cursor-grab active:cursor-grabbing"
                >
                  <Bookmark className="w-4 h-4" />
                  My Links에 추가
                </a>
                <p className="text-xs text-muted-foreground">
                  이 버튼을 북마크바로 드래그하세요
                </p>
              </div>

              <div className="border-t border-border pt-4">
                <h4 className="text-sm font-medium text-foreground mb-3">
                  수동 설치
                </h4>
                <p className="text-xs text-muted-foreground mb-3">
                  드래그가 안 되면 아래 코드를 복사해서 북마크 URL에 붙여넣으세요.
                </p>
                <div className="relative">
                  <pre className="bg-muted/50 border border-border rounded-xl p-3 text-xs text-foreground overflow-x-auto whitespace-pre-wrap break-all">
                    {`javascript:(function(){window.open('${typeof window !== 'undefined' ? window.location.origin : ''}?add=1&url='+encodeURIComponent(location.href)+'&title='+encodeURIComponent(document.title),'_blank')})();`}
                  </pre>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `javascript:(function(){window.open('${window.location.origin}?add=1&url='+encodeURIComponent(location.href)+'&title='+encodeURIComponent(document.title),'_blank')})();`
                      )
                      setCopied(true)
                      setTimeout(() => setCopied(false), 2000)
                    }}
                    className="absolute top-2 right-2 p-2 rounded-lg bg-background/80 hover:bg-background border border-border transition-colors"
                    aria-label="복사"
                  >
                    {copied ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
