# -*- coding: utf-8 -*-

from django.conf import settings
from django.core.cache import caches
from accommodation.models import Booking
import datetime

from django_extensions.management.jobs import DailyJob
from django.utils import timezone


class Job(DailyJob):
    help = "Reset the not paid booking and set the paid status to done status"

    def execute(self):
        date = datetime.datetime.now().date()
        bookings = Booking.objects.filter(
            status__in=['A', 'B'], start_time__lt=date).update(status='E')
        Booking.objects.filter(
            status='P', end_time__lt=date).update(status='D')
