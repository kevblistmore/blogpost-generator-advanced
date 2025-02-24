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

    interface PexelsPhoto {
      src: {
        medium: string;
      };
      // any other fields you need
    }

    const urls =
      (data.photos as PexelsPhoto[]).map((photo) => photo.src.medium) || [];
    
    return NextResponse.json({ urls });
  } catch (_error) {
    return NextResponse.json({ urls: [] }, { status: 200 });
  }
}