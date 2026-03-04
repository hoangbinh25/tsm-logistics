import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { shippingService } from "@/services/shipping.service"
import { Service } from "@/types/service"

export type { Service }

export const useServices = () => {
    return useQuery<Service[]>({
        queryKey: ['services'],
        queryFn: () => shippingService.getAll()
    })
}

export const useServiceMutations = () => {
    const queryClient = useQueryClient()

    const createMutation = useMutation({
        mutationFn: (data: Partial<Service>) => shippingService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['services'] })
        }
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string, data: Partial<Service> }) => shippingService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['services'] })
        }
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) => shippingService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['services'] })
        }
    })

    return { createMutation, updateMutation, deleteMutation }
}
