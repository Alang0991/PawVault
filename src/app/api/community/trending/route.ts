import { NextResponse } from "next/server"

export async function GET() {
  const mockTrending = [
    { tag: "vrchat", postCount: 1240, growth: 15 },
    { tag: "avatar-commission", postCount: 890, growth: 23 },
    { tag: "quest-compatible", postCount: 650, growth: 8 },
    { tag: "unity-2022", postCount: 420, growth: 45 },
    { tag: "shader-graph", postCount: 380, growth: 12 },
    { tag: "blender-tips", postCount: 310, growth: -2 },
    { tag: "vtuber-assets", postCount: 290, growth: 31 },
    { tag: "furry-art", postCount: 270, growth: 5 },
    { tag: "optimization", postCount: 250, growth: 18 },
    { tag: "pawvault-update", postCount: 180, growth: 67 },
  ]

  return NextResponse.json({ topics: mockTrending })
}