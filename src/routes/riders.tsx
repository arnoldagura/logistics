'use client'

import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  Users,
  UserPlus,
  Bike,
  Truck,
  Package,
  MapPin,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Filter,
  CheckCircle,
  Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import {
  getAllRiders,
  getRiderStats,
  createRider,
  updateRiderAvailability,
  deleteRider,
} from '@/features/dispatcher/api'
import type { Rider, Zone } from '@/lib/deliveries'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      refetchOnWindowFocus: false,
    },
  },
})

export const Route = createFileRoute('/riders')({
  component: RidersPage,
})

function RidersPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <RidersContent />
    </QueryClientProvider>
  )
}

function RidersContent() {
  const queryClient = useQueryClient()
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [zoneFilter, setZoneFilter] = useState<string>('all')
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all')

  // Form state
  const [newRiderName, setNewRiderName] = useState('')
  const [newRiderVehicle, setNewRiderVehicle] = useState<'motorcycle' | 'van' | 'truck'>('motorcycle')
  const [newRiderZone, setNewRiderZone] = useState<Zone>('Cebu_City')

  const { data: riders, isLoading: ridersLoading } = useQuery({
    queryKey: ['riders'],
    queryFn: () => getAllRiders(),
  })

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['rider-stats'],
    queryFn: () => getRiderStats(),
  })

  const createMutation = useMutation({
    mutationFn: () =>
      createRider({
        data: {
          name: newRiderName,
          vehicle: newRiderVehicle,
          zone: newRiderZone,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['riders'] })
      queryClient.invalidateQueries({ queryKey: ['rider-stats'] })
      setAddDialogOpen(false)
      setNewRiderName('')
      setNewRiderVehicle('motorcycle')
      setNewRiderZone('Cebu_City')
    },
  })

  const toggleMutation = useMutation({
    mutationFn: ({ riderId, available }: { riderId: string; available: boolean }) =>
      updateRiderAvailability({ data: { riderId, available } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['riders'] })
      queryClient.invalidateQueries({ queryKey: ['rider-stats'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (riderId: string) => deleteRider({ data: { riderId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['riders'] })
      queryClient.invalidateQueries({ queryKey: ['rider-stats'] })
    },
  })

  // Filter riders
  const filteredRiders = riders?.filter((rider) => {
    if (zoneFilter !== 'all' && rider.zone !== zoneFilter) return false
    if (availabilityFilter === 'available' && !rider.available) return false
    if (availabilityFilter === 'busy' && rider.available) return false
    return true
  })

  const vehicleIcons = {
    motorcycle: Bike,
    van: Package,
    truck: Truck,
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative">
        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Users className="h-5 w-5 text-violet-400" />
                </div>
                <h1 className="text-lg font-bold tracking-tight text-zinc-100">
                  Rider Management
                </h1>
                <span className="hidden sm:block text-xs font-mono text-zinc-600 px-2 py-0.5 rounded bg-zinc-800/50 border border-zinc-700/50">
                  FLEET CONTROL
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Link to="/dispatcher">
                  <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-400">
                    Dispatcher
                  </Button>
                </Link>
                <Button
                  onClick={() => setAddDialogOpen(true)}
                  className="bg-violet-600 hover:bg-violet-500"
                  size="sm"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Rider
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard
              label="Total Riders"
              value={stats?.total ?? 0}
              icon={<Users className="h-5 w-5 text-violet-400" />}
              color="violet"
              isLoading={statsLoading}
            />
            <StatCard
              label="Available"
              value={stats?.available ?? 0}
              icon={<CheckCircle className="h-5 w-5 text-emerald-400" />}
              color="emerald"
              isLoading={statsLoading}
            />
            <StatCard
              label="On Delivery"
              value={stats?.onDelivery ?? 0}
              icon={<Clock className="h-5 w-5 text-amber-400" />}
              color="amber"
              isLoading={statsLoading}
            />
            <StatCard
              label="Zones Covered"
              value={3}
              icon={<MapPin className="h-5 w-5 text-cyan-400" />}
              color="cyan"
              isLoading={false}
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 p-3 rounded-lg border border-zinc-800 bg-zinc-900/40">
            <div className="flex items-center gap-2 text-zinc-400">
              <Filter className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Filters</span>
            </div>

            <Select value={zoneFilter} onValueChange={setZoneFilter}>
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

            <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
              <SelectTrigger className="w-[140px] h-8 bg-zinc-800/50 border-zinc-700 text-zinc-200 text-sm">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-700">
                <SelectItem value="all" className="text-zinc-200 focus:bg-zinc-800">
                  All Status
                </SelectItem>
                <SelectItem value="available" className="text-zinc-200 focus:bg-zinc-800">
                  Available
                </SelectItem>
                <SelectItem value="busy" className="text-zinc-200 focus:bg-zinc-800">
                  On Delivery
                </SelectItem>
              </SelectContent>
            </Select>

            {(zoneFilter !== 'all' || availabilityFilter !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setZoneFilter('all')
                  setAvailabilityFilter('all')
                }}
                className="h-8 text-xs text-zinc-400 hover:text-zinc-200"
              >
                Clear
              </Button>
            )}

            <div className="ml-auto text-xs text-zinc-500">
              Showing <span className="text-zinc-300">{filteredRiders?.length ?? 0}</span> riders
            </div>
          </div>

          {/* Riders Grid */}
          {ridersLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-48 rounded-xl border border-zinc-800 bg-zinc-900/40 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredRiders?.map((rider) => {
                const VehicleIcon = vehicleIcons[rider.vehicle]

                return (
                  <div
                    key={rider.id}
                    className={cn(
                      'group relative rounded-xl border bg-zinc-900/60 backdrop-blur-sm overflow-hidden transition-all',
                      rider.available
                        ? 'border-zinc-800 hover:border-zinc-700'
                        : 'border-zinc-800/50 opacity-75'
                    )}
                  >
                    {/* Status indicator */}
                    <div
                      className={cn(
                        'absolute top-0 left-0 right-0 h-1',
                        rider.available ? 'bg-emerald-500' : 'bg-amber-500'
                      )}
                    />

                    <div className="p-5">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              'h-12 w-12 rounded-xl flex items-center justify-center',
                              rider.available
                                ? 'bg-violet-500/10 border border-violet-500/30'
                                : 'bg-zinc-800 border border-zinc-700'
                            )}
                          >
                            <VehicleIcon
                              className={cn(
                                'h-6 w-6',
                                rider.available ? 'text-violet-400' : 'text-zinc-500'
                              )}
                            />
                          </div>
                          <div>
                            <p className="font-semibold text-zinc-100">{rider.name}</p>
                            <p className="text-xs text-zinc-500 font-mono">{rider.id}</p>
                          </div>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-zinc-500">Vehicle</span>
                          <span className="text-zinc-300 capitalize">{rider.vehicle}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-zinc-500">Zone</span>
                          <Badge
                            variant="outline"
                            className="text-xs text-violet-400 bg-violet-500/10 border-violet-500/30"
                          >
                            {rider.zone.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-zinc-500">Status</span>
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-xs',
                              rider.available
                                ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                                : 'text-amber-400 bg-amber-500/10 border-amber-500/30'
                            )}
                          >
                            {rider.available ? 'Available' : 'On Delivery'}
                          </Badge>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-3 border-t border-zinc-800">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            toggleMutation.mutate({
                              riderId: rider.id,
                              available: !rider.available,
                            })
                          }
                          disabled={toggleMutation.isPending}
                          className={cn(
                            'flex-1 h-8 text-xs',
                            rider.available
                              ? 'text-amber-400 hover:bg-amber-500/10'
                              : 'text-emerald-400 hover:bg-emerald-500/10'
                          )}
                        >
                          {rider.available ? (
                            <>
                              <ToggleRight className="h-3.5 w-3.5 mr-1.5" />
                              Set Busy
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="h-3.5 w-3.5 mr-1.5" />
                              Set Available
                            </>
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMutation.mutate(rider.id)}
                          disabled={deleteMutation.isPending}
                          className="h-8 w-8 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </main>
      </div>

      {/* Add Rider Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Rider</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Add a new rider to the fleet
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">Full Name</Label>
              <Input
                value={newRiderName}
                onChange={(e) => setNewRiderName(e.target.value)}
                placeholder="e.g., Juan dela Cruz"
                className="bg-zinc-800/50 border-zinc-700 text-zinc-100"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300">Vehicle Type</Label>
              <Select
                value={newRiderVehicle}
                onValueChange={(v) => setNewRiderVehicle(v as any)}
              >
                <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-zinc-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700">
                  <SelectItem value="motorcycle" className="text-zinc-200 focus:bg-zinc-800">
                    <span className="flex items-center gap-2">
                      <Bike className="h-4 w-4" />
                      Motorcycle
                    </span>
                  </SelectItem>
                  <SelectItem value="van" className="text-zinc-200 focus:bg-zinc-800">
                    <span className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Van
                    </span>
                  </SelectItem>
                  <SelectItem value="truck" className="text-zinc-200 focus:bg-zinc-800">
                    <span className="flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      Truck
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300">Assigned Zone</Label>
              <Select
                value={newRiderZone}
                onValueChange={(v) => setNewRiderZone(v as Zone)}
              >
                <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-zinc-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700">
                  <SelectItem value="Cebu_City" className="text-zinc-200 focus:bg-zinc-800">
                    Cebu City
                  </SelectItem>
                  <SelectItem value="Mandaue" className="text-zinc-200 focus:bg-zinc-800">
                    Mandaue
                  </SelectItem>
                  <SelectItem value="Lapu_Lapu" className="text-zinc-200 focus:bg-zinc-800">
                    Lapu-Lapu
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddDialogOpen(false)}
              className="border-zinc-700"
            >
              Cancel
            </Button>
            <Button
              onClick={() => createMutation.mutate()}
              disabled={!newRiderName.trim() || createMutation.isPending}
              className="bg-violet-600 hover:bg-violet-500"
            >
              {createMutation.isPending ? 'Adding...' : 'Add Rider'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
  color,
  isLoading,
}: {
  label: string
  value: number
  icon: React.ReactNode
  color: 'violet' | 'emerald' | 'amber' | 'cyan'
  isLoading: boolean
}) {
  const colorClasses = {
    violet: 'text-violet-400',
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
    cyan: 'text-cyan-400',
  }

  const glowClasses = {
    violet: 'bg-violet-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    cyan: 'bg-cyan-500',
  }

  return (
    <div className="relative overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/60 backdrop-blur-sm p-4 group transition-all hover:border-zinc-700">
      <div
        className={cn(
          'absolute -top-12 -right-12 h-24 w-24 rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition-opacity',
          glowClasses[color]
        )}
      />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider">{label}</p>
          {isLoading ? (
            <div className="h-8 w-12 bg-zinc-800 rounded animate-pulse mt-1" />
          ) : (
            <p className={cn('text-2xl font-bold font-mono mt-1', colorClasses[color])}>
              {value}
            </p>
          )}
        </div>
        <div className="p-2 rounded-md bg-zinc-800/50 border border-zinc-700/50">
          {icon}
        </div>
      </div>
    </div>
  )
}
