# Financial Metrics Dashboard

<!-- hide -->

By [@marcogonzalo](https://github.com/marcogonzalo) and [other contributors](https://github.com/4GeeksAcademy/ai-eng-financial-dashboard-context-project/graphs/contributors) at [4Geeks Academy](https://4geeksacademy.com/)

[![build by developers](https://img.shields.io/badge/build_by-Developers-blue)](https://4geeks.com)
[![4Geeks Academy](https://img.shields.io/twitter/follow/4geeksacademy?style=social&logo=x)](https://x.com/4geeksacademy)

_Estas instrucciones están [disponibles en español](./README.es.md)._

**Before you start**: 📗 [Read the instructions](https://4geeks.com/lesson/how-to-start-a-project) on how to start a coding project.

<!-- endhide -->

---

_Financial metrics dashboard with a React + TypeScript frontend and a FastAPI backend._

## Recommended steps

1. Fork this repository to your account.
2. Open your fork in GitHub Codespaces or clone it and run it in your local environment.
3. Run your AI agent to inspect both frontend and backend.
4. Document the proposed rules and memory bank in your fork.
5. Refine and validate the rules until they fit the project's real workflow.

## Expected agents directory structure

```text
./.agents
└─ /rules
   └─ <rule-name>.md
└─ /skills
   └─ /<skill-name>
      └─ /SKILL.md
```

## How to run locally

```bash
./start-services.sh
```

The script builds and starts the backend, then the frontend, in the background.
You can also start them manually:

```bash
docker compose up -d --build backend
docker compose up -d --build frontend
```

The frontend uses the Vite proxy for `/api` by default, so no extra environment variables are required in local development or Codespaces.
To target a different backend during development, set `VITE_API_BASE_URL` in `frontend/.env.local` to a URL reachable by the browser, for example `http://localhost:8000`.

### Container deployment

```bash
docker build --target production -t financial-dashboard-frontend ./frontend
```

1. Build the frontend image with the command above and publish it to the registry used by your container platform.
2. Run the container with port `8080` exposed.
3. Connect the frontend and backend to a network where the API resolves as `backend:8000`; Nginx forwards `/api/` to that hostname.
4. Verify `GET /api/metrics` through the frontend and `/health` and `/docs` directly on the backend.

The repository defines a production target only for the frontend and does not select a hosting provider. `docker-compose.yml` is for development; `backend/Dockerfile` starts `debugpy` and Uvicorn with `--reload`, and the backend allows all CORS origins together with credentials. A complete backend deployment still requires a production image/configuration and a restricted CORS policy. Do not use the current backend configuration as a production deployment.

- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- API documentation: http://localhost:8000/docs

---

This and many other projects are built by students as part of the [Career Programs](https://4geeksacademy.com/compare-programs) at [4Geeks Academy](https://4geeksacademy.com). By [@marcogonzalo](https://github.com/marcogonzalo) and [other contributors](https://github.com/4GeeksAcademy/ai-eng-financial-dashboard-context-project/graphs/contributors). Find out more about [AI Engineering](https://4geeksacademy.com/en/coding-bootcamps/ai-engineering), [Data Science & Machine Learning](https://4geeksacademy.com/en/coding-bootcamps/data-science-ml), [Cybersecurity](https://4geeksacademy.com/en/coding-bootcamps/cybersecurity) and [Full-Stack Software Developer with AI](https://4geeksacademy.com/en/coding-bootcamps/full-stack-developer).
