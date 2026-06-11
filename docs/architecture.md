# Smart Traffic Prediction System Architecture

## High-Level Design

Frontend (Next.js App Router) calls the FastAPI backend through REST APIs and consumes real-time updates over WebSockets. The backend uses PostgreSQL for transactional storage, Redis for runtime support, and an ML module based on XGBoost for forecasting traffic volume.

## Data Flow

1. Real traffic events are ingested into `traffic_data`.
2. Feature engineering creates `hour`, `day`, `month`, `year`, `is_weekend`, `rush_hour`.
3. XGBoost predicts traffic volume.
4. Prediction is mapped to congestion classes: Low, Medium, High.
5. Route engine computes shortest and fastest paths.
6. Frontend renders KPI cards, map, charts, and alerts.
7. WebSocket pushes updates every 10 seconds.

## Security

- JWT authentication and role checks.
- Password hashing using bcrypt.
- Pydantic input validation.
- CORS allowlist via environment variables.
- Rate limiter middleware (slowapi).

## Deployment

- Frontend: Vercel
- Backend: Render
- Data and cache: PostgreSQL + Redis in Docker Compose or managed services
