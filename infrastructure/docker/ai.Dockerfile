FROM python:3.12-slim

WORKDIR /app

COPY services/ai/requirements.txt ./services/ai/requirements.txt
RUN pip install --no-cache-dir -r services/ai/requirements.txt

COPY services ./services

EXPOSE 8001
