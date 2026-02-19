'use client'
// components/shared/TagInput.tsx
import { useState, useRef, KeyboardEvent } from 'react'
import { X } from 'lucide-react'

interface Tag {
  id?: number
  name: string
  slug?: string
}

interface TagInputProps {
  value: Tag[]
  onChange: (tags: Tag[]) => void
  suggestions?: Tag[]
  placeholder?: string
  className?: string
}

export default function TagInput({
  value,
  onChange,
  suggestions = [],
  placeholder = 'Add tags...',
  className = '',
}: TagInputProps) {
  const [input, setInput] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const filteredSuggestions = suggestions.filter(
    (s) =>
      s.name.toLowerCase().includes(input.toLowerCase()) &&
      !value.some((t) => t.name === s.name)
  )

  const addTag = (tag: Tag) => {
    if (value.some((t) => t.name === tag.name)) return
    onChange([...value, tag])
    setInput('')
    setShowSuggestions(false)
  }

  const removeTag = (name: string) => {
    onChange(value.filter((t) => t.name !== name))
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault()
      addTag({ name: input.trim() })
    }
    if (e.key === 'Backspace' && !input && value.length > 0) {
      removeTag(value[value.length - 1].name)
    }
  }

  return (
    <div className={`relative ${className}`}>
      <div
        className="flex flex-wrap gap-2 p-2 rounded-xl border min-h-[44px] cursor-text"
        style={{
          background: 'var(--bg-surface)',
          borderColor: 'var(--bg-border)',
        }}
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((tag) => (
          <span
            key={tag.name}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
            style={{ background: 'rgba(108, 61, 255, 0.2)', color: '#A29BFE' }}
          >
            {tag.name}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeTag(tag.name) }}
              className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
            >
              <X size={10} />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => { setInput(e.target.value); setShowSuggestions(true) }}
          onKeyDown={handleKeyDown}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder={value.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[80px] bg-transparent outline-none text-sm"
          style={{ color: 'var(--text-primary)' }}
        />
      </div>

      {showSuggestions && filteredSuggestions.length > 0 && (
        <div
          className="absolute top-full left-0 right-0 mt-1 rounded-xl shadow-xl z-20 border overflow-hidden"
          style={{ background: 'var(--bg-elevated)', borderColor: 'var(--bg-border)' }}
        >
          {filteredSuggestions.slice(0, 8).map((s) => (
            <button
              key={s.name}
              type="button"
              className="w-full text-left px-3 py-2 text-sm hover:bg-white/5 transition-colors"
              style={{ color: 'var(--text-primary)' }}
              onMouseDown={() => addTag(s)}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}
      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
        Press Enter or comma to add a tag
      </p>
    </div>
  )
}
