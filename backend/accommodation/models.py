from django.db import models
from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
# Create your models here.


class Address(models.Model):
    """
    Accommodation address table (model)
    """
    raw = models.CharField(null=False, max_length=500)
    state = models.CharField(null=False, max_length=4)
    post_code = models.CharField(null=True, max_length=4)
    street_number = models.CharField(null=True, max_length=100, default='')
    route = models.CharField(null=True, max_length=100, default='')
    locality = models.CharField(null=False, max_length=100)
    latitude = models.FloatField(null=True)
    longitude = models.FloatField(null=True)

    class Meta:
        db_table = 'Address'
        verbose_name_plural = "Addresses"


class Accommodation(models.Model):
    """
    Accommodation table (model)
    """
    # house type
    TYPE_CHOICES = (
        ('HL', 'Hotel'),
        ('A', 'Apartment'),
        ('T', 'Town house'),
        ('HE', 'House'),
        ('V', 'Villa'),
        ('D', "Dormitory")
    )
    start_time = models.DateField(null=False)
    end_time = models.DateField(null=False)
    room_count = models.IntegerField(null=False)
    address = models.ForeignKey(Address,
                                null=False,
                                on_delete=models.CASCADE)
    price = models.IntegerField(null=False)
    description = models.TextField(default='')
    acc_type = models.CharField(
        max_length=2, choices=TYPE_CHOICES, null=False)
    rules = models.TextField(default='')
    owner = models.ForeignKey(
        'user.User',
        null=False,
        on_delete=models.CASCADE
    )

    def __str__(self):
        return f'{self.owner} {self.address}'

    class Meta:
        db_table = 'Accommodation'
        verbose_name_plural = "Accommodations"


class Images(models.Model):
    """
    Accommodation images models, and it contains
    a group of images.
    """
    accommodation = models.ForeignKey(Accommodation,
                                      related_name='images',
                                      null=False,
                                      on_delete=models.CASCADE
                                      )
    image = models.ImageField(upload_to='accommendation_images/')

    def __str__(self):
        return f"{settings.BACKEND_DOMAIN}{self.image.url}"

    class Meta:
        db_table = 'PropertyImages'
        verbose_name_plural = "PropertyImages"


class Booking(models.Model):
    """
    Table for booking
    """
    # booking status
    status_choice = (
        ('B', 'Booking'),
        ('A', 'Accept'),
        ('P', 'Paid'),
        ('D', 'Done'),
        ('AR', "ARCHIVE"),
        ('E', 'Expired'),
    )
    start_time = models.DateField(null=False)
    end_time = models.DateField(null=False)
    accommodation = models.ForeignKey(Accommodation,
                                      related_name='booking',
                                      null=False,
                                      on_delete=models.CASCADE
                                      )
    renter = models.ForeignKey('user.User',
                               null=False,
                               on_delete=models.CASCADE
                               )
    total = models.IntegerField(null=False, default=0)
    status = models.CharField(
        max_length=2, choices=status_choice, null=False, default='B')

    class Meta:
        db_table = 'Booking'
        verbose_name_plural = "Booking"


class WishesList(models.Model):
    """
    A table for wishes list.
    """
    accommodation = models.ForeignKey(Accommodation,
                                      null=False,
                                      on_delete=models.CASCADE
                                      )
    user = models.ForeignKey('user.User',
                             null=False,
                             on_delete=models.CASCADE
                             )

    def __str__(self):
        return f"{self.user.id},{self.accommodation.id}"

    class Meta:
        db_table = "WishesList"
        unique_together = ['user', 'accommodation']
        verbose_name_plural = "WishesLists"


class AccommodationReview(models.Model):
    """
    A table for accommodation review
    """
    accommodation = models.ForeignKey(Accommodation,
                                      related_name='reviews',
                                      null=False,
                                      on_delete=models.CASCADE,
                                      )
    rate = models.IntegerField(
        null=False,
        default=1
    )
    reviewer = models.ForeignKey('user.User',
                                 null=False,
                                 on_delete=models.CASCADE,
                                 )
    content = models.TextField(null=False)
    create_time = models.DateTimeField(auto_now_add=True, null=False)

    def __str__(self):
        return f"{self.rate}"

    class Meta:
        db_table = "AccommodationReview"
        verbose_name_plural = "AccommodationReviews"
