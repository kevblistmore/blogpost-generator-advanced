//generateform.tsx
"use client";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { marked } from "marked";
import BlogEditor from "./BlogEditor";
import HistoryPanel from "./HistoryPanel";
import LoadingSkeleton from "./LoadingSkeleton";
import { PromptSuggestions } from './PromptSuggestions';

interface GenerateFormProps {
  initialQuery?: string;
}

export default function GenerateForm({ initialQuery = "" }: GenerateFormProps) {
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState(initialQuery);
  const [isGenerating, setIsGenerating] = useState(false);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [selectedBlog, setSelectedBlog] = useState<any>(null);
  const [viewMode, setViewMode] = useState(false);
  const [promptSuggestions, setPromptSuggestions] = useState<string[]>([]);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);

  // Load blog history
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch("/api/blogs");
        const data = await res.json();
        setBlogs(data);
      } catch (error) {
        toast.error("Failed to load history");
      }
    };
    fetchBlogs();
  }, []);

  // Auto-generate if initial query exists
  useEffect(() => {
    if (initialQuery.trim()) {
      handleGenerate();
    }
  }, []);

  // Fetch suggestions when topic changes
  // components/GenerateForm.tsx
  const fetchSuggestions = async (currentTopic: string) => {
    setIsFetchingSuggestions(true);
    try {
      const res = await fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: currentTopic }),
      });
      
      if (!res.ok) throw new Error('Failed to fetch suggestions');
      
      const data = await res.json();
      // Ensure we always have an array of suggestions
      const finalSuggestions = Array.isArray(data.suggestions) 
        ? data.suggestions.slice(0, 5) // Get first 5 suggestions
        : [];
      
      setPromptSuggestions(finalSuggestions);
    } catch (error) {
      console.error('Suggestion generation failed:', error);
      // Fallback to default suggestions
      setPromptSuggestions([
        `Latest developments in ${topic}`,
        `${topic} best practices`,
        `How to get started with ${topic}`
      ]);
    } finally {
      setIsFetchingSuggestions(false);
    }
  };

  const handleSuggestionClick = async (suggestion: string) => {
    // Clear previous content while generating
    setSelectedBlog(null);
    setViewMode(false);
    setTopic(suggestion);
    
    // Use a temporary variable to ensure we use the latest state
    await handleGenerate(suggestion);
  };

  const handleGenerate = async (currentTopic?: string) => {
    const finalTopic = currentTopic || topic;
    if (!finalTopic.trim()) {
      toast.error('Please enter a topic');
      return;
    }
    
    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          topic: finalTopic, 
          title: title || finalTopic // Fallback to topic if no title
        }),
      });
  
      const data = await res.json();
      
      // Add null check for content
      if (!data?.content) {
        throw new Error('No content generated');
      }
  
      const htmlContent = marked(data.content);
      
      const tempBlog = {
        content: htmlContent,
        _id: `temp-${Date.now()}`,
        createdAt: new Date().toISOString(),
        title: title || finalTopic,
        topic: finalTopic,
      };
      
      setSelectedBlog(tempBlog);
      setViewMode(false);
      toast.success("Blog generated!");
      
      // Fetch new suggestions based on the current topic
      await fetchSuggestions(finalTopic);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  // Save blog
  const handleSave = async (content: string) => {
    try {
      const res = await fetch("/api/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, topic, title }),
      });
      const newBlog = await res.json();
      setBlogs((prev) => {
        const filtered = prev.filter((b) => b._id !== newBlog._id);
        return [newBlog, ...filtered];
      });
      setSelectedBlog(newBlog);
      setViewMode(true);
      toast.success("Blog saved!");
    } catch (error) {
      toast.error("Save failed");
    }
  };

  // Delete blog
  const handleDelete = async (id: string) => {
    try {
      await fetch("/api/blogs", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setBlogs((prev) => prev.filter((b) => b._id !== id));
      setSelectedBlog(null);
      setViewMode(false);
      toast.success("Blog deleted");
    } catch (error) {
      toast.error("Deletion failed");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 max-w-7xl mx-auto p-4">
      <div className="lg:col-span-3 space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-4">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-4"
            >
              {/* Title Input */}
              {/* <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter blog title..."
                className="w-full p-3 border rounded-lg"
              /> */}
              
              {/* Topic Input & Generate Button */}
              <div className="flex gap-4 items-center">
                <input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Enter blog topic..."
                  className="flex-1 p-3 border rounded-lg"
                />
                <button
                  onClick={() => handleGenerate()}
                  disabled={isGenerating}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isGenerating ? "Generating..." : "Generate"}
                </button>
              </div>

              {/* Prompt Suggestions */}
              {(promptSuggestions.length > 0 || isFetchingSuggestions) && (
                <div className="mt-2">
                  {isFetchingSuggestions ? (
                    <div className="text-sm text-gray-500">Loading suggestions...</div>
                  ) : (
                    <PromptSuggestions 
                      suggestions={promptSuggestions}
                      onSuggestionClick={handleSuggestionClick}
                    />
                  )}
                </div>
              )}
            </motion.div>
          </div>

          {/* Content Area */}
          {isGenerating && <LoadingSkeleton />}

          {selectedBlog ? (
            <>
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

      {/* History Panel */}
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

// interface GenerateFormProps {
//   initialQuery?: string;
// }

// export default function GenerateForm({ initialQuery = '' }: GenerateFormProps) {
//   const [title, setTitle] = useState('');
//   const [topic, setTopic] = useState(initialQuery);
//   const [isGenerating, setIsGenerating] = useState(false);
//   const [blogs, setBlogs] = useState<any[]>([]);
//   const [selectedBlog, setSelectedBlog] = useState<any>(null);
//   const [viewMode, setViewMode] = useState(false);

//   // Load initial blog history
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
//         body: JSON.stringify({ topic, title })
//       });
//       const data = await res.json();
//       const tempBlog = {
//         ...data,
//         _id: `temp-${Date.now()}`,
//         createdAt: new Date().toISOString(),
//         title,
//       };
//       setSelectedBlog(tempBlog);
//       setViewMode(false);
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
//         body: JSON.stringify({ content, topic, title })
//       });
//       const newBlog = await res.json();
//       setBlogs(prev => {
//         const filtered = prev.filter(b => b._id !== newBlog._id);
//         return [newBlog, ...filtered];
//       });
//       setSelectedBlog(newBlog);
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
//           {/* Header inputs */}
//           <div className="mb-4">
//             <input
//               value={title}
//               onChange={(e) => setTitle(e.target.value)}
//               placeholder="Enter blog title..."
//               className="w-full p-3 border rounded-lg mb-2"
//             />
//             <div className="flex gap-4 items-center">
//               <input
//                 value={topic}
//                 onChange={(e) => setTopic(e.target.value)}
//                 placeholder="Enter blog topic..."
//                 className="flex-1 p-3 border rounded-lg"
//               />
//               <button
//                 onClick={handleGenerate}
//                 disabled={isGenerating}
//                 className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
//               >
//                 {isGenerating ? 'Generating...' : 'Generate'}
//               </button>
//             </div>
//           </div>

//           {isGenerating && <LoadingSkeleton />}

//           {selectedBlog ? (
//             <BlogEditor
//               key={selectedBlog._id}
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
//             setViewMode(true);
//           }}
//           onDelete={handleDelete}
//         />
//       </div>
//     </div>
//   );
// }

// 'use client';
// import { useState, useEffect } from 'react';
// import { toast } from 'react-hot-toast';
// import BlogEditor from './BlogEditor';
// import HistoryPanel from './HistoryPanel';
// import LoadingSkeleton from './LoadingSkeleton';
// import { motion } from 'framer-motion';
// import { marked } from 'marked';

// export default function GenerateForm() {
//   const [title, setTitle] = useState('');
//   const [topic, setTopic] = useState('');
//   const [isGenerating, setIsGenerating] = useState(false);
//   const [blogs, setBlogs] = useState<any[]>([]);
//   const [selectedBlog, setSelectedBlog] = useState<any>(null);
//   const [viewMode, setViewMode] = useState(false);

//   // Load blog history (do not auto-select any blog on initial load)
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

//   // Generate a new blog post using topic and title.
//   const handleGenerate = async () => {
//     setIsGenerating(true);
//     try {
//       const res = await fetch('/api/generate', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ topic, title })
//       });
//       const data = await res.json();
//       console.log("OpenAI Response:", data);
//       // Convert markdown to HTML:
//       const htmlContent = marked(data.content);
//       const tempBlog = {
//         ...data,
//         _id: `temp-${Date.now()}`,
//         createdAt: new Date().toISOString(),
//         title,
//         content: htmlContent, // store the converted HTML
//       };
//       setSelectedBlog(tempBlog);
//       setViewMode(false);
//       toast.success('Blog generated!');
//     } catch (error) {
//       toast.error('Generation failed');
//     } finally {
//       setIsGenerating(false);
//     }
//   };

//   // Save the blog and update history without duplicates.
//   const handleSave = async (content: string) => {
//     try {
//       const res = await fetch('/api/blogs', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ content, topic, title })
//       });
//       const newBlog = await res.json();
//       setBlogs(prev => {
//         const filtered = prev.filter(b => b._id !== newBlog._id);
//         return [newBlog, ...filtered];
//       });
//       setSelectedBlog(newBlog);
//       setViewMode(true);
//       toast.success('Blog saved!');
//     } catch (error) {
//       toast.error('Save failed');
//     }
//   };

//   // Delete the blog and reset selection.
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
//           {/* Header: Title on top, then Topic input and Generate button on the same row */}
//           <div className="mb-4">
//             <div className="flex gap-4 items-center">
//             <motion.input
//               initial={{ opacity: 0, y: -10 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.5 }}
//               value={topic}
//               onChange={(e) => setTopic(e.target.value)}
//               placeholder="Enter blog topic..."
//               className="flex-1 p-3 border rounded-lg"
//             />
//               <button
//                 onClick={handleGenerate}
//                 disabled={isGenerating}
//                 className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
//               >
//                 {isGenerating ? 'Generating...' : 'Generate'}
//               </button>
//             </div>
//           </div>

//           {isGenerating && <LoadingSkeleton />}

//           {selectedBlog ? (
//             <>
//               {/* Display the title above the editor */}
//               <h1 className="text-3xl font-bold mb-4">{selectedBlog.title}</h1>
//               <BlogEditor
//                 key={selectedBlog._id}
//                 initialContent={selectedBlog.content}
//                 onSave={handleSave}
//                 onRegenerate={handleGenerate}
//                 onDelete={() => handleDelete(selectedBlog._id)}
//                 viewMode={viewMode}
//                 onViewModeChange={setViewMode}
//                 topic={topic}
//               />
//             </>
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
//             setViewMode(true);
//           }}
//           onDelete={handleDelete}
//         />
//       </div>
//     </div>
//   );
// }

