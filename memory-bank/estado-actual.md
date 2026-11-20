# Estado actual

El dashboard funciona contra datos mock deterministas. No hay persistencia ni usuarios.

## Datos y API

- La fuente de la API es `generate_mock_movements(seed=42)` en `backend/app/routes.py`: 360 movimientos, 30 por mes durante 12 meses.
- Las fechas no son el año civil 2024. `_year_for_month` usa `date.today()`.
- `create_date` es una fecha de calendario ISO `YYYY-MM-DD`; el frontend agrupa por año y mes sin convertirla a un instante ni aplicar zona horaria.
- La etiqueta visible sigue siendo `2024 - Full Year`. Esa diferencia no está unificada.
- `frontend/src/lib/mock-data.ts` existe y nadie lo importa. No es la fuente del panel.
- El frontend solo llama a `GET /api/metrics` y calcula KPI y series en `frontend/src/lib/financial-utils.ts`.
- También existen, y tienen tests, `/health`, `/api/metrics/facets`, `/api/metrics/summary`, `/api/metrics/categories/top`, `/api/metrics/comparison`, `/api/metrics/alerts`, `/api/metrics/b2b` y `/api/metrics/b2c`. La UI no los usa.
- Los campos de un movimiento van en snake_case. Los KPI calculados van en camelCase.
- La UI muestra KPI/gráficos en USD `en-US` sin decimales y porcentajes con un decimal; la tabla de alertas usa dos decimales.

## Contenedores y despliegue

- Compose es el entorno de desarrollo: el backend tiene healthcheck en `/health` y el frontend espera a `service_healthy`.
- Solo existe un target de producción para el frontend. Nginx escucha en `8080` y reenvía `/api/` a `backend:8000` en la red del contenedor.
- `backend/Dockerfile` es de desarrollo: inicia `debugpy` y Uvicorn con `--reload`. Además, CORS permite todos los orígenes junto con credenciales. No desplegar esa configuración como backend de producción.
- No se ha elegido proveedor de hosting ni existe Compose de producción.

## Agentes

- Las reglas aplicables están en `.agents/rules/`.
- Hay ocho skills en `.agents/skills`: accessibility, break-ui, design, developer-docs-structure-audit, seo-audit, typescript-advanced-types, vercel-react-best-practices y webapp-testing.
- Este banco de memoria complementa las reglas del repo y debe mantenerse sincronizado con ellas.

## Estado Actual 

* CORS está configurado con `allow_origins=["*"]` y credenciales; no es una política endurecida para producción.