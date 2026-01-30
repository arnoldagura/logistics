import { useState } from 'react'
import { Calculator, MapPin, Weight, Zap, ArrowRight } from 'lucide-react'
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
import { cn } from '@/lib/utils'
import { calculateDeliveryQuote } from '../api'
import { LOCATIONS } from '@/lib/deliveries'

interface QuoteResult {
  distance: number
  baseRate: number
  distanceCharge: number
  weightSurcharge: number
  expressSurcharge: number
  total: number
  currency: string
  estimatedTime: number
}

export function QuoteCalculator() {
  const [fromLocation, setFromLocation] = useState('')
  const [toLocation, setToLocation] = useState('')
  const [weight, setWeight] = useState('5')
  const [priority, setPriority] = useState<'normal' | 'express'>('normal')
  const [isCalculating, setIsCalculating] = useState(false)
  const [result, setResult] = useState<QuoteResult | null>(null)

  const handleCalculate = async () => {
    if (!fromLocation || !toLocation) return

    const from = LOCATIONS.find((l) => l.name === fromLocation)
    const to = LOCATIONS.find((l) => l.name === toLocation)

    if (!from || !to) return

    setIsCalculating(true)
    try {
      const quote = await calculateDeliveryQuote({
        data: {
          fromLat: from.coordinates.lat,
          fromLng: from.coordinates.lng,
          toLat: to.coordinates.lat,
          toLng: to.coordinates.lng,
          weight: parseFloat(weight) || 1,
          priority,
        },
      })
      setResult(quote)
    } catch (error) {
      console.error('Quote calculation failed:', error)
    } finally {
      setIsCalculating(false)
    }
  }

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-800 flex items-center gap-2">
        <Calculator className="h-4 w-4 text-violet-400" />
        <h3 className="text-sm font-semibold text-zinc-200 tracking-tight">Quote Calculator</h3>
      </div>

      <div className="p-4 space-y-4">
        {/* Location Selects */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="h-3 w-3 text-emerald-400" />
              From
            </Label>
            <Select value={fromLocation} onValueChange={setFromLocation}>
              <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-zinc-200 text-sm">
                <SelectValue placeholder="Select origin" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-700">
                {LOCATIONS.map((loc) => (
                  <SelectItem
                    key={loc.name}
                    value={loc.name}
                    className="text-zinc-200 focus:bg-zinc-800 focus:text-zinc-100"
                  >
                    {loc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="h-3 w-3 text-rose-400" />
              To
            </Label>
            <Select value={toLocation} onValueChange={setToLocation}>
              <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-zinc-200 text-sm">
                <SelectValue placeholder="Select destination" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-700">
                {LOCATIONS.map((loc) => (
                  <SelectItem
                    key={loc.name}
                    value={loc.name}
                    className="text-zinc-200 focus:bg-zinc-800 focus:text-zinc-100"
                  >
                    {loc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Weight and Priority */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
              <Weight className="h-3 w-3 text-amber-400" />
              Weight (kg)
            </Label>
            <Input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="bg-zinc-800/50 border-zinc-700 text-zinc-200 text-sm"
              placeholder="5"
              min="0.1"
              step="0.1"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="h-3 w-3 text-cyan-400" />
              Priority
            </Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as 'normal' | 'express')}>
              <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-zinc-200 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-700">
                <SelectItem value="normal" className="text-zinc-200 focus:bg-zinc-800">
                  Normal
                </SelectItem>
                <SelectItem value="express" className="text-zinc-200 focus:bg-zinc-800">
                  Express (+₱50)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Calculate Button */}
        <Button
          onClick={handleCalculate}
          disabled={!fromLocation || !toLocation || isCalculating}
          className="w-full bg-violet-600 hover:bg-violet-500 text-white"
        >
          {isCalculating ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Calculating...
            </>
          ) : (
            <>
              <Calculator className="h-4 w-4" />
              Calculate Quote
            </>
          )}
        </Button>

        {/* Result */}
        {result && (
          <div className="mt-4 p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50 space-y-3">
            {/* Route */}
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <span className="truncate">{fromLocation}</span>
              <ArrowRight className="h-3 w-3 shrink-0" />
              <span className="truncate">{toLocation}</span>
            </div>

            {/* Breakdown */}
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-zinc-400">
                <span>Distance</span>
                <span>{result.distance} km</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Base Rate</span>
                <span>₱{result.baseRate}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Distance Charge</span>
                <span>₱{result.distanceCharge}</span>
              </div>
              {result.weightSurcharge > 0 && (
                <div className="flex justify-between text-amber-400/80">
                  <span>Weight Surcharge</span>
                  <span>+₱{result.weightSurcharge}</span>
                </div>
              )}
              {result.expressSurcharge > 0 && (
                <div className="flex justify-between text-cyan-400/80">
                  <span>Express</span>
                  <span>+₱{result.expressSurcharge}</span>
                </div>
              )}
              <div className="h-px bg-zinc-700 my-2" />
              <div className="flex justify-between text-lg font-bold text-emerald-400">
                <span>Total</span>
                <span>₱{result.total}</span>
              </div>
            </div>

            {/* ETA */}
            <div className="pt-2 border-t border-zinc-700/50">
              <p className="text-xs text-zinc-500">
                Estimated delivery time:{' '}
                <span className="text-zinc-300 font-medium">{result.estimatedTime} mins</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
