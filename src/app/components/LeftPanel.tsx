// src/app/components/LeftPanel.tsx
"use client";

import { MessageCircle, Lightbulb, Wrench } from "lucide-react";

interface LeftPanelProps {
  onNestedPanelOpen: (panel: "feedback" | "highlights" | "suggestions") => void;
}

export default function LeftPanel({ onNestedPanelOpen }: LeftPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={() => onNestedPanelOpen("feedback")}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        <MessageCircle size={18} /> <span>Feedback</span>
      </button>
      <button
        onClick={() => onNestedPanelOpen("highlights")}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
      >
        <Lightbulb size={18} /> <span>Key Highlights</span>
      </button>
      <button
        onClick={() => onNestedPanelOpen("suggestions")}
        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
      >
        <Wrench size={18} /> <span>Suggestions</span>
      </button>
    </div>
  );
}

// // src/app/components/LeftPanel.tsx
// "use client";

// import { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { toast } from "react-hot-toast";
// import { MessageCircle, Lightbulb, Wrench } from "lucide-react"; // Import icons

// interface LeftPanelProps {
//   currentContent: string;
//   onRefine: (newContent: string) => void;
//   onNestedPanelOpen: (panel: "feedback" | "highlights" | "suggestions") => void;
// }

// export default function LeftPanel({ currentContent, onRefine, onNestedPanelOpen }: LeftPanelProps) {
//   // Track which panel is expanded
//   const [expandedPanel, setExpandedPanel] = useState<"feedback" | "highlights" | "suggestions" | null>(null);
//   const [feedbackText, setFeedbackText] = useState("");
//   // For highlights, we now expect a structured object with keywords, phrases, and summary.
//   const [highlights, setHighlights] = useState<{ keywords: string[]; phrases: string[]; summary: string[] } | null>(null);
//   const [suggestions, setSuggestions] = useState<string[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   // For suggestion previews, track which suggestion is expanded (if any)
//   const [expandedSuggestion, setExpandedSuggestion] = useState<number | null>(null);

//   // --- Feedback: Submit feedback to refine content ---
//   const submitFeedback = async () => {
//     if (!feedbackText.trim()) {
//       toast.error("Please enter your feedback");
//       return;
//     }
//     setIsLoading(true);
//     try {
//       const res = await fetch("/api/refine", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           content: currentContent,
//           feedback: feedbackText,
//         }),
//       });
//       const data = await res.json();
//       if (data?.refinedContent) {
//         onRefine(data.refinedContent);
//         toast.success("Content refined successfully!");
//         setExpandedPanel(null);
//         setFeedbackText("");
//       } else {
//         throw new Error("No refined content received");
//       }
//     } catch (error) {
//       toast.error("Refinement failed");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // --- Highlights: Fetch key highlights from the content ---
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

//   // --- Suggestions: Fetch improvement suggestions for the content ---
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

//   // Toggle expansion of a panel
//   const togglePanel = (panel: "feedback" | "highlights" | "suggestions") => {
//     // If clicking an already expanded panel, collapse it.
//     if (expandedPanel === panel) {
//       setExpandedPanel(null);
//     } else {
//       setExpandedPanel(panel);
//       // For highlights and suggestions, fetch data when expanded.
//       if (panel === "highlights") fetchHighlights();
//       if (panel === "suggestions") fetchSuggestions();
//     }
//   };

//   // For suggestions: apply suggestion automatically (simulate by updating content)
//   const applySuggestion = async (suggestion: string) => {
//     // Here you could optionally call an API that applies the suggestion.
//     // For now, we update the content directly.
//     // For a preview expansion, toggle the expandedSuggestion index.
//     onRefine(`${currentContent}\n\n${suggestion}`);
//     toast.success("Suggestion applied!");
//   };

//   return (
//     <div className="flex flex-col gap-4">
//       {/* Feedback Button */}
//       <button
//         onClick={() => onNestedPanelOpen("feedback")}
//         className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
//       >
//         <MessageCircle size={18} /> <span>Feedback</span>
//       </button>
//       {/* Key Highlights Button */}
//       <button
//         onClick={() => onNestedPanelOpen("highlights")}
//         className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
//       >
//         <Lightbulb size={18} /> <span>Key Highlights</span>
//       </button>
//       {/* Suggestions Button */}
//       <button
//         onClick={() => onNestedPanelOpen("suggestions")}
//         className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
//       >
//         <Wrench size={18} /> <span>Suggestions</span>
//       </button>
//     </div>
//   );
// }

// "use client";

// import { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { toast } from "react-hot-toast";

// interface LeftPanelProps {
//   currentContent: string;
//   onRefine: (newContent: string) => void;
// }

