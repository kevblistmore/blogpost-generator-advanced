// app/page.tsx
'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Navigate to the generate page with the query in the URL
    router.push(`/generate?q=${encodeURIComponent(query)}`);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <section className="text-center mb-12">
          <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            AI Blog Generator
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Transform your ideas into polished blog posts with AI-powered writing assistance.
            Generate, edit, and save professional content in minutes.
          </p>
        </section>
        {/* Search bar */}
        <form onSubmit={handleSubmit} className="flex gap-2 mb-8">
          <input
            type="text"
            placeholder="Enter blog title here"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 p-3 border rounded-lg"
          />
          <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Search
          </button>
        </form>
        {/* Two additional boxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-4 border rounded-lg text-center">
            <h2 className="text-xl font-semibold mb-2">Blog Templates</h2>
            <p>Template A, Template B, Template C, ...</p>
          </div>
          <div className="p-4 border rounded-lg text-center">
            <h2 className="text-xl font-semibold mb-2">Suggested Blog Queries</h2>
            <p>Query X, Query Y, Query Z, ...</p>
          </div>
        </div>
      </div>
    </main>
  );
}
