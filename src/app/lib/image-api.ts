// lib/image-api.ts
export async function fetchSuggestedImages(topic: string): Promise<string[]> {
    try {
      const res = await fetch(`/api/images?topic=${encodeURIComponent(topic)}`);
      const data = await res.json();
      return data.urls || [];
    } catch (error) {
      console.error('Failed to fetch images:', error);
      return [];
    }
  }
  
  // app/api/images/route.ts
  export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const topic = searchParams.get('topic') || '';
    
    // Choose one image source:
    // 1. Unsplash (requires API key)
    // 2. Pexels (requires API key)
    // 3. OpenAI DALL-E (paid)
    // Example using Unsplash:
    const UNSPLASH_KEY = process.env.UNSPLASH_KEY!;
    const res = await fetch(
      `https://api.unsplash.com/search/photos?page=1&query=${topic}&client_id=${UNSPLASH_KEY}`
    );
    
    const data = await res.json();

    // Define interface for image API result structure
    interface ImageResult {
      urls: {
        regular: string;
        // Add other URL types if needed (small, thumb, etc.)
      };
      // Add other properties if needed (id, description, etc.)
    }

    const urls = data.results?.map((img: ImageResult) => img.urls.regular) || [];
    
    return new Response(JSON.stringify({ urls }));
  }