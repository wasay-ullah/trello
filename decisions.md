# Decisions

## Architecture
- **React + Vite frontend** — Keeps the UI component-based and supports fast local development.
- **Express backend** — Provides a small, direct HTTP API for authentication, boards, columns, and cards.
- **Sequelize with PostgreSQL** — Gives the backend structured models and relationships for persistent data.

## Authentication
- **Session-based authentication** — The server stores the logged-in user in `req.session`, while the frontend sends cookies with Axios.
- **Protected board routes use middleware** — Board access is checked centrally before route handlers run.

## API Structure
- **Resource-based routes** — Boards, columns, and cards are grouped by resource so responsibilities remain easy to locate.
- **Board details include columns and cards** — The board view can render its complete hierarchy with one request.

## Documentation
- **Root-level project notes** — `decisions.md` records important choices and `flow.md` records runtime behavior so the project is easier to maintain.
