'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Search,
  Plus,
  BookOpen,
  Scale,
  FileText,
  ScrollText,
  Gavel,
  MessageSquare,
  ListChecks,
  Clipboard,
  Info,
  File,
  ExternalLink,
  Calendar,
  Tag,
  Trash2,
  Eye,
  Bot,
  Library,
  Sparkles,
} from 'lucide-react'
import {
  knowledgeTypeLabels,
  practiceAreaLabels,
  type KnowledgeType,
  type PracticeArea,
} from '@/lib/schemas/knowledge'
import { KnowledgeChat } from '@/components/knowledge/knowledge-chat'
import { format } from 'date-fns'
import { he } from 'date-fns/locale'

const knowledgeTypeIcons: Record<KnowledgeType, React.ReactNode> = {
  STATUTE: <Scale className="h-4 w-4" />,
  REGULATION: <ScrollText className="h-4 w-4" />,
  PRECEDENT: <Gavel className="h-4 w-4" />,
  LEGAL_OPINION: <MessageSquare className="h-4 w-4" />,
  TEMPLATE: <FileText className="h-4 w-4" />,
  ARTICLE: <BookOpen className="h-4 w-4" />,
  PROCEDURE: <ListChecks className="h-4 w-4" />,
  FORM: <Clipboard className="h-4 w-4" />,
  GUIDELINE: <Info className="h-4 w-4" />,
  OTHER: <File className="h-4 w-4" />,
}

