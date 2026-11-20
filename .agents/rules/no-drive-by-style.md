# Sin cambios de estilo de paso

## Regla

No reformatees comillas, ni traduzcas la interfaz, en archivos que no estés cambiando por la tarea.

- No unifiques comillas simples y dobles en todo el frontend.
- No pases las etiquetas del dashboard al español ni el mensaje de error al inglés, salvo petición explícita.
- Los componentes nuevos deben usar el alias `@` y el estilo shadcn `new-york` ya configurado.

## Hecho del repo

`frontend/eslint.config.js` extiende las reglas recomendadas de JavaScript, TypeScript, React Hooks y React Refresh. No define una regla de comillas. `frontend/src/App.tsx` usa comillas dobles y el error en español `"No se pudo cargar la informacion financiera. Revisa la API de backend."`. `frontend/src/components/dashboard/kpi-row.tsx` usa comillas simples y etiquetas en inglés (`Total Income`, `Profit Margin`). `frontend/components.json` fija `style` en `new-york` y el alias `@/components`.

## Patrones visuales existentes

- Conserva el tema oscuro aplicado desde `App` y los tokens CSS de `frontend/src/index.css`; no introduzcas colores aislados donde exista un token.
- Usa los componentes compartidos `@/components/ui`, el alias `@`, tarjetas para KPI y paneles, Recharts para gráficos y Lucide para iconos.
- Mantén el layout responsive actual: contenido centrado con ancho máximo, columnas que se apilan en pantallas estrechas y secciones de gráficos en dos columnas en pantallas amplias.
- Conserva estados explícitos de carga (skeleton), vacío y error; los mensajes de error/estado deben seguir siendo accesibles con los roles y anuncios ya usados.
- La interfaz actualmente mezcla etiquetas en inglés con un mensaje de error en español. No hagas una traducción global sin petición explícita.
