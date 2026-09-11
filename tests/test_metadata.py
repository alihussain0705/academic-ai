"""
Tests for metadata normalization (metadata.py).

Covers:
1. Case normalization ("Parul" vs "parul" vs "PARUL")
2. Leading/trailing whitespace
3. Uppercase/lowercase subject
4. Valid alias ("DSA" -> "data structures")
5. Actually different subjects must NOT match
"""

from metadata import normalize_text, resolve_subject, normalize_metadata, normalize_query_metadata


# ── normalize_text ──────────────────────────────────────────────────

class TestNormalizeText:
    def test_lowercase(self):
        assert normalize_text("PARUL") == "parul"

    def test_trim_whitespace(self):
        assert normalize_text("  parul  ") == "parul"

    def test_collapse_internal_whitespace(self):
        assert normalize_text("Data   Structures") == "data structures"

    def test_mixed_case_and_whitespace(self):
        assert normalize_text("  Parul  University  ") == "parul university"

    def test_empty_string(self):
        assert normalize_text("") == ""

    def test_already_normalized(self):
        assert normalize_text("parul") == "parul"


# ── resolve_subject ─────────────────────────────────────────────────

class TestResolveSubject:
    def test_case_insensitive_subject(self):
        assert resolve_subject("Operating Systems") == "operating systems"
        assert resolve_subject("OPERATING SYSTEMS") == "operating systems"
        assert resolve_subject("operating systems") == "operating systems"

    def test_whitespace_in_subject(self):
        assert resolve_subject("  Data  Structures  ") == "data structures"

    def test_alias_dsa(self):
        assert resolve_subject("DSA") == "data structures"

    def test_alias_os(self):
        assert resolve_subject("OS") == "operating systems"

    def test_alias_dbms(self):
        assert resolve_subject("DBMS") == "database management systems"

    def test_alias_cn(self):
        assert resolve_subject("CN") == "computer networks"

    def test_alias_math(self):
        assert resolve_subject("Maths") == "mathematics"

    def test_alias_oops(self):
        assert resolve_subject("OOPS") == "object oriented programming"

    def test_no_alias_returns_normalized(self):
        assert resolve_subject("Machine Learning") == "machine learning"

    def test_different_subjects_do_not_match(self):
        """An actually different subject must NOT resolve to the same value."""
        assert resolve_subject("Machine Learning") != resolve_subject("Data Structures")
        assert resolve_subject("Physics") != resolve_subject("Chemistry")
        assert resolve_subject("Compiler Design") != resolve_subject("Operating Systems")


# ── normalize_metadata ──────────────────────────────────────────────

class TestNormalizeMetadata:
    def test_college_normalization(self):
        meta = normalize_metadata({
            "college": "  PARUL  ",
            "department": "Computer Science",
            "semester": 4,
            "subject": "Operating Systems",
            "unit": 1,
        })
        assert meta["college"] == "parul"

    def test_department_normalization(self):
        meta = normalize_metadata({
            "college": "Parul",
            "department": "  Computer  Science  ",
            "semester": 4,
            "subject": "OS",
            "unit": 1,
        })
        assert meta["department"] == "computer science"
        assert meta["subject"] == "operating systems"  # alias resolved

    def test_subject_alias_in_full_dict(self):
        meta = normalize_metadata({
            "college": "Parul",
            "department": "CSE",
            "semester": 4,
            "subject": "DSA",
            "unit": 2,
        })
        assert meta["subject"] == "data structures"

    def test_non_string_fields_unchanged(self):
        meta = normalize_metadata({
            "college": "Parul",
            "semester": 4,
            "unit": 2,
            "document_id": 42,
        })
        assert meta["semester"] == 4
        assert meta["unit"] == 2
        assert meta["document_id"] == 42

    def test_unknown_keys_passed_through(self):
        meta = normalize_metadata({
            "college": "Parul",
            "custom_field": "hello",
        })
        assert meta["custom_field"] == "hello"


# ── normalize_query_metadata ────────────────────────────────────────

class TestNormalizeQueryMetadata:
    def test_all_fields_normalized(self):
        result = normalize_query_metadata(
            college="  PARUL  ",
            department="Computer  Science",
            semester=4,
            subject="DSA",
        )
        assert result == {
            "college": "parul",
            "department": "computer science",
            "semester": 4,
            "subject": "data structures",
        }

    def test_semester_unchanged(self):
        result = normalize_query_metadata(
            college="Parul",
            department="CSE",
            semester=3,
            subject="Maths",
        )
        assert result["semester"] == 3

    def test_ingestion_query_parity(self):
        """
        Metadata normalized at ingestion time must equal metadata
        normalized at query time for the same raw inputs.
        """
        raw = {
            "college": "  PARUL  ",
            "department": "Computer  Science",
            "semester": 4,
            "subject": "  DSA  ",
            "unit": 1,
            "document_id": 99,
        }
        ingestion = normalize_metadata(raw)
        query = normalize_query_metadata(
            college=raw["college"],
            department=raw["department"],
            semester=raw["semester"],
            subject=raw["subject"],
        )
        # The four filter fields must match
        assert ingestion["college"] == query["college"]
        assert ingestion["department"] == query["department"]
        assert ingestion["semester"] == query["semester"]
        assert ingestion["subject"] == query["subject"]
