import { supabase } from "./supabase"
import { Tab } from "@/components/vertical-tab-bar"

export interface Link {
  id: string
  title: string
  url: string
  tabId: string
}

export interface Settings {
  theme: "system" | "dark" | "light"
  columns: number
  boxSize: "small" | "medium" | "large"
  tabPosition: "left" | "right"
}

const TABLE_NAME = "app_state"

// ok=false면 조회 실패 — 이 경우 "데이터 없음"으로 취급해 원격에 쓰면 안 됨
export type RemoteState =
  | { ok: true; links: Link[] | null; tabs: Tab[] | null; settings: Partial<Settings> | null }
  | { ok: false }

export async function fetchRemoteState(): Promise<RemoteState> {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("key, value")

    if (error) {
      console.error("Failed to fetch state from Supabase:", error.message)
      return { ok: false }
    }

    const linksRow = data?.find((row) => row.key === "links")
    const tabsRow = data?.find((row) => row.key === "tabs")
    const settingsRow = data?.find((row) => row.key === "settings")

    return {
      ok: true,
      links: linksRow ? (linksRow.value as Link[]) : null,
      tabs: tabsRow ? (tabsRow.value as Tab[]) : null,
      settings: settingsRow ? (settingsRow.value as Partial<Settings>) : null,
    }
  } catch (err) {
    console.error("Failed to fetch state from Supabase:", err)
    return { ok: false }
  }
}

// supabase-js는 실패 시 throw하지 않고 { error }를 반환하므로 직접 확인해야 함
async function saveRemote(key: string, value: unknown): Promise<boolean> {
  try {
    const { error } = await supabase.from(TABLE_NAME).upsert(
      { key, value, updated_at: new Date().toISOString() },
      { onConflict: "key" }
    )
    if (error) {
      console.error(`Failed to save ${key} to Supabase:`, error.message)
      return false
    }
    return true
  } catch (err) {
    console.error(`Failed to save ${key} to Supabase:`, err)
    return false
  }
}

export const saveRemoteLinks = (links: Link[]) => saveRemote("links", links)
export const saveRemoteTabs = (tabs: Tab[]) => saveRemote("tabs", tabs)
export const saveRemoteSettings = (settings: Settings) => saveRemote("settings", settings)

export function subscribeToRemoteChanges(
  onLinksUpdate: (links: Link[]) => void,
  onTabsUpdate: (tabs: Tab[]) => void,
  onSettingsUpdate?: (settings: Partial<Settings>) => void
) {
  const channel = supabase
    .channel("public:app_state")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: TABLE_NAME },
      (payload) => {
        const row = payload.new as { key: string; value: any }
        if (row && row.key === "links" && Array.isArray(row.value)) {
          onLinksUpdate(row.value)
        }
        if (row && row.key === "tabs" && Array.isArray(row.value)) {
          onTabsUpdate(row.value)
        }
        if (row && row.key === "settings" && row.value && onSettingsUpdate) {
          onSettingsUpdate(row.value as Partial<Settings>)
        }
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}
