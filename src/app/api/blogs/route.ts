//src/app/api/blogs/route.ts
import { connectDB } from '../../lib/db';
import { Blog } from '../../lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectDB();
    const blogs = await Blog.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(blogs);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch blogs' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { content, topic } = await req.json();
    await connectDB();
    
    const blog = new Blog({
      content,
      topic,
      images: []
    });

    await blog.save();
    return NextResponse.json(blog.toObject());
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to save blog' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    await connectDB();
    await Blog.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete blog' },
      { status: 500 }
    );
  }
}