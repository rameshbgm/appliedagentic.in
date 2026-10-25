// app/api/settings/route.ts
import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError } from '@/lib/utils'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

const SettingsSchema = z.object({
  siteName: z.string().trim().min(1).max(200).optional(),
  showArticleImages: z.boolean().optional(),
  siteUrl: z.union([z.string().url().regex(/^https?:\/\//, 'Use an HTTP or HTTPS URL.'), z.literal('')]).optional(),
  tagline: z.string().max(500).optional(),
  logoUrl: z.string().optional(), faviconUrl: z.string().optional(),
  metaDescription: z.string().max(2000).optional(), footerText: z.string().max(2000).optional(),
  socialTwitter: z.string().optional(), socialLinkedin: z.string().optional(), socialYoutube: z.string().optional(),
  defaultOgImage: z.string().optional(), analyticsId: z.string().optional(),
  openaiTextModel: z.string().optional(), openaiImageModel: z.string().optional(), openaiAudioModel: z.string().optional(),
  openaiTemperature: z.coerce.number().min(0).max(2).optional(),
  openaiMaxTokens: z.coerce.number().int().positive().optional(),
  openaiImageSize: z.string().optional(), openaiImageQuality: z.string().optional(), openaiTtsVoice: z.string().optional(),
})

export async function GET() {
  const session = await auth()
  if (!session) return apiError('Unauthorized', 401)

  try {
    const settings = await prisma.siteSettings.findFirst()
    // Never return the API key to the client
    if (settings) {
      return apiSuccess({ ...settings })
    }
    return apiSuccess(null)
  } catch (err) {
    return apiError('Failed to fetch settings', 500, err)
  }
}

export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session) return apiError('Unauthorized', 401)

  try {
    const body = SettingsSchema.parse(await req.json())
    const {
      siteName,
      showArticleImages,
      siteUrl,
      tagline,
      logoUrl,
      faviconUrl,
      metaDescription,
      footerText,
      socialTwitter,
      socialLinkedin,
      socialYoutube,
      defaultOgImage,
      analyticsId,
      openaiTextModel,
      openaiImageModel,
      openaiAudioModel,
      openaiTemperature,
      openaiMaxTokens,
      openaiImageSize,
      openaiImageQuality,
      openaiTtsVoice,
    } = body

    const settings = await prisma.siteSettings.upsert({
      where: { id: 1 },
      update: {
        ...(siteName !== undefined && { siteName }),
        ...(showArticleImages !== undefined && { showArticleImages }),
        ...(siteUrl !== undefined && { siteUrl }),
        ...(tagline !== undefined && { tagline }),
        ...(logoUrl !== undefined && { logoUrl }),
        ...(faviconUrl !== undefined && { faviconUrl }),
        ...(metaDescription !== undefined && { metaDescription }),
        ...(footerText !== undefined && { footerText }),
        ...(socialTwitter !== undefined && { socialTwitter }),
        ...(socialLinkedin !== undefined && { socialLinkedin }),
        ...(socialYoutube !== undefined && { socialYoutube }),
        ...(defaultOgImage !== undefined && { defaultOgImage }),
        ...(analyticsId !== undefined && { analyticsId }),
        ...(openaiTextModel !== undefined && { openaiTextModel }),
        ...(openaiImageModel !== undefined && { openaiImageModel }),
        ...(openaiAudioModel !== undefined && { openaiAudioModel }),
        ...(openaiTemperature !== undefined && { openaiTemperature }),
        ...(openaiMaxTokens !== undefined && { openaiMaxTokens }),
        ...(openaiImageSize !== undefined && { openaiImageSize }),
        ...(openaiImageQuality !== undefined && { openaiImageQuality }),
        ...(openaiTtsVoice !== undefined && { openaiTtsVoice }),
      },
      create: {
        id: 1,
        ...body,
        siteName: siteName || 'Applied Agentic AI',
      },
    })

    revalidatePath('/', 'layout')
    return apiSuccess(settings)
  } catch (err) {
    if (err instanceof z.ZodError) return apiError(err.issues[0].message, 422)
    return apiError('Failed to update settings', 500, err)
  }
}
