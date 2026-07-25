# Issue: Phase 4 – Persistent Storage

## Summary

Replace the in-memory state store with a persistent storage solution.

## Goals

- Move workflow metadata to a database
- Store execution history in persistent storage
- Persist logs and user data to a datastore
- Evaluate PostgreSQL, MongoDB, or Redis

## Acceptance Criteria

- In-memory state is removed or deprecated
- Workflow states, logs, and execution history are stored persistently
- The app can run with a configured database backend

## Notes

This phase improves reliability and scalability by using durable storage.
