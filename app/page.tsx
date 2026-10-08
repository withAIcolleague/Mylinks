"use client"

import { useState, useEffect, Suspense, useMemo } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Trash2, X, GripVertical, FolderInput } from "lucide-react"
import {
  DndContext, closestCenter, PointerSensor,
  useSensor, useSensors, DragEndEvent,
} from "@dnd-kit/core"
import { SortableContext, useSortable, rectSortingStrategy, arrayMove } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { LinkBox } from "@/components/link-box"
import { AddLinkBox } from "@/components/add-link-box"
import { AddLinkModal } from "@/components/add-link-modal"
import { SettingsBox } from "@/components/settings-box"
import { SettingsModal } from "@/components/settings-modal"
import { VerticalTabBar, Tab } from "@/components/vertical-tab-bar"
import { GoogleSearchBox } from "@/components/google-search-box"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  fetchRemoteState,
  saveRemoteLinks,
  saveRemoteTabs,
  saveRemoteSettings,
  subscribeToRemoteChanges,
  type Link,
  type Settings,
} from "@/lib/db"

// localStorage는 Supabase 조회 실패 시의 오프라인 캐시로만 사용
function readCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function writeCache(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error(`Failed to cache ${key}`, e)
  }
}

const DEFAULT_SETTINGS: Settings = {
  theme: "system",
  columns: 5,
  boxSize: "medium",
  tabPosition: "right",
}

function SortableLinkBox({ id, title, url, size, columns }: {
  id: string; title: string; url: string
  size: "small" | "medium" | "large"; columns: number
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }
  return (
    <div ref={setNodeRef} style={style} className="relative min-w-0">
      <div {...attributes} {...listeners}
        className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing rounded-md touch-none" />
      <LinkBox id={id} title={title} url={url} size={size} columns={columns} onDelete={() => { }} />
    </div>
  )
}

