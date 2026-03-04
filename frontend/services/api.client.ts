import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8888";

export const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor: Gắn token vào header
apiClient.interceptors.request.use(
    (config) => {
        const token = typeof window !== "undefined" ? sessionStorage.getItem("accessToken") : null;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor: Xử lý 401 và Refresh Token
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Nếu lỗi là 401 và chưa được gửi lại lần nào
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = typeof window !== "undefined" ? sessionStorage.getItem("refreshToken") : null;

            if (refreshToken) {
                try {
                    // Gọi API refresh token
                    const { data } = await axios.post(`${API_URL}/auth/refresh-token`, {
                        refreshToken,
                    });

                    // Lưu token mới
                    sessionStorage.setItem("accessToken", data.accessToken);
                    sessionStorage.setItem("refreshToken", data.refreshToken);

                    // Cập nhật token trong header và thử lại request cũ
                    originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
                    return apiClient(originalRequest);
                } catch (refreshError) {
                    // Nếu refresh token cũng hỏng -> Logout
                    if (typeof window !== "undefined") {
                        sessionStorage.removeItem("accessToken");
                        sessionStorage.removeItem("refreshToken");
                        sessionStorage.removeItem("user");
                        window.location.href = "/login";
                    }
                    return Promise.reject(refreshError);
                }
            } else {
                // Không có refresh token -> Logout
                if (typeof window !== "undefined") {
                    window.location.href = "/login";
                }
            }
        }

        return Promise.reject(error);
    }
);
