FROM python:3.12-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

RUN useradd -m -u 1001 sandbox

WORKDIR /code

USER sandbox

CMD ["python3", "/code/main.py"]