// useSearchParams를 사용하는 내부 컴포넌트 — Suspense로 감싸야 함
function HomeContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [links, setLinks] = useState<Link[]>([])
  const [tabs, setTabs] = useState<Tab[]>([])
  const [activeTabId, setActiveTabId] = useState<string>("all")
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [quickAddUrl, setQuickAddUrl] = useState<string | null>(null)
  const [quickAddTitle, setQuickAddTitle] = useState<string | null>(null)
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isEditLayoutMode, setIsEditLayoutMode] = useState(false)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  useEffect(() => {
    let cancelled = false

    try {
      const savedActiveTab = localStorage.getItem("my-links-active-tab")
      if (savedActiveTab) setActiveTabId(savedActiveTab)
    } catch { }

    // Supabase가 원본. 응답(또는 실패)을 받은 뒤에만 화면을 열어
    // 오래된 데이터 위에서 편집이 일어나지 않도록 함
    fetchRemoteState().then((remote) => {
      if (cancelled) return

      if (remote.ok) {
        const nextLinks = remote.links ?? []
        const nextTabs = remote.tabs ?? []
        const nextSettings = { ...DEFAULT_SETTINGS, ...remote.settings }
        setLinks(nextLinks)
        setTabs(nextTabs)
        setSettings(nextSettings)
        writeCache("my-links-settings", nextSettings)
      } else {
        // 조회 실패: 캐시로 표시만 하고 원격에는 아무것도 쓰지 않음
        setLinks(readCache<Link[]>("my-links") ?? [])
        setTabs(readCache<Tab[]>("my-links-tabs") ?? [])
        setSettings({ ...DEFAULT_SETTINGS, ...readCache<Partial<Settings>>("my-links-settings") })
      }
      setIsLoaded(true)
    })

    // 실시간 동기화 구독
    const unsubscribe = subscribeToRemoteChanges(
      (newLinks) => setLinks(newLinks),
      (newTabs) => setTabs(newTabs),
      (newSettings) => {
        const merged = { ...DEFAULT_SETTINGS, ...newSettings }
        setSettings(merged)
        writeCache("my-links-settings", merged)
      }
    )

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [])

  // Handle quick add from bookmarklet
  useEffect(() => {
    const isAdd = searchParams.get("add")
    const url = searchParams.get("url")
    const title = searchParams.get("title")

    if (isAdd === "1" && url) {
      // searchParams.get()은 이미 디코딩된 값을 반환
      setQuickAddUrl(url)
      setQuickAddTitle(title ?? "")
      setIsModalOpen(true)
      router.replace("/", { scroll: false })
    }
  }, [searchParams, router])

  const handleSettingsChange = (newSettings: Settings) => {
    setSettings(newSettings)
    writeCache("my-links-settings", newSettings)
    saveRemoteSettings(newSettings)
  }

  const handleSelectTab = (tabId: string) => {
    setActiveTabId(tabId)
    try {
      localStorage.setItem("my-links-active-tab", tabId)
    } catch (e) {
      console.error("Failed to save active tab", e)
    }
  }

  const handleAddTab = (name: string) => {
    const newTab: Tab = { id: `tab-${Date.now()}`, name }
    const updated = [...tabs, newTab]
    setTabs(updated)
    handleSelectTab(newTab.id)
    saveRemoteTabs(updated)
  }

  const handleReorderTabs = (newTabs: Tab[]) => {
    setTabs(newTabs)
    saveRemoteTabs(newTabs)
  }

  const handleEditTab = (tabId: string, newName: string) => {
    const updated = tabs.map((t) => (t.id === tabId ? { ...t, name: newName } : t))
    setTabs(updated)
    saveRemoteTabs(updated)
  }

  const handleCopyTab = (tabId: string) => {
    const source = tabs.find((t) => t.id === tabId)
    if (!source) return
    const stamp = Date.now()
    const newTab: Tab = { ...source, id: `tab-${stamp}`, name: `${source.name} 복사` }
    const index = tabs.findIndex((t) => t.id === tabId)
    const updatedTabs = [...tabs.slice(0, index + 1), newTab, ...tabs.slice(index + 1)]
    const copiedLinks = links
      .filter((l) => l.tabId === tabId)
      .map((l, i) => ({ ...l, id: `${stamp}-${i}`, tabId: newTab.id }))
    const updatedLinks = [...links, ...copiedLinks]
    setTabs(updatedTabs)
    setLinks(updatedLinks)
    handleSelectTab(newTab.id)
    saveRemoteTabs(updatedTabs)
    saveRemoteLinks(updatedLinks)
  }

  const handleDeleteTab = (tabId: string) => {
    const fallbackTabId = tabs.find((t) => t.id !== tabId)?.id
    // 마지막 탭은 삭제 불가 — 링크가 갈 곳이 없어짐
    if (!fallbackTabId) return
    const updatedTabs = tabs.filter((t) => t.id !== tabId)
    const updatedLinks = links.map((l) => (l.tabId === tabId ? { ...l, tabId: fallbackTabId } : l))
    setTabs(updatedTabs)
    setLinks(updatedLinks)
    if (activeTabId === tabId) {
      handleSelectTab("all")
    }
    saveRemoteTabs(updatedTabs)
    saveRemoteLinks(updatedLinks)
  }

  // 오프라인 캐시 갱신 (Supabase 조회 실패 시 표시용)
  useEffect(() => {
    if (isLoaded) writeCache("my-links", links)
  }, [links, isLoaded])

  useEffect(() => {
    if (isLoaded) writeCache("my-links-tabs", tabs)
  }, [tabs, isLoaded])

  useEffect(() => {
    if (!isLoaded) return

    const applyTheme = (isDark: boolean) => {
      if (isDark) {
        document.documentElement.classList.add("dark")
        document.documentElement.classList.remove("light")
      } else {
        document.documentElement.classList.add("light")
        document.documentElement.classList.remove("dark")
      }
    }

    if (settings.theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
      applyTheme(mediaQuery.matches)

      const handler = (e: MediaQueryListEvent) => applyTheme(e.matches)
      mediaQuery.addEventListener("change", handler)
      return () => mediaQuery.removeEventListener("change", handler)
    } else {
      applyTheme(settings.theme === "dark")
    }
  }, [settings.theme, isLoaded])

  const linkCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    links.forEach((link) => {
      counts[link.tabId] = (counts[link.tabId] || 0) + 1
    })
    return counts
  }, [links])

  const currentLinks = useMemo(() => {
    if (activeTabId === "all") return links
    return links.filter((link) => link.tabId === activeTabId)
  }, [links, activeTabId])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = links.findIndex((l) => l.id === active.id)
      const newIndex = links.findIndex((l) => l.id === over.id)
      const updated = arrayMove(links, oldIndex, newIndex)
      setLinks(updated)
      saveRemoteLinks(updated)
    }
  }

  const handleAddLink = (title: string, url: string, tabId?: string) => {
    const targetTabId = tabId || (activeTabId === "all" ? tabs[0]?.id : activeTabId)
    if (!targetTabId) return
    const newLink: Link = {
      id: Date.now().toString(),
      title,
      url,
      tabId: targetTabId,
    }
    const updated = [...links, newLink]
    setLinks(updated)
    saveRemoteLinks(updated)
  }

  const handleDeleteLink = (id: string) => {
    const updated = links.filter((link) => link.id !== id)
    setLinks(updated)
    saveRemoteLinks(updated)
  }

  const handleDeleteLinks = (ids: string[]) => {
    const updated = links.filter((link) => !ids.includes(link.id))
    setLinks(updated)
    saveRemoteLinks(updated)
  }

  const handleEditLink = (id: string, title: string, url: string) => {
    const updated = links.map((link) => (link.id === id ? { ...link, title, url } : link))
    setLinks(updated)
    saveRemoteLinks(updated)
  }

  const handleMoveLinks = (ids: string[], tabId: string) => {
    const updated = links.map((link) => (ids.includes(link.id) ? { ...link, tabId } : link))
    setLinks(updated)
    saveRemoteLinks(updated)
  }

  const handleStartSelect = (id: string) => {
    setIsSelectionMode(true)
    setSelectedIds([id])
  }

  const handleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const handleSelectionDelete = () => {
    handleDeleteLinks(selectedIds)
    setIsSelectionMode(false)
    setSelectedIds([])
  }

  const handleSelectionMove = (tabId: string) => {
    handleMoveLinks(selectedIds, tabId)
    setIsSelectionMode(false)
    setSelectedIds([])
  }

  const handleCancelSelection = () => {
    setIsSelectionMode(false)
    setSelectedIds([])
  }

  const getGridClasses = () => {
    const baseColumns = settings.columns
    const columnClasses: Record<number, string> = {
      2: "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
      3: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6",
      4: "grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8",
      5: "grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-9",
    }
    return columnClasses[baseColumns] || columnClasses[4]
  }

  const getGapClasses = () => {
    const gapClasses: Record<string, string> = {
      small: "gap-x-3 gap-y-1 sm:gap-x-4",
      medium: "gap-x-4 gap-y-1 sm:gap-x-5 sm:gap-y-1.5",
      large: "gap-x-5 gap-y-1.5 sm:gap-x-6 sm:gap-y-2",
    }
    return gapClasses[settings.boxSize] || gapClasses.medium
  }

  const getBoxSizeClasses = () => {
    const sizeClasses: Record<string, string> = {
      small: "text-xs",
      medium: "text-[13px] sm:text-sm",
      large: "text-sm sm:text-base",
    }
    return sizeClasses[settings.boxSize] || ""
  }

  if (!isLoaded) {
    return (
      <main className="min-h-screen bg-background p-2 sm:p-4 md:p-6">
        <div className="max-w-7xl mx-auto flex flex-row items-start">
          <div className="flex-1 min-w-0 bg-card/40 rounded-2xl sm:rounded-3xl border border-border p-3 sm:p-5">
            <div className={`grid ${getGridClasses()} ${getGapClasses()}`}>
              {[...Array(24)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 py-1 px-2.5 animate-pulse"
                >
                  <div className="w-4 h-4 rounded-xs bg-muted/60 shrink-0" />
                  <div className="h-3.5 bg-muted/40 rounded-sm w-3/4" />
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1.5 pt-2 -ml-[1px]">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-7 sm:w-8 h-16 bg-muted/50 rounded-r-xl border-t border-r border-b border-border/60 animate-pulse" />
            ))}
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background p-2 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <GoogleSearchBox />
      </div>
      <div className={`max-w-7xl mx-auto flex items-start ${settings.tabPosition === "left" ? "flex-row-reverse" : "flex-row"}`}>
        {/* 좌측 메인 본문 영역 (큰 직사각형 프레임) */}
        <div className="flex-1 min-w-0 bg-card/40 backdrop-blur-xs rounded-2xl sm:rounded-3xl border border-border p-3 sm:p-5 shadow-xs">
          {isEditLayoutMode ? (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={currentLinks.map((l) => l.id)} strategy={rectSortingStrategy}>
                <div className={`grid ${getGridClasses()} ${getGapClasses()} ${getBoxSizeClasses()}`}>
                  {currentLinks.map((link) => (
                    <SortableLinkBox key={link.id} id={link.id} title={link.title} url={link.url} size={settings.boxSize} columns={settings.columns} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <div className={`grid ${getGridClasses()} ${getGapClasses()} ${getBoxSizeClasses()}`}>
              {!isSelectionMode && <AddLinkBox onClick={() => setIsModalOpen(true)} />}

              {currentLinks.map((link) => (
                <LinkBox
                  key={link.id}
                  id={link.id}
                  title={link.title}
                  url={link.url}
                  tabId={link.tabId}
                  tabs={tabs}
                  onDelete={handleDeleteLink}
                  onEdit={handleEditLink}
                  onMove={(id, tabId) => handleMoveLinks([id], tabId)}
                  onReorder={() => setIsEditLayoutMode(true)}
                  onStartSelect={handleStartSelect}
                  size={settings.boxSize}
                  columns={settings.columns}
                  isSelectionMode={isSelectionMode}
                  isSelected={selectedIds.includes(link.id)}
                  onSelect={handleSelect}
                />
              ))}

              {!isSelectionMode && <SettingsBox onClick={() => setIsSettingsOpen(true)} />}
            </div>
          )}
        </div>

        {/* 우측 외곽선 밀착 돌출 세로 인덱스 탭 */}
        <VerticalTabBar
          tabs={tabs}
          activeTabId={activeTabId}
          onSelectTab={handleSelectTab}
          onAddTab={handleAddTab}
          onEditTab={handleEditTab}
          onDeleteTab={handleDeleteTab}
          onCopyTab={handleCopyTab}
          onReorderTabs={handleReorderTabs}
          position={settings.tabPosition}
          linkCounts={linkCounts}
          totalCount={links.length}
        />
      </div>

      {isEditLayoutMode && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-card border border-border rounded-2xl shadow-2xl px-4 py-3 z-40">
          <GripVertical className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">드래그로 순서 변경</span>
          <button
            onClick={() => setIsEditLayoutMode(false)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium cursor-pointer"
          >
            완료
          </button>
        </div>
      )}

      {isSelectionMode && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-card border border-border rounded-2xl shadow-2xl px-4 py-3 z-40">
          <span className="text-sm text-muted-foreground min-w-[60px] text-center">
            {selectedIds.length}개 선택
          </span>
          <button
            onClick={handleSelectionDelete}
            disabled={selectedIds.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-xl text-sm font-medium disabled:opacity-40 transition-opacity cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            삭제
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                disabled={selectedIds.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium disabled:opacity-40 transition-opacity cursor-pointer"
              >
                <FolderInput className="w-4 h-4" />
                이동
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="center">
              {tabs.map((tab) => (
                <DropdownMenuItem key={tab.id} onSelect={() => handleSelectionMove(tab.id)}>
                  {tab.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <button
            onClick={handleCancelSelection}
            className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-xl text-sm font-medium transition-colors hover:bg-muted/80 cursor-pointer"
          >
            <X className="w-4 h-4" />
            취소
          </button>
        </div>
      )}

      <AddLinkModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setQuickAddUrl(null)
          setQuickAddTitle(null)
        }}
        onAdd={handleAddLink}
        initialUrl={quickAddUrl}
        initialTitle={quickAddTitle}
        tabs={tabs}
        defaultTabId={activeTabId}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSettingsChange={handleSettingsChange}
      />
    </main>
  )
}

// useSearchParams()는 Suspense 경계 안에서만 사용 가능 (Next.js App Router)
export default function Home() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 sm:gap-4">
            {[...Array(9)].map((_, i) => (
              <div
                key={i}
                className="aspect-square bg-card rounded-xl border border-border animate-pulse"
              />
            ))}
          </div>
        </div>
      </main>
    }>
      <HomeContent />
    </Suspense>
  )
}
