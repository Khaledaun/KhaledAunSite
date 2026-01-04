'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import {
  documentTemplates,
  templateCategoryLabels,
  generateDocumentSchema,
  type GenerateDocumentInput,
  type TemplateCategory,
} from '@/lib/schemas/document'
import { courts } from '@/lib/documents/generator'
import {
  ArrowRight,
  FileText,
  Loader2,
  Download,
  Save,
  Scale,
  FileEdit,
  Mail,
  Building2,
} from 'lucide-react'

// Template icons by category
const categoryIcons: Record<TemplateCategory, React.ReactNode> = {
  litigation: <Scale className="h-5 w-5" />,
  contracts: <FileEdit className="h-5 w-5" />,
  letters: <Mail className="h-5 w-5" />,
  court: <Building2 className="h-5 w-5" />,
}

export default function GenerateDocumentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const preselectedTemplateId = searchParams.get('template')
  const preselectedCaseId = searchParams.get('caseId')

  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(
    preselectedTemplateId
  )
  const [step, setStep] = useState<'select' | 'fill'>(
    preselectedTemplateId ? 'fill' : 'select'
  )

  // Fetch cases for selection
  const { data: casesData } = useQuery({
    queryKey: ['cases-list'],
    queryFn: async () => {
      const res = await fetch('/api/cases?limit=100')
      if (!res.ok) throw new Error('Failed to fetch cases')
      return res.json()
    },
  })

  // Fetch clients for selection
  const { data: clientsData } = useQuery({
    queryKey: ['clients-list'],
    queryFn: async () => {
      const res = await fetch('/api/clients?limit=100')
      if (!res.ok) throw new Error('Failed to fetch clients')
      return res.json()
    },
  })

  const template = documentTemplates.find((t) => t.id === selectedTemplate)

  // Form
  const form = useForm<GenerateDocumentInput>({
    resolver: zodResolver(generateDocumentSchema),
    defaultValues: {
      templateId: selectedTemplate || '',
      caseId: preselectedCaseId || undefined,
      client: {
        name: '',
        idNumber: '',
        address: '',
        phone: '',
        email: '',
      },
      case: {
        number: '',
        court: '',
        judge: '',
        title: '',
      },
      opposingParty: {
        name: '',
        counsel: '',
        address: '',
      },
      customContent: '',
    },
  })

  // Generate mutation
  const generateMutation = useMutation({
    mutationFn: async (data: GenerateDocumentInput & { download?: boolean }) => {
      const res = await fetch('/api/documents/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to generate document')
      }

      // If download mode, return blob
      if (data.download) {
        return res.blob()
      }

      return res.json()
    },
    onSuccess: (result, variables) => {
      if (variables.download && result instanceof Blob) {
        // Download the file
        const url = window.URL.createObjectURL(result)
        const a = document.createElement('a')
        a.href = url
        a.download = `${template?.name || 'document'}.docx`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast({
          title: 'המסמך הורד בהצלחה',
        })
      } else {
        toast({
          title: 'המסמך נוצר בהצלחה',
          description: 'המסמך נשמר במערכת',
        })
        router.push('/documents')
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'שגיאה ביצירת המסמך',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  // Handle template selection
  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId)
    form.setValue('templateId', templateId)
    setStep('fill')
  }

  // Handle client selection
  const handleClientSelect = (clientId: string) => {
    const client = clientsData?.clients?.find((c: any) => c.id === clientId)
    if (client) {
      form.setValue('client.name', client.name)
      form.setValue('client.idNumber', client.idNumber || '')
      form.setValue('client.address', client.address || '')
      form.setValue('client.phone', client.phone || '')
      form.setValue('client.email', client.email || '')
    }
  }

  // Handle case selection
  const handleCaseSelect = (caseId: string) => {
    const caseData = casesData?.cases?.find((c: any) => c.id === caseId)
    if (caseData) {
      form.setValue('caseId', caseId)
      form.setValue('case.number', caseData.caseNumber || '')
      form.setValue('case.court', caseData.court || '')
      form.setValue('case.title', caseData.title || '')
      // Also set client if available
      if (caseData.client) {
        form.setValue('client.name', caseData.client.name)
        form.setValue('client.idNumber', caseData.client.idNumber || '')
      }
      // Set opposing party if available
      if (caseData.opposingParty) {
        form.setValue('opposingParty.name', caseData.opposingParty)
      }
      if (caseData.opposingCounsel) {
        form.setValue('opposingParty.counsel', caseData.opposingCounsel)
      }
    }
  }

  // Submit handler
  const onSubmit = (data: GenerateDocumentInput, download: boolean = false) => {
    generateMutation.mutate({ ...data, download })
  }

  // Group templates by category
  const templatesByCategory = documentTemplates.reduce((acc, t) => {
    if (!acc[t.category]) {
      acc[t.category] = []
    }
    acc[t.category].push(t)
    return acc
  }, {} as Record<string, typeof documentTemplates>)

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowRight className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">יצירת מסמך</h1>
          <p className="text-muted-foreground">
            {step === 'select' ? 'בחר תבנית להתחלה' : `עריכת ${template?.name}`}
          </p>
        </div>
      </div>

      {/* Step 1: Template Selection */}
      {step === 'select' && (
        <div className="space-y-6">
          {Object.entries(templatesByCategory).map(([category, templates]) => (
            <div key={category}>
              <div className="flex items-center gap-2 mb-3">
                {categoryIcons[category as TemplateCategory]}
                <h2 className="text-lg font-semibold">
                  {templateCategoryLabels[category as TemplateCategory]}
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {templates.map((t) => (
                  <Card
                    key={t.id}
                    className={`cursor-pointer transition-all hover:border-primary hover:shadow-md ${
                      selectedTemplate === t.id ? 'border-primary ring-2 ring-primary' : ''
                    }`}
                    onClick={() => handleSelectTemplate(t.id)}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        {t.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm">
                        {t.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Step 2: Fill Form */}
      {step === 'fill' && template && (
        <form onSubmit={form.handleSubmit((data) => onSubmit(data, false))}>
          <div className="space-y-6">
            {/* Quick select from existing data */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">מילוי מהיר</CardTitle>
                <CardDescription>
                  בחר לקוח או תיק קיים למילוי אוטומטי של הפרטים
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>בחר לקוח</Label>
                  <Select onValueChange={handleClientSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="בחר לקוח..." />
                    </SelectTrigger>
                    <SelectContent>
                      {clientsData?.clients?.map((c: any) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>בחר תיק</Label>
                  <Select onValueChange={handleCaseSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="בחר תיק..." />
                    </SelectTrigger>
                    <SelectContent>
                      {casesData?.cases?.map((c: any) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Client Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">פרטי הלקוח</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client.name">שם הלקוח *</Label>
                  <Input
                    id="client.name"
                    {...form.register('client.name')}
                    placeholder="ישראל ישראלי"
                  />
                  {form.formState.errors.client?.name && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.client.name.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client.idNumber">ת.ז.</Label>
                  <Input
                    id="client.idNumber"
                    {...form.register('client.idNumber')}
                    placeholder="000000000"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client.address">כתובת</Label>
                  <Input
                    id="client.address"
                    {...form.register('client.address')}
                    placeholder="רחוב, עיר"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client.phone">טלפון</Label>
                  <Input
                    id="client.phone"
                    {...form.register('client.phone')}
                    placeholder="050-0000000"
                    dir="ltr"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Case Details (for litigation templates) */}
            {['litigation', 'court'].includes(template.category) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">פרטי התיק</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="case.court">בית משפט</Label>
                    <Select
                      onValueChange={(value) => form.setValue('case.court', value)}
                      value={form.watch('case.court')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="בחר בית משפט..." />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(courts).map(([key, name]) => (
                          <SelectItem key={key} value={name}>
                            {name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="case.number">מספר תיק</Label>
                    <Input
                      id="case.number"
                      {...form.register('case.number')}
                      placeholder="12345-01-24"
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="case.judge">שופט</Label>
                    <Input
                      id="case.judge"
                      {...form.register('case.judge')}
                      placeholder="כב׳ השופט..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="case.title">כותרת התיק</Label>
                    <Input
                      id="case.title"
                      {...form.register('case.title')}
                      placeholder="ישראלי נ׳ ישראלי"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Opposing Party */}
            {template.requiredFields.some((f) => f.includes('opposingParty')) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">הצד שכנגד</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="opposingParty.name">שם</Label>
                    <Input
                      id="opposingParty.name"
                      {...form.register('opposingParty.name')}
                      placeholder="שם הצד שכנגד"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="opposingParty.counsel">בא כוח</Label>
                    <Input
                      id="opposingParty.counsel"
                      {...form.register('opposingParty.counsel')}
                      placeholder='עו"ד...'
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="opposingParty.address">כתובת</Label>
                    <Input
                      id="opposingParty.address"
                      {...form.register('opposingParty.address')}
                      placeholder="כתובת הצד שכנגד"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Custom Content */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">תוכן המסמך</CardTitle>
                <CardDescription>
                  הזן את התוכן העיקרי של המסמך
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  {...form.register('customContent')}
                  placeholder="הזן את תוכן המסמך כאן..."
                  rows={8}
                  className="resize-y"
                />
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep('select')}
                className="flex-1"
              >
                <ArrowRight className="me-2 h-4 w-4" />
                חזרה לבחירת תבנית
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => onSubmit(form.getValues(), true)}
                disabled={generateMutation.isPending}
                className="flex-1"
              >
                {generateMutation.isPending ? (
                  <Loader2 className="me-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="me-2 h-4 w-4" />
                )}
                הורד מסמך
              </Button>

              <Button
                type="submit"
                disabled={generateMutation.isPending}
                className="flex-1"
              >
                {generateMutation.isPending ? (
                  <Loader2 className="me-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="me-2 h-4 w-4" />
                )}
                שמור למערכת
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  )
}
