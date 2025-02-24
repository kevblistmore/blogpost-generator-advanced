import { NextResponse } from 'next/server';

interface PexelsPhoto {
  src: {
    medium: string;
  };
}

interface PexelsResponse {
  photos: PexelsPhoto[];
}

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
    
    const data = await res.json() as PexelsResponse;
    const urls = data.photos?.map(photo => photo.src.medium) || [];
    
    return NextResponse.json({ urls });
  } catch {
    return NextResponse.json(
      { urls: [] },
      { status: 200 }
    );
  }
}