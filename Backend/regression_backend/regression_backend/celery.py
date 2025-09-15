import os
from celery import Celery

# set default settings for Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'regression_backend.settings')

app = Celery('regression_backend')

# load config from Django settings, all CELERY_ keys
app.config_from_object('django.conf:settings', namespace='CELERY')

# auto-discover tasks.py in all apps
app.autodiscover_tasks()
