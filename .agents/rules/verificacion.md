## Verificación de resumen

  * Comprobacion de rutas clave  ✅
  * Se intenta correr el programa con los comandos que indica ✅
  * Se le indica al agente corregir puertos para poder visualizar el proyecto. ✅
  * Se consigue visualizar el frontend pero no el backend
  * Marca afirmaciones de API verificadas en /docs ✅

## Patrones arriesgados que conviene vigilar

* Etiqueta de periodo fija frente a fechas dinámicas. El dashboard muestra 2024 - Full Year, pero el generador calcula fechas usando date.today() (App.tsx:49, routes.py:97). Es una discrepancia conocida: no “corregir” un lado por separado sin decidir qué periodo debe representar el producto.

* Semilla aplicada al RNG global. random.seed(seed) dentro de enerate_mock_movements reinicia el estado aleatorio global del proceso (routes.py:94). Si otros módulos usan random, el generador podría afectar su comportamiento; para aislarlos, sería preferible una instancia local de random.Random.

* Arranque de servicios. Compose define un healthcheck del backend en `/health` y el frontend espera `service_healthy`. El cliente no reintenta automáticamente una petición fallida; si el dashboard muestra error, comprueba `docker compose ps` y los logs del backend. Los procesos iniciados fuera de Compose no heredan esa espera.

* CORS permisivo. La API permite todos los orígenes, métodos y encabezados, junto con credenciales (main.py:9). Puede ser una conveniencia de desarrollo; para desplegar, conviene configurar los orígenes autorizados explícitamente.
Estas son advertencias para orientar cambios futuros; no implican que haya que modificar ahora el comportamiento intencional del proyecto.

## Convenciones utiles.

- Respeta la frontera de servicios: solo frontend y backend; no agregues base de datos, autenticación ni otro servicio sin una petición explícita. two-service-boundary.md

- Mantén un contrato coherente: los movimientos usan campos snake_case; los KPI calculados en la interfaz, camelCase. No conviertas los campos de la API. api-field-contract.md

- Trata el generador del backend como fuente de datos: usa generate_mock_movements(seed=42). La UI no debe sustituirlo por mock-data.ts; conserva sus 360 movimientos salvo que actualices también las pruebas. mock-generator-is-source.md

- Conserva el flujo del dashboard: llama a GET /api/metrics y calcula KPI y series mensuales en el cliente con las utilidades existentes. dashboard-math-stays-client-side.md

- No elimines rutas porque la UI no las use. Las rutas adicionales de métricas también forman parte de la API y tienen pruebas. keep-unused-endpoints.md

- Preserva la red de Docker: el proxy de Vite apunta a http://backend:8000; ese nombre es interno a Compose, no lo reemplaces por localhost. Distingue el puerto publicado en el host del puerto del contenedor. 

- preserve-docker-wiring.md

- No sincronices la etiqueta y las fechas unilateralmente: la etiqueta visible está fija en 2024 - Full Year, mientras que el generador depende de la fecha actual. Si se decide unificarlas, cambia ambos lados y sus pruebas. do-not-sync-period-label.md

- Prueba junto al comportamiento modificado: usa pytest para cambios del backend y el test de Vitest correspondiente para las utilidades financieras del frontend; evita correr toda la suite para un cambio pequeño. test-beside-behavior.md

- Evita cambios de estilo ajenos a la tarea: conserva idioma y convenciones existentes; para componentes nuevos, usa el alias @ y el estilo shadcn configurado. no-drive-by-style.md.

## HALLAZGOS 

 * Arquitectura: - Respetar fronteras entre forntend y backend y no agregar
                   componentes mezclando responsabilidades.
                 - preservar red de docker para mantener la correcta 
                   comunicación entre backend y frontend.  
 
 * Naming:       - Usar alias @ para simplificar rutas de importacion.      
                 - Mantener idioma y convenciones existentes para mantener la    
                   coherencia. 

 * Testing:       - Usar pytest para el backend y vytest para modificaciones 
                    puntuales.

 * Documentación: - Se recomienda señirse a las guias existentes evitando
                    cambios no establecidos.

 * DX :            -Mantener coherencia en el flujo de trabajo y asegurar la 
                    cosistencia de desarrollo local para garantizar el entorno para el equipo.               



## Guía específica:

