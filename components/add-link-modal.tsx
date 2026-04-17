"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface AddLinkModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (title: string, url: string) => void
  initialUrl?: string | null
  initialTitle?: string | null
}

export function AddLinkModal({ isOpen, onClose, onAdd, initialUrl, initialTitle }: AddLinkModalProps) {
  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")

  useEffect(() => {
    if (isOpen) {
      setTitle(initialTitle || "")
      setUrl(initialUrl || "")
    }
  }, [isOpen, initialUrl, initialTitle])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !url.trim()) return

    let formattedUrl = url.trim()
    if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
      formattedUrl = "https://" + formattedUrl
    }

    onAdd(title.trim(), formattedUrl)
    setTitle("")
    setUrl("")
    onClose()
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">새 링크 추가</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-muted transition-colors"
            aria-label="닫기"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="title" className="text-sm font-medium text-foreground">
              이름
            </label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: Google"
              className="bg-input border-border"
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="url" className="text-sm font-medium text-foreground">
              URL
            </label>
            <Input
              id="url"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="예: google.com"
              className="bg-input border-border"
            />
          </div>

          <div className="flex gap-3 mt-2">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={onClose}
            >
              취소
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={!title.trim() || !url.trim()}
            >
              추가
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
