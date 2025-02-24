// generateform.tsx
"use client";
import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { marked } from "marked";
import BlogEditor from "./BlogEditor";
import HistoryPanel from "./HistoryPanel";
import LoadingSkeleton from "./LoadingSkeleton";
import { PromptSuggestions } from "./PromptSuggestions";
import Sidebar from "./Sidebar";
import SidebarToggle from "./SidebarToggle";

// Create interfaces for better typing
interface BlogVersion {
  content: string;
  prompt?: string;
  timestamp: string;
}

interface BlogType {
  _id: string;
  content: string;
  title?: string;
  topic?: string;
  versions?: BlogVersion[];
  currentVersion?: number;
  createdAt: string;
}

interface GenerateFormProps {
  initialQuery?: string;
  isSample?: boolean;
}

export default function GenerateForm({ initialQuery = "", isSample = false }: GenerateFormProps) {
  const [_title, _setTitle] = useState("");
  const [topic, setTopic] = useState(initialQuery);
  const [isGenerating, setIsGenerating] = useState(false);
  const [blogs, setBlogs] = useState<BlogType[]>([]);
  const [selectedBlog, setSelectedBlog] = useState<BlogType | null>(null);
  const [viewMode, setViewMode] = useState(false);
  const [promptSuggestions, setPromptSuggestions] = useState<string[]>([]);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const [versions, setVersions] = useState<BlogVersion[]>([]);
  const [currentVersion, setCurrentVersion] = useState(0);
  const [pendingSuggestion, setPendingSuggestion] = useState<string | null>(null);
  const [_originalContent, _setOriginalContent] = useState<string>("");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveTitle, setSaveTitle] = useState(topic);

  const [_tempRefinedContent, _setTempRefinedContent] = useState(""); 
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [_inlineHighlightedContent, _setInlineHighlightedContent] = useState("");

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
      } catch (_error) {
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
      setCurrentVersion(selectedBlog.currentVersion || 0);
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
        `Latest developments in ${currentTopic}`,
        `${currentTopic} best practices`,
        `How to get started with ${currentTopic}`,
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
  const handleGenerate = useCallback(async (currentTopic?: string) => {
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
          title: topic || finalTopic,
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
      const tempBlog: BlogType = {
        content: htmlContent,
        _id: `temp-${Date.now()}`,
        createdAt: new Date().toISOString(),
        title: topic || finalTopic,
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
  }, [topic, selectedBlog]);

  // Consolidated handleRefine using addVersion
  const handleRefine = async (feedbackText: string) => {
    if (!selectedBlog?.content) {
      toast.error("No content to refine");
      return;
    }
  
    const existingContent = selectedBlog.content;
    const newContent = existingContent + "\n\n" + feedbackText;
  
    // Create a new version object for the refined content.
    const newVersion = {
      content: newContent,
      prompt: "Refined with feedback: " + feedbackText,
      timestamp: new Date().toISOString(),
    };
  
    // Update the versions array. If versions is undefined, default to an empty array.
    const updatedVersions = Array.isArray(versions) ? [...versions, newVersion] : [newVersion];
  
    // Calculate the new current version index.
    const newCurrentVersion = updatedVersions.length - 1;
  
    // Update the global state for versions and currentVersion.
    setVersions(updatedVersions);
    setCurrentVersion(newCurrentVersion);
  
    // Update the selectedBlog object with the new content,
    // along with the updated versions array and currentVersion.
    setSelectedBlog((oldBlog: BlogType | null) => {
      if (!oldBlog) return null;
      return {
        ...oldBlog,
        content: newContent,
        versions: updatedVersions,
        currentVersion: newCurrentVersion,
      };
    });
  
    toast.success("Refined content added!");
  };
  

  const handleSave = async (saveName: string) => {
    if (!selectedBlog) {
      toast.error("No blog selected to save");
      return;
    }
    
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
    setSaveTitle(topic || "Untitled Blog"); // pre-populate with current title or default
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

  // In your GenerateForm component:
  const handleApplySuggestion = async (suggestion: string) => {
    if (!selectedBlog) return;
    try {
      // Call the refine API with current content and feedback.
      const res = await fetch("/api/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: selectedBlog.content,
          feedback: suggestion,
        }),
      });
      const data = await res.json();
      const refinedContent = data.refinedContent;
      
      // Wrap the refined content in a highlight span.
      // Prepending refined content ("on top") means putting it before the current content.
      const newContent =
        `<span class="bg-yellow-300">${refinedContent}</span>` + selectedBlog.content;
      
      // Create a new version object with the new content.
      const newVersion = { content: newContent, timestamp: new Date().toISOString() };
      // Ensure your versions array is defined.
      const currentVersions = Array.isArray(versions) ? versions : [];
      const newVersions = [...currentVersions, newVersion];
      
      // Update state: versions, currentVersion, and selectedBlog.
      setVersions(newVersions);
      setCurrentVersion(newVersions.length - 1);
      setSelectedBlog((prev: BlogType | null) => {
        if (!prev) return null;
        return {
          ...prev,
          content: newContent,
          versions: newVersions,
          currentVersion: newVersions.length - 1,
        };
      });
      
      // Call handleRefine if needed to force the editor to update.
      handleRefine(refinedContent);
      
      toast.success("Feedback applied and content updated.");
    } catch (error) {
      console.error("Feedback application error:", error);
      toast.error("Feedback application failed.");
    }
  };
  
  
  

  // Then, in your modal handlers:
  const handleSuggestionChoiceNewVersion = () => {
    // User chooses to treat the refined content as a new version.
    setSelectedBlog((prev: BlogType | null) => {
      if (!prev) return null;
      return {
        ...prev,
        content: _tempRefinedContent,
        versions: [...(prev.versions || []), { content: _tempRefinedContent, timestamp: new Date().toISOString() }],
        currentVersion: prev.versions?.length || 0, // handle undefined
      };
    });
    addVersion(_tempRefinedContent, `Feedback applied: ${pendingSuggestion}`);
    toast.success("Suggestion applied as a new version");
    setShowSuggestionModal(false);
    setPendingSuggestion(null);
  };

  const handleSuggestionChoiceAppend = () => {
    if (!selectedBlog) {
      toast.error("No blog selected");
      return;
    }
    if (!_tempRefinedContent) {
      toast.error("No refined content available");
      return;
    }
    // Append the refined content to the current content.
    const newContent = selectedBlog.content + _tempRefinedContent;
    
    // Create a new version object.
    const newVersion = { content: newContent, timestamp: new Date().toISOString() };
    
    // Ensure versions is an array (default to an empty array if not).
    const currentVersions = Array.isArray(versions) ? versions : [];
    const newVersions = [...currentVersions, newVersion];
    
    // Update state: versions, currentVersion, and selectedBlog.
    setVersions(newVersions);
    setCurrentVersion(newVersions.length - 1);
    setSelectedBlog((prev: BlogType | null) => {
      if (!prev) return null;
      return {
        ...prev,
        content: newContent,
        versions: newVersions,
        currentVersion: newVersions.length - 1,
      };
    });
    
    // Force editor update if needed.
    handleRefine(_tempRefinedContent);
    
    toast.success("Suggestion appended to current content");
    setShowSuggestionModal(false);
    setPendingSuggestion(null);
  };
  
  
  
  
  
  
  
  
  

  const handleAcceptSuggestion = () => {
    setPendingSuggestion(null);
    toast.success("Suggestion accepted.");
  };

  const handleCancelSuggestion = () => {
    if (selectedBlog) {
      handleRefine(_originalContent);
    }
    setPendingSuggestion(null);
    toast.error("Suggestion canceled.");
  };

  const handleVersionChange = async (versionIndex: number) => {
    setCurrentVersion(versionIndex);
    setSelectedBlog((prev: BlogType | null) => {
      if (!prev) return null;
      return {
        ...prev,
        content: versions[versionIndex].content,
        currentVersion: versionIndex
      };
    });

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
    // Check if selectedBlog._id is a valid ObjectId (24 hex characters)
    const isSavedBlog =
      selectedBlog?._id && /^[0-9a-fA-F]{24}$/.test(selectedBlog._id);
  
    if (!isSavedBlog) {
      // Temporary blog: update versions locally.
      const currentVersions = Array.isArray(versions) ? [...versions] : [];
      if (versionIndex < 0 || versionIndex >= currentVersions.length) {
        toast.error("Invalid version index");
        return;
      }
      if (currentVersions.length === 1) {
        toast.error("Cannot delete the only version");
        return;
      }
      currentVersions.splice(versionIndex, 1);
      const newCurrentVersion = Math.min(currentVersion, currentVersions.length - 1);
      setVersions(currentVersions);
      setCurrentVersion(newCurrentVersion);
      setSelectedBlog((prev: BlogType | null) => {
        if (!prev) return null;
        return {
          ...prev,
          versions: currentVersions,
          currentVersion: newCurrentVersion,
          content: currentVersions[newCurrentVersion].content,
        };
      });
      toast.success("Version deleted locally");
      return;
    }
  
    // For saved blogs, call the API deletion endpoint
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
          title: topic || finalTopic,
        }),
      });
      
      if (!res.ok) {
        throw new Error("API returned non-OK status");
      }
      
      const data = await res.json();
      const htmlContent = await marked.parse(data.content);
      
      const newVersion = { content: htmlContent, timestamp: new Date().toISOString() };
      // Ensure versions is always an array
      const newVersions = [...(Array.isArray(versions) ? versions : []), newVersion];
      
      setVersions(newVersions);
      setCurrentVersion(newVersions.length - 1);
      setSelectedBlog((prev: BlogType | null) => {
        if (!prev) return null;
        return {
          ...prev,
          content: htmlContent,
          versions: newVersions,
          currentVersion: newVersions.length - 1,
        };
      });
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
      <div className="pl-4 bg-transparent">
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
  
        <div className="bg-gray-200 rounded-lg shadow p-6">
          <div className="mb-4">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-4"
            >
              <div className="relative">
                <input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Enter blog topic..."
                  className="search-input w-full p-4 pr-20 rounded-lg focus:outline-none text-black"
                />
                <button
                  onClick={() => handleGenerate()}
                  disabled={isGenerating}
                  className="
                    absolute
                    right-2
                    top-1/2
                    -translate-y-1/2
                    px-6
                    py-2
                    rounded-md
                    bg-[#964734]
                    text-white
                    hover:bg-green-600
                    disabled:opacity-50
                  "
                >
                  {isGenerating ? "Generating..." : "Generate"}
                </button>
              </div>
              {(promptSuggestions.length > 0 || isFetchingSuggestions) && (
                <div className="mt-2">
                  {isFetchingSuggestions ? (
                    <div className="text-sm text-black">Loading suggestions...</div>
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
              <div className="h-1"></div>
              <div className="border-b border-teal-800 my-4"></div>
              <div className="h-1"></div>
              {/* <h1 className="text-3xl font-bold mb-4">{selectedBlog.title}</h1> */}
              <BlogEditor
                key={selectedBlog._id}
                initialContent={selectedBlog.content}
                contentProp={selectedBlog.content}
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
            <div className="text-center text-gray-200 py-10">
              No blog selected. Generate a new blog to begin.
            </div>
          )}
        </div>
      </div>
  
      {/* RIGHT COLUMN: Sidebar */}
      <div className="bg-transparent p-4 relative">
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
      {showSuggestionModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg max-w-md">
            <h2 className="mb-4 text-lg font-semibold">Apply Suggestion</h2>
            <p className="mb-4">How would you like to apply the suggested refinement?</p>
            <div className="flex gap-4">
              <button
                onClick={handleSuggestionChoiceNewVersion}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded"
              >
                New Version
              </button>
              <button
                onClick={handleSuggestionChoiceAppend}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded"
              >
                Append to Current
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
