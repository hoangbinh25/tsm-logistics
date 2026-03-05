import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { orderService } from "@/services/order.service"
import { OrderDetailResponse, PaymentStatusResponse, OrderListResponse } from "@/types/order"

export const useOrders = (type?: string) => {
    return useQuery<OrderListResponse>({
        queryKey: ['orders', type],
        queryFn: () => orderService.getOrders(type)
    })
}

export const useOrderDetail = (id: string) => {
    return useQuery<OrderDetailResponse>({
        queryKey: ['order', id],
        queryFn: () => orderService.getById(id),
        enabled: !!id
    })
}

export const useOrderPaymentStatus = (id: string, enabled: boolean) => {
    return useQuery<PaymentStatusResponse>({
        queryKey: ['payment-status', id],
        queryFn: () => orderService.getPaymentStatus(id),
        enabled: enabled && !!id,
        refetchInterval: (query) => {
            const data = query.state.data
            if (data?.status === 'SUCCESS') return false
            return 10000 // 10s
        }
    })
}

export const useOrderMutations = () => {
    const queryClient = useQueryClient()

    const createMutation = useMutation({
        mutationFn: (payload: any) => orderService.create(payload)
    })

    const switchCodMutation = useMutation({
        mutationFn: (id: string) => orderService.switchToCod(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ['order', id] })
        }
    })

    const cancelMutation = useMutation({
        mutationFn: (id: string) => orderService.cancel(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ['orders'] })
            queryClient.invalidateQueries({ queryKey: ['order', id] })
        }
    })

    return { createMutation, switchCodMutation, cancelMutation }
}
