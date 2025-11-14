import axios from "axios";

const apiClient = axios.create({
    baseURL: "http://localhost:4000",
});

// Clave usada en AuthContext
const ACCESS_TOKEN_KEY = "mageapp_accessToken";

// Interceptor para agregar Authorization: Bearer <token>
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor para manejar 401 globalmente
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Limpia token y redirige a login
            localStorage.removeItem(ACCESS_TOKEN_KEY);
            localStorage.removeItem("mageapp_refreshToken");
            if (window.location.pathname !== "/login") {
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;
