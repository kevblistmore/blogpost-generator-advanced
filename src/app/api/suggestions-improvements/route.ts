// src/app/api/suggestions-improvements/route.ts
import { NextResponse } from "next/server";
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export async function POST(request: Request) {
  try {
    const { content } = await request.json();
    const prompt = `Provide improvement suggestions for the following blog post. 
List your suggestions as a JSON array of strings.

Blog post:
${content}`;

    const response = await openai.createChatCompletion({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const rawSuggestions = response.data.choices[0]?.message?.content || "[]";
    const cleanedSuggestions = rawSuggestions
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const suggestions = JSON.parse(cleanedSuggestions);
    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Suggestions error:", error);
    return NextResponse.json({ suggestions: [] }, { status: 500 });
  }
}
