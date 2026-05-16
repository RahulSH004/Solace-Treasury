'use client'

interface SuggestionChipsProps {
  suggestions: string[]
  onSelect: (suggestion: string) => void
}

export function SuggestionChips({ suggestions, onSelect }: SuggestionChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1 flex-nowrap">
      {suggestions.map((suggestion) => (
        <button
          key={suggestion}
          onClick={() => onSelect(suggestion)}
          className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full border border-purple-200 dark:border-purple-800/50 text-purple-600 dark:text-purple-400 bg-purple-50/60 dark:bg-purple-950/20 hover:bg-purple-100 dark:hover:bg-purple-950/40 hover:border-purple-400 dark:hover:border-purple-600 hover:text-purple-700 dark:hover:text-purple-300 transition-all duration-150 whitespace-nowrap font-medium"
        >
          {suggestion}
        </button>
      ))}
    </div>
  )
}
