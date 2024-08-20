FROM python:3.11-alpine

WORKDIR /app

COPY requirements.txt /app
RUN --mount=type=cache,target=/root/.cache/pip \
    pip3 install -r requirements.txt

COPY . /app


ENTRYPOINT ["python3"]
CMD ["-m", "gunicorn", "main:app", "--bind=0.0.0.0:8000"]

EXPOSE 8000
