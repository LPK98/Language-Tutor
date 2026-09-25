# Language Tutor — Backend

The REST API for the Language Tutor React Native app. Built with **FastAPI**, **PostgreSQL**, **SQLAlchemy 2**, **Alembic** and **JWT** authentication.

- Swagger UI (interactive docs): <http://localhost:8000/docs>
- OpenAPI schema: <http://localhost:8000/openapi.json>
- Connecting the app: [docs/FRONTEND_INTEGRATION.md](docs/FRONTEND_INTEGRATION.md)

---

## 1. Key ideas in plain words

| Term | Meaning in this project |
|---|---|
| **API** | The set of URLs the app calls to get or save data. |
| **Endpoint** | One URL plus a method, e.g. `GET /api/lessons/featured`. |
| **Router** | A file grouping related endpoints (`app/routers/lessons.py`). It only handles HTTP and calls a service. |
| **Service** | The business logic, e.g. how a streak is counted (`app/services/progress_service.py`). |
| **Model** | A Python class that maps to a database table (`app/models/`). |
| **ORM** | SQLAlchemy. It turns Python objects into SQL, so you rarely write SQL by hand. |
| **Schema** | A Pydantic class describing the JSON going in or out (`app/schemas/`). It validates input and shapes output. |
| **Migration** | A versioned script that changes the database structure (`alembic/versions/`). |
| **JWT** | A signed token the app receives at login and sends back as `Authorization: Bearer <token>`. |
| **Relationship** | A link between tables using a foreign key, e.g. `lessons.level_id → learning_levels.id`. |

The path of a request:

```
React Native screen → HTTP request → router → service → model (SQLAlchemy) → PostgreSQL
```

## 2. Folder structure

```
Mobile_Backend/
├── app/
│   ├── main.py            creates the FastAPI app, CORS, error handlers, routers
│   ├── seed.py            loads the app's lessons/practice content into the database
│   ├── core/
│   │   ├── config.py      settings from .env
│   │   ├── database.py    engine, sessions, model base class
│   │   ├── security.py    password hashing (Argon2) and JWT tokens
│   │   ├── deps.py        "who is the current user?" dependencies
│   │   └── errors.py      consistent {"detail": "..."} errors
│   ├── models/            database tables
│   ├── schemas/           request/response JSON shapes (camelCase, like the app)
│   ├── routers/           endpoints: auth, users, tutors, lessons, practice, progress
│   └── services/          business logic
├── alembic/               migrations
├── tests/                 pytest tests
├── .env.example           settings template (committed)
├── .env                   your real settings (NEVER committed)
├── alembic.ini
├── pytest.ini
└── requirements.txt
```

There are no separate `vocabulary`, `grammar` or `pronunciation` models or routers. In the app, all three are **practice sets** opened by the same `/practice/[id]` screen, so the backend models them the same way.

## 3. First-time setup

Each step says which folder to run the command in. On Windows, use PowerShell.

### Steps 1–2: Start PostgreSQL

This project has its own PostgreSQL server in the `Database/` folder, and the `language_tutor` database already exists there. See [Database/README.md](../Database/README.md).

**Folder:** `Language-Tutor`

```powershell
.\Database\start.ps1
```

**Expect:** `PostgreSQL is running on localhost:5432.` Run this after every restart of your computer.

### Step 3: Activate the virtual environment

**Folder:** `Mobile_Backend`

```powershell
.\venv\Scripts\Activate.ps1
```

**What it does:** makes `python`, `pip`, `alembic` and `uvicorn` use this project's own packages.
**Expect:** your prompt starts with `(venv)`.
**If it fails** with "running scripts is disabled": run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` once, then try again.

### Step 4: Install dependencies

**Folder:** `Mobile_Backend` (venv active)

```powershell
pip install -r requirements.txt
```

**Expect:** `Successfully installed ...`, or `Requirement already satisfied` for everything.

### Step 5: Check `.env`

**Folder:** `Mobile_Backend`. `.env` is already filled in: `DATABASE_URL` points to the local server in `Database/` (with its generated password) and `JWT_SECRET_KEY` is a generated secret. You don't need to change anything. If you ever connect to a different PostgreSQL server, change `DATABASE_URL` there. If a password contains special characters (`@ : / ? # %`), URL-encode them: `@` → `%40`, `#` → `%23`, `%` → `%25`.

To make a new secret key: `python -c "import secrets; print(secrets.token_urlsafe(64))"`

### Step 6: Create the tables (run the migrations)

**Folder:** `Mobile_Backend` (venv active)

```powershell
alembic upgrade head
```

