from datetime import datetime,UTC

from sqlalchemy import DateTime,Integer,String,ForeignKey,Text
from sqlalchemy.orm import Mapped, mapped_column,relationship

from .connection import Base

class User(Base):
    __tablename__ = "users"

    id:Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    name:Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    email:Mapped[str] = mapped_column(
        String(255),
        nullable = False,
        index = True,
        unique=True
    )

    password_hash:Mapped[str] = mapped_column(
        String(255),
        nullable = False
    )   

    role:Mapped[str] = mapped_column(
        String(20),
        nullable = False,
        default = "student"
    )

    college:Mapped[str] = mapped_column(
        String(100),
        nullable = False
    )

    department:Mapped[str] = mapped_column(
        String(100),
        nullable = False
    )

    semester:Mapped[int] = mapped_column(
        Integer,
        nullable = False
    )

    created_at:Mapped[DateTime] = mapped_column(
        DateTime,
        default = datetime.now(UTC),
        nullable=False
    )
    conversations = relationship(
    "Conversation",
    back_populates="user",
    cascade="all, delete-orphan")

    documents = relationship(
        "AcademicDocument",
        back_populates = "user",
        cascade = "all, delete-orphan"
    )


class Conversation(Base):
    __tablename__ = "conversations"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    thread_id: Mapped[str] = mapped_column(
        String(100),
        unique = True,
        nullable = False,
        index = True
    )

    title: Mapped[str | None] = mapped_column(
        String(200),
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC)
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC)
    )

    user = relationship(
        "User",
        back_populates="conversations"
    )

    messages = relationship(
        "Message",
        back_populates="conversation",
        cascade="all, delete-orphan"
    )

class Message(Base):
    __tablename__ = "messages"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    conversation_id: Mapped[int] = mapped_column(
        ForeignKey("conversations.id"),
        nullable=False,
        index=True
    )

    role: Mapped[str] = mapped_column(
        String(20),
        nullable=False
    )

    content: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC)
    )

    conversation = relationship(
        "Conversation",
        back_populates="messages"
    )

class AcademicDocument(Base):
    __tablename__ = "academic_documents"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index = True
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index = True
    )

    filename: Mapped[str] = mapped_column(
        String(255),
        nullable = False
    )

    file_path: Mapped[str] = mapped_column(
        String(500),
        nullable = False
    )

    file_hash: Mapped[str] = mapped_column(
        String(64),
        nullable = False,
        index = True
    )

    college: Mapped[str] = mapped_column(
        String(100),
        nullable = False
    )

    department: Mapped[str] = mapped_column(
        String(100),
        nullable = False
    )

    semester: Mapped[int] = mapped_column(
        nullable = False
    )

    subject: Mapped[str] = mapped_column(
        String(100),
        nullable = False
    )

    unit: Mapped[int] = mapped_column(
        nullable = False
    )

    status: Mapped[str] = mapped_column(
        String(20),
        nullable = False,
        default = "processing"
    )

    chunk_count: Mapped[int | None] = mapped_column(
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime (timezone = True),
        default= lambda: datetime.now(UTC)
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime (timezone = True),
        default= lambda: datetime.now(UTC),
        onupdate= lambda: datetime.now(UTC)
    )

    user = relationship(
        "User",
        back_populates="documents"
    )
