// src/app/api/blogs/[id]/versions/[index]/route.ts
import { connectDB } from '../../../../../lib/db';
import { Blog } from '../../../../../lib/db';
import { NextResponse } from 'next/server';

export async function DELETE(
  req: Request,
  { params }: { params: { id: string; index: string } }
) {
  try {
    await connectDB();
    const blog = await Blog.findById(params.id);
    
    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    const index = parseInt(params.index);
    if (isNaN(index) || index >= blog.versions.length || index < 0) {
      return NextResponse.json({ error: 'Invalid version index' }, { status: 400 });
    }

    // Prevent deleting original version
    if (index === 0) {
      return NextResponse.json(
        { error: 'Cannot delete original version' },
        { status: 400 }
      );
    }

    blog.versions.splice(index, 1);
    blog.currentVersion = Math.min(blog.currentVersion, blog.versions.length - 1);
    await blog.save();

    return NextResponse.json(blog.toObject());
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete version' },
      { status: 500 }
    );
  }
}