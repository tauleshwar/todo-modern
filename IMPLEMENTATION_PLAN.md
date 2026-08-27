# Modern Todo Implementation Plan

## Goal

Deliver a polished, mobile-first to-do app that matches the supplied onboarding, dashboard, new-task, and search references while providing reliable persisted task management.

## Architecture

| Layer | Choice | Responsibility |
| --- | --- | --- |
| Frontend | React + TypeScript + Vite + Tailwind CSS | Responsive UI, dashboard state, search, and task interactions |
| Backend | Node.js + Express + TypeScript | REST API, validation, error responses, and production static hosting |
| Database | MongoDB + Mongoose | Task documents, timestamps, and task indexes |

The root package uses npm workspaces. `frontend/` and `backend/` remain independently buildable but share one development command.

## Functional Scope

### Task management

- Create a title, date, time, optional description, and priority.
- Edit task fields.
- Delete a task with confirmation.
- Toggle between `IN_PROGRESS` and `COMPLETED`.
- Search title and description case-insensitively.

### Weekly planning

- Group tasks Monday through Sunday on the API.
- Navigate between weeks and select a day in the client.
- Show completed and pending counters.
- Calculate a completed-task progress bar.
- Toggle the list between the chosen day and the entire selected week.

### UI reference mapping

- Onboarding: blue graphic hero, concise introduction, and Get Started action.
- Home: compact search, seven-day strip, two summary cards, progress bar, task rows, and circular add button.
- Task sheet: bottom-mounted create/edit form with date, time, description, priority, and save state.

## Data model

`Task` documents contain:

- `title` — required, trimmed, up to 140 characters
- `description` — optional, up to 2,000 characters
- `dueAt` — required date/time
- `priority` — `LOW`, `MEDIUM`, or `HIGH`
- `status` — `IN_PROGRESS` or `COMPLETED`
- automatic `createdAt` and `updatedAt` timestamps

Mongoose indexes `dueAt`, `status`, and `title` to support ordering and dashboard queries.

## Reliability and security

- Zod validates every create and update payload.
- The API returns meaningful 4xx/5xx responses; the client shows recoverable error notices.
- Search expressions are escaped before MongoDB regex queries.
- MongoDB credentials stay in the ignored root `.env`; no client-side environment variable contains the connection string.

## Verification status

- Workspace structure: complete
- React/Vite frontend: complete
- Express/Mongoose backend: complete
- Reference-aligned mobile UI: complete
- Lint, type-check, and production build: passing
- Live MongoDB CRUD smoke test: pending final connectivity verification
