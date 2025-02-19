// lib/db.ts
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

const blogSchema = new mongoose.Schema({
  content: { type: String, required: true },
  images: [String],
  topic: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
});

export const Blog = mongoose.models.Blog || mongoose.model('Blog', blogSchema);

export async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  return mongoose.connect(MONGODB_URI);
}