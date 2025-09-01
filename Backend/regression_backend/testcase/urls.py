from django.urls import path,include
from rest_framework.routers import DefaultRouter
from .views import ProjectViewSet, TestCaseViewSet

# Router automatically generates /projects/ and /testcases/ endpoints
router = DefaultRouter()
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'testcases', TestCaseViewSet, basename='testcase')

urlpatterns = [
    path('', include(router.urls)),
]