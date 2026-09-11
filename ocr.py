import pymupdf
import pytesseract
from PIL import Image
from io import BytesIO

from langchain_core.documents import Document


def ocr_pdf(pdf_path: str) -> list[Document]:
    pdf = pymupdf.open(pdf_path)

    documents = []

    for page_number, page in enumerate(pdf):

        pixmap = page.get_pixmap(dpi=200)

        image_bytes = pixmap.tobytes("png")

        image = Image.open(
            BytesIO(image_bytes)
        )

        text = pytesseract.image_to_string(
            image
        )

        documents.append(
            Document(
                page_content=text,
                metadata={
                    "page": page_number + 1
                }
            )
        )

    pdf.close()

    return documents