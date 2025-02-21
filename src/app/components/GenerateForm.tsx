'use client';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import BlogEditor from './BlogEditor';
import HistoryPanel from './HistoryPanel';
import LoadingSkeleton from './LoadingSkeleton';
import { motion } from 'framer-motion';
import { marked } from 'marked';

export default function GenerateForm() {
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [selectedBlog, setSelectedBlog] = useState<any>(null);
  const [viewMode, setViewMode] = useState(false);

  // Load blog history (do not auto-select any blog on initial load)
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

  // Generate a new blog post using topic and title.
  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, title })
      });
      const data = await res.json();
      console.log("OpenAI Response:", data);
      // Convert markdown to HTML:
      const htmlContent = marked(data.content);
      const tempBlog = {
        ...data,
        _id: `temp-${Date.now()}`,
        createdAt: new Date().toISOString(),
        title,
        content: htmlContent, // store the converted HTML
      };
      setSelectedBlog(tempBlog);
      setViewMode(false);
      toast.success('Blog generated!');
    } catch (error) {
      toast.error('Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  // Save the blog and update history without duplicates.
  const handleSave = async (content: string) => {
    try {
      const res = await fetch('/api/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, topic, title })
      });
      const newBlog = await res.json();
      setBlogs(prev => {
        const filtered = prev.filter(b => b._id !== newBlog._id);
        return [newBlog, ...filtered];
      });
      setSelectedBlog(newBlog);
      setViewMode(true);
      toast.success('Blog saved!');
    } catch (error) {
      toast.error('Save failed');
    }
  };

  // Delete the blog and reset selection.
  const handleDelete = async (id: string) => {
    try {
      await fetch('/api/blogs', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      setBlogs(prev => prev.filter(b => b._id !== id));
      setSelectedBlog(null);
      setViewMode(false);
      toast.success('Blog deleted');
    } catch (error) {
      toast.error('Deletion failed');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 max-w-7xl mx-auto p-4">
      <div className="lg:col-span-3 space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          {/* Header: Title on top, then Topic input and Generate button on the same row */}
          <div className="mb-4">
            <div className="flex gap-4 items-center">
            <motion.input
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
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
          </div>

          {isGenerating && <LoadingSkeleton />}

          {selectedBlog ? (
            <>
              {/* Display the title above the editor */}
              <h1 className="text-3xl font-bold mb-4">{selectedBlog.title}</h1>
              <BlogEditor
                key={selectedBlog._id}
                initialContent={selectedBlog.content}
                onSave={handleSave}
                onRegenerate={handleGenerate}
                onDelete={() => handleDelete(selectedBlog._id)}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                topic={topic}
              />
            </>
          ) : (
            <div className="text-center text-gray-500 py-10">
              No blog selected. Generate a new blog to begin.
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-1">
        <HistoryPanel
          blogs={blogs}
          onSelect={(blog) => {
            setSelectedBlog(blog);
            setViewMode(true);
          }}
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

//   // Load initial blogs (history)
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

//   // Generate a new blog post
//   const handleGenerate = async () => {
//     setIsGenerating(true);
//     try {
//       const res = await fetch('/api/generate', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ topic })
//       });
//       const data = await res.json();
//       const tempBlog = {
//         ...data,
//         _id: `temp-${Date.now()}`, // Temporary ID for unsaved posts
//         createdAt: new Date().toISOString()
//       };
//       setSelectedBlog(tempBlog);
//       setViewMode(false); // Start in edit mode
//       toast.success('Blog generated!');
//     } catch (error) {
//       toast.error('Generation failed');
//     } finally {
//       setIsGenerating(false);
//     }
//   };

//   // Save the blog post and update history without duplicates
//   const handleSave = async (content: string) => {
//     try {
//       const res = await fetch('/api/blogs', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ content, topic })
//       });
//       const newBlog = await res.json();
//       // Remove any duplicate entry (if temporary blog exists) and add the new one
//       setBlogs(prev => {
//         const filtered = prev.filter(b => b._id !== newBlog._id);
//         return [newBlog, ...filtered];
//       });
//       setSelectedBlog(newBlog);
//       setViewMode(true); // Switch to view mode after saving
//       toast.success('Blog saved!');
//     } catch (error) {
//       toast.error('Save failed');
//     }
//   };

//   // Delete the blog post and reset the editor
//   const handleDelete = async (id: string) => {
//     try {
//       await fetch('/api/blogs', {
//         method: 'DELETE',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ id })
//       });
//       setBlogs(prev => prev.filter(b => b._id !== id));
//       setSelectedBlog(null);
//       setViewMode(false);
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

//           {selectedBlog ? (
//             <BlogEditor
//               key={selectedBlog._id} // Force remount on new selection
//               initialContent={selectedBlog.content}
//               onSave={handleSave}
//               onRegenerate={handleGenerate}
//               onDelete={() => handleDelete(selectedBlog._id)}
//               viewMode={viewMode}
//               onViewModeChange={setViewMode}
//               topic={topic}
//             />
//           ) : (
//             <div className="text-center text-gray-500 py-10">
//               No blog selected. Generate a new blog to begin.
//             </div>
//           )}
//         </div>
//       </div>

//       <div className="lg:col-span-1">
//         <HistoryPanel
//           blogs={blogs}
//           onSelect={(blog) => {
//             setSelectedBlog(blog);
//             setViewMode(true); // Open in view mode when selecting from history
//           }}
//           onDelete={handleDelete}
//         />
//       </div>
//     </div>
//   );
// }
