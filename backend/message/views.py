from rest_framework.viewsets import GenericViewSet, ViewSet, ReadOnlyModelViewSet
from .models import *
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.authentication import TokenAuthentication, SessionAuthentication, BasicAuthentication
from rest_framework.permissions import AllowAny, IsAuthenticated
from .serializers import *
from django.conf import settings
from datetime import datetime
from django.core.cache import cache
from rest_framework.views import APIView
from rest_framework.decorators import action
from user.models import User
from user.serializers import UserInfoSerializer
from accommodation.models import Booking
from accommodation.serializers import BookingInfoSerializer
from django.db.models import Q

ACCEPT_INFO_RESPONSE = """Your booking request has been accepted.
Thanks for you interest of my accommodation.
You will be able to process the payment now.
"""
PAID_INFO_RESPONSE = """The payment has been finalized."""
EXPIRE_INFO_RESPONSE = """You booking have been expired."""


class CountAllUnreadViewSet(APIView):
    """
    A viewset to get how many messages have not been read by the current user
    and those message ids (GET)
    """
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    serializer_class = NewMessageCountSerializer
    pagination_class = None

    def get(self, request, format=None):
        cached_data = cache.get(f'unread_messages_{request.user.pk}', None)
        if cached_data is not None:
            ids, count_sum = cached_data
            return Response({"count": count_sum, "new_message": ids}, status=200)
        ids = MessageDialog.objects.filter(
            Q(receiver=request.user) & ~Q(new_message=0)).values_list('booking', flat=True)
        count = MessageDialog.objects.filter(
            Q(receiver=request.user) & ~Q(new_message=0)).values_list('new_message', flat=True)
        count_sum = sum(count)
        cache.set(f'unread_messages_{request.user.pk}', (ids, count_sum), 3600 * 24)
        return Response({"count": count_sum, "new_message": ids}, status=200)


class ReadMessageViewSet(APIView):
    """
    A viewset showing the user have read the message (GET)
    """
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    def get(self, request, format=None):
        booking_id = request.query_params.get("id", None)
        if not booking_id:
            return Response("Invalid request", status=400)
        try:
            mess = MessageDialog.objects.get(
                booking__pk=booking_id, receiver=request.user)
            mess.new_message = 0
            mess.save()
            cache.delete(f'unread_messages_{request.user.pk}')
            return Response(status=200)
        except MessageDialog.DoesNotExist:
            return Response("Invalid request", status=400)


class GetNewMessageCountViewSet(APIView):
    """
    A viewset for getting how many new request in the dialog (GET)
    """
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    pagination_class = None

    def get(self, request, format=None):
        booking_id = request.query_params.get("id", None)
        if not booking_id:
            return Response("Invalid request", status=400)
        try:
            count = MessageDialog.objects.get(
                booking__pk=booking_id, receiver=request.user).new_message
            return Response({"count": count}, status=200)
        except MessageDialog.DoesNotExist:
            return Response("Invalid request", status=400)


class PaidBookingViewSet(APIView):
    """
    A viewset for host accepting booking request (GET)
    """
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    pagination_class = None

    def get(self, request, format=None):
        booking_id = request.query_params.get('id', None)
        if not booking_id:
            return Response("Invalid request", status=400)
        try:
            booking = Booking.objects.get(renter=request.user,
                                          pk=booking_id)
            booking.status = "P"
            booking.save()
            msg = MessageDialog.objects.get(
                booking=booking, sender=request.user)
            msg.new_message += 1
            msg.save()
            MessageContent.objects.create(
                content=PAID_INFO_RESPONSE, message=msg)
            cache.delete(f'unread_messages_{msg.receiver.id}')
            return Response({"info": "success"}, status=201)
        except Booking.DoesNotExist:
            return Response("Invalid request", status=400)


