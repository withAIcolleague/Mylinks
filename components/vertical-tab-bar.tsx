"use client"

import { useState } from "react"
import { Plus, Edit2, Trash2, Check, X } from "lucide-react"

export interface Tab {
  id: string
  name: string
  color?: string
}

interface VerticalTabBarProps {
  tabs: Tab[]
  activeTabId: string
  onSelectTab: (tabId: string) => void
  onAddTab: (name: string) => void
  onEditTab: (tabId: string, newName: string) => void
  onDeleteTab: (tabId: string) => void
  linkCounts: Record<string, number>
  totalCount: number
}

export function VerticalTabBar({
  tabs,
  activeTabId,
  onSelectTab,
  onAddTab,
  onEditTab,
  onDeleteTab,
  linkCounts,
  totalCount,
}: VerticalTabBarProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [newTabName, setNewTabName] = useState("")
  const [editingTabId, setEditingTabId] = useState<string | null>(null)
  const [editTabName, setEditTabName] = useState("")

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newTabName.trim()) {
      onAddTab(newTabName.trim())
      setNewTabName("")
      setIsAdding(false)
    }
  }

  const handleEditSubmit = (tabId: string) => {
    if (editTabName.trim()) {
      onEditTab(tabId, editTabName.trim())
    }
    setEditingTabId(null)
  }

  return (
    <div className="flex flex-col gap-1.5 shrink-0 select-none z-10 pt-2 -ml-[1px]">
      {/* '전체' 인덱스 탭 */}
      <button
        onClick={() => onSelectTab("all")}
        className={`group relative flex flex-col items-center justify-center py-3 px-1.5 sm:px-2 rounded-r-xl border-t border-r border-b transition-all text-xs cursor-pointer ${
          activeTabId === "all"
            ? "bg-card text-primary font-bold border-border shadow-md translate-x-1 z-20"
            : "bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground border-border/80 hover:translate-x-0.5"
        }`}
        title={`전체 (${totalCount}개)`}
      >
        <span
          className="tracking-widest text-[11px] sm:text-xs font-semibold [writing-mode:vertical-rl] select-none"
        >
          전체
        </span>
        <span
          className={`mt-1.5 text-[9px] px-1 py-0.2 rounded-full font-mono ${
            activeTabId === "all"
              ? "bg-primary/10 text-primary"
              : "bg-background/80 text-muted-foreground"
          }`}
        >
          {totalCount}
        </span>
      </button>

      {/* 세로 인덱스 탭 목록 */}
      {tabs.map((tab) => {
        const isActive = activeTabId === tab.id
        const count = linkCounts[tab.id] || 0
        const isEditing = editingTabId === tab.id

        if (isEditing) {
          return (
            <div
              key={tab.id}
              className="flex flex-col items-center p-1.5 bg-card rounded-r-xl border-t border-r border-b border-primary shadow-md z-30"
            >
              <input
                type="text"
                value={editTabName}
                onChange={(e) => setEditTabName(e.target.value)}
                className="w-16 bg-input px-1 py-0.5 text-xs outline-none text-foreground border rounded"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleEditSubmit(tab.id)
                  if (e.key === "Escape") setEditingTabId(null)
                }}
              />
              <div className="flex gap-1 mt-1">
                <button
                  onClick={() => handleEditSubmit(tab.id)}
                  className="p-1 hover:bg-muted rounded text-primary"
                >
                  <Check className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setEditingTabId(null)}
                  className="p-1 hover:bg-muted rounded text-muted-foreground"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          )
        }

        return (
          <div
            key={tab.id}
            className={`group relative flex flex-col items-center justify-center rounded-r-xl border-t border-r border-b transition-all ${
              isActive
                ? "bg-card text-primary font-bold border-border shadow-md translate-x-1 z-20"
                : "bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground border-border/80 hover:translate-x-0.5"
            }`}
          >
            <button
              onClick={() => onSelectTab(tab.id)}
              className="flex flex-col items-center justify-center py-3 px-1.5 sm:px-2 w-full cursor-pointer"
              title={`${tab.name} (${count}개)`}
            >
              <span
                className="tracking-widest text-[11px] sm:text-xs font-semibold [writing-mode:vertical-rl] select-none"
              >
                {tab.name}
              </span>
              <span
                className={`mt-1.5 text-[9px] px-1 py-0.2 rounded-full font-mono ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "bg-background/80 text-muted-foreground"
                }`}
              >
                {count}
              </span>
            </button>

            {/* 호버 시 나타나는 편집/삭제 버튼 */}
            <div className="hidden group-hover:flex absolute -left-7 top-1/2 -translate-y-1/2 flex-col gap-1 bg-card border border-border shadow-lg p-1 rounded-md z-30">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setEditingTabId(tab.id)
                  setEditTabName(tab.name)
                }}
                className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                title="이름 변경"
              >
                <Edit2 className="w-3 h-3" />
              </button>
              {tabs.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (confirm(`'${tab.name}' 탭을 삭제하시겠습니까?\n(포함된 링크는 기본 탭으로 이동됩니다)`)) {
                      onDeleteTab(tab.id)
                    }
                  }}
                  className="p-1 rounded hover:bg-destructive/10 text-destructive"
                  title="탭 삭제"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        )
      })}

      {/* 탭 추가 인덱스 버튼 */}
      {isAdding ? (
        <form
          onSubmit={handleAddSubmit}
          className="flex flex-col items-center p-1.5 bg-card rounded-r-xl border-t border-r border-b border-primary shadow-md z-30"
        >
          <input
            type="text"
            value={newTabName}
            onChange={(e) => setNewTabName(e.target.value)}
            placeholder="이름"
            className="w-16 bg-input px-1 py-0.5 text-xs outline-none text-foreground border rounded"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Escape") setIsAdding(false)
            }}
          />
          <div className="flex gap-1 mt-1">
            <button
              type="submit"
              className="p-1 hover:bg-muted rounded text-primary"
            >
              <Check className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="p-1 hover:bg-muted rounded text-muted-foreground"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="flex flex-col items-center justify-center py-2 px-1.5 sm:px-2 rounded-r-xl border-t border-r border-b border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 text-primary transition-all cursor-pointer"
          title="새 탭 추가"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}

