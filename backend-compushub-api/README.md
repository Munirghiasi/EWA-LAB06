# CompusHub API (Spring Boot)

In-memory REST API. Runs on `http://localhost:8080`. Allowed frontend origin: `http://localhost:5173`.

Start: `./mvnw spring-boot:run`

## Courses: `/api/v1/courses`

| Method | Path | Success | Errors |
|---|---|---|---|
| GET | `/api/v1/courses` | 200 + array | |
| PUT | `/api/v1/courses/{id}` | 200 + updated course | 400 invalid body, 404 unknown id, 409 code used by another course |
| DELETE | `/api/v1/courses/{id}` | 204 | 404 unknown id |

PUT body: `{"code": "EWA301", "title": "Enterprise Web App", "credits": 3}`

Data is kept in memory and resets when the server restarts.

## Books: `/api/v1/books`

Full CRUD (GET, GET by id, POST, PUT, DELETE).
