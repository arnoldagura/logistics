import { Package, Truck, CheckCircle, Clock, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardsProps {
  stats: {
    total: number
    pending: number
    pickedUp: number
    delivered: number
    totalRevenue: number
  } | null
  isLoading?: boolean
}

interface StatCardProps {
  label: string
  value: string | number
  icon: React.ReactNode
  accentColor: string
  glowColor: string
  isLoading?: boolean
}

function StatCard({ label, value, icon, accentColor, glowColor, isLoading }: StatCardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg border border-zinc-800/80 bg-zinc-900/60 backdrop-blur-sm',
        'transition-all duration-300 hover:border-zinc-700 hover:bg-zinc-900/80',
        'group'
      )}
    >
      {/* Glow effect */}
      <div
        className={cn(
          'absolute -top-12 -right-12 h-24 w-24 rounded-full blur-2xl opacity-20 transition-opacity group-hover:opacity-40',
          glowColor
        )}
      />

      <div className="relative p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">{label}</p>
            {isLoading ? (
              <div className="h-8 w-16 animate-pulse rounded bg-zinc-800" />
            ) : (
              <p className={cn('text-2xl font-bold tracking-tight font-mono', accentColor)}>
                {value}
              </p>
            )}
          </div>
          <div
            className={cn(
              'rounded-md border p-2',
              'bg-zinc-800/50 border-zinc-700/50',
              'transition-colors group-hover:border-zinc-600'
            )}
          >
            {icon}
          </div>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className={cn('h-0.5 w-full', accentColor.replace('text-', 'bg-').replace('-400', '-500/50'))} />
    </div>
  )
}

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  const cardData = [
    {
      label: 'Total Deliveries',
      value: stats?.total ?? 0,
      icon: <Package className="h-5 w-5 text-blue-400" />,
      accentColor: 'text-blue-400',
      glowColor: 'bg-blue-500',
    },
    {
      label: 'Pending',
      value: stats?.pending ?? 0,
      icon: <Clock className="h-5 w-5 text-amber-400" />,
      accentColor: 'text-amber-400',
      glowColor: 'bg-amber-500',
    },
    {
      label: 'In Transit',
      value: stats?.pickedUp ?? 0,
      icon: <Truck className="h-5 w-5 text-cyan-400" />,
      accentColor: 'text-cyan-400',
      glowColor: 'bg-cyan-500',
    },
    {
      label: 'Delivered',
      value: stats?.delivered ?? 0,
      icon: <CheckCircle className="h-5 w-5 text-emerald-400" />,
      accentColor: 'text-emerald-400',
      glowColor: 'bg-emerald-500',
    },
    {
      label: 'Revenue',
      value: stats ? `₱${stats.totalRevenue.toLocaleString()}` : '₱0',
      icon: <TrendingUp className="h-5 w-5 text-violet-400" />,
      accentColor: 'text-violet-400',
      glowColor: 'bg-violet-500',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {cardData.map((card) => (
        <StatCard key={card.label} {...card} isLoading={isLoading} />
      ))}
    </div>
  )
}
