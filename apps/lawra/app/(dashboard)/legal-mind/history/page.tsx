'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Brain,
  Search,
  MessageSquare,
  User,
  FolderOpen,
  Calendar,
  Trash2,
  Eye,
  ArrowRight,
  Sparkles,
  Bot,
} from 'lucide-react'
import { format } from 'date-fns'
import { he } from 'date-fns/locale'

export default function AIHistoryPage() {
  const [search, setSearch] = useState('')
  const [selectedConversation, setSelectedConversation] = useState<any>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const queryClient = useQueryClient()

  // Fetch AI conversations
  const { data, isLoading } = useQuery({
    queryKey: ['ai-conversations', search],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      const res = await fetch(`/api/ai/conversations?${params}`)
      return res.ok ? res.json() : { conversations: [] }
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/ai/conversations/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-conversations'] })
      setDeleteId(null)
    },
  })

  const groupConversationsByDate = (conversations: any[]) => {
    const groups: Record<string, any[]> = {}

    conversations.forEach((conv) => {
      const date = format(new Date(conv.createdAt), 'yyyy-MM-dd')
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(conv)
    })

    return groups
  }

  const groupedConversations = data?.conversations
    ? groupConversationsByDate(data.conversations)
    : {}

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6" />
            היסטוריית שיחות AI
          </h1>
          <p className="text-muted-foreground">כל השיחות עם לורה AI</p>
        </div>

        <Link href="/legal-mind">
          <Button className="gap-2">
            <Sparkles className="h-4 w-4" />
            שיחה חדשה
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="חיפוש בשיחות..."
          className="pe-10"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-premium">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-violet-100 dark:bg-violet-900/30">
                <MessageSquare className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data?.conversations?.length || 0}</p>
                <p className="text-sm text-muted-foreground">שיחות</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-premium">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                <FolderOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {data?.conversations?.filter((c: any) => c.caseId).length || 0}
                </p>
                <p className="text-sm text-muted-foreground">קשורות לתיקים</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-premium">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-green-100 dark:bg-green-900/30">
                <User className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {data?.conversations?.filter((c: any) => c.clientId).length || 0}
                </p>
                <p className="text-sm text-muted-foreground">קשורות ללקוחות</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-premium">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-orange-100 dark:bg-orange-900/30">
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {data?.conversations?.filter((c: any) => {
                    const date = new Date(c.createdAt)
                    const today = new Date()
                    return date.toDateString() === today.toDateString()
                  }).length || 0}
                </p>
                <p className="text-sm text-muted-foreground">היום</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conversations List */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="h-4 bg-muted rounded w-1/2 mb-3" />
                <div className="h-3 bg-muted rounded w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : Object.keys(groupedConversations).length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Brain className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="text-lg font-semibold mb-2">אין שיחות</h3>
            <p className="text-muted-foreground mb-4">התחל שיחה חדשה עם לורה AI</p>
            <Link href="/legal-mind">
              <Button className="gap-2">
                <Sparkles className="h-4 w-4" />
                התחל שיחה
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedConversations)
            .sort((a, b) => b[0].localeCompare(a[0]))
            .map(([date, conversations]) => (
              <div key={date}>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">
                  {format(new Date(date), 'EEEE, d בMMMM yyyy', { locale: he })}
                </h3>

                <div className="space-y-3">
                  {conversations.map((conv: any) => (
                    <Card
                      key={conv.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setSelectedConversation(conv)}
                    >
                      <CardContent className="py-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
                              <Bot className="h-5 w-5 text-white" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium truncate max-w-md">
                                {conv.title || 'שיחה ללא כותרת'}
                              </p>
                              <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                                {conv.messages?.[0]?.content?.slice(0, 100) || 'אין תוכן'}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                {conv.client && (
                                  <Badge variant="outline" className="gap-1 text-xs">
                                    <User className="h-3 w-3" />
                                    {conv.client.name}
                                  </Badge>
                                )}
                                {conv.case && (
                                  <Badge variant="outline" className="gap-1 text-xs">
                                    <FolderOpen className="h-3 w-3" />
                                    {conv.case.title}
                                  </Badge>
                                )}
                                <span className="text-xs text-muted-foreground">
                                  {format(new Date(conv.createdAt), 'HH:mm', { locale: he })}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation()
                                setDeleteId(conv.id)
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* View Conversation Dialog */}
      <Dialog open={!!selectedConversation} onOpenChange={() => setSelectedConversation(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          {selectedConversation && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedConversation.title || 'שיחה'}</DialogTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(selectedConversation.createdAt), 'dd/MM/yyyy HH:mm', { locale: he })}
                  {selectedConversation.client && (
                    <>
                      <span>•</span>
                      <User className="h-4 w-4" />
                      {selectedConversation.client.name}
                    </>
                  )}
                  {selectedConversation.case && (
                    <>
                      <span>•</span>
                      <FolderOpen className="h-4 w-4" />
                      {selectedConversation.case.title}
                    </>
                  )}
                </div>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto space-y-4 py-4">
                {selectedConversation.messages?.map((message: any, index: number) => (
                  <div
                    key={index}
                    className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role !== 'user' && (
                      <div className="p-2 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 h-8 w-8 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                    </div>
                    {message.role === 'user' && (
                      <div className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 h-8 w-8 flex items-center justify-center">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedConversation(null)}>
                  סגור
                </Button>
                <Link href={`/legal-mind?continue=${selectedConversation.id}`}>
                  <Button className="gap-2">
                    <MessageSquare className="h-4 w-4" />
                    המשך שיחה
                  </Button>
                </Link>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>מחיקת שיחה</AlertDialogTitle>
            <AlertDialogDescription>
              האם אתה בטוח שברצונך למחוק שיחה זו? פעולה זו אינה הפיכה.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              מחק
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
