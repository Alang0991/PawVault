import { NextResponse } from "next/server"

export async function GET() {
  const mockEvents = [
    {
      id: "1",
      title: "VRChat Avatar Showcase & Meetup",
      description: "Join us for a community avatar showcase! Bring your favorite avatars, meet other creators, and show off your work. Open mic for anyone who wants to present.",
      startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
      location: "VRChat World: Community Hub",
      imageUrl: null,
      isOnline: true,
      host: {
        id: "h1",
        username: "vrchat_events",
        displayName: "VRChat Events Team",
        avatar: null,
      },
      attendees: 47,
      maxAttendees: 80,
      tags: ["vrchat", "showcase", "meetup", "community"],
      status: "upcoming",
    },
    {
      id: "2",
      title: "Unity Shader Workshop for Beginners",
      description: "Learn the basics of writing custom shaders for VRChat avatars. We'll cover standard shaders, custom lighting, and optimization techniques.",
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
      location: "Discord Stage Channel",
      imageUrl: null,
      isOnline: true,
      host: {
        id: "h2",
        username: "shader_guru",
        displayName: "Shader Guru",
        avatar: null,
      },
      attendees: 23,
      maxAttendees: 50,
      tags: ["unity", "shaders", "workshop", "tutorial", "beginner"],
      status: "upcoming",
    },
    {
      id: "3",
      title: "PawVault Creator AMA",
      description: "Ask me anything about selling on PawVault, creator tools, and platform features. The founder and dev team will be answering questions live!",
      startDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 1.5 * 60 * 60 * 1000).toISOString(),
      location: "Twitch & Discord",
      imageUrl: null,
      isOnline: true,
      host: {
        id: "h3",
        username: "pawvault_founder",
        displayName: "PawVault Founder",
        avatar: null,
      },
      attendees: 156,
      maxAttendees: null,
      tags: ["ama", "pawvault", "creator", "platform", "questions"],
      status: "upcoming",
    },
  ]

  return NextResponse.json({ events: mockEvents })
}