import db from "../localdb/index"
import { IConfiguration } from "../types/config.types" // Import explicit type

// Fetch configuration from backend and store in IndexedDB
export const fetchAndCacheConfig = async (): Promise<void> => {
  if (!navigator.onLine) {
    console.log("Offline: Fetching configuration from local storage.")
    return
  }

  try {
    const response = await fetch("http://localhost:5050/api/config")
    if (response.ok) {
      const config: IConfiguration = await response.json()
      console.log("Configuration fetched from backend:", config)

      // Store configuration in IndexedDB
      await db.table("config").clear() // Clear old settings
      await db.table("config").add(config)
    }
  } catch (error) {
    console.error("Failed to fetch configuration:", error)
  }
}

// Get configuration from IndexedDB (fallback for offline mode)
export const getConfigOffline = async (): Promise<{
  tables: number[]
} | null> => {
  const config = await db.table("config").toArray()

  if (config.length === 0) {
    console.warn("Config missing in IndexedDB, fetching online...")
    const fetchedConfig = await fetchConfigOnline()
    return fetchedConfig // ✅ Ensure the function returns fetched config
  }

  return config[0] as { tables: number[] }
}

export const fetchConfigOnline = async (): Promise<{
  tables: number[]
} | null> => {
  if (!navigator.onLine) return null

  try {
    const response = await fetch("http://localhost:5050/api/config")
    if (!response.ok) throw new Error("Failed to fetch config")

    const config: { tables: number[] } = await response.json()

    await db.table("config").clear()
    await db.table("config").add(config)

    console.log("Fetched and cached config:", config)
    return config // ✅ Now returns the fetched config
  } catch (error) {
    console.error("Error fetching config:", error)
    return null // ✅ Ensures a proper return type
  }
}

// Update configuration (online and offline)
export const updateConfig = async (
  configData: IConfiguration
): Promise<void> => {
  if (navigator.onLine) {
    try {
      const response = await fetch("http://localhost:5050/api/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(configData),
      })

      if (response.ok) {
        console.log("Configuration updated successfully.")
        await fetchAndCacheConfig() // Sync after update
      } else {
        console.error(`Failed to update configuration: ${response.statusText}`)
      }
    } catch (error) {
      console.warn(
        "Failed to update configuration online. Saving locally.",
        error
      )
      await saveConfigOffline(configData)
    }
  } else {
    console.warn("Offline: Saving configuration locally.")
    await saveConfigOffline(configData)
  }
}

// Save configuration locally for offline sync
const saveConfigOffline = async (configData: IConfiguration): Promise<void> => {
  try {
    await db.table("config").clear()
    await db.table("config").add(configData)
    console.log("Configuration saved locally.")
  } catch (error) {
    console.error("Failed to save configuration offline:", error)
  }
}
