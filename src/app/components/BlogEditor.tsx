// //src/app/components/BlogEditor.tsx
"use client";
import { useEffect, useState } from "react";
import { EditorContent, useEditor, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import { NodeSelection } from "@tiptap/pm/state"; 
import { motion, AnimatePresence } from "framer-motion";
import FeedbackButtons from "./FeedBackButtons";
import EditorToolbar from "./EditorToolbar";
import { fetchSuggestedImages } from "../lib/image-api";

interface BlogEditorProps {
  key: any;
  initialContent: string;
  contentProp: string; // new prop
  onSave: (content: string) => Promise<void>;
  onRegenerate: (currentTopic?: string) => Promise<void>;
  onDelete: () => Promise<void>;
  viewMode: boolean;
  onViewModeChange: (mode: boolean) => void;
  topic: string;
  versions: { content: string; timestamp: string }[];
  currentVersion: number;
  onVersionChange: (versionIndex: number) => void;
  onVersionDelete: (versionIndex: number) => void;
  
}

export default function BlogEditor({
  initialContent = "",
  contentProp,
  onSave,
  onRegenerate,
  onDelete,
  viewMode = false,
  onViewModeChange,
  topic = "",
  versions = [],
  currentVersion = 0,
  onVersionChange,
  onVersionDelete,
}: BlogEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [suggestedImages, setSuggestedImages] = useState<string[]>([]);
  const [selectedModalImage, setSelectedModalImage] = useState<{
    src: string;
    pos: number;
  } | null>(null);

  // 1. Initialize Tiptap Editor
  const editor: Editor | null = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Start writing your blog post...",
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class:
            "mx-auto my-4 max-w-full rounded-lg cursor-pointer border shadow-sm",
        },
      }),
    ],
    content:initialContent,
    // Set initial editable state based on viewMode.
    editable: !viewMode,
    editorProps: {
      handleClickOn: (view, pos, node) => {
        if (node.type.name === "image") {
          setSelectedModalImage({ src: node.attrs.src, pos });
          return true;
        }
        return false;
      },
      attributes: {
        class: viewMode
          ? "prose max-w-none p-4"
          : "prose max-w-none p-4 focus:outline-none min-h-[500px]",
      },
    },
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
  });
  // This effect listens for changes in contentProp and updates the editor.
  useEffect(() => {
    if (editor && contentProp) {
      editor.commands.setContent(contentProp);
      setContent(contentProp);
    }
  }, [contentProp, editor]);
  
  // NEW: Update Tiptap's editable state whenever viewMode changes.
  useEffect(() => {
    if (editor) {
      editor.setEditable(!viewMode);
    }
  }, [viewMode, editor]);

  // 2. Load initial content if exists
  useEffect(() => {
    if (editor && initialContent) {
      editor.commands.setContent(initialContent);
      setContent(initialContent);
    }
  }, [initialContent, editor]);

  // 3. Load suggested images
  useEffect(() => {
    const loadImages = async () => {
      if (topic) {
        const images = await fetchSuggestedImages(topic);
        setSuggestedImages(images);
      }
    };
    loadImages();
  }, [topic]);

  
  useEffect(() => {
    if (editor && versions[currentVersion]?.content) {
      editor.commands.setContent(versions[currentVersion].content);
      setContent(versions[currentVersion].content);
    }
  }, [currentVersion, versions, editor]);

  // 4. SAFE Insertion Helper (prevents overwriting if an image is selected)
  const insertImageSafely = (src: string) => {
    if (!editor) return;
    const { state } = editor.view;
    const { selection } = state;

    if (selection instanceof NodeSelection) {
      editor.commands.setTextSelection(selection.to + 1);
    }

    editor
      .chain()
      .focus()
      .insertContent({
        type: "image",
        attrs: {
          src,
          alt: "Blog image",
          title: "Blog image",
          class:
            "mx-auto my-4 max-w-full rounded-lg cursor-pointer border shadow-sm",
        },
      })
      .run();
  };

  // 5. Called by EditorToolbar "onImageSelect"
  const handleImageSelect = (src: string) => {
    insertImageSafely(src);
  };

  // 6. Delete an image from the modal
  const deleteImage = () => {
    if (!editor || !selectedModalImage) return;

    const { src } = selectedModalImage;
    const { doc, tr } = editor.state;
    let foundPos = null;

    doc.descendants((node, pos) => {
      if (node.type.name === "image" && node.attrs.src === src) {
        foundPos = pos;
        return false;
      }
      return true;
    });

    if (foundPos === null) {
      console.warn(
        "Image not found in document. It may have been already deleted."
      );
      setSelectedModalImage(null);
      return;
    }

    console.log("Found image at position:", foundPos);
    editor.view.dispatch(tr.setSelection(NodeSelection.create(doc, foundPos)));
    const deleted = editor.commands.deleteNode("image");

    if (deleted) {
      console.log("Image successfully deleted");
    } else {
      console.warn("deleteNode failed. Trying deleteRange...");
      editor.chain().focus().deleteRange({ from: foundPos, to: foundPos + 1 }).run();
    }
    setSelectedModalImage(null);
  };

  return (
    <>
      <div className="border rounded-lg shadow-sm bg-white">
        {/* Version Toggle Bar */}
        <div className="border-b p-2 bg-gray-50 version-toggle">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {versions.map((version, idx) => (
              <div key={idx} className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => onVersionChange(idx)}
                  className={`px-3 py-1 text-sm rounded-md ${
                    currentVersion === idx
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Version {idx + 1}
                  <span className="ml-2 text-xs">
                    {new Date(version.timestamp).toLocaleTimeString()}
                  </span>
                </button>
                {idx > 0 && (
                  <button
                    onClick={() => onVersionDelete(idx)}
                    className="text-red-500 hover:text-red-700 text-lg"
                    title="Delete version"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
        {/* Toolbar for non-viewMode */}
        {!viewMode && (
          <EditorToolbar
            editor={editor}
            onSave={() => onSave?.(content)}
            onRegenerate={onRegenerate}
            suggestedImages={suggestedImages}
            onImageSelect={handleImageSelect}
          />
        )}

        <motion.div
          className="p-4 prose"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="p-4 prose relative">
            <EditorContent editor={editor} />
          </div>
        </motion.div>

        {/* View Mode Footer */}
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

      {/* Modal for Enlarging/Deleting an Image */}
      <AnimatePresence>
        {selectedModalImage && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedModalImage(null)}
          >
            <motion.div
              className="relative bg-white p-4 rounded-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.img
                src={selectedModalImage.src}
                alt="Expanded"
                className="max-w-3xl max-h-[90vh] rounded-lg"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
              />
              <div className="flex gap-2 mt-4 justify-end">
                <button
                  onClick={deleteImage}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete Image
                </button>
                <button
                  onClick={() => setSelectedModalImage(null)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
// "use client";
// import { useEffect, useState } from "react";
// import { EditorContent, useEditor, Editor } from "@tiptap/react";
// import StarterKit from "@tiptap/starter-kit";
// import Placeholder from "@tiptap/extension-placeholder";
// import Image from "@tiptap/extension-image";
// import { NodeSelection } from "@tiptap/pm/state"; 
// // ^ This is how Tiptap 2 re-exports ProseMirror's NodeSelection
// import { motion, AnimatePresence } from "framer-motion";
// import FeedbackButtons from "./FeedBackButtons";
// import EditorToolbar from "./EditorToolbar";
// import { fetchSuggestedImages } from "../lib/image-api";

// interface BlogEditorProps {
//   key: any;
//   initialContent: string;
//   onSave: (content: string) => Promise<void>;
//   onRegenerate: (currentTopic?: string) => Promise<void>;
//   onDelete: () => Promise<void>;
//   viewMode: boolean;
//   onViewModeChange: (mode: boolean) => void;
//   topic: string;
//   versions: { content: string; timestamp: string }[];
//   onVersionSelect: (versionContent: string) => void;
// }

// export default function BlogEditor({
//   initialContent = "",
//   onSave,
//   onRegenerate,
//   onDelete,
//   viewMode = false,
//   onViewModeChange,
//   topic = "",
// }: BlogEditorProps) {
//   const [content, setContent] = useState(initialContent);
//   const [suggestedImages, setSuggestedImages] = useState<string[]>([]);

//   // For image modal (enlarge / delete logic)
//   const [selectedModalImage, setSelectedModalImage] = useState<{
//     src: string;
//     pos: number;
//   } | null>(null);

//   // 1. Initialize Tiptap Editor
//   const editor: Editor | null = useEditor({
//     extensions: [
//       StarterKit,
//       Placeholder.configure({
//         placeholder: "Start writing your blog post...",
//       }),
//       Image.configure({
//         inline: false,
//         allowBase64: true,
//         HTMLAttributes: {
//           class: "mx-auto my-4 max-w-full rounded-lg cursor-pointer border shadow-sm",
//         },
//       }),
//     ],
//     content,
//     editable: !viewMode,
//     editorProps: {
//       handleClickOn: (view, pos, node) => {
//         // If user clicks an image, open the modal
//         if (node.type.name === "image") {
//           setSelectedModalImage({ src: node.attrs.src, pos });
//           return true;
//         }
//         return false;
//       },
//       attributes: {
//         class: viewMode
//           ? "prose max-w-none p-4"
//           : "prose max-w-none p-4 focus:outline-none min-h-[500px]",
//       },
//     },
//     onUpdate: ({ editor }) => {
//       setContent(editor.getHTML());
//     },
//   });

//   // NEW: Update Tiptap's editable state whenever viewMode changes.
//   useEffect(() => {
//     if (editor) {
//       editor.setEditable(!viewMode);
//     }
//   }, [viewMode, editor]);

//   // 2. Load initial content if exists
//   useEffect(() => {
//     if (editor && initialContent) {
//       editor.commands.setContent(initialContent);
//       setContent(initialContent);
//     }
//   }, [initialContent, editor]);

//   // 3. Load suggested images
//   useEffect(() => {
//     const loadImages = async () => {
//       if (topic) {
//         const images = await fetchSuggestedImages(topic);
//         setSuggestedImages(images);
//       }
//     };
//     loadImages();
//   }, [topic]);

//   // 4. SAFE Insertion Helper (prevents overwriting if an image is selected)
//   const insertImageSafely = (src: string) => {
//     if (!editor) return;
//     const { state } = editor.view;
//     const { selection } = state;

//     // If user has a NodeSelection (e.g., an image is fully selected), move the cursor after it
//     if (selection instanceof NodeSelection) {
//       editor.commands.setTextSelection(selection.to + 1); 
//       // This moves cursor to after the node
//     }

//     editor
//       .chain()
//       .focus()
//       .insertContent({
//         type: "image",
//         attrs: {
//           src,
//           alt: "Blog image",
//           title: "Blog image",
//           class: "mx-auto my-4 max-w-full rounded-lg cursor-pointer border shadow-sm",
//         },
//       })
//       .run();
//   };

//   // 5. Called by EditorToolbar "onImageSelect"
//   const handleImageSelect = (src: string) => {
//     insertImageSafely(src);
//   };

//   // 6. Delete an image from the modal
// const deleteImage = () => {
//   if (!editor || !selectedModalImage) return;

//   const { src } = selectedModalImage;
//   const { doc, tr } = editor.state;
//   let foundPos = null;

//   // ✅ 1. Traverse the doc to find the exact image node by `src`
//   doc.descendants((node, pos) => {
//     if (node.type.name === "image" && node.attrs.src === src) {
//       foundPos = pos;
//       return false; // Stop traversal once found
//     }
//     return true;
//   });

//   if (foundPos === null) {
//     console.warn("Image not found in document. It may have been already deleted.");
//     setSelectedModalImage(null);
//     return;
//   }

//   console.log("Found image at position:", foundPos);

//   // ✅ 2. Set selection on the found node
//   editor.view.dispatch(tr.setSelection(NodeSelection.create(doc, foundPos)));

//   // ✅ 3. Delete the node (Pass "image" as the argument)
//   const deleted = editor.commands.deleteNode("image");

//   if (deleted) {
//     console.log("Image successfully deleted");
//   } else {
//     console.warn("deleteNode failed. Trying deleteRange...");
//     editor.chain().focus().deleteRange({ from: foundPos, to: foundPos + 1 }).run();
//   }

//   // ✅ 4. Close modal after deletion
//   setSelectedModalImage(null);
// };


//   return (
//     <>
//       <div className="border rounded-lg shadow-sm bg-white">
//         {/* Toolbar for non-viewMode */}
//         {!viewMode && (
//           <EditorToolbar
//             editor={editor}
//             onSave={() => onSave?.(content)}
//             onRegenerate={onRegenerate}
//             suggestedImages={suggestedImages}
//             onImageSelect={handleImageSelect}
//           />
//         )}

//         <motion.div
//           className="p-4 prose"
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5 }}
//         >
//           <div className="p-4 prose relative">
//             <EditorContent editor={editor} />
//           </div>
//         </motion.div>

//         {/* View Mode Footer */}
//         {viewMode && (
//           <div className="p-4 border-t flex justify-between items-center">
//             <div className="flex gap-4">
//               <button
//                 onClick={() => onViewModeChange(false)}
//                 className="text-blue-600 hover:underline"
//               >
//                 Edit Post
//               </button>
//               <button onClick={onDelete} className="text-red-600 hover:underline">
//                 Delete Post
//               </button>
//             </div>
//             <FeedbackButtons content={content} />
//           </div>
//         )}
//       </div>

//       {/* Modal for Enlarging/Deleting an Image */}
//       <AnimatePresence>
//         {selectedModalImage && (
//           <motion.div
//             className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             onClick={() => setSelectedModalImage(null)}
//           >
//             <motion.div
//               className="relative bg-white p-4 rounded-lg"
//               onClick={(e) => e.stopPropagation()} // prevent closing when clicking the image area
//             >
//               <motion.img
//                 src={selectedModalImage.src}
//                 alt="Expanded"
//                 className="max-w-3xl max-h-[90vh] rounded-lg"
//                 initial={{ scale: 0.8 }}
//                 animate={{ scale: 1 }}
//                 exit={{ scale: 0.8 }}
//               />
//               <div className="flex gap-2 mt-4 justify-end">
//                 <button
//                   onClick={deleteImage}
//                   className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
//                 >
//                   Delete Image
//                 </button>
//                 <button
//                   onClick={() => setSelectedModalImage(null)}
//                   className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
//                 >
//                   Close
//                 </button>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </>
//   );
// }
