FROM python:3.12

COPY ./requirements.txt /
RUN pip install --no-cache-dir --upgrade -r /requirements.txt

WORKDIR /app

COPY . .

EXPOSE 8000

ENV ENV=prod
ENV SERVER_HOST=0.0.0.0
ENV SERVER_PORT=8000
ENV LOG_LEVEL=info

CMD ["python", "-m", "app.main"]
