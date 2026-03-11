import type { Coordinates } from './deliveries'

export interface RouteInfo {
  coordinates: [number, number][]
  duration: number // in seconds
  distance: number // in meters
}

// Cache for route data (coordinates + metadata)
const routeInfoCache = new Map<string, RouteInfo>()

/**
 * Fetch route information from OSRM (Open Source Routing Machine)
 * Returns the route geometry, estimated duration, and distance
 */
export async function fetchRouteInfo(
  from: Coordinates,
  to: Coordinates
): Promise<RouteInfo> {
  const cacheKey = `${from.lat},${from.lng}-${to.lat},${to.lng}`

  // Check cache first
  if (routeInfoCache.has(cacheKey)) {
    return routeInfoCache.get(cacheKey)!
  }

  try {
    // OSRM expects lng,lat format (not lat,lng)
    const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`

    const response = await fetch(url)
    const data = await response.json()

    if (data.code === 'Ok' && data.routes?.[0]) {
      const route = data.routes[0]

      // OSRM returns [lng, lat], we need [lat, lng] for Leaflet
      const coordinates: [number, number][] = route.geometry.coordinates.map(
        ([lng, lat]: [number, number]) => [lat, lng]
      )

      const routeInfo: RouteInfo = {
        coordinates,
        duration: route.duration, // seconds
        distance: route.distance, // meters
      }

      // Cache the result
      routeInfoCache.set(cacheKey, routeInfo)
      return routeInfo
    }
  } catch (error) {
    console.warn('Failed to fetch route from OSRM:', error)
  }

  // Fallback with estimated values based on straight-line distance
  const straightLineDistance = calculateStraightLineDistance(from, to)
  return {
    coordinates: [
      [from.lat, from.lng],
      [to.lat, to.lng],
    ],
    duration: (straightLineDistance / 30) * 3600, // Assume 30 km/h average speed
    distance: straightLineDistance * 1000, // Convert to meters
  }
}

/**
 * Calculate straight-line distance using Haversine formula (in km)
 */
function calculateStraightLineDistance(from: Coordinates, to: Coordinates): number {
  const R = 6371 // Earth's radius in km
  const dLat = toRad(to.lat - from.lat)
  const dLng = toRad(to.lng - from.lng)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(from.lat)) * Math.cos(toRad(to.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}

/**
 * Format duration in seconds to human-readable string
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`
  }
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) {
    return `${minutes} min`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (remainingMinutes === 0) {
    return `${hours}h`
  }
  return `${hours}h ${remainingMinutes}m`
}

/**
 * Format distance in meters to human-readable string
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`
  }
  const km = meters / 1000
  return `${km.toFixed(1)} km`
}

/**
 * Get route info cache key for a delivery
 */
export function getRouteCacheKey(from: Coordinates, to: Coordinates): string {
  return `${from.lat},${from.lng}-${to.lat},${to.lng}`
}

/**
 * Check if route info is cached
 */
export function isRouteCached(from: Coordinates, to: Coordinates): boolean {
  return routeInfoCache.has(getRouteCacheKey(from, to))
}

/**
 * Get cached route info (returns undefined if not cached)
 */
export function getCachedRouteInfo(from: Coordinates, to: Coordinates): RouteInfo | undefined {
  return routeInfoCache.get(getRouteCacheKey(from, to))
}
