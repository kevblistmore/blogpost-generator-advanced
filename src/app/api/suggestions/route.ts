//src/app/api/suggestions/route.ts
import { NextResponse } from 'next/server';
import { Configuration, OpenAIApi } from 'openai';
import { generatePromptSuggestionsPrompt } from '../../lib/prompts';

export async function POST(request: Request) {
  try {
    const { topic } = await request.json();
    const config = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(config);

    const prompt = generatePromptSuggestionsPrompt(topic);
    const response = await openai.createChatCompletion({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });

    const rawContent = response.data.choices[0]?.message?.content || '[]';
    
    // Add proper JSON parsing logic here
    const cleanedContent = rawContent
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
      
    return NextResponse.json({ suggestions: JSON.parse(cleanedContent) });
    
  } catch (error) {
    console.error('Suggestion error:', error);
    return NextResponse.json(
      { suggestions: [] },
      { status: 200 }
    );
  }
}