class AcceptBookingViewSet(APIView):
    """
    A viewset for host accepting booking request (GET)
    """
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    pagination_class = None

    def get(self, request, format=None):
        booking_id = request.query_params.get('id', None)
        if not booking_id:
            return Response("Invalid request", status=400)
        try:
            booking = Booking.objects.get(accommodation__owner=request.user,
                                          pk=booking_id)
            booking.status = "A"
            booking.save()
            start_time, end_time = booking.start_time, booking.end_time
            msg = MessageDialog.objects.get(
                booking=booking, sender=request.user)
            msg.new_message += 1
            msg.save()
            MessageContent.objects.create(
                content=ACCEPT_INFO_RESPONSE, message=msg)
            cache.delete(f'unread_messages_{msg.receiver.id}')
            cache.delete(f'unavailable_date_set{booking.accommodation.id}')
            # send expire message to other bookings
            expire_bookings = Booking.objects.filter(
                Q(status__in=['B'], accommodation=booking.accommodation) & 
                    (
                    Q(start_time__range=(start_time, end_time)) | 
                    Q(end_time__range=(start_time, end_time)) |
                    Q(start_time__lte=start_time, end_time__gte=end_time)
                    )
                )
            for b in expire_bookings:
                msg = MessageDialog.objects.get(
                    booking=b, sender=request.user)
                MessageContent.objects.create(
                    content=EXPIRE_INFO_RESPONSE, message=msg)
            expire_bookings.update(status='E')
            return Response({"info": "success"}, status=201)
        except Booking.DoesNotExist:
            return Response("Invalid request", status=400)


class MessageCreateViewSet(ViewSet):
    """
    A viewset for create message (POST)
    """
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    pagination_class = None
    serializer_class = MessageCreateSerializer

    def post(self, request, format=None):
        serializer = self.serializer_class(data=request.data)
        content_serializer = MessageContentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        content_serializer.is_valid(raise_exception=True)
        msg = MessageDialog.objects.\
            get(sender=request.user, booking=serializer.validated_data['booking'],
                receiver=serializer.validated_data['receiver'])
        # increment the sending message count
        msg.new_message += 1
        msg.save()
        cache.delete(f'unread_messages_{msg.receiver.id}')
        mess_content = MessageContent.objects.create(
            content=request.data.get("content", None), message=msg)
        msg.update_time = datetime.now()
        return Response(MessageContentDetailSerializer(mess_content).data, status=201)


class MessageViewSet(ReadOnlyModelViewSet):
    """
    A view for fetch message dialog(GET)
    """
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    serializer_class = MessageSerializer
    queryset = MessageDialog.objects.all()
    lookup_field = 'receiver'
    pagination_class = None
    ordering = ('-update_time')

    def get_queryset(self):
        """
        Retrieve the dialog
        """
        return self.queryset.filter(sender=self.request.user)


class HostInboxViewSet(APIView):
    """
    A viewset for getting the owner info (GET)
    """
    pagination_class = None
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    serializer_class = BookingInfoSerializer

    def get(self, request, format=None):
        """
        Listing all the booking info 
        """
        mess = Booking.objects.filter(
            accommodation__owner=request.user).order_by('-pk')
        if mess:
            serializer = self.serializer_class(mess, many=True)
            return Response(serializer.data, status=200)
        return Response([], status=200)


class RenterInboxViewSet(APIView):
    """
    A viewset for getting the renter info (GET)
    """
    pagination_class = None
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    serializer_class = BookingInfoSerializer

    def get(self, request, format=None):
        """
        Listing all the booking info
        """
        mess = Booking.objects.filter(renter=request.user).order_by('-pk')
        if mess:
            serializer = self.serializer_class(mess, many=True)
            return Response(serializer.data, status=200)
        return Response([], status=200)


class GetFirstMessViewSet(APIView):
    """
    A viewset to get the first message content (GET)
    """
    pagination_class = None
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    serializer_class = MessageContentSerializer

    def get(self, request, format=None):
        booking_id = request.query_params.get('id', None)
        if not booking_id:
            return Response(status=400)
        msg = MessageDialog.objects.filter(booking__pk=booking_id).filter(
            Q(sender=request.user) | Q(receiver=request.user)
        )
        result = MessageContent.objects.filter(
            message__in=msg).order_by('-created_time')
        return Response(self.serializer_class(result[0]).data, status=200)\
            if result else Response(status=400)


class GetAllMessViewSet(APIView):
    """
    A viewset to get the all message content related to the dialog (GET)
    """
    pagination_class = None
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    serializer_class = MessageContentDetailSerializer

    def get(self, request, format=None):
        booking_id = request.query_params.get('id', None)
        if not booking_id:
            return Response(status=400)
        mess = MessageDialog.objects.filter(booking__pk=booking_id).filter(
            Q(sender=request.user) | Q(receiver=request.user)
        )
        result = MessageContent.objects.filter(
            message__in=mess).order_by('created_time')
        return Response(self.serializer_class(result, many=True).data, status=200)\
            if result else Response(status=400)
