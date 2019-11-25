from django.db import models
from django.conf import settings


class MessageDialog(models.Model):
    booking = models.ForeignKey(
        'accommodation.Booking',
        related_name='booking',
        null=False,
        on_delete=models.CASCADE
    )
    receiver = models.ForeignKey(
        'user.User',
        related_name='receiver',
        null=False,
        on_delete=models.CASCADE
    )
    sender = models.ForeignKey(
        'user.User',
        related_name='sender',
        null=False,
        on_delete=models.CASCADE
    )
    update_time = models.DateTimeField(auto_now=True)
    new_message = models.IntegerField(null=False, default=1)

    class Meta:
        unique_together = ['booking', 'receiver', 'sender']
        db_table = 'Message_dialog'
        verbose_name_plural = "Message_dialogs"
        ordering = ('-update_time', 'sender', 'receiver')


class MessageContent(models.Model):
    message = models.ForeignKey(MessageDialog,
                                related_name='message',
                                null=False,
                                on_delete=models.CASCADE)
    content = models.TextField(null=False)
    created_time = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'Message_content'
        verbose_name_plural = "Message_contents"
