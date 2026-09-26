"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Upload, Loader2 } from "lucide-react"

export default function EditProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [avatar, setAvatar] = useState("")
  const [formData, setFormData] = useState({
    displayName: "",
    username: "",
    bio: "",
    website: "",
    location: "",
    twitter: "",
    youtube: "",
    discord: "",
    instagram: "",
  })

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/user/profile")
        if (res.ok) {
          const data = await res.json()
          const u = data.user || {}
          const social = parseSocial(u.profile?.socialLinks)
          setAvatar(u.avatar || "")
          setFormData({
            displayName: u.displayName || "",
            username: u.username || "",
            bio: u.bio || "",
            website: u.website || "",
            location: u.location || "",
            twitter: social.twitter || "",
            youtube: social.youtube || "",
            discord: social.discord || "",
            instagram: social.instagram || "",
          })
        }
      } catch {
        /* ignore */
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  function parseSocial(raw: any): Record<string, string> {
    if (!raw) return {}
    try {
      return typeof raw === "string" ? JSON.parse(raw) : raw
    } catch {
      return {}
    }
  }

  const onAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarUploading(true)
    setError("")
    try {
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/account/profile/avatar", { method: "POST", body: fd })
      if (res.ok) {
        const data = await res.json()
        setAvatar(data.avatar)
        setSuccess("Profile picture updated")
      } else {
        const err = await res.json()
        setError(err.error || "Avatar upload failed")
      }
    } catch {
      setError("Avatar upload failed")
    } finally {
      setAvatarUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")
    setSuccess("")
    try {
      const socialLinks: Record<string, string> = {}
      if (formData.twitter) socialLinks.twitter = formData.twitter
      if (formData.youtube) socialLinks.youtube = formData.youtube
      if (formData.discord) socialLinks.discord = formData.discord
      if (formData.instagram) socialLinks.instagram = formData.instagram

      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: formData.displayName,
          username: formData.username,
          bio: formData.bio,
          website: formData.website || undefined,
          location: formData.location,
          socialLinks,
        }),
      })
      if (res.ok) {
        setSuccess("Profile updated successfully")
      } else {
        const err = await res.json()
        setError(err.error || "Failed to update profile")
      }
    } catch {
      setError("Something went wrong")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Edit Profile</h1>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-8">Edit Profile</h1>
        <Card>
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={avatar} />
                <AvatarFallback>{(formData.displayName || formData.username || "U")[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <label className="cursor-pointer">
                <span className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted">
                  {avatarUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  {avatarUploading ? "Uploading..." : "Upload new picture"}
                </span>
                <input type="file" accept="image/*" className="hidden" onChange={onAvatar} />
              </label>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader><CardTitle>Profile Information</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input id="displayName" value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" rows={4} value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" type="url" value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
              </div>

              <div className="pt-2 border-t">
                <p className="text-sm font-medium mb-2">Social Links</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input placeholder="Twitter" value={formData.twitter} onChange={(e) => setFormData({ ...formData, twitter: e.target.value })} />
                  <Input placeholder="YouTube" value={formData.youtube} onChange={(e) => setFormData({ ...formData, youtube: e.target.value })} />
                  <Input placeholder="Discord" value={formData.discord} onChange={(e) => setFormData({ ...formData, discord: e.target.value })} />
                  <Input placeholder="Instagram" value={formData.instagram} onChange={(e) => setFormData({ ...formData, instagram: e.target.value })} />
                </div>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}
              {success && <p className="text-sm text-green-600">{success}</p>}
              <Button type="submit" disabled={saving} className="gradient-bg text-white">
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
