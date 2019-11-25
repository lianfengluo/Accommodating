from django.contrib.auth import authenticate, login, logout
from rest_framework.viewsets import ViewSet, ModelViewSet, ReadOnlyModelViewSet
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.authentication import TokenAuthentication, SessionAuthentication, BasicAuthentication
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework.status import (
    HTTP_401_UNAUTHORIZED,
    HTTP_400_BAD_REQUEST,
    HTTP_200_OK,
)
from django.core.paginator import Paginator
from rest_framework.decorators import action
from user.serializers import *
from django.core.cache import cache
from django.conf import settings
import datetime
from rest_framework import mixins, generics
from user.utils import SendMailVerificationCode
from rest_framework.parsers import JSONParser, FormParser, MultiPartParser
import os
from user.models import *
import logging

# MY_AUTHENTICATION_CLASSES = [TokenAuthentication,
#                              BasicAuthentication,
#                              SessionAuthentication]

EXCLUDE_REPONSE = ('is_superuser', 'is_active', 'last_login',
                   'date_joined', 'is_staff')


def make_response_user_data(token, user):
    '''
    Function for making user response data
    '''
    response_data = {'token': str(token)}
    for field in user._meta.fields:
        if str(field.name) not in EXCLUDE_REPONSE:
            response_data[str(field.name)] = str(getattr(user, field.name))
    if user.image:
        response_data['image'] = f'{settings.BACKEND_DOMAIN}{user.image.url}'
    del response_data['password']
    return response_data


class LoginViewSet(APIView):
    '''
    A login ViewSet for the login,
    request will request username or email with password.
    Generate the token for the user (POST)
    '''
    permission_classes = (AllowAny,)

    def post(self, request, format=None):
        username = request.data.get('username', '')
        email = request.data.get('email', '')
        password = request.data.get('password', '')
        user = None
        if username:
            user = authenticate(request, username=username, password=password)
        elif email:
            try:
                user = User.objects.get(email=email)
                user = authenticate(
                    request, username=user.username, password=password)
            except User.DoesNotExist:
                Response(
                    {'error': 'Incorrect email or password'}, status=HTTP_401_UNAUTHORIZED
                )
        if user is not None:
            token, _ = Token.objects.get_or_create(user=user)
            return Response(make_response_user_data(token, user),
                            status=HTTP_200_OK)
        else:
            return Response(
                {'error': 'Incorrect username or password' if username else 'Incorrect email or password'}, status=HTTP_401_UNAUTHORIZED
            )


class RegisterViewSet(APIView):
    '''
    A Register ViewSet for the Register(POST)
    '''
    permission_classes = (AllowAny,)
    serializer_class = UserSerializer

    def post(self, request, format=None):
        # use userserializer to unmarsh the data and validation
        serializer = UserSerializer(data=request.data)
        email = request.data.get('email')
        if request.data.get('verification') != \
                cache.get(email+'_email_verification_code_n'):
            return Response({'verification': 'verification code is not correct.'}, status=400)

        # Checking validation
        serializer.is_valid(raise_exception=True)
        user = serializer.create(serializer.validated_data)
        if user is not None:
            token, _ = Token.objects.get_or_create(user=user)
            cache.delete(email+'_email_verification_code_n')
            cache.delete(email+'_email_verify_time_n')
            return Response(make_response_user_data(token, user),
                            status=HTTP_200_OK)
        else:
            return Response({'error': 'Invalid credentials'}, status=401)


class LogoutViewSet(APIView):
    '''
    A logout ViewSet for the logout (GET)
    '''
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        try:
            token = Token.objects.get(user=request.user)
            # expire the token.
            Token.delete(token)
            return Response({'Message': 'Logout succeed.'}, status=200)
        except:
            return Response({'error': 'Logout error.'}, status=400)


class GetExistsVerificationCodeViewSet(APIView):
    '''
    Sending verification code to the user (base on exists email).(PUT)
    /user/get_verification_code 
    '''
    permission_classes = (AllowAny,)

    def post(self, request, format=None):
        serializer = ValidateEmailSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = request.data.get('email')
        if not cache.get(email + '_email_verify_time'):
            verification_code = SendMailVerificationCode(email)
            cache.set(email+'_email_verification_code',
                        'Error' if not verification_code else verification_code,
                        settings.VERIFICATION_CODE_EXISTS_TIME)
            cache.set(email+'_email_verify_time',
                        datetime.datetime.now(), settings.RESENT_WAITING_TIME)
            return Response({'success': 'Email has sent'}, status=200)
        else:
            wait_time = settings.RESENT_WAITING_TIME - \
                (datetime.datetime.now() -
                    cache.get(email + '_email_verify_time')).seconds
            return Response({'errors': wait_time}, status=400)

