from django.contrib.auth.models import AbstractUser
from django.db import models
from django.contrib.auth.base_user import BaseUserManager


class User(AbstractUser):
    """
    User profile model the fields are declared as following.
    """
    GENDER_CHOICES = (
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
        ('N', ' ')
    )
    gender = models.CharField(
        max_length=1, choices=GENDER_CHOICES, default='N')
    description = models.CharField(max_length=150, default='')
    city = models.CharField(max_length=100, default='')
    phone = models.CharField(max_length=25, default='')
    image = models.ImageField(
        upload_to='profile_image/', blank=True)
    objects = BaseUserManager()

    class Meta:
        db_table = 'User'
        verbose_name_plural = "Users"

    def __str__(self):
        return f"{self.pk} {self.username} {self.image}"


class UserReview(models.Model):
    user = models.ForeignKey(User,
                             null=False,
                             on_delete=models.CASCADE,
                             related_name='user'
                             )
    rate = models.IntegerField(
        null=False,
        default=1,
    )
    reviewer = models.ForeignKey(User,
                                 null=False,
                                 on_delete=models.CASCADE,
                                 related_name='review'
                                 )
    content = models.TextField(null=False)
    create_time = models.DateTimeField(auto_now_add=True, null=False)

    def __str__(self):
        return f"{self.rate}"

    class Meta:
        db_table = "UserReview"
        verbose_name_plural = "UserReviews"
