# FROM python:3.12
FROM mcr.microsoft.com/azure-functions/python:4-python3.12
# FROM mcr.microsoft.com/azure-functions/python:4-python3.12-appservice

ENV AzureWebJobsScriptRoot=/home/site/wwwroot \
  AzureFunctionsJobHost__Logging__Console__IsEnabled=true

COPY ./requirements.txt /
RUN pip install --no-cache-dir --upgrade -r /requirements.txt

WORKDIR /home/site/wwwroot

COPY . .

EXPOSE 80

ENV ENV=prod
ENV SERVER_HOST=0.0.0.0
ENV SERVER_PORT=80

CMD ["python", "app/main.py"]
