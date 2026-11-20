# Patrones de consumo de la API del dashboard

## Regla

- Usa `VITE_API_BASE_URL` como prefijo opcional y conserva rutas relativas `/api/...` cuando el frontend y la API comparten origen.
- Construye filtros opcionales con `URLSearchParams`; omite parámetros vacíos en vez de concatenar query strings manualmente.
- Comprueba `response.ok` antes de leer el cuerpo. Los errores de transporte deben llegar al estado de error visible existente, sin tratar una respuesta HTTP fallida como datos válidos.
- Ejecuta en `Promise.all` las solicitudes independientes que se necesitan para el mismo estado de pantalla.
- Mantén los tipos compartidos del payload en `frontend/src/lib/financial-types.ts` y los modelos de respuesta del servidor en `backend/app/routes.py`.
- Sigue `api-field-contract.md` para los nombres y formatos, `dashboard-math-stays-client-side.md` para los KPI/series y `keep-unused-endpoints.md` para no eliminar rutas no usadas por la UI.
- En desarrollo, el proxy de Vite resuelve `/api` hacia `backend:8000`. La imagen de producción usa Nginx con ese mismo nombre DNS. No reemplaces el hostname de contenedor por `localhost`.

## Hecho del repo

`frontend/src/App.tsx` usa `URLSearchParams`, valida `response.ok` y combina cargas iniciales y filtros con `Promise.all`. `frontend/src/components/dashboard/business-comparison-page.tsx` consume rutas de categorías y comparación B2B/B2C. `frontend/nginx.conf` reenvía `/api/` a `backend:8000`.