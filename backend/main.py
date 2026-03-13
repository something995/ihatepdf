import os
import uuid
import shutil
from typing import List
from fastapi import FastAPI, UploadFile, File, Form, BackgroundTasks, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from src.core.config import settings
from src.tasks.celery_app import merge_pdfs_task, split_pdf_task, compress_pdf_task, pdf_to_jpg_task, pdf_to_word_task, protect_pdf_task, unlock_pdf_task, watermark_pdf_task, remove_watermark_pdf_task

from src.db.database import engine
from src.db import models
from src.api.auth import router as auth_router

# Creates the SQLite Database and tables on load automatically
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME)

app.include_router(auth_router, prefix="/auth", tags=["auth"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root(): return {"message": "ihatepdf API is running."}

@app.post("/merge")
async def merge_pdfs(files: List[UploadFile] = File(...)):
    saved_files = []
    for file in files:
        file_path = os.path.join(settings.UPLOAD_DIR, f"{uuid.uuid4()}_{file.filename}")
        with open(file_path, "wb") as buffer: shutil.copyfileobj(file.file, buffer)
        saved_files.append(file_path)
    task = merge_pdfs_task.delay(saved_files)
    result = task.get() if task.ready() else {"task_id": task.id, "status": "processing"}
    return result

@app.post("/split")
async def split_pdf(file: UploadFile = File(...)):
    file_path = os.path.join(settings.UPLOAD_DIR, f"{uuid.uuid4()}_{file.filename}")
    with open(file_path, "wb") as buffer: shutil.copyfileobj(file.file, buffer)
    task = split_pdf_task.delay(file_path)
    result = task.get() if task.ready() else {"task_id": task.id, "status": "processing"}
    return result

@app.post("/compress")
async def compress_pdf(file: UploadFile = File(...)):
    file_path = os.path.join(settings.UPLOAD_DIR, f"{uuid.uuid4()}_{file.filename}")
    with open(file_path, "wb") as buffer: shutil.copyfileobj(file.file, buffer)
    task = compress_pdf_task.delay(file_path)
    result = task.get() if task.ready() else {"task_id": task.id, "status": "processing"}
    return result

@app.post("/convert/pdf-to-jpg")
async def convert_pdf_to_jpg(file: UploadFile = File(...)):
    file_path = os.path.join(settings.UPLOAD_DIR, f"{uuid.uuid4()}_{file.filename}")
    with open(file_path, "wb") as buffer: shutil.copyfileobj(file.file, buffer)
    task = pdf_to_jpg_task.delay(file_path)
    result = task.get() if task.ready() else {"task_id": task.id, "status": "processing"}
    return result

@app.post("/convert/pdf-to-word")
async def convert_pdf_to_word(file: UploadFile = File(...)):
    file_path = os.path.join(settings.UPLOAD_DIR, f"{uuid.uuid4()}_{file.filename}")
    with open(file_path, "wb") as buffer: shutil.copyfileobj(file.file, buffer)
    task = pdf_to_word_task.delay(file_path)
    result = task.get() if task.ready() else {"task_id": task.id, "status": "processing"}
    return result

@app.post("/protect")
async def protect_pdf(password: str = Form(...), file: UploadFile = File(...)):
    file_path = os.path.join(settings.UPLOAD_DIR, f"{uuid.uuid4()}_{file.filename}")
    with open(file_path, "wb") as buffer: shutil.copyfileobj(file.file, buffer)
    task = protect_pdf_task.delay(file_path, password)
    result = task.get() if task.ready() else {"task_id": task.id, "status": "processing"}
    return result

@app.post("/unlock")
async def unlock_pdf(password: str = Form(...), file: UploadFile = File(...)):
    file_path = os.path.join(settings.UPLOAD_DIR, f"{uuid.uuid4()}_{file.filename}")
    with open(file_path, "wb") as buffer: shutil.copyfileobj(file.file, buffer)
    task = unlock_pdf_task.delay(file_path, password)
    result = task.get() if task.ready() else {"task_id": task.id, "status": "processing"}
    return result

@app.post("/watermark")
async def watermark_pdf(text: str = Form("CONFIDENTIAL"), file: UploadFile = File(...)):
    file_path = os.path.join(settings.UPLOAD_DIR, f"{uuid.uuid4()}_{file.filename}")
    with open(file_path, "wb") as buffer: shutil.copyfileobj(file.file, buffer)
    task = watermark_pdf_task.delay(file_path, text)
    result = task.get() if task.ready() else {"task_id": task.id, "status": "processing"}
    return result

@app.post("/remove-watermark")
async def remove_watermark_pdf(file: UploadFile = File(...)):
    file_path = os.path.join(settings.UPLOAD_DIR, f"{uuid.uuid4()}_{file.filename}")
    with open(file_path, "wb") as buffer: shutil.copyfileobj(file.file, buffer)
    task = remove_watermark_pdf_task.delay(file_path)
    result = task.get() if task.ready() else {"task_id": task.id, "status": "processing"}
    return result

@app.get("/download/{file_id}")
async def download_file(file_id: str):
    file_path = os.path.join(settings.OUTPUT_DIR, file_id)
    if os.path.exists(file_path): return FileResponse(file_path, filename=file_id)
    return {"error": "File not found"}
