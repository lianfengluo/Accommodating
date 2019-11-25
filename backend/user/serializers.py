from user.models import *
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
import re
from Accommodating import settings


class UserSerializer(serializers.ModelSerializer):
    def get_name(self, user):
        return user.name

    def create(self, validated_data):
        user = super(UserSerializer, self).create(validated_data)
        user.set_password(validated_data['password'])
        user.save()
        return user

    def validate_password(self, value):
        """
        Customize validator for password
        """
        if len(value) < settings.MIN_LEN_PASSWORD:
            raise serializers.ValidationError(
                "Password should be at least 8 letters.")
        return value

    def validate_username(self, value):
        """
        Customize validator for username
        """
        if len(value) < 6:
            raise serializers.ValidationError(
                "Username should be at least 6 letters.")
        return value

    class Meta:
        model = User
        fields = ['username', 'password', 'email', 'first_name', 'last_name']
        extra_kwargs = {'password': {'required': True, "allow_blank": False},
                        'email': {'required': True, "allow_blank": False,
                                  "validators":
                                  [UniqueValidator(queryset=User.objects.all(),
                                                   message="A user with that email already exists.")]}}


class ValidateEmailSerializer(serializers.ModelSerializer):
    """
    Serializer for reseting the password.
    """

    def validate_email(self, email):
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError(
                "The email '" + email + "' not exists")
        return email

    class Meta:
        model = User
        fields = ['email']

class ValidateNotExistEmailSerializer(serializers.ModelSerializer):
    """
    Serializer for reseting the password.
    """

    class Meta:
        model = User
        fields = ['email']
        extra_kwargs = {'email': {'required': True, "allow_blank": False,
                                  "validators":
                                  [UniqueValidator(queryset=User.objects.all(),
                                                   message="A user with that email already exists.")]}}

class ResetPasswordSerializer(serializers.ModelSerializer):
    """
    Serializer for reseting the password.
    """

    def update(self, email, password):
        user = User.objects.get(email=email)
        user.set_password(password)
        user.save()
        return user

    def validate_email(self, email):
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError(
                "The email '" + email + "' not exists")
        return email

    def validate_password(self, value):
        """
        Customize validator for password
        """
        if len(value) < settings.MIN_LEN_PASSWORD:
            raise serializers.ValidationError(
                "Password should be at least 8 letters.")
        return value

    class Meta:
        model = User
        fields = ['email', 'password']


class UserInfoUpdateSerializer(serializers.ModelSerializer):
    def update(self, user, validated_data):
        for key, value in validated_data.items():
            if (key != 'password'):
                setattr(user, key, value)
            else:
                user.set_password(value)
        user.save()
        return user

    def validate_phone(self, value):
        """
        Validating the phone format
        """
        if len(value) < 3 or not value.isdigit():
            raise serializers.ValidationError(
                "Your phone number format is not correct")
        return value

    def validate_password(self, value):
        """
        Customize validator for password
        """
        if len(value) < 8:
            raise serializers.ValidationError(
                "Password should be at least 8 letters.")
        return value

    @property
    def allow_update_text_field(self):
        # Get all the mutable text data as set
        return {field for field in self.get_fields()}

    def validate_password(self, value):
        """
        Customize validator for password
        """
        if len(value) < 8:
            raise serializers.ValidationError(
                "Password should be at least 8 letters.")
        return value

    class Meta:
        model = User
        fields = ['password', 'email', 'first_name', 'last_name',
                  'gender', 'description', 'city', 'phone']
        # To enable partial update serializer for the user profile
        # Adding the validation checking
        extra_kwargs = {'password': {'required': False, "allow_blank": False},
                        'email': {'required': False, "allow_blank": False,
                                  "validators":
                                  [UniqueValidator(queryset=User.objects.all(),
                                                   message="A user with that email already exists.")]},
                        'first_name': {'required': False},
                        'last_name': {'required': False},
                        'gender': {'required': False},
                        'description': {'required': False},
                        'city': {'required': False},
                        'phone': {'required': False}
                        }


class UserInfoSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        exclude = ("password", "is_superuser", "is_staff",
                   "groups", "user_permissions", "is_active",
                   "date_joined", "last_login")


class UserImgUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['image']


class UserBasicInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'image', 'id']


class UserReviewSerializer(serializers.ModelSerializer):
    user = UserInfoSerializer(read_only=True)
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
        model = UserReview
        fields = '__all__'
