"use client"

import { useState, useEffect, Suspense, useMemo } from "react"
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
import { VerticalTabBar, Tab } from "@/components/vertical-tab-bar"
import {
  fetchRemoteState,
  saveRemoteLinks,
  saveRemoteTabs,
  subscribeToRemoteChanges,
} from "@/lib/db"

interface Link {
  id: string
  title: string
  url: string
  tabId?: string
}

interface Settings {
  theme: "system" | "dark" | "light"
  columns: number
  boxSize: "small" | "medium" | "large"
}

export const DEFAULT_TABS: Tab[] = [
  { id: "tab-community", name: "커뮤니티" },
  { id: "tab-ai-tech", name: "AI & IT뉴스" },
  { id: "tab-game-hw", name: "게임 & 하드웨어" },
  { id: "tab-sci-reddit", name: "과학 & 레딧" },
  { id: "tab-services", name: "AI 서비스 & 포털" },
]

const DEFAULT_LINKS: Link[] = [
  // 커뮤니티 (1 ~ 28)
  { id: "1", title: "뽐뿌", url: "https://www.ppomppu.co.kr/", tabId: "tab-community" },
  { id: "2", title: "에펨코리아", url: "https://www.fmkorea.com/", tabId: "tab-community" },
  { id: "3", title: "클리앙", url: "https://www.clien.net/", tabId: "tab-community" },
  { id: "4", title: "디시인사이드", url: "https://www.dcinside.com/", tabId: "tab-community" },
  { id: "5", title: "엠엘비파크", url: "https://mlbpark.donga.com/", tabId: "tab-community" },
  { id: "6", title: "더쿠", url: "https://theqoo.net/", tabId: "tab-community" },
  { id: "7", title: "보배드림", url: "https://www.bobaedream.co.kr/", tabId: "tab-community" },
  { id: "8", title: "블라인드", url: "https://www.teamblind.com/kr/", tabId: "tab-community" },
  { id: "9", title: "이토랜드", url: "https://www.etoland.co.kr/", tabId: "tab-community" },
  { id: "10", title: "인스티즈", url: "https://www.instiz.net/", tabId: "tab-community" },
  { id: "11", title: "웃긴대학", url: "https://humoruniv.com/", tabId: "tab-community" },
  { id: "12", title: "네이트판", url: "https://m.pann.nate.com/", tabId: "tab-community" },
  { id: "13", title: "개드립", url: "https://www.dogdrip.net/", tabId: "tab-community" },
  { id: "14", title: "일베", url: "https://www.ilbe.com/", tabId: "tab-community" },
  { id: "15", title: "아카라이브", url: "https://arca.live/", tabId: "tab-community" },
  { id: "16", title: "SLR클럽", url: "https://www.slrclub.com/", tabId: "tab-community" },
  { id: "17", title: "가생이닷컴", url: "http://www.gasengi.com/m", tabId: "tab-community" },
  { id: "18", title: "루리웹", url: "https://www.ruliweb.com/", tabId: "tab-community" },
  { id: "19", title: "오늘의유머", url: "https://www.todayhumor.co.kr/", tabId: "tab-community" },
  { id: "20", title: "와이고수", url: "https://www.ygosu.com/", tabId: "tab-community" },
  { id: "21", title: "82쿡", url: "https://www.82cook.com/", tabId: "tab-community" },
  { id: "22", title: "다모앙", url: "https://damoang.net/", tabId: "tab-community" },
  { id: "23", title: "인벤", url: "https://www.inven.co.kr/", tabId: "tab-community" },
  { id: "24", title: "딴지일보", url: "https://www.ddanzi.com/", tabId: "tab-community" },
  { id: "25", title: "디미토리", url: "https://www.dmitory.com/", tabId: "tab-community" },
  { id: "26", title: "해연갤", url: "https://hygall.com/", tabId: "tab-community" },
  { id: "27", title: "DVD프라임", url: "https://dvdprime.com/", tabId: "tab-community" },
  { id: "28", title: "스레딕", url: "https://thredic.com/", tabId: "tab-community" },

  // AI & IT뉴스 (29 ~ 61)
  { id: "29", title: "AI타임스", url: "https://www.aitimes.com/", tabId: "tab-ai-tech" },
  { id: "30", title: "인공지능신문", url: "https://www.aitimes.kr/", tabId: "tab-ai-tech" },
  { id: "31", title: "더에이아이", url: "https://www.newstheai.com/", tabId: "tab-ai-tech" },
  { id: "32", title: "AI포스트", url: "https://www.aipostkorea.com/", tabId: "tab-ai-tech" },
  { id: "33", title: "로봇신문", url: "https://www.irobotnews.com/", tabId: "tab-ai-tech" },
  { id: "34", title: "AI매터스", url: "https://aimatters.co.kr/", tabId: "tab-ai-tech" },
  { id: "35", title: "AI News", url: "https://www.artificialintelligence-news.com/", tabId: "tab-ai-tech" },
  { id: "36", title: "AI Magazine", url: "https://aimagazine.com/", tabId: "tab-ai-tech" },
  { id: "37", title: "MIT AI", url: "https://news.mit.edu/topic/artificial-intelligence2", tabId: "tab-ai-tech" },
  { id: "38", title: "VentureBeat", url: "https://venturebeat.com/", tabId: "tab-ai-tech" },
  { id: "39", title: "지디넷", url: "https://zdnet.co.kr/", tabId: "tab-ai-tech" },
  { id: "40", title: "IT World", url: "https://www.itworld.co.kr/", tabId: "tab-ai-tech" },
  { id: "41", title: "디지털데일리", url: "http://www.ddaily.co.kr/", tabId: "tab-ai-tech" },
  { id: "42", title: "씨넷코리아", url: "https://www.cnet.co.kr/", tabId: "tab-ai-tech" },
  { id: "43", title: "테크월드뉴스", url: "https://www.epnc.co.kr/", tabId: "tab-ai-tech" },
  { id: "44", title: "CIO코리아", url: "https://www.cio.com/kr/", tabId: "tab-ai-tech" },
  { id: "45", title: "디일렉", url: "https://www.thelec.kr/", tabId: "tab-ai-tech" },
  { id: "46", title: "전자신문", url: "https://www.etnews.com/", tabId: "tab-ai-tech" },
  { id: "47", title: "IT비즈뉴스", url: "https://www.itbiznews.com/", tabId: "tab-ai-tech" },
  { id: "48", title: "더테크", url: "https://www.the-tech.co.kr/", tabId: "tab-ai-tech" },
  { id: "49", title: "테크레시피", url: "https://techrecipe.co.kr/", tabId: "tab-ai-tech" },
  { id: "50", title: "아이티데일리", url: "https://www.itdaily.kr/", tabId: "tab-ai-tech" },
  { id: "51", title: "테크M", url: "https://www.techm.kr/", tabId: "tab-ai-tech" },
  { id: "52", title: "아웃스탠딩", url: "https://outstanding.kr/", tabId: "tab-ai-tech" },
  { id: "53", title: "컴퓨터월드", url: "http://www.comworld.co.kr/", tabId: "tab-ai-tech" },
  { id: "54", title: "플래텀", url: "https://platum.kr/", tabId: "tab-ai-tech" },
  { id: "55", title: "테크데일리", url: "http://www.techdaily.co.kr/", tabId: "tab-ai-tech" },
  { id: "56", title: "벤처스퀘어", url: "https://www.venturesquare.net/", tabId: "tab-ai-tech" },
  { id: "57", title: "보안뉴스", url: "https://m.boannews.com/", tabId: "tab-ai-tech" },
  { id: "58", title: "IT조선", url: "http://it.chosun.com/", tabId: "tab-ai-tech" },
  { id: "59", title: "IT동아", url: "https://it.donga.com/", tabId: "tab-ai-tech" },
  { id: "60", title: "베타뉴스", url: "http://www.betanews.net/", tabId: "tab-ai-tech" },
  { id: "61", title: "데이터넷", url: "http://www.datanet.co.kr/", tabId: "tab-ai-tech" },

  // 게임 & 하드웨어 (62 ~ 83)
  { id: "62", title: "디스이즈게임", url: "https://www.thisisgame.com/", tabId: "tab-game-hw" },
  { id: "63", title: "데일리게임", url: "https://www.dailygame.co.kr/", tabId: "tab-game-hw" },
  { id: "64", title: "게임포커스", url: "https://gamefocus.co.kr/", tabId: "tab-game-hw" },
  { id: "65", title: "퀘이사플레이", url: "https://quasarplay.com/", tabId: "tab-game-hw" },
  { id: "66", title: "플레이포럼", url: "https://www.playforum.net/", tabId: "tab-game-hw" },
  { id: "67", title: "게임메카", url: "https://www.gamemeca.com/", tabId: "tab-game-hw" },
  { id: "68", title: "게임톡", url: "https://www.gametoc.co.kr/", tabId: "tab-game-hw" },
  { id: "69", title: "인디게임닷컴", url: "https://indiegame.com/", tabId: "tab-game-hw" },
  { id: "70", title: "헝그리앱", url: "http://www.hungryapp.co.kr/", tabId: "tab-game-hw" },
  { id: "71", title: "게임인사이트", url: "http://www.gameinsight.co.kr/", tabId: "tab-game-hw" },
  { id: "72", title: "게임와이", url: "http://www.gamey.kr/", tabId: "tab-game-hw" },
  { id: "73", title: "경향게임스", url: "http://www.khgames.co.kr/", tabId: "tab-game-hw" },
  { id: "74", title: "게임샷", url: "http://www.gameshot.net/", tabId: "tab-game-hw" },
  { id: "75", title: "게임조선", url: "https://m.gamechosun.co.kr/", tabId: "tab-game-hw" },
  { id: "76", title: "쿨엔조이", url: "https://coolenjoy.net/", tabId: "tab-game-hw" },
  { id: "77", title: "퀘이사존", url: "https://quasarzone.com/", tabId: "tab-game-hw" },
  { id: "78", title: "기글하드웨어", url: "https://gigglehd.com/", tabId: "tab-game-hw" },
  { id: "79", title: "2CPU", url: "https://www.2cpu.co.kr/", tabId: "tab-game-hw" },
  { id: "80", title: "하드웨어배틀", url: "http://www.hwbattle.com/", tabId: "tab-game-hw" },
  { id: "81", title: "키보드랩", url: "https://kbdlab.co.kr/", tabId: "tab-game-hw" },
  { id: "82", title: "보드나라", url: "https://www.bodnara.co.kr/", tabId: "tab-game-hw" },
  { id: "83", title: "케이벤치", url: "http://www.kbench.com/", tabId: "tab-game-hw" },

  // 과학 & 레딧 (84 ~ 108)
  { id: "84", title: "파퓰러사이언스", url: "https://www.popsci.co.kr/", tabId: "tab-sci-reddit" },
  { id: "85", title: "사이언스타임즈", url: "https://www.sciencetimes.co.kr/", tabId: "tab-sci-reddit" },
  { id: "86", title: "동아사이언스", url: "https://www.dongascience.com/", tabId: "tab-sci-reddit" },
  { id: "87", title: "사이언스온", url: "https://scienceon.kisti.re.kr/", tabId: "tab-sci-reddit" },
  { id: "88", title: "YTN사이언스", url: "https://science.ytn.co.kr/", tabId: "tab-sci-reddit" },
  { id: "89", title: "헬로디디", url: "https://www.hellodd.com/", tabId: "tab-sci-reddit" },
  { id: "90", title: "BRIC", url: "https://www.ibric.org/", tabId: "tab-sci-reddit" },
  { id: "91", title: "MIT 테크리뷰", url: "https://www.technologyreview.kr/", tabId: "tab-sci-reddit" },
  { id: "92", title: "사이언스올", url: "https://www.scienceall.com/", tabId: "tab-sci-reddit" },
  { id: "93", title: "내셔널지오그래픽", url: "https://www.natgeokorea.com/", tabId: "tab-sci-reddit" },
  { id: "94", title: "MicrosoftFlightSim", url: "https://www.reddit.com/r/MicrosoftFlightSim/", tabId: "tab-sci-reddit" },
  { id: "95", title: "ClaudeAI", url: "https://www.reddit.com/r/ClaudeAI/", tabId: "tab-sci-reddit" },
  { id: "96", title: "ClaudeCode", url: "https://www.reddit.com/r/ClaudeCode/", tabId: "tab-sci-reddit" },
  { id: "97", title: "ChatGPT", url: "https://www.reddit.com/r/ChatGPT/", tabId: "tab-sci-reddit" },
  { id: "98", title: "GeminiAI", url: "https://www.reddit.com/r/GeminiAI/", tabId: "tab-sci-reddit" },
  { id: "99", title: "LocalLLM", url: "https://www.reddit.com/r/LocalLLM/", tabId: "tab-sci-reddit" },
  { id: "100", title: "PcBuild", url: "https://www.reddit.com/r/PcBuild/", tabId: "tab-sci-reddit" },
  { id: "101", title: "pcmasterrace", url: "https://www.reddit.com/r/pcmasterrace/", tabId: "tab-sci-reddit" },
  { id: "102", title: "science", url: "https://www.reddit.com/r/science/", tabId: "tab-sci-reddit" },
  { id: "103", title: "worldnews", url: "https://www.reddit.com/r/worldnews/", tabId: "tab-sci-reddit" },
  { id: "104", title: "singularity", url: "https://www.reddit.com/r/singularity/", tabId: "tab-sci-reddit" },
  { id: "105", title: "technology", url: "https://www.reddit.com/r/technology/", tabId: "tab-sci-reddit" },
  { id: "106", title: "wallstreetbets", url: "https://www.reddit.com/r/wallstreetbets/", tabId: "tab-sci-reddit" },
  { id: "107", title: "PiratedGames", url: "https://www.reddit.com/r/PiratedGames/", tabId: "tab-sci-reddit" },
  { id: "108", title: "Living_in_Korea", url: "https://www.reddit.com/r/Living_in_Korea/", tabId: "tab-sci-reddit" },
  { id: "133_1", title: "Visiting NYC", url: "https://www.reddit.com/r/visitingnyc/", tabId: "tab-sci-reddit" },
  { id: "133_2", title: "FoodNYC", url: "https://www.reddit.com/r/FoodNYC/", tabId: "tab-sci-reddit" },

  // AI 서비스 & 포털 (109 ~ 132)
  { id: "109", title: "ChatGPT", url: "https://chatgpt.com/", tabId: "tab-services" },
  { id: "110", title: "Claude", url: "https://claude.ai/", tabId: "tab-services" },
  { id: "111", title: "Grok", url: "https://grok.com/", tabId: "tab-services" },
  { id: "112", title: "Vercel", url: "https://vercel.com/dongyoungkims-projects", tabId: "tab-services" },
  { id: "113", title: "v0 by Vercel", url: "https://v0.app/", tabId: "tab-services" },
  { id: "114", title: "Gemini", url: "https://gemini.google.com/app", tabId: "tab-services" },
  { id: "115", title: "Manus", url: "https://manus.im/", tabId: "tab-services" },
  { id: "116", title: "젠스파크", url: "https://www.genspark.ai/agents?type=moa_chat", tabId: "tab-services" },
  { id: "117", title: "Perplexity", url: "https://www.perplexity.ai/", tabId: "tab-services" },
  { id: "118", title: "라이너", url: "https://getliner.com/ko", tabId: "tab-services" },
  { id: "119", title: "Copilot", url: "https://copilot.microsoft.com/chats/mryYMXi2E2ScnBvwuxQ4z", tabId: "tab-services" },
  { id: "120", title: "CLOVA X", url: "https://clova-x.naver.com/", tabId: "tab-services" },
  { id: "121", title: "에이닷", url: "https://adot.ai/multillm", tabId: "tab-services" },
  { id: "122", title: "Meta AI", url: "https://www.meta.ai/?utm_source=llama_meta_site&utm_medium=organic_social&utm_content=web_footer&utm_campaign=MetaAI", tabId: "tab-services" },
  { id: "123", title: "DeepSeek", url: "https://www.deepseek.com/", tabId: "tab-services" },
  { id: "124", title: "Hugging Face", url: "https://huggingface.co/", tabId: "tab-services" },
  { id: "125", title: "Cursor", url: "https://cursor.com/agents", tabId: "tab-services" },
  { id: "126", title: "Z.ai", url: "https://z.ai/chat", tabId: "tab-services" },
  { id: "127", title: "Replit", url: "https://replit.com/", tabId: "tab-services" },
  { id: "128", title: "안동뉴스", url: "https://www.adns.kr/", tabId: "tab-services" },
  { id: "129", title: "안동데일리", url: "https://www.andongdaily.com/", tabId: "tab-services" },
  { id: "130", title: "안동인터넷뉴스", url: "http://www.adinews.co.kr/", tabId: "tab-services" },
  { id: "131", title: "네이버", url: "https://www.naver.com/", tabId: "tab-services" },
  { id: "132", title: "다음", url: "https://www.daum.net/", tabId: "tab-services" },
]

