import { supabase } from "./supabase"
import { Tab } from "@/components/vertical-tab-bar"

export interface Link {
  id: string
  title: string
  url: string
  tabId?: string
}

export interface Settings {
  theme: "system" | "dark" | "light"
  columns: number
  boxSize: "small" | "medium" | "large"
}

const TABLE_NAME = "app_state"

export async function fetchRemoteState(): Promise<{
  links: Link[] | null
  tabs: Tab[] | null
  settings: Settings | null
}> {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("key, value")

    if (error) {
      console.warn("Supabase fetch warning:", error.message)
      return { links: null, tabs: null, settings: null }
    }

    if (!data || data.length === 0) {
      return { links: null, tabs: null, settings: null }
    }

    const linksRow = data.find((row) => row.key === "links")
    const tabsRow = data.find((row) => row.key === "tabs")
    const settingsRow = data.find((row) => row.key === "settings")

    return {
      links: linksRow ? (linksRow.value as Link[]) : null,
      tabs: tabsRow ? (tabsRow.value as Tab[]) : null,
      settings: settingsRow ? (settingsRow.value as Settings) : null,
    }
  } catch (err) {
    console.error("Failed to fetch state from Supabase:", err)
    return { links: null, tabs: null, settings: null }
  }
}

export async function saveRemoteLinks(links: Link[]) {
  try {
    await supabase.from(TABLE_NAME).upsert(
      { key: "links", value: links, updated_at: new Date().toISOString() },
      { onConflict: "key" }
    )
  } catch (err) {
    console.error("Failed to save links to Supabase:", err)
  }
}

export async function saveRemoteTabs(tabs: Tab[]) {
  try {
    await supabase.from(TABLE_NAME).upsert(
      { key: "tabs", value: tabs, updated_at: new Date().toISOString() },
      { onConflict: "key" }
    )
  } catch (err) {
    console.error("Failed to save tabs to Supabase:", err)
  }
}

export async function saveRemoteSettings(settings: Settings) {
  try {
    await supabase.from(TABLE_NAME).upsert(
      { key: "settings", value: settings, updated_at: new Date().toISOString() },
      { onConflict: "key" }
    )
  } catch (err) {
    console.error("Failed to save settings to Supabase:", err)
  }
}

export function subscribeToRemoteChanges(
  onLinksUpdate: (links: Link[]) => void,
  onTabsUpdate: (tabs: Tab[]) => void,
  onSettingsUpdate?: (settings: Settings) => void
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
          onSettingsUpdate(row.value as Settings)
        }
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}
