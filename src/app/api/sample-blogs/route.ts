// app/api/sample-blogs/route.ts
import { NextResponse } from 'next/server';
import sampleBlogs from '../../../../samples/sample-blogs.json';

export async function GET() {
  return NextResponse.json(sampleBlogs);
}
