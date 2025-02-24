// app/components/FeedbackButtons.tsx
'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function FeedbackButtons({ content }: { content: string }) {
  const [submitted, setSubmitted] = useState(false);

  const handleFeedback = async (rating: 'positive' | 'negative') => {
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          rating,
          timestamp: new Date().toISOString(),
        }),
      });
      if (!res.ok) throw new Error('Feedback submission failed');
      setSubmitted(true);
      toast.success('Feedback submitted!');
    } catch {
      toast.error('Failed to submit feedback');
    }
  };

  if (submitted) {
    return <p className="text-green-600 mt-4">Thanks for your feedback!</p>;
  }

  return (
    <div className="mt-4 flex gap-4">
      <button
        onClick={() => handleFeedback('positive')}
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        👍 Helpful
      </button>
      <button
        onClick={() => handleFeedback('negative')}
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        👎 Needs Improvement
      </button>
    </div>
  );
}
