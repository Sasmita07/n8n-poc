# Issue: Phase 10 – Docker Deployment

## Status

🟡 **LOCAL DEVELOPMENT ONLY** — Compose scaffolding starts n8n and the workflow service, but its n8n defaults disable authentication. Published ports are loopback-only. It is not a staging or production deployment; persistent production data services and hardened configuration remain unimplemented.

## Summary

Containerize the application stack for reproducible deployment.

## Goals

- Containerize Node.js application
- Containerize n8n service
- Containerize PostgreSQL and Redis if used
- Use Docker Compose for orchestration

## Acceptance Criteria

- The full stack can run in Docker Compose
- Services start reliably in development and staging environments
- Configuration is documented for container deployment

## Notes

Containerization simplifies local environment setup. Do not expose the current Compose stack publicly; see the security warning in [Setup & Installation](../docs/setup/installation.md#docker-deployment).
