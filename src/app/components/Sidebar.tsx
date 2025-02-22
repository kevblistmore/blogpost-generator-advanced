// src/app/components/Sidebar.tsx
"use client";

import { useState } from "react";
import LeftPanel from "./LeftPanel";
import NestedPanel from "./NestedPanel";

interface SidebarProps {
  currentContent: string;
  onRefine: (newContent: string) => void;
  onSuggestionSelect: (suggestion: string) => void;
}

export default function Sidebar({ currentContent, onRefine, onSuggestionSelect }: SidebarProps) {
  const [nestedPanelType, setNestedPanelType] = useState<"feedback" | "highlights" | "suggestions" | null>(null);

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
        />
      )}
    </>
  );
}
