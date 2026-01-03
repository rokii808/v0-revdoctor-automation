/**
 * MULTI-PROVIDER EMAIL SYSTEM
 *
 * Supports: Brevo (300/day free), Amazon SES (cheapest), Resend (dev-friendly)
 * Switch providers via EMAIL_PROVIDER environment variable
 */

import { Resend } from "resend"
import * as brevo from "@getbrevo/brevo"
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses"

// Email provider configuration
const EMAIL_PROVIDER = (process.env.EMAIL_PROVIDER || "brevo") as "brevo" | "ses" | "resend"

// Provider clients (lazy loaded)
let resendClient: Resend | null = null
let brevoClient: brevo.TransactionalEmailsApi | null = null
let sesClient: SESClient | null = null

/**
 * Email send result (standardized across providers)
 */
export interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
}

/**
 * Email parameters (standardized)
 */
export interface EmailParams {
  from: string
  to: string | string[]
  subject: string
  html: string
  tags?: { name: string; value: string }[]
}

/**
 * Send email using configured provider
 */
export async function sendEmail(params: EmailParams): Promise<EmailResult> {
  console.log(`[Email] Sending via ${EMAIL_PROVIDER.toUpperCase()} to ${params.to}`)

  try {
    switch (EMAIL_PROVIDER) {
      case "brevo":
        return await sendViaBrevo(params)
      case "ses":
        return await sendViaSES(params)
      case "resend":
        return await sendViaResend(params)
      default:
        throw new Error(`Unknown email provider: ${EMAIL_PROVIDER}`)
    }
  } catch (error) {
    console.error(`[Email] ${EMAIL_PROVIDER} error:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

/**
 * Brevo (formerly Sendinblue)
 * FREE: 300 emails/day
 * PAID: $25/month for 20,000 emails
 */
async function sendViaBrevo(params: EmailParams): Promise<EmailResult> {
  if (!brevoClient) {
    if (!process.env.BREVO_API_KEY) {
      throw new Error("BREVO_API_KEY environment variable is required")
    }

    const apiInstance = new brevo.TransactionalEmailsApi()
    apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY)
    brevoClient = apiInstance
  }

  const sendSmtpEmail = new brevo.SendSmtpEmail()

  // Parse "from" field
  const fromMatch = params.from.match(/^(.+?)\s*<(.+?)>$/)
  sendSmtpEmail.sender = fromMatch
    ? { name: fromMatch[1], email: fromMatch[2] }
    : { email: params.from }

  // Handle single or multiple recipients
  const toEmails = Array.isArray(params.to) ? params.to : [params.to]
  sendSmtpEmail.to = toEmails.map((email) => ({ email }))

  sendSmtpEmail.subject = params.subject
  sendSmtpEmail.htmlContent = params.html

  // Add tags if provided
  if (params.tags) {
    sendSmtpEmail.tags = params.tags.map((t) => t.value)
  }

  const response = await brevoClient.sendTransacEmail(sendSmtpEmail)

  return {
    success: true,
    messageId: response.body.messageId,
  }
}

/**
 * Amazon SES
 * FREE: 62,000 emails/month (with AWS Free Tier)
 * PAID: $0.10 per 1,000 emails
 */
async function sendViaSES(params: EmailParams): Promise<EmailResult> {
  if (!sesClient) {
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      throw new Error("AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY required for SES")
    }

    sesClient = new SESClient({
      region: process.env.AWS_REGION || "us-east-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    })
  }

  // Handle single or multiple recipients
  const toEmails = Array.isArray(params.to) ? params.to : [params.to]

  const command = new SendEmailCommand({
    Source: params.from,
    Destination: {
      ToAddresses: toEmails,
    },
    Message: {
      Subject: {
        Data: params.subject,
        Charset: "UTF-8",
      },
      Body: {
        Html: {
          Data: params.html,
          Charset: "UTF-8",
        },
      },
    },
    // Tags for SES
    Tags: params.tags?.map((t) => ({
      Name: t.name,
      Value: t.value,
    })),
  })

  const response = await sesClient.send(command)

  return {
    success: true,
    messageId: response.MessageId,
  }
}

/**
 * Resend (fallback/dev-friendly option)
 * FREE: 100 emails/day
 * PAID: $20/month for 50,000 emails
 */
async function sendViaResend(params: EmailParams): Promise<EmailResult> {
  if (!resendClient) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY environment variable is required")
    }
    resendClient = new Resend(process.env.RESEND_API_KEY)
  }

  const { data, error } = await resendClient.emails.send({
    from: params.from,
    to: Array.isArray(params.to) ? params.to : [params.to],
    subject: params.subject,
    html: params.html,
    tags: params.tags,
  })

  if (error) {
    return {
      success: false,
      error: error.message,
    }
  }

  return {
    success: true,
    messageId: data?.id,
  }
}

/**
 * Get provider info for logging
 */
export function getProviderInfo() {
  const providers = {
    brevo: {
      name: "Brevo",
      free: "300 emails/day",
      paid: "$25/month for 20k",
    },
    ses: {
      name: "Amazon SES",
      free: "62,000 emails/month",
      paid: "$0.10 per 1,000",
    },
    resend: {
      name: "Resend",
      free: "100 emails/day",
      paid: "$20/month for 50k",
    },
  }

  return {
    current: EMAIL_PROVIDER,
    ...providers[EMAIL_PROVIDER],
  }
}
