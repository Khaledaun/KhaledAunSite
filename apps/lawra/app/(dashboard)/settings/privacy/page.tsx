'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import {
  Shield,
  Lock,
  Eye,
  Download,
  Trash2,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  ChevronLeft,
  Database,
  UserCheck,
  Scale,
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { he } from 'date-fns/locale'

const CONSENT_LABELS: Record<string, { title: string; description: string }> = {
  DATA_PROCESSING: {
    title: 'עיבוד נתונים',
    description: 'הסכמה לעיבוד נתונים אישיים לצורך השירותים המשפטיים',
  },
  AI_PROCESSING: {
    title: 'שימוש בבינה מלאכותית',
    description: 'הסכמה לשימוש ב-AI לסיוע במחקר וניתוח מסמכים',
  },
  DATA_RETENTION: {
    title: 'שמירת נתונים',
    description: 'הסכמה לשמירת נתונים למשך 7 שנים לאחר סיום ההתקשרות',
  },
  MARKETING: {
    title: 'תקשורת שיווקית',
    description: 'הסכמה לקבלת עדכונים ומידע שיווקי',
  },
  THIRD_PARTY_SHARING: {
    title: 'שיתוף עם צד שלישי',
    description: 'הסכמה לשיתוף מידע עם נותני שירותים הכרחיים',
  },
  CROSS_BORDER_TRANSFER: {
    title: 'העברת מידע בינלאומית',
    description: 'הסכמה להעברת נתונים לשרתים מחוץ לישראל',
  },
}

const RIGHT_LABELS: Record<string, { title: string; description: string }> = {
  ACCESS: {
    title: 'זכות עיון',
    description: 'לקבל עותק מכל המידע האישי השמור במערכת',
  },
  CORRECTION: {
    title: 'זכות תיקון',
    description: 'לתקן מידע שגוי או לא מדויק',
  },
  DELETION: {
    title: 'זכות מחיקה',
    description: 'למחוק את המידע האישי (בכפוף לדרישות החוק)',
  },
  PORTABILITY: {
    title: 'זכות ניידות',
    description: 'לקבל את המידע בפורמט מובנה להעברה למערכת אחרת',
  },
  OBJECTION: {
    title: 'זכות התנגדות',
    description: 'להתנגד לעיבוד מסוים של המידע',
  },
}

