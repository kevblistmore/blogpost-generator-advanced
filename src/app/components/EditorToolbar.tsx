// components/EditorToolbar.tsx
'use client';
import { Editor } from '@tiptap/react';
import { cn } from '../lib/utils';

export default function Toolbar({
  editor,
  suggestedImages,
  onSave,
  onRegenerate
}: {
  editor: Editor;
  suggestedImages: string[];
  onSave?: () => void;
  onRegenerate?: () => void;
}) {
  if (!editor) return null;

  const buttons = [
    {
      onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      active: editor.isActive('heading'),
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
    <div className="border-b p-2 bg-gray-50 space-y-4">
      <div className="flex flex-wrap gap-2">
        {/* Formatting buttons */}
        {buttons.map((btn, index) => (
          <button
            key={index}
            onClick={btn.onClick}
            className={cn(
              'px-3 py-1 text-sm rounded-md transition-colors',
              btn.active ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 hover:bg-gray-200'
            )}
          >
            {btn.label}
          </button>
        ))}

        {/* Action buttons */}
        <button
          onClick={onRegenerate}
          className="px-3 py-1 text-sm rounded-md bg-green-100 text-green-600 hover:bg-green-200"
        >
          Regenerate
        </button>
        <button
          onClick={onSave}
          className="px-3 py-1 text-sm rounded-md bg-blue-100 text-blue-600 hover:bg-blue-200"
        >
          Save
        </button>
        <button
          onClick={() => navigator.clipboard.writeText(editor.getHTML())}
          className="px-3 py-1 text-sm rounded-md bg-gray-100 hover:bg-gray-200"
        >
          📋 Copy
        </button>
      </div>

      {suggestedImages.length > 0 && (
        <div className="pt-2 border-t">
          <p className="text-sm text-gray-600 mb-2">Suggested Images:</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {suggestedImages.map((img, index) => (
              <img
                key={index}
                src={img}
                className="h-20 cursor-pointer rounded hover:opacity-75"
                onClick={() => editor.chain().focus().setImage({ src: img }).run()}
                alt="Suggested"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
