import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Header,
  Footer,
  PageNumber,
  NumberFormat,
  PageBreak,
} from 'docx'
import { documentTemplates, type GenerateDocumentInput } from '@/lib/schemas/document'

// Hebrew date formatting
export function formatHebrewDate(date: Date): string {
  return new Intl.DateTimeFormat('he-IL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

// Document titles by template
const documentTitles: Record<string, string> = {
  claim: 'כתב תביעה',
  defense: 'כתב הגנה',
  motion: 'בקשה',
  'urgent-motion': 'בקשה דחופה',
  affidavit: 'תצהיר',
  retainer: 'הסכם שכר טרחה',
  nda: 'הסכם סודיות',
  'general-contract': 'חוזה',
  'demand-letter': 'מכתב התראה',
  'legal-opinion': 'חוות דעת משפטית',
  'power-of-attorney': 'ייפוי כוח',
}

// Court names in Hebrew
export const courts: Record<string, string> = {
  'supreme': 'בית המשפט העליון',
  'district-tel-aviv': 'בית המשפט המחוזי תל אביב',
  'district-haifa': 'בית המשפט המחוזי חיפה',
  'district-jerusalem': 'בית המשפט המחוזי ירושלים',
  'district-beersheba': 'בית המשפט המחוזי באר שבע',
  'district-nazareth': 'בית המשפט המחוזי נצרת',
  'magistrate-tel-aviv': 'בית משפט השלום תל אביב',
  'magistrate-haifa': 'בית משפט השלום חיפה',
  'magistrate-jerusalem': 'בית משפט השלום ירושלים',
  'family-tel-aviv': 'בית המשפט לענייני משפחה תל אביב',
  'labor-tel-aviv': 'בית הדין האזורי לעבודה תל אביב',
  'labor-national': 'בית הדין הארצי לעבודה',
}

interface UserInfo {
  name: string
  licenseNumber: string
  firmName: string
  firmAddress: string
  phone?: string
  email?: string
}

// Default user info (should be loaded from settings)
const defaultUserInfo: UserInfo = {
  name: 'עו"ד ישראל ישראלי',
  licenseNumber: '00000',
  firmName: 'משרד עורכי דין',
  firmAddress: 'רחוב הדוגמה 1, תל אביב',
  phone: '03-0000000',
  email: 'office@lawfirm.co.il',
}

// Replace placeholders in text
function replacePlaceholders(
  text: string,
  data: GenerateDocumentInput,
  userInfo: UserInfo = defaultUserInfo
): string {
  const placeholders: Record<string, string> = {
    'client.name': data.client.name,
    'client.idNumber': data.client.idNumber || '__________',
    'client.address': data.client.address || '__________',
    'client.phone': data.client.phone || '__________',
    'client.email': data.client.email || '__________',
    'case.number': data.case?.number || '__________',
    'case.court': data.case?.court || '__________',
    'case.judge': data.case?.judge || '__________',
    'case.title': data.case?.title || '__________',
    'opposingParty.name': data.opposingParty?.name || '__________',
    'opposingParty.counsel': data.opposingParty?.counsel || '__________',
    'opposingParty.address': data.opposingParty?.address || '__________',
    'user.name': userInfo.name,
    'user.licenseNumber': userInfo.licenseNumber,
    'user.firmName': userInfo.firmName,
    'user.firmAddress': userInfo.firmAddress,
    'user.phone': userInfo.phone || '',
    'user.email': userInfo.email || '',
    'today': formatHebrewDate(new Date()),
    ...data.customFields,
  }

  let result = text
  for (const [key, value] of Object.entries(placeholders)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value)
  }

  return result
}

// Build claim document
function buildClaimDocument(data: GenerateDocumentInput, userInfo: UserInfo): Document {
  const title = 'כתב תביעה'
  const caseNumber = data.case?.number || '__________'
  const court = data.case?.court || 'בית משפט השלום'

  return new Document({
    sections: [{
      properties: {
        bidi: true,
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              bidirectional: true,
              children: [
                new TextRun({
                  text: `${court} - ת.א. ${caseNumber}`,
                  size: 20,
                  font: 'David',
                }),
              ],
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  children: [PageNumber.CURRENT, ' מתוך ', PageNumber.TOTAL_PAGES],
                  size: 20,
                  font: 'David',
                }),
              ],
            }),
          ],
        }),
      },
      children: [
        // Court header
        new Paragraph({
          alignment: AlignmentType.CENTER,
          bidirectional: true,
          spacing: { after: 200 },
          children: [
            new TextRun({
              text: court,
              bold: true,
              size: 28,
              font: 'David',
            }),
          ],
        }),
        // Case number
        new Paragraph({
          alignment: AlignmentType.CENTER,
          bidirectional: true,
          spacing: { after: 400 },
          children: [
            new TextRun({
              text: `ת.א. ${caseNumber}`,
              size: 24,
              font: 'David',
            }),
          ],
        }),
        // Title
        new Paragraph({
          alignment: AlignmentType.CENTER,
          bidirectional: true,
          spacing: { after: 400 },
          children: [
            new TextRun({
              text: title,
              bold: true,
              size: 36,
              font: 'David',
              underline: {},
            }),
          ],
        }),
        // Parties section
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          spacing: { before: 200, after: 100 },
          children: [
            new TextRun({
              text: 'בעניין:',
              bold: true,
              size: 24,
              font: 'David',
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          indent: { start: 720 },
          children: [
            new TextRun({
              text: data.client.name,
              size: 24,
              font: 'David',
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          indent: { start: 720 },
          spacing: { after: 200 },
          children: [
            new TextRun({
              text: `ת.ז. ${data.client.idNumber || '__________'}`,
              size: 24,
              font: 'David',
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          children: [
            new TextRun({
              text: 'ע"י ב"כ:',
              size: 24,
              font: 'David',
            }),
            new TextRun({
              text: ` ${userInfo.name} (רישיון מס׳ ${userInfo.licenseNumber})`,
              size: 24,
              font: 'David',
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          indent: { start: 720 },
          spacing: { after: 300 },
          children: [
            new TextRun({
              text: userInfo.firmAddress,
              size: 24,
              font: 'David',
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          bidirectional: true,
          spacing: { after: 300 },
          children: [
            new TextRun({
              text: 'התובע',
              bold: true,
              size: 24,
              font: 'David',
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          bidirectional: true,
          spacing: { after: 300 },
          children: [
            new TextRun({
              text: '- נ ג ד -',
              bold: true,
              size: 24,
              font: 'David',
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          indent: { start: 720 },
          children: [
            new TextRun({
              text: data.opposingParty?.name || '__________',
              size: 24,
              font: 'David',
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          bidirectional: true,
          spacing: { before: 200, after: 400 },
          children: [
            new TextRun({
              text: 'הנתבע',
              bold: true,
              size: 24,
              font: 'David',
            }),
          ],
        }),
        // Content section
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          spacing: { before: 400, after: 200 },
          children: [
            new TextRun({
              text: 'מבוא',
              bold: true,
              size: 28,
              font: 'David',
              underline: {},
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          spacing: { after: 200 },
          children: [
            new TextRun({
              text: data.customContent || '[יש להזין את תוכן התביעה כאן]',
              size: 24,
              font: 'David',
            }),
          ],
        }),
        // Signature
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          spacing: { before: 600, after: 100 },
          children: [
            new TextRun({
              text: 'בכבוד רב,',
              size: 24,
              font: 'David',
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          spacing: { before: 200 },
          children: [
            new TextRun({
              text: '_______________________',
              size: 24,
              font: 'David',
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          children: [
            new TextRun({
              text: userInfo.name,
              size: 24,
              font: 'David',
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          children: [
            new TextRun({
              text: `ב"כ התובע`,
              size: 24,
              font: 'David',
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          spacing: { before: 400 },
          children: [
            new TextRun({
              text: `תאריך: ${formatHebrewDate(new Date())}`,
              size: 24,
              font: 'David',
            }),
          ],
        }),
      ],
    }],
  })
}

// Build generic motion document
function buildMotionDocument(data: GenerateDocumentInput, userInfo: UserInfo, isUrgent: boolean = false): Document {
  const title = isUrgent ? 'בקשה דחופה' : 'בקשה'
  const caseNumber = data.case?.number || '__________'
  const court = data.case?.court || 'בית משפט השלום'

  return new Document({
    sections: [{
      properties: {
        bidi: true,
      },
      children: [
        // Court header
        new Paragraph({
          alignment: AlignmentType.CENTER,
          bidirectional: true,
          spacing: { after: 200 },
          children: [
            new TextRun({
              text: court,
              bold: true,
              size: 28,
              font: 'David',
            }),
          ],
        }),
        // Case number
        new Paragraph({
          alignment: AlignmentType.CENTER,
          bidirectional: true,
          spacing: { after: 400 },
          children: [
            new TextRun({
              text: `ת.א. ${caseNumber}`,
              size: 24,
              font: 'David',
            }),
          ],
        }),
        // Urgent marker
        ...(isUrgent ? [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            bidirectional: true,
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: '*** דחוף ***',
                bold: true,
                size: 28,
                font: 'David',
                color: 'FF0000',
              }),
            ],
          }),
        ] : []),
        // Title
        new Paragraph({
          alignment: AlignmentType.CENTER,
          bidirectional: true,
          spacing: { after: 400 },
          children: [
            new TextRun({
              text: title,
              bold: true,
              size: 36,
              font: 'David',
              underline: {},
            }),
          ],
        }),
        // Content
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          spacing: { after: 200 },
          children: [
            new TextRun({
              text: 'כבוד בית המשפט מתבקש להורות כדלקמן:',
              size: 24,
              font: 'David',
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          spacing: { after: 400 },
          children: [
            new TextRun({
              text: data.customContent || '[יש להזין את תוכן הבקשה כאן]',
              size: 24,
              font: 'David',
            }),
          ],
        }),
        // Signature
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          spacing: { before: 400 },
          children: [
            new TextRun({
              text: 'בכבוד רב,',
              size: 24,
              font: 'David',
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          spacing: { before: 200 },
          children: [
            new TextRun({
              text: userInfo.name,
              size: 24,
              font: 'David',
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          children: [
            new TextRun({
              text: `ב"כ המבקש`,
              size: 24,
              font: 'David',
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          spacing: { before: 200 },
          children: [
            new TextRun({
              text: `תאריך: ${formatHebrewDate(new Date())}`,
              size: 24,
              font: 'David',
            }),
          ],
        }),
      ],
    }],
  })
}

// Build affidavit document
function buildAffidavitDocument(data: GenerateDocumentInput, userInfo: UserInfo): Document {
  return new Document({
    sections: [{
      properties: {
        bidi: true,
      },
      children: [
        // Title
        new Paragraph({
          alignment: AlignmentType.CENTER,
          bidirectional: true,
          spacing: { after: 400 },
          children: [
            new TextRun({
              text: 'תצהיר',
              bold: true,
              size: 36,
              font: 'David',
              underline: {},
            }),
          ],
        }),
        // Declarant info
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          spacing: { after: 200 },
          children: [
            new TextRun({
              text: `אני הח"מ, ${data.client.name}, ת.ז. ${data.client.idNumber || '__________'},`,
              size: 24,
              font: 'David',
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          spacing: { after: 200 },
          children: [
            new TextRun({
              text: 'לאחר שהוזהרתי כי עלי לומר את האמת וכי אהיה צפוי לעונשים הקבועים בחוק אם לא אעשה כן, מצהיר בזאת בכתב כדלקמן:',
              size: 24,
              font: 'David',
            }),
          ],
        }),
        // Content
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          spacing: { before: 200, after: 400 },
          children: [
            new TextRun({
              text: data.customContent || '[יש להזין את תוכן התצהיר כאן]',
              size: 24,
              font: 'David',
            }),
          ],
        }),
        // Declaration
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          spacing: { before: 200, after: 200 },
          children: [
            new TextRun({
              text: 'ולראיה באתי על החתום:',
              size: 24,
              font: 'David',
            }),
          ],
        }),
        // Signature
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          spacing: { before: 200 },
          children: [
            new TextRun({
              text: '_______________________',
              size: 24,
              font: 'David',
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          children: [
            new TextRun({
              text: data.client.name,
              size: 24,
              font: 'David',
            }),
          ],
        }),
        // Attorney certification
        new Paragraph({
          alignment: AlignmentType.CENTER,
          bidirectional: true,
          spacing: { before: 400, after: 200 },
          children: [
            new TextRun({
              text: 'אישור עורך דין',
              bold: true,
              size: 28,
              font: 'David',
              underline: {},
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          spacing: { after: 200 },
          children: [
            new TextRun({
              text: `אני הח"מ, ${userInfo.name}, עו"ד, מאשר בזה כי ביום ${formatHebrewDate(new Date())} הופיע/ה בפני ${data.client.name}, המוכר/ת לי אישית/שזיהיתי אותו/ה עפ"י ת.ז. מספר ${data.client.idNumber || '__________'}, ולאחר שהזהרתיו/ה כי עליו/ה להצהיר את האמת וכי יהיה/תהיה צפוי/ה לעונשים הקבועים בחוק אם לא יעשה/תעשה כן, חתם/ה בפני על תצהיר זה.`,
              size: 24,
              font: 'David',
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          spacing: { before: 200 },
          children: [
            new TextRun({
              text: '_______________________',
              size: 24,
              font: 'David',
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          children: [
            new TextRun({
              text: `${userInfo.name}, עו"ד`,
              size: 24,
              font: 'David',
            }),
          ],
        }),
      ],
    }],
  })
}

// Build demand letter
function buildDemandLetterDocument(data: GenerateDocumentInput, userInfo: UserInfo): Document {
  return new Document({
    sections: [{
      properties: {
        bidi: true,
      },
      children: [
        // Letterhead
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          children: [
            new TextRun({
              text: userInfo.firmName,
              bold: true,
              size: 28,
              font: 'David',
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          children: [
            new TextRun({
              text: userInfo.firmAddress,
              size: 22,
              font: 'David',
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          spacing: { after: 400 },
          children: [
            new TextRun({
              text: `טל: ${userInfo.phone || ''}  |  ${userInfo.email || ''}`,
              size: 22,
              font: 'David',
            }),
          ],
        }),
        // Date
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          spacing: { after: 200 },
          children: [
            new TextRun({
              text: formatHebrewDate(new Date()),
              size: 24,
              font: 'David',
            }),
          ],
        }),
        // Recipient
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          children: [
            new TextRun({
              text: 'לכבוד',
              size: 24,
              font: 'David',
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          children: [
            new TextRun({
              text: data.opposingParty?.name || '__________',
              bold: true,
              size: 24,
              font: 'David',
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          spacing: { after: 400 },
          children: [
            new TextRun({
              text: data.opposingParty?.address || '',
              size: 24,
              font: 'David',
            }),
          ],
        }),
        // Subject
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          spacing: { after: 300 },
          children: [
            new TextRun({
              text: 'הנדון: מכתב התראה',
              bold: true,
              size: 24,
              font: 'David',
              underline: {},
            }),
          ],
        }),
        // Opening
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          spacing: { after: 200 },
          children: [
            new TextRun({
              text: 'א.ג.נ.,',
              size: 24,
              font: 'David',
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          spacing: { after: 200 },
          children: [
            new TextRun({
              text: `הריני לפנות אליך בשם מרשי, ${data.client.name}, כדלקמן:`,
              size: 24,
              font: 'David',
            }),
          ],
        }),
        // Content
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          spacing: { before: 200, after: 400 },
          children: [
            new TextRun({
              text: data.customContent || '[יש להזין את תוכן המכתב כאן]',
              size: 24,
              font: 'David',
            }),
          ],
        }),
        // Warning
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          spacing: { after: 200 },
          children: [
            new TextRun({
              text: 'הנך מוזהר כי באם לא תפעל בהתאם להנחיות שלעיל תוך 7 ימים ממועד קבלת מכתב זה, ייאלץ מרשי לפנות לערכאות המשפטיות המוסמכות, וזאת ללא כל התראה נוספת.',
              size: 24,
              font: 'David',
            }),
          ],
        }),
        // Closing
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          spacing: { before: 400 },
          children: [
            new TextRun({
              text: 'בכבוד רב,',
              size: 24,
              font: 'David',
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          spacing: { before: 200 },
          children: [
            new TextRun({
              text: userInfo.name,
              size: 24,
              font: 'David',
            }),
          ],
        }),
        // CC
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          spacing: { before: 400 },
          children: [
            new TextRun({
              text: `העתק: ${data.client.name}`,
              size: 20,
              font: 'David',
              italics: true,
            }),
          ],
        }),
      ],
    }],
  })
}

// Build generic document (fallback)
function buildGenericDocument(data: GenerateDocumentInput, userInfo: UserInfo, templateId: string): Document {
  const title = documentTitles[templateId] || 'מסמך'

  return new Document({
    sections: [{
      properties: {
        bidi: true,
      },
      children: [
        // Title
        new Paragraph({
          alignment: AlignmentType.CENTER,
          bidirectional: true,
          spacing: { after: 400 },
          children: [
            new TextRun({
              text: title,
              bold: true,
              size: 36,
              font: 'David',
              underline: {},
            }),
          ],
        }),
        // Date
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          spacing: { after: 200 },
          children: [
            new TextRun({
              text: `תאריך: ${formatHebrewDate(new Date())}`,
              size: 24,
              font: 'David',
            }),
          ],
        }),
        // Client info
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          spacing: { after: 300 },
          children: [
            new TextRun({
              text: `לקוח: ${data.client.name}`,
              size: 24,
              font: 'David',
            }),
          ],
        }),
        // Content
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          spacing: { before: 200, after: 400 },
          children: [
            new TextRun({
              text: data.customContent || '[יש להזין את התוכן כאן]',
              size: 24,
              font: 'David',
            }),
          ],
        }),
        // Signature
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          spacing: { before: 400 },
          children: [
            new TextRun({
              text: 'בכבוד רב,',
              size: 24,
              font: 'David',
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          spacing: { before: 200 },
          children: [
            new TextRun({
              text: userInfo.name,
              size: 24,
              font: 'David',
            }),
          ],
        }),
      ],
    }],
  })
}

// Main generator function
export async function generateDocument(
  templateId: string,
  data: GenerateDocumentInput,
  userInfo: UserInfo = defaultUserInfo
): Promise<Buffer> {
  let doc: Document

  switch (templateId) {
    case 'claim':
      doc = buildClaimDocument(data, userInfo)
      break
    case 'defense':
      // Defense is similar to claim structure
      doc = buildClaimDocument(data, userInfo)
      break
    case 'motion':
      doc = buildMotionDocument(data, userInfo, false)
      break
    case 'urgent-motion':
      doc = buildMotionDocument(data, userInfo, true)
      break
    case 'affidavit':
      doc = buildAffidavitDocument(data, userInfo)
      break
    case 'demand-letter':
      doc = buildDemandLetterDocument(data, userInfo)
      break
    default:
      doc = buildGenericDocument(data, userInfo, templateId)
  }

  return await Packer.toBuffer(doc)
}

// Get document filename
export function getDocumentFilename(templateId: string, clientName: string): string {
  const title = documentTitles[templateId] || 'document'
  const date = new Date().toISOString().split('T')[0]
  const sanitizedClientName = clientName.replace(/[^א-תa-zA-Z0-9]/g, '_')
  return `${title}_${sanitizedClientName}_${date}.docx`
}
