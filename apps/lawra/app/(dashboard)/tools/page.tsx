'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertTriangle,
  Calculator,
  Calendar,
  Clock,
  Scale,
  Shield,
  Users,
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowLeft,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { format, addDays, differenceInDays, isBefore, isAfter } from 'date-fns'
import { he } from 'date-fns/locale'
import {
  courtDeadlines,
  limitationPeriods,
  calculateDeadline,
  calculateLimitationDate,
  type DeadlineRule,
  type LimitationPeriod,
} from '@/lib/schemas/knowledge'

export default function ToolsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">כלים משפטיים</h1>
        <p className="text-muted-foreground">מחשבונים וכלי עזר לעורכי דין</p>
      </div>

      <Tabs defaultValue="deadlines" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="deadlines" className="gap-2">
            <Calendar className="h-4 w-4" />
            מחשבון מועדים
          </TabsTrigger>
          <TabsTrigger value="limitations" className="gap-2">
            <Clock className="h-4 w-4" />
            התיישנות
          </TabsTrigger>
          <TabsTrigger value="conflicts" className="gap-2">
            <Shield className="h-4 w-4" />
            ניגוד עניינים
          </TabsTrigger>
        </TabsList>

        {/* Court Deadlines Calculator */}
        <TabsContent value="deadlines">
          <CourtDeadlinesCalculator />
        </TabsContent>

        {/* Statute of Limitations */}
        <TabsContent value="limitations">
          <LimitationsCalculator />
        </TabsContent>

        {/* Conflict of Interest Checker */}
        <TabsContent value="conflicts">
          <ConflictChecker />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function CourtDeadlinesCalculator() {
  const [startDate, setStartDate] = useState('')
  const [selectedDeadline, setSelectedDeadline] = useState<DeadlineRule | null>(null)
  const [calculatedDate, setCalculatedDate] = useState<Date | null>(null)

  const handleCalculate = () => {
    if (!startDate || !selectedDeadline) return

    const start = new Date(startDate)
    const deadline = calculateDeadline(start, selectedDeadline)
    setCalculatedDate(deadline)
  }

  const daysRemaining = calculatedDate
    ? differenceInDays(calculatedDate, new Date())
    : null

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            מחשבון מועדים
          </CardTitle>
          <CardDescription>
            חישוב מועדים לפי תקנות סדר הדין האזרחי
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>תאריך התחלה</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              dir="ltr"
            />
          </div>

          <div className="space-y-2">
            <Label>סוג מועד</Label>
            <Select
              onValueChange={(value) => {
                const deadline = courtDeadlines.find(d => d.type === value)
                setSelectedDeadline(deadline || null)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="בחר סוג מועד" />
              </SelectTrigger>
              <SelectContent>
                {courtDeadlines.map((deadline) => (
                  <SelectItem key={deadline.type} value={deadline.type}>
                    {deadline.name} ({deadline.days} ימים)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedDeadline && (
            <div className="p-3 bg-muted/50 rounded-lg text-sm">
              <p className="font-medium">{selectedDeadline.description}</p>
              <p className="text-muted-foreground mt-1">{selectedDeadline.reference}</p>
            </div>
          )}

          <Button onClick={handleCalculate} className="w-full" disabled={!startDate || !selectedDeadline}>
            חשב מועד
          </Button>

          {calculatedDate && (
            <Card className={daysRemaining !== null && daysRemaining < 7 ? 'border-red-500' : 'border-green-500'}>
              <CardContent className="pt-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">המועד האחרון</p>
                  <p className="text-2xl font-bold">
                    {format(calculatedDate, 'dd/MM/yyyy', { locale: he })}
                  </p>
                  <p className="text-lg">
                    {format(calculatedDate, 'EEEE', { locale: he })}
                  </p>
                  {daysRemaining !== null && (
                    <Badge
                      variant={daysRemaining < 0 ? 'destructive' : daysRemaining < 7 ? 'secondary' : 'default'}
                      className="mt-2"
                    >
                      {daysRemaining < 0
                        ? `עבר לפני ${Math.abs(daysRemaining)} ימים`
                        : daysRemaining === 0
                        ? 'היום!'
                        : `נותרו ${daysRemaining} ימים`}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>טבלת מועדים</CardTitle>
          <CardDescription>כל המועדים הקבועים בתקנות</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>סוג</TableHead>
                <TableHead>ימים</TableHead>
                <TableHead>מקור</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courtDeadlines.map((deadline) => (
                <TableRow key={deadline.type}>
                  <TableCell className="font-medium">{deadline.name}</TableCell>
                  <TableCell>{deadline.days}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {deadline.reference}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function LimitationsCalculator() {
  const [eventDate, setEventDate] = useState('')
  const [selectedPeriod, setSelectedPeriod] = useState<LimitationPeriod | null>(null)
  const [calculatedDate, setCalculatedDate] = useState<Date | null>(null)

  const handleCalculate = () => {
    if (!eventDate || !selectedPeriod) return

    const start = new Date(eventDate)
    const limitation = calculateLimitationDate(start, selectedPeriod)
    setCalculatedDate(limitation)
  }

  const isExpired = calculatedDate ? isBefore(calculatedDate, new Date()) : false
  const daysRemaining = calculatedDate ? differenceInDays(calculatedDate, new Date()) : null

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            מחשבון התיישנות
          </CardTitle>
          <CardDescription>
            חישוב תקופות התיישנות לפי חוק ההתיישנות
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>תאריך האירוע / עילת התביעה</Label>
            <Input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              dir="ltr"
            />
          </div>

          <div className="space-y-2">
            <Label>סוג התביעה</Label>
            <Select
              onValueChange={(value) => {
                const period = limitationPeriods.find(p => p.type === value)
                setSelectedPeriod(period || null)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="בחר סוג תביעה" />
              </SelectTrigger>
              <SelectContent>
                {limitationPeriods.map((period) => (
                  <SelectItem key={period.type} value={period.type}>
                    {period.name} ({period.months ? `${period.months} ימים` : `${period.years} שנים`})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedPeriod && (
            <div className="p-3 bg-muted/50 rounded-lg text-sm">
              <p className="font-medium">{selectedPeriod.description}</p>
              <p className="text-muted-foreground mt-1">{selectedPeriod.statute}</p>
            </div>
          )}

          <Button onClick={handleCalculate} className="w-full" disabled={!eventDate || !selectedPeriod}>
            חשב התיישנות
          </Button>

          {calculatedDate && (
            <Card className={isExpired ? 'border-red-500 bg-red-50/50 dark:bg-red-950/20' : 'border-green-500 bg-green-50/50 dark:bg-green-950/20'}>
              <CardContent className="pt-4">
                <div className="text-center">
                  <div className="mb-2">
                    {isExpired ? (
                      <XCircle className="h-8 w-8 text-red-500 mx-auto" />
                    ) : (
                      <CheckCircle className="h-8 w-8 text-green-500 mx-auto" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {isExpired ? 'התביעה התיישנה ב:' : 'המועד האחרון להגשת תביעה:'}
                  </p>
                  <p className="text-2xl font-bold">
                    {format(calculatedDate, 'dd/MM/yyyy', { locale: he })}
                  </p>
                  {daysRemaining !== null && !isExpired && (
                    <Badge
                      variant={daysRemaining < 365 ? 'destructive' : 'default'}
                      className="mt-2"
                    >
                      נותרו {Math.floor(daysRemaining / 365)} שנים ו-{daysRemaining % 365} ימים
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>תקופות התיישנות</CardTitle>
          <CardDescription>לפי חוק ההתיישנות וחוקים נוספים</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>סוג</TableHead>
                <TableHead>תקופה</TableHead>
                <TableHead>מקור</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {limitationPeriods.map((period) => (
                <TableRow key={period.type}>
                  <TableCell className="font-medium">{period.name}</TableCell>
                  <TableCell>
                    {period.months ? `${period.months} ימים` : `${period.years} שנים`}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                    {period.statute}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function ConflictChecker() {
  const [partyName, setPartyName] = useState('')
  const [partyId, setPartyId] = useState('')
  const [checkResults, setCheckResults] = useState<any[] | null>(null)
  const [isChecking, setIsChecking] = useState(false)

  // Fetch all clients and cases for conflict checking
  const { data: clientsData } = useQuery({
    queryKey: ['conflict-clients'],
    queryFn: async () => {
      const res = await fetch('/api/clients?limit=1000')
      return res.ok ? res.json() : { clients: [] }
    },
  })

  const { data: casesData } = useQuery({
    queryKey: ['conflict-cases'],
    queryFn: async () => {
      const res = await fetch('/api/cases?limit=1000')
      return res.ok ? res.json() : { cases: [] }
    },
  })

  const handleCheck = () => {
    if (!partyName && !partyId) return

    setIsChecking(true)
    const results: any[] = []

    // Search in clients
    const clients = clientsData?.clients || []
    const matchingClients = clients.filter((client: any) => {
      const nameMatch = partyName && (
        client.name?.toLowerCase().includes(partyName.toLowerCase()) ||
        client.contactPerson?.toLowerCase().includes(partyName.toLowerCase())
      )
      const idMatch = partyId && client.idNumber === partyId
      return nameMatch || idMatch
    })

    matchingClients.forEach((client: any) => {
      results.push({
        type: 'client',
        severity: 'high',
        entity: client,
        description: `נמצא כלקוח פעיל`,
      })
    })

    // Search in cases (opposing parties)
    const cases = casesData?.cases || []
    cases.forEach((caseItem: any) => {
      const opposingMatch = partyName && (
        caseItem.opposingParty?.toLowerCase().includes(partyName.toLowerCase()) ||
        caseItem.opposingCounsel?.toLowerCase().includes(partyName.toLowerCase())
      )

      if (opposingMatch) {
        results.push({
          type: 'opposing',
          severity: 'critical',
          entity: caseItem,
          description: `צד שכנגד בתיק: ${caseItem.title}`,
        })
      }
    })

    // Check if party was a former client
    const inactiveClients = clients.filter((client: any) =>
      client.status === 'INACTIVE' &&
      (
        (partyName && client.name?.toLowerCase().includes(partyName.toLowerCase())) ||
        (partyId && client.idNumber === partyId)
      )
    )

    inactiveClients.forEach((client: any) => {
      if (!matchingClients.find((c: any) => c.id === client.id)) {
        results.push({
          type: 'former_client',
          severity: 'medium',
          entity: client,
          description: `לקוח לשעבר`,
        })
      }
    })

    setCheckResults(results)
    setIsChecking(false)
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            בדיקת ניגוד עניינים
          </CardTitle>
          <CardDescription>
            בדיקת קיום ניגוד עניינים לפני קבלת לקוח או תיק חדש
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>שם הצד</Label>
            <Input
              value={partyName}
              onChange={(e) => setPartyName(e.target.value)}
              placeholder="שם מלא או שם חברה"
            />
          </div>

          <div className="space-y-2">
            <Label>מספר זהות / ח.פ.</Label>
            <Input
              value={partyId}
              onChange={(e) => setPartyId(e.target.value)}
              placeholder="מספר זהות או מספר חברה"
              dir="ltr"
            />
          </div>

          <Button
            onClick={handleCheck}
            className="w-full"
            disabled={(!partyName && !partyId) || isChecking}
          >
            {isChecking ? 'בודק...' : 'בדוק ניגוד עניינים'}
          </Button>

          {checkResults !== null && (
            <Card className={checkResults.length > 0 ? 'border-red-500' : 'border-green-500'}>
              <CardContent className="pt-4">
                {checkResults.length === 0 ? (
                  <div className="text-center">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                    <p className="text-lg font-medium text-green-700 dark:text-green-400">
                      לא נמצא ניגוד עניינים
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ניתן לקבל את הלקוח/התיק
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertTriangle className="h-5 w-5" />
                      <span className="font-semibold">נמצאו {checkResults.length} התאמות!</span>
                    </div>

                    {checkResults.map((result, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border ${
                          result.severity === 'critical'
                            ? 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800'
                            : result.severity === 'high'
                            ? 'bg-orange-50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-800'
                            : 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {result.severity === 'critical' && (
                            <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                          )}
                          {result.severity === 'high' && (
                            <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
                          )}
                          {result.severity === 'medium' && (
                            <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                          )}
                          <div>
                            <p className="font-medium">
                              {result.entity.name || result.entity.title}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {result.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="p-3 bg-muted rounded-lg text-sm">
                      <p className="font-medium">המלצה:</p>
                      <p className="text-muted-foreground">
                        יש לבחון את הממצאים בקפידה בהתאם לכללי האתיקה המקצועית
                        ולקבל החלטה מושכלת לגבי קבלת הייצוג.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>כללי אתיקה - ניגוד עניינים</CardTitle>
          <CardDescription>לפי כללי לשכת עורכי הדין</CardDescription>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <h4>מתי קיים ניגוד עניינים?</h4>
          <ul>
            <li>ייצוג צד שכנגד ללקוח קיים או לשעבר באותו עניין</li>
            <li>ייצוג שני צדדים בעלי אינטרסים מנוגדים</li>
            <li>ייצוג נגד לקוח לשעבר בעניין שהוטפל עבורו</li>
            <li>ייצוג כאשר לעורך הדין אינטרס אישי בעניין</li>
          </ul>

          <h4>חריגים</h4>
          <ul>
            <li>הסכמה מדעת בכתב של כל הלקוחות הנוגעים בדבר</li>
            <li>עניינים שאינם קשורים זה לזה כלל</li>
            <li>חלוף זמן סביר מסיום הייצוג הקודם</li>
          </ul>

          <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800 not-prose">
            <p className="text-sm flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
              <span>
                במקרה של ספק, מומלץ להתייעץ עם ועדת האתיקה של לשכת עורכי הדין.
              </span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
