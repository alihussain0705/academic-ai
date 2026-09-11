import type { ReactNode } from 'react'
import { Sparkles, GraduationCap, Brain, BookOpen } from 'lucide-react'

interface AuthLayoutProps {
  children: ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left visual panel - hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-brand-600">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-white/20 -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-white/10 translate-x-1/4 translate-y-1/4" />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full bg-white/5 -translate-x-1/2 -translate-y-1/2" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between w-full px-12 py-10">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-white tracking-tight">
              AI Academic Platform
            </span>
          </div>

          {/* Center content */}
          <div className="flex-1 flex flex-col justify-center max-w-md">
            <h1 className="text-4xl font-bold text-white leading-tight tracking-tight mb-5">
              Your intelligent
              <br />
              study companion
            </h1>
            <p className="text-base text-brand-100 leading-relaxed mb-10">
              Ask questions, explore concepts, and master your subjects with an AI
              that understands your academic context.
            </p>

            {/* Feature highlights */}
            <div className="space-y-4">
              {[
                {
                  icon: <Brain className="h-5 w-5" />,
                  title: 'Contextual learning',
                  desc: 'AI that adapts to your curriculum and knowledge level',
                },
                {
                  icon: <BookOpen className="h-5 w-5" />,
                  title: 'Subject expertise',
                  desc: 'Deep understanding across departments and semesters',
                },
                {
                  icon: <GraduationCap className="h-5 w-5" />,
                  title: 'Academic focus',
                  desc: 'Built specifically for college students and professors',
                },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15 text-white">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{item.title}</p>
                    <p className="text-sm text-brand-200">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p className="text-xs text-brand-200/60">
            Trusted by students and educators across institutions
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center bg-surface-50 px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile brand - visible only on small screens */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 shadow-sm">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-sm font-semibold text-surface-800">AI Academic</span>
          </div>

          {children}
        </div>
      </div>
    </div>
  )
}
