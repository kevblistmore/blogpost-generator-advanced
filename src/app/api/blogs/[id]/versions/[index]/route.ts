import { connectDB } from '../../../../../lib/db';
import { Blog } from '../../../../../lib/db';
import { NextResponse } from 'next/server';

export async function DELETE(
  req: Request,
  { params }: { params: { id: string; index: string } }
) {
  try {
    await connectDB();
    // Ensure params are available:
    const { id, index } = await Promise.resolve(params);

    // Check if id is a valid ObjectId (24 hex characters)
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json(
        { success: true, message: "Temporary blog - nothing to delete" },
        { status: 200 }
      );
    }

    // Parse index
    const versionIndex = parseInt(index);
    if (isNaN(versionIndex) || versionIndex < 0) {
      return NextResponse.json({ error: 'Invalid version index' }, { status: 400 });
    }

    // Find the blog by id
    const blog = await Blog.findById(id);
    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    // Prevent deleting the original version (index 0)
    if (versionIndex === 0) {
      return NextResponse.json(
        { error: 'Cannot delete original version' },
        { status: 400 }
      );
    }

    console.log("Deleting version", versionIndex, "from blog ID:", id);

    // Remove the specified version
    blog.versions.splice(versionIndex, 1);
    // Adjust currentVersion if necessary
    blog.currentVersion = Math.min(blog.currentVersion, blog.versions.length - 1);
    await blog.save();

    return NextResponse.json(blog.toObject());
  } catch (error) {
    console.error("Error deleting version:", error);
    return NextResponse.json({ error: 'Failed to delete version' }, { status: 500 });
  }
}
