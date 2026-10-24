# All About IoT

An educational web application for learning Internet of Things (IoT) concepts through topic pages, quizzes, flashcards, simulations, and a chatbot interface.

## Current status

- **Frontend:** React + TypeScript + Vite. Local development defaults are configured.
- **Backend:** Express + TypeScript. The API build/start workflow is configured to work on Windows and Unix-like systems.
- **Database:** Persistent SQLite using Node.js's built-in `node:sqlite`; no separate database server is required.
- **Integration:** Vite proxies `/api` requests to the API server at `http://127.0.0.1:5000` during development.

## Tech stack

- React, TypeScript, Vite, Tailwind CSS
- Node.js, Express 5, TypeScript
- SQLite (`node:sqlite`)
- Zod, TanStack Query
- pnpm workspaces

## Prerequisites

- Node.js 22.13+ (Node.js 24 LTS recommended)
- pnpm

## Setup

1. Clone this repository and open its root folder in VS Code.
2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Optionally copy `.env.example` to `.env` in the project root. Do not commit `.env`.

## Run locally

Start the API and frontend together from the repository root:

```bash
pnpm run dev
```

Open the local URL Vite prints in the terminal (normally
`http://localhost:5173`). Requests under `/api` are proxied to the API server
at `http://127.0.0.1:5000`. On first startup, the API creates its SQLite
database and initializes the concept and quiz content. The database file is
stored at `data/all-about-iot.sqlite` by default; set `DATABASE_PATH` in `.env`
to choose a different location. Chat history is kept per browser session and
can be permanently cleared with the chat's **Clear** button.

Use `API_PORT` to change the local API port and `VITE_PORT` to change the
frontend port. When a hosting platform supplies `PORT`, the development
launcher uses that for the frontend and keeps the API on port `5000` by default.

## Useful commands

```bash
pnpm run typecheck
pnpm run build
```

## Production deployment

Build the frontend and API, then run the API server, which also serves the
production frontend:

```bash
pnpm install --frozen-lockfile
pnpm run build
pnpm start
```

Set `NODE_ENV=production`, `HOST=0.0.0.0`, and `PORT` in the deployment
environment. Mount a persistent writable volume for `data/`, or set
`DATABASE_PATH` to a persistent absolute path. This SQLite configuration is
intended for a single application instance with persistent local storage; it
does not support horizontally scaled instances sharing ephemeral filesystems.
Terminate TLS at a trusted reverse proxy. If the frontend is hosted on a
different origin, set `CORS_ORIGIN` to its exact origin(s).

`node:sqlite` is built into Node.js 22.13+, but remains an experimental Node.js
API. Account for that status when choosing a long-term production database.

## Project layout

```text
artifacts/
  all-about-iot/   # React frontend
  api-server/      # Express API
lib/
  api-client-react/
  api-spec/
  api-zod/
  db/              # SQLite database access and schema
scripts/
```

## Troubleshooting

- **Database file location:** set `DATABASE_PATH` in the root `.env` or deployment environment to store the SQLite database somewhere other than `data/all-about-iot.sqlite`.
- **Frontend cannot reach the API:** keep the API on port `5000`, or set `API_PROXY_TARGET` to the API's actual URL.
- **Port already in use:** change the relevant port and keep `API_PROXY_TARGET` aligned with the API port.

## Security

Never commit `.env` files, API keys, database passwords, or other credentials.

## License

This project is licensed under the MIT License. See [LICENSE](./LICENSE) for
the full license text.
