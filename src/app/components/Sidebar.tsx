// src/app/components/Sidebar.tsx
"use client";

import { useState } from "react";
import LeftPanel from "./LeftPanel";
import NestedPanel from "./NestedPanel";
import { Editor } from "@tiptap/core";

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
  const [nestedPanelType, setNestedPanelType] = useState<"feedback" | "highlights" | "suggestions" | null>(null);

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
        className="relative w-full h-full bg-white shadow-2xl rounded-l-2xl p-4 overflow-y-auto"
        aria-label="Control Sidebar"
      >
        <LeftPanel
          currentContent={currentContent}
          onRefine={onRefine}
          onNestedPanelOpen={(panel) => setNestedPanelType(panel)}
        />
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
