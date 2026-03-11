'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { Delivery, Zone } from '@/lib/deliveries'
import { fetchRouteInfo, formatDuration, formatDistance, type RouteInfo } from '@/lib/routing'
import { MapPin, Navigation, Package, Truck, Clock, CheckCircle2, Timer, Route, Map as MapIcon } from 'lucide-react'

// Leaflet components will be loaded dynamically
type LeafletComponents = {
  MapContainer: any
  TileLayer: any
  CircleMarker: any
  Polyline: any
  Popup: any
  useMap: any
}

// Zone color mapping - matching the existing theme
const ZONE_COLORS: Record<Zone, { primary: string; glow: string; rgb: string }> = {
  Mandaue: { primary: '#22d3ee', glow: 'rgba(34, 211, 238, 0.4)', rgb: '34, 211, 238' },
  Cebu_City: { primary: '#34d399', glow: 'rgba(52, 211, 153, 0.4)', rgb: '52, 211, 153' },
  Lapu_Lapu: { primary: '#a78bfa', glow: 'rgba(167, 139, 250, 0.4)', rgb: '167, 139, 250' },
}

// Status color mapping
const STATUS_COLORS: Record<string, { primary: string; glow: string }> = {
  pending: { primary: '#fbbf24', glow: 'rgba(251, 191, 36, 0.5)' },
  picked_up: { primary: '#22d3ee', glow: 'rgba(34, 211, 238, 0.5)' },
  delivered: { primary: '#34d399', glow: 'rgba(52, 211, 153, 0.5)' },
}

// Store route info for deliveries (shared state)
const routeInfoStore = new Map<string, RouteInfo>()

interface DeliveryMapProps {
  deliveries: Delivery[]
  selectedDeliveryId?: string | null
  onDeliverySelect?: (deliveryId: string) => void
  className?: string
  statusFilter?: string
  zoneFilter?: string
}

// Component to handle map view changes when selection changes
function MapController({
  selectedDelivery,
  useMap
}: {
  selectedDelivery: Delivery | null
  useMap: any
}) {
  const map = useMap()

  useEffect(() => {
    if (selectedDelivery) {
      const bounds = [
        [selectedDelivery.source.coordinates.lat, selectedDelivery.source.coordinates.lng],
        [selectedDelivery.destination.coordinates.lat, selectedDelivery.destination.coordinates.lng],
      ] as [[number, number], [number, number]]

      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 })
    }
  }, [selectedDelivery, map])

  return null
}

// Route polyline component that fetches real road paths
function RoutePolyline({
  delivery,
  isSelected,
  onRouteLoad,
  Polyline,
}: {
  delivery: Delivery
  isSelected: boolean
  onRouteLoad?: (deliveryId: string, routeInfo: RouteInfo) => void
  Polyline: any
}) {
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([])
  const [isLoading, setIsLoading] = useState(true)
  const statusColor = STATUS_COLORS[delivery.status]

  useEffect(() => {
    let mounted = true

    const loadRoute = async () => {
      setIsLoading(true)
      const routeInfo = await fetchRouteInfo(
        delivery.source.coordinates,
        delivery.destination.coordinates
      )
      if (mounted) {
        setRouteCoords(routeInfo.coordinates)
        setIsLoading(false)
        // Store route info and notify parent
        routeInfoStore.set(delivery.id, routeInfo)
        onRouteLoad?.(delivery.id, routeInfo)
      }
    }

    loadRoute()

    return () => {
      mounted = false
    }
  }, [delivery.id, delivery.source.coordinates, delivery.destination.coordinates, onRouteLoad])

  // Show straight line while loading
  const positions = isLoading
    ? [
        [delivery.source.coordinates.lat, delivery.source.coordinates.lng] as [number, number],
        [delivery.destination.coordinates.lat, delivery.destination.coordinates.lng] as [number, number],
      ]
    : routeCoords

  return (
    <Polyline
      positions={positions}
      pathOptions={{
        color: isSelected ? '#fff' : statusColor.primary,
        weight: isSelected ? 4 : 3,
        opacity: isSelected ? 1 : 0.7,
        dashArray: delivery.status === 'pending' ? '10, 10' : undefined,
        lineCap: 'round',
        lineJoin: 'round',
      }}
    />
  )
}

