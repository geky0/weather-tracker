import type { ReactNode } from 'react'

type GlassCardProps = {
  children: ReactNode
  className?: string
  accent?: string
  onClick?: () => void
  active?: boolean
}

export function GlassCard({
  children,
  className = '',
  accent,
  onClick,
  active = false,
}: GlassCardProps) {
  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') onClick()
            }
          : undefined
      }
      className={`glass-card ${active ? 'glass-card-active' : ''} ${className}`}
      style={
        accent
          ? ({ '--accent': accent } as React.CSSProperties)
          : undefined
      }
    >
      {children}
    </div>
  )
}
