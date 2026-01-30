import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Package, MapPin, Weight, Zap, Loader2, ArrowRight } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { createDelivery, getLocations, calculateDeliveryQuote } from '../api'
import type { Location } from '@/lib/deliveries'

interface CreateDeliveryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateDeliveryDialog({ open, onOpenChange }: CreateDeliveryDialogProps) {
  const queryClient = useQueryClient()
  const [source, setSource] = useState<string>('')
  const [destination, setDestination] = useState<string>('')
  const [weight, setWeight] = useState<string>('1')
  const [priority, setPriority] = useState<'normal' | 'express'>('normal')
  const [quotePreview, setQuotePreview] = useState<number | null>(null)

  const { data: locations } = useQuery({
    queryKey: ['locations'],
    queryFn: () => getLocations(),
    enabled: open,
  })

  const createMutation = useMutation({
    mutationFn: () =>
      createDelivery({
        data: {
          sourceLocationName: source,
          destinationLocationName: destination,
          weight: parseFloat(weight) || 1,
          priority,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveries'] })
      queryClient.invalidateQueries({ queryKey: ['delivery-stats'] })
      resetForm()
      onOpenChange(false)
    },
  })

  const resetForm = () => {
    setSource('')
    setDestination('')
    setWeight('1')
    setPriority('normal')
    setQuotePreview(null)
  }

  // Calculate quote preview when inputs change
  useEffect(() => {
    if (!source || !destination || !locations) {
      setQuotePreview(null)
      return
    }

    const sourceLocation = locations.find((l) => l.name === source)
    const destLocation = locations.find((l) => l.name === destination)

    if (!sourceLocation || !destLocation || source === destination) {
      setQuotePreview(null)
      return
    }

    calculateDeliveryQuote({
      data: {
        fromLat: sourceLocation.coordinates.lat,
        fromLng: sourceLocation.coordinates.lng,
        toLat: destLocation.coordinates.lat,
        toLng: destLocation.coordinates.lng,
        weight: parseFloat(weight) || 1,
        priority,
      },
    }).then((result) => {
      setQuotePreview(result.total)
    })
  }, [source, destination, weight, priority, locations])

  const groupedLocations = locations?.reduce(
    (acc, loc) => {
      const zone = loc.zone.replace('_', ' ')
      if (!acc[zone]) acc[zone] = []
      acc[zone].push(loc)
      return acc
    },
    {} as Record<string, Location[]>
  )

  const canSubmit = source && destination && source !== destination && parseFloat(weight) > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-cyan-400" />
            Create New Delivery
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Enter delivery details to generate a quote and create order
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Route Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 uppercase tracking-wider">
              <MapPin className="h-3 w-3" />
              Route
            </div>

            <div className="grid gap-3">
              {/* Source */}
              <div className="space-y-2">
                <Label className="text-xs text-zinc-400">Pickup Location</Label>
                <Select value={source} onValueChange={setSource}>
                  <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-zinc-100">
                    <SelectValue placeholder="Select pickup point" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-700">
                    {groupedLocations &&
                      Object.entries(groupedLocations).map(([zone, locs]) => (
                        <div key={zone}>
                          <div className="px-2 py-1.5 text-xs font-mono text-zinc-500 uppercase tracking-wider">
                            {zone}
                          </div>
                          {locs.map((loc) => (
                            <SelectItem
                              key={loc.name}
                              value={loc.name}
                              className="text-zinc-200 focus:bg-zinc-800 focus:text-zinc-100"
                              disabled={loc.name === destination}
                            >
                              <span className="flex items-center gap-2">
                                <MapPin className="h-3 w-3 text-emerald-400" />
                                {loc.name}
                              </span>
                            </SelectItem>
                          ))}
                        </div>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Arrow indicator */}
              <div className="flex justify-center">
                <ArrowRight className="h-4 w-4 text-zinc-600" />
              </div>

              {/* Destination */}
              <div className="space-y-2">
                <Label className="text-xs text-zinc-400">Dropoff Location</Label>
                <Select value={destination} onValueChange={setDestination}>
                  <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-zinc-100">
                    <SelectValue placeholder="Select dropoff point" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-700">
                    {groupedLocations &&
                      Object.entries(groupedLocations).map(([zone, locs]) => (
                        <div key={zone}>
                          <div className="px-2 py-1.5 text-xs font-mono text-zinc-500 uppercase tracking-wider">
                            {zone}
                          </div>
                          {locs.map((loc) => (
                            <SelectItem
                              key={loc.name}
                              value={loc.name}
                              className="text-zinc-200 focus:bg-zinc-800 focus:text-zinc-100"
                              disabled={loc.name === source}
                            >
                              <span className="flex items-center gap-2">
                                <MapPin className="h-3 w-3 text-rose-400" />
                                {loc.name}
                              </span>
                            </SelectItem>
                          ))}
                        </div>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Package Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 uppercase tracking-wider">
              <Weight className="h-3 w-3" />
              Package Details
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Weight */}
              <div className="space-y-2">
                <Label className="text-xs text-zinc-400">Weight (kg)</Label>
                <Input
                  type="number"
                  min="0.1"
                  max="100"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="bg-zinc-800/50 border-zinc-700 text-zinc-100"
                  placeholder="1.0"
                />
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <Label className="text-xs text-zinc-400">Priority</Label>
                <Select value={priority} onValueChange={(v) => setPriority(v as 'normal' | 'express')}>
                  <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-zinc-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-700">
                    <SelectItem value="normal" className="text-zinc-200 focus:bg-zinc-800">
                      Normal
                    </SelectItem>
                    <SelectItem value="express" className="text-zinc-200 focus:bg-zinc-800">
                      <span className="flex items-center gap-1">
                        <Zap className="h-3 w-3 text-amber-400 fill-amber-400" />
                        Express (+₱50)
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Quote Preview */}
          {quotePreview && (
            <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/5 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">Estimated Quote</span>
                <span className="text-2xl font-bold font-mono text-emerald-400">
                  ₱{quotePreview.toLocaleString()}
                </span>
              </div>
              {priority === 'express' && (
                <Badge variant="outline" className="mt-2 text-xs text-amber-400 bg-amber-500/10 border-amber-500/30">
                  <Zap className="h-3 w-3 mr-1 fill-amber-400" />
                  Express Delivery
                </Badge>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-zinc-700"
          >
            Cancel
          </Button>
          <Button
            onClick={() => createMutation.mutate()}
            disabled={!canSubmit || createMutation.isPending}
            className={cn(
              'bg-cyan-600 hover:bg-cyan-500',
              !canSubmit && 'opacity-50'
            )}
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Package className="h-4 w-4 mr-2" />
                Create Delivery
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
