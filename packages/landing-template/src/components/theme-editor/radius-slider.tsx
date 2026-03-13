'use client'

interface RadiusSliderProps {
  label: string
  value: string // e.g. "0.5rem"
  onChange: (value: string) => void
}

export function RadiusSlider({ label, value, onChange }: RadiusSliderProps) {
  const numValue = parseFloat(value) || 0

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-neutral-400">{label}</span>
        <span className="text-xs font-mono text-neutral-300">{numValue.toFixed(3)}rem</span>
      </div>
      <input
        type="range"
        min="0"
        max="1.5"
        step="0.125"
        value={numValue}
        onChange={(e) => onChange(`${e.target.value}rem`)}
        className="w-full h-1.5 rounded-full appearance-none bg-neutral-700 cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer
          [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full
          [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
      />
    </div>
  )
}
