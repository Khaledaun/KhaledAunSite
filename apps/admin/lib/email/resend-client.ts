/**
 * Resend Email Client
 * Handles email sending via Resend API
 */

export interface ResendConfig {
  apiKey: string;
  fromEmail: string;
  fromName: string;
}

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  tags?: Array<{ name: string; value: string }>;
  headers?: Record<string, string>;
}

export interface SendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Get Resend configuration from environment
 */
export function getResendConfig(): ResendConfig {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'hello@khaledaun.com';
  const fromName = process.env.RESEND_FROM_NAME || 'Khaled Aun';

  if (!apiKey) {
    throw new Error('RESEND_API_KEY environment variable is not set');
  }

  return {
    apiKey,
    fromEmail,
    fromName,
  };
}

/**
 * Send a single email via Resend
 */
export async function sendEmail(options: EmailOptions): Promise<SendResult> {
  try {
    const config = getResendConfig();

    const from = options.from || `${config.fromName} <${config.fromEmail}>`;
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text,
        reply_to: options.replyTo,
        tags: options.tags,
        headers: options.headers,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Resend API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send email',
      };
    }

    const data = await response.json();

    return {
      success: true,
      messageId: data.id,
    };
  } catch (error) {
    console.error('Email send error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send bulk emails via Resend (batch API)
 */
export async function sendBulkEmails(
  emails: EmailOptions[]
): Promise<SendResult[]> {
  try {
    const config = getResendConfig();

    const response = await fetch('https://api.resend.com/emails/batch', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        emails.map((email) => ({
          from: email.from || `${config.fromName} <${config.fromEmail}>`,
          to: Array.isArray(email.to) ? email.to : [email.to],
          subject: email.subject,
          html: email.html,
          text: email.text,
          reply_to: email.replyTo,
          tags: email.tags,
          headers: email.headers,
        }))
      ),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Resend batch API error:', error);
      throw new Error(error.message || 'Failed to send bulk emails');
    }

    const data = await response.json();

    // Resend batch API returns array of results
    return data.data.map((result: any) => ({
      success: !result.error,
      messageId: result.id,
      error: result.error?.message,
    }));
  } catch (error) {
    console.error('Bulk email send error:', error);
    // Return error for all emails
    return emails.map(() => ({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }));
  }
}

/**
 * Send email with template variables
 */
export async function sendTemplateEmail(
  to: string,
  templateHtml: string,
  templateText: string | undefined,
  subject: string,
  variables: Record<string, string>
): Promise<SendResult> {
  // Replace variables in template
  let html = templateHtml;
  let text = templateText;
  let processedSubject = subject;

  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    html = html.replace(regex, value);
    if (text) {
      text = text.replace(regex, value);
    }
    processedSubject = processedSubject.replace(regex, value);
  });

  return sendEmail({
    to,
    subject: processedSubject,
    html,
    text,
  });
}

/**
 * Send welcome/confirmation email
 */
export async function sendConfirmationEmail(
  to: string,
  confirmUrl: string,
  firstName?: string
): Promise<SendResult> {
  const name = firstName || 'there';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirm your subscription</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">Welcome to Khaled Aun!</h1>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px;">Hi ${name},</p>
        
        <p style="font-size: 16px;">
          Thanks for subscribing! Please confirm your email address to start receiving updates about:
        </p>
        
        <ul style="font-size: 16px; line-height: 2;">
          <li>Latest blog posts and articles</li>
          <li>Technical insights and tutorials</li>
          <li>Project updates and announcements</li>
        </ul>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${confirmUrl}" 
             style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    color: white; 
                    padding: 15px 40px; 
                    text-decoration: none; 
                    border-radius: 5px; 
                    font-size: 16px; 
                    font-weight: bold;
                    display: inline-block;">
            Confirm My Subscription
          </a>
        </div>
        
        <p style="font-size: 14px; color: #666;">
          Or copy and paste this link into your browser:<br>
          <a href="${confirmUrl}" style="color: #667eea; word-break: break-all;">${confirmUrl}</a>
        </p>
        
        <p style="font-size: 14px; color: #666; margin-top: 30px;">
          If you didn't subscribe to this newsletter, you can safely ignore this email.
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
        <p>© ${new Date().getFullYear()} Khaled Aun. All rights reserved.</p>
        <p>
          <a href="https://khaledaun.com" style="color: #667eea;">Website</a> |
          <a href="https://khaledaun.com/privacy" style="color: #667eea;">Privacy Policy</a>
        </p>
      </div>
    </body>
    </html>
  `;

  const text = `
Hi ${name},

Thanks for subscribing! Please confirm your email address to start receiving updates.

Confirm your subscription: ${confirmUrl}

You'll receive:
- Latest blog posts and articles
- Technical insights and tutorials
- Project updates and announcements

If you didn't subscribe, you can safely ignore this email.

© ${new Date().getFullYear()} Khaled Aun
  `.trim();

  return sendEmail({
    to,
    subject: 'Please confirm your subscription',
    html,
    text,
  });
}

/**
 * Send unsubscribe confirmation
 */
export async function sendUnsubscribeConfirmation(
  to: string,
  firstName?: string
): Promise<SendResult> {
  const name = firstName || 'there';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>You've been unsubscribed</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #f3f4f6; padding: 30px; text-align: center; border-radius: 10px;">
        <h1 style="color: #374151; margin: 0;">You've been unsubscribed</h1>
      </div>
      
      <div style="padding: 30px 0;">
        <p style="font-size: 16px;">Hi ${name},</p>
        
        <p style="font-size: 16px;">
          You've been successfully unsubscribed from our newsletter. We're sorry to see you go!
        </p>
        
        <p style="font-size: 16px;">
          Changed your mind? You can resubscribe anytime at 
          <a href="https://khaledaun.com" style="color: #667eea;">khaledaun.com</a>
        </p>
        
        <p style="font-size: 14px; color: #666; margin-top: 30px;">
          Thanks for being part of our community!
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
        <p>© ${new Date().getFullYear()} Khaled Aun. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;

  const text = `
Hi ${name},

You've been successfully unsubscribed from our newsletter. We're sorry to see you go!

Changed your mind? You can resubscribe anytime at https://khaledaun.com

Thanks for being part of our community!

© ${new Date().getFullYear()} Khaled Aun
  `.trim();

  return sendEmail({
    to,
    subject: "You've been unsubscribed",
    html,
    text,
  });
}