// export default function LeftPanel({ currentContent, onRefine }: LeftPanelProps) {
//   const [modalType, setModalType] = useState<"feedback" | "highlights" | "suggestions" | null>(null);
//   const [feedbackText, setFeedbackText] = useState("");
//   const [highlights, setHighlights] = useState<string[]>([]);
//   const [suggestions, setSuggestions] = useState<string[]>([]);
//   const [isLoading, setIsLoading] = useState(false);

//   // --- Feedback: Submit feedback to refine content ---
//   const submitFeedback = async () => {
//     if (!feedbackText.trim()) {
//       toast.error("Please enter your feedback");
//       return;
//     }
//     setIsLoading(true);
//     try {
//       const res = await fetch("/api/refine", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           content: currentContent,
//           feedback: feedbackText,
//         }),
//       });
//       const data = await res.json();
//       if (data?.refinedContent) {
//         onRefine(data.refinedContent);
//         toast.success("Content refined successfully!");
//         setModalType(null);
//         setFeedbackText("");
//       } else {
//         throw new Error("No refined content received");
//       }
//     } catch (error) {
//       toast.error("Refinement failed");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // --- Highlights: Fetch key highlights from the content ---
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
//         setHighlights([]);
//       }
//     } catch (error) {
//       toast.error("Failed to fetch highlights");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // --- Suggestions: Fetch improvement suggestions for the content ---
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

//   const openModal = (type: "feedback" | "highlights" | "suggestions") => {
//     setModalType(type);
//     if (type === "highlights") {
//       fetchHighlights();
//     } else if (type === "suggestions") {
//       fetchSuggestions();
//     }
//   };

//   const closeModal = () => {
//     setModalType(null);
//   };

//   return (
//     <div className="p-4 bg-gray-50 rounded-lg shadow-md">
//       <h2 className="text-lg font-semibold mb-4">Controls</h2>
//       <div className="flex flex-col gap-4">
//         <button
//           onClick={() => openModal("feedback")}
//           className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
//         >
//           Feedback
//         </button>
//         <button
//           onClick={() => openModal("highlights")}
//           className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
//         >
//           Key Highlights
//         </button>
//         <button
//           onClick={() => openModal("suggestions")}
//           className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
//         >
//           Suggestions
//         </button>
//       </div>

//       <AnimatePresence>
//         {modalType && (
//           <motion.div
//             className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             onClick={closeModal}
//           >
//             <motion.div
//               className="bg-white p-6 rounded-lg w-11/12 max-w-md"
//               initial={{ scale: 0.8 }}
//               animate={{ scale: 1 }}
//               exit={{ scale: 0.8 }}
//               onClick={(e) => e.stopPropagation()}
//             >
//               {modalType === "feedback" && (
//                 <>
//                   <h3 className="text-xl font-bold mb-4">Provide Feedback</h3>
//                   <textarea
//                     className="w-full h-32 p-2 border rounded-md mb-4"
//                     placeholder="Enter your feedback..."
//                     value={feedbackText}
//                     onChange={(e) => setFeedbackText(e.target.value)}
//                   />
//                   <div className="flex justify-end gap-2">
//                     <button
//                       onClick={closeModal}
//                       className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
//                     >
//                       Cancel
//                     </button>
//                     <button
//                       onClick={submitFeedback}
//                       className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
//                       disabled={isLoading}
//                     >
//                       {isLoading ? "Submitting..." : "Submit"}
//                     </button>
//                   </div>
//                 </>
//               )}
//               {modalType === "highlights" && (
//                 <>
//                   <h3 className="text-xl font-bold mb-4">Key Highlights</h3>
//                   {isLoading ? (
//                     <p>Loading...</p>
//                   ) : highlights.length > 0 ? (
//                     <ul className="list-disc pl-5">
//                       {highlights.map((hl, index) => (
//                         <li key={index}>{hl}</li>
//                       ))}
//                     </ul>
//                   ) : (
//                     <p>No highlights found.</p>
//                   )}
//                   <div className="flex justify-end mt-4">
//                     <button
//                       onClick={closeModal}
//                       className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
//                     >
//                       Close
//                     </button>
//                   </div>
//                 </>
//               )}
//               {modalType === "suggestions" && (
//                 <>
//                   <h3 className="text-xl font-bold mb-4">Improvement Suggestions</h3>
//                   {isLoading ? (
//                     <p>Loading...</p>
//                   ) : suggestions.length > 0 ? (
//                     <ul className="list-disc pl-5">
//                       {suggestions.map((sug, index) => (
//                         <li key={index}>{sug}</li>
//                       ))}
//                     </ul>
//                   ) : (
//                     <p>No suggestions available.</p>
//                   )}
//                   <div className="flex justify-end mt-4">
//                     <button
//                       onClick={closeModal}
//                       className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
//                     >
//                       Close
//                     </button>
//                   </div>
//                 </>
//               )}
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }
