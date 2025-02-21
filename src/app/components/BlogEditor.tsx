// // // // // components/BlogEditor.tsx
// components/BlogEditor.tsx
'use client';
import { useEffect, useState } from 'react';
import { EditorContent, useEditor, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import EditorToolbar from './EditorToolbar';
import Image from '@tiptap/extension-image';
import { fetchSuggestedImages } from '../lib/image-api';
import { motion, AnimatePresence } from 'framer-motion'; // Added AnimatePresence
import FeedbackButtons from './FeedBackButtons';

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
  topic = '',
}: BlogEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [suggestedImages, setSuggestedImages] = useState<string[]>([]);
  
  // NEW: track which image is currently open in a modal
  const [selectedModalImage, setSelectedModalImage] = useState<string | null>(null);

  const editor: Editor | null = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start writing your blog post (use paragraphs, headings, etc.)...',
      }),
      Image.configure({
        inline: false,
        HTMLAttributes: {
          class: 'mx-auto my-4 max-w-full rounded-lg cursor-pointer border shadow-sm',
        },
      }),
    ],
    content,
    editable: !viewMode,
    // We add handleClickOn to detect image clicks
    editorProps: {
      handleClickOn: (view, pos, node, nodePos, event, direct) => {
        // If the clicked node is an image, open the modal
        if (node.type.name === 'image') {
          setSelectedModalImage(node.attrs.src);
          return true; // prevent other click handlers from running
        }
        return false;
      },
      attributes: {
        class: viewMode
          ? 'prose max-w-none p-4'
          : 'prose max-w-none p-4 focus:outline-none min-h-[500px]',
      },
    },
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && initialContent) {
      editor.commands.setContent(initialContent);
      setContent(initialContent);
    }
  }, [initialContent, editor]);

  useEffect(() => {
    const loadImages = async () => {
      if (topic) {
        const images = await fetchSuggestedImages(topic);
        setSuggestedImages(images);
      }
    };
    loadImages();
  }, [topic]);

  return (
    <>
      <div className="border rounded-lg shadow-sm bg-white">
        {!viewMode && (
          <EditorToolbar
            editor={editor}
            onSave={() => onSave?.(content)}
            onRegenerate={onRegenerate}
            suggestedImages={suggestedImages}
          />
        )}

        {/* Wrap EditorContent in a container that uses the "prose" class */}
        <motion.div
          className="p-4 prose"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="p-4 prose">
            <EditorContent editor={editor} />
          </div>
        </motion.div>

        {viewMode && (
          <div className="p-4 border-t flex justify-between items-center">
            <div className="flex gap-4">
              <button
                onClick={() => onViewModeChange(false)}
                className="text-blue-600 hover:underline"
              >
                Edit Post
              </button>
              <button onClick={onDelete} className="text-red-600 hover:underline">
                Delete Post
              </button>
            </div>
            <FeedbackButtons content={content} />
          </div>
        )}
      </div>

      {/* 
        -------------------------------------------------------------------
          Modal / Lightbox for showing the clicked image in a larger view
        -------------------------------------------------------------------
      */}
      <AnimatePresence>
        {selectedModalImage && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedModalImage(null)} // close on background click
          >
            <motion.img
              src={selectedModalImage}
              alt="Expanded"
              className="max-w-3xl max-h-[90vh] rounded-lg"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}


// 'use client';
// import { useEffect, useState } from 'react';
// import { EditorContent, useEditor, Editor } from '@tiptap/react';
// import StarterKit from '@tiptap/starter-kit';
// import Placeholder from '@tiptap/extension-placeholder';
// import EditorToolbar from './EditorToolbar';
// import Image from '@tiptap/extension-image';
// import { fetchSuggestedImages } from '../lib/image-api';
// import { motion } from 'framer-motion';
// import FeedbackButtons from './FeedBackButtons';

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

//   const editor: Editor | null = useEditor({
//     extensions: [
//       StarterKit,
//       Placeholder.configure({ placeholder: 'Start writing your blog post (use paragraphs, headings, etc.)...' }),
//       Image.configure({
//         inline: true,
//         HTMLAttributes: { class: 'float-right ml-4 max-w-full md:max-w-sm mb-4' }
//       }),
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
//       setContent(editor.getHTML());
//     },
//   });

//   useEffect(() => {
//     if (editor && initialContent) {
//       editor.commands.setContent(initialContent);
//       setContent(initialContent);
//     }
//   }, [initialContent, editor]);

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
//       {!viewMode && (
//         <EditorToolbar
//           editor={editor}
//           onSave={() => onSave?.(content)}
//           onRegenerate={onRegenerate}
//           suggestedImages={suggestedImages}
//         />
//       )}

//       {/* Wrap EditorContent in a container that uses the "prose" class */}
//       <motion.div
//         className="p-4 prose"
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//       >
//         <div className="p-4 prose">
//           <EditorContent editor={editor} />
//         </div>
//       </motion.div>

//       {viewMode && (
//         <div className="p-4 border-t flex justify-between items-center">
//           <div className="flex gap-4">
//             <button
//               onClick={() => onViewModeChange(false)}
//               className="text-blue-600 hover:underline"
//             >
//               Edit Post
//             </button>
//             <button
//               onClick={onDelete}
//               className="text-red-600 hover:underline"
//             >
//               Delete Post
//             </button>
//           </div>
//           <FeedbackButtons content={content} />
//         </div>
//       )}
//     </div>
//   );
// }

