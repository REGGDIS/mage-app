# MageApp (Gestión de Riesgos)

Backend: Node.js (Express) + MySQL  
Frontend: React + Bootstrap (próximo)

## Backend

\\\bash
cd mageapp-backend
npm install
cp .env.example .env # completar variables
npm run dev
\\\

### Endpoints de prueba (REST Client o Thunder)

- POST /api/auth/login
- GET /api/proyectos/{proyecto}/modelodevalor?like=1
- GET /api/proyectos/{proyecto}/matrizderiesgo?like=1
- GET /api/proyectos/{proyecto}/mapaderiesgos?like=1

Proyecto de demo: \Aplicación propia - MageApp\ (usar URL-encoded en el path).

## Estructura

- \mageapp-backend/\ — API + rutas + controladores
- \mageapp-frontend/\ — (pendiente) React + Bootstrap
