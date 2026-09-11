import { User, Bot } from 'lucide-react'
import MarkdownRenderer from './chat/MarkdownRenderer'

interface Props {
  message: { id: number; role: string; content: string; created_at: string }
}

export default function ChatMessage({ message }: Props) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600 mt-0.5">
          <Bot className="h-3.5 w-3.5" />
        </div>
      )}

      <div
        className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-brand-600 text-white rounded-br-md'
            : 'bg-surface-0 border border-surface-200 text-surface-700 rounded-bl-md shadow-xs'
        }`}
      >
        {isUser ? (
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
        ) : (
          <div className="text-sm leading-relaxed prose-chat">
            <MarkdownRenderer content={message.content} />
          </div>
        )}
        <p
          className={`text-xs mt-2 ${
            isUser ? 'text-brand-200' : 'text-surface-400'
          }`}
        >
          {new Date(message.created_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>

      {isUser && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-200 text-surface-500 mt-0.5">
          <User className="h-3.5 w-3.5" />
        </div>
      )}
    </div>
  )
}
