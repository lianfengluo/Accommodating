#!/bin/sh
set -e

crontab -u root /etc/cron.d/cool-task
crond /etc/cron.d/cool-task

python3 manage.py makemigrations user accommodation message
python3 manage.py migrate
python3 manage.py createcachetable
exec "$@"