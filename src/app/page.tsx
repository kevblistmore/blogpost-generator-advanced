// app/page.tsx
'use client';
import GenerateForm from './components/GenerateForm';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <section className="text-center mb-12">
          <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            AI Blog Generator
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Transform your ideas into polished blog posts with AI-powered writing assistance.
            Generate, edit, and save professional content in minutes.
          </p>
        </section>
        <GenerateForm />
      </div>
    </main>
  );
}
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

