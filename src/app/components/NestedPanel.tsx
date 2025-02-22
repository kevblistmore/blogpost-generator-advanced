// src/app/components/NestedPanel.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

interface NestedPanelProps {
  type: "feedback" | "highlights" | "suggestions";
  currentContent: string;
  onRefine: (newContent: string) => void;
  onClose: () => void;
  onSuggestionSelect?: (suggestion: string) => void;
}

export default function NestedPanel({ type, currentContent, onRefine, onClose, onSuggestionSelect }: NestedPanelProps) {
  const [feedbackText, setFeedbackText] = useState("");
  const [highlights, setHighlights] = useState<{ keywords: string[]; phrases: string[]; summary: string[] } | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (type === "highlights") {
      fetchHighlights();
    } else if (type === "suggestions") {
      fetchSuggestions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const fetchHighlights = async () => {
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
    } catch (error) {
      toast.error("Failed to fetch highlights");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSuggestions = async () => {
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
    } catch (error) {
      toast.error("Failed to fetch suggestions");
    } finally {
      setIsLoading(false);
    }
  };

  const applySuggestion = (suggestion: string) => {
    if (onSuggestionSelect) {
      toast.loading("Applying suggestion...");
      onSuggestionSelect(suggestion);
      toast.dismiss();
      toast.success("Suggestion applied! Please confirm or cancel.");
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
          <h2 className="text-lg font-bold capitalize">{type}</h2>
          <button onClick={onClose} className="text-gray-600">Close</button>
        </div>
        {type === "feedback" && (
          <div>
            <textarea
              className="w-full h-24 p-2 border rounded-md"
              placeholder="Enter your feedback..."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={async () => {
                  if (!feedbackText.trim()) {
                    toast.error("Please enter feedback");
                    return;
                  }
                  setIsLoading(true);
                  try {
                    const res = await fetch("/api/refine", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ content: currentContent, feedback: feedbackText }),
                    });
                    const data = await res.json();
                    if (data?.refinedContent) {
                      onRefine(data.refinedContent);
                      toast.success("Content refined successfully!");
                      onClose();
                    } else {
                      throw new Error("No refined content received");
                    }
                  } catch (error) {
                    toast.error("Refinement failed");
                  } finally {
                    setIsLoading(false);
                  }
                }}
                className="px-3 py-1 bg-blue-600 text-white rounded"
                disabled={isLoading}
              >
                {isLoading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        )}
        {type === "highlights" && (
          <div>
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
          <div>
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

// // src/app/components/NestedPanel.tsx
// "use client";

// import { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { toast } from "react-hot-toast";

// interface NestedPanelProps {
//   type: "feedback" | "highlights" | "suggestions";
//   currentContent: string;
//   onClose: () => void;
//   onRefine: (newContent: string) => void;
// }

// export default function NestedPanel({ type, currentContent, onClose, onRefine }: NestedPanelProps) {
//   const [feedbackText, setFeedbackText] = useState("");
//   const [highlights, setHighlights] = useState<{ keywords: string[]; phrases: string[]; summary: string[] } | null>(null);
//   const [suggestions, setSuggestions] = useState<string[]>([]);
//   const [isLoading, setIsLoading] = useState(false);

//   // Fetch data on mount if needed.
//   useEffect(() => {
//     if (type === "highlights") {
//       fetchHighlights();
//     } else if (type === "suggestions") {
//       fetchSuggestions();
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [type]);

//   const fetchHighlights = async () => {
//     setIsLoading(true);
//     try {
//       const res = await fetch("/api/highlights", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ content: currentContent }),
//       });
//       const data = await res.json();
//       if (data?.highlights) {
//         setHighlights(data.highlights);
//       } else {
//         setHighlights(null);
//       }
//     } catch (error) {
//       toast.error("Failed to fetch highlights");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const fetchSuggestions = async () => {
//     setIsLoading(true);
//     try {
//       const res = await fetch("/api/suggestions-improvements", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ content: currentContent }),
//       });
//       const data = await res.json();
//       if (data?.suggestions) {
//         setSuggestions(data.suggestions);
//       } else {
//         setSuggestions([]);
//       }
//     } catch (error) {
//       toast.error("Failed to fetch suggestions");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // For applying a suggestion: append it wrapped in a highlight span, then remove the highlight after 3 seconds.
//   const applySuggestion = (suggestion: string) => {
//     // Append the suggestion with a temporary highlight.
//     const newContent = `${currentContent}\n\n<span id="suggestion-highlight" class="bg-yellow-200">${suggestion}</span>`;
//     onRefine(newContent);
//     toast.success("Suggestion applied!");
//     // After 3 seconds, remove the highlight by replacing the highlighted markup with plain text.
//     setTimeout(() => {
//       const plainContent = `${currentContent}\n\n${suggestion}`;
//       onRefine(plainContent);
//     }, 3000);
//   };

//   return (
//     <AnimatePresence>
//       <motion.aside
//         initial={{ x: "-100%" }}
//         animate={{ x: 0 }}
//         exit={{ x: "-100%" }}
//         className="fixed left-[17rem] top-0 z-50 w-64 h-[86vh] bg-white shadow-2xl rounded-r-2xl p-4 overflow-y-auto transition-all duration-300 ease-in-out"
//       >
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-lg font-bold capitalize">{type}</h2>
//           <button onClick={onClose} className="text-gray-600">Close</button>
//         </div>
//         {type === "feedback" && (
//           <div>
//             <textarea
//               className="w-full h-24 p-2 border rounded-md"
//               placeholder="Enter your feedback..."
//               value={feedbackText}
//               onChange={(e) => setFeedbackText(e.target.value)}
//             />
//             <div className="flex justify-end mt-2">
//               <button
//                 onClick={async () => {
//                   if (!feedbackText.trim()) {
//                     toast.error("Please enter feedback");
//                     return;
//                   }
//                   setIsLoading(true);
//                   try {
//                     const res = await fetch("/api/refine", {
//                       method: "POST",
//                       headers: { "Content-Type": "application/json" },
//                       body: JSON.stringify({ content: currentContent, feedback: feedbackText }),
//                     });
//                     const data = await res.json();
//                     if (data?.refinedContent) {
//                       onRefine(data.refinedContent);
//                       toast.success("Content refined successfully!");
//                       onClose();
//                     } else {
//                       throw new Error("No refined content received");
//                     }
//                   } catch (error) {
//                     toast.error("Refinement failed");
//                   } finally {
//                     setIsLoading(false);
//                   }
//                 }}
//                 className="px-3 py-1 bg-blue-600 text-white rounded"
//                 disabled={isLoading}
//               >
//                 {isLoading ? "Submitting..." : "Submit"}
//               </button>
//             </div>
//           </div>
//         )}
//         {type === "highlights" && (
//           <div>
//             {isLoading ? (
//               <p>Loading...</p>
//             ) : highlights ? (
//               <div className="space-y-2">
//                 <div>
//                   <strong>Keywords:</strong>
//                   <ul className="list-disc pl-5">
//                     {highlights.keywords.map((kw, i) => (
//                       <li key={i}>{kw}</li>
//                     ))}
//                   </ul>
//                 </div>
//                 <div>
//                   <strong>Important Phrases:</strong>
//                   <ul className="list-disc pl-5">
//                     {highlights.phrases.map((p, i) => (
//                       <li key={i}>{p}</li>
//                     ))}
//                   </ul>
//                 </div>
//                 <div>
//                   <strong>Summary Points:</strong>
//                   <ul className="list-disc pl-5">
//                     {highlights.summary.map((s, i) => (
//                       <li key={i}>{s}</li>
//                     ))}
//                   </ul>
//                 </div>
//               </div>
//             ) : (
//               <p>No highlights found.</p>
//             )}
//           </div>
//         )}
//         {type === "suggestions" && (
//           <div>
//             {isLoading ? (
//               <p>Loading...</p>
//             ) : suggestions.length > 0 ? (
//               <ul className="list-disc pl-5">
//                 {suggestions.map((sug, i) => (
//                   <li
//                     key={i}
//                     className="cursor-pointer hover:underline"
//                     onClick={() => applySuggestion(sug)}
//                   >
//                     {sug}
//                   </li>
//                 ))}
//               </ul>
//             ) : (
//               <p>No suggestions available.</p>
//             )}
//           </div>
//         )}
//       </motion.aside>
//     </AnimatePresence>
//   );
// }
