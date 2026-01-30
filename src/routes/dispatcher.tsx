'use client'

import { Suspense, useState, lazy } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { z } from 'zod'
import { Filter, Radio, RotateCcw, Map, Table2, Calculator, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { DeliveryStatus, Zone } from '@/lib/deliveries'
import { getDeliveries, getDeliveryStats } from '@/features/dispatcher/api'
import {
  StatsCards,
  TableSkeleton,
  DeliveryTable,
  QuoteCalculator,
  CreateDeliveryDialog,
} from '@/features/dispatcher/components'

// Lazy load the map component to avoid SSR issues with Leaflet
const DeliveryMap = lazy(() => import('@/features/dispatcher/components/delivery-map'))

// Search params validation schema
const dispatcherSearchSchema = z.object({
  delivery_status: DeliveryStatus.optional(),
  zone: Zone.optional(),
})

// Create query client singleton
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      refetchOnWindowFocus: false,
    },
  },
})

export const Route = createFileRoute('/dispatcher')({
  validateSearch: dispatcherSearchSchema,
  component: DispatcherPage,
})

function DispatcherPage() {
  const search = Route.useSearch()

  return (
    <QueryClientProvider client={queryClient}>
      <DispatcherContent search={search} />
    </QueryClientProvider>
  )
}

interface DispatcherContentProps {
  search: {
    delivery_status?: 'pending' | 'picked_up' | 'delivered'
    zone?: 'Mandaue' | 'Cebu_City' | 'Lapu_Lapu'
  }
}

