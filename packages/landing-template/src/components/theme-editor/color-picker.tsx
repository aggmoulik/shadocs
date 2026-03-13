'use client'

import { useRef } from 'react'

interface ColorPickerProps {
  label: string
  value: string
  onChange: (value: string) => void
}

export function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="w-6 h-6 rounded-md border border-white/20 shrink-0 cursor-pointer shadow-sm"
        style={{ backgroundColor: value }}
        title={label}
      />
      <input
        ref={inputRef}
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="sr-only"
      />
      <div className="min-w-0 flex-1">
        <div className="text-xs text-neutral-400 truncate">{label}</div>
        <input
          type="text"
          value={value}
          onChange={(e) => {
            const v = e.target.value
            if (/^#[0-9a-fA-F]{0,6}$/.test(v)) onChange(v)
          }}
          className="w-full text-xs font-mono bg-transparent border-none outline-none text-neutral-200 p-0"
          spellCheck={false}
        />
      </div>
    </div>
  )
}
