"use client";

import { useState } from "react";
// Lucide Icons
import { ChevronRight } from "lucide-react";

export default function SidebarToggle() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    const sidebar = document.getElementById("control-sidebar");
    if (sidebar) {
      // Toggle the "collapsed" class (or any class you use to hide/show)
      sidebar.classList.toggle("collapsed");
      setIsCollapsed(!isCollapsed);
    }
  };

  return (
    <button
      id="sidebar-toggle"
      // Removed transition classes: no "transition-all duration-300 ease-in-out"
      className="absolute -left-6 top-4 z-50 p-2 bg-white border rounded-full shadow-lg cursor-pointer hover:bg-gray-100"
      onClick={toggleSidebar}
    >
      {/* Always show ChevronRight (points outward to the right) */}
      <ChevronRight size={20} />
    </button>
  );
}

