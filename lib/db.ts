import { supabase } from "./supabase"
import { DEFAULT_TABS, Tab } from "@/components/vertical-tab-bar"

export interface Link {
  id: string
  title: string
  url: string
  tabId?: string
}

const TABLE_NAME = "app_state"

export async function fetchRemoteState(): Promise<{ links: Link[] | null; tabs: Tab[] | null }> {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("key, value")

    if (error) {
      console.warn("Supabase fetch warning:", error.message)
      return { links: null, tabs: null }
    }

    if (!data || data.length === 0) {
      return { links: null, tabs: null }
    }

    const linksRow = data.find((row) => row.key === "links")
    const tabsRow = data.find((row) => row.key === "tabs")

    return {
      links: linksRow ? (linksRow.value as Link[]) : null,
      tabs: tabsRow ? (tabsRow.value as Tab[]) : null,
    }
  } catch (err) {
    console.error("Failed to fetch state from Supabase:", err)
    return { links: null, tabs: null }
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

export function subscribeToRemoteChanges(
  onLinksUpdate: (links: Link[]) => void,
  onTabsUpdate: (tabs: Tab[]) => void
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
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}
