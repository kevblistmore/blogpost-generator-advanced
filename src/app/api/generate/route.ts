//src/app/api/generate/route.ts

import { NextResponse } from 'next/server';
import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export async function POST(request: Request) {
  try {
    const { topic, title } = await request.json();

    const response = await openai.createChatCompletion({
      model: 'gpt-4o',
      messages: [{
        role: 'user',
        content: `Write a comprehensive blog post about ${title || topic} using markdown formatting.`
      }],
      temperature: 0.7,
    });

    const content = response.data.choices[0]?.message?.content || '';
    return NextResponse.json({ content });
    
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}