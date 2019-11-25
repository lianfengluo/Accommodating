from django.conf.urls import url
from django.urls import path, include
from rest_framework import routers
from .views import *

router = routers.DefaultRouter()
router.register(r'list', MessageViewSet, basename='dialog')
# router.register(r'post', MessagePostViewSet, basename='message_post')

urlpatterns = [
    url(r'^renter/', RenterInboxViewSet.as_view()),
    url(r'^host/', HostInboxViewSet.as_view()),
    url(r'^first/', GetFirstMessViewSet.as_view()),
    url(r'^all/', GetAllMessViewSet.as_view()),
    url(r'^unread_all/', CountAllUnreadViewSet.as_view()),
    url(r'^unread_count/', GetNewMessageCountViewSet.as_view()),
    url(r'^read_message/', ReadMessageViewSet.as_view()),
    url(r'^accept/', AcceptBookingViewSet.as_view()),
    url(r'^paid/', PaidBookingViewSet.as_view()),
    url(r'^post/', MessageCreateViewSet.as_view(
        {"post": "post"})),
    * router.urls,
]
