# Database: local PostgreSQL server

This folder holds a private PostgreSQL 18 server for the project. It runs from here and needs no installer or admin rights. It listens only on this computer (`localhost:5432`).

```
Database/
├── start.ps1      start the server
├── stop.ps1       stop the server (data is kept)
├── status.ps1     is it running?
├── psql.ps1       open an SQL shell on the language_tutor database
├── postgresql/    PostgreSQL program files          (not in git)
├── data/          the actual database files          (not in git)
└── postgres.log   server log, read it if start fails (not in git)
```

| Database | Used by |
|---|---|
| `language_tutor` | the backend (`DATABASE_URL` in `Mobile_Backend/.env`) |
| `language_tutor_test` | `pytest` when `TEST_DATABASE_URL` points to it |

The superuser is `postgres`. Its password exists **only** in `Mobile_Backend/.env` (gitignored). `psql.ps1` reads it from there.

## Daily use

The server does **not** start by itself when Windows starts. Before running the backend:

**Folder:** `Language-Tutor`

```powershell
.\Database\start.ps1
```

**Expect:** `PostgreSQL is running on localhost:5432.` (or `already running`).
**If it fails:** open `Database\postgres.log`. The most common cause is another program already using port 5432.

Then start the backend as usual (in `Mobile_Backend`, venv active): `uvicorn app.main:app --reload`.

When you're done: `.\Database\stop.ps1`

## Looking at the data

```powershell
.\Database\psql.ps1                                    # interactive; quit with \q
.\Database\psql.ps1 -c "SELECT email, name FROM users;"
```

Handy commands inside psql: `\dt` lists tables, `\d users` shows a table's columns, `\q` quits.

## Changing the tables

Don't edit tables by hand. Change the models in `Mobile_Backend/app/models/`, then create and apply a migration. The migrations live in `Mobile_Backend/alembic/versions/`. See the backend README, section 5.

## Starting over (deletes all data!)

```powershell
.\Database\stop.ps1
Remove-Item -Recurse -Force .\Database\data
```

Then ask for the cluster to be recreated with `initdb` (a new password is needed in `.env`), or recreate the databases and run `alembic upgrade head` and `python -m app.seed` again.

## Backup and restore

```powershell
# Backup (folder: Language-Tutor, server running)
$env:PGPASSWORD = "<password from Mobile_Backend\.env>"
.\Database\postgresql\bin\pg_dump.exe -h localhost -U postgres -Fc language_tutor -f language_tutor.backup

# Restore into an empty language_tutor database
.\Database\postgresql\bin\pg_restore.exe -h localhost -U postgres -d language_tutor language_tutor.backup
Remove-Item Env:PGPASSWORD
```
