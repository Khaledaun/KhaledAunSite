'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
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
  Building2,
  User,
  Bell,
  Palette,
  CreditCard,
  Shield,
  Mail,
  Phone,
  Globe,
  FileText,
  Save,
  Briefcase,
  Clock,
  CheckCircle,
} from 'lucide-react'
import { useQuery, useMutation } from '@tanstack/react-query'

export default function SettingsPage() {
  const [saved, setSaved] = useState(false)

  const showSavedMessage = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">הגדרות</h1>
          <p className="text-muted-foreground">ניהול הגדרות המשרד והמערכת</p>
        </div>

        {saved && (
          <Badge variant="outline" className="gap-2 bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-4 w-4" />
            נשמר בהצלחה
          </Badge>
        )}
      </div>

      <Tabs defaultValue="firm" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="firm" className="gap-2">
            <Building2 className="h-4 w-4" />
            המשרד
          </TabsTrigger>
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            פרופיל
          </TabsTrigger>
          <TabsTrigger value="billing" className="gap-2">
            <CreditCard className="h-4 w-4" />
            חיוב
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            התראות
          </TabsTrigger>
        </TabsList>

        {/* Firm Settings */}
        <TabsContent value="firm">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  פרטי המשרד
                </CardTitle>
                <CardDescription>
                  פרטים כלליים על המשרד שיופיעו במסמכים ובחשבוניות
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firmName">שם המשרד</Label>
                    <Input id="firmName" defaultValue="משרד עו״ד" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="firmNameEn">שם המשרד (אנגלית)</Label>
                    <Input id="firmNameEn" defaultValue="Law Office" dir="ltr" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firmLicense">מספר רישיון</Label>
                    <Input id="firmLicense" dir="ltr" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="firmTaxId">ח.פ. / עוסק מורשה</Label>
                    <Input id="firmTaxId" dir="ltr" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="firmAddress">כתובת</Label>
                  <Textarea id="firmAddress" rows={2} />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firmPhone">טלפון</Label>
                    <Input id="firmPhone" type="tel" dir="ltr" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="firmFax">פקס</Label>
                    <Input id="firmFax" type="tel" dir="ltr" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="firmEmail">דוא״ל</Label>
                    <Input id="firmEmail" type="email" dir="ltr" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="firmWebsite">אתר אינטרנט</Label>
                  <Input id="firmWebsite" type="url" dir="ltr" />
                </div>

                <Button onClick={showSavedMessage} className="gap-2">
                  <Save className="h-4 w-4" />
                  שמור
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  תחומי התמחות
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {[
                    'משפט אזרחי',
                    'משפט פלילי',
                    'דיני משפחה',
                    'דיני עבודה',
                    'מקרקעין',
                    'משפט מסחרי',
                    'נזיקין',
                  ].map((area) => (
                    <Badge key={area} variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                      {area}
                    </Badge>
                  ))}
                  <Button variant="outline" size="sm">+ הוסף תחום</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  כותרת למסמכים
                </CardTitle>
                <CardDescription>
                  פורמט הכותרת שתופיע בראש מסמכים מודפסים
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  rows={4}
                  defaultValue={`משרד עו״ד
רח' הרצל 123, תל אביב
טל: 03-1234567 | פקס: 03-1234568
office@lawfirm.co.il`}
                />
                <Button onClick={showSavedMessage} className="gap-2">
                  <Save className="h-4 w-4" />
                  שמור
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Profile Settings */}
        <TabsContent value="profile">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  פרטים אישיים
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">שם פרטי</Label>
                    <Input id="firstName" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">שם משפחה</Label>
                    <Input id="lastName" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="barNumber">מספר רישיון עו״ד</Label>
                    <Input id="barNumber" dir="ltr" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title">תואר</Label>
                    <Select defaultValue="advocate">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="advocate">עו״ד</SelectItem>
                        <SelectItem value="notary">עו״ד ונוטריון</SelectItem>
                        <SelectItem value="partner">שותף</SelectItem>
                        <SelectItem value="associate">עו״ד שכיר</SelectItem>
                        <SelectItem value="intern">מתמחה</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">דוא״ל</Label>
                    <Input id="email" type="email" dir="ltr" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">טלפון</Label>
                    <Input id="phone" type="tel" dir="ltr" />
                  </div>
                </div>

                <Button onClick={showSavedMessage} className="gap-2">
                  <Save className="h-4 w-4" />
                  שמור
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  אבטחה
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">סיסמה נוכחית</Label>
                  <Input id="currentPassword" type="password" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">סיסמה חדשה</Label>
                    <Input id="newPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">אימות סיסמה</Label>
                    <Input id="confirmPassword" type="password" />
                  </div>
                </div>

                <Button variant="outline" onClick={showSavedMessage}>
                  שנה סיסמה
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Billing Settings */}
        <TabsContent value="billing">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  הגדרות זמן וחיוב
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="defaultRate">תעריף שעתי ברירת מחדל (₪)</Label>
                    <Input id="defaultRate" type="number" defaultValue="500" dir="ltr" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minBilling">יחידת חיוב מינימלית (דקות)</Label>
                    <Select defaultValue="6">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 דקה</SelectItem>
                        <SelectItem value="6">6 דקות (0.1 שעה)</SelectItem>
                        <SelectItem value="15">15 דקות (0.25 שעה)</SelectItem>
                        <SelectItem value="30">30 דקות (0.5 שעה)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="roundingRule">עיגול זמן</Label>
                  <Select defaultValue="up">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="up">עיגול כלפי מעלה</SelectItem>
                      <SelectItem value="nearest">עיגול לקרוב</SelectItem>
                      <SelectItem value="down">עיגול כלפי מטה</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={showSavedMessage} className="gap-2">
                  <Save className="h-4 w-4" />
                  שמור
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  פרטי חשבונית
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vatRate">מע״מ (%)</Label>
                    <Input id="vatRate" type="number" defaultValue="17" dir="ltr" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentTerms">תנאי תשלום (ימים)</Label>
                    <Input id="paymentTerms" type="number" defaultValue="30" dir="ltr" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="invoicePrefix">קידומת מספר חשבונית</Label>
                  <Input id="invoicePrefix" defaultValue="INV-" dir="ltr" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="invoiceNotes">הערות קבועות לחשבונית</Label>
                  <Textarea
                    id="invoiceNotes"
                    rows={3}
                    defaultValue="תשלום באמצעות העברה בנקאית.
