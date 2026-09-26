import { redirect } from "next/navigation"

export default function LegacyNewProductPage() {
  redirect("/creator/products/new")
}
