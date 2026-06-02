FROM python:3.11-slim

WORKDIR /app

COPY server/requirements.txt .
RUN python -c "import codecs; f=codecs.open('requirements.txt','r',encoding='utf-16'); content=f.read(); f.close(); open('requirements.txt','w',encoding='utf-8').write(content)" 2>/dev/null || true
RUN pip install --no-cache-dir -r requirements.txt

COPY server/ .

EXPOSE 8000

CMD ["python", "-m", "uvicorn", "core.asgi:application", "--host", "0.0.0.0", "--port", "8000"]

