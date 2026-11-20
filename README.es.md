# Panel de Métricas Financieras

<!-- hide -->

Por [@marcogonzalo](https://github.com/marcogonzalo) y [otros contribuidores](https://github.com/4GeeksAcademy/ai-eng-financial-dashboard-context-project/graphs/contributors) en [4Geeks Academy](https://4geeksacademy.com/)

[![build by developers](https://img.shields.io/badge/build_by-Developers-blue)](https://4geeks.com)
[![4Geeks Academy](https://img.shields.io/twitter/follow/4geeksacademy?style=social&logo=x)](https://x.com/4geeksacademy)

_These instructions are [available in English](./README.md)._

**Antes de empezar**: 📗 [Lee las instrucciones](https://4geeks.com/es/lesson/como-comenzar-un-proyecto-de-codificacion) sobre cómo comenzar un proyecto de programación.

<!-- endhide -->

---

_Dashboard de métricas financieras con frontend en React + TypeScript y backend en FastAPI._

## Pasos recomendados

1. Haz un fork de este repositorio a tu cuenta.
2. Abre tu fork en GitHub Codespaces o clónalo y ejecútalo en tu entorno local.
3. Ejecuta tu agente de IA para inspeccionar frontend y backend.
4. Documenta las reglas propuestas y el banco de memoria en tu fork.
5. Ajusta y valida las reglas hasta que sean aplicables al flujo real del proyecto.

## Estructura esperada del directorio para agentes

```text
./.agents
└─ /rules
   └─ <nombre-regla>.md
└─ /skills
   └─ /<nombre-skill>
      └─ /SKILL.md
```

## Cómo ejecutar en local

```bash
./start-services.sh
```

El script construye y levanta el backend y luego el frontend en segundo plano.
También puedes iniciar ambos manualmente:

```bash
docker compose up -d --build backend
docker compose up -d --build frontend
```

El frontend usa por defecto el proxy de Vite para `/api`, así que no necesitas variables de entorno extra ni en desarrollo local ni en Codespaces.
Si necesitas apuntar a otro backend durante el desarrollo, define `VITE_API_BASE_URL` en `frontend/.env.local` con una URL accesible desde el navegador, por ejemplo `http://localhost:8000`.

### Despliegue en contenedores

```bash
docker build --target production -t financial-dashboard-frontend ./frontend
```

1. Construye la imagen de frontend con el comando anterior y publícala en el registro usado por tu plataforma de contenedores.
2. Ejecuta el contenedor exponiendo el puerto `8080`.
3. Conecta frontend y backend a una red donde la API resuelva como `backend:8000`; Nginx reenvía `/api/` a ese nombre.
4. Verifica `GET /api/metrics` a través del frontend y `/health` y `/docs` directamente en el backend.

El repositorio define un target de producción solo para el frontend y no selecciona un proveedor de hosting. `docker-compose.yml` es de desarrollo; el `backend/Dockerfile` inicia `debugpy` y Uvicorn con `--reload`, y el backend permite todos los orígenes CORS junto con credenciales. Por eso, el despliegue completo del backend aún requiere una imagen/configuración de producción y una política CORS restringida. No uses la configuración actual del backend como despliegue de producción.

- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- Documentación API: http://localhost:8000/docs

---

Este y muchos otros proyectos son construidos por estudiantes como parte de los [Coding Bootcamps](https://4geeksacademy.com/) de 4Geeks Academy. Encuentra más acerca de los [cursos](https://4geeksacademy.com/es/comparar-programas) de [Ingeniería de IA](https://4geeksacademy.com/es/coding-bootcamps/ingenieria-ia), [Data Science & Machine Learning](https://4geeksacademy.com/es/coding-bootcamps/curso-datascience-machine-learning), [Ciberseguridad](https://4geeksacademy.com/es/coding-bootcamps/curso-ciberseguridad) y [Full-Stack Software Developer con IA](https://4geeksacademy.com/es/coding-bootcamps/programador-full-stack).

# modificacion de linea
* en docker compose agregué reestart :always