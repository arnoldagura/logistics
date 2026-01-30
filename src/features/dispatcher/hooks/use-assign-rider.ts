import { useMutation, useQueryClient } from '@tanstack/react-query'
import { assignRider } from '../api'
import type { Delivery, Rider } from '@/lib/deliveries'

interface AssignRiderParams {
  deliveryId: string
  riderId: string
  riderName: string
}

export function useAssignRider() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ deliveryId, riderId }: AssignRiderParams) => {
      return assignRider({ data: { deliveryId, riderId } })
    },

    // Optimistic update - update UI immediately
    onMutate: async ({ deliveryId, riderName }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['deliveries'] })

      // Snapshot previous value
      const previousDeliveries = queryClient.getQueryData<Delivery[]>(['deliveries'])

      // Optimistically update the cache
      queryClient.setQueryData<Delivery[]>(['deliveries'], (old) => {
        if (!old) return old
        return old.map((delivery) =>
          delivery.id === deliveryId
            ? { ...delivery, rider: riderName, status: 'picked_up' as const }
            : delivery
        )
      })

      // Also update stats optimistically
      queryClient.setQueryData(['delivery-stats'], (old: any) => {
        if (!old) return old
        return {
          ...old,
          pending: old.pending - 1,
          pickedUp: old.pickedUp + 1,
        }
      })

      return { previousDeliveries }
    },

    // If mutation fails, rollback
    onError: (_err, _variables, context) => {
      if (context?.previousDeliveries) {
        queryClient.setQueryData(['deliveries'], context.previousDeliveries)
      }
    },

    // Always refetch after error or success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveries'] })
      queryClient.invalidateQueries({ queryKey: ['delivery-stats'] })
    },
  })
}
