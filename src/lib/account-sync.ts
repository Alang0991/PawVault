"use client"

export function notifyAccountUpdate() {
  if (typeof window === "undefined") return

  try {
    const bc = new BroadcastChannel("pawvault-account-sync")
    bc.postMessage({ type: "account-updated" })
    bc.close()
  } catch {
    // BroadcastChannel may not be available in all environments
  }

  try {
    localStorage.setItem("pawvault-account-sync", Date.now().toString())
  } catch {
    // localStorage may be unavailable
  }
}
