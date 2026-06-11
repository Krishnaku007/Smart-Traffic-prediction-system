# API Reference

## Authentication

- POST `/api/auth/register`
- POST `/api/auth/login`

## Prediction

- POST `/api/predict`
- GET `/api/predictions`

## Traffic and Analytics

- GET `/api/traffic`
- GET `/api/analytics`
- GET `/api/routes?source_road_id=1&destination_road_id=6`

## AI Assistant

- POST `/api/assistant`

## Admin

- POST `/api/admin/upload-dataset`
- GET `/api/admin/predictions`
- GET `/api/admin/users`
- GET `/api/admin/traffic-logs`

## Real-time

- WebSocket `/ws/traffic` (10s updates)
