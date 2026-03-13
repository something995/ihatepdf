import os
import uuid
import shutil
from celery import Celery
from pypdf import PdfReader, PdfWriter
from pdf2image import convert_from_path
from pdf2docx import Converter
import pikepdf
import io
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from src.core.config import settings

celery_app = Celery(
    "pdf_tasks",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)

celery_app.conf.task_always_eager = True

@celery_app.task(name="merge_pdfs")
def merge_pdfs_task(file_paths):
    output_filename = f"{uuid.uuid4()}.pdf"
    output_path = os.path.join(settings.OUTPUT_DIR, output_filename)
    merger = PdfWriter()
    for pdf in file_paths: merger.append(pdf)
    with open(output_path, "wb") as f: merger.write(f)
    for pdf in file_paths:
        if os.path.exists(pdf): os.remove(pdf)
    return {"status": "completed", "output_file": output_filename}

@celery_app.task(name="split_pdf")
def split_pdf_task(file_path):
    reader = PdfReader(file_path)
    output_files = []
    for i, page in enumerate(reader.pages):
        writer = PdfWriter()
        writer.add_page(page)
        output_filename = f"{uuid.uuid4()}_page_{i+1}.pdf"
        output_path = os.path.join(settings.OUTPUT_DIR, output_filename)
        with open(output_path, "wb") as f: writer.write(f)
        output_files.append(output_filename)
    if os.path.exists(file_path): os.remove(file_path)
    return {"status": "completed", "output_files": output_files}

@celery_app.task(name="compress_pdf")
def compress_pdf_task(file_path):
    output_filename = f"{uuid.uuid4()}_compressed.pdf"
    output_path = os.path.join(settings.OUTPUT_DIR, output_filename)
    
    reader = PdfReader(file_path)
    writer = PdfWriter()
    for page in reader.pages:
        page.compress_content_streams() # basic pypdf lossless compression
        writer.add_page(page)
        
    for page in writer.pages:
        if "/Resources" in page and "/XObject" in page["/Resources"]:
            x_object = page["/Resources"]["/XObject"].get_object()
            for obj in x_object:
                if x_object[obj]["/Subtype"] == "/Image":
                    pass # Basic implementation without actual Ghostscript dependency to prevent env errors
                    
    with open(output_path, "wb") as f:
        writer.write(f)
    
    if os.path.exists(file_path): os.remove(file_path)
    return {"status": "completed", "output_file": output_filename}

@celery_app.task(name="pdf_to_jpg")
def pdf_to_jpg_task(file_path):
    # This task converts a PDF to multiple JPG images
    images = convert_from_path(file_path)
    output_files = []
    
    for i, img in enumerate(images):
        output_filename = f"{uuid.uuid4()}_page_{i+1}.jpg"
        output_path = os.path.join(settings.OUTPUT_DIR, output_filename)
        img.save(output_path, "JPEG")
        output_files.append(output_filename)
        
    if os.path.exists(file_path):
        os.remove(file_path)
        
    return {"status": "completed", "output_files": output_files}

@celery_app.task(name="pdf_to_word")
def pdf_to_word_task(file_path):
    output_filename = f"{uuid.uuid4()}_converted.docx"
    output_path = os.path.join(settings.OUTPUT_DIR, output_filename)
    
    cv = Converter(file_path)
    # Using start=0, end=None translates the entire document
    cv.convert(output_path, start=0, end=None)
    cv.close()
    
    if os.path.exists(file_path):
        os.remove(file_path)
        
    return {"status": "completed", "output_file": output_filename}

@celery_app.task(name="protect_pdf")
def protect_pdf_task(file_path, password):
    output_filename = f"{uuid.uuid4()}_protected.pdf"
    output_path = os.path.join(settings.OUTPUT_DIR, output_filename)
    
    # Using pikepdf for strong AES encryption
    pdf = pikepdf.Pdf.open(file_path)
    pdf.save(output_path, encryption=pikepdf.Encryption(user=password, owner=password, allow=pikepdf.Permissions(extract=False)))
    pdf.close()
    
    if os.path.exists(file_path): os.remove(file_path)
    return {"status": "completed", "output_file": output_filename}

@celery_app.task(name="unlock_pdf")
def unlock_pdf_task(file_path, password):
    output_filename = f"{uuid.uuid4()}_unlocked.pdf"
    output_path = os.path.join(settings.OUTPUT_DIR, output_filename)
    
    try:
        pdf = pikepdf.Pdf.open(file_path, password=password)
        pdf.save(output_path)
        pdf.close()
        success = True
    except pikepdf.PasswordError:
        success = False
        
    if os.path.exists(file_path): os.remove(file_path)
    
    if success:
        return {"status": "completed", "output_file": output_filename}
    else:
        return {"status": "error", "message": "Incorrect password"}

