import sqlite3
from contextlib import contextmanager

from app.core.config import database_path


@contextmanager
def connection():
    db = sqlite3.connect(database_path(), timeout=10)
    db.row_factory = sqlite3.Row
    db.execute("PRAGMA foreign_keys = ON")
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def _add_column(db: sqlite3.Connection, table: str, column: str, definition: str) -> None:
    existing = {row["name"] for row in db.execute(f"PRAGMA table_info({table})")}
    if column not in existing:
        db.execute(f"ALTER TABLE {table} ADD COLUMN {column} {definition}")


def initialize():
    with connection() as db:
        db.execute("""CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY, phone TEXT NOT NULL UNIQUE, name TEXT,
            role TEXT NOT NULL CHECK (role IN ('farmer', 'coordinator')),
            pin_hash TEXT NOT NULL, language TEXT NOT NULL DEFAULT 'en',
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )""")

        db.execute("""CREATE TABLE IF NOT EXISTS harvest_reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            crop TEXT NOT NULL, quantity REAL NOT NULL, unit TEXT NOT NULL,
            state TEXT NOT NULL, lga TEXT NOT NULL, available_date TEXT NOT NULL,
            contact TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )""")
        _add_column(db, "harvest_reports", "contact_consent", "INTEGER NOT NULL DEFAULT 0")
        _add_column(db, "harvest_reports", "status", "TEXT NOT NULL DEFAULT 'expected'")
        _add_column(db, "harvest_reports", "user_id", "TEXT REFERENCES users(id)")
        _add_column(db, "harvest_reports", "farm_id", "TEXT")
        _add_column(db, "harvest_reports", "source", "TEXT NOT NULL DEFAULT 'web'")
        _add_column(db, "harvest_reports", "updated_at", "TEXT")

        db.execute("""CREATE TABLE IF NOT EXISTS guidance (
            id INTEGER PRIMARY KEY AUTOINCREMENT, crop TEXT NOT NULL,
            language TEXT NOT NULL, title TEXT NOT NULL, content TEXT NOT NULL,
            source_url TEXT NOT NULL, reviewed INTEGER NOT NULL DEFAULT 0
        )""")

        # Legacy single-flag interest table, kept so older databases still load.
        db.execute("""CREATE TABLE IF NOT EXISTS harvest_interest (
            report_id INTEGER PRIMARY KEY REFERENCES harvest_reports(id),
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )""")
        db.execute("""CREATE TABLE IF NOT EXISTS harvest_interests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            report_id INTEGER NOT NULL REFERENCES harvest_reports(id),
            user_id TEXT REFERENCES users(id), note TEXT,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            UNIQUE (report_id, user_id)
        )""")
        db.execute("""INSERT INTO harvest_interests (report_id, created_at)
            SELECT report_id, created_at FROM harvest_interest
            WHERE report_id NOT IN (SELECT report_id FROM harvest_interests)""")

        db.execute("""CREATE TABLE IF NOT EXISTS harvest_drafts (
            id TEXT PRIMARY KEY, payload TEXT NOT NULL,
            report_id INTEGER REFERENCES harvest_reports(id)
        )""")
        _add_column(db, "harvest_drafts", "user_id", "TEXT REFERENCES users(id)")
        _add_column(db, "harvest_drafts", "source", "TEXT NOT NULL DEFAULT 'web'")

        db.execute("""CREATE TABLE IF NOT EXISTS farms (
            id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id),
            name TEXT, state TEXT NOT NULL, lga TEXT NOT NULL, crop TEXT NOT NULL,
            planting_date TEXT, approximate_age_weeks INTEGER,
            soil_type TEXT, farm_size_ha REAL,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT
        )""")

        db.execute("""CREATE TABLE IF NOT EXISTS tasks (
            id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id),
            farm_id TEXT REFERENCES farms(id), action TEXT NOT NULL,
            due_date TEXT, status TEXT NOT NULL DEFAULT 'pending',
            rule_id TEXT, source TEXT NOT NULL DEFAULT 'web',
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, completed_at TEXT
        )""")

        db.execute("""CREATE TABLE IF NOT EXISTS voice_sessions (
            id TEXT PRIMARY KEY, room TEXT NOT NULL UNIQUE,
            user_id TEXT REFERENCES users(id), farm_id TEXT REFERENCES farms(id),
            language TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            ended_at TEXT
        )""")
        db.execute("""CREATE TABLE IF NOT EXISTS voice_transcripts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL REFERENCES voice_sessions(id),
            role TEXT NOT NULL, text TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )""")
