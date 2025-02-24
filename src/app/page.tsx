// app/page.tsx
'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Header from './components/Header';

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
    <>
      <Header />
      <main className="min-h-screen">
        {/* Hero Section */}
        <div className="hero-dark px-4 py-8">
          <div className="max-w-7xl mx-auto pl-14">
            <section className="text-left mt-20 mb-0">
              <h1 className="text-6xl font-extrabold mb-4 leading-tight flex items-baseline">
                AI Blog Generator 
                <span className="inline-block w-3 h-3 bg-white rounded-full ml-2"></span>
              </h1>
              <p className="text-lg max-w-2xl">
                Transform your ideas into polished blog posts with AI-powered writing assistance.
              </p>
            </section>
          </div>
        </div>

        {/* EXACT DIVIDER: No extra margin; separates the two sections cleanly */}
        <div className="w-full border-t border-gray-200" />

        {/* Gradient Background Section */}
        <div className="home-gradient px-4 py-12">
          <div className="max-w-7xl mx-auto">
            {/* Search Bar */}
            <div className="flex justify-center mb-12">
              <form onSubmit={handleSubmit} className="w-[calc(2*475px+32px)] mx-auto">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter blog title here"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="search-input w-full p-4 pr-20 rounded-lg focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="search-button absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 rounded-md"
                  >
                    Search
                  </button>
                </div>
              </form>
            </div>

            {/* Two Boxes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {/* Blog Templates Box */}
              <div className="feature-box">
                <h2 className="text-2xl font-semibold mb-8 text-bright-teal">Sample Blog Templates</h2>
                <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
                  {sampleTemplates.map((template, index) => (
                    <a
                      key={index}
                      href={template.link}
                      className="group flex flex-col h-full rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all"
                    >
                      <div className="relative h-32 w-full">
                        <img
                          src={template.image}
                          alt={template.title}
                          className="object-cover w-full h-full"
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute w-9 h-9 bg-gray-700 opacity-70 rounded-full"></div>
                          <svg
                            className="w-5 h-5 text-gray-500 relative"
                            data-testid="geist-icon"
                            height="15"
                            strokeLinejoin="round"
                            viewBox="0 0 16 16"
                            width="15"
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
                      <div className="flex-1 p-3 text-light-teal opacity-90">
                        <h3 className="text-base font-bold mb-1">{template.title}</h3>
                        <p className="text-sm line-clamp-2">
                          {template.description}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* Suggested Blog Queries Box */}
              <div className="feature-box">
                <h2 className="text-2xl font-semibold mb-12 text-bright-teal">Top Blog Categories</h2>
                <div className="grid grid-cols-2 gap-3">
                  {sampleCategories.map((cat, index) => (
                    <button
                      key={index}
                      onClick={() => handleCategoryClick(cat.name)}
                      className="flex items-center gap-2 p-2 border rounded-lg hover:bg-gray-100 transition-colors text-base text-light-teal opacity-90"
                    >
                      <span className="text-2xl">{cat.emoji}</span>
                      <span>{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}



