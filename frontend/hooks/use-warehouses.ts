import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { warehouseService } from "@/services/warehouse.service"
import { Warehouse } from "@/types/warehouse"

export type { Warehouse }

export const useWarehouses = () => {
    return useQuery<Warehouse[]>({
        queryKey: ['warehouses'],
        queryFn: () => warehouseService.getAll()
    })
}

export const useWarehouseMutations = () => {
    const queryClient = useQueryClient()

    const createMutation = useMutation({
        mutationFn: (data: Partial<Warehouse>) => warehouseService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['warehouses'] })
        }
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string, data: Partial<Warehouse> }) => warehouseService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['warehouses'] })
        }
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) => warehouseService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['warehouses'] })
        }
    })

    return { createMutation, updateMutation, deleteMutation }
}
