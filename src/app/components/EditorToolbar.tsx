// components/EditorToolbar.tsx
'use client';
import { Editor } from '@tiptap/react';
import { cn } from '../lib/utils';

export default function Toolbar({
  editor,
  onSave,
  onRegenerate,
}: {
  editor: Editor | null;
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
    <div className="flex flex-wrap items-center gap-2 p-2 border-b bg-gray-50 rounded-t-lg">
      {buttons.map((btn, index) => (
        <button
          key={index}
          onClick={btn.onClick}
          className={cn(
            'px-3 py-1 text-sm rounded-md transition-colors',
            btn.active ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
          )}
        >
          {btn.label}
        </button>
      ))}
      <div className="flex-1" />
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
    </div>
  );
}