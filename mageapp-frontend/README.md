# MageApp – Frontend (React + Vite + Bootstrap)

Frontend de la aplicación de **Gestión de Riesgos MageApp**, que consume el backend en Node.js / MySQL.

Este módulo implementa:

- Pantalla de **login** con autenticación JWT.
- Layout con **navbar** y rutas protegidas.
- Tablas para visualizar:
  - **Modelo de Valor (CIDAT)**
  - **Matriz de Riesgo**
  - **Mapa de Riesgos**

---

## Tecnologías

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [React Router DOM](https://reactrouter.com/)
- [Axios](https://axios-http.com/)
- [Bootstrap 5](https://getbootstrap.com/)

---

## Requisitos

- Node.js 18+
- Backend de MageApp corriendo en:

`http://localhost:4000`

(Ver carpeta `mageapp-backend` del repo para levantar la API).

---

## Instalación

Desde la carpeta raíz del proyecto (`mageapp/`):

```bash
cd mageapp-frontend
npm install
Scripts disponibles
En la carpeta mageapp-frontend:

bash
Copiar código
# Desarrollo (Vite)
npm run dev

# Build de producción
npm run build

# Previsualizar el build
npm run preview
Por defecto, el servidor de desarrollo se levanta en:

http://localhost:5173

Configuración de la API
Las peticiones HTTP se centralizan en src/services/apiClient.js:

js
Copiar código
const apiClient = axios.create({
  baseURL: "http://localhost:4000",
});
Si el backend corre en otra URL/puerto, actualizar baseURL en ese archivo (o adaptar para usar una variable de entorno Vite VITE_API_BASE_URL).

Autenticación
Flujo
El usuario ingresa a /login.

El formulario envía un POST a:

POST /api/auth/login

El backend responde con:

json
Copiar código
{
  "accessToken": "<JWT>",
  "refreshToken": "<token_refresh>"
}
El frontend guarda:

accessToken en localStorage bajo la clave mageapp_accessToken.

refreshToken en localStorage bajo la clave mageapp_refreshToken (para uso futuro).

Axios añade automáticamente el header:

Authorization: Bearer <accessToken>

en cada request, gracias al interceptor definido en src/services/apiClient.js.

Si el backend responde 401, el interceptor:

Borra los tokens de localStorage.

Redirige a /login.

Rutas protegidas
Se utiliza:

Un contexto de autenticación: src/context/AuthContext.jsx.

Un hook: src/hooks/useAuth.js.

Un componente de protección: src/components/ProtectedRoute.jsx.

Cualquier ruta debajo de /app/* está protegida y redirige a /login si no existe token.

Rutas del frontend
/login
Pantalla de inicio de sesión.
Archivo: src/pages/LoginPage.jsx.

/app/modelo-valor
Tabla de Modelo de Valor (CIDAT).
Archivo: src/pages/ModeloValorPage.jsx.

/app/matriz-riesgo
Matriz de Riesgo (niveles inherente / residual y tratamiento).
Archivo: src/pages/MatrizRiesgoPage.jsx.

/app/mapa-riesgos
Mapa de Riesgos (activos, amenazas, vulnerabilidades).
Archivo: src/pages/MapaRiesgosPage.jsx.

La definición de rutas está en src/App.jsx.

Consumo del backend
Todas las páginas usan un servicio centralizado en:

src/services/proyectosService.js

Nombre de proyecto usado por defecto:

Aplicación propia - MageApp

Endpoints consumidos:

Modelo de Valor:

GET /api/proyectos/:nombre/modelodevalor?like=1

Matriz de Riesgo:

GET /api/proyectos/:nombre/matrizderiesgo?like=1

Mapa de Riesgos:

GET /api/proyectos/:nombre/mapaderiesgos?like=1

El nombre del proyecto se codifica con encodeURIComponent antes de construir la URL.

Estructura de carpetas (resumen)
txt
Copiar código
mageapp-frontend/
  public/
  src/
    components/
      ErrorAlert.jsx
      LoadingSpinner.jsx
      NavbarApp.jsx
      ProtectedRoute.jsx
    context/
      AuthContext.jsx
    hooks/
      useAuth.js
    layouts/
      AppLayout.jsx
    pages/
      LoginPage.jsx
      ModeloValorPage.jsx
      MatrizRiesgoPage.jsx
      MapaRiesgosPage.jsx
    services/
      apiClient.js
      proyectosService.js
    App.jsx
    main.jsx
  package.json
  vite.config.js
  README.md
Notas
No se implementa todavía refresh automático del token de acceso.
Si el accessToken expira, el usuario debe volver a iniciar sesión.

El estilo se basa en Bootstrap 5 con componentes básicos (.container, .navbar, .table, etc.).
Se puede extender fácilmente para gráficos o dashboards más avanzados.
```
