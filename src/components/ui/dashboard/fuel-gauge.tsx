'use client'

import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { AlertTriangle } from 'lucide-react'

interface FuelGaugeProps {
  current: number
  max: number
  label: string
  sublabel?: string
  showValues?: boolean
  compact?: boolean
  className?: string
}

function getColorFromPercentage(percentage: number): {
  color: string
  bgColor: string
  status: 'critical' | 'warning' | 'ok'
} {
  if (percentage <= 15) {
    return { color: '#ff3366', bgColor: 'bg-[#ff3366]', status: 'critical' }
  }
  if (percentage <= 30) {
    return { color: '#ff9500', bgColor: 'bg-[#ff9500]', status: 'warning' }
  }
  return { color: '#00ff88', bgColor: 'bg-[#00ff88]', status: 'ok' }
}

export function FuelGauge({
  current,
  max,
  label,
  sublabel,
  showValues = true,
  compact = false,
  className,
}: FuelGaugeProps) {
  const [animatedWidth, setAnimatedWidth] = useState(0)
  const percentage = max > 0 ? (current / max) * 100 : 0
  const { color, bgColor, status } = getColorFromPercentage(percentage)

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedWidth(percentage)
    }, 100)
    return () => clearTimeout(timer)
  }, [percentage])

  if (compact) {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        {/* Icône carburant */}
        <div className="flex flex-col items-center">
          <svg
            width="20"
            height="24"
            viewBox="0 0 20 24"
            fill="none"
            className="opacity-60"
          >
            <path
              d="M2 4C2 2.89543 2.89543 2 4 2H12C13.1046 2 14 2.89543 14 4V20C14 21.1046 13.1046 22 12 22H4C2.89543 22 2 21.1046 2 20V4Z"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-gray-500"
            />
            <path
              d="M14 8H16C17.1046 8 18 8.89543 18 10V16"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              className="text-gray-500"
            />
            <circle cx="18" cy="18" r="2" fill="currentColor" className="text-gray-500" />
          </svg>
        </div>

        {/* Barre + infos */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400 truncate max-w-[150px]">{label}</span>
            <div className="flex items-center gap-1">
              {status === 'critical' && (
                <AlertTriangle className="w-3 h-3 text-[#ff3366] animate-pulse" />
              )}
              <span className="text-xs font-medium" style={{ color }}>
                {current}/{max}
              </span>
            </div>
          </div>
          <div className="h-2 bg-[#1a1a2e] rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-700 ease-out',
                bgColor
              )}
              style={{
                width: `${animatedWidth}%`,
                boxShadow: `0 0 10px ${color}`,
              }}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {/* Icône carburant style */}
          <svg
            width="24"
            height="28"
            viewBox="0 0 24 28"
            fill="none"
            className="text-gray-400"
          >
            <path
              d="M2 5C2 3.34315 3.34315 2 5 2H15C16.6569 2 18 3.34315 18 5V23C18 24.6569 16.6569 26 15 26H5C3.34315 26 2 24.6569 2 23V5Z"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M18 10H20C21.6569 10 23 11.3431 23 13V20"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="23" cy="23" r="2.5" fill="currentColor" />
            <rect x="5" y="6" width="10" height="6" rx="1" fill="currentColor" opacity="0.3" />
          </svg>
          <div>
            <p className="text-sm font-medium text-gray-200">{label}</p>
            {sublabel && (
              <p className="text-xs text-gray-500">{sublabel}</p>
            )}
          </div>
        </div>
        {status === 'critical' && (
          <AlertTriangle className="w-5 h-5 text-[#ff3366] animate-pulse" />
        )}
      </div>

      {/* Jauge */}
      <div className="relative">
        {/* Labels E et F */}
        <div className="flex justify-between mb-1 px-1">
          <span className="text-[10px] font-bold text-[#ff3366]">E</span>
          <span className="text-[10px] font-bold text-[#00ff88]">F</span>
        </div>

        {/* Barre de jauge */}
        <div className="h-4 bg-[#1a1a2e] rounded-full overflow-hidden relative">
          {/* Graduations */}
          <div className="absolute inset-0 flex justify-between px-2 items-center pointer-events-none">
            {[...Array(9)].map((_, i) => (
              <div
                key={i}
                className="w-px h-2 bg-gray-700"
              />
            ))}
          </div>

          {/* Barre de progression */}
          <div
            className={cn(
              'h-full rounded-full transition-all duration-700 ease-out relative',
              bgColor
            )}
            style={{
              width: `${animatedWidth}%`,
              boxShadow: `0 0 15px ${color}, inset 0 1px 0 rgba(255,255,255,0.3)`,
            }}
          >
            {/* Reflet */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent rounded-full" />
          </div>
        </div>

        {/* Valeurs */}
        {showValues && (
          <div className="flex justify-between mt-2 text-xs">
            <span className="text-gray-500">
              {Math.round(percentage)}%
            </span>
            <span className="font-medium" style={{ color }}>
              {current} / {max}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

// Version mini pour liste
interface MiniFuelGaugeProps {
  percentage: number
  className?: string
}

export function MiniFuelGauge({ percentage, className }: MiniFuelGaugeProps) {
  const { color, bgColor } = getColorFromPercentage(percentage)

  return (
    <div className={cn('w-16 h-1.5 bg-[#1a1a2e] rounded-full overflow-hidden', className)}>
      <div
        className={cn('h-full rounded-full', bgColor)}
        style={{
          width: `${percentage}%`,
          boxShadow: `0 0 4px ${color}`,
        }}
      />
    </div>
  )
}
