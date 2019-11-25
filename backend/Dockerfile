FROM python:3.6.7-alpine

RUN apk add --no-cache build-base python3 python3-dev libffi-dev libressl-dev postgresql-dev linux-headers jpeg-dev zlib-dev tzdata

ENV TZ=Australia/Sydney

COPY requirements.txt ./
RUN pip3 install -r requirements.txt
COPY ./entrypoint.sh /
RUN ["chmod", "+x", "/entrypoint.sh"]
ADD ./ /backend
WORKDIR /backend

COPY crontab /etc/cron.d/cool-task
RUN chmod 0644 /etc/cron.d/cool-task

ENTRYPOINT [ "/entrypoint.sh" ]

EXPOSE 9000

