// app/page.tsx
'use client';

import GenerateForm from './components/GenerateForm';

export default function Home() {
  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">AI Blog Post Generator</h1>
      <GenerateForm />
    </main>
  );
}
