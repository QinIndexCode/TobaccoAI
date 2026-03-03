from sqlalchemy import Column, String, Float, Integer, DateTime, Text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os

DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite+aiosqlite:///./yanzhitong.db")

engine = create_async_engine(DATABASE_URL, connect_args={"check_same_thread": False})
AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)
Base = declarative_base()


class DiagnosisRecordDB(Base):
    __tablename__ = "diagnosis_records"

    id = Column(String, primary_key=True, index=True)
    image_paths = Column(Text, nullable=False)
    date = Column(String, nullable=False)
    growth_stage = Column(String, nullable=False)
    temperature = Column(Float, nullable=False)
    air_humidity = Column(Float, nullable=False)
    soil_humidity = Column(Float, nullable=False)
    soil_ph = Column(Float, nullable=True)
    notes = Column(Text, nullable=True)
    vl_result = Column(Text, nullable=False)
    llm_suggestion = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