const LINKS_VERSION = "6"

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
  const [tabs, setTabs] = useState<Tab[]>(DEFAULT_TABS)
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
    const savedVersion = localStorage.getItem("my-links-version")
    const savedLinks = localStorage.getItem("my-links")
    const savedTabs = localStorage.getItem("my-links-tabs")
    const savedActiveTab = localStorage.getItem("my-links-active-tab")
    const savedSettings = localStorage.getItem("my-links-settings")

    let loadedTabs = DEFAULT_TABS
    if (savedTabs) {
      try {
        loadedTabs = JSON.parse(savedTabs)
      } catch {
        loadedTabs = DEFAULT_TABS
      }
    }
    setTabs(loadedTabs)

    if (savedActiveTab) {
      setActiveTabId(savedActiveTab)
    }

    let loadedLinks = DEFAULT_LINKS
    if (savedLinks && savedVersion === LINKS_VERSION) {
      try {
        loadedLinks = JSON.parse(savedLinks)
      } catch {
        loadedLinks = DEFAULT_LINKS
      }
    } else {
      localStorage.setItem("my-links-version", LINKS_VERSION)
      localStorage.setItem("my-links", JSON.stringify(DEFAULT_LINKS))
      localStorage.setItem("my-links-tabs", JSON.stringify(DEFAULT_TABS))
    }
    setLinks(loadedLinks)

    let loadedSettings = DEFAULT_SETTINGS
    if (savedSettings) {
      try {
        loadedSettings = JSON.parse(savedSettings)
      } catch {
        loadedSettings = DEFAULT_SETTINGS
      }
    }
    setSettings(loadedSettings)

    setIsLoaded(true)

    // Supabase 원격 동기화
    fetchRemoteState().then(({ links: remoteLinks, tabs: remoteTabs }) => {
      if (remoteLinks && remoteLinks.length > 0) {
        setLinks(remoteLinks)
        localStorage.setItem("my-links", JSON.stringify(remoteLinks))
      } else {
        // 최초 DB 생성 시 현재 기본 링크 저장
        saveRemoteLinks(loadedLinks)
      }

      if (remoteTabs && remoteTabs.length > 0) {
        setTabs(remoteTabs)
        localStorage.setItem("my-links-tabs", JSON.stringify(remoteTabs))
      } else {
        // 최초 DB 생성 시 현재 기본 탭 저장
        saveRemoteTabs(loadedTabs)
      }
    })

    // 실시간 동기화 구독
    const unsubscribe = subscribeToRemoteChanges(
      (newLinks) => {
        setLinks(newLinks)
        localStorage.setItem("my-links", JSON.stringify(newLinks))
      },
      (newTabs) => {
        setTabs(newTabs)
        localStorage.setItem("my-links-tabs", JSON.stringify(newTabs))
      }
    )

    return () => {
      unsubscribe()
    }
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

  const handleSettingsChange = (newSettings: Settings) => {
    setSettings(newSettings)
    try {
      localStorage.setItem("my-links-settings", JSON.stringify(newSettings))
    } catch (e) {
      console.error("Failed to save settings to localStorage", e)
    }
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
    try {
      localStorage.setItem("my-links-tabs", JSON.stringify(updated))
    } catch (e) {
      console.error("Failed to save tabs", e)
    }
    saveRemoteTabs(updated)
  }

  const handleEditTab = (tabId: string, newName: string) => {
    const updated = tabs.map((t) => (t.id === tabId ? { ...t, name: newName } : t))
    setTabs(updated)
    try {
      localStorage.setItem("my-links-tabs", JSON.stringify(updated))
    } catch (e) {
      console.error("Failed to save tabs", e)
    }
    saveRemoteTabs(updated)
  }

  const handleDeleteTab = (tabId: string) => {
    const fallbackTabId = tabs.find((t) => t.id !== tabId)?.id || "tab-community"
    const updatedTabs = tabs.filter((t) => t.id !== tabId)
    const updatedLinks = links.map((l) => (l.tabId === tabId ? { ...l, tabId: fallbackTabId } : l))
    setTabs(updatedTabs)
    setLinks(updatedLinks)
    if (activeTabId === tabId) {
      handleSelectTab("all")
    }
    try {
      localStorage.setItem("my-links-tabs", JSON.stringify(updatedTabs))
      localStorage.setItem("my-links", JSON.stringify(updatedLinks))
    } catch (e) {
      console.error("Failed to save tabs and links", e)
    }
    saveRemoteTabs(updatedTabs)
    saveRemoteLinks(updatedLinks)
  }

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("my-links", JSON.stringify(links))
    }
  }, [links, isLoaded])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("my-links-tabs", JSON.stringify(tabs))
    }
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
      const tId = link.tabId || "tab-community"
      counts[tId] = (counts[tId] || 0) + 1
    })
    return counts
  }, [links])

  const currentLinks = useMemo(() => {
    if (activeTabId === "all") return links
    return links.filter((link) => (link.tabId || "tab-community") === activeTabId)
  }, [links, activeTabId])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setLinks((prev) => {
        const oldIndex = prev.findIndex((l) => l.id === active.id)
        const newIndex = prev.findIndex((l) => l.id === over.id)
        const updated = arrayMove(prev, oldIndex, newIndex)
        saveRemoteLinks(updated)
        return updated
      })
    }
  }

  const handleAddLink = (title: string, url: string, tabId?: string) => {
    const targetTabId = tabId || (activeTabId === "all" ? (tabs[0]?.id || "tab-community") : activeTabId)
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
      <div className="max-w-7xl mx-auto flex flex-row items-start">
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

        {/* 우측 외곽선 밀착 돌출 세로 인덱스 탭 */}
        <VerticalTabBar
          tabs={tabs}
          activeTabId={activeTabId}
          onSelectTab={handleSelectTab}
          onAddTab={handleAddTab}
          onEditTab={handleEditTab}
          onDeleteTab={handleDeleteTab}
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
