import { z } from 'zod'

// Types
export const DeliveryStatus = z.enum(['pending', 'picked_up', 'delivered'])
export type DeliveryStatus = z.infer<typeof DeliveryStatus>

export const Zone = z.enum(['Mandaue', 'Cebu_City', 'Lapu_Lapu'])
export type Zone = z.infer<typeof Zone>

export interface Coordinates {
  lat: number
  lng: number
}

export interface Location {
  name: string
  zone: Zone
  coordinates: Coordinates
}

export interface Delivery {
  id: string
  source: Location
  destination: Location
  status: DeliveryStatus
  rider: string | null
  quote: number
  createdAt: Date
  weight: number // in kg
  priority: 'normal' | 'express'
}

export interface Rider {
  id: string
  name: string
  vehicle: 'motorcycle' | 'van' | 'truck'
  available: boolean
  zone: Zone
}

// Cebuano Locations Data
export const LOCATIONS: Location[] = [
  // Mandaue Zone
  { name: 'Pacific Mall Mandaue', zone: 'Mandaue', coordinates: { lat: 10.3328, lng: 123.9425 } },
  { name: 'Parkmall', zone: 'Mandaue', coordinates: { lat: 10.3294, lng: 123.9414 } },
  { name: 'Insular Square', zone: 'Mandaue', coordinates: { lat: 10.3298, lng: 123.9288 } },
  { name: 'NRA Mandaue', zone: 'Mandaue', coordinates: { lat: 10.3402, lng: 123.9321 } },
  { name: 'Consolacion Public Market', zone: 'Mandaue', coordinates: { lat: 10.3769, lng: 123.9589 } },

  // Cebu City Zone
  { name: 'Ayala Center Cebu', zone: 'Cebu_City', coordinates: { lat: 10.3185, lng: 123.9049 } },
  { name: 'SM City Cebu', zone: 'Cebu_City', coordinates: { lat: 10.3114, lng: 123.9186 } },
  { name: 'IT Park Cebu', zone: 'Cebu_City', coordinates: { lat: 10.3301, lng: 123.9066 } },
  { name: 'Fuente Osmena', zone: 'Cebu_City', coordinates: { lat: 10.3096, lng: 123.8916 } },
  { name: 'Carbon Market', zone: 'Cebu_City', coordinates: { lat: 10.2945, lng: 123.8988 } },
  { name: 'Colon Street', zone: 'Cebu_City', coordinates: { lat: 10.2956, lng: 123.8989 } },
  { name: 'Banilad Town Center', zone: 'Cebu_City', coordinates: { lat: 10.3355, lng: 123.8987 } },

  // Lapu-Lapu Zone
  { name: 'JCentre Mall', zone: 'Lapu_Lapu', coordinates: { lat: 10.3105, lng: 123.9631 } },
  { name: 'Island Central Mactan', zone: 'Lapu_Lapu', coordinates: { lat: 10.2989, lng: 123.9712 } },
  { name: 'Mactan Newtown', zone: 'Lapu_Lapu', coordinates: { lat: 10.2855, lng: 124.0011 } },
  { name: 'Gaisano Grand Mactan', zone: 'Lapu_Lapu', coordinates: { lat: 10.3061, lng: 123.9585 } },
  { name: 'Mactan-Cebu Airport', zone: 'Lapu_Lapu', coordinates: { lat: 10.3094, lng: 123.9794 } },
]

// Available Riders
export const RIDERS: Rider[] = [
  { id: 'R001', name: 'Juan dela Cruz', vehicle: 'motorcycle', available: true, zone: 'Cebu_City' },
  { id: 'R002', name: 'Pedro Santos', vehicle: 'motorcycle', available: true, zone: 'Mandaue' },
  { id: 'R003', name: 'Maria Garcia', vehicle: 'van', available: true, zone: 'Cebu_City' },
  { id: 'R004', name: 'Jose Reyes', vehicle: 'motorcycle', available: false, zone: 'Lapu_Lapu' },
  { id: 'R005', name: 'Ana Bautista', vehicle: 'truck', available: true, zone: 'Mandaue' },
  { id: 'R006', name: 'Carlos Mendoza', vehicle: 'motorcycle', available: true, zone: 'Lapu_Lapu' },
  { id: 'R007', name: 'Luis Fernandez', vehicle: 'van', available: true, zone: 'Cebu_City' },
  { id: 'R008', name: 'Rosa Villanueva', vehicle: 'motorcycle', available: true, zone: 'Mandaue' },
]

// Generate Mock Deliveries
function generateMockDeliveries(): Delivery[] {
  const statuses: DeliveryStatus[] = ['pending', 'pending', 'pending', 'picked_up', 'picked_up', 'delivered']
  const priorities: ('normal' | 'express')[] = ['normal', 'normal', 'normal', 'express']

  return Array.from({ length: 24 }, (_, i) => {
    const sourceIdx = Math.floor(Math.random() * LOCATIONS.length)
    let destIdx = Math.floor(Math.random() * LOCATIONS.length)
    while (destIdx === sourceIdx) {
      destIdx = Math.floor(Math.random() * LOCATIONS.length)
    }

    const source = LOCATIONS[sourceIdx]
    const destination = LOCATIONS[destIdx]
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const priority = priorities[Math.floor(Math.random() * priorities.length)]
    const weight = Math.round((Math.random() * 45 + 0.5) * 10) / 10

    // Assign riders to non-pending deliveries
    let rider: string | null = null
    if (status !== 'pending') {
      const availableRiders = RIDERS.filter(r => r.available || status === 'delivered')
      if (availableRiders.length > 0) {
        rider = availableRiders[Math.floor(Math.random() * availableRiders.length)].name
      }
    }

    // Calculate quote based on distance
    const distance = calculateDistance(source.coordinates, destination.coordinates)
    const baseRate = 45
    const perKmRate = 15
    const weightSurcharge = weight > 10 ? (weight - 10) * 5 : 0
    const expressSurcharge = priority === 'express' ? 50 : 0
    const quote = Math.round(baseRate + (distance * perKmRate) + weightSurcharge + expressSurcharge)

    return {
      id: `DEL-${String(i + 1).padStart(4, '0')}`,
      source,
      destination,
      status,
      rider,
      quote,
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      weight,
      priority,
    }
  })
}

// Haversine formula to calculate distance in km
export function calculateDistance(from: Coordinates, to: Coordinates): number {
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

// Export mock data
export const MOCK_DELIVERIES = generateMockDeliveries()
