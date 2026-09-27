import { redirect } from "next/navigation"

/**
 * /purchases rendered a second copy of the order list under the name
 * "My Imports", which left two pages showing the same data with
 * different wording. The design direction is explicit about not
 * building five slightly different versions of the same thing (§22),
 * so this now resolves to the single orders page. The route is kept so
 * existing bookmarks and external links still land somewhere sensible.
 */
export default function PurchasesPage() {
  redirect("/orders")
}
