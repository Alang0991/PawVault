import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default function AccountSettingsPage() {
  // Canonical account settings now live at /settings (AccountSettingsForm +
  // DisplayPreferences + notifications/sessions/privacy/delete). This redirect
  // removes the duplicate account/settings route and keeps a single source of truth.
  redirect("/settings")
}