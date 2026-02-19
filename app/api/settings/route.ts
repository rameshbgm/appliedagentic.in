// app/api/settings/route.ts
import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError } from '@/lib/utils'

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
    return apiError('Failed to fetch settings', 500)
  }
}

export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session) return apiError('Unauthorized', 401)

  try {
    const body = await req.json()
    const {
      siteName,
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
        ...(openaiTemperature !== undefined && { openaiTemperature: parseFloat(openaiTemperature) }),
        ...(openaiMaxTokens !== undefined && { openaiMaxTokens: parseInt(openaiMaxTokens) }),
        ...(openaiImageSize !== undefined && { openaiImageSize }),
        ...(openaiImageQuality !== undefined && { openaiImageQuality }),
        ...(openaiTtsVoice !== undefined && { openaiTtsVoice }),
      },
      create: {
        id: 1,
        siteName: siteName || 'Applied Agentic AI',
      },
    })

    return apiSuccess(settings)
  } catch (err) {
    return apiError('Failed to update settings', 500)
  }
}
