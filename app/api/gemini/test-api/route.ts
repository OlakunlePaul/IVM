import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyB5G4E3ziATLbXKZo8yWcbOwBjZC5itG6s'
    
    if (!apiKey) {
      return NextResponse.json({
        status: 'error',
        message: 'API key not configured',
      }, { status: 500 })
    }

    // Test basic Gemini API connection using direct REST API
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: 'Say "API is working" if you can read this.'
          }]
        }]
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({
        status: 'error',
        message: `API request failed: ${response.status} ${response.statusText}`,
        details: errorText.substring(0, 500),
      }, { status: response.status })
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response text found'

    return NextResponse.json({
      status: 'success',
      message: 'API connection successful',
      response: text,
      apiKeyConfigured: !!apiKey,
    })
  } catch (error) {
    console.error('API test error:', error)
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : undefined,
    }, { status: 500 })
  }
}

