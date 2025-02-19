'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import LoadingSkeleton from './LoadingSkeleton';
import FeedbackButtons from './FeedbackButtons';
import BlogEditor from './BlogEditor';

export default function GenerateForm() {
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    setIsGenerating(true);
    setGeneratedContent(''); // clear old content

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      });

      if (!res.ok) {
        toast.error('Failed to generate blog post');
        setIsGenerating(false);
        return;
      }

      const data = await res.json();
      setGeneratedContent(data.content);
      toast.success('Blog post generated!');
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter blog topic..."
          disabled={isGenerating}
          className="p-2 border border-gray-300 rounded"
        />
        <button
          type="submit"
          disabled={isGenerating}
          className={`p-2 bg-blue-600 text-white rounded ${
            isGenerating ? 'opacity-50' : 'hover:bg-blue-700'
          }`}
        >
          {isGenerating ? 'Generating...' : 'Generate Post'}
        </button>
      </form>

      {/* Show loading skeleton if generating */}
      {isGenerating && (
        <div className="border border-gray-300 p-4 rounded">
          <LoadingSkeleton />
        </div>
      )}

      {/* Once we have generated content, display the editor */}
      {generatedContent && !isGenerating && (
        <div className="border border-gray-300 p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">Edit Your Post</h2>
          <BlogEditor initialContent={generatedContent} />
          <FeedbackButtons content={generatedContent} />
        </div>
      )}
    </div>
  );
}
