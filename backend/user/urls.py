from django.conf.urls import url
from django.urls import path, include
from rest_framework import routers
from .views import *

router = routers.DefaultRouter()
# A readonly model viewset with feature of the list all info
# and the feature of getting preticular info.
router.register(r'info', UserInfoViewSet)
router.register(r'review', UserReviewViewSet, basename='review')

# API entry
urlpatterns = [
    url(r'^login', LoginViewSet.as_view()),
    url(r'^register', RegisterViewSet.as_view()),
    url(r'^logout', LogoutViewSet.as_view()),
    url(r'^update_info', UserInfoUpdateViewSet.as_view(
        {'put': 'info_update'})),
    url(r'^update_img', UserInfoUpdateViewSet.as_view(
        {'put': 'img_update'})),
    url(r'^email_verification_exists', GetExistsVerificationCodeViewSet.as_view()),
    url(r'^email_verification_not_exists', GetNotExistsVerificationCodeViewSet.as_view()),
    url(r'^email_reset_password', ResetPasswordByMailViewSet.as_view()),
    *router.urls,
]
