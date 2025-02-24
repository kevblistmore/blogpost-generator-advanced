//src/app/components/EditorToolbar.tsx

'use client';
import { cn } from '../lib/utils';
import { Editor } from '@tiptap/react';
import { Paperclip } from 'lucide-react';
import { useState } from "react";

interface EditorToolbarProps {
  editor: any;
  suggestedImages: string[];
  onSave?: () => void;
  onRegenerate?: () => void;
  onImageSelect: (src: string) => void;
  versions?: { content: string; prompt: string; timestamp: string }[];
  onVersionSelect?: (versionContent: string) => void;
}

export default function EditorToolbar({
  editor,
  suggestedImages,
  onSave,
  onRegenerate,
  onImageSelect,
  versions,
  onVersionSelect,
}: EditorToolbarProps) {
  const [showVersions, _setShowVersions] = useState(false);
  if (!editor) return null;

  // Insert Image at Cursor Position
  const insertImage = (url: string) => {
    editor.chain().focus().insertContent(<img src="${url}" alt="Uploaded Image" />).run();
  };

  // Handle Image Upload (Supports Multiple Images)
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          insertImage(reader.result); // Insert as base64
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Formatting Buttons (H2, Bold, Italic, List)
  const buttons = [
    {
      onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      active: editor.isActive('heading', { level: 2 }),
      label: 'H2',
    },
    {
      onClick: () => editor.chain().focus().toggleBold().run(),
      active: editor.isActive('bold'),
      label: 'Bold',
    },
    {
      onClick: () => editor.chain().focus().toggleItalic().run(),
      active: editor.isActive('italic'),
      label: 'Italic',
    },
    {
      onClick: () => editor.chain().focus().toggleBulletList().run(),
      active: editor.isActive('bulletList'),
      label: 'List',
    },
  ];

  return (
    <div className="border-b p-2 bg-gray-200 space-y-4">
      {/* Formatting Buttons */}
      <div className="flex flex-wrap gap-2">
        {buttons.map((btn, index) => (
          <button
            key={index}
            onClick={btn.onClick}
            className={cn(
              'px-3 py-1 text-sm rounded-md transition-colors',
              btn.active ? 'bg-black-100 text-blue-600' : 'bg-gray-100 hover:bg-gray-200'
            )}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Suggested Images */}
      {suggestedImages.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-gray-600">Suggested Images:</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {suggestedImages.map((img, index) => (
              <button
                key={index}
                onClick={() => onImageSelect(img)}
                className="flex-shrink-0"
              >
                <img
                  src={img}
                  className="h-16 w-16 object-cover rounded-lg border hover:opacity-75"
                  alt="Insert"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Upload Icon for Adding Images */}
      <label className="flex items-center gap-2 cursor-pointer px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
        <Paperclip size={20} />
        <span>Add Images</span>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          className="hidden"
        />
      </label>
      {showVersions && (
        <div className="mt-2 border-t pt-2">
          <h4 className="font-semibold">Revision History</h4>
          {versions && versions.length > 0 ? (
            <div className="border-b p-2 bg-gray-200 version-toggle">
              <ul className="list-disc pl-5">
                {versions.map((version, idx) => (
                  <li 
                    key={idx} 
                    onClick={() => onVersionSelect?.(version.content)}
                    className="cursor-pointer hover:bg-gray-100 p-2 rounded-md"
                    >
                    <div className="flex items-center gap-2">
                    <span className="font-medium">Version {idx + 1}</span>
                    <span className="text-xs text-gray-200">
                      {new Date(version.timestamp).toLocaleTimeString()}
                    </span>
                    </div>
                    <div className="text-xs text-gray-200 truncate">
                      {version.prompt}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-gray-200">No revisions available.</p>
          )}
        </div>
      )}
      {/* Action Buttons */}
      <div className="flex gap-2 border-t pt-2">
        <button
          onClick={() => onRegenerate?.()}
          className="flex-1 px-3 py-1.5 text-sm rounded-md bg-teal-800 text-gray-200 hover:bg-green-200"
        >
          Regenerate
        </button>
        <button
          onClick={onSave}
          className="flex-1 px-3 py-1.5 text-sm rounded-md bg-teal-600 text-gray-200 hover:bg-blue-200"
        >
          Save
        </button>
        <button
          onClick={() => navigator.clipboard.writeText(editor.getHTML())}
          className="flex-1 px-3 py-1.5 text-sm rounded-md bg-teal-400 hover:bg-gray-200"
        >
          📋 Copy
        </button>
      </div>
    </div>
  );
}