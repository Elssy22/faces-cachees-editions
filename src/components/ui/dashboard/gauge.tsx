'use client'

import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

interface GaugeProps {
  value: number
  max: number
  label?: string
  unit?: string
  size?: 'sm' | 'md' | 'lg'
  color?: 'green' | 'orange' | 'red' | 'blue' | 'auto'
  showPercentage?: boolean
  className?: string
}

const neonColors = {
  green: '#00ff88',
  orange: '#ff9500',
  red: '#ff3366',
  blue: '#00b4d8',
}

const sizes = {
  sm: { width: 100, strokeWidth: 8, fontSize: 'text-lg' },
  md: { width: 140, strokeWidth: 10, fontSize: 'text-2xl' },
  lg: { width: 180, strokeWidth: 12, fontSize: 'text-3xl' },
}

function getAutoColor(percentage: number): 'green' | 'orange' | 'red' {
  if (percentage >= 50) return 'green'
  if (percentage >= 20) return 'orange'
  return 'red'
}

export function Gauge({
  value,
  max,
  label,
  unit,
  size = 'md',
  color = 'auto',
  showPercentage = false,
  className,
}: GaugeProps) {
  const [animatedValue, setAnimatedValue] = useState(0)
  const percentage = max > 0 ? (value / max) * 100 : 0
  const { width, strokeWidth, fontSize } = sizes[size]
  const radius = (width - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (animatedValue / 100) * circumference

  const activeColor = color === 'auto' ? getAutoColor(percentage) : color
  const neonColor = neonColors[activeColor]

  // Animation au montage
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(percentage)
    }, 100)
    return () => clearTimeout(timer)
  }, [percentage])

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <div className="relative" style={{ width, height: width }}>
        <svg
          width={width}
          height={width}
          className="transform -rotate-90"
        >
          {/* Fond du cercle */}
          <circle
            cx={width / 2}
            cy={width / 2}
            r={radius}
            fill="none"
            stroke="#1a1a2e"
            strokeWidth={strokeWidth}
          />
          {/* Arc de progression */}
          <circle
            cx={width / 2}
            cy={width / 2}
            r={radius}
            fill="none"
            stroke={neonColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-700 ease-out"
            style={{
              filter: `drop-shadow(0 0 6px ${neonColor})`,
            }}
          />
        </svg>

        {/* Valeur centrale */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={cn(fontSize, 'font-bold transition-colors duration-300')}
            style={{ color: neonColor, textShadow: `0 0 10px ${neonColor}` }}
          >
            {showPercentage ? `${Math.round(percentage)}%` : value}
          </span>
          {unit && !showPercentage && (
            <span className="text-xs text-gray-500 uppercase">{unit}</span>
          )}
        </div>
      </div>

      {label && (
        <span className="mt-2 text-sm text-gray-400 uppercase tracking-wide text-center">
          {label}
        </span>
      )}
    </div>
  )
}

// Variante demi-cercle pour le speedometer
interface HalfGaugeProps {
  value: number
  max: number
  label?: string
  size?: 'sm' | 'md' | 'lg'
  color?: 'green' | 'orange' | 'red' | 'blue'
  className?: string
}

export function HalfGauge({
  value,
  max,
  label,
  size = 'md',
  color = 'blue',
  className,
}: HalfGaugeProps) {
  const [animatedValue, setAnimatedValue] = useState(0)
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0
  const { width, strokeWidth, fontSize } = sizes[size]
  const radius = (width - strokeWidth) / 2
  const halfCircumference = Math.PI * radius
  const strokeDashoffset = halfCircumference - (animatedValue / 100) * halfCircumference

  const neonColor = neonColors[color]

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(percentage)
    }, 100)
    return () => clearTimeout(timer)
  }, [percentage])

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <div className="relative" style={{ width, height: width / 2 + 20 }}>
        <svg
          width={width}
          height={width / 2 + 20}
          className="overflow-visible"
        >
          {/* Fond du demi-cercle */}
          <path
            d={`M ${strokeWidth / 2} ${width / 2} A ${radius} ${radius} 0 0 1 ${width - strokeWidth / 2} ${width / 2}`}
            fill="none"
            stroke="#1a1a2e"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Arc de progression */}
          <path
            d={`M ${strokeWidth / 2} ${width / 2} A ${radius} ${radius} 0 0 1 ${width - strokeWidth / 2} ${width / 2}`}
            fill="none"
            stroke={neonColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={halfCircumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-700 ease-out"
            style={{
              filter: `drop-shadow(0 0 6px ${neonColor})`,
            }}
          />
        </svg>

        {/* Valeur */}
        <div
          className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center"
          style={{ bottom: 0 }}
        >
          <span
            className={cn(fontSize, 'font-bold')}
            style={{ color: neonColor, textShadow: `0 0 10px ${neonColor}` }}
          >
            {value.toLocaleString('fr-FR')}
          </span>
        </div>
      </div>

      {label && (
        <span className="text-sm text-gray-400 uppercase tracking-wide text-center">
          {label}
        </span>
      )}
    </div>
  )
}
