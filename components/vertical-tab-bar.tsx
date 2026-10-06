"use client"

import { useState } from "react"
import { Plus, Edit2, Copy, Trash2, Check, X } from "lucide-react"
import {
  DndContext, closestCenter, PointerSensor,
  useSensor, useSensors, DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext, useSortable, verticalListSortingStrategy, arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

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
  onCopyTab?: (tabId: string) => void
  onReorderTabs?: (newTabs: Tab[]) => void
  linkCounts: Record<string, number>
  totalCount: number
  position?: "left" | "right"
}

function SortableIndexTab({
  tab,
  isActive,
  count,
  isEditing,
  editTabName,
  setEditTabName,
  onSelectTab,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDeleteTab,
  onCopyTab,
  canDelete,
  position,
}: {
  tab: Tab
  isActive: boolean
  count: number
  isEditing: boolean
  editTabName: string
  setEditTabName: (val: string) => void
  onSelectTab: (id: string) => void
  onStartEdit: (tab: Tab) => void
  onCancelEdit: () => void
  onSaveEdit: (id: string) => void
  onDeleteTab: (id: string) => void
  onCopyTab?: (id: string) => void
  canDelete: boolean
  position: "left" | "right"
}) {
  const isLeft = position === "left"
  const roundedSide = isLeft ? "rounded-l-xl" : "rounded-r-xl"
  const borderSides = isLeft ? "border-t border-l border-b" : "border-t border-r border-b"
  const activeTranslate = isLeft ? "-translate-x-1.5" : "translate-x-1.5"
  const hoverTranslate = isLeft ? "hover:-translate-x-0.5" : "hover:translate-x-0.5"
  const hoverButtonsSide = isLeft ? "-right-7" : "-left-7"
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tab.id, disabled: isEditing })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : undefined,
  }

  if (isEditing) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`flex flex-col items-center p-1.5 bg-card ${roundedSide} ${borderSides} border-primary shadow-md z-30`}
      >
        <input
          type="text"
          value={editTabName}
          onChange={(e) => setEditTabName(e.target.value)}
          className="w-20 bg-input px-1 py-0.5 text-xs outline-none text-foreground border rounded"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") onSaveEdit(tab.id)
            if (e.key === "Escape") onCancelEdit()
          }}
        />
        <div className="flex gap-1 mt-1">
          <button
            onClick={() => onSaveEdit(tab.id)}
            className="p-1 hover:bg-muted rounded text-primary"
          >
            <Check className="w-3 h-3" />
          </button>
          <button
            onClick={onCancelEdit}
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
      ref={setNodeRef}
      style={style}
      className={`group relative flex flex-col items-center justify-center ${roundedSide} ${borderSides} transition-all ${
        isActive
          ? `bg-card text-primary font-bold border-border shadow-md ${activeTranslate} z-20`
          : `bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground border-border/80 ${hoverTranslate}`
      }`}
    >
      <button
        onClick={() => onSelectTab(tab.id)}
        {...attributes}
        {...listeners}
        className="flex flex-col items-center justify-center py-3.5 px-2 sm:px-2.5 w-full cursor-grab active:cursor-grabbing touch-none select-none"
        title={`${tab.name} (${count}개 - 드래그하여 순서 변경)`}
      >
        <span
          className="tracking-widest text-xs sm:text-[13px] font-semibold [writing-mode:vertical-rl] select-none pointer-events-none"
        >
          {tab.name}
        </span>
        <span
          className={`mt-1.5 text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
            isActive
              ? "bg-primary/10 text-primary font-bold"
              : "bg-background/80 text-muted-foreground"
          }`}
        >
          {count}
        </span>
      </button>

      {/* 호버 시 나타나는 편집/삭제 버튼 */}
      <div className={`hidden group-hover:flex absolute ${hoverButtonsSide} top-1/2 -translate-y-1/2 flex-col gap-1 bg-card border border-border shadow-lg p-1 rounded-md z-30`}>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onStartEdit(tab)
          }}
          className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
          title="이름 변경"
        >
          <Edit2 className="w-3 h-3" />
        </button>
        {onCopyTab && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onCopyTab(tab.id)
            }}
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
            title="탭 복사"
          >
            <Copy className="w-3 h-3" />
          </button>
        )}
        {canDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (confirm(`'${tab.name}' 탭을 삭제하시겠습니까?\n(포함된 링크는 기본 탭으로 이동됩니다)`)) {
                onDeleteTab(tab.id)
              }
            }}
            className="p-1 rounded hover:bg-destructive/10 text-destructive cursor-pointer"
            title="탭 삭제"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  )
}

