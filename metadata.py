"""
Metadata normalization for consistent RAG filtering.

Handles case differences, leading/trailing whitespace, repeated whitespace,
and explicit subject aliases so that "Parul", "parul", "PARUL", and
"Parul University" all resolve to the same canonical value.
"""

import re

# ── Text normalization ──────────────────────────────────────────────

def normalize_text(text: str) -> str:
    """Lowercase, strip whitespace, and collapse repeated internal whitespace."""
    return re.sub(r"\s+", " ", text.strip().lower())


# ── Subject aliases ─────────────────────────────────────────────────
# Explicit controlled mapping.  Add new aliases here rather than
# attempting fuzzy or embedding-based matching.

SUBJECT_ALIASES: dict[str, str] = {
    "dsa": "data structures",
    "data structures and algorithms": "data structures",
    "os": "operating systems",
    "oops": "object oriented programming",
    "oop": "object oriented programming",
    "dbms": "database management systems",
    "database systems": "database management systems",
    "cn": "computer networks",
    "mpmc": "microprocessor and microcontroller",
    "mp": "microprocessor and microcontroller",
    "emf": "electromagnetic fields",
    "beee": "basic electrical and electronics engineering",
    "maths": "mathematics",
    "math": "mathematics",
    "chem": "chemistry",
    "phy": "physics",
    "eg": "english",
}

# ── Metadata field keys that hold string values ─────────────────────
_STRING_FIELDS = ("college", "department", "subject")


def resolve_subject(subject: str) -> str:
    """Normalize a subject string and apply alias resolution."""
    normalized = normalize_text(subject)
    return SUBJECT_ALIASES.get(normalized, normalized)


# ── Full-dict normalization ─────────────────────────────────────────

def normalize_metadata(metadata: dict) -> dict:
    """
    Return a new dict with string metadata fields normalized.

    - college, department: normalize_text (case-fold + whitespace collapse)
    - subject: resolve_subject (normalize + alias lookup)
    - semester, unit, document_id: passed through unchanged (int)
    - other keys: passed through unchanged
    """
    out = {}
    for key, value in metadata.items():
        if key in ("college", "department"):
            out[key] = normalize_text(value) if isinstance(value, str) else value
        elif key == "subject":
            out[key] = resolve_subject(value) if isinstance(value, str) else value
        else:
            out[key] = value
    return out


def normalize_query_metadata(
    college: str,
    department: str,
    semester: int,
    subject: str,
) -> dict:
    """
    Normalize the four metadata fields used in RAG retrieval filters.

    Returns a dict suitable for passing into ChromaDB filter construction.
    """
    return {
        "college": normalize_text(college),
        "department": normalize_text(department),
        "semester": semester,
        "subject": resolve_subject(subject),
    }
