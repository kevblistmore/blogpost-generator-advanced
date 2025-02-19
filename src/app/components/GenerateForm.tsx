// 'use client';

// import { useState } from 'react';
// import { toast } from 'react-hot-toast';
// import LoadingSkeleton from './LoadingSkeleton';
// import FeedbackButtons from './FeedBackButtons';
// import BlogEditor from './BlogEditor';

// export default function GenerateForm() {
//   const [topic, setTopic] = useState('');
//   const [isGenerating, setIsGenerating] = useState(false);
//   const [generatedContent, setGeneratedContent] = useState('');

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!topic.trim()) {
//       toast.error('Please enter a topic');
//       return;
//     }

//     setIsGenerating(true);
//     setGeneratedContent(''); // clear old content

//     try {
//       const res = await fetch('/api/generate', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ topic }),
//       });

//       if (!res.ok) {
//         toast.error('Failed to generate blog post');
//         setIsGenerating(false);
//         return;
//       }

//       const data = await res.json();
//       setGeneratedContent(data.content);
//       toast.success('Blog post generated!');
//     } catch (error) {
//       toast.error('An error occurred');
//     } finally {
//       setIsGenerating(false);
//     }
//   };

//   return (
//     <div className="mx-auto max-w-xl space-y-6">
//       <form onSubmit={handleSubmit} className="flex flex-col gap-4">
//         <input
//           type="text"
//           value={topic}
//           onChange={(e) => setTopic(e.target.value)}
//           placeholder="Enter blog topic..."
//           disabled={isGenerating}
//           className="w-full p-3 border border-gray-300 rounded input-animate"
//         />
//         <button
//           type="submit"
//           disabled={isGenerating}
//           className={`p-2 bg-blue-600 text-white rounded ${
//             isGenerating ? 'opacity-50' : 'hover:bg-blue-700'
//           }`}
//         >
//           {isGenerating ? 'Generating...' : 'Generate Post'}
//         </button>
//       </form>

//       {/* Show loading skeleton if generating */}
//       {isGenerating && (
//         <div className="border border-gray-300 p-4 rounded">
//           <LoadingSkeleton />
//         </div>
//       )}

//       {/* Once we have generated content, display the editor */}
//       {generatedContent && !isGenerating && (
//         <div className="bg-white rounded-md shadow p-4 my-6">
//           <h2 className="text-xl font-semibold mb-4">Edit Your Post</h2>
//           <BlogEditor initialContent={generatedContent} />
//           <FeedbackButtons content={generatedContent} />
//         </div>
//       )}
//     </div>
//   );
// }
// components/GenerateForm.tsx
'use client';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import BlogEditor from './BlogEditor';
import HistoryPanel from './HistoryPanel';

interface BlogHistoryItem {
  id: string;
  content: string;
  timestamp: string;
  isSaved: boolean;
}

export default function GenerateForm() {
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [history, setHistory] = useState<BlogHistoryItem[]>([]);
  const [selectedBlog, setSelectedBlog] = useState<string | null>(null);

  // Load history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('blogHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('blogHistory', JSON.stringify(history));
  }, [history]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      });

      if (!res.ok) throw new Error('Generation failed');
      
      const data = await res.json();
      const newBlog = {
        id: Date.now().toString(),
        content: data.content,
        timestamp: new Date().toISOString(),
        isSaved: false,
      };

      setGeneratedContent(data.content);
      setHistory(prev => [newBlog, ...prev]);
      toast.success('Blog generated!');
    } catch (error) {
      toast.error('Failed to generate blog');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = (content: string) => {
    setHistory(prev => prev.map(item => 
      item.content === content ? { ...item, isSaved: true } : item
    ));
    toast.success('Blog saved!');
  };

  const handleRegenerate = async () => {
    if (!topic) return;
    setIsGenerating(true);
    try {
      // Existing regeneration logic
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto p-4">
      {/* Left Column */}
      <div className="lg:col-span-2 space-y-6">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
          <div className="space-y-4">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter blog topic..."
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isGenerating}
            />
            <button
              type="submit"
              disabled={isGenerating}
              className={`w-full p-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg transition-all ${
                isGenerating ? 'opacity-50' : 'hover:from-blue-700 hover:to-indigo-700'
              }`}
            >
              {isGenerating ? 'Generating...' : 'Generate Post'}
            </button>
          </div>
        </form>

        {generatedContent && (
          <BlogEditor
            initialContent={generatedContent}
            onSave={handleSave}
            onRegenerate={handleRegenerate}
          />
        )}
      </div>

      {/* Right Column - History Panel */}
      <div className="lg:col-span-1">
        <HistoryPanel 
          history={history}
          onSelectBlog={(id) => setSelectedBlog(id)}
        />
      </div>
    </div>
  );
}