import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { prompt, type = 'description' } = await request.json()

    // Use provided API key or fallback to environment variable
    const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyB5G4E3ziATLbXKZo8yWcbOwBjZC5itG6s'
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured' },
        { status: 500 }
      )
    }

    // Build system prompt based on type
    let systemPrompt = ''
    
    if (type === 'video-description') {
      systemPrompt = `You are a luxury car showroom content writer. Generate an engaging, premium description for a virtual tour video of an Innoson Vehicle Manufacturing (IVM) showroom. 
      
The description should:
- Be 2-3 sentences long
- Highlight the premium experience, craftsmanship, and luxury features
- Emphasize the pride of African roads
- Be professional yet inviting
- Focus on the virtual tour experience

Generate the description:`
    } else if (type === 'video-metadata') {
      systemPrompt = `Generate SEO-friendly metadata for a virtual tour video of an Innoson Vehicle Manufacturing showroom. 
      
Return a JSON object with:
- title: A compelling title (max 60 characters)
- description: A detailed description (max 160 characters)
- keywords: Array of relevant keywords

Format as JSON only:`
    }

    // Try v1beta with gemini-1.5-flash first
    let directApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`
    
    let response = await fetch(directApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\n${prompt || 'Generate content for the IVM showroom virtual tour'}`
          }]
        }]
      }),
    })
    
    // Fallback to gemini-pro if flash fails
    if (!response.ok) {
      directApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`
      response = await fetch(directApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${systemPrompt}\n\n${prompt || 'Generate content for the IVM showroom virtual tour'}`
            }]
          }]
        }),
      })
    }
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Gemini API error (${response.status}):`, errorText.substring(0, 300))
      throw new Error(`API returned ${response.status}: ${errorText.substring(0, 200)}`)
    }
    
    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    return NextResponse.json({ content: text })
  } catch (error) {
    console.error('Gemini API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate content', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