export function DeliveryMap({
  deliveries,
  selectedDeliveryId,
  onDeliverySelect,
  className = '',
  statusFilter,
  zoneFilter,
}: DeliveryMapProps) {
  const mapRef = useRef<any>(null)
  const [routeInfoMap, setRouteInfoMap] = useState<Map<string, RouteInfo>>(new Map())
  const [leaflet, setLeaflet] = useState<LeafletComponents | null>(null)

  // Dynamically load Leaflet on client side
  useEffect(() => {
    let mounted = true

    const loadLeaflet = async () => {
      // Import CSS
      await import('leaflet/dist/leaflet.css')
      // Import react-leaflet components
      const rl = await import('react-leaflet')

      if (mounted) {
        setLeaflet({
          MapContainer: rl.MapContainer,
          TileLayer: rl.TileLayer,
          CircleMarker: rl.CircleMarker,
          Polyline: rl.Polyline,
          Popup: rl.Popup,
          useMap: rl.useMap,
        })
      }
    }

    loadLeaflet()

    return () => {
      mounted = false
    }
  }, [])

  // Filter deliveries based on status and zone
  const filteredDeliveries = useMemo(() => {
    return deliveries.filter((d) => {
      if (statusFilter && d.status !== statusFilter) return false
      if (zoneFilter && d.source.zone !== zoneFilter && d.destination.zone !== zoneFilter) return false
      return true
    })
  }, [deliveries, statusFilter, zoneFilter])

  const selectedDelivery = useMemo(() => {
    return filteredDeliveries.find((d) => d.id === selectedDeliveryId) || null
  }, [filteredDeliveries, selectedDeliveryId])

  const selectedRouteInfo = selectedDeliveryId ? routeInfoMap.get(selectedDeliveryId) : null

  // Handle route info loaded callback
  const handleRouteLoad = (deliveryId: string, routeInfo: RouteInfo) => {
    setRouteInfoMap((prev) => {
      const next = new Map(prev)
      next.set(deliveryId, routeInfo)
      return next
    })
  }

  // Cebu Metro center coordinates
  const center: [number, number] = [10.3157, 123.9300]

  // Show loading state during SSR or while loading Leaflet
  if (!leaflet) {
    return (
      <div className={`relative rounded-xl overflow-hidden border border-zinc-800/80 bg-zinc-900/60 backdrop-blur-sm ${className} flex items-center justify-center`}>
        <div className="flex items-center gap-2 text-zinc-500">
          <MapIcon className="h-5 w-5 animate-pulse" />
          <span className="text-sm">Loading map...</span>
        </div>
      </div>
    )
  }

  const { MapContainer, TileLayer, CircleMarker, Polyline, Popup, useMap } = leaflet

  return (
    <div className={`relative rounded-xl overflow-hidden border border-zinc-800/80 bg-zinc-900/60 backdrop-blur-sm ${className}`}>
      {/* Scanline overlay effect */}
      <div className="absolute inset-0 pointer-events-none z-[1000] opacity-[0.03]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
        }}
      />

      {/* Corner accents - Mission Control style */}
      <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-cyan-500/40 z-[1001] pointer-events-none" />
      <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-cyan-500/40 z-[1001] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-cyan-500/40 z-[1001] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-cyan-500/40 z-[1001] pointer-events-none" />

      {/* Header bar */}
      <div className="absolute top-0 left-0 right-0 z-[1001] bg-gradient-to-b from-zinc-950/90 to-transparent px-4 py-3 pointer-events-none">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
              Live Tracking
            </span>
          </div>
          <span className="text-[10px] font-mono text-zinc-500">
            {filteredDeliveries.length} Active Routes
          </span>
        </div>
      </div>

      {/* Map container */}
      <MapContainer
        ref={mapRef}
        center={center}
        zoom={12}
        className="h-full w-full"
        style={{ background: '#0a0a0f' }}
        zoomControl={false}
        attributionControl={false}
      >
        {/* Dark theme tiles - CartoDB Dark Matter */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        {/* Map controller for selection changes */}
        <MapController selectedDelivery={selectedDelivery} useMap={useMap} />

        {/* Render route polylines with real road paths */}
        {filteredDeliveries.map((delivery) => (
          <RoutePolyline
            key={`route-${delivery.id}`}
            delivery={delivery}
            isSelected={delivery.id === selectedDeliveryId}
            onRouteLoad={handleRouteLoad}
            Polyline={Polyline}
          />
        ))}

        {/* Render source markers */}
        {filteredDeliveries.map((delivery) => {
          const isSelected = delivery.id === selectedDeliveryId
          const zoneColor = ZONE_COLORS[delivery.source.zone]

          return (
            <CircleMarker
              key={`source-${delivery.id}`}
              center={[delivery.source.coordinates.lat, delivery.source.coordinates.lng]}
              radius={isSelected ? 10 : 7}
              pathOptions={{
                color: isSelected ? '#fff' : zoneColor.primary,
                fillColor: zoneColor.primary,
                fillOpacity: isSelected ? 1 : 0.8,
                weight: isSelected ? 3 : 2,
              }}
              eventHandlers={{
                click: () => onDeliverySelect?.(delivery.id),
              }}
            >
              <Popup className="delivery-popup">
                <PopupContent delivery={delivery} type="source" />
              </Popup>
            </CircleMarker>
          )
        })}

        {/* Render destination markers */}
        {filteredDeliveries.map((delivery) => {
          const isSelected = delivery.id === selectedDeliveryId
          const zoneColor = ZONE_COLORS[delivery.destination.zone]

          return (
            <CircleMarker
              key={`dest-${delivery.id}`}
              center={[delivery.destination.coordinates.lat, delivery.destination.coordinates.lng]}
              radius={isSelected ? 10 : 6}
              pathOptions={{
                color: isSelected ? '#fff' : zoneColor.primary,
                fillColor: 'transparent',
                fillOpacity: 0,
                weight: isSelected ? 3 : 2,
                dashArray: '4, 4',
              }}
              eventHandlers={{
                click: () => onDeliverySelect?.(delivery.id),
              }}
            >
              <Popup className="delivery-popup">
                <PopupContent delivery={delivery} type="destination" />
              </Popup>
            </CircleMarker>
          )
        })}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[1001] bg-zinc-950/90 backdrop-blur-sm rounded-lg border border-zinc-800/80 p-3 space-y-2">
        <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-2">Legend</div>

        {/* Zone colors */}
        <div className="space-y-1.5">
          <div className="text-[9px] font-mono uppercase tracking-wider text-zinc-600">Zones</div>
          {Object.entries(ZONE_COLORS).map(([zone, colors]) => (
            <div key={zone} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: colors.primary, boxShadow: `0 0 8px ${colors.glow}` }}
              />
              <span className="text-[10px] text-zinc-400">
                {zone.replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>

        {/* Marker types */}
        <div className="space-y-1.5 pt-2 border-t border-zinc-800/50">
          <div className="text-[9px] font-mono uppercase tracking-wider text-zinc-600">Markers</div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-zinc-400" />
            <span className="text-[10px] text-zinc-400">Pickup</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full border-2 border-zinc-400 border-dashed" />
            <span className="text-[10px] text-zinc-400">Dropoff</span>
          </div>
        </div>

        {/* Status colors */}
        <div className="space-y-1.5 pt-2 border-t border-zinc-800/50">
          <div className="text-[9px] font-mono uppercase tracking-wider text-zinc-600">Routes</div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-0.5 bg-amber-400" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #fbbf24 0, #fbbf24 4px, transparent 4px, transparent 8px)' }} />
            <span className="text-[10px] text-zinc-400">Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-0.5 bg-cyan-400" />
            <span className="text-[10px] text-zinc-400">In Transit</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-0.5 bg-emerald-400" />
            <span className="text-[10px] text-zinc-400">Delivered</span>
          </div>
        </div>
      </div>

      {/* Selected delivery info panel */}
      {selectedDelivery && (
        <div className="absolute bottom-4 right-4 z-[1001] bg-zinc-950/90 backdrop-blur-sm rounded-lg border border-zinc-800/80 p-4 w-64 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-cyan-400">{selectedDelivery.id}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
              selectedDelivery.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
              selectedDelivery.status === 'picked_up' ? 'bg-cyan-500/20 text-cyan-400' :
              'bg-emerald-500/20 text-emerald-400'
            }`}>
              {selectedDelivery.status === 'picked_up' ? 'IN TRANSIT' : selectedDelivery.status.toUpperCase()}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {/* ETA and Distance */}
            {selectedRouteInfo && (
              <div className="flex items-center gap-4 p-2 rounded-lg bg-zinc-800/50 mb-2">
                <div className="flex items-center gap-1.5">
                  <Timer className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-zinc-200 font-medium">{formatDuration(selectedRouteInfo.duration)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Route className="w-3.5 h-3.5 text-violet-400" />
                  <span className="text-zinc-200 font-medium">{formatDistance(selectedRouteInfo.distance)}</span>
                </div>
              </div>
            )}

            <div className="flex items-start gap-2">
              <Package className="w-3.5 h-3.5 text-zinc-500 mt-0.5 shrink-0" />
              <div>
                <div className="text-zinc-500 text-[10px]">From</div>
                <div className="text-zinc-200">{selectedDelivery.source.name}</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Navigation className="w-3.5 h-3.5 text-zinc-500 mt-0.5 shrink-0" />
              <div>
                <div className="text-zinc-500 text-[10px]">To</div>
                <div className="text-zinc-200">{selectedDelivery.destination.name}</div>
              </div>
            </div>
            {selectedDelivery.rider && (
              <div className="flex items-start gap-2">
                <Truck className="w-3.5 h-3.5 text-zinc-500 mt-0.5 shrink-0" />
                <div>
                  <div className="text-zinc-500 text-[10px]">Rider</div>
                  <div className="text-zinc-200">{selectedDelivery.rider}</div>
                </div>
              </div>
            )}
            <div className="flex items-center justify-between pt-2 border-t border-zinc-800/50">
              <span className="text-zinc-500">Quote</span>
              <span className="font-mono text-emerald-400">₱{selectedDelivery.quote}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Popup content component
function PopupContent({ delivery, type }: { delivery: Delivery; type: 'source' | 'destination' }) {
  const location = type === 'source' ? delivery.source : delivery.destination
  const StatusIcon = delivery.status === 'pending' ? Clock :
                     delivery.status === 'picked_up' ? Truck : CheckCircle2

  return (
    <div className="min-w-[180px] p-1">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-mono font-semibold text-cyan-600">{delivery.id}</span>
        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
          delivery.status === 'pending' ? 'bg-amber-100 text-amber-700' :
          delivery.status === 'picked_up' ? 'bg-cyan-100 text-cyan-700' :
          'bg-emerald-100 text-emerald-700'
        }`}>
          {delivery.status === 'picked_up' ? 'IN TRANSIT' : delivery.status.toUpperCase()}
        </span>
      </div>

      <div className="space-y-1">
        <div className="flex items-center gap-1.5">
          {type === 'source' ? (
            <Package className="w-3 h-3 text-zinc-500" />
          ) : (
            <MapPin className="w-3 h-3 text-zinc-500" />
          )}
          <span className="text-[10px] uppercase tracking-wider text-zinc-500">
            {type === 'source' ? 'Pickup' : 'Dropoff'}
          </span>
        </div>
        <div className="text-sm font-medium text-zinc-800">{location.name}</div>
        <div className="text-[10px] text-zinc-500">{location.zone.replace('_', ' ')}</div>
      </div>

      <div className="mt-2 pt-2 border-t border-zinc-200 flex items-center justify-between">
        <span className="text-[10px] text-zinc-500">Quote</span>
        <span className="text-xs font-mono font-semibold text-emerald-600">₱{delivery.quote}</span>
      </div>
    </div>
  )
}

export default DeliveryMap
