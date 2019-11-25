from django.conf.urls import url
from django.urls import path, include
from rest_framework import routers
from .views import *

router = routers.DefaultRouter()

router.register(r'^info', AccommodationInfoViewSet, basename='info')
router.register(r'^retrieve', AccommodationInfoRetrieveViewSet,
                basename='retrieve')
router.register(r'^images',
                AccommodationImageViewSet, basename='images')
router.register(r'^wisheslist',
                WishesListViewSet, basename='wisheslist')
router.register(r'^review', AccommodationReviewViewSet,
                basename="review")

urlpatterns = [
    url(r"^recommendation", RecommendationViewSet.as_view()),
    url(r'^upload/', AccommodationPublishViewSet.as_view(
        {"put": "upload"})),
    url(r'^update/', AccommodationUpdateViewSet.as_view(
        {"put": "update"})),
    url(r'^cancel/', AccommodationCancelViewSet.as_view()),
    url(r'^booking/', BookingHandleViewSet.as_view()),
    url(r'^delete/', AccommodationDeleteViewSet.as_view()),
    url(r'^not_available/', GetUnavailableDateViewSet.as_view()),
    url(r"^post_review", PostReviewViewSet.as_view()),
    *router.urls,
]
