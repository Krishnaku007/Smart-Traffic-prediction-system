# Smart Traffic Prediction System

Production-ready full-stack platform for real-time traffic monitoring, machine-learning traffic forecasting, route optimization, analytics, and AI-assisted travel insights.

## Tech Stack

- Frontend: Next.js 15 (App Router), TypeScript, Tailwind CSS, React Query, Recharts, Leaflet, OpenStreetMap
- Backend: FastAPI, Python 3.12, SQLAlchemy, Pydantic, WebSockets
- Database: PostgreSQL
- Cache/Realtime support: Redis
- ML: Pandas, NumPy, Scikit-Learn, XGBoost, Joblib
- AI: Gemini API
- Deployment: Docker, Docker Compose, GitHub Actions, Vercel (frontend), Render (backend)

## Features

- Real-time traffic conditions and congestion alerts
- Traffic volume prediction with congestion categorization (Low/Medium/High)
- Estimated travel time for predicted traffic
- Fastest route and shortest-path computation
- KPI dashboard and trend analytics (hourly/daily/weekly/monthly)
- WebSocket auto-refresh every 10 seconds
- AI traffic assistant endpoint powered by Gemini API
- Admin dataset upload, prediction monitoring, user and traffic log views

## Project Structure

```text
smart-traffic-system/
├── frontend/
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── services/
│   └── types/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── models/
│   │   ├── services/
│   │   ├── ml/
│   │   ├── database/
│   │   └── websocket/
│   ├── tests/
│   └── requirements.txt
├── ml/
│   ├── notebooks/
│   ├── models/
│   └── training/
├── docker/
├── docs/
└── docker-compose.yml
```

## Database Tables

- `roads(road_id, road_name, latitude, longitude)`
- `traffic_data(id, road_id, traffic_volume, timestamp)`
- `predictions(id, road_id, predicted_volume, prediction_time)`
- `users(id, name, email, password, role)`

## API Endpoints

- Auth
	- `POST /api/auth/register`
	- `POST /api/auth/login`
- Prediction
	- `POST /api/predict`
	- `GET /api/predictions`
- Analytics and Traffic
	- `GET /api/analytics`
	- `GET /api/traffic`
	- `GET /api/routes`
- AI
	- `POST /api/assistant`
- Admin
	- `POST /api/admin/upload-dataset`
	- `GET /api/admin/predictions`
	- `GET /api/admin/users`
	- `GET /api/admin/traffic-logs`
- WebSocket
	- `WS /ws/traffic`

## Local Development

1. Copy environment template:

```bash
cp .env.example .env
```

2. Run all services with Docker Compose:

```bash
docker compose up --build
```

3. Open the app:

- Frontend: `http://localhost:3000`
- Backend docs: `http://localhost:8000/docs`

## Manual Run (Without Docker)

Backend:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

## ML Training

Train XGBoost model and output metrics:

```bash
cd backend
python -m app.ml.train
```

The model is stored in `ml/models/xgb_traffic_model.joblib` and metrics in `ml/models/model_metrics.json`.

## Security

- JWT authentication
- Password hashing (bcrypt)
- Input validation with Pydantic
- CORS allowlist
- Rate-limiting middleware integration
- Environment-based secrets

## CI/CD

- GitHub Actions CI: backend tests, frontend lint/build
- Manual deployment workflow with deploy hooks for Vercel and Render

## Default Seed Admin

- Email: `admin@traffic.local`
- Password: `Admin@12345`

Change these immediately in production environments.