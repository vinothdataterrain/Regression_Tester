from django.db import models
from django.contrib.auth.models import User

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    bio = models.TextField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    role = models.CharField(max_length=40, default="tester") 
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.user.username