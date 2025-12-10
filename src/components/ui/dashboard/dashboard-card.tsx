'use client'

import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface DashboardCardProps {
  children: ReactNode
  className?: string
  title?: string
  icon?: ReactNode
  neonColor?: 'green' | 'orange' | 'red' | 'blue' | 'white'
}

const neonColors = {
  green: 'shadow-[0_0_15px_rgba(0,255,136,0.3)]',
  orange: 'shadow-[0_0_15px_rgba(255,149,0,0.3)]',
  red: 'shadow-[0_0_15px_rgba(255,51,102,0.3)]',
  blue: 'shadow-[0_0_15px_rgba(0,180,216,0.3)]',
  white: 'shadow-[0_0_15px_rgba(255,255,255,0.1)]',
}

const neonBorders = {
  green: 'border-[#00ff88]/30',
  orange: 'border-[#ff9500]/30',
  red: 'border-[#ff3366]/30',
  blue: 'border-[#00b4d8]/30',
  white: 'border-white/10',
}

const neonTextColors = {
  green: 'text-[#00ff88]',
  orange: 'text-[#ff9500]',
  red: 'text-[#ff3366]',
  blue: 'text-[#00b4d8]',
  white: 'text-white',
}

export function DashboardCard({
  children,
  className,
  title,
  icon,
  neonColor = 'white',
}: DashboardCardProps) {
  return (
    <div
      className={cn(
        'relative rounded-xl border bg-[#0a0a0a]/90 backdrop-blur-sm',
        'bg-gradient-to-b from-[#1a1a2e]/50 to-[#0a0a0a]',
        neonBorders[neonColor],
        neonColors[neonColor],
        'transition-all duration-300',
        className
      )}
    >
      {/* Bordure métallique effet */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

      {title && (
        <div className={cn(
          'px-4 py-3 border-b border-white/10 flex items-center gap-2',
          neonTextColors[neonColor]
        )}>
          {icon && <span className="opacity-80">{icon}</span>}
          <h3 className="text-sm font-semibold uppercase tracking-wider">
            {title}
          </h3>
        </div>
      )}

      <div className="relative p-4">
        {children}
      </div>
    </div>
  )
}
