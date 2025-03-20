# FROM python:3.12
FROM mcr.microsoft.com/azure-functions/python:4-python3.12@sha256:f125c99b928fc23b890b3ff4692d62be741b15cb0a3d24f3590b209c782281ac
# FROM mcr.microsoft.com/azure-functions/python:4-python3.12-appservice

ENV AzureWebJobsScriptRoot=/home/site/wwwroot \
  AzureFunctionsJobHost__Logging__Console__IsEnabled=true

# Install OpenSSH Server
RUN apt-get update \
  && apt-get install -y openssh-server \
  && rm -rf /var/lib/apt/lists/*

# Setup SSH
RUN echo "root:Docker!" | chpasswd
COPY sshd_config /etc/ssh/sshd_config

COPY ./requirements.txt /
RUN pip install --no-cache-dir --upgrade -r /requirements.txt

WORKDIR /home/site/wwwroot

COPY . .

EXPOSE 80 2222

ENV ENV=prod
ENV SERVER_HOST=0.0.0.0
ENV SERVER_PORT=80
ENV LOG_LEVEL=info

# CMD ["python", "-m", "app.main"]
CMD ["sh" ,"-c", "service ssh start && python -m app.main"]
