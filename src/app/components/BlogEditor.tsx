// // components/BlogEditor.tsx
'use client';
import { useEffect, useState } from 'react';
import { EditorContent, useEditor, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import EditorToolbar from './EditorToolbar';
import Image from '@tiptap/extension-image';
import { fetchSuggestedImages } from '../lib/image-api';

interface BlogEditorProps {
  initialContent?: string;
  onSave?: (content: string) => void;
  onRegenerate?: () => void;
  onDelete?: () => void;
  viewMode?: boolean;
  onViewModeChange: (mode: boolean) => void;
  topic?: string;
}

export default function BlogEditor({
  initialContent = '',
  onSave,
  onRegenerate,
  onDelete,
  viewMode = false,
  onViewModeChange,
  topic = ''
}: BlogEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [suggestedImages, setSuggestedImages] = useState<string[]>([]);

  const editor: Editor | null = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Start writing...' }),
      Image.configure({ inline: true })
    ],
    content,
    editable: !viewMode,
    editorProps: {
      attributes: {
        class: viewMode
          ? 'prose max-w-none p-4'
          : 'prose max-w-none p-4 focus:outline-none min-h-[500px]'
      }
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setContent(html);
    },
  });

  // Update editor content if initialContent changes
  useEffect(() => {
    if (editor && initialContent) {
      editor.commands.setContent(initialContent);
      setContent(initialContent);
    }
  }, [initialContent, editor]);

  // Load suggested images based on the topic
  useEffect(() => {
    if (topic) {
      const loadImages = async () => {
        const images = await fetchSuggestedImages(topic);
        setSuggestedImages(images);
      };
      loadImages();
    }
  }, [topic]);

  return (
    <div className="border rounded-lg shadow-sm bg-white">
      {/* When not in view mode, show the toolbar with formatting buttons and image suggestions */}
      {!viewMode && (
        <EditorToolbar
          editor={editor}
          onSave={() => onSave?.(content)}
          onRegenerate={onRegenerate}
          suggestedImages={suggestedImages}
        />
      )}

      <EditorContent editor={editor} />

      {/* When in view mode, show Edit and Delete buttons */}
      {viewMode && (
        <div className="p-4 border-t flex gap-4">
          <button
            onClick={() => onViewModeChange(false)}
            className="text-blue-600 hover:underline"
          >
            Edit Post
          </button>
          <button
            onClick={onDelete}
            className="text-red-600 hover:underline"
          >
            Delete Post
          </button>
        </div>
      )}
    </div>
  );
}

// 'use client';
// import { useEffect, useState } from 'react';
// import { EditorContent, useEditor } from '@tiptap/react';
// import StarterKit from '@tiptap/starter-kit';
// import Placeholder from '@tiptap/extension-placeholder';
// import Toolbar from './EditorToolbar';
// import Image from '@tiptap/extension-image';
// import { fetchSuggestedImages } from '../lib/image-api';

// interface BlogEditorProps {
//   initialContent?: string;
//   onSave?: (content: string) => void;
//   onRegenerate?: () => void;
//   onDelete?: () => void;
//   viewMode?: boolean;
//   onViewModeChange: (mode: boolean) => void;
//   topic?: string;
// }

// export default function BlogEditor({
//   initialContent = '',
//   onSave,
//   onRegenerate,
//   onDelete,
//   viewMode = false,
//   onViewModeChange,
//   topic = ''
// }: BlogEditorProps) {
//   const [content, setContent] = useState(initialContent);
//   const [suggestedImages, setSuggestedImages] = useState<string[]>([]);

//   const editor = useEditor({
//     extensions: [
//       StarterKit,
//       Placeholder.configure({ placeholder: 'Start writing...' }),
//       Image.configure({ inline: true })
//     ],
//     content,
//     editable: !viewMode,
//     editorProps: {
//       attributes: {
//         class: viewMode
//           ? 'prose max-w-none p-4'
//           : 'prose max-w-none p-4 focus:outline-none min-h-[500px]'
//       }
//     },
//     onUpdate: ({ editor }) => {
//       const html = editor.getHTML();
//       setContent(html);
//     },
//   });

//   // Update editor content when initialContent changes (from saved or history selection)
//   useEffect(() => {
//     if (editor && initialContent) {
//       editor.commands.setContent(initialContent);
//       setContent(initialContent);
//     }
//   }, [initialContent, editor]);

//   // Load suggested images based on the topic.
//   useEffect(() => {
//     const loadImages = async () => {
//       if (topic) {
//         const images = await fetchSuggestedImages(topic);
//         setSuggestedImages(images);
//       }
//     };
//     loadImages();
//   }, [topic]);

//   return (
//     <div className="border rounded-lg shadow-sm bg-white">
//       {/* When not in view mode, show the toolbar with formatting buttons and image suggestions */}
//       {!viewMode && (
//         <Toolbar 
//           editor={editor} 
//           onSave={() => onSave?.(content)}
//           onRegenerate={onRegenerate}
//           suggestedImages={suggestedImages}
//         />
//       )}