**What it does:** runs every migration in `alembic/versions/`, which creates all the tables.
**Expect:** `Running upgrade  -> 001e8835a259, initial schema`.
**If it fails:**
- `password authentication failed`: the password in `DATABASE_URL` is wrong.
- `connection refused`: PostgreSQL is not running. Run `.\Database\start.ps1`.

### Step 7: Load the learning content (seed)

**Folder:** `Mobile_Backend` (venv active)

```powershell
python -m app.seed
```

**Expect:** `Seed complete: tutors, lessons, learning paths and practice content are loaded.`
It is safe to run again at any time: rows are updated, never duplicated.

### Step 8: Start the server

**Folder:** `Mobile_Backend` (venv active)

```powershell
uvicorn app.main:app --reload
```

**Expect:** `Uvicorn running on http://127.0.0.1:8000`. `--reload` restarts the server when you save a file.
Open <http://localhost:8000/docs>. Check <http://localhost:8000/api/health>; it should return `{"status":"ok","database":"ok"}`.

To reach the server **from your phone** (Expo Go), listen on every network interface:

```powershell
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Then use your computer's LAN IP (run `ipconfig` and look for "IPv4 Address", e.g. `192.168.1.20`). If the phone can't connect, allow Python through Windows Firewall on private networks.

## 4. Database design

### ID strategy

- **Content** tables (lessons, practice sets…) use the **same readable string ids as the app** (`"modals-deduction"`, `"vocab"`). The app can switch to the API without changing ids, and re-seeding keeps ids stable.
- **User** data uses **UUIDs** (`users.id`), which can't be guessed or counted.
- `practice_terms` and `practice_words` use an integer id internally, because their app ids (`"must"`) are only unique inside their set. The API still returns the app's id (the `slug` column).

### Tables

| Table | Purpose | Primary key | Foreign keys / constraints |
|---|---|---|---|
| `tutors` | Emma | `id` (text) | |
| `users` | account + profile (name, level, language, daily goal, tutor) | `id` (UUID) | `email` UNIQUE; `tutor_id → tutors` (SET NULL); CHECK goal 1–240 |
| `learning_levels` | Beginner / Intermediate / Expert | `id` (text) | `position` UNIQUE |
| `lessons` | path nodes + Home carousel lessons | `id` (text) | `level_id → learning_levels` (CASCADE, indexed); UNIQUE(`level_id`,`position`) |
| `practice_categories` | category chips; `section_position` = topic rail order | `id` (text) | |
| `practice_topics` | topic cards | `id` (text) | `category_id → practice_categories` (CASCADE, indexed); CHECK minutes > 0 |
| `practice_sets` | Vocab, Grammar, Pronunciation | `id` (text) | CHECK `kind` ∈ terms/speech |
| `practice_terms` | glossary entries | `id` (int) | `set_id → practice_sets`; UNIQUE(`set_id`,`slug`) |
| `practice_words` | pronunciation words | `id` (int) | `set_id → practice_sets`; UNIQUE(`set_id`,`slug`) |
| `lesson_completions` | lessons a user finished | (`user_id`,`lesson_id`) | both CASCADE |
| `term_statuses` | Still Learning / Known / My List per user | (`user_id`,`term_id`) | both CASCADE |
| `daily_activity` | practice seconds + lessons completed per user per day | (`user_id`,`activity_date`) | CASCADE; CHECK values ≥ 0 |

Relationships in one line each:

- a **level** has many **lessons**; a **category** has many **topics**; a **set** has many **terms** or **words**;
- a **user** has one **tutor**, many **completions**, **term statuses** and **daily activity** rows. Deleting a user deletes all of those.

Streaks aren't stored: they are **calculated** from `daily_activity`, so they can never get out of sync. Nullable columns are the optional ones (e.g. `lessons.description` exists only for Home lessons, `emoji` only for path nodes). `users.created_at` / `updated_at` are set by PostgreSQL.

Enum-like columns (level, category, status) are stored as text with a CHECK constraint rather than as a PostgreSQL `ENUM` type. Adding an option later is then a normal migration.

## 5. Migrations (Alembic)

Workflow: **change a model → generate a migration → review it → apply it.**
All commands run in `Mobile_Backend` with the venv active.

| Task | Command |
|---|---|
| (Already done, only for new projects) set up Alembic | `alembic init alembic` |
| Create a migration after changing models | `alembic revision --autogenerate -m "add xyz column"` |
| Apply all migrations | `alembic upgrade head` |
| Undo the last migration | `alembic downgrade -1` |
| Undo everything (drops all tables!) | `alembic downgrade base` |
| Show the current version | `alembic current` |
| Show the history | `alembic history` |
| Check the models and database match | `alembic check` |

**Always open and read a generated migration before applying it.** Autogenerate is a helper, not magic. For example, it rendered each enum's CHECK constraint twice in the first migration, and those lines had to be deleted by hand.

## 6. API reference

All endpoints start with `/api`. JSON uses **camelCase** to match the TypeScript types. Every error looks like `{"detail": "message"}`.

🔓 = public (works for guests) · 🔐 = needs `Authorization: Bearer <token>` · 🔓+ = public, with extra personal data when a valid token is sent (an expired token is ignored, so the screen still loads as a guest)

| Method | Path | Screen / purpose | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | create account, returns token | 🔓 |
| POST | `/api/auth/login` | sign in, returns token | 🔓 |
| POST | `/api/auth/logout` | sign out on every device (revokes all tokens) | 🔐 |
| GET | `/api/auth/me` | the signed-in account | 🔐 |
| GET | `/api/users/me?date=` | Profile screen (tutor, language, level, daily goal, streak) | 🔐 |
| PATCH | `/api/users/me` | change name / level / language / tutor / daily goal | 🔐 |
| DELETE | `/api/users/me` | delete the account and all its progress (body: `{"password": "..."}`) | 🔐 |
| GET | `/api/tutors` | tutor list (Emma) | 🔓 |
| GET | `/api/lessons/featured` | Home carousel | 🔓 |
| GET | `/api/lessons/{lessonId}` | one lesson | 🔓 |
| GET | `/api/learning-paths` | Lessons screen path (+ `completed`) | 🔓+ |
| GET | `/api/practice/recommended` | "Recommended for you" | 🔓 |
| GET | `/api/practice/categories` | category chips | 🔓 |
| GET | `/api/practice/sections` | topic rails | 🔓 |
| GET | `/api/practice/sets/{setId}` | `/practice/[id]` screen (+ term `status`) | 🔓+ |
| PUT | `/api/practice/sets/{setId}/terms/{termId}/status` | mark a term | 🔐 |
| GET | `/api/progress/daily-goal?date=` | Daily Goal card | 🔐 |
| GET | `/api/progress/streak?date=` | Streak card and modal | 🔐 |
| POST | `/api/progress/practice` | add practice time | 🔐 |
| POST | `/api/progress/lessons/{lessonId}/complete` | finish a lesson | 🔐 |
| GET | `/api/health` | server + database check (`503` with `"database": "down"` if unreachable) | 🔓 |

**About `date`:** "today" depends on the learner's timezone, so the app sends its local date (`yyyy-mm-dd`, from `toISODate(new Date())` in `profile.ts`). If it's missing, the server uses today's UTC date. A date more than one day from UTC is rejected (400), which stops a client from back-filling an old streak.

### Examples

**Register:** `POST /api/auth/register`

```json
{ "email": "test@example.com", "password": "Test1234", "name": "Lal" }
```

`201 Created`

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "tokenType": "bearer",
  "user": { "id": "bbf1cfdf-…", "email": "test@example.com", "name": "Lal", "createdAt": "2026-09-25T17:13:41Z" }
}
```

