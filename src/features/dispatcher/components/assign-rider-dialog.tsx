import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Bike, Truck, Package } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { getAvailableRiders } from '../api'
import { useAssignRider } from '../hooks/use-assign-rider'
import type { Delivery, Rider } from '@/lib/deliveries'

interface AssignRiderDialogProps {
  delivery: Delivery | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const vehicleIcons = {
  motorcycle: Bike,
  van: Package,
  truck: Truck,
}

export function AssignRiderDialog({ delivery, open, onOpenChange }: AssignRiderDialogProps) {
  const [selectedRider, setSelectedRider] = useState<Rider | null>(null)
  const assignRiderMutation = useAssignRider()

  const { data: riders, isLoading } = useQuery({
    queryKey: ['available-riders'],
    queryFn: () => getAvailableRiders(),
    enabled: open,
  })

  const handleAssign = () => {
    if (!delivery || !selectedRider) return

    assignRiderMutation.mutate(
      {
        deliveryId: delivery.id,
        riderId: selectedRider.id,
        riderName: selectedRider.name,
      },
      {
        onSuccess: () => {
          onOpenChange(false)
          setSelectedRider(null)
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold tracking-tight">
            Assign Rider
          </DialogTitle>
          <DialogDescription className="text-zinc-400 text-sm">
            {delivery && (
              <>
                Delivery <span className="font-mono text-cyan-400">{delivery.id}</span> from{' '}
                <span className="text-zinc-300">{delivery.source.name}</span>
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-3">
            Available Riders
          </p>

          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 rounded-lg bg-zinc-800 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {riders?.map((rider) => {
                const Icon = vehicleIcons[rider.vehicle]
                const isSelected = selectedRider?.id === rider.id

                return (
                  <button
                    key={rider.id}
                    onClick={() => setSelectedRider(rider)}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left',
                      isSelected
                        ? 'border-cyan-500/50 bg-cyan-500/10'
                        : 'border-zinc-800 bg-zinc-800/50 hover:border-zinc-700 hover:bg-zinc-800'
                    )}
                  >
                    <div
                      className={cn(
                        'rounded-md p-2',
                        isSelected ? 'bg-cyan-500/20' : 'bg-zinc-700/50'
                      )}
                    >
                      <Icon
                        className={cn(
                          'h-4 w-4',
                          isSelected ? 'text-cyan-400' : 'text-zinc-400'
                        )}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          'text-sm font-medium truncate',
                          isSelected ? 'text-cyan-100' : 'text-zinc-200'
                        )}
                      >
                        {rider.name}
                      </p>
                      <p className="text-xs text-zinc-500 capitalize">
                        {rider.vehicle} • {rider.zone.replace('_', ' ')}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!selectedRider || assignRiderMutation.isPending}
            className="bg-cyan-600 hover:bg-cyan-500 text-white"
          >
            {assignRiderMutation.isPending ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Assigning...
              </>
            ) : (
              'Assign Rider'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
