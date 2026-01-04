'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { Checkbox } from '@/components/ui/checkbox'
import { Eye, EyeOff, Mail, Lock, User, Phone, Loader2 } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!acceptTerms) {
      toast({
        title: 'נדרש אישור',
        description: 'יש לאשר את תנאי השימוש ומדיניות הפרטיות',
        variant: 'destructive',
      })
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'שגיאה',
        description: 'הסיסמאות אינן תואמות',
        variant: 'destructive',
      })
      return
    }

    if (formData.password.length < 8) {
      toast({
        title: 'שגיאה',
        description: 'הסיסמה חייבת להכיל לפחות 8 תווים',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()

      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: formData.fullName,
            phone: formData.phone,
          },
        },
      })

      if (error) {
        toast({
          title: 'שגיאה בהרשמה',
          description: error.message,
          variant: 'destructive',
        })
        return
      }

      toast({
        title: 'נרשמת בהצלחה!',
        description: 'נשלח אליך מייל לאימות החשבון. אנא בדוק את תיבת הדואר.',
      })

      router.push('/login?message=check-email')
    } catch (error) {
      toast({
        title: 'שגיאה',
        description: 'אירעה שגיאה בלתי צפויה. אנא נסה שוב.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Mobile logo */}
      <div className="lg:hidden flex justify-center mb-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <span className="text-xl font-bold text-white">L</span>
          </div>
          <span className="text-2xl font-bold text-primary">LaWra AI</span>
        </Link>
      </div>

      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">יצירת חשבון חדש</h1>
        <p className="text-muted-foreground">
          הצטרפו למהפכה בניהול משרדי עורכי דין
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="fullName" className="text-sm font-medium">
            שם מלא
          </label>
          <div className="relative">
            <User className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="fullName"
              type="text"
              placeholder="עו״ד ישראל ישראלי"
              className="ps-10"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            דוא"ל
          </label>
          <div className="relative">
            <Mail className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="name@lawfirm.co.il"
              dir="ltr"
              className="ps-10"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-medium">
            טלפון
          </label>
          <div className="relative">
            <Phone className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="phone"
              type="tel"
              placeholder="050-1234567"
              dir="ltr"
              className="ps-10"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            סיסמה
          </label>
          <div className="relative">
            <Lock className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="לפחות 8 תווים"
              dir="ltr"
              className="ps-10 pe-10"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={8}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-sm font-medium">
            אימות סיסמה
          </label>
          <div className="relative">
            <Lock className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="הקלד שוב את הסיסמה"
              dir="ltr"
              className="ps-10"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="flex items-start gap-3 pt-2">
          <Checkbox
            id="terms"
            checked={acceptTerms}
            onCheckedChange={(checked) => setAcceptTerms(checked === true)}
            disabled={isLoading}
          />
          <label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed">
            אני מאשר/ת את{' '}
            <Link href="/terms" className="text-primary hover:underline">
              תנאי השימוש
            </Link>{' '}
            ו
            <Link href="/privacy" className="text-primary hover:underline">
              מדיניות הפרטיות
            </Link>
          </label>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading || !acceptTerms}>
          {isLoading ? (
            <>
              <Loader2 className="me-2 h-4 w-4 animate-spin" />
              יוצר חשבון...
            </>
          ) : (
            'צור חשבון'
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        כבר יש לך חשבון?{' '}
        <Link href="/login" className="text-primary hover:underline font-medium">
          התחברו
        </Link>
      </p>
    </div>
  )
}
