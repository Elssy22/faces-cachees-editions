'use client'

import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

interface DigitalCounterProps {
  value: number
  label?: string
  digits?: number
  color?: 'green' | 'orange' | 'red' | 'blue' | 'white'
  size?: 'sm' | 'md' | 'lg'
  prefix?: string
  suffix?: string
  animate?: boolean
  className?: string
}

const neonColors = {
  green: '#00ff88',
  orange: '#ff9500',
  red: '#ff3366',
  blue: '#00b4d8',
  white: '#e0e0e0',
}

const sizes = {
  sm: { digitSize: 'text-2xl', labelSize: 'text-xs' },
  md: { digitSize: 'text-4xl', labelSize: 'text-sm' },
  lg: { digitSize: 'text-5xl', labelSize: 'text-base' },
}

export function DigitalCounter({
  value,
  label,
  digits = 0,
  color = 'green',
  size = 'md',
  prefix,
  suffix,
  animate = true,
  className,
}: DigitalCounterProps) {
  const [displayValue, setDisplayValue] = useState(animate ? 0 : value)
  const neonColor = neonColors[color]
  const { digitSize, labelSize } = sizes[size]

  useEffect(() => {
    if (!animate) {
      setDisplayValue(value)
      return
    }

    // Animation de comptage
    const duration = 1000
    const steps = 30
    const increment = value / steps
    let current = 0
    let step = 0

    const timer = setInterval(() => {
      step++
      current = Math.min(Math.round(increment * step), value)
      setDisplayValue(current)

      if (step >= steps) {
        clearInterval(timer)
        setDisplayValue(value)
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [value, animate])

  const formattedValue = digits > 0
    ? displayValue.toFixed(digits)
    : displayValue.toLocaleString('fr-FR')

  return (
    <div className={cn('flex flex-col items-center', className)}>
      {/* Écran LCD */}
      <div
        className={cn(
          'relative px-4 py-2 rounded-lg',
          'bg-[#0a0a0a] border border-[#2a2a3e]',
          'shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]'
        )}
      >
        {/* Reflet d'écran */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-lg pointer-events-none" />

        {/* Valeur */}
        <div className="flex items-baseline gap-1">
          {prefix && (
            <span
              className={cn('font-mono', size === 'sm' ? 'text-lg' : 'text-2xl')}
              style={{ color: neonColor, textShadow: `0 0 10px ${neonColor}` }}
            >
              {prefix}
            </span>
          )}
          <span
            className={cn(
              'font-mono font-bold tracking-wider',
              digitSize
            )}
            style={{
              color: neonColor,
              textShadow: `0 0 10px ${neonColor}, 0 0 20px ${neonColor}`,
              fontFamily: "'Courier New', monospace",
            }}
          >
            {formattedValue}
          </span>
          {suffix && (
            <span
              className={cn('font-mono', size === 'sm' ? 'text-sm' : 'text-lg')}
              style={{ color: neonColor, textShadow: `0 0 10px ${neonColor}` }}
            >
              {suffix}
            </span>
          )}
        </div>
      </div>

      {/* Label */}
      {label && (
        <span className={cn('mt-2 text-gray-400 uppercase tracking-wider', labelSize)}>
          {label}
        </span>
      )}
    </div>
  )
}

// Variante segment 7 segments style LCD
interface SegmentDisplayProps {
  value: number | string
  color?: 'green' | 'orange' | 'red' | 'blue'
  className?: string
}

export function SegmentDisplay({ value, color = 'green', className }: SegmentDisplayProps) {
  const neonColor = neonColors[color]
  const displayStr = String(value).padStart(4, ' ')

  return (
    <div
      className={cn(
        'inline-flex gap-1 px-3 py-2 rounded bg-[#0a0a0a] border border-[#1a1a2e]',
        className
      )}
    >
      {displayStr.split('').map((char, i) => (
        <span
          key={i}
          className="font-mono text-2xl font-bold w-5 text-center"
          style={{
            color: char === ' ' ? '#1a1a2e' : neonColor,
            textShadow: char === ' ' ? 'none' : `0 0 8px ${neonColor}`,
            fontFamily: "'Courier New', monospace",
          }}
        >
          {char === ' ' ? '0' : char}
        </span>
      ))}
    </div>
  )
}

// Compteur avec icône style stat card
interface StatCounterProps {
  value: number
  label: string
  icon: React.ReactNode
  color?: 'green' | 'orange' | 'red' | 'blue'
  trend?: { value: number; isPositive: boolean }
  className?: string
}

export function StatCounter({
  value,
  label,
  icon,
  color = 'blue',
  trend,
  className,
}: StatCounterProps) {
  const neonColor = neonColors[color]

  return (
    <div className={cn('flex items-center gap-4', className)}>
      {/* Icône */}
      <div
        className="p-3 rounded-lg bg-[#1a1a2e]"
        style={{
          boxShadow: `0 0 15px ${neonColor}30`,
          color: neonColor,
        }}
      >
        {icon}
      </div>

      {/* Valeur et label */}
      <div>
        <div className="flex items-baseline gap-2">
          <span
            className="text-3xl font-bold font-mono"
            style={{
              color: neonColor,
              textShadow: `0 0 10px ${neonColor}`,
            }}
          >
            {value.toLocaleString('fr-FR')}
          </span>
          {trend && (
            <span
              className={cn(
                'text-xs font-medium',
                trend.isPositive ? 'text-[#00ff88]' : 'text-[#ff3366]'
              )}
            >
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
          )}
        </div>
        <span className="text-sm text-gray-400 uppercase tracking-wide">
          {label}
        </span>
      </div>
    </div>
  )
}
