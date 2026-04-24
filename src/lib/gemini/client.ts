import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function generateDanishResponse(
  inquiry: { senderName: string; body: string },
  userId: string
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

  const prompt = `
Du er en dansk kundeservicemedarbejder. Skriv et høfligt, professionelt svar på dansk.

Kundehenvendelse:
Fra: ${inquiry.senderName}
Besked: ${inquiry.body}

Svar (kort, venligt, professionelt):
`

  const result = await model.generateContent(prompt)
  return result.response.text()
}
