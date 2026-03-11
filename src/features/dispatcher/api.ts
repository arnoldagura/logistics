import { createServerFn } from '@tanstack/react-start'
import {
  MOCK_DELIVERIES,
  RIDERS,
  LOCATIONS,
  calculateDistance,
  type Delivery,
  type Rider,
  type Coordinates,
  type Zone,
  type DeliveryStatus,
  type Location,
} from '@/lib/deliveries'

// In-memory stores for mutations (would be a database in production)
let deliveriesStore = [...MOCK_DELIVERIES]
let ridersStore = [...RIDERS]
let nextRiderId = 9
let nextDeliveryId = 25

// Get deliveries with optional filters
export const getDeliveries = createServerFn({
  method: 'GET',
}).handler(async () => {
  // Simulate network delay for SSR streaming demo
  await new Promise((resolve) => setTimeout(resolve, 800))
  return deliveriesStore
})

// Get single delivery by ID
export const getDeliveryById = createServerFn({
  method: 'GET',
}).handler(async ({ data }: { data: { id: string } }) => {
  await new Promise((resolve) => setTimeout(resolve, 300))
  const delivery = deliveriesStore.find((d) => d.id === data.id)
  if (!delivery) {
    throw new Error('Delivery not found')
  }
  return delivery
})

// Get delivery stats
export const getDeliveryStats = createServerFn({
  method: 'GET',
}).handler(async () => {
  await new Promise((resolve) => setTimeout(resolve, 300))

  const total = deliveriesStore.length
  const pending = deliveriesStore.filter((d) => d.status === 'pending').length
  const pickedUp = deliveriesStore.filter((d) => d.status === 'picked_up').length
  const delivered = deliveriesStore.filter((d) => d.status === 'delivered').length
  const totalRevenue = deliveriesStore.reduce((acc, d) => acc + d.quote, 0)

  return {
    total,
    pending,
    pickedUp,
    delivered,
    totalRevenue,
  }
})

// Calculate delivery quote based on coordinates
export const calculateDeliveryQuote = createServerFn({
  method: 'POST',
}).handler(
  async ({
    data,
  }: {
    data: {
      fromLat: number
      fromLng: number
      toLat: number
      toLng: number
      weight?: number
      priority?: 'normal' | 'express'
    }
  }) => {
    const from: Coordinates = { lat: data.fromLat, lng: data.fromLng }
    const to: Coordinates = { lat: data.toLat, lng: data.toLng }
    const weight = data.weight ?? 1
    const priority = data.priority ?? 'normal'

    const distance = calculateDistance(from, to)

    // Pricing logic
    const baseRate = 45 // Base fee in PHP
    const perKmRate = 15 // PHP per km
    const weightSurcharge = weight > 10 ? (weight - 10) * 5 : 0
    const expressSurcharge = priority === 'express' ? 50 : 0

    const subtotal = baseRate + distance * perKmRate + weightSurcharge + expressSurcharge
    const total = Math.round(subtotal)

    return {
      distance: Math.round(distance * 100) / 100,
      baseRate,
      distanceCharge: Math.round(distance * perKmRate),
      weightSurcharge: Math.round(weightSurcharge),
      expressSurcharge,
      total,
      currency: 'PHP',
      estimatedTime: Math.round(distance * 4 + 15), // minutes
    }
  }
)

// Assign rider to delivery
export const assignRider = createServerFn({
  method: 'POST',
}).handler(
  async ({
    data,
  }: {
    data: {
      deliveryId: string
      riderId: string
    }
  }) => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const rider = ridersStore.find((r) => r.id === data.riderId)
    if (!rider) {
      throw new Error('Rider not found')
    }

    const deliveryIndex = deliveriesStore.findIndex((d) => d.id === data.deliveryId)
    if (deliveryIndex === -1) {
      throw new Error('Delivery not found')
    }

    // Update the delivery
    deliveriesStore[deliveryIndex] = {
      ...deliveriesStore[deliveryIndex],
      rider: rider.name,
      status: 'picked_up',
    }

    return {
      success: true,
      delivery: deliveriesStore[deliveryIndex],
      rider,
    }
  }
)

// Update delivery status
export const updateDeliveryStatus = createServerFn({
  method: 'POST',
}).handler(
  async ({
    data,
  }: {
    data: {
      deliveryId: string
      status: DeliveryStatus
    }
  }) => {
    await new Promise((resolve) => setTimeout(resolve, 400))

    const deliveryIndex = deliveriesStore.findIndex((d) => d.id === data.deliveryId)
    if (deliveryIndex === -1) {
      throw new Error('Delivery not found')
    }

    deliveriesStore[deliveryIndex] = {
      ...deliveriesStore[deliveryIndex],
      status: data.status,
    }

    return {
      success: true,
      delivery: deliveriesStore[deliveryIndex],
    }
  }
)

