// src/app/components/NestedPanel.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

interface NestedPanelProps {
  type: "feedback" | "highlights" | "suggestions";
  currentContent: string;
  onRefine?: (newContent: string) => void;
  onClose: () => void;
  onSuggestionSelect?: (suggestion: string) => Promise<void>;
  onAppendRefine?: (refined: string) => void;
}

export default function NestedPanel({
  type,
  currentContent,
  onClose,
  onSuggestionSelect,
  onAppendRefine,
}: NestedPanelProps) {
  const [feedbackText, setFeedbackText] = useState("");
  const [highlights, setHighlights] = useState<{ keywords: string[]; phrases: string[]; summary: string[] } | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchHighlights = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/highlights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: currentContent }),
      });
      const data = await res.json();
      if (data?.highlights) {
        setHighlights(data.highlights);
      } else {
        setHighlights(null);
      }
    } catch {
      toast.error("Failed to fetch highlights");
    } finally {
      setIsLoading(false);
    }
  }, [currentContent]);

  const fetchSuggestions = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/suggestions-improvements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: currentContent }),
      });
      const data = await res.json();
      if (data?.suggestions) {
        setSuggestions(data.suggestions);
      } else {
        setSuggestions([]);
      }
    } catch {
      toast.error("Failed to fetch suggestions");
    } finally {
      setIsLoading(false);
    }
  }, [currentContent]);

  useEffect(() => {
    if (type === "highlights") {
      fetchHighlights();
    } else if (type === "suggestions") {
      fetchSuggestions();
    }
  }, [type, fetchHighlights, fetchSuggestions]);

  const applySuggestion = async (suggestion: string) => {
    if (onSuggestionSelect) {
      toast.loading("Applying suggestion...");
      await onSuggestionSelect(suggestion);
      toast.dismiss();
      toast.success("Suggestion applied! Please confirm or cancel.");
    }
  };

  const handleFeedbackSubmission = async () => {
    if (!feedbackText.trim()) {
      toast.error("Please enter feedback");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: currentContent,
          feedback: feedbackText,
        }),
      });
      const data = await res.json();
      const refinedContent = data?.refinedContent || "";

      // Highlight the incoming refined text
      const highlightedRefinement = `<div style="background: yellow; padding: 8px;">${refinedContent}</div>`;
      
      // Append it directly to the existing content (via onAppendRefine)
      if (onAppendRefine) {
        onAppendRefine(highlightedRefinement);
        toast.success("Refined content added to your blog!");
      }

      // Optionally, close the panel
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Refinement failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.aside
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        className="absolute left-full top-0 z-50 w-64 h-full bg-white shadow-2xl rounded-l-2xl p-4 overflow-y-auto transition-all duration-300 ease-in-out"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold capitalize text-black">{type}</h2>
          <button onClick={onClose} className="text-gray-600">Close</button>
        </div>

        {type === "feedback" && (
          <div className="text-black">
            <textarea
              className="w-full h-24 p-2 border rounded-md"
              placeholder="Enter your feedback..."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={handleFeedbackSubmission}
                className="px-3 py-1 bg-blue-600 text-white rounded"
                disabled={isLoading}
              >
                {isLoading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        )}

        {type === "highlights" && (
          <div className="text-black">
            {isLoading ? (
              <p>Loading...</p>
            ) : highlights ? (
              <div className="space-y-2">
                <div>
                  <strong>Keywords:</strong>
                  <ul className="list-disc pl-5">
                    {highlights.keywords.map((kw, i) => (
                      <li key={i}>{kw}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <strong>Important Phrases:</strong>
                  <ul className="list-disc pl-5">
                    {highlights.phrases.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <strong>Summary Points:</strong>
                  <ul className="list-disc pl-5">
                    {highlights.summary.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <p>No highlights found.</p>
            )}
          </div>
        )}

        {type === "suggestions" && (
          <div className="text-black">
            {isLoading ? (
              <p>Loading...</p>
            ) : suggestions.length > 0 ? (
              <ul className="list-disc pl-5">
                {suggestions.map((sug, i) => (
                  <li key={i} className="cursor-pointer hover:underline" onClick={() => applySuggestion(sug)}>
                    {sug}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No suggestions available.</p>
            )}
          </div>
        )}
      </motion.aside>
    </AnimatePresence>
  );
}
