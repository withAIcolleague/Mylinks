"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Trash2, X, GripVertical } from "lucide-react"
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

const DEFAULT_LINKS: Link[] = [
  { id: "2", title: "뽐뿌", url: "https://www.ppomppu.co.kr/" },
  { id: "3", title: "에펨코리아", url: "https://www.fmkorea.com/" },
  { id: "4", title: "클리앙", url: "https://www.clien.net/" },
  { id: "1", title: "디시인사이드", url: "https://www.dcinside.com/" },
  { id: "5", title: "엠엘비파크", url: "https://mlbpark.donga.com/" },
  { id: "6", title: "더쿠", url: "https://theqoo.net/" },
  { id: "7", title: "보배드림", url: "https://www.bobaedream.co.kr/" },
  { id: "8", title: "블라인드", url: "https://www.teamblind.com/kr/" },
  { id: "9", title: "이토랜드", url: "https://www.etoland.co.kr/" },
  { id: "11", title: "인스티즈", url: "https://www.instiz.net/" },
  { id: "12", title: "웃긴대학", url: "https://humoruniv.com/" },
  { id: "13", title: "네이트판", url: "https://m.pann.nate.com/" },
  { id: "14", title: "개드립", url: "https://www.dogdrip.net/" },
  { id: "10", title: "일베", url: "https://www.ilbe.com/" },
  { id: "15", title: "아카라이브", url: "https://arca.live/" },
  { id: "16", title: "SLR클럽", url: "https://www.slrclub.com/" },
  { id: "17", title: "가생이닷컴", url: "http://www.gasengi.com/m" },
  { id: "18", title: "루리웹", url: "https://www.ruliweb.com/" },
  { id: "19", title: "오늘의유머", url: "https://www.todayhumor.co.kr/" },
  { id: "20", title: "와이고수", url: "https://www.ygosu.com/" },
  { id: "21", title: "82쿡", url: "https://www.82cook.com/" },
  { id: "22", title: "다모앙", url: "https://damoang.net/" },
  { id: "23", title: "인벤", url: "https://www.inven.co.kr/" },
  { id: "24", title: "딴지일보", url: "https://www.ddanzi.com/" },
  { id: "25", title: "디미토리", url: "https://www.dmitory.com/" },
  { id: "26", title: "해연갤", url: "https://hygall.com/" },
  { id: "27", title: "DVD프라임", url: "https://dvdprime.com/" },
  { id: "28", title: "스레딕", url: "https://thredic.com/" },
  { id: "29", title: "AI타임스", url: "https://www.aitimes.com/" },
  { id: "30", title: "인공지능신문", url: "https://www.aitimes.kr/" },
  { id: "31", title: "더에이아이", url: "https://www.newstheai.com/" },
  { id: "32", title: "AI포스트", url: "https://www.aipostkorea.com/" },
  { id: "33", title: "로봇신문", url: "https://www.irobotnews.com/" },
  { id: "34", title: "AI매터스", url: "https://aimatters.co.kr/" },
  { id: "36", title: "AI News", url: "https://www.artificialintelligence-news.com/" },
  { id: "37", title: "AI Magazine", url: "https://aimagazine.com/" },
  { id: "38", title: "MIT AI", url: "https://news.mit.edu/topic/artificial-intelligence2" },
  { id: "39", title: "VentureBeat", url: "https://venturebeat.com/" },
  { id: "40", title: "지디넷", url: "https://zdnet.co.kr/" },
  { id: "41", title: "IT World", url: "https://www.itworld.co.kr/" },
  { id: "42", title: "디지털데일리", url: "http://www.ddaily.co.kr/" },
  { id: "43", title: "씨넷코리아", url: "https://www.cnet.co.kr/" },
  { id: "44", title: "테크월드뉴스", url: "https://www.epnc.co.kr/" },
  { id: "45", title: "CIO코리아", url: "https://www.cio.com/kr/" },
  { id: "46", title: "디일렉", url: "https://www.thelec.kr/" },
  { id: "47", title: "전자신문", url: "https://www.etnews.com/" },
  { id: "48", title: "IT비즈뉴스", url: "https://www.itbiznews.com/" },
  { id: "49", title: "더테크", url: "https://www.the-tech.co.kr/" },
  { id: "50", title: "테크레시피", url: "https://techrecipe.co.kr/" },
  { id: "51", title: "아이티데일리", url: "https://www.itdaily.kr/" },
  { id: "52", title: "테크M", url: "https://www.techm.kr/" },
  { id: "53", title: "아웃스탠딩", url: "https://outstanding.kr/" },
  { id: "54", title: "컴퓨터월드", url: "http://www.comworld.co.kr/" },
  { id: "55", title: "플래텀", url: "https://platum.kr/" },
  { id: "56", title: "테크데일리", url: "http://www.techdaily.co.kr/" },
  { id: "57", title: "벤처스퀘어", url: "https://www.venturesquare.net/" },
  { id: "58", title: "보안뉴스", url: "https://m.boannews.com/" },
  { id: "59", title: "IT조선", url: "http://it.chosun.com/" },
  { id: "60", title: "IT동아", url: "https://it.donga.com/" },
  { id: "61", title: "베타뉴스", url: "http://www.betanews.net/" },
  { id: "62", title: "데이터넷", url: "http://www.datanet.co.kr/" },
  { id: "63", title: "디스이즈게임", url: "https://www.thisisgame.com/" },
  { id: "64", title: "데일리게임", url: "https://www.dailygame.co.kr/" },
  { id: "65", title: "게임포커스", url: "https://gamefocus.co.kr/" },
  { id: "66", title: "퀘이사플레이", url: "https://quasarplay.com/" },
  { id: "67", title: "플레이포럼", url: "https://www.playforum.net/" },
  { id: "68", title: "게임메카", url: "https://www.gamemeca.com/" },
  { id: "69", title: "게임톡", url: "https://www.gametoc.co.kr/" },
  { id: "70", title: "인디게임닷컴", url: "https://indiegame.com/" },
  { id: "71", title: "헝그리앱", url: "http://www.hungryapp.co.kr/" },
  { id: "72", title: "게임인사이트", url: "http://www.gameinsight.co.kr/" },
  { id: "73", title: "게임와이", url: "http://www.gamey.kr/" },
  { id: "74", title: "경향게임스", url: "http://www.khgames.co.kr/" },
  { id: "75", title: "게임샷", url: "http://www.gameshot.net/" },
  { id: "76", title: "게임조선", url: "https://m.gamechosun.co.kr/" },
  { id: "77", title: "쿨엔조이", url: "https://coolenjoy.net/" },
  { id: "78", title: "퀘이사존", url: "https://quasarzone.com/" },
  { id: "79", title: "기글하드웨어", url: "https://gigglehd.com/" },
  { id: "80", title: "2CPU", url: "https://www.2cpu.co.kr/" },
  { id: "81", title: "하드웨어배틀", url: "http://www.hwbattle.com/" },
  { id: "82", title: "키보드랩", url: "https://kbdlab.co.kr/" },
  { id: "83", title: "보드나라", url: "https://www.bodnara.co.kr/" },
  { id: "84", title: "케이벤치", url: "http://www.kbench.com/" },
  { id: "85", title: "파퓰러사이언스", url: "https://www.popsci.co.kr/" },
  { id: "86", title: "사이언스타임즈", url: "https://www.sciencetimes.co.kr/" },
  { id: "87", title: "동아사이언스", url: "https://www.dongascience.com/" },
  { id: "88", title: "사이언스온", url: "https://scienceon.kisti.re.kr/" },
  { id: "89", title: "YTN사이언스", url: "https://science.ytn.co.kr/" },
  { id: "90", title: "헬로디디", url: "https://www.hellodd.com/" },
  { id: "91", title: "BRIC", url: "https://www.ibric.org/" },
  { id: "92", title: "MIT 테크리뷰", url: "https://www.technologyreview.kr/" },
  { id: "93", title: "사이언스올", url: "https://www.scienceall.com/" },
  { id: "94", title: "내셔널지오그래픽", url: "https://www.natgeokorea.com/" },
]

