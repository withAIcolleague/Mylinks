"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
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
  { id: "1", title: "Google", url: "https://google.com" },
  { id: "2", title: "YouTube", url: "https://youtube.com" },
  { id: "3", title: "GitHub", url: "https://github.com" },
  { id: "4", title: "Notion", url: "https://notion.so" },
  { id: "5", title: "Twitter", url: "https://twitter.com" },
]

const DEFAULT_SETTINGS: Settings = {
  theme: "system",
  columns: 3,
  boxSize: "medium",
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

  useEffect(() => {
    const savedLinks = localStorage.getItem("my-links")
    const savedSettings = localStorage.getItem("my-links-settings")
    
    if (savedLinks) {
      try {
        setLinks(JSON.parse(savedLinks))
      } catch {
        setLinks(DEFAULT_LINKS)
      }
    } else {
      setLinks(DEFAULT_LINKS)
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
        <div className={`grid ${getGridClasses()} ${getGapClasses()} ${getBoxSizeClasses()}`}>
          <AddLinkBox onClick={() => setIsModalOpen(true)} />
          
          {links.map((link) => (
            <LinkBox
              key={link.id}
              id={link.id}
              title={link.title}
              url={link.url}
              onDelete={handleDeleteLink}
              size={settings.boxSize}
              columns={settings.columns}
            />
          ))}

          <SettingsBox onClick={() => setIsSettingsOpen(true)} />
        </div>
      </div>

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
