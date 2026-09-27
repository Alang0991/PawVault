"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

export interface StorefrontTab {
  value: string
  label: string
  count?: number
  content: React.ReactNode
}

/**
 * Storefront section navigation: Products / Commissions / Reviews / About.
 *
 * Tabs rather than separate routes so the whole storefront reads as one
 * page — a creator's products, services and reputation sit together
 * rather than three pages to bounce between. See the design
 * direction §9.
 */
export function StorefrontTabs({
  tabs,
  defaultValue = "products",
}: {
  tabs: StorefrontTab[]
  defaultValue?: string
}) {
  const [value, setValue] = useState(defaultValue)

  return (
    <Tabs value={value} onValueChange={setValue}>
      <div className="border-b border-border">
        <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto bg-transparent p-0">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className={cn(
                "rounded-none border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-text-muted transition-colors",
                "hover:text-text-primary",
                "data-[state=active]:border-accent data-[state=active]:text-text-primary"
              )}
            >
              {tab.label}
              {typeof tab.count === "number" && tab.count > 0 && (
                <span className="ml-1.5 text-xs text-text-muted">{tab.count}</span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value} className="mt-6">
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  )
}
