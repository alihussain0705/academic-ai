import { Sparkles } from 'lucide-react'

const EXAMPLE_PROMPTS = [
  {
    label: 'Explain a concept',
    prompt: 'Can you explain the concept of object-oriented programming in simple terms?',
    subject: 'Computer Science',
  },
  {
    label: 'Solve a problem',
    prompt: 'Help me solve this integral: ∫(2x + 3)dx',
    subject: 'Mathematics',
  },
  {
    label: 'Study summary',
    prompt: 'Summarize the key events of World War II and their impact on modern geopolitics',
    subject: 'History',
  },
  {
    label: 'Code review',
    prompt: 'Review this Python function and suggest improvements for better performance and readability',
    subject: 'Programming',
  },
]

interface ChatEmptyStateProps {
  onSendPrompt: (prompt: string, subject: string) => void
}

export default function ChatEmptyState({ onSendPrompt }: ChatEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6">
      <div className="max-w-lg text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 mx-auto mb-5">
          <Sparkles className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-semibold text-surface-800 mb-2">
          What can I help you with?
        </h2>
        <p className="text-sm text-surface-500 mb-8 leading-relaxed">
          Ask me anything about your studies. I can explain concepts, solve problems,
          review code, summarize topics, and help you prepare for exams.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {EXAMPLE_PROMPTS.map((item) => (
            <button
              key={item.label}
              onClick={() => onSendPrompt(item.prompt, item.subject)}
              className="group flex items-start gap-3 p-3.5 rounded-xl border border-surface-200 bg-surface-0 text-left transition-all duration-150 hover:border-brand-200 hover:shadow-sm hover:bg-brand-50/30 cursor-pointer"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-100 text-surface-500 group-hover:bg-brand-100 group-hover:text-brand-600 transition-colors">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-surface-700 group-hover:text-brand-700 transition-colors">
                  {item.label}
                </p>
                <p className="text-xs text-surface-400 mt-0.5 line-clamp-2">
                  {item.prompt}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
