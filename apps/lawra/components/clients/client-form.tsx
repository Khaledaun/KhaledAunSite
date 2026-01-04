'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  createClientSchema,
  type CreateClientInput,
  clientTypeLabels,
  clientStatusLabels,
} from '@/lib/schemas/client'
import { Loader2 } from 'lucide-react'

interface ClientFormProps {
  onSubmit: (data: CreateClientInput) => Promise<void>
  defaultValues?: Partial<CreateClientInput>
  isLoading?: boolean
  submitLabel?: string
}

export function ClientForm({
  onSubmit,
  defaultValues,
  isLoading,
  submitLabel = 'שמור',
}: ClientFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateClientInput>({
    resolver: zodResolver(createClientSchema),
    defaultValues: {
      name: '',
      clientType: 'INDIVIDUAL',
      status: 'ACTIVE',
      paymentTerms: 30,
      ...defaultValues,
    },
  })

  const clientType = watch('clientType')
  const status = watch('status')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="name">שם לקוח *</Label>
          <Input
            id="name"
            placeholder="שם הלקוח"
            {...register('name')}
            disabled={isLoading}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        {/* Client Type */}
        <div className="space-y-2">
          <Label>סוג לקוח</Label>
          <Select
            value={clientType}
            onValueChange={(value) => setValue('clientType', value as any)}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="בחר סוג לקוח" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(clientTypeLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label>סטטוס</Label>
          <Select
            value={status}
            onValueChange={(value) => setValue('status', value as any)}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="בחר סטטוס" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(clientStatusLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* ID Number */}
        <div className="space-y-2">
          <Label htmlFor="idNumber">
            {clientType === 'INDIVIDUAL' ? 'ת.ז' : 'ח.פ'}
          </Label>
          <Input
            id="idNumber"
            placeholder={clientType === 'INDIVIDUAL' ? 'מספר ת.ז' : 'מספר ח.פ'}
            dir="ltr"
            {...register('idNumber')}
            disabled={isLoading}
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">דוא"ל</Label>
          <Input
            id="email"
            type="email"
            placeholder="email@example.com"
            dir="ltr"
            {...register('email')}
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone">טלפון</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="050-1234567"
            dir="ltr"
            {...register('phone')}
            disabled={isLoading}
          />
        </div>

        {/* Secondary Phone */}
        <div className="space-y-2">
          <Label htmlFor="phoneSecondary">טלפון נוסף</Label>
          <Input
            id="phoneSecondary"
            type="tel"
            placeholder="03-1234567"
            dir="ltr"
            {...register('phoneSecondary')}
            disabled={isLoading}
          />
        </div>

        {/* Address */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="address">כתובת</Label>
          <Input
            id="address"
            placeholder="רחוב, עיר"
            {...register('address')}
            disabled={isLoading}
          />
        </div>

        {/* Billing Rate */}
        <div className="space-y-2">
          <Label htmlFor="billingRate">תעריף שעתי (₪)</Label>
          <Input
            id="billingRate"
            type="number"
            placeholder="500"
            dir="ltr"
            {...register('billingRate', { valueAsNumber: true })}
            disabled={isLoading}
          />
        </div>

        {/* Payment Terms */}
        <div className="space-y-2">
          <Label htmlFor="paymentTerms">תנאי תשלום (ימים)</Label>
          <Select
            value={watch('paymentTerms')?.toString()}
            onValueChange={(value) => setValue('paymentTerms', parseInt(value))}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="בחר תנאי תשלום" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">מיידי</SelectItem>
              <SelectItem value="15">שוטף + 15</SelectItem>
              <SelectItem value="30">שוטף + 30</SelectItem>
              <SelectItem value="45">שוטף + 45</SelectItem>
              <SelectItem value="60">שוטף + 60</SelectItem>
              <SelectItem value="90">שוטף + 90</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Notes */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="notes">הערות</Label>
          <textarea
            id="notes"
            placeholder="הערות נוספות..."
            className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            {...register('notes')}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="me-2 h-4 w-4 animate-spin" />
              שומר...
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </form>
  )
}
