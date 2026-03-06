import { apiClient } from "@/services/api.client";

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  try {
    // 1. Chuyển đổi options từ Fetch sang Axios config
    const config = {
      url: url,
      method: options.method || 'GET',
      data: options.body ? JSON.parse(options.body as string) : undefined,
      headers: (options.headers || {}) as any,
      skipAuthCheck: (options as any).skipAuthCheck
    };

    // 2. Gọi bằng apiClient (đã có sẵn interceptor xử lý Token & Refresh Token)
    const response = await apiClient(config);

    // 3. Giả lập Response của Fetch để không làm gãy code cũ
    return {
      ok: response.status >= 200 && response.status < 300,
      status: response.status,
      json: async () => response.data,
      text: async () => JSON.stringify(response.data),
    } as any;

  } catch (error: any) {
    // Nếu là lỗi 401 và đã qua xử lý logout của interceptor
    if (error.response?.status === 401) {
      return {
        ok: false,
        status: 401,
        json: async () => ({ message: "Phiên đăng nhập hết hạn" }),
      } as any;
    }
    throw error;
  }
};
