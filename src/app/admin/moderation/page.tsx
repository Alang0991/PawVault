'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertTriangle, CheckCircle, XCircle, Users, FileText, MessageSquare } from 'lucide-react'

interface Report {
  id: string
  type: 'asset' | 'user' | 'review' | 'message'
  reason: string
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
  createdAt: string
  reporter: {
    username: string
    email: string
  }
  target: {
    id: string
    title?: string
    username?: string
  }
}

export default function ModerationPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('pending')

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user?.role !== 'ADMIN') {
      router.replace('/auth/signin')
      return
    }

    async function fetchReports() {
      try {
        const res = await fetch('/api/admin/moderation')
        if (res.ok) {
          const data = await res.json()
          setReports(data.reports || [])
        } else if (res.status === 401 || res.status === 403) {
          router.replace('/auth/signin')
        }
      } finally {
        setLoading(false)
      }
    }
    fetchReports()
  }, [session, status, router])

  const handleAction = async (reportId: string, action: 'approve' | 'remove' | 'warn' | 'ban') => {
    try {
      const res = await fetch('/api/admin/moderation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, action }),
      })
      if (res.ok) {
        setReports(reports.map(r => 
          r.id === reportId 
            ? { ...r, status: action === 'approve' ? 'dismissed' : 'resolved' }
            : r
        ))
      }
    } catch (error) {
      console.error('Error updating report:', error)
    }
  }

  const filteredReports = reports.filter(report => {
    if (activeTab === 'all') return true
    return report.status === activeTab
  })

  const stats = {
    pending: reports.filter(r => r.status === 'pending').length,
    reviewed: reports.filter(r => r.status === 'reviewed').length,
    resolved: reports.filter(r => r.status === 'resolved').length,
    dismissed: reports.filter(r => r.status === 'dismissed').length,
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Moderation Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage reported content and users</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 bg-sky-100 text-sky-600 rounded-lg">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Reviewed</p>
                <p className="text-2xl font-bold">{stats.reviewed}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Resolved</p>
                <p className="text-2xl font-bold">{stats.resolved}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 bg-red-100 text-red-600 rounded-lg">
                <XCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Dismissed</p>
                <p className="text-2xl font-bold">{stats.dismissed}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
            <TabsTrigger value="reviewed">Reviewed ({stats.reviewed})</TabsTrigger>
            <TabsTrigger value="resolved">Resolved ({stats.resolved})</TabsTrigger>
            <TabsTrigger value="dismissed">Dismissed ({stats.dismissed})</TabsTrigger>
            <TabsTrigger value="all">All ({reports.length})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {filteredReports.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No reports found.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredReports.map((report) => (
                  <Card key={report.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={
                              report.type === 'asset' ? 'default' :
                              report.type === 'user' ? 'secondary' :
                              report.type === 'review' ? 'outline' : 'destructive'
                            }>
                              {report.type}
                            </Badge>
                            <Badge variant={
                              report.status === 'pending' ? 'secondary' :
                              report.status === 'resolved' ? 'default' : 'destructive'
                            }>
                              {report.status}
                            </Badge>
                          </div>
                          <h3 className="font-semibold mb-1">{report.reason}</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            Reported by {report.reporter.username || report.reporter.email}
                          </p>
                          <p className="text-sm">
                            Target: {report.target.title || report.target.username}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(report.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          {report.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleAction(report.id, 'remove')}
                              >
                                Remove
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAction(report.id, 'warn')}
                              >
                                Warn
                              </Button>
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleAction(report.id, 'approve')}
                              >
                                Approve
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
