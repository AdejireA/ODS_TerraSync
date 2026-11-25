import os
import sqlite3
from contextlib import contextmanager

DATABASE_PATH = os.environ.get("TERRASYNC_DATABASE_PATH", "terrasync.db")

@contextmanager
def connection():
    db = sqlite3.connect(DATABASE_PATH)
    db.row_factory = sqlite3.Row
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()

def initialize():
    with connection() as db:
        db.execute("""CREATE TABLE IF NOT EXISTS harvest_reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            crop TEXT NOT NULL, quantity REAL NOT NULL, unit TEXT NOT NULL,
            state TEXT NOT NULL, lga TEXT NOT NULL, available_date TEXT NOT NULL,
            contact TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )""")

        db.execute("""CREATE TABLE IF NOT EXISTS guidance (
            id INTEGER PRIMARY KEY AUTOINCREMENT, crop TEXT NOT NULL,
            language TEXT NOT NULL, title TEXT NOT NULL, content TEXT NOT NULL,
            source_url TEXT NOT NULL, reviewed INTEGER NOT NULL DEFAULT 0
        )""")
        db.execute("""CREATE TABLE IF NOT EXISTS harvest_interest (
            report_id INTEGER PRIMARY KEY REFERENCES harvest_reports(id),
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )""")