export default function PrivacyCenterPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [showRequestDialog, setShowRequestDialog] = useState(false)
  const [selectedRight, setSelectedRight] = useState<string>('')
  const [requestDescription, setRequestDescription] = useState('')

  // Fetch consent status
  const { data: consentData, isLoading: loadingConsents } = useQuery({
    queryKey: ['consents'],
    queryFn: async () => {
      const res = await fetch('/api/privacy/consent')
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json()
    },
  })

  // Fetch data subject requests
  const { data: requestsData, isLoading: loadingRequests } = useQuery({
    queryKey: ['data-subject-requests'],
    queryFn: async () => {
      const res = await fetch('/api/privacy/data-subject-request')
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json()
    },
  })

  // Update consent mutation
  const consentMutation = useMutation({
    mutationFn: async ({
      consentType,
      granted,
    }: {
      consentType: string
      granted: boolean
    }) => {
      const res = await fetch('/api/privacy/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consentType, granted }),
      })
      if (!res.ok) throw new Error('Failed to update')
      return res.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['consents'] })
      toast({
        title: variables.granted ? 'ההסכמה נשמרה' : 'ההסכמה בוטלה',
        description: CONSENT_LABELS[variables.consentType].title,
      })
    },
    onError: () => {
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לעדכן את ההסכמה',
        variant: 'destructive',
      })
    },
  })

  // Submit data subject request
  const requestMutation = useMutation({
    mutationFn: async (data: { rightType: string; description?: string }) => {
      const res = await fetch('/api/privacy/data-subject-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to submit')
      return res.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['data-subject-requests'] })
      setShowRequestDialog(false)
      setSelectedRight('')
      setRequestDescription('')
      toast({
        title: 'הבקשה נשלחה בהצלחה',
        description: data.message,
      })
    },
    onError: () => {
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לשלוח את הבקשה',
        variant: 'destructive',
      })
    },
  })

  // Export data
  const handleExportData = async () => {
    try {
      const res = await fetch('/api/privacy/data-subject-request?action=export')
      if (!res.ok) throw new Error('Failed to export')

      const data = await res.json()
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `my-data-${format(new Date(), 'yyyy-MM-dd')}.json`
      a.click()
      URL.revokeObjectURL(url)

      toast({
        title: 'הנתונים יוצאו בהצלחה',
        description: 'הקובץ הורד למחשב שלך',
      })
    } catch {
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לייצא את הנתונים',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/settings"
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg">
              <Shield className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold">מרכז הפרטיות</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            ניהול הסכמות וזכויות בהתאם לתיקון 13 לחוק הגנת הפרטיות
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-premium border-border/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-green-100 dark:bg-green-900/30">
                <UserCheck className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {consentData?.consents
                    ? Object.values(consentData.consents).filter(
                        (c: any) => c.granted
                      ).length
                    : 0}
                </p>
                <p className="text-sm text-muted-foreground">הסכמות פעילות</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-premium border-border/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                <Database className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">HIGH</p>
                <p className="text-sm text-muted-foreground">רמת אבטחה</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-premium border-border/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/30">
                <Scale className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">7</p>
                <p className="text-sm text-muted-foreground">שנות שמירה</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Consent Management */}
      <Card className="glass-premium border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-green-500" />
            ניהול הסכמות
          </CardTitle>
          <CardDescription>
            שלוט בהסכמות שלך לעיבוד נתונים
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingConsents ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : (
            Object.entries(consentData?.consents || {}).map(
              ([type, consent]: [string, any]) => (
                <div
                  key={type}
                  className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Label className="font-medium">
                        {CONSENT_LABELS[type]?.title || type}
                      </Label>
                      {consent.needsUpdate && (
                        <Badge variant="outline" className="text-amber-600">
                          נדרש עדכון
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {CONSENT_LABELS[type]?.description}
                    </p>
                    {consent.grantedAt && (
                      <p className="text-xs text-muted-foreground mt-1">
                        אושר: {format(new Date(consent.grantedAt), 'dd/MM/yyyy', { locale: he })}
                      </p>
                    )}
                  </div>
                  <Switch
                    checked={consent.granted}
                    onCheckedChange={(granted) =>
                      consentMutation.mutate({ consentType: type, granted })
                    }
                    disabled={consentMutation.isPending}
                  />
                </div>
              )
            )
          )}
        </CardContent>
      </Card>

      {/* Data Subject Rights */}
      <Card className="glass-premium border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-blue-500" />
            זכויות נושא המידע
          </CardTitle>
          <CardDescription>
            הגש בקשה למימוש זכויותיך לפי חוק הגנת הפרטיות
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Quick Actions */}
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start gap-2"
              onClick={handleExportData}
            >
              <Download className="h-5 w-5 text-blue-500" />
              <div className="text-right">
                <div className="font-medium">ייצוא נתונים</div>
                <div className="text-xs text-muted-foreground">
                  הורד את כל המידע שלך
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start gap-2"
              onClick={() => setShowRequestDialog(true)}
            >
              <FileText className="h-5 w-5 text-green-500" />
              <div className="text-right">
                <div className="font-medium">הגש בקשה</div>
                <div className="text-xs text-muted-foreground">
                  עיון, תיקון, מחיקה
                </div>
              </div>
            </Button>
          </div>

          {/* Existing Requests */}
          {requestsData?.requests?.length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium mb-3">בקשות קיימות</h4>
              <div className="space-y-2">
                {requestsData.requests.map((request: any) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {RIGHT_LABELS[request.rightType]?.title}
                        </span>
                        <Badge
                          variant={
                            request.status === 'COMPLETED'
                              ? 'default'
                              : request.status === 'REJECTED'
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
                          {request.status === 'PENDING' && 'ממתין'}
                          {request.status === 'IN_PROGRESS' && 'בטיפול'}
                          {request.status === 'COMPLETED' && 'הושלם'}
                          {request.status === 'REJECTED' && 'נדחה'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        הוגש: {format(new Date(request.requestedAt), 'dd/MM/yyyy', { locale: he })}
                      </p>
                    </div>
                    {request.status === 'PENDING' && (
                      <Clock className="h-4 w-4 text-amber-500" />
                    )}
                    {request.status === 'COMPLETED' && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legal Information */}
      <Card className="glass-premium border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-purple-500" />
            מידע משפטי
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible>
            <AccordionItem value="retention">
              <AccordionTrigger>מדיניות שמירת מידע</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground space-y-2">
                <p>בהתאם לכללי לשכת עורכי הדין ודיני המס, אנו שומרים מידע למשך:</p>
                <ul className="list-disc list-inside space-y-1 mr-4">
                  <li>תיקים ומסמכים: 7 שנים לאחר סגירת התיק</li>
                  <li>חשבוניות ומסמכים פיננסיים: 7 שנים</li>
                  <li>שיחות AI: שנה אחת</li>
                  <li>יומני ביקורת: 7 שנים</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="security">
              <AccordionTrigger>אמצעי אבטחה</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground space-y-2">
                <p>LaWra מופעלת ברמת אבטחה HIGH בהתאם לתקנות:</p>
                <ul className="list-disc list-inside space-y-1 mr-4">
                  <li>הצפנת נתונים בתנועה (TLS 1.3) ובמנוחה (AES-256)</li>
                  <li>בקרת גישה מבוססת תפקידים (RBAC)</li>
                  <li>יומני ביקורת מלאים לכל גישה למידע</li>
                  <li>אימות דו-שלבי (2FA) זמין</li>
                  <li>גיבויים יומיים מוצפנים</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="rights">
              <AccordionTrigger>זכויותיך לפי החוק</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground space-y-2">
                <p>בהתאם לתיקון 13 לחוק הגנת הפרטיות, עומדות לך הזכויות הבאות:</p>
                <ul className="list-disc list-inside space-y-1 mr-4">
                  <li><strong>זכות עיון:</strong> לקבל עותק מכל המידע השמור עליך</li>
                  <li><strong>זכות תיקון:</strong> לתקן מידע שגוי או לא מדויק</li>
                  <li><strong>זכות מחיקה:</strong> למחוק מידע (בכפוף לחובות החוק)</li>
                  <li><strong>זכות ניידות:</strong> לקבל את המידע בפורמט מובנה</li>
                  <li><strong>זכות התנגדות:</strong> להתנגד לעיבודים מסוימים</li>
                </ul>
                <p className="mt-2">
                  זמן מענה: עד 30 יום מיום הגשת הבקשה (14 יום להתנגדות)
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="contact">
              <AccordionTrigger>יצירת קשר</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                <p>לשאלות בנושאי פרטיות ניתן לפנות:</p>
                <p className="mt-2">
                  <strong>רשות הגנת הפרטיות:</strong><br />
                  טלפון: *6564<br />
                  פקס: 02-6467064<br />
                  דוא&quot;ל: ppa@justice.gov.il
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Request Dialog */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent className="glass-premium border-border/50">
          <DialogHeader>
            <DialogTitle>הגשת בקשה</DialogTitle>
            <DialogDescription>
              בחר את סוג הבקשה ותאר את הצורך שלך
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>סוג הבקשה</Label>
              <Select value={selectedRight} onValueChange={setSelectedRight}>
                <SelectTrigger>
                  <SelectValue placeholder="בחר סוג בקשה" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(RIGHT_LABELS).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      {value.title} - {value.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>פירוט (אופציונלי)</Label>
              <Textarea
                value={requestDescription}
                onChange={(e) => setRequestDescription(e.target.value)}
                placeholder="תאר את הבקשה שלך..."
                rows={3}
              />
            </div>

            {selectedRight === 'DELETION' && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-700 dark:text-amber-400">
                      שים לב
                    </p>
                    <p className="text-amber-600 dark:text-amber-500">
                      מחיקת נתונים עשויה להיות מוגבלת בשל חובות שמירה לפי החוק
                      (7 שנים לתיקים משפטיים ומסמכי מס).
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRequestDialog(false)}
            >
              ביטול
            </Button>
            <Button
              onClick={() =>
                requestMutation.mutate({
                  rightType: selectedRight,
                  description: requestDescription || undefined,
                })
              }
              disabled={!selectedRight || requestMutation.isPending}
              className="bg-gradient-to-l from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
            >
              {requestMutation.isPending ? 'שולח...' : 'שלח בקשה'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
