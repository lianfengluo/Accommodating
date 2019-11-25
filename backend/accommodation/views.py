from rest_framework.viewsets import GenericViewSet, ViewSet, ModelViewSet, ReadOnlyModelViewSet
from .models import *
from user.models import User
from rest_framework.response import Response
from rest_framework.authentication import TokenAuthentication, SessionAuthentication, BasicAuthentication
from rest_framework.permissions import AllowAny, IsAuthenticated
from .serializers import *
from django.conf import settings
from django.http import QueryDict
import datetime
from django.core.cache import cache
from rest_framework.decorators import action
from rest_framework.parsers import JSONParser, FormParser, MultiPartParser
import os
from rest_framework.views import APIView
from .utils import findpoints
from django.db.models import Q, Avg, Count, F, Sum
from message.models import MessageDialog, MessageContent
from user.serializers import UserReviewSerializer

# The message will send to recevier when user cancel the booking.
CancelText = """This booking is canceled"""


class AccommodationPublishViewSet(ViewSet):
    """
    A view for publish accommodation data
    Api (POST):
    upload the accommodation
    include the text (start date, end date, description, address info)
    include the image file (a group of image)
    """
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    parser_classes = (JSONParser, FormParser, MultiPartParser,)

    def upload(self, request, format=None):
        acc_serializer = UpdateAccommodationSerializer(data=request.data)
        address_serializer = AddressSerializer(data=request.data)
        img_list = list(
            map(lambda x: {'image': x}, request.data.getlist('images')))
        if len(img_list) > 8:
            # if there are more than 8 image then return error
            return Response(status=400)
        image_serializer = ImageSerializer(
            data=img_list, many=True)
        acc_serializer.is_valid(raise_exception=True)
        address_serializer.is_valid(raise_exception=True)
        image_serializer.is_valid(raise_exception=True)
        address = address_serializer.create(address_serializer.validated_data)
        acc = acc_serializer.create(
            acc_serializer.validated_data, request.user, address)
        for image in image_serializer.validated_data:
            Images.objects.create(image=image.get('image'), accommodation=acc)
        # remove the original cache
        cache.delete(f'user_acc{request.user.pk}')
        return Response({"id": acc.pk}, status=201)


class AccommodationUpdateViewSet(ViewSet):
    """
    A viewset for Update accommodation data
    API: update
    update the accommodation information (PUT)
    """
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    parser_classes = (JSONParser, FormParser, MultiPartParser,)

    def update(self, request, format=None):
        pk = request.data.get("acc_id", None)
        if not pk:
            return Response({"error": "Cannot upload the image"}, status=400)
        try:
            acc = Accommodation.objects.get(
                pk=pk, owner__id=request.user.id)
            text_serializer = AccommodationSerializerUpdate(data=request.data)
            text_serializer.is_valid(raise_exception=True)
            img_list = list(
                map(lambda x: {'image': x}, request.data.getlist('images')))
            if len(img_list) > 8:
                return Response({"error": "Update error!"}, status=400)
            image_serializer = ImageSerializer(data=img_list, many=True)
            image_serializer.is_valid(raise_exception=True)
            text_serializer.update(acc, text_serializer.validated_data)
            images = Images.objects.filter(accommodation=acc)
            for image in images:
                original_image = str(image.image)
                if original_image and os.path.exists(settings.MEDIA_ROOT + original_image):
                    os.remove(settings.MEDIA_ROOT + original_image)
            images.delete()
            for image in image_serializer.validated_data:
                Images.objects.create(
                    image=image.get('image'), accommodation=acc)
            return Response({"id": pk}, status=201)
        except:
            return Response({"error": "Update error!"}, status=400)


class AccommodationImageViewSet(GenericViewSet):
    """
    A view for fetch accommodation Image data (GET)
    """
    permission_classes = (AllowAny,)
    serializer_class = ImageSerializer
    queryset = Images.objects.all()

    def get_queryset(self):
        """
        retrieve image
        """
        prop_id = self.request.query_params.get('id', None)
        return self.queryset.filter(accommodation=prop_id) if prop_id else []