// Get available riders
export const getAvailableRiders = createServerFn({
  method: 'GET',
}).handler(async () => {
  return ridersStore.filter((r) => r.available)
})

// Get all riders
export const getAllRiders = createServerFn({
  method: 'GET',
}).handler(async () => {
  await new Promise((resolve) => setTimeout(resolve, 400))
  return ridersStore
})

// Get rider stats
export const getRiderStats = createServerFn({
  method: 'GET',
}).handler(async () => {
  await new Promise((resolve) => setTimeout(resolve, 200))

  const total = ridersStore.length
  const available = ridersStore.filter((r) => r.available).length
  const onDelivery = ridersStore.filter((r) => !r.available).length

  // Count by zone
  const byZone = {
    Mandaue: ridersStore.filter((r) => r.zone === 'Mandaue').length,
    Cebu_City: ridersStore.filter((r) => r.zone === 'Cebu_City').length,
    Lapu_Lapu: ridersStore.filter((r) => r.zone === 'Lapu_Lapu').length,
  }

  return {
    total,
    available,
    onDelivery,
    byZone,
  }
})

// Create new rider
export const createRider = createServerFn({
  method: 'POST',
}).handler(
  async ({
    data,
  }: {
    data: {
      name: string
      vehicle: 'motorcycle' | 'van' | 'truck'
      zone: Zone
    }
  }) => {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const newRider: Rider = {
      id: `R${String(nextRiderId++).padStart(3, '0')}`,
      name: data.name,
      vehicle: data.vehicle,
      zone: data.zone,
      available: true,
    }

    ridersStore.push(newRider)

    return {
      success: true,
      rider: newRider,
    }
  }
)

// Update rider availability
export const updateRiderAvailability = createServerFn({
  method: 'POST',
}).handler(
  async ({
    data,
  }: {
    data: {
      riderId: string
      available: boolean
    }
  }) => {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const riderIndex = ridersStore.findIndex((r) => r.id === data.riderId)
    if (riderIndex === -1) {
      throw new Error('Rider not found')
    }

    ridersStore[riderIndex] = {
      ...ridersStore[riderIndex],
      available: data.available,
    }

    return {
      success: true,
      rider: ridersStore[riderIndex],
    }
  }
)

// Delete rider
export const deleteRider = createServerFn({
  method: 'POST',
}).handler(async ({ data }: { data: { riderId: string } }) => {
  await new Promise((resolve) => setTimeout(resolve, 300))

  const riderIndex = ridersStore.findIndex((r) => r.id === data.riderId)
  if (riderIndex === -1) {
    throw new Error('Rider not found')
  }

  ridersStore = ridersStore.filter((r) => r.id !== data.riderId)

  return { success: true }
})

// Get available locations
export const getLocations = createServerFn({
  method: 'GET',
}).handler(async () => {
  return LOCATIONS
})

// Create new delivery
export const createDelivery = createServerFn({
  method: 'POST',
}).handler(
  async ({
    data,
  }: {
    data: {
      sourceLocationName: string
      destinationLocationName: string
      weight: number
      priority: 'normal' | 'express'
    }
  }) => {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const source = LOCATIONS.find((l) => l.name === data.sourceLocationName)
    const destination = LOCATIONS.find((l) => l.name === data.destinationLocationName)

    if (!source || !destination) {
      throw new Error('Invalid location')
    }

    if (source.name === destination.name) {
      throw new Error('Source and destination must be different')
    }

    // Calculate quote
    const distance = calculateDistance(source.coordinates, destination.coordinates)
    const baseRate = 45
    const perKmRate = 15
    const weightSurcharge = data.weight > 10 ? (data.weight - 10) * 5 : 0
    const expressSurcharge = data.priority === 'express' ? 50 : 0
    const quote = Math.round(baseRate + distance * perKmRate + weightSurcharge + expressSurcharge)

    const newDelivery: Delivery = {
      id: `DEL-${String(nextDeliveryId++).padStart(4, '0')}`,
      source,
      destination,
      status: 'pending',
      rider: null,
      quote,
      createdAt: new Date(),
      weight: data.weight,
      priority: data.priority,
    }

    deliveriesStore.unshift(newDelivery) // Add to beginning

    return {
      success: true,
      delivery: newDelivery,
    }
  }
)