Errors: `409` email already registered · `422` invalid email, or a password under 8 characters or without both a letter and a number.

**Login:** `POST /api/auth/login` with `{"email": "...", "password": "..."}` returns the same shape (`200`), or `401 {"detail": "Incorrect email or password"}`. After 5 wrong passwords for one email (or 50 from one IP address) within 15 minutes, login returns `429` with a `Retry-After` header (seconds to wait). The counts are kept in the server's memory, so they reset when it restarts; with several server processes, move them to a shared store such as Redis.

**Logout:** `POST /api/auth/logout` returns `204`. Every token the user holds stops working, on all devices; the app should also delete its stored copy.

**Delete the account:** `DELETE /api/users/me` with `{"password": "..."}` returns `204`, and all of the user's progress is deleted with it. A wrong password returns `403`.

**Profile:** `GET /api/users/me`

```json
{
  "id": "bbf1cfdf-…", "email": "test@example.com", "name": "Lal", "avatarUrl": null,
  "tutor": { "id": "emma", "name": "Emma", "avatarUrl": null },
  "language": { "code": "en-GB", "label": "English (UK)", "flag": "🇬🇧" },
  "level": "A1",
  "dailyGoal": { "goalMinutes": 60, "practisedSeconds": 300, "completedLessons": 1 },
  "streak": { "practisedDates": ["2026-09-25"], "currentStreak": 1, "bestStreak": 1 }
}
```

**Update the profile:** `PATCH /api/users/me` with `{"dailyGoalMinutes": 30, "level": "B1"}` returns the updated profile. Only the fields you send change.

