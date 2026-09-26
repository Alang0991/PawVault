import { NextResponse } from "next/server"

export async function GET() {
  const mockLeaderboard = [
    { id: "1", username: "topcreator_alex", displayName: "Alex Rivera", avatar: null, points: 15420, rank: "Community Legend" },
    { id: "2", username: "avatar_master", displayName: "Sam Chen", avatar: null, points: 12890, rank: "Top Creator" },
    { id: "3", username: "shader_wizard", displayName: "Jordan Kim", avatar: null, points: 11200, rank: "Top Creator" },
    { id: "4", username: "quest_optimizer", displayName: "Mike Johnson", avatar: null, points: 9850, rank: "Expert" },
    { id: "5", username: "art_commissioner_jane", displayName: "Jane Smith", avatar: null, points: 8720, rank: "Expert" },
    { id: "6", username: "unity_dev_ryan", displayName: "Ryan Park", avatar: null, points: 7640, rank: "Contributor" },
    { id: "7", username: "blender_pro", displayName: "Lisa Wang", avatar: null, points: 6580, rank: "Contributor" },
    { id: "8", username: "vrchat_guide", displayName: "Chris Taylor", avatar: null, points: 5430, rank: "Contributor" },
    { id: "9", username: "model_maker", displayName: "Taylor Brooks", avatar: null, points: 4320, rank: "Active Member" },
    { id: "10", username: "new_creator_amy", displayName: "Amy Foster", avatar: null, points: 3210, rank: "Rising Star" },
  ]

  return NextResponse.json({ users: mockLeaderboard })
}