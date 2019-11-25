
# coding=utf-8
import time
import string
import hashlib
import sys
import smtplib
import random
from email.message import EmailMessage
from django.conf import settings
import json


_letter_cases = "abcdefghjkmnpqrstuvwxy"
_upper_cases = _letter_cases.upper()
_numbers = ''.join(map(str, range(3, 10)))
init_chars = ''.join((_letter_cases, _upper_cases, _numbers))


def SendMailVerificationCode(send_to):
    """
    Get verification code by sending email.
    """
    sent_from = settings.EMAIL_USER
    to = [send_to]
    subject = 'Verification code [Accommodating]'
    length = 6
    verify_sample = random.sample(init_chars, length)
    verification_code = ''.join(verify_sample)
    body = f"Here is your verification code!"
    msg = EmailMessage()
    email_text = f"""    Hi,
    {body}

    {verification_code}
    """
    msg.set_content(email_text)
    msg['Subject'] = subject
    msg['From'] = sent_from
    msg['To'] = send_to
    try:
        if settings.EMAIL_SERVER_TYPE == 'SSL':
            server = smtplib.SMTP_SSL(settings.EMAIL_SERVER, settings.EMAIL_SERVER_PORT)
        else:
            server = smtplib.SMTP(settings.EMAIL_SERVER, settings.EMAIL_SERVER_PORT)
        server.ehlo()
        server.login(settings.EMAIL_USER, settings.EMAIL_PASSWORD)
        server.send_message(msg)
        server.close()
        return verification_code
    except:
        return None


def make_random(img_name):
    salt = str(img_name)
    salt = salt.join(random.sample(string.ascii_letters + string.digits, 8))
    _hash = hashlib.md5()
    _hash.update(salt)
    random_val = _hash.hexdigest()+str(time.time()).split('.')[0]
    return random_val
