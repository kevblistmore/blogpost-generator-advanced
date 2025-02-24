//src/app/api/blogs/route.ts
import { connectDB } from '../../lib/db';
import { Blog } from '../../lib/db';
import { NextResponse } from 'next/server';
import slugify from 'slugify';  // <-- Import slugify

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
    const { content, topic, title, versions } = await req.json();
    await connectDB();
    
    // Generate a slug using title (or fallback to topic). Append a timestamp for uniqueness.
    const baseSlug = slugify(title || topic, { lower: true, strict: true });
    const uniqueSlug = `${baseSlug}-${Date.now()}`;
    
    const blog = new Blog({
      content,
      topic,
      title,
      slug: uniqueSlug, // set the slug field
      versions: [{ content, timestamp: new Date(), isActive: true }],
      currentVersion: 0,
      createdAt: new Date(),
      images: []
    });

    await blog.save();
    
    return NextResponse.json(blog.toObject());
  } catch (_error) {
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