import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../../../lib/db';
import { Blog } from '../../../../../lib/db';

export async function DELETE(request: NextRequest) {
  const url = new URL(request.url);
  // e.g.  /api/blogs/123/versions/2
  const pathSegments = url.pathname.split('/');
  // pathSegments might be ["", "api", "blogs", "123", "versions", "2"]
  const blogId = pathSegments[3];
  const versionIndex = parseInt(pathSegments[5], 10);

  try {
    await connectDB();
    
    // Find the blog
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }
    
    // Check if versions exist and index is valid
    if (!blog.versions || blog.versions.length <= 1) {
      return NextResponse.json(
        { error: 'Cannot delete the only version' },
        { status: 400 }
      );
    }
    
    if (versionIndex < 0 || versionIndex >= blog.versions.length) {
      return NextResponse.json(
        { error: 'Invalid version index' },
        { status: 400 }
      );
    }
    
    // Remove the specified version
    blog.versions.splice(versionIndex, 1);
    
    // Update currentVersion if needed
    if (blog.currentVersion >= blog.versions.length) {
      blog.currentVersion = blog.versions.length - 1;
    }
    
    // Update blog content to match the current version
    blog.content = blog.versions[blog.currentVersion].content;
    
    await blog.save();
    
    return NextResponse.json(blog);
  } catch (error) {
    console.error('Error deleting version:', error);
    return NextResponse.json(
      { error: 'Failed to delete version' },
      { status: 500 }
    );
  }
}
