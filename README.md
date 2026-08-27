# Modern Todo

A mobile-first task planner built with independent frontend and backend projects. The app includes onboarding, a weekly dashboard, task creation and editing, search, checklist actions, and progress summaries.

## Structure 

| Directory | Purpose |
| --- | --- |
| `frontend/` | React + TypeScript + Vite + Tailwind CSS application |
| `backend/` | Node.js + Express + TypeScript + MongoDB/Mongoose API |

The UI is designed around a 390px mobile viewport and expands into a centered app canvas on wider screens. Dashboard and onboarding artwork is stored in `frontend/src/assets/ui/`.

## Requirements

- Node.js 20.19+ (or 22.12+)
- A MongoDB database

## Setup

Since the frontend and backend are completely decoupled, you will need to set up and run both projects independently in separate terminal windows.

### Backend Setup
1. Navigate to the backend directory: `cd backend`
2. Copy `.env.example` to `.env`.
3. Set `MONGO_URL` and `MONGO_DB` in `.env`. Keep this file private; it is ignored by Git.
4. Install dependencies and start the server:
```bash
npm install
npm run dev
```

### Frontend Setup
1. Navigate to the frontend directory: `cd frontend`
2. Copy `.env.example` to `.env` (it contains `VITE_API_URL` pointing to the backend).
3. Install dependencies and start the dev server:
```bash
npm install
npm run dev
```

The frontend runs at `http://localhost:5173` and requests data from the backend at `http://localhost:4000`.

The backend requires a reachable MongoDB database before task data can be loaded or changed. The health endpoint does not require a database connection.

## Deployment

Because the projects are decoupled, they must be deployed independently.

### Frontend (Netlify / Vercel)
The Vite frontend can be deployed statically to Netlify or Vercel. 
- Point your deployment platform to the `frontend` directory.
- Build command: `npm run build`
- Publish directory: `dist`
- Environment Variables: Set `VITE_API_URL=https://your-public-api.example.com`

### Backend (Render / Railway / Heroku)
The Express/MongoDB backend must be deployed to a Node-compatible hosting platform.
- Point your deployment platform to the `backend` directory.
- Build command: `npm run build`
- Start command: `npm run start`
- Environment Variables: Set `MONGO_URL`, `MONGO_DB`, `PORT`, and `CLIENT_ORIGIN` (to your frontend's deployed URL).

## Commands

Commands must be run inside their respective `frontend` or `backend` directories.

```bash
npm run dev        # Run the dev server with watch mode
npm run build      # Create a production build
npm run start      # (Backend only) Serve the production API
```

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

Run the complete local checks in each directory with:

```bash
npx tsc --noEmit
npm run build
```

For a live persistence check, verify `GET /api/health`, then create, update, and delete a temporary task through the API.

