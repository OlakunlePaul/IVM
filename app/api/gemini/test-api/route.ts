import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

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

    // Test basic Gemini API connection
    const genAI = new GoogleGenerativeAI(apiKey)
    // Use gemini-1.5-flash or gemini-1.5-pro which are the current available models
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const result = await model.generateContent('Say "API is working" if you can read this.')
    const response = await result.response
    const text = response.text()

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