@celery_app.task(name="watermark_pdf")
def watermark_pdf_task(file_path, watermark_text):
    output_filename = f"{uuid.uuid4()}_watermarked.pdf"
    output_path = os.path.join(settings.OUTPUT_DIR, output_filename)
    
    reader = PdfReader(file_path)
    writer = PdfWriter()
    
    for page in reader.pages:
        # Dynamically calculate the center of the current page based on its mediabox
        mb = page.mediabox
        width = float(mb.width)
        height = float(mb.height)
        
        # 1. Create custom watermark overlay PDF for the exact page dimensions
        packet = io.BytesIO()
        can = canvas.Canvas(packet, pagesize=(width, height))
        
        # Adjust font size dynamically based on text length and page width
        font_size = min(80, (width * 1.5) / max(len(watermark_text), 1))
        
        can.setFont("Helvetica-Bold", font_size)
        can.setFillColorRGB(0.5, 0.5, 0.5, alpha=0.3)  # Gray with transparency
        
        can.translate(width / 2, height / 2)
        can.rotate(45)
        can.drawCentredString(0, 0, watermark_text)
        can.save()
        packet.seek(0)
        
        watermark_pdf = PdfReader(packet)
        watermark_page = watermark_pdf.pages[0]
        
        # 2. Add watermark over the specific page
        page.merge_page(watermark_page)
        writer.add_page(page)
        
    with open(output_path, "wb") as f:
        writer.write(f)
        
    if os.path.exists(file_path): os.remove(file_path)
    return {"status": "completed", "output_file": output_filename}

@celery_app.task(name="remove_watermark_pdf")
def remove_watermark_pdf_task(file_path):
    output_filename = f"{uuid.uuid4()}_unwatermarked.pdf"
    output_path = os.path.join(settings.OUTPUT_DIR, output_filename)
    
    import fitz # PyMuPDF
    import pikepdf
    import re
    
    # 1. IMPLICIT DETECTION: Scan the document for repeating, large, or diagonally rotated text
    doc = fitz.open(file_path)
    candidates = {}
    
    for page_num in range(min(3, len(doc))):
        page = doc[page_num]
        blocks = page.get_text("dict").get("blocks", [])
        for b in blocks:
            if "lines" in b:
                for l in b["lines"]:
                    dir_x, dir_y = l.get("dir", (1, 0))
                    is_rotated = abs(dir_y) > 0.1 # Diagonal detection
                    
                    for s in l["spans"]:
                        text = s["text"].strip()
                        if len(text) > 3:
                            # Heuristic weighting: Larger font sizes and rotations = High probability of being a watermark
                            score = s["size"] * (3 if is_rotated else 1)
                            candidates[text] = candidates.get(text, 0) + score
    doc.close()
    
    detected_watermark = "CONFIDENTIAL"
    if candidates:
        detected_watermark = max(candidates, key=candidates.get)

    # 2. RAW BYTE STREAM EXTRACTION & SCRUBBING
    # This mathematically erases the string from the PDF binary without drawing any weird white redaction boxes
    def scrub_stream(stream_bytes, target_text):
        target_str = target_text.encode('utf-8', errors='ignore')
        
        # Strip literal strings e.g., (CONFIDENTIAL) -> ()
        literal_pattern = b'\\(' + re.escape(target_str) + b'\\)'
        stream_bytes = re.sub(literal_pattern, b'()', stream_bytes)
        
        # Strip hex encoded strings e.g., <434F4E46...> -> <>
        hex_str = target_str.hex().encode('ascii').upper()
        if hex_str:
            hex_pattern = b'<' + hex_str + b'>'
            stream_bytes = re.sub(hex_pattern, b'<>', stream_bytes)
            
        return stream_bytes

    pdf = pikepdf.Pdf.open(file_path)
    for page in pdf.pages:
        # A. Clean directly injected text in page Content Streams
        if hasattr(page, 'Contents'):
            contents = page.Contents
            if isinstance(contents, pikepdf.Array):
                for i in range(len(contents)):
                    try:
                        stream = contents[i].read_bytes()
                        cleaned = scrub_stream(stream, detected_watermark)
                        if cleaned != stream: contents[i].write(cleaned, filter=pikepdf.Name("/FlateDecode"))
                    except: pass
            else:
                try:
                    stream = contents.read_bytes()
                    cleaned = scrub_stream(stream, detected_watermark)
                    if cleaned != stream: contents.write(cleaned, filter=pikepdf.Name("/FlateDecode"))
                except: pass
                
        # B. Clean Form XObjects (This is how tools like ReportLab and PyPDF typically append watermarks)
        resources = page.get("/Resources")
        if resources and "/XObject" in resources:
            for name, xobj in resources["/XObject"].items():
                if xobj.get("/Subtype") == "/Form":
                    try:
                        stream = xobj.read_bytes()
                        cleaned = scrub_stream(stream, detected_watermark)
                        if cleaned != stream: 
                            xobj.write(cleaned, filter=pikepdf.Name("/FlateDecode"))
                    except Exception:
                        pass
                        
    pdf.save(output_path, deflate=True)
    if os.path.exists(file_path): os.remove(file_path)
    
    return {
        "status": "completed", 
        "output_file": output_filename,
        "detected": detected_watermark
    }
