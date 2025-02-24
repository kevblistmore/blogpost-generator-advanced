// components/PromptSuggestions.tsx
'use client';

interface PromptSuggestionsProps {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
  isLoading?: boolean;
}

export function PromptSuggestions({ 
  suggestions, 
  onSuggestionClick, 
  isLoading = false 
}: PromptSuggestionsProps) {
  return (
    <div className="mt-4 space-y-2 min-h-[100px] text-black">
      <p className="text-sm text-gray-500">Related topics you might like:</p>
      <div className="flex flex-wrap gap-2">
        {isLoading ? (
          Array(3).fill(0).map((_, index) => (
            <div
              key={index}
              className="h-8 bg-gray-200 rounded-full animate-pulse"
              style={{ width: `${Math.random() * 50 + 100}px` }}
            />
          ))
        ) : (
          suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onSuggestionClick(suggestion)}
              className="px-3 py-1.5 text-sm bg-gray-100 rounded-full hover:bg-gray-200 transition-colors whitespace-nowrap"
            >
              {suggestion}
            </button>
          ))
        )}
        {!isLoading && suggestions.length === 0 && (
          <p className="text-sm text-gray-400">No suggestions available</p>
        )}
      </div>
    </div>
  );
}