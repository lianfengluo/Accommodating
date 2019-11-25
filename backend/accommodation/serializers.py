from accommodation.models import *
from rest_framework import serializers
from datetime import datetime
from user.serializers import UserInfoSerializer


class ImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Images
        fields = ['image']


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = "__all__"


class AccommodationSerializerUpdate(serializers.ModelSerializer):
    class Meta:
        model = Accommodation
        fields = ['price', "description", "rules"]


class WishesListSerializer(serializers.ModelSerializer):
    class Meta:
        model = WishesList
        fields = ["accommodation"]


class AccommodationInfoSerializer(serializers.ModelSerializer):
    address = AddressSerializer(read_only=True)
    images = serializers.StringRelatedField(many=True, read_only=True)
    owner = UserInfoSerializer(read_only=True)
    reviews = serializers.StringRelatedField(many=True, read_only=True)

    class Meta:
        model = Accommodation
        fields = "__all__"


class UpdateAccommodationSerializer(serializers.ModelSerializer):
    now = datetime.now().replace(
        hour=0, minute=0, second=0, microsecond=0).astimezone().date()

    def validate_start_time(self, value):
        """
        Customize validator for start date
        """
        if value < self.now:
            raise serializers.ValidationError(
                "The time your chose is invalid")
        return value

    def validate_end_time(self, value):
        """
        Customize validator for end date
        """
        if value < self.now:
            raise serializers.ValidationError(
                "The time your chose is invalid")
        return value

    def validate(self, value):
        """
        Customize validator for the end date and start value
        """
        if value['end_time'] < value['start_time']:
            raise serializers.ValidationError(
                "The time your chose is invalid")
        return value

    def validate_room_count(self, value):
        if value > 100:
            raise serializers.ValidationError(
                "The number of room  your input is invalid")
        return value

    def create(self, validated_data, owner, address):
        acc = Accommodation.objects.create(
            owner=owner, address=address, **validated_data)
        return acc

    class Meta:
        model = Accommodation
        exclude = ("address", "owner")


class BookingRequestSerializer(serializers.ModelSerializer):
    now = datetime.now().replace(
        hour=0, minute=0, second=0, microsecond=0).astimezone().date()

    def validate_start_time(self, value):
        """
        Customize validator for start date
        """
        if value < self.now:
            raise serializers.ValidationError(
                "The time your chose is invalid")
        return value

    def validate_end_time(self, value):
        """
        Customize validator for end date
        """
        if value < self.now:
            raise serializers.ValidationError(
                "The time your chose is invalid")
        return value

    def validate(self, value):
        """
        Customize validator for the end date and start data
        """
        if value['end_time'] < value['start_time']:
            raise serializers.ValidationError(
                "The time your chose is invalid")
        return value

    class Meta:
        model = Booking
        fields = ['start_time', "end_time", "accommodation"]


class AccommodationInfoBasicInfoSerializer(serializers.ModelSerializer):
    address = AddressSerializer(read_only=True)
    owner = UserInfoSerializer(read_only=True)

    class Meta:
        model = Accommodation
        fields = "__all__"


class BookingInfoSerializer(serializers.ModelSerializer):
    accommodation = AccommodationInfoBasicInfoSerializer(read_only=True)
    renter = UserInfoSerializer(read_only=True)

    class Meta:
        model = Booking
        fields = '__all__'


class AccommodationReviewSerializer(serializers.ModelSerializer):
    accommodation = AccommodationInfoBasicInfoSerializer(read_only=True)
    reviewer = UserInfoSerializer(read_only=True)

    def validate_rate(self, value):
        """
        Customize validator for rate
        """
        if value > 5 or value < 1:
            raise serializers.ValidationError(
                "The rate your chose is invalid")
        return value

    class Meta:
        model = AccommodationReview
        fields = '__all__'


class BookingInfoDetailSerializer(serializers.ModelSerializer):
    accommodation = AccommodationInfoSerializer(read_only=True)
    renter = UserInfoSerializer(read_only=True)

    class Meta:
        model = Booking
        fields = '__all__'