export function VerticalTabBar({
  tabs,
  activeTabId,
  onSelectTab,
  onAddTab,
  onEditTab,
  onDeleteTab,
  onCopyTab,
  onReorderTabs,
  linkCounts,
  totalCount,
  position = "right",
}: VerticalTabBarProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [newTabName, setNewTabName] = useState("")
  const [editingTabId, setEditingTabId] = useState<string | null>(null)
  const [editTabName, setEditTabName] = useState("")

  const isLeft = position === "left"
  const roundedSide = isLeft ? "rounded-l-xl" : "rounded-r-xl"
  const borderSides = isLeft ? "border-t border-l border-b" : "border-t border-r border-b"
  const activeTranslate = isLeft ? "-translate-x-1.5" : "translate-x-1.5"
  const hoverTranslate = isLeft ? "hover:-translate-x-0.5" : "hover:translate-x-0.5"
  const marginOverlap = isLeft ? "-mr-[1px]" : "-ml-[1px]"

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = tabs.findIndex((t) => t.id === active.id)
      const newIndex = tabs.findIndex((t) => t.id === over.id)
      const updated = arrayMove(tabs, oldIndex, newIndex)
      onReorderTabs?.(updated)
    }
  }

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
    <div className={`flex flex-col gap-1.5 shrink-0 select-none z-10 pt-2 ${marginOverlap}`}>
      {/* 세로 인덱스 탭 목록 (드래그로 순서 변경 가능) */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={tabs.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-1.5">
            {tabs.map((tab) => (
              <SortableIndexTab
                key={tab.id}
                tab={tab}
                isActive={activeTabId === tab.id}
                count={linkCounts[tab.id] || 0}
                isEditing={editingTabId === tab.id}
                editTabName={editTabName}
                setEditTabName={setEditTabName}
                onSelectTab={onSelectTab}
                onStartEdit={(targetTab) => {
                  setEditingTabId(targetTab.id)
                  setEditTabName(targetTab.name)
                }}
                onCancelEdit={() => setEditingTabId(null)}
                onSaveEdit={handleEditSubmit}
                onDeleteTab={onDeleteTab}
                onCopyTab={onCopyTab}
                canDelete={tabs.length > 1}
                position={position}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* 탭 추가 인덱스 버튼 */}
      {isAdding ? (
        <form
          onSubmit={handleAddSubmit}
          className={`flex flex-col items-center p-1.5 bg-card ${roundedSide} ${borderSides} border-primary shadow-md z-30`}
        >
          <input
            type="text"
            value={newTabName}
            onChange={(e) => setNewTabName(e.target.value)}
            placeholder="이름"
            className="w-20 bg-input px-1 py-0.5 text-xs outline-none text-foreground border rounded"
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
          className={`flex flex-col items-center justify-center py-2 px-1.5 sm:px-2 ${roundedSide} ${borderSides} border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 text-primary transition-all cursor-pointer`}
          title="새 탭 추가"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      )}

      {/* '전체' 인덱스 탭 (항상 맨 아래 고정) */}
      <button
        onClick={() => onSelectTab("all")}
        className={`group relative flex flex-col items-center justify-center py-3.5 px-2 sm:px-2.5 ${roundedSide} ${borderSides} transition-all text-xs cursor-pointer ${
          activeTabId === "all"
            ? `bg-card text-primary font-bold border-border shadow-md ${activeTranslate} z-20`
            : `bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground border-border/80 ${hoverTranslate}`
        }`}
        title={`전체 (${totalCount}개)`}
      >
        <span
          className="tracking-widest text-xs sm:text-[13px] font-semibold [writing-mode:vertical-rl] select-none"
        >
          전체
        </span>
        <span
          className={`mt-1.5 text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
            activeTabId === "all"
              ? "bg-primary/10 text-primary font-bold"
              : "bg-background/80 text-muted-foreground"
          }`}
        >
          {totalCount}
        </span>
      </button>
    </div>
  )
}

