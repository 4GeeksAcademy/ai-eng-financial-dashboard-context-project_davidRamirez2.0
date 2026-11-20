# Contrato de campos de la API

## Regla

No renombres los campos de un movimiento financiero.

- En la API y en el tipo compartido del frontend usa `snake_case`: `create_date`, `amount`, `operation_type`, `category`, `business_type`.
- Los KPI calculados en la UI se quedan en camelCase: `totalIncome`, `totalOutcome`, `profit`, `profitPercent`.

No conviertas el JSON de la API a camelCase ni los KPI a snake_case.

## Formato de datos en la UI

- Conserva importes y métricas como números durante los cálculos; el formato de presentación no debe alterar los valores usados en sumas o porcentajes.
- `create_date` es una fecha de calendario `YYYY-MM-DD`, no una marca de tiempo. Agrupa por sus componentes de año y mes; no conviertas una fecha sin hora en un instante con `new Date(value)` ni apliques conversiones de zona horaria.
- `formatCurrency` muestra los KPI y gráficos en USD, locale `en-US`, sin decimales. `formatPercent` muestra un decimal. La tabla de alertas conserva dos decimales para USD y porcentajes; `increase_ratio` es una razón y se multiplica por 100 solo al mostrarla.
- Mantén la diferencia actual de precisión entre resumen y alertas hasta que se decida un formato único.

## Hecho del repo

`frontend/src/lib/financial-types.ts` define `FinancialMovement` en snake_case y `KPIMetrics` en camelCase. `backend/app/routes.py` usa los mismos nombres snake_case en el modelo `FinancialMovement` y tipa `create_date` como `date`. `frontend/src/lib/financial-utils.ts` conserva año y mes desde la cadena de fecha, formatea meses en `en-US` y exporta los formatos comunes de KPI.
