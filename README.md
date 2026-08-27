# Modern Todo

A mobile-first task planner built as a TypeScript monorepo. The app includes onboarding, a weekly dashboard, task creation and editing, search, checklist actions, and progress summaries.

## Structure

| Directory | Purpose |
| --- | --- |
| `frontend/` | React + TypeScript + Vite + Tailwind CSS application |
| `backend/` | Node.js + Express + TypeScript + MongoDB/Mongoose API |
| `archive/` | Preserved legacy Next.js project snapshots |

The UI is designed around a 390px mobile viewport and expands into a centered app canvas on wider screens. Dashboard and onboarding artwork is stored in `frontend/src/assets/ui/`.

## Requirements

- Node.js 20.19+ (or 22.12+)
- A MongoDB database

## Setup

1. Copy `.env.example` to `.env`.
2. Set `MONGO_URL` and `MONGO_DB` in `.env`. Keep this file private; it is ignored by Git.
3. Install and run the workspace:

```bash
npm install
npm run dev
```

The frontend runs at `http://localhost:5173` and proxies `/api` requests to the backend at `http://localhost:4000`.

The backend requires a reachable MongoDB database before task data can be loaded or changed. The health endpoint does not require a database connection.

## Netlify deployment

The Vite frontend is ready for Netlify. The included `netlify.toml` uses `frontend/dist` as the publish directory, runs the frontend build, and enables client-side route fallback.

The Express/MongoDB backend is not deployed by Netlify's static hosting. Deploy it separately on a Node-compatible host, then set this Netlify environment variable:

```text
VITE_API_URL=https://your-public-api.example.com
```

Set the backend's `CLIENT_ORIGIN` to the Netlify site URL, for example `https://your-site.netlify.app`. Configure `MONGO_URL`, `MONGO_DB`, and `PORT` on the backend host. After setting `VITE_API_URL`, trigger a new Netlify deploy because Vite embeds it during the build.

For a single-host deployment, build both workspaces and run the backend in production; Netlify alone is not sufficient for that arrangement without migrating the API routes to Netlify Functions.

### Run each workspace separately

```bash
npm run dev --workspace frontend
npm run dev --workspace backend
```

The combined root command is recommended for normal development.

## Commands

```bash
npm run dev        # frontend and backend with watch mode
npm run lint       # lint both projects
npm run typecheck  # type-check both projects
npm run build      # create production frontend and backend builds
npm run start      # serve the production API and built frontend
```

`npm run start` expects both production builds to exist. Run `npm run build` first.

## Frontend behavior

- The onboarding screen is shown once per browser and stores its dismissal in `localStorage` under `todo-modern-onboarding`.
- The dashboard defaults to the current day and groups the week Monday through Sunday.
- Search matches task titles and descriptions without regard to case.
- `View All` switches between the selected day and the complete selected week.
- Selecting a task checkbox toggles its status. Editing and deleting are available on every task row.
- The create and edit form accepts a title, required start and end times, a date, and an optional description.

To show onboarding again during development, remove `todo-modern-onboarding` from the browser's local storage.

### UI assets

Assets in `frontend/src/assets/ui/` are imported directly by the React app:

| Asset | Use |
| --- | --- |
| `Ellipse 9.png`, `Group 24.png`, `Group 25.png` | Onboarding hero artwork |
| `Header.svg` | Search icon |
| `Book (1).svg` | Completed summary icon |
| `Book.svg` | Completed task icon |
| `Rectangle 14.svg` | Open task checkbox |
| `Megaphone.svg` | Pending summary icon |
| `edit.svg`, `trash-2.svg` | Task row actions |

## API

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/health` | API health check |
| `GET` | `/api/tasks?search=term` | List tasks and Monday–Sunday weekly summaries |
| `POST` | `/api/tasks` | Create a task |
| `PATCH` | `/api/tasks/:id` | Update task details or status |
| `DELETE` | `/api/tasks/:id` | Delete a task |

Task payloads accept `title`, `description`, required `startAt` and `endAt` ISO timestamps, and `status` (`IN_PROGRESS`, `COMPLETED`). The server validates every write and requires `endAt` to be later than `startAt`.

### Create task example

```bash
curl -X POST http://localhost:4000/api/tasks \
	-H 'Content-Type: application/json' \
	-d '{
		"title": "Review project notes",
		"description": "Capture the decisions from today",
		"startAt": "2026-08-27T15:30:00.000Z",
		"endAt": "2026-08-27T16:30:00.000Z"
	}'
```

Successful task responses contain a serialized task with `id`, `title`, `description`, `startAt`, `endAt`, `status`, `createdAt`, and `updatedAt`. Validation failures return HTTP `422`; missing tasks return HTTP `404`.

## Verification

Run the complete local checks with:

```bash
npm run typecheck
npm run lint
npm run build
```

For a live persistence check, verify `GET /api/health`, then create, update, and delete a temporary task through the API.

## Legacy archive

The former Next.js/Prisma project was archived before the migration. See `archive/README.md` for the snapshot contents.
