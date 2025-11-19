from django.urls import path,include
from rest_framework.routers import DefaultRouter
from .views import ProjectViewSet,UserTeamsView, TestCaseViewSet, SummaryView, PlaywrightRunView,ScriptProjectViewSet,ScriptCaseViewSet,RecentActionsViewSet,AddTeamMemberView,TeamMembersView, GroupViewSet

# Router automatically generates /projects/ and /testcases/ endpoints
router = DefaultRouter()
router.register(r"script-projects", ScriptProjectViewSet, basename="scriptproject")
router.register(r'script-case',ScriptCaseViewSet,basename='scriptcase')
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'testcases', TestCaseViewSet, basename='testcase')
router.register(r'recent-actions',RecentActionsViewSet, basename='recent-actions')
router.register(r'groups', GroupViewSet, basename='groups')

urlpatterns = [
    path('', include(router.urls)),
    path("team/add-member/", AddTeamMemberView.as_view(), name="add-team-member"),
    path("team/members/", TeamMembersView.as_view(), name="team-members"),
    path('user/teams/', UserTeamsView.as_view(), name='team'), 
    path('summary', SummaryView.as_view(), name='summary'),  # for summary view
    path('run-python-scripts', PlaywrightRunView.as_view(), name='run-python-scripts'),  # for raw script execution
]