def acc_not_booked(queryset, start, end):
    """
    Used to filter out all the accommodation have not been booked
    Argv:
    django rest queryset (before filter)
    start (start date)
    end (end date)
    return:
    django rest queryset (after filter)
    """
    # get the search result that not been booked
    start_time = datetime.datetime.fromordinal(start).date()
    end_time = datetime.datetime.fromordinal(end).date()
    temp_queryset = queryset.filter(
        start_time__lte=start_time,
        end_time__gte=end_time
    )
    # Get all the accommodation id that is not available
    booked = Booking.objects.filter(
        ~Q(status__in=['B', 'E'], accommodation__in=temp_queryset.values_list("pk", flat=True)) &
        (Q(start_time__range=(start_time, end_time)) |
            Q(end_time__range=(start_time, end_time)) |
            Q(start_time__lte=start_time, end_time__gte=end_time))
            ).values_list(
            'accommodation', flat=True)
    # filter out the accomodations that have been booked and accept
    return temp_queryset.filter(~Q(pk__in=booked))


class AccommodationInfoViewSet(ReadOnlyModelViewSet):
    """
    A view for fetch search results
    Api for get the accommodation info which is use for search (GET)
    Sub api 1: user, get all the user info which corresponding user (GET)
    Sub api 2: list_by_id, post an array of id and retrieve all the accommodation 
                    review with these ids. (POST)
    """
    permission_classes = (AllowAny,)
    serializer_class = AccommodationInfoSerializer
    queryset = Accommodation.objects.all()

    def get_queryset(self):
        """
        Get the search results of accommodation
        Url query parameters:
        start_time, end_time, longitude, latitude, days(required)
        root_count, acc_type, more_than, order(optional)
        """
        acc_start = self.request.query_params.get('start_time', None)
        acc_end = self.request.query_params.get('end_time', None)
        if not acc_start or not acc_end:
            return []
        start_time = datetime.datetime.strptime(acc_start, "%Y-%m-%d")
        end_time = datetime.datetime.strptime(acc_end, "%Y-%m-%d")
        queryset = self.queryset
        longitude = \
            self.request.query_params.get('longitude', None)
        latitude = \
            self.request.query_params.get('latitude', None)
        if not latitude or not longitude:
            return []
        try:
            days = 0
            try:
                days = int(self.request.query_params.get('days'))
            except ValueError:
                return []
            if (days > (end_time - start_time).days + 1):
                return []
            room_count = \
                int(self.request.query_params.get('room_count', 0))
            # get the longitude and latitude range
            (max_lon, max_lat), (min_lon, min_lat) = \
                findpoints(float(longitude), float(latitude))
            acc_type = self.request.query_params.get('acc_type', None)
            if acc_type:
                queryset = queryset.filter(acc_type=acc_type)
            if room_count:
                more_than = self.request.query_params.get('more_than', None)
                if more_than:
                    queryset = queryset.filter(room_count__gte=room_count)
                else:
                    queryset = queryset.filter(room_count=room_count)
                queryset = queryset.order_by("room_count")
            queryset = queryset.filter(
                address__longitude__range=(min_lon, max_lon),
                address__latitude__range=(min_lat, max_lat),
            )
            lookup_dates = [(i, i + days - 1)
                            for i in range(start_time.toordinal(), end_time.toordinal() + 2 - days)]
            # filter out the accomodations that have been booked
            result_queryset = acc_not_booked(
                queryset, lookup_dates[0][0], lookup_dates[0][1])
            # merge the flexible search
            # the first query has been searched
            for i, (start, end) in enumerate(lookup_dates):
                if i == 0:
                    continue
                result_queryset = result_queryset.union(acc_not_booked(queryset, start, end))
            # default order by.
            order = self.request.query_params.get('order', "price")
            # order by the rating
            if (order == "rate"):
                result_queryset = result_queryset.annotate(
                    rate=Avg("reviews__rate")).order_by('rate')
            else:
                try:
                    if (order == "popularity"):
                        # if the order is order by popularity will be based on the booking count
                        # and the order is reverse order.
                        result_queryset = result_queryset.annotate(
                            popularity=Count("booking")).order_by("-popularity")
                    else:
                        result_queryset = result_queryset.order_by(order)
                except:
                    result_queryset = []
            return result_queryset
        except:
            return []

    @action(detail=False, methods=['get'])
    def user(self, request):
        """
        query params (get):
        owner (required)
        Get all the accommodation owner by user
        return serialiered accommodation data by the owner
        """
        owner = request.query_params.get('owner', None)
        if owner:
            ids = cache.get(f'user_acc{owner}', None)
            if ids is None:
                queryset = self.queryset.filter(owner=owner).order_by('-pk')
                # cache 24 hours
                cache.set(f'user_acc{owner}', queryset.values_list('pk', flat=True), 24 * 3600)
            else:
                queryset = self.queryset.filter(pk__in = ids).order_by('-pk')
            serializer = self.serializer_class(queryset, many=True)
            return Response(serializer.data, status=200)
        else:
            return Response(status=400)

    @action(detail=False, methods=['post'])
    def list_by_id(self, request):
        """
        query params (post):
        ids (a list of accommodation ids)
        return serialiered accommodation data by the ids
        """
        data = self.queryset.filter(
            pk__in=request.data.get('ids', None))
        serializer = self.serializer_class(data, many=True)
        return Response(serializer.data, status=200)


