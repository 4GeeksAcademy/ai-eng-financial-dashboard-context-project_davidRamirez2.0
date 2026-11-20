# Contribuir

## Commits

Usa Conventional Commits para los títulos, con el formato `tipo(alcance): resumen` cuando el alcance aporte contexto. Tipos habituales: `feat`, `fix`, `docs`, `test`, `refactor` y `chore`.

Ejemplos: `docs(api): documentar formatos de fecha` y `fix(dashboard): conservar el mes de fechas ISO`.

Es una convención del proyecto, no está automatizada por hooks ni por CI.

## Checklist antes de merge

No hay un workflow de CI ni reglas de branch protection configurados; esta checklist es manual. Marca como no aplicables los checks que no correspondan al área modificada y reporta en el PR los comandos ejecutados y sus resultados.

- [ ] Cambios de backend/API: ejecutar `cd backend && pytest`.
- [ ] Cambios de lógica frontend: ejecutar Vitest para el archivo afectado, por ejemplo `npm --prefix frontend run test -- src/lib/financial-utils.test.ts`.
- [ ] Cambios frontend: ejecutar `npm --prefix frontend run lint` y `npm --prefix frontend run build`.
- [ ] Cambios de Docker/Compose: ejecutar `docker compose config`; levantar con `docker compose up -d --build`, verificar que el backend esté healthy y que el dashboard cargue, y luego detener con `docker compose down`.
- [ ] Para cambios de UI, adjuntar una captura cuando ayude a revisar el resultado visual.
- [ ] Para cambios de API o despliegue, verificar `/health`, `/docs` y una petición real a `/api/metrics` en el entorno correspondiente.

Para cambios pequeños, sigue además la regla de pruebas enfocadas en `.agents/rules/test-beside-behavior.md`.