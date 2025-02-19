// app/api/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Configuration, OpenAIApi } from 'openai';
import { topicSchema, sanitizeOutput } from '@/app/lib/validation';
import { generateBlogPrompt } from '@/app/lib/prompts';

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const parsed = topicSchema.safeParse({ topic: body.topic });
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid topic (3-100 characters required)' },
        { status: 400 }
      );
    }

    // Set up OpenAI
    const config = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(config);

    // Build prompt & call OpenAI
    const prompt = generateBlogPrompt(parsed.data.topic);
    const response = await openai.createChatCompletion({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a helpful blog-writing assistant.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 600,
    });

    const content = response.data.choices[0]?.message?.content || '';

    // Optional: sanitize the output to remove markdown artifacts
    const sanitized = sanitizeOutput(content);

    return NextResponse.json({ content: sanitized });
  } catch (error) {
    console.error('Error generating blog post:', error);
    return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 });
  }
}