class AccommodationInfoRetrieveViewSet(ReadOnlyModelViewSet):
    """
    Retrieve Information by id (GET)
    """
    pagination_class = None
    permission_classes = (AllowAny,)
    serializer_class = AccommodationInfoSerializer
    queryset = Accommodation.objects.all().order_by('-pk')

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data, status=200)


class WishesListViewSet(ModelViewSet):
    """
    A view set for user to have the wishes list
    Api:
    Get the wisheslist of login user (Get)
    Adding the wisheslist (Post)
    Delete the wisheslist (Delete)
    """
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    serializer_class = WishesListSerializer
    queryset = WishesList.objects.all()
    lookup_field = 'accommodation'

    def get_queryset(self):
        """
        Get my whishes list
        """
        queryset = self.queryset.filter(
            user=self.request.user).order_by('-pk').distinct()
        return queryset

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            self.queryset.get(
                user=self.request.user,
                accommodation=request.data['accommodation'])
            return Response(status=200)
        except WishesList.DoesNotExist:
            self.perform_create(serializer, user=request.user)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=201, headers=headers)
        except:
            return Response(status=400)
        return Response(status=400)

    def perform_create(self, serializer, user):
        serializer.save(user=user)


class GetUnavailableDateViewSet(APIView):
    """
    A view set get not availble date (GET)
    """
    pagination_class = None
    permission_classes = (AllowAny,)
    serializer_class = BookingRequestSerializer

    def get(self, request, format=None):
        acc_id = request.query_params.get('accommodation', None)
        if cache.get(f"unavailable_date_set{acc_id}", None) is None:
            try:
                acc = Accommodation.objects.get(pk=acc_id)
            except Accommodation.DoesNotExist:
                return Response({"error": "Invalid request"}, status=400)
            now = datetime.datetime.now().replace(
                hour=0, minute=0, second=0, microsecond=0).astimezone().date()
            bookings = Booking.objects.filter(~Q(status__in=['B', 'E']) &
                                            Q(accommodation=acc, end_time__gte=now))\
                .order_by('start_time', 'end_time')\
                .values('start_time', 'end_time').distinct()
            date_set = set()
            for b in bookings:
                date_set |= set(range(b['start_time'].toordinal(),
                                    b['end_time'].toordinal()+1))
            cache.set(f"unavailable_date_set{acc_id}", date_set, 24 * 3600)
        else:
            date_set = cache.get(f"unavailable_date_set{acc_id}")
        not_date = tuple(map(lambda x: datetime.date.fromordinal(x), date_set))
        return Response({"not_date": not_date}, status=200)


