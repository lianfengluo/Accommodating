from .models import *
from rest_framework import serializers
from user.serializers import UserInfoSerializer, UserBasicInfoSerializer
from accommodation.serializers import BookingInfoSerializer


class MessageSerializer(serializers.ModelSerializer):
    receiver = UserBasicInfoSerializer(read_only=True)
    sender = UserBasicInfoSerializer(read_only=True)

    class Meta:
        model = MessageDialog
        exclude = ("update_time",)


class NewMessageCountSerializer(serializers.ModelSerializer):
    class Meta:
        model = MessageDialog
        exclude = ("update_time", "receiver", 'sender',)


class MessageCreateSerializer(serializers.ModelSerializer):

    class Meta:
        model = MessageDialog
        fields = ('receiver', 'booking')


class MessageInboxSerializer(serializers.ModelSerializer):
    booking = BookingInfoSerializer(read_only=True)
    sender = UserInfoSerializer(read_only=True)
    receiver = UserInfoSerializer(read_only=True)

    class Meta:
        model = MessageDialog
        fields = '__all__'


class MessageContentSerializer(serializers.ModelSerializer):
    created_time = serializers.DateTimeField(read_only=True)

    class Meta:
        model = MessageContent
        fields = ['content', "created_time"]


class MessageContentDetailSerializer(serializers.ModelSerializer):
    created_time = serializers.DateTimeField(read_only=True)
    message = MessageSerializer(read_only=True)

    class Meta:
        model = MessageContent
        fields = '__all__'
