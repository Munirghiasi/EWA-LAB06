# CompusHub UI

React (Vite) frontend for the CompusHub course project.

**Student:** Abdul Munir Ghiasi
**Course:** Enterprise Web App, Kabul University

## Ports

| App | URL |
|---|---|
| Spring Boot backend | http://localhost:8080 |
| React frontend (Vite) | http://localhost:5173 |

Course endpoint: `GET http://localhost:8080/api/v1/courses`

## Start commands

Backend (terminal 1, in the Spring Boot project):

```
./mvnw spring-boot:run
```

Frontend (terminal 2, in this project):

```
npm install
npm run dev
```

Open the URL printed by Vite and go to the **Courses** page.

If Vite uses a different port, change `@CrossOrigin` in `CourseController.java` to match.

## Short answers

**Why use useEffect here?** Fetching data is a side effect that must run after the component renders, once on mount. `useEffect(..., [])` does that without refetching on every render.

**What does setCourses do?** It stores the API response in state and tells React to re-render, so the table shows the returned records.

**Why can Postman work while a browser request fails?** Postman does not enforce CORS; browsers do. The backend must allow the frontend's exact origin (scheme, host, port), e.g. via `@CrossOrigin`.

## Lab 2: Edit and Delete courses

Endpoints used (all under `http://localhost:8080/api/v1/courses`):

| Action | Request | Success | Errors |
|---|---|---|---|
| Load | `GET /` | 200 + JSON array | network error |
| Update | `PUT /{id}` with `{code, title, credits}` | 200 + updated course | 400 invalid, 404 unknown id, 409 duplicate code |
| Delete | `DELETE /{id}` | 204 No Content | 404 unknown id |

How it works:

- `src/services/courseApi.js` has `getCourses`, `updateCourse(id, course)` and `deleteCourse(id)`.
- **Edit** copies the clicked row into the form (`editingId` shows the form, `course` holds the input values).
- **Update** sends trimmed strings and a numeric `credits`, then re-fetches the list.
- **Delete** asks `window.confirm`, calls DELETE, then re-fetches the list.
- Failed update/delete errors use their own message (`actionError`), so the table stays visible.
- The data is in memory, so restarting the backend restores the three seed courses.

**Why `String(course.code ?? "").trim()`?** `trim()` only exists on strings. If a value is a number, `null` or `undefined`, calling it throws "trim is not a function". `?? ""` replaces null/undefined, and `String(...)` converts numbers.

**Why refresh with GET after PUT/DELETE?** The table should show what the server really holds, not what the browser assumes.