class BookingHandleViewSet(APIView):
    """
    Get all the booking info detail that is related to the user(GET).
    A view set for creating booking request(POST)
    """
    pagination_class = None
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    serializer_class = BookingRequestSerializer

    def get(self, request, format=None):
        bid = request.query_params.get('id', None)
        if bid:
            try:
                booking = Booking.objects.get(Q(pk=bid),
                                              Q(accommodation__owner=request.user) |
                                              Q(renter=request.user))
                return Response(BookingInfoDetailSerializer(booking).data, status=200)
            except Booking.DoesNotExist:
                pass
        return Response(status=400)

    def post(self, request, format=None):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        start_time = serializer.validated_data["start_time"]
        end_time = serializer.validated_data["end_time"]
        acc_id = request.data.get("accommodation")
        if ('content' not in request.data):
            return Response({"error": "Please input the content of yourself."}, status=400)
        try:
            acc = Accommodation.objects.get(pk=acc_id)
        except Accommodation.DoesNotExists:
            return Response({"error": "Invalid request"}, status=400)
        if acc.start_time > start_time or end_time > acc.end_time:
            return Response({"error": "You property is not available"}, status=400)
        booked = Booking.objects.filter(
            ~Q(status__in=['B', 'E']) &
            Q(accommodation=acc)).filter(
            Q(start_time__range=(start_time, end_time)) |
            Q(end_time__range=(start_time, end_time)) |
            Q(start_time__lte=start_time, end_time__gte=end_time))
        if booked:
            return Response({"error": "It has been book"}, status=400)
        number_of_day = end_time.toordinal() + 1 - start_time.toordinal()
        booking = Booking.objects.create(renter=request.user,
                                         total=(acc.price * number_of_day),
                                         **serializer.validated_data)
        msg = MessageDialog.objects.create(booking=booking,
                                            receiver=acc.owner,
                                            sender=request.user)
        # create the dialog in other way around
        MessageDialog.objects.create(booking=booking,
                                     receiver=request.user,
                                     sender=acc.owner,
                                     new_message=0)
        cache.delete(f'unread_messages_{msg.receiver.id}')
        MessageContent.objects.create(message=msg,
                                      content=request.data.get('content', ''))
        cache.delete(f"unavailable_date_set{acc_id}")
        return Response({"info": "request sent"}, status=201)


class PostReviewViewSet(APIView):
    """
    An API for user to post review(POST)
    """
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    def post(self, request, format=None):
        try:
            booking = Booking.objects.get(pk=request.data.get("booking", -1))
            user_id = request.data.get('user', None)
            if user_id:
                user_id = user_id.get("user")
            else:
                return Response({"error": "Error user id"}, status=400)
            acc_id = request.data.get('accommodation', None)
            if acc_id:
                acc_id = acc_id.get("accommodation")
            else:
                return Response({"error": "Error accommodation id"}, status=400)
            user = User.objects.get(pk=user_id)
            acc = Accommodation.objects.get(pk=acc_id)
            if (booking.status != 'D' and
                    booking.end_time.toordinal() + 1 <= datetime.datetime.now().toordinal()):
                return Response({"error": "Status error."})
            user_ser = UserReviewSerializer(data=request.data.get("user"))
            acc_ser = AccommodationReviewSerializer(
                data=request.data.get("accommodation"))
            user_ser.is_valid(raise_exception=True)
            acc_ser.is_valid(raise_exception=True)
            user_ser.create({"reviewer": request.user,
                             "user": user, **user_ser.validated_data})
            acc_ser.create({"reviewer": request.user,
                            "accommodation": acc, **acc_ser.validated_data})
            booking.status = 'AR'
            booking.save()
            cache.delete(f"acc_overall_reviews_{acc_id}")
            cache.delete(f"user_overall_reviews_{user_id}")
            return Response({"info": "success"}, status=201)
        except Booking.DoesNotExist:
            return Response({"error": "Booking error"}, status=400)
        except User.DoesNotExist:
            return Response({"error": "User info error"}, status=400)
        except Accommodation.DoesNotExist:
            return Response({"error": "Accommodation info error"}, status=400)
        return Response({"error": "Error"}, status=400)


