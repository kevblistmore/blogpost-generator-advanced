// app/page.tsx
'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const sampleTemplates = [
  {
    title: 'Travel Blog',
    description: 'Explore destinations with engaging travel stories.',
    image: '/sample-images/Travel-Blogger.jpg',
    link: '/generate?q=travel&sample=true'
  },
  {
    title: 'Finance Insights',
    description: 'Get the latest tips on investments and financial trends.',
    image: '/sample-images/Financial-Insights.png',
    link: '/generate?q=finance&sample=true'
  },
  {
    title: 'Content Writing',
    description: 'Discover creative writing templates for your next post.',
    image: '/sample-images/Content-Writing.jpg',
    link: '/generate?q=content&sample=true'
  },
  {
    title: 'Music Reviews',
    description: 'Share your passion for music with stylish reviews.',
    image: '/sample-images/Music-Review.png',
    link: '/generate?q=music&sample=true'
  }
];

const sampleCategories = [
  { name: 'Travel', emoji: '✈️' },
  { name: 'Finance', emoji: '💰' },
  { name: 'Content Writing', emoji: '✍️' },
  { name: 'Music', emoji: '🎵' },
  { name: 'Technology', emoji: '💻' },
  { name: 'Health', emoji: '🏥' },
  { name: 'Food', emoji: '🍔' },
  { name: 'Lifestyle', emoji: '🌟' },
  { name: 'Education', emoji: '📚' },
  { name: 'Sports', emoji: '🏀' },
  { name: 'Entertainment', emoji: '🎬' },
  { name: 'Fashion', emoji: '👗' },
  { name: 'Business', emoji: '📈' },
  { name: 'Art', emoji: '🎨' },
  { name: 'DIY', emoji: '🛠️' }
];

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    router.push(`/generate?q=${encodeURIComponent(query)}`);
  };

  const handleCategoryClick = (category: string) => {
    router.push(`/generate?q=${encodeURIComponent(category)}`);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            AI Blog Generator
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Transform your ideas into polished blog posts with AI-powered writing assistance.
            Generate, edit, and save professional content in minutes.
          </p>
        </section>

        {/* Search Bar */}
        <form onSubmit={handleSubmit} className="flex gap-2 mb-8">
          <input
            type="text"
            placeholder="Enter blog title here"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 p-3 border rounded-lg"
          />
          <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Search
          </button>
        </form>

        {/* Two Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Blog Templates Box */}
          <div className="p-4 border rounded-lg text-center mx-auto">
            <h2 className="text-xl font-semibold mb-2">Blog Templates</h2>
            {/* 2x2 Grid with fixed width & height to ensure equal sizing */}
            <div className="grid gap-4 lg:h-full lg:grid-rows-[1fr_1fr] grid-cols-1 md:grid-cols-2">
              {sampleTemplates.map((template, index) => (
                <a
                  key={index}
                  href={template.link}
                  className="group flex flex-col h-full rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="relative h-40 w-full">
                    <img
                      src={template.image}
                      alt={template.title}
                      className="object-cover w-full h-full"
                    />
                    {/* Overlay for on-hover arrow with grey translucent circle */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {/* Grey translucent circle */}
                      <div className="absolute w-10 h-10 bg-gray-700 opacity-70 rounded-full"></div>
                      {/* SVG Arrow on top; note the use of camelCase for attributes */}
                      <svg
                        className="w-6 h-6 text-gray-500 relative"
                        data-testid="geist-icon"
                        height="16"
                        strokeLinejoin="round"
                        viewBox="0 0 16 16"
                        width="16"
                        style={{ color: 'var(--ds-gray-00)' }}
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M9.53033 2.21968L9 1.68935L7.93934 2.75001L8.46967 3.28034L12.4393 7.25001H1.75H1V8.75001H1.75H12.4393L8.46967 12.7197L7.93934 13.25L9 14.3107L9.53033 13.7803L14.6036 8.70711C14.9941 8.31659 14.9941 7.68342 14.6036 7.2929L9.53033 2.21968Z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1 p-4 bg-white">
                    <h3 className="text-lg font-bold mb-2">{template.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {template.description}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Suggested Blog Queries Box */}
          <div className="p-4 border rounded-lg text-center max-w-xl mx-auto">
            <h2 className="text-xl font-semibold mb-2">Suggested Blog Queries</h2>
            <div className="grid grid-cols-2 gap-4">
              {sampleCategories.map((cat, index) => (
                <button
                  key={index}
                  onClick={() => handleCategoryClick(cat.name)}
                  className="flex items-center gap-2 p-2 border rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="text-2xl">{cat.emoji}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

// // app/page.tsx
// 'use client';
// import { useRouter } from 'next/navigation';
// import { useState } from 'react';

// const sampleTemplates = [
//   {
//     title: 'Travel Blog',
//     description: 'Explore destinations with engaging travel stories.',
//     image: '/sample-images/Travel-Blogger.jpg',
//     link: '/generate?q=travel&sample=true'
//   },
//   {
//     title: 'Finance Insights',
//     description: 'Get the latest tips on investments and financial trends.',
//     image: '/sample-images/Financial-Insights.png',
//     link: '/generate?q=finance&sample=true'
//   },
//   {
//     title: 'Content Writing',
//     description: 'Discover creative writing templates for your next post.',
//     image: '/sample-images/Content-Writing.jpg',
//     link: '/generate?q=content&sample=true'
//   },
//   {
//     title: 'Music Reviews',
//     description: 'Share your passion for music with stylish reviews.',
//     image: '/sample-images/Music-Review.png',
//     link: '/generate?q=music&sample=true'
//   }
// ];

// const sampleCategories = [
//   { name: 'Travel', emoji: '✈️' },
//   { name: 'Finance', emoji: '💰' },
//   { name: 'Content Writing', emoji: '✍️' },
//   { name: 'Music', emoji: '🎵' },
//   { name: 'Technology', emoji: '💻' },
//   { name: 'Health', emoji: '🏥' },
//   { name: 'Food', emoji: '🍔' },
//   { name: 'Lifestyle', emoji: '🌟' },
//   { name: 'Education', emoji: '📚' },
//   { name: 'Sports', emoji: '🏀' },
//   { name: 'Entertainment', emoji: '🎬' },
//   { name: 'Fashion', emoji: '👗' },
//   { name: 'Business', emoji: '📈' },
//   { name: 'Art', emoji: '🎨' },
//   { name: 'DIY', emoji: '🛠️' }
// ];

// export default function Home() {
//   const router = useRouter();
//   const [query, setQuery] = useState('');

//   const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     router.push(`/generate?q=${encodeURIComponent(query)}`);
//   };

//   const handleCategoryClick = (category: string) => {
//     router.push(`/generate?q=${encodeURIComponent(category)}`);
//   };

//   return (
//     <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
//       <div className="max-w-7xl mx-auto px-4 py-8">
//         {/* Hero Section */}
//         <section className="text-center mb-12">
//           <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
//             AI Blog Generator
//           </h1>
//           <p className="text-gray-600 text-lg max-w-2xl mx-auto">
//             Transform your ideas into polished blog posts with AI-powered writing assistance.
//             Generate, edit, and save professional content in minutes.
//           </p>
//         </section>

//         {/* Search Bar */}
//         <form onSubmit={handleSubmit} className="flex gap-2 mb-8">
//           <input
//             type="text"
//             placeholder="Enter blog title here"
//             value={query}
//             onChange={(e) => setQuery(e.target.value)}
//             className="flex-1 p-3 border rounded-lg"
//           />
//           <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
//             Search
//           </button>
//         </form>

//         {/* Two Boxes */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//           {/* Blog Templates Box */}
//           <div className="p-4 border rounded-lg text-center mx-auto">
//             <h2 className="text-xl font-semibold mb-2">Blog Templates</h2>
//             {/* 2x2 Grid with fixed width & height to ensure equal sizing */}
//             <div className="grid gap-4 lg:h-full lg:grid-rows-[1fr_1fr] grid-cols-1 md:grid-cols-2">
//               {sampleTemplates.map((template, index) => (
//                 <a
//                   key={index}
//                   href={template.link}
//                   className="group flex flex-col h-full rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all"
//                 >
//                   <div className="relative h-40 w-full">
//                     <img
//                       src={template.image}
//                       alt={template.title}
//                       className="object-cover w-full h-full"
//                     />
//                   </div>
//                   <div className="flex-1 p-4 bg-white">
//                     <h3 className="text-lg font-bold mb-2">{template.title}</h3>
//                     <p className="text-sm text-gray-600 line-clamp-2">
//                       {template.description}
//                     </p>
//                   </div>
//                 </a>
//               ))}
//             </div>
//           </div>

//           {/* Suggested Blog Queries Box */}
//           <div className="p-4 border rounded-lg text-center max-w-md mx-auto">
//             <h2 className="text-xl font-semibold mb-2">Suggested Blog Queries</h2>
//             <div className="grid grid-cols-2 gap-4">
//               {sampleCategories.map((cat, index) => (
//                 <button
//                   key={index}
//                   onClick={() => handleCategoryClick(cat.name)}
//                   className="flex items-center gap-2 p-2 border rounded-lg hover:bg-gray-100 transition-colors"
//                 >
//                   <span className="text-2xl">{cat.emoji}</span>
//                   <span>{cat.name}</span>
//                 </button>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </main>
//   );
// }
