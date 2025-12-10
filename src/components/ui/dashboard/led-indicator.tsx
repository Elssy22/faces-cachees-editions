'use client'

import { cn } from '@/lib/utils'

interface LedIndicatorProps {
  status: 'off' | 'green' | 'orange' | 'red' | 'blue'
  label?: string
  value?: number | string
  pulse?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const statusColors = {
  off: {
    bg: 'bg-gray-600',
    glow: '',
    text: 'text-gray-500',
  },
  green: {
    bg: 'bg-[#00ff88]',
    glow: 'shadow-[0_0_10px_#00ff88,0_0_20px_#00ff88]',
    text: 'text-[#00ff88]',
  },
  orange: {
    bg: 'bg-[#ff9500]',
    glow: 'shadow-[0_0_10px_#ff9500,0_0_20px_#ff9500]',
    text: 'text-[#ff9500]',
  },
  red: {
    bg: 'bg-[#ff3366]',
    glow: 'shadow-[0_0_10px_#ff3366,0_0_20px_#ff3366]',
    text: 'text-[#ff3366]',
  },
  blue: {
    bg: 'bg-[#00b4d8]',
    glow: 'shadow-[0_0_10px_#00b4d8,0_0_20px_#00b4d8]',
    text: 'text-[#00b4d8]',
  },
}

const sizes = {
  sm: 'w-2 h-2',
  md: 'w-3 h-3',
  lg: 'w-4 h-4',
}

export function LedIndicator({
  status,
  label,
  value,
  pulse = false,
  size = 'md',
  className,
}: LedIndicatorProps) {
  const colors = statusColors[status]

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* LED */}
      <div className="relative">
        <div
          className={cn(
            'rounded-full transition-all duration-300',
            sizes[size],
            colors.bg,
            status !== 'off' && colors.glow,
            pulse && status !== 'off' && 'animate-pulse'
          )}
        />
        {/* Reflet */}
        <div
          className={cn(
            'absolute top-0 left-0 rounded-full bg-white/40',
            size === 'sm' && 'w-1 h-0.5',
            size === 'md' && 'w-1.5 h-0.5',
            size === 'lg' && 'w-2 h-1'
          )}
          style={{ transform: 'translate(25%, 25%)' }}
        />
      </div>

      {/* Label et valeur */}
      {(label || value !== undefined) && (
        <div className="flex items-center gap-2">
          {label && (
            <span className="text-sm text-gray-400 uppercase tracking-wide">
              {label}
            </span>
          )}
          {value !== undefined && (
            <span className={cn('text-sm font-bold', colors.text)}>
              {value}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

// Variante compacte pour la barre d'alertes
interface AlertLedProps {
  status: 'off' | 'green' | 'orange' | 'red' | 'blue'
  label: string
  count: number
  onClick?: () => void
}

export function AlertLed({ status, label, count, onClick }: AlertLedProps) {
  const colors = statusColors[status]
  const isActive = status !== 'off' && count > 0

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-4 py-2 rounded-lg transition-all',
        'bg-[#1a1a2e]/50 border border-white/5',
        isActive && 'hover:bg-[#1a1a2e] cursor-pointer',
        !isActive && 'opacity-50 cursor-default'
      )}
      disabled={!isActive}
    >
      <div
        className={cn(
          'w-2 h-2 rounded-full transition-all',
          colors.bg,
          isActive && colors.glow,
          isActive && 'animate-pulse'
        )}
      />
      <span className="text-xs text-gray-400 uppercase tracking-wide">
        {label}
      </span>
      <span className={cn('text-sm font-bold', isActive ? colors.text : 'text-gray-600')}>
        {count}
      </span>
    </button>
  )
}
