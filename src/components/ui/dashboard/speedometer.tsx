'use client'

import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

interface SpeedometerProps {
  value: number
  max: number
  label?: string
  unit?: string
  size?: 'sm' | 'md' | 'lg'
  color?: 'green' | 'orange' | 'red' | 'blue'
  showTicks?: boolean
  className?: string
}

const neonColors = {
  green: '#00ff88',
  orange: '#ff9500',
  red: '#ff3366',
  blue: '#00b4d8',
}

const sizes = {
  sm: { width: 120, height: 80, fontSize: 'text-lg', tickCount: 5 },
  md: { width: 180, height: 110, fontSize: 'text-xl', tickCount: 5 },
  lg: { width: 220, height: 130, fontSize: 'text-2xl', tickCount: 7 },
}

export function Speedometer({
  value,
  max,
  label,
  unit,
  size = 'md',
  color = 'blue',
  showTicks = true,
  className,
}: SpeedometerProps) {
  const [animatedAngle, setAnimatedAngle] = useState(-135)
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0
  const targetAngle = -135 + (percentage / 100) * 270
  const { width, height, fontSize, tickCount } = sizes[size]
  const neonColor = neonColors[color]

  const centerX = width / 2
  const centerY = height * 0.65
  const radius = Math.min(width, height) * 0.55

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedAngle(targetAngle)
    }, 100)
    return () => clearTimeout(timer)
  }, [targetAngle])

  // Calcul des graduations
  const ticks = []
  for (let i = 0; i <= tickCount - 1; i++) {
    const tickAngle = -135 + (i / (tickCount - 1)) * 270
    const tickRadian = (tickAngle * Math.PI) / 180
    const innerRadius = radius - 8
    const outerRadius = radius
    const x1 = centerX + innerRadius * Math.cos(tickRadian)
    const y1 = centerY + innerRadius * Math.sin(tickRadian)
    const x2 = centerX + outerRadius * Math.cos(tickRadian)
    const y2 = centerY + outerRadius * Math.sin(tickRadian)

    // Label de graduation
    const labelRadius = radius - 20
    const labelX = centerX + labelRadius * Math.cos(tickRadian)
    const labelY = centerY + labelRadius * Math.sin(tickRadian)
    const labelValue = Math.round((i / (tickCount - 1)) * max)

    ticks.push({ x1, y1, x2, y2, labelX, labelY, labelValue })
  }

  // Calcul de l'aiguille
  const needleAngle = (animatedAngle * Math.PI) / 180
  const needleLength = radius - 25
  const needleX = centerX + needleLength * Math.cos(needleAngle)
  const needleY = centerY + needleLength * Math.sin(needleAngle)

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <div className="relative" style={{ width, height: height + 60 }}>
        <svg
          width={width}
          height={height + 60}
          className="overflow-visible"
        >
          {/* Arc de fond */}
          <path
            d={describeArc(centerX, centerY, radius, -135, 135)}
            fill="none"
            stroke="#1a1a2e"
            strokeWidth="8"
            strokeLinecap="round"
          />

          {/* Arc coloré de progression */}
          <path
            d={describeArc(centerX, centerY, radius, -135, animatedAngle)}
            fill="none"
            stroke={neonColor}
            strokeWidth="8"
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
            style={{
              filter: `drop-shadow(0 0 6px ${neonColor})`,
            }}
          />

          {/* Graduations */}
          {showTicks && ticks.map((tick, i) => {
            // Cacher les labels des graduations du bas (angles entre 0° et 135°)
            const tickAngle = -135 + (i / (tickCount - 1)) * 270
            const showLabel = size !== 'sm' && (tickAngle < 20 || tickAngle > 115)

            return (
              <g key={i}>
                <line
                  x1={tick.x1}
                  y1={tick.y1}
                  x2={tick.x2}
                  y2={tick.y2}
                  stroke="#4a4a5a"
                  strokeWidth="2"
                />
                {showLabel && (
                  <text
                    x={tick.labelX}
                    y={tick.labelY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-gray-500 text-[8px]"
                  >
                    {tick.labelValue}
                  </text>
                )}
              </g>
            )
          })}

          {/* Centre de l'aiguille */}
          <circle
            cx={centerX}
            cy={centerY}
            r="8"
            fill="#2a2a3e"
            stroke={neonColor}
            strokeWidth="2"
            style={{
              filter: `drop-shadow(0 0 4px ${neonColor})`,
            }}
          />

          {/* Aiguille */}
          <line
            x1={centerX}
            y1={centerY}
            x2={needleX}
            y2={needleY}
            stroke={neonColor}
            strokeWidth="3"
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
            style={{
              filter: `drop-shadow(0 0 4px ${neonColor})`,
            }}
          />

          {/* Point lumineux au bout de l'aiguille */}
          <circle
            cx={needleX}
            cy={needleY}
            r="3"
            fill={neonColor}
            className="transition-all duration-700 ease-out"
            style={{
              filter: `drop-shadow(0 0 6px ${neonColor})`,
            }}
          />

          {/* Label sous le cadran */}
          {label && (
            <text
              x={centerX}
              y={centerY + radius + 18}
              textAnchor="middle"
              className="fill-gray-400 uppercase"
              style={{ fontSize: '11px', letterSpacing: '0.05em' }}
            >
              {label}
            </text>
          )}

          {/* Valeur affichée sous le label */}
          <text
            x={centerX}
            y={centerY + radius + 38}
            textAnchor="middle"
            className={cn(fontSize, 'font-bold')}
            style={{ fill: neonColor, filter: `drop-shadow(0 0 6px ${neonColor})` }}
          >
            {typeof value === 'number' ? value.toLocaleString('fr-FR') : value}
          </text>

          {/* Unité sous la valeur */}
          {unit && (
            <text
              x={centerX}
              y={centerY + radius + 52}
              textAnchor="middle"
              className="fill-gray-500"
              style={{ fontSize: '10px' }}
            >
              {unit}
            </text>
          )}
        </svg>
      </div>
    </div>
  )
}

// Helper pour dessiner un arc SVG
function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number): string {
  const start = polarToCartesian(x, y, radius, endAngle)
  const end = polarToCartesian(x, y, radius, startAngle)
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'

  return [
    'M', start.x, start.y,
    'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
  ].join(' ')
}

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = (angleInDegrees * Math.PI) / 180
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  }
}
