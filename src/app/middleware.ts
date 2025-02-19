// app/middleware.ts
import { NextRequest, NextResponse } from 'next/server';

const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 5;   // 5 requests per IP per window

// We store the request counts here (IP -> # of requests)
const ipRequestCounts = new Map<string, { count: number; firstRequestTime: number }>();

export function middleware(request: NextRequest) {
  const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? '127.0.0.1';
  const routeName = request.nextUrl.pathname;

  // Only apply rate limit for certain routes
  // e.g. /api/generate or /api/feedback
  if (!routeName.startsWith('/api/')) {
    return NextResponse.next();
  }

  const currentTime = Date.now();
  const existingRecord = ipRequestCounts.get(ip);

  if (!existingRecord) {
    // First request from this IP
    ipRequestCounts.set(ip, { count: 1, firstRequestTime: currentTime });
    return NextResponse.next();
  }

  const { count, firstRequestTime } = existingRecord;
  const timeSinceFirstRequest = currentTime - firstRequestTime;

  if (timeSinceFirstRequest < RATE_LIMIT_WINDOW_MS) {
    // Still within the rate limit window
    if (count >= RATE_LIMIT_MAX_REQUESTS) {
      // Exceeds limit
      return new NextResponse(JSON.stringify({ error: 'Rate limit exceeded' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      // Increment count
      existingRecord.count += 1;
      ipRequestCounts.set(ip, existingRecord);
      return NextResponse.next();
    }
  } else {
    // Window has expired, reset count
    ipRequestCounts.set(ip, { count: 1, firstRequestTime: currentTime });
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/api/:path*'], // Apply to /api routes
};
