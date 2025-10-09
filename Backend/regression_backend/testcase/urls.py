from django.urls import path,include
from rest_framework.routers import DefaultRouter
from .views import ProjectViewSet, TestCaseViewSet, SummaryView, PlaywrightRunView,ScriptProjectViewSet,ScriptCaseViewSet,RecentActionsViewSet

# Router automatically generates /projects/ and /testcases/ endpoints
router = DefaultRouter()
router.register(r"script-projects", ScriptProjectViewSet, basename="scriptproject")
router.register(r'script-case',ScriptCaseViewSet,basename='scriptcase')
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'testcases', TestCaseViewSet, basename='testcase')
router.register(r'recent-actions',RecentActionsViewSet, basename='recent-actions')

urlpatterns = [
    path('', include(router.urls)),
    path('summary', SummaryView.as_view(), name='summary'),  # for summary view
    path('run-python-scripts', PlaywrightRunView.as_view(), name='run-python-scripts'),  # for raw script execution
]