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
  contentProp: string;
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
    content: initialContent,
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

  useEffect(() => {
    if (editor && contentProp) {
      editor.commands.setContent(contentProp);
      setContent(contentProp);
    }
  }, [contentProp, editor]);

  useEffect(() => {
    if (editor) {
      editor.setEditable(!viewMode);
    }
  }, [viewMode, editor]);

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

  useEffect(() => {
    if (editor && versions[currentVersion]?.content) {
      editor.commands.setContent(versions[currentVersion].content);
      setContent(versions[currentVersion].content);
    }
  }, [currentVersion, versions, editor]);

  const _insertImageSafely = (src: string) => {
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

  const handleImageSelect = (imageUrl: string) => {
    if (editor) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
    }
  };

  const deleteImage = () => {
    if (!selectedModalImage || !editor) return;
    const { pos } = selectedModalImage;
    editor.chain().focus().deleteRange({ from: pos, to: pos + 1 }).run();
    setSelectedModalImage(null);
  };

  return (
    <>
      <div className="border rounded-lg shadow-sm editor-offwhite">
        <div className="border-b p-2 bg-gray-200 version-toggle">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {versions.map((version, idx) => (
              <div key={idx} className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => onVersionChange(idx)}
                  className={`px-3 py-1 text-sm rounded-md ${
                    currentVersion === idx
                      ? "bg-[#964734] text-white"
                      : "bg-gray-100 hover:bg-gray-200"
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
