'use client';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import BlogEditor from './BlogEditor';
import HistoryPanel from './HistoryPanel';
import LoadingSkeleton from './LoadingSkeleton';

export default function GenerateForm() {
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [selectedBlog, setSelectedBlog] = useState<any>(null);
  const [viewMode, setViewMode] = useState(false);

  // Load initial blogs
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch('/api/blogs');
        const data = await res.json();
        setBlogs(data);
      } catch (error) {
        toast.error('Failed to load history');
      }
    };
    fetchBlogs();
  }, []);

  // Generate a new blog post with a temporary ID and timestamp
  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic })
      });
      const data = await res.json();
      setSelectedBlog({
        ...data,
        _id: `temp-${Date.now()}`, // Temporary ID for unsaved posts
        createdAt: new Date().toISOString()
      });
      setViewMode(false); // Force edit mode for new generations
      toast.success('Blog generated!');
    } catch (error) {
      toast.error('Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  // Save the blog post (including images) and update the history panel
  const handleSave = async (content: string) => {
    try {
      const res = await fetch('/api/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, topic })
      });
      const newBlog = await res.json();
      // Update both the blogs list and selected blog with saved data
      setBlogs(prev => [newBlog, ...prev]);
      setSelectedBlog(newBlog);
      setViewMode(true); // Switch to view mode after saving
      toast.success('Blog saved!');
    } catch (error) {
      toast.error('Save failed');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch('/api/blogs', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      setBlogs(prev => prev.filter(b => b._id !== id));
      toast.success('Blog deleted');
    } catch (error) {
      toast.error('Deletion failed');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 max-w-7xl mx-auto p-4">
      <div className="lg:col-span-3 space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex gap-4 mb-4">
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter blog topic..."
              className="flex-1 p-3 border rounded-lg"
            />
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isGenerating ? 'Generating...' : 'Generate'}
            </button>
          </div>

          {isGenerating && <LoadingSkeleton />}

          {selectedBlog && (
            <BlogEditor
              key={selectedBlog._id} // Forces remount when a new blog is selected
              initialContent={selectedBlog.content}
              onSave={handleSave}
              onRegenerate={handleGenerate}
              onDelete={() => handleDelete(selectedBlog._id)}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              topic={topic}
            />
          )}
        </div>
      </div>

      <div className="lg:col-span-1">
        <HistoryPanel
          blogs={blogs}
          onSelect={setSelectedBlog}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}


// 'use client';
// import { useState, useEffect } from 'react';
// import { toast } from 'react-hot-toast';
// import BlogEditor from './BlogEditor';
// import HistoryPanel from './HistoryPanel';
// import LoadingSkeleton from './LoadingSkeleton';

// export default function GenerateForm() {
//   const [topic, setTopic] = useState('');
//   const [isGenerating, setIsGenerating] = useState(false);
//   const [blogs, setBlogs] = useState<any[]>([]);
//   const [selectedBlog, setSelectedBlog] = useState<any>(null);
//   const [viewMode, setViewMode] = useState(false);

//   // Load initial blogs
//   useEffect(() => {
//     const fetchBlogs = async () => {
//       try {
//         const res = await fetch('/api/blogs');
//         const data = await res.json();
//         setBlogs(data);
//       } catch (error) {
//         toast.error('Failed to load history');
//       }
//     };
//     fetchBlogs();
//   }, []);

//   const handleGenerate = async () => {
//     setIsGenerating(true);
//     try {
//       const res = await fetch('/api/generate', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ topic })
//       });

//       const data = await res.json();
//       setSelectedBlog(data);
//       toast.success('Blog generated!');
//     } catch (error) {
//       toast.error('Generation failed');
//     } finally {
//       setIsGenerating(false);
//     }
//   };

//   const handleSave = async (content: string) => {
//     try {
//       const res = await fetch('/api/blogs', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ content, topic })
//       });
      
//       const newBlog = await res.json();
//       setBlogs(prev => [newBlog, ...prev]);
//       setViewMode(true);
//       toast.success('Blog saved!');
//     } catch (error) {
//       toast.error('Save failed');
//     }
//   };

//   const handleDelete = async (id: string) => {
//     try {
//       await fetch('/api/blogs', {
//         method: 'DELETE',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ id })
//       });
//       setBlogs(prev => prev.filter(b => b._id !== id));
//       toast.success('Blog deleted');
//     } catch (error) {
//       toast.error('Deletion failed');
//     }
//   };

//   return (
//     <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 max-w-7xl mx-auto p-4">
//       <div className="lg:col-span-3 space-y-6">
//         <div className="bg-white rounded-lg shadow p-6">
//           <div className="flex gap-4 mb-4">
//             <input
//               value={topic}
//               onChange={(e) => setTopic(e.target.value)}
//               placeholder="Enter blog topic..."
//               className="flex-1 p-3 border rounded-lg"
//             />
//             <button
//               onClick={handleGenerate}
//               disabled={isGenerating}
//               className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
//             >
//               {isGenerating ? 'Generating...' : 'Generate'}
//             </button>
//           </div>

//           {isGenerating && <LoadingSkeleton />}

//           {selectedBlog && (
//             <BlogEditor
//               initialContent={selectedBlog.content}
//               onSave={handleSave}
//               onDelete={() => handleDelete(selectedBlog._id)}
//               viewMode={viewMode}
//               topic={topic}
//             />
//           )}
//         </div>
//       </div>

//       <div className="lg:col-span-1">
//         <HistoryPanel
//           blogs={blogs}
//           onSelect={setSelectedBlog}
//           onDelete={handleDelete}
//         />
//       </div>
//     </div>
//   );
// }