const LINKS_VERSION = "3"

const DEFAULT_SETTINGS: Settings = {
  theme: "system",
  columns: 5,
  boxSize: "medium",
}

function SortableLinkBox({ id, title, url, size, columns }: {
  id: string; title: string; url: string
  size: "small" | "medium" | "large"; columns: number
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }
  return (
    <div ref={setNodeRef} style={style} className="relative">
      <div {...attributes} {...listeners}
        className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing rounded-xl touch-none" />
      <LinkBox id={id} title={title} url={url} size={size} columns={columns} onDelete={() => { }} />
    </div>
  )
}

// useSearchParams를 사용하는 내부 컴포넌트 — Suspense로 감싸야 함
function HomeContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [links, setLinks] = useState<Link[]>([])
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setLinks((prev) => {
        const oldIndex = prev.findIndex((l) => l.id === active.id)
        const newIndex = prev.findIndex((l) => l.id === over.id)
        return arrayMove(prev, oldIndex, newIndex)
      })
    }
  }

  useEffect(() => {
    const savedVersion = localStorage.getItem("my-links-version")
    const savedLinks = localStorage.getItem("my-links")
    const savedSettings = localStorage.getItem("my-links-settings")

    if (!savedLinks || savedVersion !== LINKS_VERSION) {
      setLinks(DEFAULT_LINKS)
      localStorage.setItem("my-links-version", LINKS_VERSION)
    } else {
      try {
        setLinks(JSON.parse(savedLinks))
      } catch {
        setLinks(DEFAULT_LINKS)
      }
    }

    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings))
      } catch {
        setSettings(DEFAULT_SETTINGS)
      }
    }

    setIsLoaded(true)
  }, [])

  // Handle quick add from bookmarklet
  useEffect(() => {
    const isAdd = searchParams.get("add")
    const url = searchParams.get("url")
    const title = searchParams.get("title")

    if (isAdd === "1" && url) {
      setQuickAddUrl(decodeURIComponent(url))
      setQuickAddTitle(title ? decodeURIComponent(title) : "")
      setIsModalOpen(true)
      router.replace("/", { scroll: false })
    }
  }, [searchParams, router])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("my-links", JSON.stringify(links))
    }
  }, [links, isLoaded])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("my-links-settings", JSON.stringify(settings))
    }
  }, [settings, isLoaded])

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

  const handleAddLink = (title: string, url: string) => {
    const newLink: Link = {
      id: Date.now().toString(),
      title,
      url,
    }
    setLinks((prev) => [...prev, newLink])
  }

  const handleDeleteLink = (id: string) => {
    setLinks((prev) => prev.filter((link) => link.id !== id))
  }

  const handleDeleteLinks = (ids: string[]) => {
    setLinks((prev) => prev.filter((link) => !ids.includes(link.id)))
  }

  const handleLongPress = (id: string) => {
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

  const handleCancelSelection = () => {
    setIsSelectionMode(false)
    setSelectedIds([])
  }

  const getGridClasses = () => {
    const baseColumns = settings.columns
    const columnClasses: Record<number, string> = {
      2: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6",
      3: "grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8",
      4: "grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10",
      5: "grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12",
    }
    return columnClasses[baseColumns] || columnClasses[3]
  }

  const getGapClasses = () => {
    const gapClasses: Record<string, string> = {
      small: "gap-2 sm:gap-2.5",
      medium: "gap-3 sm:gap-4",
      large: "gap-4 sm:gap-5",
    }
    return gapClasses[settings.boxSize] || gapClasses.medium
  }

  const getBoxSizeClasses = () => {
    const sizeClasses: Record<string, string> = {
      small: "text-[10px] sm:text-xs",
      medium: "",
      large: "text-sm sm:text-base",
    }
    return sizeClasses[settings.boxSize] || ""
  }

  if (!isLoaded) {
    return (
      <main className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className={`grid ${getGridClasses()} ${getGapClasses()}`}>
            {[...Array(9)].map((_, i) => (
              <div
                key={i}
                className="aspect-square bg-card rounded-xl border border-border animate-pulse"
              />
            ))}
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {isEditLayoutMode ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={links.map((l) => l.id)} strategy={rectSortingStrategy}>
              <div className={`grid ${getGridClasses()} ${getGapClasses()} ${getBoxSizeClasses()}`}>
                {links.map((link) => (
                  <SortableLinkBox key={link.id} id={link.id} title={link.title} url={link.url} size={settings.boxSize} columns={settings.columns} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className={`grid ${getGridClasses()} ${getGapClasses()} ${getBoxSizeClasses()}`}>
            {!isSelectionMode && <AddLinkBox onClick={() => setIsModalOpen(true)} />}

            {links.map((link) => (
              <LinkBox
                key={link.id}
                id={link.id}
                title={link.title}
                url={link.url}
                onDelete={handleDeleteLink}
                size={settings.boxSize}
                columns={settings.columns}
                isSelectionMode={isSelectionMode}
                isSelected={selectedIds.includes(link.id)}
                onLongPress={handleLongPress}
                onSelect={handleSelect}
              />
            ))}

            {!isSelectionMode && <SettingsBox onClick={() => setIsSettingsOpen(true)} />}
          </div>
        )}
      </div>

      {isEditLayoutMode && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-card border border-border rounded-2xl shadow-2xl px-4 py-3">
          <GripVertical className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">드래그로 순서 변경</span>
          <button
            onClick={() => setIsEditLayoutMode(false)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium"
          >
            완료
          </button>
        </div>
      )}

      {isSelectionMode && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-card border border-border rounded-2xl shadow-2xl px-4 py-3">
          <span className="text-sm text-muted-foreground min-w-[60px] text-center">
            {selectedIds.length}개 선택
          </span>
          <button
            onClick={handleSelectionDelete}
            disabled={selectedIds.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-xl text-sm font-medium disabled:opacity-40 transition-opacity"
          >
            <Trash2 className="w-4 h-4" />
            삭제
          </button>
          <button
            onClick={handleCancelSelection}
            className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-xl text-sm font-medium transition-colors hover:bg-muted/80"
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
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSettingsChange={setSettings}
        links={links}
        onDeleteLinks={handleDeleteLinks}
        onEditLayout={() => { setIsSettingsOpen(false); setIsEditLayoutMode(true) }}
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
