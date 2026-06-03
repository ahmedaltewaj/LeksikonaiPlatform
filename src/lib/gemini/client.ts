import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

async function generateWithRetry(
  model: ReturnType<typeof genAI.getGenerativeModel>,
  prompt: string,
  maxRetries = 3,
  baseDelay = 1000
): Promise<string> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await model.generateContent(prompt)
      return result.response.text()
    } catch (error) {
      lastError = error as Error
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError
}

export type ResponseTone = 'professional' | 'friendly'

const toneInstructions: Record<ResponseTone, string> = {
  professional: 'Skriv et høfligt, professionelt svar på dansk. Brug gerne De og Formel tone.',
  friendly: 'Skriv et venligt, uformelt svar på dansk. Brug gerne du og en varm, imødekommende tone.',
}

const FALLBACK_RESPONSE = 'Tak for din henvendelse. Vi har modtaget din besked og vil svare dig hurtigst muligt.'

export async function generateDanishResponse(
  inquiry: { senderName: string; body: string },
  _userId: string,
  tone: ResponseTone = 'professional'
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

  const toneInstruction = toneInstructions[tone]

  const prompt = `${toneInstruction}

Kundehenvendelse:
Fra: ${inquiry.senderName}
Besked: ${inquiry.body}

Svar (kort, venligt, professionelt):
`

  try {
    return await generateWithRetry(model, prompt)
  } catch (error) {
    console.error('Gemini AI failed after retries:', error)
    return FALLBACK_RESPONSE
  }
}
