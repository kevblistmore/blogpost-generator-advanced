'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useState } from 'react';

interface BlogEditorProps {
  initialContent?: string;
  onContentChange?: (updatedContent: string) => void;
}

export default function BlogEditor({
  initialContent = '',
  onContentChange,
}: BlogEditorProps) {
  const [content, setContent] = useState(initialContent);

  const editor = useEditor({
    extensions: [StarterKit],
    content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setContent(html);
      if (onContentChange) {
        onContentChange(html);
      }
    },
  });

  // If the initial content changes (e.g., after AI generation), reset the editor content
  useEffect(() => {
    if (editor && initialContent) {
      editor.commands.setContent(initialContent);
      setContent(initialContent);
    }
  }, [initialContent, editor]);

  return (
    <div className="border p-4 rounded-md">
      <div className="mb-2 font-semibold">Rich Text Editor</div>
      <EditorContent editor={editor} />
    </div>
  );
}
