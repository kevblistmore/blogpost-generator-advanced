import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const topic = searchParams.get('topic') || 'technology';
  
  // Using Pexels API (replace with your API key)
  const API_KEY = process.env.PEXELS_API_KEY!;
  const url = `https://api.pexels.com/v1/search?query=${topic}&per_page=6`;

  try {
    const res = await fetch(url, {
      headers: { Authorization: API_KEY }
    });
    
    if (!res.ok) throw new Error('Image fetch failed');
    
    const data = await res.json();
    const urls = data.photos?.map((photo: { src: { medium: string } }) => photo.src.medium) || [];
    
    return NextResponse.json({ urls });
  } catch (_error) {
    return NextResponse.json(
      { urls: [] },
      { status: 200 }
    );
  }
}