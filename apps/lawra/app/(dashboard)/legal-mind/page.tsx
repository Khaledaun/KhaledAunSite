'use client'

import { useState, useRef, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useChat } from 'ai/react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { QUICK_ACTIONS } from '@/lib/ai/prompts'
import {
  Send,
  Loader2,
  Bot,
  User,
  MessageSquarePlus,
  Sparkles,
  FileText,
  Scale,
  Clock,
  Pencil,
  Search,
  FolderOpen,
  Users,
} from 'lucide-react'
import { format } from 'date-fns'
import { he } from 'date-fns/locale'

// Quick action icons
const actionIcons: Record<string, React.ReactNode> = {
  summarize: <FileText className="h-4 w-4" />,
  'draft-letter': <Pencil className="h-4 w-4" />,
  research: <Search className="h-4 w-4" />,
  arguments: <Scale className="h-4 w-4" />,
  deadline: <Clock className="h-4 w-4" />,
}

export default function LegalMindPage() {
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const preselectedClientId = searchParams.get('clientId')
  const preselectedCaseId = searchParams.get('caseId')

  const [selectedClientId, setSelectedClientId] = useState(preselectedClientId || '')
  const [selectedCaseId, setSelectedCaseId] = useState(preselectedCaseId || '')

  // Fetch clients
  const { data: clientsData } = useQuery({
    queryKey: ['clients-list'],
    queryFn: async () => {
      const res = await fetch('/api/clients?limit=100')
      if (!res.ok) throw new Error('Failed to fetch clients')
      return res.json()
    },
  })

  // Fetch cases
  const { data: casesData } = useQuery({
    queryKey: ['cases-list', selectedClientId],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: '100' })
      if (selectedClientId) params.set('clientId', selectedClientId)
      const res = await fetch(`/api/cases?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch cases')
      return res.json()
    },
  })

  // AI Chat hook
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    setInput,
    setMessages,
  } = useChat({
    api: '/api/ai/chat',
    body: {
      clientId: selectedClientId || undefined,
      caseId: selectedCaseId || undefined,
    },
    onError: (error) => {
      toast({
        title: 'שגיאה בשיחה',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  // Handle quick action click
  const handleQuickAction = (prompt: string) => {
    setInput(prompt + ' ')
    textareaRef.current?.focus()
  }

  // Handle new conversation
  const handleNewConversation = () => {
    setMessages([])
    setSelectedClientId('')
    setSelectedCaseId('')
  }

  // Handle form submit with Enter key (Shift+Enter for new line)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (input.trim()) {
        handleSubmit(e as any)
      }
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-background flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">לורה - Legal Mind</h1>
            <p className="text-sm text-muted-foreground">
              עוזרת משפטית מבוססת AI
            </p>
          </div>
        </div>

        <Button variant="outline" size="sm" onClick={handleNewConversation}>
          <MessageSquarePlus className="me-2 h-4 w-4" />
          שיחה חדשה
        </Button>
      </div>

      {/* Context selectors */}
      <div className="p-4 border-b bg-muted/30 flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedClientId} onValueChange={setSelectedClientId}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="בחר לקוח..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">ללא לקוח</SelectItem>
              {clientsData?.clients?.map((c: any) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <FolderOpen className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedCaseId} onValueChange={setSelectedCaseId}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="בחר תיק..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">ללא תיק</SelectItem>
              {casesData?.cases?.map((c: any) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Chat area */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        {messages.length === 0 ? (
          // Welcome screen
          <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto text-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">שלום! אני לורה</h2>
            <p className="text-muted-foreground mb-8">
              אני כאן לעזור לך בכל שאלה משפטית. אפשר לשאול אותי על דין ישראלי,
              לבקש עזרה בניסוח מסמכים, או לקבל רעיונות לטיעונים.
            </p>

            {/* Quick actions */}
            <div className="flex flex-wrap justify-center gap-2">
              {QUICK_ACTIONS.map((action) => (
                <Button
                  key={action.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction(action.prompt)}
                >
                  {actionIcons[action.id]}
                  <span className="ms-2">{action.label}</span>
                </Button>
              ))}
            </div>
          </div>
        ) : (
          // Messages
          <div className="space-y-4 max-w-3xl mx-auto">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback
                    className={
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }
                  >
                    {message.role === 'user' ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`flex-1 rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-muted">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 rounded-lg p-3 bg-muted">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-muted-foreground">חושב...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Input area */}
      <div className="p-4 border-t bg-background">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="flex gap-2">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="שאל שאלה משפטית..."
              rows={1}
              className="resize-none min-h-[44px] max-h-[200px]"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            לורה היא AI ולא תחליף לייעוץ משפטי מקצועי. תמיד ודא את המידע בפני עורך דין.
          </p>
        </form>
      </div>
    </div>
  )
}