class AccommodationReviewViewSet(ReadOnlyModelViewSet):
    """
    A viewset for the review of the Accommodation(GET)
    Sub api:
    overall: geting the total rating and the total number of the accommodation(GET)
    """
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    serializer_class = AccommodationReviewSerializer
    queryset = AccommodationReview.objects.all()

    def get_queryset(self):
        Accommodation_id = self.request.query_params.get('id', -1)
        return self.queryset.filter(accommodation__pk=Accommodation_id).order_by("-pk")

    @action(detail=False, methods=['get'])
    def overall(self, request):
        Accommodation_id = self.request.query_params.get('id', -1)
        if Accommodation_id == -1:
            return Response(status=400)
        if cache.get(f"acc_overall_reviews_{Accommodation_id}", None) is None:
            values = self.get_queryset().values_list("rate", flat=True)
            total = sum(values)
            rate = float(total)/len(values) if values else 0
            cache.set(f"acc_overall_reviews_{Accommodation_id}", (total, rate), 24 * 3600)
        else:
            total, rate = cache.get(f"acc_overall_reviews_{Accommodation_id}")
        return Response({"rate": rate, "total": total}, status=200)


class AccommodationDeleteViewSet(APIView):
    """
    A viewset that is used to delete the property
    Check whether the property can be delete (GET)
    Delete the property (DELETE)
    """
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    def get(self, request, format=None):
        acc_id = request.query_params.get('id', -1)
        # if the booking is not accept, 
        # not paid then it can be delete
        bookings = Booking.objects.filter(status__in=['A', 'P'], 
                                        accommodation__pk=acc_id)
        return Response(status=200) if not bookings else esponse(status=400)

    def delete(self, request, format=None):
        acc_id = request.query_params.get('id', -1)
        # Check if the room is currently booked
        bookings = Booking.objects.filter(status__in=['A', 'P'],
                                        accommodation__pk=acc_id)
        if not bookings:
            try:
                Accommodation.objects.get(
                    pk=acc_id, owner=request.user).delete()
                return Response(status=204)
            except Accommodation.DoesNotExist:
                return Response(status=400)
        else:
            return Response(status=400)


class AccommodationCancelViewSet(APIView):
    """
    A viewset for canceling the booking
    Check whether you can cancel (GET)
    Delete method to cancel the booking (DELETE)
    """
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    def post(self, request, format=None):
        booking_id = request.data.get('id', -1)
        try:
            booking = Booking.objects.get(status__in=['B', 'A'])
            booking.status = 'E'
            booking.save()
            msg = MessageDialog.objects.get(
                sender=request.user, booking=booking)
            msg.new_message += 1
            msg.save()
            # clear the cache
            cache.delete(f'unread_messages_{msg.receiver.id}')
            cache.delete(f"unavailable_date_set{booking.accommodation.id}", None)
            MessageContent.objects.create(message=msg, content=CancelText)
            return Response(status=200)
        except Booking.DoesNotExist:
            pass
        return Response(status=400)


class RecommendationViewSet(APIView):
    """
    A viewset that is used to recommendate the property to the user surrounding area (GET)
    """
    pagination_class = None
    permission_classes = (AllowAny,)
    serializer_class = AccommodationInfoSerializer
    queryset = Accommodation.objects.all()

    def get(self, request, format=None):
        longitude = request.query_params.get('longitude', None)
        latitude = request.query_params.get('latitude', None)
        if not latitude or not longitude:
            return []
        (max_lon, max_lat), (min_lon, min_lat) = \
            findpoints(float(longitude), float(latitude), 2)
        # Rank calculate base on algorithm
        # Only retrieve 5 records
        queryset = self.queryset.filter(
            address__longitude__range=(min_lon, max_lon),
            address__latitude__range=(min_lat, max_lat),
            end_time__gte=datetime.datetime.now().date()
        ).annotate(score=((Sum("reviews__rate") - Count("reviews__rate") * 2.5) * 10))\
            .order_by(F('score').desc(nulls_last = True))[:5]
        return Response(self.serializer_class(queryset, many=True).data, status=200)
