FROM python:3.11-alpine

WORKDIR /app

COPY requirements.txt /app
RUN pip3 install -r requirements.txt

COPY . /app


ENTRYPOINT ["python3"]
CMD ["-m", "gunicorn", "main:app", "--bind=0.0.0.0:5000"]

EXPOSE 5000
