'use client'

import { useState, useRef, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import {
  Send,
  Upload,
  FileText,
  File,
  X,
  Bot,
  User,
  Loader2,
  Sparkles,
  BookOpen,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Tag,
} from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  attachments?: FileAttachment[]
  isContextRequest?: boolean
  contextResponse?: string
  suggestedCategory?: {
    type: string
    practiceArea: string | null
    tags: string[]
  }
}

interface FileAttachment {
  name: string
  type: string
  size: number
  content?: string
  status: 'uploading' | 'processing' | 'ready' | 'error'
}

const QUICK_QUESTIONS = [
  'מהי תקופת ההתיישנות לתביעת נזיקין?',
  'מהם המועדים להגשת כתב הגנה?',
  'איך מחשבים פיצויי פיטורים?',
  'מה צריך לכלול בהסכם שכירות?',
]

export function KnowledgeChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [files, setFiles] = useState<FileAttachment[]>([])
  const [pendingContext, setPendingContext] = useState<{
    messageId: string
    question: string
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // Handle file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])

    for (const file of selectedFiles) {
      const attachment: FileAttachment = {
        name: file.name,
        type: file.type,
        size: file.size,
        status: 'uploading',
      }

      setFiles(prev => [...prev, attachment])

      // Read file content
      try {
        const content = await readFileContent(file)
        setFiles(prev => prev.map(f =>
          f.name === attachment.name
            ? { ...f, content, status: 'ready' }
            : f
        ))
      } catch {
        setFiles(prev => prev.map(f =>
          f.name === attachment.name
            ? { ...f, status: 'error' }
            : f
        ))
      }
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Read file content (supports PDF, DOCX, TXT, etc.)
  const readFileContent = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        const result = e.target?.result as string
        resolve(result)
      }

      reader.onerror = () => reject(new Error('Failed to read file'))

      if (file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        reader.readAsText(file)
      } else {
        // For PDFs and other binary files, we'll send as base64
        reader.readAsDataURL(file)
      }
    })
  }

  // Remove file
  const removeFile = (fileName: string) => {
    setFiles(prev => prev.filter(f => f.name !== fileName))
  }

  // Send message
  const sendMessage = async () => {
    if (!input.trim() && files.length === 0) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
      attachments: files.length > 0 ? [...files] : undefined,
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    const uploadedFiles = [...files]
    setFiles([])
    setIsLoading(true)

    try {
      const response = await fetch('/api/knowledge/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          files: uploadedFiles.filter(f => f.status === 'ready').map(f => ({
            name: f.name,
            type: f.type,
            content: f.content,
          })),
          conversationHistory: messages.slice(-10).map(m => ({
            role: m.role,
            content: m.content,
          })),
          pendingContextResponse: pendingContext ? {
            messageId: pendingContext.messageId,
            response: input,
          } : undefined,
        }),
      })

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        isContextRequest: data.needsContext,
        suggestedCategory: data.suggestedCategory,
      }

      setMessages(prev => [...prev, assistantMessage])

      if (data.needsContext) {
        setPendingContext({
          messageId: assistantMessage.id,
          question: data.contextQuestion || 'ספר לי עוד על המסמך',
        })
      } else {
        setPendingContext(null)
      }

      // If document was saved, refresh knowledge base
      if (data.saved) {
        queryClient.invalidateQueries({ queryKey: ['knowledge'] })
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'מצטער, אירעה שגיאה. אנא נסה שוב.',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  // Handle quick question
  const handleQuickQuestion = (question: string) => {
    setInput(question)
  }

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col h-[600px] rounded-2xl border border-border/50 bg-gradient-to-b from-card/50 to-card overflow-hidden shadow-xl">
      {/* Header */}
      <div className="px-4 py-3 border-b bg-gradient-to-l from-blue-500/10 via-indigo-500/5 to-transparent">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">סוכן מאגר הידע</h3>
            <p className="text-xs text-muted-foreground">שאל שאלות או העלה מסמכים</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="relative mb-6">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 animate-pulse" />
              <div className="relative p-4 rounded-full bg-gradient-to-br from-blue-500/10 to-indigo-500/10">
                <Sparkles className="h-10 w-10 text-blue-500" />
              </div>
            </div>
            <h4 className="font-semibold mb-2">ברוכים הבאים למאגר הידע</h4>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              אני יכול לעזור לך לחפש מידע משפטי, להוסיף מסמכים חדשים,
              ולארגן את מאגר הידע שלך באופן חכם.
            </p>

            {/* Quick questions */}
            <div className="space-y-2 w-full max-w-sm">
              <p className="text-xs text-muted-foreground">שאלות לדוגמה:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {QUICK_QUESTIONS.map((q, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    className="text-xs h-auto py-1.5 px-3 bg-background/50"
                    onClick={() => handleQuickQuestion(q)}
                  >
                    {q}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex gap-3 animate-fade-in-up',
                  message.role === 'user' ? 'flex-row-reverse' : ''
                )}
              >
                {/* Avatar */}
                <div className={cn(
                  'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-violet-500 to-purple-600'
                    : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                )}>
                  {message.role === 'user'
                    ? <User className="h-4 w-4 text-white" />
                    : <Bot className="h-4 w-4 text-white" />
                  }
                </div>

                {/* Message content */}
                <div className={cn(
                  'flex-1 max-w-[80%]',
                  message.role === 'user' ? 'text-right' : ''
                )}>
                  <div className={cn(
                    'inline-block p-3 rounded-2xl',
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white rounded-tr-sm'
                      : 'bg-muted/50 rounded-tl-sm'
                  )}>
                    {/* Attachments */}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mb-2 space-y-1">
                        {message.attachments.map((file, i) => (
                          <div
                            key={i}
                            className={cn(
                              'flex items-center gap-2 px-2 py-1 rounded text-xs',
                              message.role === 'user' ? 'bg-white/20' : 'bg-background/50'
                            )}
                          >
                            <FileText className="h-3 w-3" />
                            <span className="truncate max-w-[150px]">{file.name}</span>
                            {file.status === 'ready' && <CheckCircle className="h-3 w-3 text-green-500" />}
                            {file.status === 'error' && <AlertCircle className="h-3 w-3 text-red-500" />}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Message text */}
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                    {/* Context request indicator */}
                    {message.isContextRequest && (
                      <div className={cn(
                        'flex items-center gap-2 mt-2 text-xs',
                        message.role === 'user' ? 'text-white/80' : 'text-muted-foreground'
                      )}>
                        <HelpCircle className="h-3 w-3" />
                        <span>ממתין לתשובתך...</span>
                      </div>
                    )}

                    {/* Suggested category */}
                    {message.suggestedCategory && (
                      <div className="mt-3 p-2 rounded-lg bg-background/50 space-y-1">
                        <p className="text-xs font-medium flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          סיווג מוצע:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="outline" className="text-xs">
                            {message.suggestedCategory.type}
                          </Badge>
                          {message.suggestedCategory.practiceArea && (
                            <Badge variant="outline" className="text-xs">
                              {message.suggestedCategory.practiceArea}
                            </Badge>
                          )}
                          {message.suggestedCategory.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Timestamp */}
                  <p className={cn(
                    'text-[10px] text-muted-foreground mt-1',
                    message.role === 'user' ? 'text-right' : ''
                  )}>
                    {message.timestamp.toLocaleTimeString('he-IL', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex gap-3 animate-fade-in-up">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-muted/50 rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>חושב...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Pending context prompt */}
      {pendingContext && (
        <div className="px-4 py-2 bg-amber-500/10 border-t border-amber-500/20">
          <div className="flex items-center gap-2 text-sm">
            <HelpCircle className="h-4 w-4 text-amber-600" />
            <span className="text-amber-700 dark:text-amber-400">{pendingContext.question}</span>
          </div>
        </div>
      )}

      {/* File attachments preview */}
      {files.length > 0 && (
        <div className="px-4 py-2 border-t bg-muted/30">
          <div className="flex flex-wrap gap-2">
            {files.map((file, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-2 py-1 rounded-lg bg-background border text-sm"
              >
                {file.status === 'uploading' ? (
                  <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
                ) : file.status === 'error' ? (
                  <AlertCircle className="h-3 w-3 text-red-500" />
                ) : (
                  <FileText className="h-3 w-3 text-muted-foreground" />
                )}
                <span className="truncate max-w-[100px]">{file.name}</span>
                <button
                  onClick={() => removeFile(file.name)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="p-4 border-t bg-background/50 backdrop-blur-sm">
        <div className="flex gap-2">
          {/* File upload button */}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            multiple
            accept=".pdf,.doc,.docx,.txt,.md,.rtf"
            onChange={handleFileSelect}
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            className="flex-shrink-0"
          >
            <Upload className="h-4 w-4" />
          </Button>

          {/* Message input */}
          <div className="flex-1 relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={
                pendingContext
                  ? 'הסבר בקצרה את ההקשר...'
                  : 'שאל שאלה או תאר את המסמך...'
              }
              className="min-h-[44px] max-h-[120px] resize-none pr-3 bg-background/50"
              rows={1}
            />
          </div>

          {/* Send button */}
          <Button
            onClick={sendMessage}
            disabled={isLoading || (!input.trim() && files.length === 0)}
            className="flex-shrink-0 bg-gradient-to-l from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-[10px] text-muted-foreground mt-2 text-center">
          העלה PDF, Word, או טקסט • הסוכן יקרא ויסווג אוטומטית
        </p>
      </div>
    </div>
  )
}