//       <EditorContent editor={editor} />

//       {/* When in view mode, show Edit and Delete buttons */}
//       {viewMode && (
//         <div className="p-4 border-t flex gap-4">
//           <button
//             onClick={() => onViewModeChange(false)}
//             className="text-blue-600 hover:underline"
//           >
//             Edit Post
//           </button>
//           <button
//             onClick={onDelete}
//             className="text-red-600 hover:underline"
//           >
//             Delete Post
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }

// 'use client';
// import { useEffect, useState } from 'react';
// import { EditorContent, useEditor } from '@tiptap/react';
// import StarterKit from '@tiptap/starter-kit';
// import Placeholder from '@tiptap/extension-placeholder';
// import Toolbar from './EditorToolbar';
// import Image from '@tiptap/extension-image';
// import { fetchSuggestedImages } from '../lib/image-api';

// interface BlogEditorProps {
//   initialContent?: string;
//   onSave?: (content: string) => void;
//   onRegenerate?: () => void;
//   onDelete?: () => void;
//   viewMode?: boolean;
//   onViewModeChange: (mode: boolean) => void;
//   topic?: string;
// }

// export default function BlogEditor({
//   initialContent = '',
//   onSave,
//   onRegenerate,
//   onDelete,
//   viewMode = false,
//   topic = ''
// }: BlogEditorProps) {
//   const [content, setContent] = useState(initialContent);
//   const [suggestedImages, setSuggestedImages] = useState<string[]>([]);

//   const editor = useEditor({
//     extensions: [
//       StarterKit,
//       Placeholder.configure({ placeholder: 'Start writing...' }),
//       Image.configure({ inline: true })
//     ],
//     content,
//     editable: !viewMode,
//     editorProps: {
//       attributes: {
//         class: viewMode ? 
//           'prose max-w-none p-4' : 
//           'prose max-w-none p-4 focus:outline-none min-h-[500px]'
//       }
//     },
//     onUpdate: ({ editor }) => {
//       const html = editor.getHTML();
//       setContent(html);
//     },
//   });

//   useEffect(() => {
//     const loadImages = async () => {
//       if (topic) {
//         const images = await fetchSuggestedImages(topic);
//         setSuggestedImages(images);
//       }
//     };
//     loadImages();
//   }, [topic]);

//   // ... rest of editor setup

//   return (
//     <div className="border rounded-lg shadow-sm bg-white">
//       {!viewMode && (
//         <Toolbar 
//           editor={editor} 
//           onSave={() => onSave?.(content)}
//           onRegenerate={onRegenerate}
//           suggestedImages={suggestedImages}
//         />
//       )}
      
//       <EditorContent editor={editor} />

//       {viewMode && (
//         <div className="p-4 border-t flex gap-4">
//           <button
//             onClick={() => setViewMode(false)}
//             className="text-blue-600 hover:underline"
//           >
//             Edit Post
//           </button>
//           <button
//             onClick={onDelete}
//             className="text-red-600 hover:underline"
//           >
//             Delete Post
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }


//--------------------------------------------------------------

// // components/BlogEditor.tsx

// 'use client';
// import { useEditor, EditorContent } from '@tiptap/react';
// import StarterKit from '@tiptap/starter-kit';
// import Placeholder from '@tiptap/extension-placeholder';
// import { useEffect, useState } from 'react';
// import Toolbar from './EditorToolbar';

// interface BlogEditorProps {
//   initialContent?: string;
//   onContentChange?: (updatedContent: string) => void;
//   onSave?: (content: string) => void;
//   onRegenerate?: () => void;
// }

// export default function BlogEditor({
//   initialContent = '',
//   onContentChange,
//   onSave,
//   onRegenerate,
// }: BlogEditorProps) {
//   const [content, setContent] = useState(initialContent);

//   const editor = useEditor({
//     extensions: [
//       StarterKit,
//       Placeholder.configure({
//         placeholder: 'Start writing your blog post...',
//       }),
//     ],
//     content,
//     editorProps: {
//       attributes: {
//         class: 'prose dark:prose-invert max-w-none focus:outline-none min-h-[400px] p-4',
//       },
//     },
//     onUpdate: ({ editor }) => {
//       const html = editor.getHTML();
//       setContent(html);
//       onContentChange?.(html);
//     },
//   });

//   useEffect(() => {
//     if (editor && initialContent) {
//       editor.commands.setContent(initialContent);
//       setContent(initialContent);
//     }
//   }, [initialContent, editor]);

//   return (
//     <div className="border rounded-lg shadow-sm bg-white">
//       <Toolbar editor={editor} onSave={() => onSave?.(content)} onRegenerate={onRegenerate} />
//       <EditorContent editor={editor} />
//     </div>
//   );
// }

