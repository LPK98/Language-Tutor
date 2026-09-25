"""Database connection: the SQLAlchemy engine, sessions and the model base class."""

from collections.abc import Iterator

from sqlalchemy import MetaData, create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import get_settings

# Predictable constraint names, so Alembic can later find and drop them by name.
NAMING_CONVENTION = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_N_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}


class Base(DeclarativeBase):
    metadata = MetaData(naming_convention=NAMING_CONVENTION)


# pool_pre_ping replaces connections PostgreSQL has silently closed.
engine = create_engine(get_settings().database_url, pool_pre_ping=True)

SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


def upsert(db: Session, model: type[Base]):
    """An INSERT that supports ON CONFLICT DO NOTHING / DO UPDATE.

    "Create the row if it is missing" must be one statement: checking first and
    inserting afterwards fails when two requests arrive together, because both
    see no row and the second insert hits the primary key. PostgreSQL (the app)
    and SQLite (the default tests) share the same ON CONFLICT syntax.
    """
    dialect = db.get_bind().dialect.name
    if dialect == "postgresql":
        from sqlalchemy.dialects.postgresql import insert
    elif dialect == "sqlite":
        from sqlalchemy.dialects.sqlite import insert
    else:
        raise NotImplementedError(f"upsert is not supported on {dialect}")
    return insert(model)


def get_db() -> Iterator[Session]:
    """FastAPI dependency: one session per request, always closed afterwards."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
