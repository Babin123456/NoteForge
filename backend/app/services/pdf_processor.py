import fitz  # PyMuPDF
import os
import re
from typing import Dict, Any, List

class PDFProcessor:
    @staticmethod
    def extract_metadata_and_text(pdf_path: str) -> Dict[str, Any]:
        """
        Extracts page count, metadata, and full text from PDF using PyMuPDF.
        Cleans and normalizes text for AI processing and structured chunking.
        """
        if not os.path.exists(pdf_path):
            raise FileNotFoundError(f"PDF file not found: {pdf_path}")
            
        doc = fitz.open(pdf_path)
        page_count = len(doc)
        meta = doc.metadata or {}
        
        pages_content = []
        full_text_list = []
        
        for page_idx in range(page_count):
            page = doc[page_idx]
            text = page.get_text("text")
            
            # Normalize whitespace while preserving structural paragraphs
            cleaned_text = re.sub(r'\r\n', '\n', text)
            cleaned_text = re.sub(r'[ \t]+', ' ', cleaned_text)
            cleaned_text = re.sub(r'\n{3,}', '\n\n', cleaned_text).strip()
            
            pages_content.append({
                "page_number": page_idx + 1,
                "text": cleaned_text
            })
            if cleaned_text:
                full_text_list.append(f"--- [Page {page_idx + 1}] ---\n{cleaned_text}")
                
        doc.close()
        
        combined_text = "\n\n".join(full_text_list)
        
        return {
            "page_count": page_count,
            "title": meta.get("title") or os.path.splitext(os.path.basename(pdf_path))[0],
            "author": meta.get("author") or "Unknown",
            "full_text": combined_text,
            "pages": pages_content
        }

    @staticmethod
    def chunk_text(text: str, max_chunk_chars: int = 4000, overlap_chars: int = 400) -> List[str]:
        """
        Splits text into contextually sound chunks respecting paragraph boundaries.
        """
        if len(text) <= max_chunk_chars:
            return [text]
            
        paragraphs = text.split("\n\n")
        chunks = []
        current_chunk = []
        current_length = 0
        
        for para in paragraphs:
            para_len = len(para)
            if current_length + para_len > max_chunk_chars and current_chunk:
                chunks.append("\n\n".join(current_chunk))
                # keep last para for continuity overlap if reasonable
                if para_len < overlap_chars:
                    current_chunk = [para]
                    current_length = para_len
                else:
                    current_chunk = []
                    current_length = 0
            current_chunk.append(para)
            current_length += para_len
            
        if current_chunk:
            chunks.append("\n\n".join(current_chunk))
            
        return chunks
