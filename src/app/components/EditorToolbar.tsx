'use client';
import { cn } from '../lib/utils';
import { Editor } from '@tiptap/react';
import { Paperclip } from 'lucide-react';

interface EditorToolbarProps {
  editor: Editor | null;
  suggestedImages: string[];
  onSave?: () => void;
  onRegenerate?: () => void;
  onImageSelect: (src: string) => void;
}

export default function EditorToolbar({
  editor,
  suggestedImages,
  onSave,
  onRegenerate,
  onImageSelect
}: EditorToolbarProps) {
  if (!editor) return null;

  // Insert Image at Cursor Position
  const insertImage = (url: string) => {
    editor.chain().focus().insertContent(`<img src="${url}" alt="Uploaded Image" />`).run();
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
    <div className="border-b p-2 bg-gray-50 space-y-4">
      {/* Formatting Buttons */}
      <div className="flex flex-wrap gap-2">
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

      {/* Action Buttons */}
      <div className="flex gap-2 border-t pt-2">
        <button
          onClick={onRegenerate}
          className="flex-1 px-3 py-1.5 text-sm rounded-md bg-green-100 text-green-600 hover:bg-green-200"
        >
          Regenerate
        </button>
        <button
          onClick={onSave}
          className="flex-1 px-3 py-1.5 text-sm rounded-md bg-blue-100 text-blue-600 hover:bg-blue-200"
        >
          Save
        </button>
        <button
          onClick={() => navigator.clipboard.writeText(editor.getHTML())}
          className="flex-1 px-3 py-1.5 text-sm rounded-md bg-gray-100 hover:bg-gray-200"
        >
          📋 Copy
        </button>
      </div>
    </div>
  );
}

// 'use client';
// import { Editor } from '@tiptap/react';
// import { Paperclip } from 'lucide-react';
// import { cn } from '../lib/utils';

// interface EditorToolbarProps {
//   editor: Editor | null;
//   suggestedImages: string[];
//   onSave?: () => void;
//   onRegenerate?: () => void;
//   onImageSelect: (src: string) => void;
// }

// export default function EditorToolbar({
//   editor,
//   suggestedImages,
//   onSave,
//   onRegenerate,
//   onImageSelect
// }: EditorToolbarProps) {
//   const insertImage = (url: string) => {
//     if (!editor) return;
//     editor.chain().focus().insertContent(`<img src="${url}" alt="Uploaded Image" />`).run();
//   };

//   const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const files = event.target.files;
//     if (!files) return;

//     Array.from(files).forEach((file) => {
//       const reader = new FileReader();
//       reader.onload = () => {
//         if (typeof reader.result === 'string') {
//           insertImage(reader.result); // ✅ Insert as base64
//         }
//       };
//       reader.readAsDataURL(file);
//     });
//   };

//   return (
//     <div className="flex gap-4 p-4 border-b bg-gray-50 items-center">
//       <button
//         onClick={onSave}
//         className={cn(
//           'px-4 py-2 rounded-lg',
//           'hover:bg-blue-700',
//           'text-white',
//           'bg-blue-600'
//         )}
//       >
//         Save
//       </button>

//       <button
//         onClick={onRegenerate}
//         className={cn(
//           'px-4 py-2 rounded-lg',
//           'hover:bg-green-700',
//           'text-white',
//           'bg-green-600'
//         )}
//       >
//         Regenerate
//       </button>

//       {/* 📎 Upload Icon for Adding Images */}
//       <label className="flex items-center gap-2 cursor-pointer px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
//         <Paperclip size={20} />
//         <span>Add Images</span>
//         <input
//           type="file"
//           accept="image/*"
//           multiple
//           onChange={handleImageUpload}
//           className="hidden"
//         />
//       </label>

//       {suggestedImages.length > 0 && (
//         <div className="flex gap-2">
//           {suggestedImages.map((img, index) => (
//             <img
//               key={index}
//               src={img}
//               alt={`Suggested ${index}`}
//               className={cn('w-12 h-12 rounded-lg cursor-pointer border')}
//               onClick={() => insertImage(img)}
//             />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

//--------------------------------------------------------------------------------------

// 'use client';
// import { Editor } from '@tiptap/react';
// import { Paperclip } from 'lucide-react';
// import { cn } from '../lib/utils'; // if you use this utility

// interface EditorToolbarProps {
//   editor: Editor | null;
//   onSave?: () => void;
//   onRegenerate?: () => void;
//   suggestedImages?: string[];
// }

// export default function EditorToolbar({
//   editor,
//   onSave,
//   onRegenerate,
//   suggestedImages = [],
// }: EditorToolbarProps) {
//   // 1. Insert image at cursor rather than replacing
//   const insertImage = (url: string) => {
//     if (!editor) return;
//     editor
//       .chain()
//       .focus()
//       .insertContent({
//         type: 'image',
//         attrs: { src: url },
//       })
//       .run();
//   };

