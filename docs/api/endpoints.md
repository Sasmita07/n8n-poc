# API Reference & Endpoints

The Gateway exposes RESTful endpoints (`/api/v1/`) for controlling workflows, inspecting states, and forwarding incoming webhooks. Interactive Swagger UI is available at `http://localhost:3000/docs`.

## Endpoints Summary

| Method   | Endpoint                          | Description                              |
| -------- | --------------------------------- | ---------------------------------------- |
| GET      | `/health`                         | Application health check                 |
| GET      | `/docs`                           | Interactive Swagger UI Documentation     |
| GET      | `/doc`                            | OpenAPI 3.0 JSON Specification           |
| GET      | `/api/v1/logs`                    | Retrieve execution logs                  |
| GET      | `/api/v1/states`                  | Retrieve all execution states            |
| GET      | `/api/v1/states/:type/:id`        | Get specific execution state             |
| POST     | `/api/v1/workflows`               | Create a new workflow                    |
| POST     | `/api/v1/workflows/:id/activate`  | Trigger / Activate workflow              |
| GET      | `/api/v1/workflows`               | List workflows                           |
| GET      | `/api/v1/workflows/:id`           | Retrieve workflow details                |
| GET/POST | `/webhook/:path`                  | Dynamic webhook endpoint                 |

---

## Interactive Documentation
Run `workflow-service` (`npm run dev`) and visit:
- **Swagger UI**: `http://localhost:3000/docs`
- **OpenAPI Spec**: `http://localhost:3000/doc`
