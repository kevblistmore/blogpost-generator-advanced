// src/app/components/Sidebar.tsx
"use client";

import { useState } from "react";
import LeftPanel from "./LeftPanel";
import NestedPanel from "./NestedPanel";
import { Editor } from "@tiptap/core";
import { MessageCircle, Lightbulb, Wrench } from "lucide-react";

interface SidebarProps {
  editor?: Editor;
  currentContent: string;
  onRefine: (newContent: string) => void;
  onSuggestionSelect: (suggestion: string) => Promise<void>;
}

export default function Sidebar({
  editor,
  currentContent,
  onRefine,
  onSuggestionSelect,
}: SidebarProps) {
  const [nestedPanelType, setNestedPanelType] = useState<
    "feedback" | "highlights" | "suggestions" | null
  >(null);

  // Instead of adding "currentContent" + refined,
  // just trust that the refined already includes everything needed.
  const handleAppendRefine = (refined: string) => {
    // Use the refined content directly:
    const newContent = refined;

    // Update the tiptap editor content
    if (editor) {
      editor.commands.setContent(newContent);
    }

    // Let the parent know so it can update its state
    onRefine(newContent);
  };

  return (
    <>
      <aside
        id="control-sidebar"
        className="panel-medium-teal shadow-2xl rounded-l-2xl p-4 overflow-y-auto h-full w-full"
        aria-label="Control Sidebar"
      >
        <div className="flex flex-col gap-4">
          {/* Feedback Button */}
          <button
            onClick={() => setNestedPanelType("feedback")}
            className="flex items-center gap-2 px-4 py-2 bg-[#3A0B0B] text-white rounded-md hover:bg-blue-600"
          >
            <MessageCircle size={18} />
            <span>Feedback</span>
          </button>
          
          {/* Key Highlights Button */}
          <button
            onClick={() => setNestedPanelType("highlights")}
            className="flex items-center gap-2 px-4 py-2 bg-[#A45B3D] text-white rounded-md hover:bg-green-600"
          >
            <Lightbulb size={18} />
            <span>Key Highlights</span>
          </button>

          {/* Suggestions Button */}
          <button
            onClick={() => setNestedPanelType("suggestions")}
            className="flex items-center gap-2 px-4 py-2 bg-[#d99767] text-white rounded-md hover:bg-purple-600"
          >
            <Wrench size={18} />
            <span>Suggestions</span>
          </button>
        </div>
      </aside>
      {nestedPanelType && (
        <NestedPanel
          type={nestedPanelType}
          currentContent={currentContent}
          onRefine={onRefine}
          onClose={() => setNestedPanelType(null)}
          onSuggestionSelect={onSuggestionSelect}
          onAppendRefine={handleAppendRefine}
        />
      )}
    </>
  );
}