//   // 2. Handle uploaded files (multiple)
//   const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const files = event.target.files;
//     if (!files) return;

//     Array.from(files).forEach((file) => {
//       const reader = new FileReader();
//       reader.onload = () => {
//         if (typeof reader.result === 'string') {
//           insertImage(reader.result); // Insert as base64
//         }
//       };
//       reader.readAsDataURL(file);
//     });
//   };

//   // 3. Remove the currently selected image node
//   const handleRemoveImage = () => {
//     if (!editor) return;
//     // If the selection is an image node, delete it
//     editor.chain().focus().deleteSelection().run();
//   };

//   // 4. Check if an image is selected
//   const isImageSelected = editor?.isActive('image');

//   return (
//     <div className="flex gap-4 p-4 border-b bg-gray-50 items-center">
//       {/* Save & Regenerate */}
//       <button
//         onClick={onSave}
//         className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//       >
//         Save
//       </button>
//       <button
//         onClick={onRegenerate}
//         className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
//       >
//         Regenerate
//       </button>

//       {/* Upload Images */}
//       <label className="flex items-center gap-2 cursor-pointer px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
//         <Paperclip size={20} />
//         <span>Add Images</span>
//         <input
//           type="file"
//           accept="image/*"
//           multiple
//           onChange={handleImageUpload}
//           className="hidden"
//         />
//       </label>

//       {/* Suggested Images */}
//       {suggestedImages.length > 0 && (
//         <div className="flex gap-2">
//           {suggestedImages.map((img, index) => (
//             <img
//               key={index}
//               src={img}
//               alt={`Suggested ${index}`}
//               className="w-12 h-12 rounded-lg cursor-pointer border"
//               onClick={() => insertImage(img)}
//             />
//           ))}
//         </div>
//       )}

//       {/* Conditionally show "Remove Image" button if an image is selected */}
//       {isImageSelected && (
//         <button
//           onClick={handleRemoveImage}
//           className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
//         >
//           Remove Image
//         </button>
//       )}
//     </div>
//   );
// }
//--------------------------------------------------------------------------------------
// 'use client';
// import { Editor } from '@tiptap/react';
// import { cn } from '../lib/utils';

// interface EditorToolbarProps {
//   editor: Editor | null; // <-- Allow null here
//   suggestedImages: string[];
//   onSave?: () => void;
//   onRegenerate?: () => void;
// }

// export default function Toolbar({
//   editor,
//   suggestedImages,
//   onSave,
//   onRegenerate,
// }: EditorToolbarProps) {
//   if (!editor) return null;

//   const buttons = [
//     {
//       onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
//       active: editor.isActive('heading'),
//       label: 'H2',
//     },
//     {
//       onClick: () => editor.chain().focus().toggleBold().run(),
//       active: editor.isActive('bold'),
//       label: 'Bold',
//     },
//     {
//       onClick: () => editor.chain().focus().toggleItalic().run(),
//       active: editor.isActive('italic'),
//       label: 'Italic',
//     },
//     {
//       onClick: () => editor.chain().focus().toggleBulletList().run(),
//       active: editor.isActive('bulletList'),
//       label: 'List',
//     },
//   ];

//   return (
//     <div className="border-b p-2 bg-gray-50 space-y-4">
//       <div className="flex flex-wrap gap-2">
//         {/* Formatting buttons */}
//         {buttons.map((btn, index) => (
//           <button
//             key={index}
//             onClick={btn.onClick}
//             className={cn(
//               'px-3 py-1 text-sm rounded-md transition-colors',
//               btn.active ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 hover:bg-gray-200'
//             )}
//           >
//             {btn.label}
//           </button>
//         ))}

//         {/* Action buttons */}
//         <button
//           onClick={onRegenerate}
//           className="px-3 py-1 text-sm rounded-md bg-green-100 text-green-600 hover:bg-green-200"
//         >
//           Regenerate
//         </button>
//         <button
//           onClick={onSave}
//           className="px-3 py-1 text-sm rounded-md bg-blue-100 text-blue-600 hover:bg-blue-200"
//         >
//           Save
//         </button>
//         <button
//           onClick={() => navigator.clipboard.writeText(editor.getHTML())}
//           className="px-3 py-1 text-sm rounded-md bg-gray-100 hover:bg-gray-200"
//         >
//           📋 Copy
//         </button>
//       </div>

//       {suggestedImages.length > 0 && (
//         <div className="flex gap-2 mt-2">
//           {suggestedImages.map((img, index) => (
//             <img
//               key={index}
//               src={img}
//               alt={`Suggestion ${index}`}
//               className="w-10 h-10 object-cover rounded cursor-pointer"
//               onClick={() => {
//                 editor.chain().focus().setImage({ src: img }).run();
//               }}
//             />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