function DispatcherContent({ search }: DispatcherContentProps) {
  const navigate = useNavigate({ from: '/dispatcher' })
  const { delivery_status, zone } = search

  // State for selected delivery and view mode
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string | null>(null)
  const [showQuoteCalculator, setShowQuoteCalculator] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  // Fetch stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['delivery-stats'],
    queryFn: () => getDeliveryStats(),
  })

  // Fetch deliveries
  const { data: deliveries, isLoading: deliveriesLoading } = useQuery({
    queryKey: ['deliveries'],
    queryFn: () => getDeliveries(),
  })

  const updateFilters = (updates: { delivery_status?: string; zone?: string }) => {
    navigate({
      search: (prev) => ({
        ...prev,
        delivery_status:
          updates.delivery_status === 'all' ? undefined : (updates.delivery_status as any),
        zone: updates.zone === 'all' ? undefined : (updates.zone as any),
      }),
    })
  }

  const clearFilters = () => {
    navigate({
      search: {},
    })
  }

  const hasFilters = delivery_status || zone

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Ambient background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-zinc-950" />
      </div>

      <div className="relative">
        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Radio className="h-5 w-5 text-cyan-400" />
                    <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <h1 className="text-lg font-bold tracking-tight text-zinc-100">
                    Dispatch Control
                  </h1>
                </div>
                <span className="hidden sm:block text-xs font-mono text-zinc-600 px-2 py-0.5 rounded bg-zinc-800/50 border border-zinc-700/50">
                  CEBU METRO
                </span>
              </div>

              <div className="flex items-center gap-4">
                <Button
                  onClick={() => setShowCreateDialog(true)}
                  size="sm"
                  className="bg-cyan-600 hover:bg-cyan-500 text-white h-8"
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  New Delivery
                </Button>
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <span className="hidden sm:block">System Status:</span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-emerald-400 font-medium">Operational</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Stats Cards */}
          <StatsCards stats={stats ?? null} isLoading={statsLoading} />

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-3 p-3 rounded-lg border border-zinc-800 bg-zinc-900/40">
            <div className="flex items-center gap-2 text-zinc-400">
              <Filter className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Filters</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 flex-1">
              {/* Status Filter */}
              <Select
                value={delivery_status ?? 'all'}
                onValueChange={(v) => updateFilters({ delivery_status: v })}
              >
                <SelectTrigger className="w-[140px] h-8 bg-zinc-800/50 border-zinc-700 text-zinc-200 text-sm">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700">
                  <SelectItem value="all" className="text-zinc-200 focus:bg-zinc-800">
                    All Statuses
                  </SelectItem>
                  <SelectItem value="pending" className="text-zinc-200 focus:bg-zinc-800">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-amber-400" />
                      Pending
                    </span>
                  </SelectItem>
                  <SelectItem value="picked_up" className="text-zinc-200 focus:bg-zinc-800">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-cyan-400" />
                      In Transit
                    </span>
                  </SelectItem>
                  <SelectItem value="delivered" className="text-zinc-200 focus:bg-zinc-800">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      Delivered
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Zone Filter */}
              <Select
                value={zone ?? 'all'}
                onValueChange={(v) => updateFilters({ zone: v })}
              >
                <SelectTrigger className="w-[140px] h-8 bg-zinc-800/50 border-zinc-700 text-zinc-200 text-sm">
                  <SelectValue placeholder="All Zones" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700">
                  <SelectItem value="all" className="text-zinc-200 focus:bg-zinc-800">
                    All Zones
                  </SelectItem>
                  <SelectItem value="Mandaue" className="text-zinc-200 focus:bg-zinc-800">
                    Mandaue
                  </SelectItem>
                  <SelectItem value="Cebu_City" className="text-zinc-200 focus:bg-zinc-800">
                    Cebu City
                  </SelectItem>
                  <SelectItem value="Lapu_Lapu" className="text-zinc-200 focus:bg-zinc-800">
                    Lapu-Lapu
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Clear Filters */}
              {hasFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-8 text-xs text-zinc-400 hover:text-zinc-200"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Clear
                </Button>
              )}
            </div>

            {/* Active filter badges */}
            {hasFilters && (
              <div className="flex items-center gap-1.5">
                {delivery_status && (
                  <span
                    className={cn(
                      'text-xs px-2 py-0.5 rounded-full border',
                      delivery_status === 'pending' &&
                        'bg-amber-500/10 text-amber-400 border-amber-500/30',
                      delivery_status === 'picked_up' &&
                        'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
                      delivery_status === 'delivered' &&
                        'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    )}
                  >
                    {delivery_status === 'picked_up' ? 'In Transit' : delivery_status}
                  </span>
                )}
                {zone && (
                  <span className="text-xs px-2 py-0.5 rounded-full border bg-violet-500/10 text-violet-400 border-violet-500/30">
                    {zone.replace('_', ' ')}
                  </span>
                )}
              </div>
            )}

            {/* Quote Calculator Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowQuoteCalculator(!showQuoteCalculator)}
              className={cn(
                'h-8 text-xs ml-auto',
                showQuoteCalculator ? 'text-cyan-400 bg-cyan-500/10' : 'text-zinc-400 hover:text-zinc-200'
              )}
            >
              <Calculator className="h-3.5 w-3.5 mr-1.5" />
              Quote Calculator
            </Button>
          </div>

          {/* Map + Table Side-by-Side Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Interactive Map */}
            <div className="xl:sticky xl:top-20 xl:self-start">
              <Suspense fallback={
                <div className="h-[500px] rounded-xl border border-zinc-800 bg-zinc-900/60 flex items-center justify-center">
                  <div className="flex items-center gap-2 text-zinc-500">
                    <Map className="h-5 w-5 animate-pulse" />
                    <span className="text-sm">Loading map...</span>
                  </div>
                </div>
              }>
                <DeliveryMap
                  deliveries={deliveries ?? []}
                  selectedDeliveryId={selectedDeliveryId}
                  onDeliverySelect={setSelectedDeliveryId}
                  statusFilter={delivery_status}
                  zoneFilter={zone}
                  className="h-[500px]"
                />
              </Suspense>
            </div>

            {/* Data Table */}
            <div className="space-y-4">
              {/* Table Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Table2 className="h-4 w-4 text-zinc-500" />
                  <span className="text-sm font-medium text-zinc-300">Deliveries</span>
                  <span className="text-xs text-zinc-600 font-mono">
                    ({deliveries?.length ?? 0} total)
                  </span>
                </div>
                {selectedDeliveryId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedDeliveryId(null)}
                    className="h-7 text-xs text-zinc-400 hover:text-zinc-200"
                  >
                    Clear selection
                  </Button>
                )}
              </div>

              {/* Data Table with Streaming SSR */}
              <Suspense fallback={<TableSkeleton rows={10} />}>
                {deliveriesLoading ? (
                  <TableSkeleton rows={10} />
                ) : (
                  <DeliveryTable
                    data={deliveries ?? []}
                    statusFilter={delivery_status}
                    zoneFilter={zone}
                    selectedDeliveryId={selectedDeliveryId}
                    onDeliverySelect={setSelectedDeliveryId}
                  />
                )}
              </Suspense>
            </div>
          </div>

          {/* Quote Calculator Panel (Collapsible) */}
          {showQuoteCalculator && (
            <div className="fixed bottom-4 right-4 z-50 w-80 animate-in slide-in-from-bottom-4 duration-200">
              <QuoteCalculator />
            </div>
          )}
        </main>

        {/* Create Delivery Dialog */}
        <CreateDeliveryDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
        />

        {/* Footer */}
        <footer className="border-t border-zinc-800/50 mt-12">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-zinc-600">
              <span>Cebu Metro Logistics Dispatch System</span>
              <span className="font-mono">v1.0.0 - TanStack Start</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