class GetNotExistsVerificationCodeViewSet(APIView):
    '''
    Sending verification code to the user (base on not exists email).(PUT)
    /user/email_verification_exists
    '''
    permission_classes = (AllowAny,)

    def post(self, request, format=None):
        serializer = ValidateNotExistEmailSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = request.data.get('email')
        if not cache.get(email + '_email_verify_time_n'):
            verification_code = SendMailVerificationCode(email)
            cache.set(email+'_email_verification_code_n',
                        'Error' if not verification_code else verification_code,
                        settings.VERIFICATION_CODE_EXISTS_TIME)
            cache.set(email+'_email_verify_time_n',
                        datetime.datetime.now(), settings.RESENT_WAITING_TIME)
            return Response({'success': 'Email has sent'}, status=200)
        else:
            wait_time = settings.RESENT_WAITING_TIME - \
                (datetime.datetime.now() -
                    cache.get(email + '_email_verify_time_n')).seconds
            return Response({'errors': wait_time}, status=400)

class ResetPasswordByMailViewSet(APIView):
    '''
    User mail to reset password (POST)
    /user/email_reset_password
    '''
    permission_classes = (AllowAny,)

    def post(self, request, format=None):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = request.data.get('email')
        password = request.data.get('password')
        if request.data.get('verification') != \
                cache.get(email+'_email_verification_code'):
            return Response({'errors': 'verification code is not correct.'}, status=400)
        user = serializer.update(email, password)
        cache.delete(email+'_email_verification_code')
        cache.delete(email+'_email_verify_time')
        return Response({'success': 'Update password succeed',
                         'username': user.username}, status=200)


class UserInfoViewSet(ReadOnlyModelViewSet):
    '''
    Viewset to fetch user profile information
    get_id uri is used to get the user id (POST)
    /user/info/get_id
    '''
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = UserInfoSerializer
    pagination_class = None

    @action(detail=False, methods=['post'])
    def get_id(self, request):
        try:
            return Response(
                {'id': User.objects.get(
                    username=request.data.get('username', '')).pk},
                status=200)
        except User.DoesNotExist:
            return Response(
                {'error': 'Username is invalid'},
                status=400)
        except:
            return Response(
                {'error': 'Invalid input data'},
                status=400)


class UserInfoUpdateViewSet(ViewSet):
    '''
    Getting update request from the user and update the user/profile info(PUT)
    /user/update_info
    Getting update request from the user and update the profile image(PUT)
    /user/update_img
    '''
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    parser_classes = (JSONParser, FormParser, MultiPartParser)

    def info_update(self, request, format=None):
        user_serial = UserInfoUpdateSerializer(data=request.data)
        user_serial.is_valid(raise_exception=True)
        if 'email' in request.data:
            email = request.data.get('email')
            if request.data.get('verification') != \
                    cache.get(email+'_email_verification_code_n'):
                return Response({'verification': 'verification code is not correct.'}, status=400)
        try:
            user = User.objects.get(pk=request.user.pk)
            if request.data:
                user_serial.update(user, user_serial.validated_data)
            if 'password' in request.data:
                del request.data['password']
            if 'email' in request.data:
                # delete the cache if succeed
                email = request.data.get('email')
                cache.delete(email+'_email_verification_code_n')
                cache.delete(email+'_email_verify_time_n')
            return Response(user_serial.validated_data, status=201)
        except User.DoesNotExist:
            return Response({'errors': 'Invalid user.'}, status=400)
        return Response(status=400)

    def img_update(self, request, format=None):
        user = User.objects.get(pk=request.user.pk)
        serializer = UserImgUpdateSerializer(
            user, request.data)
        serializer.is_valid(raise_exception=True)
        original_image = str(user.image)
        serializer.update(user, serializer.validated_data)
        if original_image and os.path.exists(settings.MEDIA_ROOT + original_image):
            os.remove(settings.MEDIA_ROOT + original_image)
        return Response({'image': f'{settings.BACKEND_DOMAIN}{user.image.url}'},
                        status=201)


class UserReviewViewSet(ReadOnlyModelViewSet):
    '''
    A viewset for the review of the user (GET)
    /user/review
    Get all the user review avg (GET)
    /user/review/overall
    '''
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    serializer_class = UserReviewSerializer
    queryset = UserReview.objects.all()

    def get_queryset(self):
        user_id = self.request.query_params.get('id', -1)
        return self.queryset.filter(user__pk=user_id).order_by('-pk')

    @action(detail=False, methods=['get'])
    def overall(self, request):
        user_id = request.query_params.get('id', -1)
        if user_id == -1:
            return Response(status=400)
        
        if cache.get(f'user_overall_reviews_{user_id}', None) is None:
            values = self.get_queryset().filter(
                user__pk=user_id).values_list('rate', flat=True)
            total = sum(values)
            rate = float(total)/len(values) if values else 0
            cache.set(f'user_overall_reviews_{user_id}', (total, rate), 24 * 3600)
        else:
            total, rate = cache.get(f'user_overall_reviews_{user_id}')
        return Response({'rate': rate, 'total': total}, status=200)
