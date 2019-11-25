"""Accommodation URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.1/topics/http/urls/
"""
from django.urls import path, include
from django.conf.urls import url
from rest_framework import routers
from django.conf import settings
from django.conf.urls.static import static
from message.views import MessageViewSet
from .views import index
from django.conf.urls.static import static

router = routers.DefaultRouter()

# root router:
# routing to different sub router
urlpatterns = [
    path('', index, name='index'),
    path(r"api/user/", include("user.urls")),
    path(r"api/accommodation/", include("accommodation.urls")),
    path(r"api/message/", include("message.urls")),
    *router.urls,
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
  # + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
