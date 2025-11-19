# MageApp – Frontend (React + Vite + Bootstrap)

Frontend de la aplicación de **Gestión de Riesgos MageApp**, que consume el backend en Node.js/Express + MySQL.

Incluye:

- Login con JWT.
- Navbar con rutas protegidas.
- Listado y detalle de proyectos de gestión de riesgos.
- Tablas para:
  - **Modelo de Valor (CIDAT)**
  - **Matriz de Riesgo**
  - **Mapa de Riesgos**
- Integración opcional con **IA (Mistral)** para mejorar la descripción del proyecto.

---

## ⚙️ Tecnologías

- React + Vite
- React Router DOM
- Axios
- Bootstrap 5

---

## 🔧 Requisitos

- Node.js 18+
- Backend de MageApp corriendo en:

```txt
http://localhost:4000
(Ver carpeta mageapp-backend para levantar la API).

🚀 Instalación y scripts
Desde la carpeta raíz del repo (mageapp/):

bash
Copiar código
cd mageapp-frontend
npm install
Scripts disponibles:

bash
Copiar código
# Desarrollo (Vite)
npm run dev

# Build de producción
npm run build

# Previsualizar el build
npm run preview
Por defecto el frontend se sirve en:

txt
Copiar código
http://localhost:5173
🌐 Configuración de la API
Las peticiones HTTP se centralizan en src/services/apiClient.js:

js
Copiar código
const apiClient = axios.create({
  baseURL: "http://localhost:4000",
});
Si el backend corre en otra URL/puerto, actualiza baseURL o adapta el archivo para leer una variable de entorno Vite, por ejemplo:

env
Copiar código
VITE_API_BASE_URL="http://localhost:4000"
y luego usar import.meta.env.VITE_API_BASE_URL en apiClient.js.

🤖 Integración de IA (Mistral)
En el formulario “Nuevo Proyecto de Gestión de Riesgos” (src/pages/NewProjectPage.jsx) hay un botón junto al campo Descripción que permite mejorar automáticamente el texto usando el modelo mistral-large-latest de Mistral:

Llama al servicio src/services/mistralService.js.

Usa el hook src/hooks/useMistralEnhancer.js para manejar:

Estado de carga (loadingMistral).

Llamada a la API.

Fallback en caso de error (se deja el texto original).

Variables de entorno para la IA
En la raíz de mageapp-frontend se utiliza un archivo .env.local (no se sube al repo) con:

env
Copiar código
# URL base del backend (si se desea parametrizar)
VITE_API_BASE_URL="http://localhost:4000"

# API Key de Mistral (NO subir jamás a GitHub)
VITE_MISTRAL_API_KEY="tu_api_key_de_mistral_aquí"
El servicio mistralService.js lee la API Key desde import.meta.env.VITE_MISTRAL_API_KEY.
Si la variable no está definida o la llamada falla, simplemente se devuelve el texto original.

Importante: asegúrate de que .env.local esté en .gitignore.

🔐 Autenticación y roles
Login en /login (src/pages/LoginPage.jsx).

Contexto de autenticación: src/context/AuthContext.jsx.

Hook: src/hooks/useAuth.js.

Rutas protegidas bajo /app/* mediante src/components/ProtectedRoute.jsx.

Roles principales (campo roleName):

SuperAdmin

Gestor de Riesgos

Auditor (lector)

La navbar (src/components/NavbarApp.jsx) muestra menú y permisos según el rol, e incluye un saludo del tipo:

txt
Copiar código
Bienvenido, Admin
Bienvenido, Gestor de Riesgos
Bienvenido, Auditor
📁 Estructura resumida
txt
Copiar código
mageapp-frontend/
  src/
    components/
      NavbarApp.jsx
      ProtectedRoute.jsx
      ErrorAlert.jsx
      LoadingSpinner.jsx
    context/
      AuthContext.jsx
    hooks/
      useAuth.js
      useMistralEnhancer.js
    layouts/
      AppLayout.jsx
    pages/
      LoginPage.jsx
      ProjectsListPage.jsx
      NewProjectPage.jsx
      ModeloValorPage.jsx
      MatrizRiesgoPage.jsx
      MapaRiesgosPage.jsx
      ProjectDetailPage.jsx
    services/
      apiClient.js
      proyectosService.js
      mistralService.js
    App.jsx
    main.jsx
📝 Notas
Aún no se implementa refresco automático del token de acceso; si expira, el usuario debe volver a iniciar sesión.

El diseño usa Bootstrap 5 y está pensado para ser extendido con gráficos o dashboards en el futuro.

La integración de IA es opcional: la app funciona sin Mistral si no se configura VITE_MISTRAL_API_KEY.
```
