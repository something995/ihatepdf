FROM python:3.12-slim

WORKDIR /app

# Install necessary system libraries for document processing
RUN apt-get update && apt-get install -y \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the actual application files
COPY . .

# Expose the port for FastAPI
EXPOSE 8000

# Start Uvicorn pointing to your FastAPI instance
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
