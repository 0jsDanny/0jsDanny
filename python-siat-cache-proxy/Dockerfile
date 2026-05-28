FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY main.py ./

EXPOSE 8000

ENV CACHE_DB_PATH="/app/data/siat_cache.db"
ENV PORT=8000

# Persist SQLite WAL cache files
VOLUME /app/data

CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port $PORT"]