export default function KnowledgePage() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [practiceAreaFilter, setPracticeAreaFilter] = useState<string>('')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const queryClient = useQueryClient()

  // Fetch knowledge items
  const { data, isLoading } = useQuery({
    queryKey: ['knowledge', search, typeFilter, practiceAreaFilter],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (typeFilter) params.append('type', typeFilter)
      if (practiceAreaFilter) params.append('practiceArea', practiceAreaFilter)
      const res = await fetch(`/api/knowledge?${params}`)
      return res.ok ? res.json() : { items: [], total: 0 }
    },
  })

  // Add knowledge item mutation
  const addMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to add')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge'] })
      setShowAddDialog(false)
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/knowledge/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge'] })
      setSelectedItem(null)
    },
  })

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const tags = formData.get('tags')?.toString().split(',').map(t => t.trim()).filter(Boolean) || []

    addMutation.mutate({
      title: formData.get('title'),
      type: formData.get('type'),
      practiceArea: formData.get('practiceArea') || null,
      content: formData.get('content'),
      summary: formData.get('summary') || null,
      citation: formData.get('citation') || null,
      source: formData.get('source') || null,
      sourceUrl: formData.get('sourceUrl') || null,
      tags,
      isPublic: formData.get('isPublic') === 'on',
    })
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header with gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-transparent p-6 animate-fade-in-up">
        <div className="absolute inset-0 bg-mesh-gradient opacity-30" />
        <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
                <Library className="h-5 w-5" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-l from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                מאגר ידע משפטי
              </h1>
            </div>
            <p className="text-muted-foreground">
              חוקים, פסיקה, תבניות ומידע משפטי • שאל את הסוכן או העלה מסמכים
            </p>
          </div>

          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-gradient-to-l from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                <Plus className="h-4 w-4" />
                הוסף פריט
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>הוספת פריט למאגר הידע</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">כותרת *</Label>
                  <Input id="title" name="title" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">סוג *</Label>
                  <Select name="type" required>
                    <SelectTrigger>
                      <SelectValue placeholder="בחר סוג" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(knowledgeTypeLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          <span className="flex items-center gap-2">
                            {knowledgeTypeIcons[key as KnowledgeType]}
                            {label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="practiceArea">תחום משפט</Label>
                  <Select name="practiceArea">
                    <SelectTrigger>
                      <SelectValue placeholder="בחר תחום" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(practiceAreaLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="citation">ציטוט משפטי</Label>
                  <Input id="citation" name="citation" placeholder="לדוגמה: ע״א 1234/20" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="summary">תקציר</Label>
                <Textarea id="summary" name="summary" rows={2} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">תוכן *</Label>
                <Textarea id="content" name="content" rows={6} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="source">מקור</Label>
                  <Input id="source" name="source" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sourceUrl">קישור למקור</Label>
                  <Input id="sourceUrl" name="sourceUrl" type="url" dir="ltr" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">תגיות (מופרדות בפסיק)</Label>
                <Input id="tags" name="tags" placeholder="חוזים, נזיקין, פסיקה" />
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="isPublic" name="isPublic" className="rounded" />
                <Label htmlFor="isPublic">שתף עם כל המשרד</Label>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                  ביטול
                </Button>
                <Button type="submit" disabled={addMutation.isPending}>
                  {addMutation.isPending ? 'שומר...' : 'שמור'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Content with Tabs */}
      <Tabs defaultValue="chat" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2 bg-muted/50 backdrop-blur-sm">
          <TabsTrigger value="chat" className="gap-2 data-[state=active]:bg-gradient-to-l data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white">
            <Bot className="h-4 w-4" />
            סוכן חכם
          </TabsTrigger>
          <TabsTrigger value="library" className="gap-2 data-[state=active]:bg-gradient-to-l data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white">
            <Library className="h-4 w-4" />
            ספריה
          </TabsTrigger>
        </TabsList>

        {/* Chat Tab */}
        <TabsContent value="chat" className="mt-6 animate-fade-in-up">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chat Interface */}
            <div className="lg:col-span-2">
              <KnowledgeChat />
            </div>

            {/* Quick Stats Sidebar */}
            <div className="space-y-4">
              <Card className="glass-premium border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-blue-500" />
                    מה הסוכן יכול לעשות
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>לענות על שאלות משפטיות מהמאגר</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <FileText className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>לקרוא ולסווג מסמכים חדשים</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Tag className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                    <span>לתייג ולארגן תוכן אוטומטית</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <BookOpen className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span>לחפש פסיקה וחקיקה רלוונטית</span>
                  </div>
                </CardContent>
              </Card>

              {/* Stats */}
              <Card className="glass-premium border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">סטטיסטיקת מאגר</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">חוקים</span>
                    <Badge variant="secondary">{data?.items?.filter((i: any) => i.type === 'STATUTE').length || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">פסיקה</span>
                    <Badge variant="secondary">{data?.items?.filter((i: any) => i.type === 'PRECEDENT').length || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">תבניות</span>
                    <Badge variant="secondary">{data?.items?.filter((i: any) => i.type === 'TEMPLATE').length || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between font-medium">
                    <span className="text-sm">סה״כ</span>
                    <Badge className="bg-gradient-to-l from-blue-500 to-indigo-600 text-white">{data?.total || 0}</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Library Tab */}
        <TabsContent value="library" className="mt-6 space-y-6 animate-fade-in-up">
          {/* Search and Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="חיפוש במאגר..."
                className="pe-10 bg-background/50 backdrop-blur-sm border-muted/50 focus:border-blue-500/50 transition-colors"
              />
            </div>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px] bg-background/50 backdrop-blur-sm border-muted/50">
                <SelectValue placeholder="סוג פריט" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">הכל</SelectItem>
                {Object.entries(knowledgeTypeLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={practiceAreaFilter} onValueChange={setPracticeAreaFilter}>
              <SelectTrigger className="w-[180px] bg-background/50 backdrop-blur-sm border-muted/50">
                <SelectValue placeholder="תחום משפט" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">הכל</SelectItem>
                {Object.entries(practiceAreaLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-premium">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                <Scale className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data?.items?.filter((i: any) => i.type === 'STATUTE').length || 0}</p>
                <p className="text-sm text-muted-foreground">חוקים</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-premium">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/30">
                <Gavel className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data?.items?.filter((i: any) => i.type === 'PRECEDENT').length || 0}</p>
                <p className="text-sm text-muted-foreground">פסיקה</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-premium">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-green-100 dark:bg-green-900/30">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data?.items?.filter((i: any) => i.type === 'TEMPLATE').length || 0}</p>
                <p className="text-sm text-muted-foreground">תבניות</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-premium">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-orange-100 dark:bg-orange-900/30">
                <BookOpen className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data?.total || 0}</p>
                <p className="text-sm text-muted-foreground">סה״כ פריטים</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-4" />
                <div className="h-3 bg-muted rounded w-1/2 mb-2" />
                <div className="h-20 bg-muted rounded" />
              </CardContent>
            </Card>
          ))
        ) : data?.items?.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">אין פריטים במאגר</p>
            <p className="text-sm">התחל להוסיף חוקים, פסיקה ותבניות</p>
          </div>
        ) : (
          data?.items?.map((item: any) => (
            <Card
              key={item.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedItem(item)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-muted">
                      {knowledgeTypeIcons[item.type as KnowledgeType]}
                    </div>
                    <Badge variant="outline">{knowledgeTypeLabels[item.type as KnowledgeType]}</Badge>
                  </div>
                  {item.isPublic && (
                    <Badge variant="secondary">משותף</Badge>
                  )}
                </div>
                <CardTitle className="text-lg mt-2">{item.title}</CardTitle>
                {item.citation && (
                  <CardDescription>{item.citation}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {item.summary || item.content}
                </p>
                {item.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {item.tags.slice(0, 3).map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {item.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{item.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
          </div>
        </TabsContent>
      </Tabs>

      {/* View Item Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto glass-premium border-border/50">
          {selectedItem && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20">
                    {knowledgeTypeIcons[selectedItem.type as KnowledgeType]}
                  </div>
                  <Badge className="bg-gradient-to-l from-blue-500 to-indigo-600 text-white">
                    {knowledgeTypeLabels[selectedItem.type as KnowledgeType]}
                  </Badge>
                  {selectedItem.practiceArea && (
                    <Badge variant="outline">
                      {practiceAreaLabels[selectedItem.practiceArea as PracticeArea]}
                    </Badge>
                  )}
                </div>
                <DialogTitle className="text-xl">{selectedItem.title}</DialogTitle>
                {selectedItem.citation && (
                  <p className="text-muted-foreground">{selectedItem.citation}</p>
                )}
              </DialogHeader>

              <div className="space-y-4">
                {selectedItem.summary && (
                  <div className="p-4 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-xl border border-border/50">
                    <h4 className="font-semibold mb-2 text-blue-600 dark:text-blue-400">תקציר</h4>
                    <p>{selectedItem.summary}</p>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold mb-2">תוכן</h4>
                  <div className="prose prose-sm max-w-none whitespace-pre-wrap p-4 rounded-xl bg-muted/30">
                    {selectedItem.content}
                  </div>
                </div>

                {(selectedItem.source || selectedItem.sourceUrl) && (
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {selectedItem.source && (
                      <span>מקור: {selectedItem.source}</span>
                    )}
                    {selectedItem.sourceUrl && (
                      <a
                        href={selectedItem.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-500 hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        קישור למקור
                      </a>
                    )}
                  </div>
                )}

                {selectedItem.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2 items-center">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    {selectedItem.tags.map((tag: string) => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-4 border-t border-border/50">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    נוצר: {format(new Date(selectedItem.createdAt), 'dd/MM/yyyy', { locale: he })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    עודכן: {format(new Date(selectedItem.updatedAt), 'dd/MM/yyyy', { locale: he })}
                  </span>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="destructive"
                  onClick={() => deleteMutation.mutate(selectedItem.id)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4 me-2" />
                  מחק
                </Button>
                <Button variant="outline" onClick={() => setSelectedItem(null)}>
                  סגור
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
