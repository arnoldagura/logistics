'use client'

import { useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  ArrowLeft,
  MapPin,
  Package,
  Truck,
  CheckCircle,
  Clock,
  User,
  Weight,
  Zap,
  Map,
  MoreVertical,
  UserPlus,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  getDeliveryById,
  getAvailableRiders,
  assignRider,
  updateDeliveryStatus,
} from '@/features/dispatcher/api'
import type { DeliveryStatus, Rider } from '@/lib/deliveries'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      refetchOnWindowFocus: false,
    },
  },
})

export const Route = createFileRoute('/delivery/$id')({
  component: DeliveryDetailsPage,
})

function DeliveryDetailsPage() {
  const { id } = Route.useParams()

  return (
    <QueryClientProvider client={queryClient}>
      <DeliveryDetailsContent deliveryId={id} />
    </QueryClientProvider>
  )
}

function DeliveryDetailsContent({ deliveryId }: { deliveryId: string }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [selectedRider, setSelectedRider] = useState<Rider | null>(null)
  const [confirmDeliverOpen, setConfirmDeliverOpen] = useState(false)

  const { data: delivery, isLoading, error } = useQuery({
    queryKey: ['delivery', deliveryId],
    queryFn: () => getDeliveryById({ data: { id: deliveryId } }),
  })

  const { data: availableRiders } = useQuery({
    queryKey: ['available-riders'],
    queryFn: () => getAvailableRiders(),
    enabled: assignDialogOpen,
  })

  const assignMutation = useMutation({
    mutationFn: ({ riderId }: { riderId: string }) =>
      assignRider({ data: { deliveryId, riderId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery', deliveryId] })
      setAssignDialogOpen(false)
      setSelectedRider(null)
    },
  })

  const statusMutation = useMutation({
    mutationFn: ({ status }: { status: DeliveryStatus }) =>
      updateDeliveryStatus({ data: { deliveryId, status } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery', deliveryId] })
      setConfirmDeliverOpen(false)
    },
  })

  if (isLoading) {
    return <DeliveryDetailsSkeleton />
  }

  if (error || !delivery) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-zinc-400">Delivery not found</p>
          <Link to="/dispatcher">
            <Button variant="outline" className="border-zinc-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dispatcher
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const statusConfig: Record<DeliveryStatus, { label: string; color: string; icon: React.ReactNode }> = {
    pending: {
      label: 'Pending',
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      icon: <Clock className="h-4 w-4" />,
    },
    picked_up: {
      label: 'In Transit',
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
      icon: <Truck className="h-4 w-4" />,
    },
    delivered: {
      label: 'Delivered',
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      icon: <CheckCircle className="h-4 w-4" />,
    },
  }

  const currentStatus = statusConfig[delivery.status]

  // Timeline steps
  const timelineSteps = [
    {
      label: 'Order Created',
      time: delivery.createdAt,
      completed: true,
      icon: <Package className="h-4 w-4" />,
    },
    {
      label: 'Rider Assigned',
      time: delivery.rider ? 'Assigned' : null,
      completed: delivery.status !== 'pending',
      icon: <User className="h-4 w-4" />,
    },
    {
      label: 'Picked Up',
      time: delivery.status !== 'pending' ? 'Picked up' : null,
      completed: delivery.status === 'picked_up' || delivery.status === 'delivered',
      icon: <Truck className="h-4 w-4" />,
    },
    {
      label: 'Delivered',
      time: delivery.status === 'delivered' ? 'Completed' : null,
      completed: delivery.status === 'delivered',
      icon: <CheckCircle className="h-4 w-4" />,
    },
  ]

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/dispatcher">
              <Button
                variant="outline"
                size="icon"
                className="border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-zinc-100 font-mono">
                  {delivery.id}
                </h1>
                <Badge variant="outline" className={cn('text-xs', currentStatus.color)}>
                  {currentStatus.icon}
                  <span className="ml-1">{currentStatus.label}</span>
                </Badge>
                {delivery.priority === 'express' && (
                  <Badge variant="outline" className="text-xs text-amber-400 bg-amber-500/10 border-amber-500/30">
                    <Zap className="h-3 w-3 mr-1 fill-amber-400" />
                    Express
                  </Badge>
                )}
              </div>
              <p className="text-sm text-zinc-500 mt-1">
                Created {new Date(delivery.createdAt).toLocaleDateString('en-PH', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {delivery.status === 'pending' && (
              <Button
                onClick={() => setAssignDialogOpen(true)}
                className="bg-cyan-600 hover:bg-cyan-500"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Assign Rider
              </Button>
            )}
            {delivery.status === 'picked_up' && (
              <Button
                onClick={() => setConfirmDeliverOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-500"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark Delivered
              </Button>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Route Card */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-zinc-800">
                <h2 className="text-sm font-semibold text-zinc-200">Route Details</h2>
              </div>
              <div className="p-5 space-y-6">
                {/* Source */}
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                    <MapPin className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Pickup</p>
                    <p className="text-lg font-medium text-zinc-100">{delivery.source.name}</p>
                    <p className="text-sm text-zinc-500">{delivery.source.zone.replace('_', ' ')}</p>
                  </div>
                </div>

                {/* Connector */}
                <div className="ml-5 border-l-2 border-dashed border-zinc-700 h-8" />

                {/* Destination */}
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center shrink-0">
                    <MapPin className="h-5 w-5 text-rose-400" />
                  </div>
                  <div>
                    <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Dropoff</p>
                    <p className="text-lg font-medium text-zinc-100">{delivery.destination.name}</p>
                    <p className="text-sm text-zinc-500">{delivery.destination.zone.replace('_', ' ')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-zinc-200">Map View</h2>
                <Badge variant="outline" className="text-xs text-zinc-500 border-zinc-700">
                  Coming Soon
                </Badge>
              </div>
              <div className="p-5">
                <div className="h-64 rounded-lg bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center">
                  <div className="text-center space-y-3">
                    <div className="h-16 w-16 rounded-full bg-zinc-700/50 flex items-center justify-center mx-auto">
                      <Map className="h-8 w-8 text-zinc-500" />
                    </div>
                    <div>
                      <p className="text-sm text-zinc-400">Interactive Map</p>
                      <p className="text-xs text-zinc-600">Live tracking visualization</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-zinc-800">
                <h2 className="text-sm font-semibold text-zinc-200">Delivery Timeline</h2>
              </div>
              <div className="p-5">
                <div className="space-y-0">
                  {timelineSteps.map((step, index) => (
                    <div key={step.label} className="flex gap-4">
                      {/* Line + Dot */}
                      <div className="flex flex-col items-center">
                        <div
                          className={cn(
                            'h-8 w-8 rounded-full border-2 flex items-center justify-center shrink-0',
                            step.completed
                              ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                              : 'bg-zinc-800 border-zinc-700 text-zinc-600'
                          )}
                        >
                          {step.icon}
                        </div>
                        {index < timelineSteps.length - 1 && (
                          <div
                            className={cn(
                              'w-0.5 h-12',
                              step.completed ? 'bg-cyan-500/50' : 'bg-zinc-700'
                            )}
                          />
                        )}
                      </div>

                      {/* Content */}
                      <div className="pb-8">
                        <p
                          className={cn(
                            'font-medium',
                            step.completed ? 'text-zinc-100' : 'text-zinc-500'
                          )}
                        >
                          {step.label}
                        </p>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          {step.time
                            ? typeof step.time === 'string'
                              ? step.time
                              : new Date(step.time).toLocaleString('en-PH')
                            : 'Pending'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Delivery Info */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-zinc-800">
                <h2 className="text-sm font-semibold text-zinc-200">Delivery Info</h2>
              </div>
              <div className="p-5 space-y-4">
                <InfoRow
                  icon={<User className="h-4 w-4 text-zinc-500" />}
                  label="Rider"
                  value={delivery.rider || 'Unassigned'}
                  valueClass={delivery.rider ? 'text-zinc-100' : 'text-zinc-500'}
                />
                <InfoRow
                  icon={<Weight className="h-4 w-4 text-zinc-500" />}
                  label="Weight"
                  value={`${delivery.weight} kg`}
                />
                <InfoRow
                  icon={<Zap className="h-4 w-4 text-zinc-500" />}
                  label="Priority"
                  value={delivery.priority === 'express' ? 'Express' : 'Normal'}
                  valueClass={delivery.priority === 'express' ? 'text-amber-400' : 'text-zinc-400'}
                />
                <div className="pt-4 border-t border-zinc-800">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-500">Quote</span>
                    <span className="text-2xl font-bold font-mono text-emerald-400">
                      ₱{delivery.quote.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Zone Info */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-zinc-800">
                <h2 className="text-sm font-semibold text-zinc-200">Zone Information</h2>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-500">From Zone</span>
                  <Badge variant="outline" className="text-xs text-violet-400 bg-violet-500/10 border-violet-500/30">
                    {delivery.source.zone.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-500">To Zone</span>
                  <Badge variant="outline" className="text-xs text-blue-400 bg-blue-500/10 border-blue-500/30">
                    {delivery.destination.zone.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assign Rider Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Rider</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Select a rider for delivery {deliveryId}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-2 max-h-64 overflow-y-auto">
            {availableRiders?.map((rider) => (
              <button
                key={rider.id}
                onClick={() => setSelectedRider(rider)}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left',
                  selectedRider?.id === rider.id
                    ? 'border-cyan-500/50 bg-cyan-500/10'
                    : 'border-zinc-800 bg-zinc-800/50 hover:border-zinc-700'
                )}
              >
                <div className="h-10 w-10 rounded-full bg-zinc-700 flex items-center justify-center">
                  <User className="h-5 w-5 text-zinc-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-zinc-200">{rider.name}</p>
                  <p className="text-xs text-zinc-500 capitalize">
                    {rider.vehicle} • {rider.zone.replace('_', ' ')}
                  </p>
                </div>
                {selectedRider?.id === rider.id && (
                  <div className="h-2 w-2 rounded-full bg-cyan-400" />
                )}
              </button>
            ))}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAssignDialogOpen(false)}
              className="border-zinc-700"
            >
              Cancel
            </Button>
            <Button
              onClick={() => selectedRider && assignMutation.mutate({ riderId: selectedRider.id })}
              disabled={!selectedRider || assignMutation.isPending}
              className="bg-cyan-600 hover:bg-cyan-500"
            >
              {assignMutation.isPending ? 'Assigning...' : 'Assign Rider'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Deliver Dialog */}
      <Dialog open={confirmDeliverOpen} onOpenChange={setConfirmDeliverOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Mark as Delivered</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Confirm that delivery {deliveryId} has been completed?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDeliverOpen(false)}
              className="border-zinc-700"
            >
              Cancel
            </Button>
            <Button
              onClick={() => statusMutation.mutate({ status: 'delivered' })}
              disabled={statusMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-500"
            >
              {statusMutation.isPending ? 'Updating...' : 'Confirm Delivered'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function InfoRow({
  icon,
  label,
  value,
  valueClass = 'text-zinc-200',
}: {
  icon: React.ReactNode
  label: string
  value: string
  valueClass?: string
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm text-zinc-500">{label}</span>
      </div>
      <span className={cn('text-sm font-medium', valueClass)}>{value}</span>
    </div>
  )
}

function DeliveryDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="h-8 w-48 bg-zinc-800 rounded animate-pulse mb-8" />
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-64 bg-zinc-900 rounded-xl border border-zinc-800 animate-pulse" />
            <div className="h-64 bg-zinc-900 rounded-xl border border-zinc-800 animate-pulse" />
          </div>
          <div className="space-y-6">
            <div className="h-48 bg-zinc-900 rounded-xl border border-zinc-800 animate-pulse" />
            <div className="h-32 bg-zinc-900 rounded-xl border border-zinc-800 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}