החשבונית הופקה כדין ע״י תוכנת לורה."
                  />
                </div>

                <Button onClick={showSavedMessage} className="gap-2">
                  <Save className="h-4 w-4" />
                  שמור
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>פרטי בנק</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bankName">שם הבנק</Label>
                    <Input id="bankName" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bankBranch">מספר סניף</Label>
                    <Input id="bankBranch" dir="ltr" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bankAccount">מספר חשבון</Label>
                    <Input id="bankAccount" dir="ltr" />
                  </div>
                </div>

                <Button onClick={showSavedMessage} className="gap-2">
                  <Save className="h-4 w-4" />
                  שמור
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                הגדרות התראות
              </CardTitle>
              <CardDescription>
                בחר אילו התראות תרצה לקבל
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">התראות מועדים</h4>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium">תזכורת מועד אחרון</p>
                    <p className="text-sm text-muted-foreground">קבל התראה לפני מועד אחרון בתיק</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium">התראת דיון קרוב</p>
                    <p className="text-sm text-muted-foreground">תזכורת יום לפני דיון</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium">משימות באיחור</p>
                    <p className="text-sm text-muted-foreground">התראה על משימות שעבר מועדן</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-medium">התראות מערכת</h4>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium">לקוח חדש</p>
                    <p className="text-sm text-muted-foreground">התראה כאשר נוסף לקוח חדש</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium">מסמך חדש</p>
                    <p className="text-sm text-muted-foreground">התראה כאשר מועלה מסמך חדש</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium">תשלום התקבל</p>
                    <p className="text-sm text-muted-foreground">התראה כאשר חשבונית משולמת</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-medium">אמצעי קבלת התראות</h4>

                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <p className="font-medium">דוא״ל</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    <p className="font-medium">התראות במערכת</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <p className="font-medium">SMS</p>
                  </div>
                  <Switch />
                </div>
              </div>

              <Button onClick={showSavedMessage} className="gap-2">
                <Save className="h-4 w-4" />
                שמור הגדרות
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
