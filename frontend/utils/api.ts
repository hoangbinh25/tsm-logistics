export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  // 1. Lấy token từ sessionStorage
  const token = typeof window !== 'undefined' ? sessionStorage.getItem("accessToken") : null;

  // 2. Gộp Header
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    ...(token ? { "Authorization": `Bearer ${token}` } : {})
  };

  try {
    // 3. Gọi fetch
    const response = await fetch(url, {
      ...options,
      headers: headers as HeadersInit,
    });

    if (response.status === 401 && !(options as any).skipAuthCheck) {
      if (typeof window !== 'undefined') {
        // Xóa token cũ
        sessionStorage.removeItem("accessToken");
        sessionStorage.removeItem("user");

        window.location.href = "/login";
        return Promise.reject("Phiên đăng nhập hết hạn");
      }
    }

    return response;
  } catch (error) {
    throw error;
  }
};