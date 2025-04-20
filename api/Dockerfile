FROM python:3.12

RUN echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" \
  | tee -a /etc/apt/sources.list.d/google-cloud-sdk.list && curl https://packages.cloud.google.com/apt/doc/apt-key.gpg \
  | gpg --dearmor -o /usr/share/keyrings/cloud.google.gpg && apt-get update -y && apt-get install google-cloud-cli -y

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
