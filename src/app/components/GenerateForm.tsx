
// generateform.tsx
"use client";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { marked } from "marked";
import BlogEditor from "./BlogEditor";
import HistoryPanel from "./HistoryPanel";
import LoadingSkeleton from "./LoadingSkeleton";
import { PromptSuggestions } from "./PromptSuggestions";
import Sidebar from "./Sidebar";
import SidebarToggle from "./SidebarToggle";

interface GenerateFormProps {
  initialQuery?: string;
  isSample?: boolean;
}

export default function GenerateForm({ initialQuery = "", isSample = false }: GenerateFormProps) {
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState(initialQuery);
  const [isGenerating, setIsGenerating] = useState(false);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [selectedBlog, setSelectedBlog] = useState<any>(null);
  const [viewMode, setViewMode] = useState(false);
  const [promptSuggestions, setPromptSuggestions] = useState<string[]>([]);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const [versions, setVersions] = useState<{ content: string; prompt?: string; timestamp: string }[]>([]);
  const [currentVersion, setCurrentVersion] = useState(0);
  const [pendingSuggestion, setPendingSuggestion] = useState<string | null>(null);
  const [originalContent, setOriginalContent] = useState<string>("");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveTitle, setSaveTitle] = useState(title);

  

  // Helper function: Always add a version using a functional update
  const addVersion = (content: string, prompt: string) => {
    setVersions((prevVersions) => [
      ...prevVersions,
      {
        content,
        prompt,
        timestamp: new Date().toISOString(),
      },
    ]);
  };

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
    if (initialQuery.trim() && isSample) {
      (async () => {
        try {
          const res = await fetch("/api/sample-blogs");
          const samples = await res.json();
          const sample = samples.find((s: any) => s.title.toLowerCase().includes(initialQuery.toLowerCase()));
          if (sample) {
            setSelectedBlog(sample);
            setViewMode(true);
          } else {
            await handleGenerate();
          }
        } catch (error) {
          toast.error("Failed to load sample blog");
        }
      })();
    } else if (initialQuery.trim()) {
      handleGenerate();
    }
  }, [initialQuery, isSample]);

  // Initialize versions with current content as version 1 if not already set
  useEffect(() => {
    if (selectedBlog?.versions) {
      setVersions(selectedBlog.versions);
      setCurrentVersion(selectedBlog.currentVersion);
    }
  }, [selectedBlog]);

  useEffect(() => {
    console.log('Current versions:', versions);
  }, [versions]);

  // Fetch suggestions when topic changes
  const fetchSuggestions = async (currentTopic: string) => {
    setIsFetchingSuggestions(true);
    try {
      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: currentTopic }),
      });
      if (!res.ok) throw new Error("Failed to fetch suggestions");
      const data = await res.json();
      const finalSuggestions = Array.isArray(data.suggestions)
        ? data.suggestions.slice(0, 5)
        : [];
      setPromptSuggestions(finalSuggestions);
    } catch (error) {
      console.error("Suggestion generation failed:", error);
      setPromptSuggestions([
        `Latest developments in ${topic}`,
        `${topic} best practices`,
        `How to get started with ${topic}`,
      ]);
    } finally {
      setIsFetchingSuggestions(false);
    }
  };

  const handleSuggestionClick = async (suggestion: string) => {
    setSelectedBlog(null);
    setViewMode(false);
    setTopic(String(suggestion));
    await handleGenerate(suggestion);
  };

  // Consolidated handleGenerate using addVersion
  const handleGenerate = async (currentTopic?: string) => {
    const finalTopic = typeof currentTopic === "string" ? currentTopic : topic;
    
    if (typeof finalTopic !== "string") {
      toast.error("Invalid topic: must be a string");
      return;
    }
    if (!finalTopic.trim()) {
      toast.error("Please enter a topic");
      return;
    }
    
    // If a blog already exists, add its current content as a version
    if (selectedBlog?.content) {
      addVersion(selectedBlog.content, finalTopic);
    }

    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: finalTopic,
          title: title || finalTopic,
        }),
      });
      const data = await res.json();
      if (!data?.content) {
        throw new Error("No content generated");
      }
      const htmlContent = await marked.parse(data.content);
      // Create versions array
      const newVersions = [
        { content: htmlContent, timestamp: new Date().toISOString() }
      ];
      // Update state
      setVersions(newVersions);
      setCurrentVersion(0);
      const tempBlog = {
        content: htmlContent,
        _id: `temp-${Date.now()}`,
        createdAt: new Date().toISOString(),
        title: title || finalTopic,
        topic: finalTopic,
        versions: newVersions,
        currentVersion: 0
      };

      // After generating, add the new content as a version
      addVersion(htmlContent, finalTopic);

      setSelectedBlog(tempBlog);
      console.log('Previous content:', selectedBlog?.content);
      console.log('New versions:', versions);
      setViewMode(false);
      toast.success("Blog generated!");
      await fetchSuggestions(finalTopic);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  // Consolidated handleRefine using addVersion
  const handleRefine = (newContent: string) => {
    if (selectedBlog?.content) {
      addVersion(selectedBlog.content, "User refinement");
    }
    console.log('Refining from:', selectedBlog?.content);
    setSelectedBlog((prev: any) => ({
      ...prev,
      content: newContent,
    }));
    addVersion(newContent, "Refined version");
  };

  const handleSave = async (saveName: string) => {
    try {
      const res = await fetch("/api/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          content: selectedBlog.content, 
          topic, 
          title: saveName,
          versions
       }),
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
  const openSaveModal = () => {
    setSaveTitle(title || "Untitled Blog"); // pre-populate with current title or default
    setShowSaveModal(true);
  };

  const openSaveModalWrapper = async (_content: string): Promise<void> => {
    openSaveModal();
  };
  
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

  const handleApplySuggestion = async (suggestion: string) => {
    if (selectedBlog) {
      addVersion(selectedBlog.content, "Pre-feedback version");
      const res = await fetch("/api/refine", {
        method: "POST",
        body: JSON.stringify({
          content: selectedBlog.content,
          feedback: suggestion
        })
      });
      const data = await res.json();
      setSelectedBlog((prev: any) => ({ ...prev, content: data.refinedContent }));
      addVersion(data.refinedContent, `Feedback applied: ${suggestion}`);
      setOriginalContent(selectedBlog.content);
      const highlighted = `<span class="bg-yellow-300" id="pending-suggestion">${suggestion}</span>`;
      const newContent = selectedBlog.content + highlighted;
      setPendingSuggestion(suggestion);
      handleRefine(newContent);
      toast("Applying suggestion...");
    }
  };

  const handleAcceptSuggestion = () => {
    setPendingSuggestion(null);
    toast.success("Suggestion accepted.");
  };

  const handleCancelSuggestion = () => {
    if (selectedBlog) {
      handleRefine(originalContent);
    }
    setPendingSuggestion(null);
    toast.error("Suggestion canceled.");
  };

  const handleVersionChange = async (versionIndex: number) => {
    setCurrentVersion(versionIndex);
    setSelectedBlog((prev: any) => ({
      ...prev,
      content: versions[versionIndex].content,
      currentVersion: versionIndex
    }));

    // Update in database
    if (selectedBlog?._id) {
      await fetch(`/api/blogs/${selectedBlog._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentVersion: versionIndex })
      });
    }
  };

  const handleVersionDelete = async (versionIndex: number) => {
    if (!selectedBlog?._id) return;

    try {
      const res = await fetch(`/api/blogs/${selectedBlog._id}/versions/${versionIndex}`, {
        method: 'DELETE'
      });
      
      if (!res.ok) throw new Error('Failed to delete version');
      
      const updatedBlog = await res.json();
      setSelectedBlog(updatedBlog);
      setVersions(updatedBlog.versions);
      setCurrentVersion(updatedBlog.currentVersion);

      if (updatedBlog.versions.length === 1) {
        toast("Reached initial version - toggle disabled");
      }
      toast.success('Version deleted');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Deletion failed');
    }
  };
  const handleRegenerate = async (currentTopic?: string) => {
    const finalTopic = currentTopic || topic;
    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: finalTopic,
          title: title || finalTopic,
          // Do not send previousContent unless you really want to
        }),
      });
      
      if (!res.ok) {
        throw new Error("API returned non-OK status");
      }
      
      const data = await res.json();
      const htmlContent = await marked.parse(data.content);
      
      const newVersion = { content: htmlContent, timestamp: new Date().toISOString() };
      const newVersions = [...versions, newVersion];
      setVersions(newVersions);
      setCurrentVersion(newVersions.length - 1);
      setSelectedBlog((prev: any) => ({
        ...prev,
        content: htmlContent,
        versions: newVersions,
        currentVersion: newVersions.length - 1,
      }));
      toast.success("New version generated!");
    } catch (error) {
      console.error("Regeneration error:", error);
      toast.error("Generation failed");
    } finally {
      setIsGenerating(false);
    }
  };
  

  
  return (
    <div
      className="
        grid
        grid-cols-[25rem_1.5fr_17rem]
        items-stretch
        gap-2
        w-full
        min-h-screen 
        p-0
      "
    >
      {/* LEFT COLUMN: Blog History Panel */}
      <div className="pl-4 bg-gray-100">
        <HistoryPanel
          blogs={blogs}
          onSelect={(blog) => {
            setSelectedBlog(blog);
            setVersions(blog.versions || []);
            setCurrentVersion(blog.currentVersion || 0);
            setViewMode(true);
          }}
          onDelete={handleDelete}
        />
      </div>
  
      {/* MIDDLE COLUMN: Editor Box */}
      <div>
        {pendingSuggestion && (
          <div className="flex items-center justify-between p-2 bg-yellow-100 rounded-md mb-4">
            <span>Suggestion: {pendingSuggestion}</span>
            <div>
              <button
                onClick={handleAcceptSuggestion}
                className="px-2 py-1 bg-green-500 text-white rounded mr-2"
              >
                Accept
              </button>
              <button
                onClick={handleCancelSuggestion}
                className="px-2 py-1 bg-red-500 text-white rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
  
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-4">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-4"
            >
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
  
          {isGenerating && <LoadingSkeleton />}
  
          {selectedBlog ? (
            <>
              <h1 className="text-3xl font-bold mb-4">{selectedBlog.title}</h1>
              <BlogEditor
                key={selectedBlog._id}
                initialContent={selectedBlog.content}
                onSave={async (content: string) => { openSaveModal(); }}
                onRegenerate={selectedBlog ? handleRegenerate : handleGenerate}
                onDelete={() => handleDelete(selectedBlog._id)}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                topic={topic}
                versions={versions}
                currentVersion={currentVersion}
                onVersionChange={handleVersionChange}
                onVersionDelete={handleVersionDelete}
              />
            </>
          ) : (
            <div className="text-center text-gray-500 py-10">
              No blog selected. Generate a new blog to begin.
            </div>
          )}
        </div>
      </div>
  
      {/* RIGHT COLUMN: Sidebar */}
      <div className="bg-gray-50 p-4 relative">
        <Sidebar
          currentContent={selectedBlog?.content || ""}
          onRefine={handleRefine}
          onSuggestionSelect={handleApplySuggestion}
        />
        <SidebarToggle />
      </div>
      {/* ----------------------------- */}
      {/* Save Modal (Step 3) */}
      {showSaveModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg">
            <h2 className="mb-4 text-lg font-semibold">Enter Save Name</h2>
            <input
              type="text"
              value={saveTitle}
              onChange={(e) => setSaveTitle(e.target.value)}
              placeholder="Enter blog title..."
              className="border p-2 rounded w-full mb-4"
            />
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowSaveModal(false);
                  handleSave(saveTitle); // This uses the same logic as before
                }}
                className="px-4 py-2 bg-green-500 text-white rounded"
              >
                Save
              </button>
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
  
    </div>
  );
}


//-----------------new code after versioning implementation--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// // generateform.tsx
// "use client";
// import { useState, useEffect } from "react";
// import { toast } from "react-hot-toast";
// import { motion } from "framer-motion";
// import { marked } from "marked";
// import BlogEditor from "./BlogEditor";
// import HistoryPanel from "./HistoryPanel";
// import LoadingSkeleton from "./LoadingSkeleton";
// import { PromptSuggestions } from "./PromptSuggestions";
// import Sidebar from "./Sidebar";
// import SidebarToggle from "./SidebarToggle";

// interface GenerateFormProps {
//   initialQuery?: string;
//   isSample?: boolean;
// }

// export default function GenerateForm({ initialQuery = "",isSample=false }: GenerateFormProps) {
//   const [title, setTitle] = useState("");
//   const [topic, setTopic] = useState(initialQuery);
//   const [isGenerating, setIsGenerating] = useState(false);
//   const [blogs, setBlogs] = useState<any[]>([]);
//   const [selectedBlog, setSelectedBlog] = useState<any>(null);
//   const [viewMode, setViewMode] = useState(false);
//   const [promptSuggestions, setPromptSuggestions] = useState<string[]>([]);
//   const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
//   const [versions, setVersions] = useState<{ content: string; prompt?: string; timestamp: string }[]>([]);
//   const [pendingSuggestion, setPendingSuggestion] = useState<string | null>(null);
//   const [originalContent, setOriginalContent] = useState<string>("");

//   // Load blog history
//   useEffect(() => {
//     const fetchBlogs = async () => {
//       try {
//         const res = await fetch("/api/blogs");
//         const data = await res.json();
//         setBlogs(data);
//       } catch (error) {
//         toast.error("Failed to load history");
//       }
//     };
//     fetchBlogs();
//   }, []);

//   // Auto-generate if initial query exists
//   useEffect(() => {
//     if (initialQuery.trim() && isSample) {
//       // If this is a sample query, fetch the sample blog from the API and select it.
//       (async () => {
//         try {
//           const res = await fetch("/api/sample-blogs");
//           const samples = await res.json();
//           // Find sample blog by comparing lowercase title or category with the query.
//           const sample = samples.find((s: any) => s.title.toLowerCase().includes(initialQuery.toLowerCase()));
//           if (sample) {
//             // Set the sample blog as the selected blog.
//             setSelectedBlog(sample);
//             setViewMode(true);
//           } else {
//             // If not found, proceed with normal generation.
//             await handleGenerate();
//           }
//         } catch (error) {
//           toast.error("Failed to load sample blog");
//         }
//       })();
//     } else if (initialQuery.trim()) {
//       handleGenerate();
//     }
//   }, [initialQuery, isSample]);

//   useEffect(() => {
//     if (selectedBlog?.content) {
//       // Initialize versions with current content as version 1
//       if (versions.length === 0) {
//         setVersions([{
//           content: selectedBlog.content,
//           prompt: topic,
//           timestamp: new Date().toISOString()
//         }]);
//       }
//     }
//   }, [selectedBlog?.content,versions.length, topic]);

//   useEffect(() => {
//     console.log('Current versions:', versions);
//   }, [versions]);

//   // Fetch suggestions when topic changes
//   const fetchSuggestions = async (currentTopic: string) => {
//     setIsFetchingSuggestions(true);
//     try {
//       const res = await fetch("/api/suggestions", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ topic: currentTopic }),
//       });
//       if (!res.ok) throw new Error("Failed to fetch suggestions");
//       const data = await res.json();

//       const finalSuggestions = Array.isArray(data.suggestions)
//         ? data.suggestions.slice(0, 5)
//         : [];
//       setPromptSuggestions(finalSuggestions);
//     } catch (error) {
//       console.error("Suggestion generation failed:", error);
//       setPromptSuggestions([
//         `Latest developments in ${topic}`,
//         `${topic} best practices`,
//         `How to get started with ${topic}`,
//       ]);
//     } finally {
//       setIsFetchingSuggestions(false);
//     }
//   };

  

//   const handleSuggestionClick = async (suggestion: string) => {
//     setSelectedBlog(null);
//     setViewMode(false);
//     setTopic(String(suggestion));
//     await handleGenerate(suggestion);
//   };

//   const handleGenerate = async (currentTopic?: string) => {
//     const finalTopic = typeof currentTopic === "string" ? currentTopic : topic;

//     // If finalTopic is still not a string, bail out
//     if (typeof finalTopic !== "string") {
//       toast.error("Invalid topic: must be a string");
//       return;
//     }

//     // Now safe to do .trim()
//     if (!finalTopic.trim()) {
//       toast.error("Please enter a topic");
//       return;
//     }
//     if (selectedBlog?.content) {
//       setVersions(prev => [
//         ...prev,
//         {
//           content: selectedBlog.content,
//           prompt: finalTopic,
//           timestamp: new Date().toISOString()
//         }
//       ]);
//     }

//     setIsGenerating(true);
//     try {
//       const res = await fetch("/api/generate", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           topic: finalTopic,
//           title: title || finalTopic,
//         }),
//       });
//       const data = await res.json();
//       if (!data?.content) {
//         throw new Error("No content generated");
//       }
//       const htmlContent = await marked.parse(data.content);
//       const tempBlog = {
//         content: htmlContent,
//         _id: `temp-${Date.now()}`,
//         createdAt: new Date().toISOString(),
//         title: title || finalTopic,
//         topic: finalTopic,
//         versions: versions // Include current versions // Initialize versions array
//       };

//       // After generation, update versions
//       const newVersion = {
//         content: htmlContent,
//         prompt: finalTopic,
//         timestamp: new Date().toISOString()
//       };
//       setVersions(prev => [...prev, newVersion]);
//       setSelectedBlog(tempBlog);
//       // version logs
//       console.log('Previous content:', selectedBlog?.content);
//       console.log('New versions:', versions);
//       setViewMode(false);
//       toast.success("Blog generated!");
//       await fetchSuggestions(finalTopic);
//     } catch (error) {
//       toast.error(error instanceof Error ? error.message : "Generation failed");
//     } finally {
//       setIsGenerating(false);
//     }
//   };
  
  
//   // Save current version and update blog content
//   const handleRefine = (newContent: string) => {
//     if (selectedBlog?.content) {
//       setVersions((prev) => [
//         ...prev,
//         { 
//           content: selectedBlog.content, 
//           prompt: "User refinement",
//           timestamp: new Date().toISOString() 
//         },
//       ]);
//     }
//     console.log('Refining from:', selectedBlog?.content);
//     setSelectedBlog((prev: any) => ({
//       ...prev,
//       content: newContent
//     }));

//     // Adding the refined version
//     setVersions(prev => [
//       ...prev,
//       {
//         content: newContent,
//         prompt: "Refined version",
//         timestamp: new Date().toISOString()
//       }
//     ]);

//   };

//   const handleSave = async (content: string) => {
//     try {
//       const res = await fetch("/api/blogs", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ 
//           content, 
//           topic, 
//           title,
//           versions
//        }),
//       });
//       const newBlog = await res.json();
//       setBlogs((prev) => {
//         const filtered = prev.filter((b) => b._id !== newBlog._id);
//         return [newBlog, ...filtered];
//       });
//       setSelectedBlog(newBlog);
//       setViewMode(true);
//       toast.success("Blog saved!");
//     } catch (error) {
//       toast.error("Save failed");
//     }
//   };

//   const handleDelete = async (id: string) => {
//     try {
//       await fetch("/api/blogs", {
//         method: "DELETE",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ id }),
//       });
//       setBlogs((prev) => prev.filter((b) => b._id !== id));
//       setSelectedBlog(null);
//       setViewMode(false);
//       toast.success("Blog deleted");
//     } catch (error) {
//       toast.error("Deletion failed");
//     }
//   };

//   // Called when a suggestion is clicked from the nested panel.
//   const handleApplySuggestion = async (suggestion: string) => {
//     if (selectedBlog) {
//       setVersions(prev => [
//         ...prev,
//         {
//           content: selectedBlog.content,
//           prompt: "Pre-feedback version",
//           timestamp: new Date().toISOString()
//         }
//       ]);
//       const res = await fetch("/api/refine", {
//         method: "POST",
//         body: JSON.stringify({
//           content: selectedBlog.content,
//           feedback: suggestion
//         })
//       });
//       const data = await res.json();
//       // Update content and versions
//       setSelectedBlog((prev: any) => ({ ...prev, content: data.refinedContent }));
//       setVersions(prev => [
//         ...prev,
//         {
//           content: data.refinedContent,
//           prompt: `Feedback applied: ${suggestion}`,
//           timestamp: new Date().toISOString()
//         }
//       ]);
//       setOriginalContent(selectedBlog.content);
//       // Wrap the suggestion in a span for highlighting.
//       const highlighted = `<span class="bg-yellow-300" id="pending-suggestion">${suggestion}</span>`;
//       const newContent = selectedBlog.content + highlighted;
//       setPendingSuggestion(suggestion);
//       handleRefine(newContent);
//       toast("Applying suggestion...");
//     }
//   };

//   const handleAcceptSuggestion = () => {
//     setPendingSuggestion(null);
//     toast.success("Suggestion accepted.");
//   };

//   const handleCancelSuggestion = () => {
//     if (selectedBlog) {
//       handleRefine(originalContent);
//     }
//     setPendingSuggestion(null);
//     toast.error("Suggestion canceled.");
//   };

//   return (
//     <div
//       className="
//         grid
//         grid-cols-[25rem_1.5fr_17rem]
//         items-stretch
//         gap-2
//         w-full
//         min-h-screen 
//         p-0
//         /* Remove max-w-7xl and mx-auto to allow full width */
//       "
//     >
//       {/* LEFT COLUMN: Blog History Panel */}
//       <div className="pl-4 bg-gray-100">
//         <HistoryPanel
//           blogs={blogs}
//           onSelect={(blog) => {
//             setSelectedBlog(blog);
//             setVersions(blog.versions || []); // Restore saved versions
//             setViewMode(true);
//           }}
//           onDelete={handleDelete}
//         />
//       </div>
  
//       {/* MIDDLE COLUMN: Editor Box (bigger now) */}
//       <div>
//         {pendingSuggestion && (
//           <div className="flex items-center justify-between p-2 bg-yellow-100 rounded-md mb-4">
//             <span>Suggestion: {pendingSuggestion}</span>
//             <div>
//               <button
//                 onClick={handleAcceptSuggestion}
//                 className="px-2 py-1 bg-green-500 text-white rounded mr-2"
//               >
//                 Accept
//               </button>
//               <button
//                 onClick={handleCancelSuggestion}
//                 className="px-2 py-1 bg-red-500 text-white rounded"
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         )}
  
//         <div className="bg-white rounded-lg shadow p-6">
//           <div className="mb-4">
//             <motion.div
//               initial={{ opacity: 0, y: -10 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="flex flex-col gap-4"
//             >
//               <div className="flex gap-4 items-center">
//                 <input
//                   value={topic}
//                   onChange={(e) => setTopic(e.target.value)}
//                   placeholder="Enter blog topic..."
//                   className="flex-1 p-3 border rounded-lg"
//                 />
//                 <button
//                   onClick={() => handleGenerate()}
//                   disabled={isGenerating}
//                   className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
//                 >
//                   {isGenerating ? "Generating..." : "Generate"}
//                 </button>
//               </div>
//               {(promptSuggestions.length > 0 || isFetchingSuggestions) && (
//                 <div className="mt-2">
//                   {isFetchingSuggestions ? (
//                     <div className="text-sm text-gray-500">Loading suggestions...</div>
//                   ) : (
//                     <PromptSuggestions
//                       suggestions={promptSuggestions}
//                       onSuggestionClick={handleSuggestionClick}
//                     />
//                   )}
//                 </div>
//               )}
//             </motion.div>
//           </div>
  
//           {isGenerating && <LoadingSkeleton />}
  
//           {selectedBlog ? (
//             <>
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
//                 versions={versions.map((v, idx) => ({
//                   ...v,
//                   versionNumber: idx + 1
//                 }))} // Add version number
//                 onVersionSelect={(versionContent: string) => {
//                   console.log('Received versions:', versions);
//                   setSelectedBlog((prev: any) => ({
//                     ...prev,
//                     content: versionContent,
//                   }));
//                 }}
//               />
//             </>
//           ) : (
//             <div className="text-center text-gray-500 py-10">
//               No blog selected. Generate a new blog to begin.
//             </div>
//           )}
//         </div>
//       </div>
  
//       {/* RIGHT COLUMN: Sidebar */}
//       <div className="bg-gray-50 p-4 relative">
//         <Sidebar
//           currentContent={selectedBlog?.content || ""}
//           onRefine={handleRefine}
//           onSuggestionSelect={handleApplySuggestion}
//         />
//         <SidebarToggle />
//       </div>
//     </div>
  
//   ); 
// }  

//-----------------old code before versioning implementation--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// // generateform.tsx
// "use client";
// import { useState, useEffect } from "react";
// import { toast } from "react-hot-toast";
// import { motion } from "framer-motion";
// import { marked } from "marked";
// import BlogEditor from "./BlogEditor";
// import HistoryPanel from "./HistoryPanel";
// import LoadingSkeleton from "./LoadingSkeleton";
// import { PromptSuggestions } from "./PromptSuggestions";
// import Sidebar from "./Sidebar";
// import SidebarToggle from "./SidebarToggle";

// interface GenerateFormProps {
//   initialQuery?: string;
//   isSample?: boolean;
// }

// export default function GenerateForm({ initialQuery = "",isSample=false }: GenerateFormProps) {
//   const [title, setTitle] = useState("");
//   const [topic, setTopic] = useState(initialQuery);
//   const [isGenerating, setIsGenerating] = useState(false);
//   const [blogs, setBlogs] = useState<any[]>([]);
//   const [selectedBlog, setSelectedBlog] = useState<any>(null);
//   const [viewMode, setViewMode] = useState(false);
//   const [promptSuggestions, setPromptSuggestions] = useState<string[]>([]);
//   const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
//   const [versions, setVersions] = useState<{ content: string; timestamp: string }[]>([]);
//   const [pendingSuggestion, setPendingSuggestion] = useState<string | null>(null);
//   const [originalContent, setOriginalContent] = useState<string>("");

//   // Load blog history
//   useEffect(() => {
//     const fetchBlogs = async () => {
//       try {
//         const res = await fetch("/api/blogs");
//         const data = await res.json();
//         setBlogs(data);
//       } catch (error) {
//         toast.error("Failed to load history");
//       }
//     };
//     fetchBlogs();
//   }, []);

//   // Auto-generate if initial query exists
//   useEffect(() => {
//     if (initialQuery.trim() && isSample) {
//       // If this is a sample query, fetch the sample blog from the API and select it.
//       (async () => {
//         try {
//           const res = await fetch("/api/sample-blogs");
//           const samples = await res.json();
//           // Find sample blog by comparing lowercase title or category with the query.
//           const sample = samples.find((s: any) => s.title.toLowerCase().includes(initialQuery.toLowerCase()));
//           if (sample) {
//             // Set the sample blog as the selected blog.
//             setSelectedBlog(sample);
//             setViewMode(true);
//           } else {
//             // If not found, proceed with normal generation.
//             await handleGenerate();
//           }
//         } catch (error) {
//           toast.error("Failed to load sample blog");
//         }
//       })();
//     } else if (initialQuery.trim()) {
//       handleGenerate();
//     }
//   }, [initialQuery, isSample]);

//   // Fetch suggestions when topic changes
//   const fetchSuggestions = async (currentTopic: string) => {
//     setIsFetchingSuggestions(true);
//     try {
//       const res = await fetch("/api/suggestions", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ topic: currentTopic }),
//       });
//       if (!res.ok) throw new Error("Failed to fetch suggestions");
//       const data = await res.json();
//       const finalSuggestions = Array.isArray(data.suggestions)
//         ? data.suggestions.slice(0, 5)
//         : [];
//       setPromptSuggestions(finalSuggestions);
//     } catch (error) {
//       console.error("Suggestion generation failed:", error);
//       setPromptSuggestions([
//         `Latest developments in ${topic}`,
//         `${topic} best practices`,
//         `How to get started with ${topic}`,
//       ]);
//     } finally {
//       setIsFetchingSuggestions(false);
//     }
//   };

//   // Save current version and update blog content
//   const handleRefine = (newContent: string) => {
//     if (selectedBlog?.content) {
//       setVersions((prev) => [
//         ...prev,
//         { content: selectedBlog.content, timestamp: new Date().toLocaleString() },
//       ]);
//     }
//     setSelectedBlog((prev: any) => ({
//       ...prev,
//       content: newContent,
//     }));
//   };

//   const handleSuggestionClick = async (suggestion: string) => {
//     setSelectedBlog(null);
//     setViewMode(false);
//     setTopic(String(suggestion));
//     await handleGenerate(suggestion);
//   };

//   const handleGenerate = async (currentTopic?: string) => {
//     const finalTopic = typeof currentTopic === "string" ? currentTopic : topic;

//     // If finalTopic is still not a string, bail out
//     if (typeof finalTopic !== "string") {
//       toast.error("Invalid topic: must be a string");
//       return;
//     }

//     // Now safe to do .trim()
//     if (!finalTopic.trim()) {
//       toast.error("Please enter a topic");
//       return;
//     }
//     setIsGenerating(true);
//     try {
//       const res = await fetch("/api/generate", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           topic: finalTopic,
//           title: title || finalTopic,
//         }),
//       });
//       const data = await res.json();
//       if (!data?.content) {
//         throw new Error("No content generated");
//       }
//       const htmlContent = marked(data.content);
//       const tempBlog = {
//         content: htmlContent,
//         _id: `temp-${Date.now()}`,
//         createdAt: new Date().toISOString(),
//         title: title || finalTopic,
//         topic: finalTopic,
//       };
//       setSelectedBlog(tempBlog);
//       setViewMode(false);
//       toast.success("Blog generated!");
//       await fetchSuggestions(finalTopic);
//     } catch (error) {
//       toast.error(error instanceof Error ? error.message : "Generation failed");
//     } finally {
//       setIsGenerating(false);
//     }
//   };
  
  
  

//   const handleSave = async (content: string) => {
//     try {
//       const res = await fetch("/api/blogs", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ content, topic, title }),
//       });
//       const newBlog = await res.json();
//       setBlogs((prev) => {
//         const filtered = prev.filter((b) => b._id !== newBlog._id);
//         return [newBlog, ...filtered];
//       });
//       setSelectedBlog(newBlog);
//       setViewMode(true);
//       toast.success("Blog saved!");
//     } catch (error) {
//       toast.error("Save failed");
//     }
//   };

//   const handleDelete = async (id: string) => {
//     try {
//       await fetch("/api/blogs", {
//         method: "DELETE",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ id }),
//       });
//       setBlogs((prev) => prev.filter((b) => b._id !== id));
//       setSelectedBlog(null);
//       setViewMode(false);
//       toast.success("Blog deleted");
//     } catch (error) {
//       toast.error("Deletion failed");
//     }
//   };

//   // Called when a suggestion is clicked from the nested panel.
//   const handleApplySuggestion = (suggestion: string) => {
//     if (selectedBlog) {
//       setOriginalContent(selectedBlog.content);
//       // Wrap the suggestion in a span for highlighting.
//       const highlighted = `<span class="bg-yellow-300" id="pending-suggestion">${suggestion}</span>`;
//       const newContent = selectedBlog.content + highlighted;
//       setPendingSuggestion(suggestion);
//       handleRefine(newContent);
//       toast("Applying suggestion...");
//     }
//   };

//   const handleAcceptSuggestion = () => {
//     setPendingSuggestion(null);
//     toast.success("Suggestion accepted.");
//   };

//   const handleCancelSuggestion = () => {
//     if (selectedBlog) {
//       handleRefine(originalContent);
//     }
//     setPendingSuggestion(null);
//     toast.error("Suggestion canceled.");
//   };

//   return (
//     <div
//       className="
//         grid
//         grid-cols-[25rem_1.5fr_17rem]
//         items-stretch
//         gap-2
//         w-full
//         min-h-screen 
//         p-0
//         /* Remove max-w-7xl and mx-auto to allow full width */
//       "
//     >
//       {/* LEFT COLUMN: Blog History Panel */}
//       <div className="pl-4 bg-gray-100">
//         <HistoryPanel
//           blogs={blogs}
//           onSelect={(blog) => {
//             setSelectedBlog(blog);
//             setViewMode(true);
//           }}
//           onDelete={handleDelete}
//         />
//       </div>
  
//       {/* MIDDLE COLUMN: Editor Box (bigger now) */}
//       <div>
//         {pendingSuggestion && (
//           <div className="flex items-center justify-between p-2 bg-yellow-100 rounded-md mb-4">
//             <span>Suggestion: {pendingSuggestion}</span>
//             <div>
//               <button
//                 onClick={handleAcceptSuggestion}
//                 className="px-2 py-1 bg-green-500 text-white rounded mr-2"
//               >
//                 Accept
//               </button>
//               <button
//                 onClick={handleCancelSuggestion}
//                 className="px-2 py-1 bg-red-500 text-white rounded"
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         )}
  
//         <div className="bg-white rounded-lg shadow p-6">
//           <div className="mb-4">
//             <motion.div
//               initial={{ opacity: 0, y: -10 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="flex flex-col gap-4"
//             >
//               <div className="flex gap-4 items-center">
//                 <input
//                   value={topic}
//                   onChange={(e) => setTopic(e.target.value)}
//                   placeholder="Enter blog topic..."
//                   className="flex-1 p-3 border rounded-lg"
//                 />
//                 <button
//                   onClick={() => handleGenerate()}
//                   disabled={isGenerating}
//                   className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
//                 >
//                   {isGenerating ? "Generating..." : "Generate"}
//                 </button>
//               </div>
//               {(promptSuggestions.length > 0 || isFetchingSuggestions) && (
//                 <div className="mt-2">
//                   {isFetchingSuggestions ? (
//                     <div className="text-sm text-gray-500">Loading suggestions...</div>
//                   ) : (
//                     <PromptSuggestions
//                       suggestions={promptSuggestions}
//                       onSuggestionClick={handleSuggestionClick}
//                     />
//                   )}
//                 </div>
//               )}
//             </motion.div>
//           </div>
  
//           {isGenerating && <LoadingSkeleton />}
  
//           {selectedBlog ? (
//             <>
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
//                 versions={versions}
//                 onVersionSelect={(versionContent: string) => {
//                   setSelectedBlog((prev: any) => ({
//                     ...prev,
//                     content: versionContent,
//                   }));
//                 }}
//               />
//             </>
//           ) : (
//             <div className="text-center text-gray-500 py-10">
//               No blog selected. Generate a new blog to begin.
//             </div>
//           )}
//         </div>
//       </div>
  
//       {/* RIGHT COLUMN: Sidebar */}
//       <div className="bg-gray-50 p-4 relative">
//         <Sidebar
//           currentContent={selectedBlog?.content || ""}
//           onRefine={handleRefine}
//           onSuggestionSelect={handleApplySuggestion}
//         />
//         <SidebarToggle />
//       </div>
//     </div>
  
//   ); 
// }  

//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//   return (
//     <div className="grid grid-cols-[25.5rem_1fr_17rem] gap-4 mx-auto p-4">
//       {/* Left Column: Blog History (adjust width here as needed) */}
//       <div className="col-[1]">
//         <HistoryPanel
//           blogs={blogs}
//           onSelect={(blog) => {
//             setSelectedBlog(blog);
//             setViewMode(true);
//           }}
//           onDelete={handleDelete}
//         />
//       </div>

//       {/* Middle Column: Editor Box */}
//       <div className="col-[2]">
//         {pendingSuggestion && (
//           <div className="flex items-center justify-between p-2 bg-yellow-100 rounded-md mb-4">
//             <span>Suggestion: {pendingSuggestion}</span>
//             <div>
//               <button onClick={handleAcceptSuggestion} className="px-2 py-1 bg-green-500 text-white rounded mr-2">
//                 Accept
//               </button>
//               <button onClick={handleCancelSuggestion} className="px-2 py-1 bg-red-500 text-white rounded">
//                 Cancel
//               </button>
//             </div>
//           </div>
//         )}
//         <div className="bg-white rounded-lg shadow p-6">
//           <div className="mb-4">
//             <motion.div
//               initial={{ opacity: 0, y: -10 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="flex flex-col gap-4"
//             >
//               <div className="flex gap-4 items-center">
//                 <input
//                   value={topic}
//                   onChange={(e) => setTopic(e.target.value)}
//                   placeholder="Enter blog topic..."
//                   className="flex-1 p-3 border rounded-lg"
//                 />
//                 <button
//                   onClick={() => handleGenerate()}
//                   disabled={isGenerating}
//                   className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
//                 >
//                   {isGenerating ? "Generating..." : "Generate"}
//                 </button>
//               </div>
//               {(promptSuggestions.length > 0 || isFetchingSuggestions) && (
//                 <div className="mt-2">
//                   {isFetchingSuggestions ? (
//                     <div className="text-sm text-gray-500">Loading suggestions...</div>
//                   ) : (
//                     <PromptSuggestions
//                       suggestions={promptSuggestions}
//                       onSuggestionClick={handleSuggestionClick}
//                     />
//                   )}
//                 </div>
//               )}
//             </motion.div>
//           </div>
//           {isGenerating && <LoadingSkeleton />}
//           {selectedBlog ? (
//             <>
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
//                 versions={versions}
//                 onVersionSelect={(versionContent: string) => {
//                   setSelectedBlog((prev: any) => ({
//                     ...prev,
//                     content: versionContent,
//                   }));
//                 }}
//               />
//             </>
//           ) : (
//             <div className="text-center text-gray-500 py-10">
//               No blog selected. Generate a new blog to begin.
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Right Column: Sidebar */}
//       <div className="col-[3] relative">
//         <Sidebar
//           currentContent={selectedBlog?.content || ""}
//           onRefine={handleRefine}
//           onSuggestionSelect={handleApplySuggestion}
//         />
//         <SidebarToggle />
//       </div>
//     </div>
//   );
// }


// // generateform.tsx
// "use client";
// import { useState, useEffect } from "react";
// import { toast } from "react-hot-toast";
// import { motion } from "framer-motion";
// import { marked } from "marked";
// import BlogEditor from "./BlogEditor";
// import HistoryPanel from "./HistoryPanel";
// import LoadingSkeleton from "./LoadingSkeleton";
// import { PromptSuggestions } from "./PromptSuggestions";
// import LeftPanel from "./LeftPanel"; // New LeftPanel import
// import Sidebar from "./Sidebar";
// import SidebarToggle from "./SidebarToggle"; 

// interface GenerateFormProps {
//   initialQuery?: string;
// }

// export default function GenerateForm({ initialQuery = "" }: GenerateFormProps) {
//   const [title, setTitle] = useState("");
//   const [topic, setTopic] = useState(initialQuery);
//   const [isGenerating, setIsGenerating] = useState(false);
//   const [blogs, setBlogs] = useState<any[]>([]);
//   const [selectedBlog, setSelectedBlog] = useState<any>(null);
//   const [viewMode, setViewMode] = useState(false);
//   const [promptSuggestions, setPromptSuggestions] = useState<string[]>([]);
//   const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
//   const [versions, setVersions] = useState<{ content: string; timestamp: string }[]>([]);


//   // Load blog history
//   useEffect(() => {
//     const fetchBlogs = async () => {
//       try {
//         const res = await fetch("/api/blogs");
//         const data = await res.json();
//         setBlogs(data);
//       } catch (error) {
//         toast.error("Failed to load history");
//       }
//     };
//     fetchBlogs();
//   }, []);

//   // Auto-generate if initial query exists
//   useEffect(() => {
//     if (initialQuery.trim()) {
//       handleGenerate();
//     }
//   }, []);

//   // Fetch suggestions when topic changes
//   const fetchSuggestions = async (currentTopic: string) => {
//     setIsFetchingSuggestions(true);
//     try {
//       const res = await fetch("/api/suggestions", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ topic: currentTopic }),
//       });
//       if (!res.ok) throw new Error("Failed to fetch suggestions");
//       const data = await res.json();
//       const finalSuggestions = Array.isArray(data.suggestions)
//         ? data.suggestions.slice(0, 5)
//         : [];
//       setPromptSuggestions(finalSuggestions);
//     } catch (error) {
//       console.error("Suggestion generation failed:", error);
//       setPromptSuggestions([
//         `Latest developments in ${topic}`,
//         `${topic} best practices`,
//         `How to get started with ${topic}`,
//       ]);
//     } finally {
//       setIsFetchingSuggestions(false);
//     }
//   };
//   // Modified onRefine handler passed to LeftPanel:
//   const handleRefine = (newContent: string) => {
//     // Save current version before updating (if there is existing content)
//     if (selectedBlog?.content) {
//       setVersions((prev) => [
//         ...prev,
//         { content: selectedBlog.content, timestamp: new Date().toLocaleString() },
//       ]);
//     }
//     setSelectedBlog((prev: any) => ({
//       ...prev,
//       content: newContent,
//     }));
//   };
  
//   const handleSuggestionClick = async (suggestion: string) => {
//     setSelectedBlog(null);
//     setViewMode(false);
//     setTopic(suggestion);
//     await handleGenerate(suggestion);
//   };

//   const handleGenerate = async (currentTopic?: string) => {
//     const finalTopic = currentTopic || topic;
//     if (!finalTopic.trim()) {
//       toast.error("Please enter a topic");
//       return;
//     }
//     setIsGenerating(true);
//     try {
//       const res = await fetch("/api/generate", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           topic: finalTopic,
//           title: title || finalTopic,
//         }),
//       });
//       const data = await res.json();
//       if (!data?.content) {
//         throw new Error("No content generated");
//       }
//       const htmlContent = marked(data.content);
//       const tempBlog = {
//         content: htmlContent,
//         _id: `temp-${Date.now()}`,
//         createdAt: new Date().toISOString(),
//         title: title || finalTopic,
//         topic: finalTopic,
//       };
//       setSelectedBlog(tempBlog);
//       setViewMode(false);
//       toast.success("Blog generated!");
//       await fetchSuggestions(finalTopic);
//     } catch (error) {
//       toast.error(error instanceof Error ? error.message : "Generation failed");
//     } finally {
//       setIsGenerating(false);
//     }
//   };

//   const handleSave = async (content: string) => {
//     try {
//       const res = await fetch("/api/blogs", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ content, topic, title }),
//       });
//       const newBlog = await res.json();
//       setBlogs((prev) => {
//         const filtered = prev.filter((b) => b._id !== newBlog._id);
//         return [newBlog, ...filtered];
//       });
//       setSelectedBlog(newBlog);
//       setViewMode(true);
//       toast.success("Blog saved!");
//     } catch (error) {
//       toast.error("Save failed");
//     }
//   };

//   const handleDelete = async (id: string) => {
//     try {
//       await fetch("/api/blogs", {
//         method: "DELETE",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ id }),
//       });
//       setBlogs((prev) => prev.filter((b) => b._id !== id));
//       setSelectedBlog(null);
//       setViewMode(false);
//       toast.success("Blog deleted");
//     } catch (error) {
//       toast.error("Deletion failed");
//     }
//   };

//   return (
//     <div>
//       {/* Render fixed sidebar and toggle */}
//       <Sidebar currentContent={selectedBlog?.content || ""} onRefine={handleRefine} />
//       <SidebarToggle />
//       {/* <div className="lg:col-span-1">
//         <LeftPanel
//           currentContent={selectedBlog?.content || ""}
//           onRefine={(newContent) => {
//             // Update the current blog content with the refined version.
//             setSelectedBlog((prev: any) => ({
//               ...prev,
//               content: newContent,
//             }));
//           }}
//         />
//       </div> */}

//       {/* Main Content */}
//       <div className="ml-[17rem] p-4">
//         <div className="bg-white rounded-lg shadow p-6">
//           <div className="mb-4">
//             <motion.div
//               initial={{ opacity: 0, y: -10 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="flex flex-col gap-4"
//             >
//               <div className="flex gap-4 items-center">
//                 <input
//                   value={topic}
//                   onChange={(e) => setTopic(e.target.value)}
//                   placeholder="Enter blog topic..."
//                   className="flex-1 p-3 border rounded-lg"
//                 />
//                 <button
//                   onClick={() => handleGenerate()}
//                   disabled={isGenerating}
//                   className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
//                 >
//                   {isGenerating ? "Generating..." : "Generate"}
//                 </button>
//               </div>
//               {(promptSuggestions.length > 0 || isFetchingSuggestions) && (
//                 <div className="mt-2">
//                   {isFetchingSuggestions ? (
//                     <div className="text-sm text-gray-500">Loading suggestions...</div>
//                   ) : (
//                     <PromptSuggestions
//                       suggestions={promptSuggestions}
//                       onSuggestionClick={handleSuggestionClick}
//                     />
//                   )}
//                 </div>
//               )}
//             </motion.div>
//           </div>

//           {isGenerating && <LoadingSkeleton />}

//           {selectedBlog ? (
//             <>
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
//                 versions={versions}
//                 onVersionSelect={(versionContent: string) => {
//                   setSelectedBlog((prev: any) => ({
//                     ...prev,
//                     content: versionContent,
//                   }));
//                 }}
//               />
//             </>
//           ) : (
//             <div className="text-center text-gray-500 py-10">
//               No blog selected. Generate a new blog to begin.
//             </div>
//           )}
//         </div>
//       </div>

//       {/* History Panel */}
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

// "use client";
// import { useState, useEffect } from "react";
// import { toast } from "react-hot-toast";
// import { motion } from "framer-motion";
// import { marked } from "marked";
// import BlogEditor from "./BlogEditor";
// import HistoryPanel from "./HistoryPanel";
// import LoadingSkeleton from "./LoadingSkeleton";
// import { PromptSuggestions } from './PromptSuggestions';

// interface GenerateFormProps {
//   initialQuery?: string;
// }

// export default function GenerateForm({ initialQuery = "" }: GenerateFormProps) {
//   const [title, setTitle] = useState("");
//   const [topic, setTopic] = useState(initialQuery);
//   const [isGenerating, setIsGenerating] = useState(false);
//   const [blogs, setBlogs] = useState<any[]>([]);
//   const [selectedBlog, setSelectedBlog] = useState<any>(null);
//   const [viewMode, setViewMode] = useState(false);
//   const [promptSuggestions, setPromptSuggestions] = useState<string[]>([]);
//   const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);

//   // Load blog history
//   useEffect(() => {
//     const fetchBlogs = async () => {
//       try {
//         const res = await fetch("/api/blogs");
//         const data = await res.json();
//         setBlogs(data);
//       } catch (error) {
//         toast.error("Failed to load history");
//       }
//     };
//     fetchBlogs();
//   }, []);

//   // Auto-generate if initial query exists
//   useEffect(() => {
//     if (initialQuery.trim()) {
//       handleGenerate();
//     }
//   }, []);

//   // Fetch suggestions when topic changes
//   // components/GenerateForm.tsx
//   const fetchSuggestions = async (currentTopic: string) => {
//     setIsFetchingSuggestions(true);
//     try {
//       const res = await fetch('/api/suggestions', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ topic: currentTopic }),
//       });
      
//       if (!res.ok) throw new Error('Failed to fetch suggestions');
      
//       const data = await res.json();
//       // Ensure we always have an array of suggestions
//       const finalSuggestions = Array.isArray(data.suggestions) 
//         ? data.suggestions.slice(0, 5) // Get first 5 suggestions
//         : [];
      
//       setPromptSuggestions(finalSuggestions);
//     } catch (error) {
//       console.error('Suggestion generation failed:', error);
//       // Fallback to default suggestions
//       setPromptSuggestions([
//         `Latest developments in ${topic}`,
//         `${topic} best practices`,
//         `How to get started with ${topic}`
//       ]);
//     } finally {
//       setIsFetchingSuggestions(false);
//     }
//   };

//   const handleSuggestionClick = async (suggestion: string) => {
//     // Clear previous content while generating
//     setSelectedBlog(null);
//     setViewMode(false);
//     setTopic(suggestion);
    
//     // Use a temporary variable to ensure we use the latest state
//     await handleGenerate(suggestion);
//   };

//   const handleGenerate = async (currentTopic?: string) => {
//     const finalTopic = currentTopic || topic;
//     if (!finalTopic.trim()) {
//       toast.error('Please enter a topic');
//       return;
//     }
    
//     setIsGenerating(true);
//     try {
//       const res = await fetch("/api/generate", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ 
//           topic: finalTopic, 
//           title: title || finalTopic // Fallback to topic if no title
//         }),
//       });
  
//       const data = await res.json();
      
//       // Add null check for content
//       if (!data?.content) {
//         throw new Error('No content generated');
//       }
  
//       const htmlContent = marked(data.content);
      
//       const tempBlog = {
//         content: htmlContent,
//         _id: `temp-${Date.now()}`,
//         createdAt: new Date().toISOString(),
//         title: title || finalTopic,
//         topic: finalTopic,
//       };
      
//       setSelectedBlog(tempBlog);
//       setViewMode(false);
//       toast.success("Blog generated!");
      
//       // Fetch new suggestions based on the current topic
//       await fetchSuggestions(finalTopic);
//     } catch (error) {
//       toast.error(error instanceof Error ? error.message : "Generation failed");
//     } finally {
//       setIsGenerating(false);
//     }
//   };

//   // Save blog
//   const handleSave = async (content: string) => {
//     try {
//       const res = await fetch("/api/blogs", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ content, topic, title }),
//       });
//       const newBlog = await res.json();
//       setBlogs((prev) => {
//         const filtered = prev.filter((b) => b._id !== newBlog._id);
//         return [newBlog, ...filtered];
//       });
//       setSelectedBlog(newBlog);
//       setViewMode(true);
//       toast.success("Blog saved!");
//     } catch (error) {
//       toast.error("Save failed");
//     }
//   };

//   // Delete blog
//   const handleDelete = async (id: string) => {
//     try {
//       await fetch("/api/blogs", {
//         method: "DELETE",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ id }),
//       });
//       setBlogs((prev) => prev.filter((b) => b._id !== id));
//       setSelectedBlog(null);
//       setViewMode(false);
//       toast.success("Blog deleted");
//     } catch (error) {
//       toast.error("Deletion failed");
//     }
//   };

//   return (
//     <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 max-w-7xl mx-auto p-4">
//       <div className="lg:col-span-3 space-y-6">
//         <div className="bg-white rounded-lg shadow p-6">
//           <div className="mb-4">
//             <motion.div
//               initial={{ opacity: 0, y: -10 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="flex flex-col gap-4"
//             >
//               {/* Title Input */}
//               {/* <input
//                 value={title}
//                 onChange={(e) => setTitle(e.target.value)}
//                 placeholder="Enter blog title..."
//                 className="w-full p-3 border rounded-lg"
//               /> */}
              
//               {/* Topic Input & Generate Button */}
//               <div className="flex gap-4 items-center">
//                 <input
//                   value={topic}
//                   onChange={(e) => setTopic(e.target.value)}
//                   placeholder="Enter blog topic..."
//                   className="flex-1 p-3 border rounded-lg"
//                 />
//                 <button
//                   onClick={() => handleGenerate()}
//                   disabled={isGenerating}
//                   className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
//                 >
//                   {isGenerating ? "Generating..." : "Generate"}
//                 </button>
//               </div>

//               {/* Prompt Suggestions */}
//               {(promptSuggestions.length > 0 || isFetchingSuggestions) && (
//                 <div className="mt-2">
//                   {isFetchingSuggestions ? (
//                     <div className="text-sm text-gray-500">Loading suggestions...</div>
//                   ) : (
//                     <PromptSuggestions 
//                       suggestions={promptSuggestions}
//                       onSuggestionClick={handleSuggestionClick}
//                     />
//                   )}
//                 </div>
//               )}
//             </motion.div>
//           </div>

//           {/* Content Area */}
//           {isGenerating && <LoadingSkeleton />}

//           {selectedBlog ? (
//             <>
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

//       {/* History Panel */}
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
