# ihatepdf - Full Stack Implementation

## Project Structure
- **/frontend**: Next.js 15 app built with Tailwind CSS v4, Framer Motion, and Lucide React. Features a premium glassmorphic UI.
- **/backend**: FastAPI Python app. Handles logic for Merge, Split, and Compress using PyPDF2.
- **/backend/src/tasks**: Contains Celery worker definitions. By default, tasks run eagerly (synchronously) if Redis isn't connected so that users can test the MVP instantly.

## 🚀 How to Run Locally

### 1. Start the Backend API (FastAPI)
Open a terminal, navigate to the backend folder, and start the Uvicorn server:
```bash
cd backend
pip install -r requirements.txt # (If dependencies aren't globally installed yet. The AI already installed them).
uvicorn main:app --reload --port 8000
```

### 2. Start the Frontend Application (Next.js)
Open a *new* terminal window, navigate to the frontend folder, and start the Next.js development server:
```bash
cd frontend
npm install
npm run dev
```

### 3. Usage
Navigate to [http://localhost:3000](http://localhost:3000) in your browser. You will see the beautiful landing page with options to **Merge**, **Split**, or **Compress** PDF files! Wait a few seconds for the next server to compile the app on your first visit.

## Features Currently Implemented (Phase 1 MVP)
✅ Modern, responsive Next.js frontend with stunning glassmorphism design.
✅ FastAPI high-performance backend.
✅ **Merge PDFs**: Select multiple PDFs and combine them securely.
✅ **Split PDFs**: Extracts every page of a PDF into discrete files automatically.
✅ **Compress PDFs**: Lossless compression via PDF Stream objects.
✅ Downloads automatically trigger upon completion. Safe local storage ensures files are read, processed, and available for download.