**Record practice:** `POST /api/progress/practice` with `{"seconds": 300, "date": "2026-09-25"}` returns `{"goalMinutes": 60, "practisedSeconds": 300, "completedLessons": 0}`. `seconds` must be a JSON number (not `"300"` or `true`), at most 4 hours per request; a day never stores more than 24 hours in total.

**Complete a lesson:** `POST /api/progress/lessons/hello/complete` (body optional: `{"date": "2026-09-25"}`)

```json
{ "lessonId": "hello", "completedAt": "2026-09-25T17:13:41Z",
  "dailyGoal": { "goalMinutes": 60, "practisedSeconds": 300, "completedLessons": 1 } }
```

**Practice set:** `GET /api/practice/sets/grammar`

```json
{ "kind": "terms", "id": "grammar", "title": "Grammar", "unitLabel": "Practiced Grammar",
  "terms": [ { "id": "must", "term": "Must", "definition": "…", "example": "…", "status": "known" },
             { "id": "might", "term": "Might", "definition": "…", "example": "…" } ] }
```

`status` is **left out** (not `null`) for unclassified terms. The app's `practisedCount` treats anything other than `undefined` as practised.

**Mark a term:** `PUT /api/practice/sets/grammar/terms/must/status` with `{"status": "known"}` (or `"still-learning"`, `"my-list"`, or `null` to clear).

## 7. Testing

### Automated tests (pytest)

**Folder:** `Mobile_Backend` (venv active)

```powershell
pytest
```

**Expect:** `34 passed`. Tests use a temporary in-memory SQLite database by default, so they don't need PostgreSQL and don't touch your data.

To run them against PostgreSQL, create an **empty** database called `language_tutor_test` (tests drop its tables afterwards), then:

```powershell
$env:TEST_DATABASE_URL = "postgresql+psycopg://postgres:YOUR_PASSWORD@localhost:5432/language_tutor_test"
pytest
Remove-Item Env:TEST_DATABASE_URL
```

| File | Covers |
|---|---|
| `tests/test_auth.py` | register, login, duplicates, password rules, token checks |
| `tests/test_users.py` | profile shape, partial updates, validation |
| `tests/test_lessons.py` | Home lessons, learning paths, per-user completion |
| `tests/test_practice.py` | recommended, categories, sections, sets, term statuses |
| `tests/test_progress.py` | practice time, lesson completion, streak rules |
| `tests/test_app.py` | docs, CORS, 500 errors hide internal details, health 503, security headers |
| `tests/test_concurrency.py` | parallel requests (double taps) on practice time, lessons and term statuses; **runs on PostgreSQL only**, skipped on SQLite |

### Manually with Swagger

1. Open <http://localhost:8000/docs>.
2. `POST /api/auth/register` → **Try it out** → edit the body → **Execute**.
3. Copy `accessToken` from the response.
4. Click **Authorize** (top right), paste the token, click **Authorize**.
5. Every 🔐 endpoint now works. Try `GET /api/users/me`.

### Manually with curl (PowerShell: use `curl.exe`, not `curl`)

```powershell
curl.exe -X POST http://localhost:8000/api/auth/login -H "Content-Type: application/json" -d '{\"email\":\"test@example.com\",\"password\":\"Test1234\"}'
curl.exe http://localhost:8000/api/users/me -H "Authorization: Bearer PASTE_TOKEN_HERE"
```

In Postman, set **Authorization → Bearer Token** and paste the token.

## 8. Security notes

- Passwords are hashed with **Argon2** (`pwdlib`). Plain passwords are never stored or logged.
- A wrong password and an unknown email return the same message and take the same time, so attackers can't discover which emails are registered.
- JWTs are signed with `JWT_SECRET_KEY` from `.env` and expire after `ACCESS_TOKEN_EXPIRE_MINUTES` (default 1 day). The app has no refresh tokens yet: when a token expires, the user signs in again.
- Unexpected errors return `{"detail": "Internal server error"}`. The real error goes only to the server log.
- `.env`, `venv/`, `__pycache__/`, `.pytest_cache/` and `*.pyc` are in the repository's `.gitignore`.

## 9. Before production

- Set `ENVIRONMENT=production`, a **new** `JWT_SECRET_KEY`, and a production `DATABASE_URL`. Keep them in the host's secret settings, not in files.
- **CORS:** set `CORS_ORIGINS` to only your real web domain(s), or leave it empty if you ship only the iOS/Android apps. Native apps don't use CORS. It only matters for Expo **web** in a browser.
- Serve over **HTTPS** only (tokens travel in headers).
- Run without `--reload`, e.g. `uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 2`, behind the host's HTTPS proxy.
- Run `alembic upgrade head` as part of each deployment, **before** starting the new version.
- Consider adding: rate limiting on `/api/auth/login`, refresh tokens, and hiding `/docs`.
