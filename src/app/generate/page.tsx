// app/generate/page.tsx
"use client";
import { useSearchParams } from "next/navigation";
import GenerateForm from "../components/GenerateForm";

export default function GeneratePage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const isSample = searchParams.get("sample") === "true";

  return (
    <main className="min-h-screen">
      {/* Top Section - hero-dark */}
      <div className="hero-dark px-4 py-8">
        <div className="max-w-7xl mx-auto pl-14">
          <section className="text-left mt-20 mb-0">
            <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              AI Blog Generator
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl">
              Transform your ideas into polished blog posts with AI-powered writing assistance.
            </p>
          </section>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full border-t border-gray-200" />

      {/* Main Content - home-gradient */}
      <div className="home-gradient px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <GenerateForm initialQuery={initialQuery} isSample={isSample} />
        </div>
      </div>
    </main>
  );
}

// "use client";
// import { useSearchParams } from "next/navigation";
// import GenerateForm from "../components/GenerateForm";

// export default function GeneratePage() {
//   // Read the query param `q` (e.g. /generate?q=SomeTopic)
//   const searchParams = useSearchParams();
//   const initialQuery = searchParams.get("q") || "";

//   return (
//     <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
//       <div className="max-w-10xl mx-auto px-4 py-8">
//         <section className="text-center mb-12">
//           <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
//             AI Blog Generator
//           </h1>
//           <p className="text-gray-600 text-lg max-w-2xl mx-auto">
//             Transform your ideas into polished blog posts with AI-powered writing assistance.
//             Generate, edit, and save professional content in minutes.
//           </p>
//         </section>

//         {/* Pass the new query to GenerateForm */}
//         <GenerateForm initialQuery={initialQuery} />
//       </div>
//     </main>
//   );
// }

// 'use client';

// import GenerateForm from './components/GenerateForm';

// export default function Home() {
//   return (
//     <main className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col items-center">
//       {/* Hero Section */}
//       <section className="w-full max-w-4xl flex flex-col items-center text-center mt-16 mb-8 px-4">
//         <h1 className="text-5xl font-extrabold mb-3 
//           text-transparent bg-clip-text 
//           bg-gradient-to-r from-blue-600 to-indigo-600
//         ">
//           AI Blog Post Generator
//         </h1>
//         <p className="text-gray-600 max-w-xl">
//           Instantly craft engaging blog posts. Enter a topic, and let AI do the heavy lifting!
//         </p>
//       </section>

//       {/* Content Section */}
//       <section className="w-full max-w-2xl bg-white rounded-lg shadow-md p-8">
//         <GenerateForm />
//       </section>

//       <section className="max-w-3xl mx-auto mt-8 mb-16 px-4 text-center">
//         <h2 className="text-2xl font-bold mb-2">How It Works</h2>
//         <p className="text-gray-600">
//           This AI tool uses advanced language models to structure an entire blog post around your topic. 
//           Enjoy a clear introduction, well-organized sections, and actionable tips—then fine-tune the final draft 
//           with our built-in editor.
//         </p>
//       </section>
//     </main>
//   );
// }

