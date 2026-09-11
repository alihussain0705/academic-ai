import pytest
import os
import tempfile
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from api.main import app
from api.Database.connection import Base, get_db
from api.Database.models import User, Conversation, Message, AcademicDocument
from api.auth.jwt import create_access_token


@pytest.fixture(name="db_session")
def session_fixture():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    TestSession = sessionmaker(bind=engine)
    session = TestSession()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture(name="client")
def client_fixture(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture(name="student_user")
def student_user_fixture(db_session):
    user = User(
        name="Test Student",
        email="student@test.com",
        password_hash="hashed_password",
        role="student",
        college="Parul",
        department="CSE",
        semester=3,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture(name="student_token")
def student_token_fixture(student_user):
    return create_access_token(student_user.id, student_user.role, student_user.name)


@pytest.fixture(name="student_headers")
def student_headers_fixture(student_token):
    return {"Authorization": f"Bearer {student_token}"}


@pytest.fixture(name="other_user")
def other_user_fixture(db_session):
    user = User(
        name="Other Student",
        email="other@test.com",
        password_hash="hashed_password",
        role="student",
        college="Parul",
        department="CSE",
        semester=3,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture(name="other_token")
def other_token_fixture(other_user):
    return create_access_token(other_user.id, other_user.role, other_user.name)


@pytest.fixture(name="other_headers")
def other_headers_fixture(other_token):
    return {"Authorization": f"Bearer {other_token}"}


@pytest.fixture(name="professor_user")
def professor_user_fixture(db_session):
    user = User(
        name="Test Professor",
        email="prof@test.com",
        password_hash="hashed_password",
        role="professor",
        college="Parul",
        department="CSE",
        semester=3,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture(name="professor_token")
def professor_token_fixture(professor_user):
    return create_access_token(professor_user.id, professor_user.role, professor_user.name)


@pytest.fixture(name="professor_headers")
def professor_headers_fixture(professor_token):
    return {"Authorization": f"Bearer {professor_token}"}


class TestConversationRename:
    def test_create_conversation_has_title(self, client, student_headers):
        res = client.post("/conversations/", headers=student_headers)
        assert res.status_code == 200
        assert res.json()["title"] == "New Conversation"

    def test_rename_conversation(self, client, student_headers):
        res = client.post("/conversations/", headers=student_headers)
        conv_id = res.json()["id"]

        res = client.patch(
            f"/conversations/{conv_id}",
            headers=student_headers,
            json={"title": "Pointers in C"}
        )
        assert res.status_code == 200
        assert res.json()["title"] == "Pointers in C"

    def test_rename_conversation_empty_title_rejected(self, client, student_headers):
        res = client.post("/conversations/", headers=student_headers)
        conv_id = res.json()["id"]

        res = client.patch(
            f"/conversations/{conv_id}",
            headers=student_headers,
            json={"title": ""}
        )
        assert res.status_code == 422

    def test_rename_other_users_conversation_forbidden(self, client, student_headers, other_headers, db_session):
        res = client.post("/conversations/", headers=student_headers)
        conv_id = res.json()["id"]

        res = client.patch(
            f"/conversations/{conv_id}",
            headers=other_headers,
            json={"title": "Hacked Title"}
        )
        assert res.status_code == 404

    def test_rename_nonexistent_conversation(self, client, student_headers):
        res = client.patch(
            "/conversations/99999",
            headers=student_headers,
            json={"title": "Test"}
        )
        assert res.status_code == 404


class TestConversationDelete:
    def test_delete_conversation(self, client, student_headers):
        res = client.post("/conversations/", headers=student_headers)
        conv_id = res.json()["id"]

        res = client.delete(f"/conversations/{conv_id}", headers=student_headers)
        assert res.status_code == 200
        assert "deleted" in res.json()["detail"].lower()

    def test_delete_conversation_removes_messages(self, client, student_headers, db_session):
        res = client.post("/conversations/", headers=student_headers)
        conv_id = res.json()["id"]

        conv = db_session.query(Conversation).filter(Conversation.id == conv_id).first()
        msg = Message(conversation_id=conv.id, role="user", content="test")
        db_session.add(msg)
        db_session.commit()

        res = client.delete(f"/conversations/{conv_id}", headers=student_headers)
        assert res.status_code == 200

        msgs = db_session.query(Message).filter(Message.conversation_id == conv_id).all()
        assert len(msgs) == 0

    def test_delete_other_users_conversation_forbidden(self, client, student_headers, other_headers):
        res = client.post("/conversations/", headers=student_headers)
        conv_id = res.json()["id"]

        res = client.delete(f"/conversations/{conv_id}", headers=other_headers)
        assert res.status_code == 404

    def test_delete_nonexistent_conversation(self, client, student_headers):
        res = client.delete("/conversations/99999", headers=student_headers)
        assert res.status_code == 404


class TestConversationOwnership:
    def test_user_sees_only_own_conversations(self, client, student_headers, other_headers):
        client.post("/conversations/", headers=student_headers)
        client.post("/conversations/", headers=student_headers)

        res = client.get("/conversations/", headers=student_headers)
        assert res.status_code == 200
        assert len(res.json()) == 2

        res = client.get("/conversations/", headers=other_headers)
        assert res.status_code == 200
        assert len(res.json()) == 0

    def test_user_cannot_access_other_users_conversation(self, client, student_headers, other_headers):
        res = client.post("/conversations/", headers=student_headers)
        conv_id = res.json()["id"]

        res = client.post(f"/conversations/{conv_id}", headers=other_headers)
        assert res.status_code == 404


class TestClassDocumentAccess:
    def _create_document(self, db_session, user_id, filename, college, department, semester, subject="DS", unit=1):
        doc = AcademicDocument(
            user_id=user_id,
            filename=filename,
            file_path=f"/uploads/{filename}",
            file_hash=f"hash_{filename}",
            college=college,
            department=department,
            semester=semester,
            subject=subject,
            unit=unit,
            status="completed"
        )
        db_session.add(doc)
        db_session.commit()
        db_session.refresh(doc)
        return doc

    def test_student_sees_same_class_documents(self, client, student_headers, professor_user, db_session):
        self._create_document(db_session, professor_user.id, "notes.pdf", "Parul", "CSE", 3)

        res = client.get("/documents/class", headers=student_headers)
        assert res.status_code == 200
        assert len(res.json()) == 1
        assert res.json()[0]["filename"] == "notes.pdf"

    def test_student_does_not_see_different_college(self, client, student_headers, professor_user, db_session):
        self._create_document(db_session, professor_user.id, "other.pdf", "Other College", "CSE", 3)

        res = client.get("/documents/class", headers=student_headers)
        assert res.status_code == 200
        assert len(res.json()) == 0

    def test_student_does_not_see_different_department(self, client, student_headers, professor_user, db_session):
        self._create_document(db_session, professor_user.id, "it.pdf", "Parul", "IT", 3)

        res = client.get("/documents/class", headers=student_headers)
        assert res.status_code == 200
        assert len(res.json()) == 0

    def test_student_does_not_see_different_semester(self, client, student_headers, professor_user, db_session):
        self._create_document(db_session, professor_user.id, "sem4.pdf", "Parul", "CSE", 4)

        res = client.get("/documents/class", headers=student_headers)
        assert res.status_code == 200
        assert len(res.json()) == 0

    def test_student_does_not_see_processing_documents(self, client, student_headers, professor_user, db_session):
        doc = AcademicDocument(
            user_id=professor_user.id,
            filename="processing.pdf",
            file_path="/uploads/processing.pdf",
            file_hash="hash_processing",
            college="Parul",
            department="CSE",
            semester=3,
            subject="DS",
            unit=1,
            status="processing"
        )
        db_session.add(doc)
        db_session.commit()

        res = client.get("/documents/class", headers=student_headers)
        assert res.status_code == 200
        assert len(res.json()) == 0

    def test_download_same_class_document(self, client, student_headers, professor_user, db_session):
        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
            tmp_path = tmp.name
        try:
            doc = self._create_document(db_session, professor_user.id, "download.pdf", "Parul", "CSE", 3)
            doc.file_path = tmp_path
            db_session.commit()

            res = client.get(f"/documents/{doc.id}/download", headers=student_headers)
            assert res.status_code == 200
        finally:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)

    def test_download_different_class_document_denied(self, client, student_headers, professor_user, db_session):
        doc = self._create_document(db_session, professor_user.id, "other.pdf", "Other College", "CSE", 3)

        res = client.get(f"/documents/{doc.id}/download", headers=student_headers)
        assert res.status_code == 404

    def test_download_nonexistent_document(self, client, student_headers):
        res = client.get("/documents/99999/download", headers=student_headers)
        assert res.status_code == 404

    def test_unauthenticated_access_denied(self, client):
        res = client.get("/documents/class")
        assert res.status_code == 401

        res = client.get("/documents/1/download")
        assert res.status_code == 401

    def test_student_cannot_access_professor_endpoints(self, client, student_headers):
        res = client.get("/documents/documents", headers=student_headers)
        assert res.status_code == 403

    def test_professor_can_still_manage_documents(self, client, professor_headers, professor_user, db_session):
        self._create_document(db_session, professor_user.id, "prof.pdf", "Parul", "CSE", 3)

        res = client.get("/documents/documents", headers=professor_headers)
        assert res.status_code == 200
        assert len(res.json()) == 1

    def test_student_with_lowercase_sees_mixed_case_document(self, client, professor_user, db_session):
        """Regression: student college='parul' dept='computer' should see doc uploaded as 'Parul'/'Computer'"""
        student2 = User(
            name="Lowercase Student",
            email="lower@test.com",
            password_hash="hashed_password",
            role="student",
            college="parul",
            department="computer",
            semester=3,
        )
        db_session.add(student2)
        db_session.commit()
        db_session.refresh(student2)
        token2 = create_access_token(student2.id, student2.role, student2.name)
        headers2 = {"Authorization": f"Bearer {token2}"}

        self._create_document(db_session, professor_user.id, "java.pdf", "Parul", "Computer", 3)

        res = client.get("/documents/class", headers=headers2)
        assert res.status_code == 200
        assert len(res.json()) == 1
        assert res.json()[0]["filename"] == "java.pdf"

    def test_student_with_uppercase_sees_lowercase_document(self, client, professor_user, db_session):
        """Regression: student college='PARUL' dept='COMPUTER' should see doc uploaded as 'parul'/'computer'"""
        student3 = User(
            name="Uppercase Student",
            email="upper@test.com",
            password_hash="hashed_password",
            role="student",
            college="PARUL",
            department="COMPUTER",
            semester=3,
        )
        db_session.add(student3)
        db_session.commit()
        db_session.refresh(student3)
        token3 = create_access_token(student3.id, student3.role, student3.name)
        headers3 = {"Authorization": f"Bearer {token3}"}

        self._create_document(db_session, professor_user.id, "lowercase.pdf", "parul", "computer", 3)

        res = client.get("/documents/class", headers=headers3)
        assert res.status_code == 200
        assert len(res.json()) == 1
        assert res.json()[0]["filename"] == "lowercase.pdf"

    def test_existing_lowercase_documents_still_work(self, client, student_headers, professor_user, db_session):
        """Existing documents stored as lowercase should still match"""
        self._create_document(db_session, professor_user.id, "existing.pdf", "parul", "cse", 3)

        res = client.get("/documents/class", headers=student_headers)
        assert res.status_code == 200
        assert len(res.json()) == 1
        assert res.json()[0]["filename"] == "existing.pdf"

    def test_download_respects_case_insensitive_match(self, client, professor_user, db_session):
        """Download should also work with mixed case"""
        student_lower = User(
            name="Lower",
            email="lower2@test.com",
            password_hash="hashed_password",
            role="student",
            college="parul",
            department="cse",
            semester=3,
        )
        db_session.add(student_lower)
        db_session.commit()
        db_session.refresh(student_lower)
        token = create_access_token(student_lower.id, student_lower.role, student_lower.name)
        headers = {"Authorization": f"Bearer {token}"}

        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
            tmp_path = tmp.name
        try:
            doc = self._create_document(db_session, professor_user.id, "mixed.pdf", "PARUL", "CSE", 3)
            doc.file_path = tmp_path
            db_session.commit()

            res = client.get(f"/documents/{doc.id}/download", headers=headers)
            assert res.status_code == 200
        finally:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)


class TestTitleGeneration:
    def test_simple_question(self):
        from api.services.conversation import generate_title
        assert generate_title("What are pointers in C?") == "What are pointers in C"

    def test_trailing_punctuation(self):
        from api.services.conversation import generate_title
        assert generate_title("Explain async/await!") == "Explain async/await"
        assert generate_title("What is recursion?") == "What is recursion"

    def test_empty_string(self):
        from api.services.conversation import generate_title
        assert generate_title("") == "New Conversation"
        assert generate_title("   ") == "New Conversation"

    def test_max_length(self):
        from api.services.conversation import generate_title
        result = generate_title("A" * 100)
        assert len(result) <= 60

    def test_word_boundary_truncation(self):
        from api.services.conversation import generate_title
        result = generate_title("What are the different types of sorting algorithms and their time complexities?")
        assert len(result) <= 60
        assert not result.endswith(" ")