- Antes de redactar specs, inspecciona la documentación interactiva de FastAPI en [`/docs`](https://glorious-journey-j4jvw65prwgcqrjp-8000.app.github.dev/docs).
- Revisa el código frontend relevante: llamadas a la API, tipos de datos y cálculos que usan la respuesta.
- Contrasta la spec con las rutas y modelos del backend; no deduzcas el contrato únicamente desde la UI.
- Si [`/docs`](https://glorious-journey-j4jvw65prwgcqrjp-8000.app.github.dev/docs). no está disponible, indícalo y usa las rutas/modelos del backend como evidencia provisional.
- Señala cualquier discrepancia entre la documentación, el backend y el frontend antes de proponer requisitos.

## Por funcionalidad, pasa el outcome del PM como prompt — deja que el agent proponga tipos, componentes y casos límite.

* Implementa una funcionalidad de alertas de anomalías de gastos debajo de los gráficos del dashboard.

* Antes de implementar, propón los tipos, componentes y casos límite que consideres adecuados. Después, integra la solución con los patrones y el contrato existentes en el proyecto.

* Consulta GET /api/metrics/alerts?threshold=<ratio> y añade un input numérico para configurar el umbral: mínimo 0.01, máximo 1.0, predeterminado 0.3.
* Muestra una tabla con estas cuatro columnas: Período, Gasto registrado, Media móvil de los 3 períodos anteriores y Diferencia porcentual.
* Calcula la media móvil como (gasto de los 3 períodos anteriores) / 3. Calcula la diferencia porcentual como ((gasto actual - media móvil) / media móvil) × 100. El gasto actual supera el umbral cuando su diferencia porcentual es mayor que el ratio configurado; por ejemplo, 0.3 equivale a 30%.
* Respeta el rango de fechas activo en el dashboard para los períodos mostrados. Considera cómo obtener los tres períodos previos cuando el rango empieza a mitad del historial.
* Si no hay anomalías para el umbral y rango actuales, muestra un mensaje explícito de estado vacío; no ocultes la tabla.
* Define y explica cómo manejar períodos con menos de tres valores anteriores o media móvil igual a cero.
Al terminar, resume la fórmula usada, las decisiones sobre casos límite y las verificaciones ejecutadas.

## RESPUESTA DE LA API

curl -X 'GET' \
  'https://glorious-journey-j4jvw65prwgcqrjp-8000.app.github.dev/api/metrics/alerts?threshold=0.3&group_by=month' \
  -H 'accept: */*'

  * Request URL: https://glorious-journey-j4jvw65prwgcqrjp-8000.app.github.dev/api/metrics/alerts?threshold=0.3&group_by=month

CODE:200

# Response body

  [
  {
    "period": "2026-03",
    "outcome_total": 88076.9,
    "baseline_average": 59977.58,
    "increase_ratio": 0.4685
  },
  {
    "period": "2026-06",
    "outcome_total": 80212.01,
    "baseline_average": 60192.76,
    "increase_ratio": 0.3326
  },
  {
    "period": "2026-08",
    "outcome_total": 82189.37,
    "baseline_average": 60515.75,
    "increase_ratio": 0.3581
  }
]

# Response headers

 cache-control: no-cache,no-store 
 content-length: 294 
 content-type: application/json 
 date: Sun,15 Nov 2026 15:12:57 GMT 
 expires: Thu,01 Jan 1970 00:00:00 GMT 
 pragma: no-cache 
 ratelimit-limit: HttpRequestRatePerPort:1500/m 
 ratelimit-remaining: HttpRequestRatePerPort:1499 
 ratelimit-reset: HttpRequestRatePerPort:53s 
 referrer-policy: same-origin 
 strict-transport-security: max-age=31536000; includeSubDomains 
 vary: Origin 
 vssaas-request-id: f2e022de-4d81-4e7f-9852-7a18c67b6fa6 
 x-content-type-options: nosniff 
 x-ms-ratelimit-limit: 1500 
 x-ms-ratelimit-remaining: 1499 
 x-ms-ratelimit-reset: 0 
 x-ms-ratelimit-used: 1 
 x-report-abuse: https://msrc.microsoft.com/report/abuse 
 x-robots-tag: noindex,nofollow 
 x-served-by: tunnels-prod-rel-uks1-v3-cluster 

 ## Successful Response

CODE: 200

 	Aplicacíon JSON:

  [
  {
    "period": "string",
    "outcome_total": 0,
    "baseline_average": 0,
    "increase_ratio": 0
  }
]

## Validation Error

aplicaion json 

{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string",
      "input": "string",
      "ctx": {}
    }
  ]
}

## RESPUESTA DE LA API 

* GET /api/metrics/categories/top?operation_type=income&limit=5 

CURL

curl -X 'GET' \
  'https://glorious-journey-j4jvw65prwgcqrjp-8000.app.github.dev/api/metrics/categories/top?operation_type=outcome&limit=5' \
  -H 'accept: */*'

URL

  https://glorious-journey-j4jvw65prwgcqrjp-8000.app.github.dev/api/metrics/categories/top?operation_type=outcome&limit=5

CODE 200 

	
Response body

[
  {
    "category": "others",
    "operation_type": "outcome",
    "total_amount": 224428.44
  },
  {
    "category": "operational",
    "operation_type": "outcome",
    "total_amount": 196093.22
  },
  {
    "category": "administrative",
    "operation_type": "outcome",
    "total_amount": 188143.37
  },
  {
    "category": "suppliers",
    "operation_type": "outcome",
    "total_amount": 153467.23
  }
]

Successful Response

CODE 200

JSON

[
  {
    "category": "suppliers",
    "operation_type": "income",
    "total_amount": 0
  }
]

# VALIDACION DE ERROR 

CODE 422

{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string",
      "input": "string",
      "ctx": {}
    }
  ]
}


* GET /api/metrics/facets

CURL

curl -X 'GET' \
  'https://glorious-journey-j4jvw65prwgcqrjp-8000.app.github.dev/api/metrics/facets' \
  -H 'accept: */*'

Request URL

https://glorious-journey-j4jvw65prwgcqrjp-8000.app.github.dev/api/metrics/facets

CODE

200 
	
Response body

{
  "operation_types": [
    "income",
    "outcome"
  ],
  "business_types": [
    "B2B",
    "B2C"
  ],
  "categories": [
    "administrative",
    "operational",
    "others",
    "sales",
    "suppliers"
  ],
  "min_date": "2025-11-01",
  "max_date": "2026-10-28"
}

Responses

Code	
200	
 

{
  "operation_types": [
    "income"
  ],
  "business_types": [
    "B2B"
  ],
  "categories": [
    "suppliers"
  ],
  "min_date": "2026-11-15",
  "max_date": "2026-11-15"
}

