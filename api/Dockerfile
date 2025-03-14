# FROM python:3.12
# FROM mcr.microsoft.com/azure-functions/python:4-python3.12
FROM mcr.microsoft.com/azure-functions/python:4-python3.12-appservice

ENV AzureWebJobsScriptRoot=/home/site/wwwroot \
    AzureFunctionsJobHost__Logging__Console__IsEnabled=true

# Setup SSH
COPY sshd_config /etc/ssh/sshd_config
ENV SSH_PASSWD="root:Docker!"
RUN echo "$SSH_PASSWD" | chpasswd

COPY ./requirements.txt /
RUN pip install --no-cache-dir --upgrade -r /requirements.txt

WORKDIR /home/site/wwwroot

COPY . .

EXPOSE 80

ENV ENV=prod
ENV SERVER_HOST=0.0.0.0
ENV SERVER_PORT=80
ENV LOG_LEVEL=info

CMD ["sh" ,"-c", "service ssh start && python -m app.main"]
