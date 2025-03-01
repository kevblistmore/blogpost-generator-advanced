// components/HistoryPanel.tsx
'use client';
import { format } from 'date-fns';

// Enhanced Blog interface to match your actual data structure
interface Blog {
  _id: string;
  title?: string;
  topic?: string;
  content: string;
  createdAt: string | Date;
  versions?: Array<{ content: string; prompt?: string; timestamp: string }>;
  currentVersion?: number;
}

export default function HistoryPanel({
  blogs,
  onSelect,
  onDelete
}: {
  blogs: Blog[];
  onSelect: (blog: Blog) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="panel-medium-teal rounded-lg shadow p-4 h-[calc(100vh-200px)] overflow-y-auto">
      <h3 className="text-lg font-semibold mb-4 text-[var(--light-teal)]">Blog History</h3>
      <div className="space-y-3">
        {blogs.map(blog => (
          <div
            key={blog._id}
            className="group relative p-3 rounded-lg cursor-pointer transition-colors history-item-gradient hover:opacity-90"
            onClick={() => onSelect(blog)}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium line-clamp-2 mb-1 text-[var(--light-teal)]">
                  {blog.title || blog.topic || blog.content.substring(0, 60)}
                </p>
                <p className="text-xs text-[var(--light-teal)]">
                  {format(new Date(blog.createdAt), 'MMM dd, HH:mm')}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(blog._id);
                }}
                className="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-800 px-2"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


// // components/HistoryPanel.tsx
// 'use client';
// import { format } from 'date-fns';

// interface BlogHistoryItem {
//   id: string;
//   content: string;
//   timestamp: string;
//   isSaved: boolean;
// }

// interface HistoryPanelProps {
//   history: BlogHistoryItem[];
//   onSelectBlog: (id: string) => void;
// }

// export default function HistoryPanel({ history, onSelectBlog }: HistoryPanelProps) {
//   return (
//     <div className="bg-white rounded-lg shadow p-4 h-[calc(100vh-200px)] overflow-y-auto">
//       <h3 className="text-lg font-semibold mb-4">Blog History</h3>
//       <div className="space-y-3">
//         {history.map((item) => (
//           <div
//             key={item.id}
//             onClick={() => onSelectBlog(item.id)}
//             className={`p-3 rounded-lg cursor-pointer transition-colors ${
//               item.isSaved ? 'bg-green-50 border border-green-100' : 'bg-gray-50 hover:bg-gray-100'
//             }`}
//           >
//             <div className="flex justify-between items-start">
//               <div>
//                 <p className="text-sm font-medium line-clamp-1">
//                   {item.content.substring(0, 40)}...
//                 </p>
//                 <p className="text-xs text-gray-500 mt-1">
//                   {format(new Date(item.timestamp), 'MMM dd, HH:mm')}
//                 </p>
//               </div>
//               {item.isSaved && (
//                 <span className="text-green-600 text-xs font-medium">Saved</span>
//               )}
//             </div>
//           </div>
//         ))}
//         {history.length === 0 && (
//           <p className="text-gray-500 text-sm">No generation history yet</p>
//         )}
//       </div>
//     </div>
//   );
// }
