from api.Database.connection import normalize_database_url


class TestNormalizeDatabaseUrl:
    def test_postgresql_bare_gets_psycopg_dialect(self):
        raw = "postgresql://user:pass@host:5432/dbname"
        assert normalize_database_url(raw) == "postgresql+psycopg://user:pass@host:5432/dbname"

    def test_postgres_bare_gets_normalized(self):
        raw = "postgres://user:pass@host:5432/dbname"
        assert normalize_database_url(raw) == "postgresql+psycopg://user:pass@host:5432/dbname"

    def test_already_has_psycopg_dialect_unchanged(self):
        raw = "postgresql+psycopg://user:pass@host:5432/dbname"
        assert normalize_database_url(raw) == raw

    def test_other_dialects_not_touched(self):
        raw = "postgresql+asyncpg://user:pass@host:5432/dbname"
        assert normalize_database_url(raw) == raw

    def test_non_postgresql_urls_not_touched(self):
        assert normalize_database_url("sqlite:///db.sqlite3") == "sqlite:///db.sqlite3"
