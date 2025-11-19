from rest_framework import viewsets,status
from rest_framework.views import APIView
from .models import Team
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Project, TestCase, TestStep, ScriptProject, ScriptCase,ScriptResult, TestRunReport, Group
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from .serializers import ProjectSerializer, TestCaseSerializer, ScriptProjectSerializer,ScriptCaseSerializer, TestActionLogSerializer,TeamMemberSerializer, GroupSerializer
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated,AllowAny
from django.db.models import Count, Avg
from datetime import datetime
from .tasks import run_testcase_in_background
from .playwright_runner import run_testcase_async
from playwright.sync_api import sync_playwright
import traceback
import json
import time
import contextlib
import threading
import io
import os, re
import uuid
from django.conf import settings
from datetime import datetime
from .utils import generate_html_report
from .tests import generate_group_report
from .models import TestActionLog
from .utils import SetPagination
from django.contrib.auth.models import User


def log_test_action(user, test_name, status, project_name=None, info=None):
    TestActionLog.objects.create(
        user=user,
        test_name=test_name,
        project=project_name or "",
        status=status,
        additional_info=info or {}
    )

def save_test_report(project, testcase, report_path, status):
    TestRunReport.objects.create(
        project=project,
        testcase=testcase,
        report=report_path,
        status=status
    )

class AddTeamMemberView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        team_id = request.data.get("team_id")
        username = request.data.get("username")

        if not team_id or not username:
            return Response(
                {"detail": "Both 'team_id' and 'username' are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Fetch project and team
        team = Team.objects.filter(id=team_id).first()
        if not team:
            return Response({"detail": "Team not found."}, status=status.HTTP_404_NOT_FOUND)
        
        # Ensure current user is a member of this team
        if not team.members.filter(id=user.id).exists():
            return Response(
                {"detail": "You are not a member of this team."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get the user to be added
        try:
            new_member = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        # Ensure new member not already part of another team
        if team.members.filter(id=new_member.id).exists():
            return Response({"detail": "User already part of this team."}, status=status.HTTP_400_BAD_REQUEST)

        # --- Check if user belongs to *any other* team ---
        other_team = Team.objects.filter(members=new_member).exclude(id=team.id).first()
        if other_team:
            return Response(
                {"detail": f"User already belongs to another team ('{other_team.name}')."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Add new member
        team.members.add(new_member)
        return Response(
            {"detail": f"{username} added to team '{team.name}' successfully."},
            status=status.HTTP_200_OK
        )

class TeamMembersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # Find the team the current user belongs to
        teams = Team.objects.filter(members=user).prefetch_related("members")

        if not teams.exists(): 
            return Response( {"detail": "You are not part of any team."}, status=status.HTTP_404_NOT_FOUND, )

        response_data = [] 
        for team in teams: 
            members = team.members.all() 
            serializer = TeamMemberSerializer(members, many=True) 
            response_data.append({ "team_id": team.id, "team_name": team.name, "member_count": members.count(), "members": serializer.data, }) 
        return Response(response_data, status=status.HTTP_200_OK)
class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all().order_by('id')
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return Project.objects.all()
        team = Team.objects.filter(members=user)
        return Project.objects.filter(team__in=team).order_by('id')

    def perform_create(self, serializer):
        user = self.request.user
         # Ensure user is not already in a team
        existing_team = Team.objects.filter(members=user).first()
        if existing_team:
            raise ValidationError({"detail": "You already belong to a team and cannot create a new one."})
        
        # Create a new team for the project
        team = Team.objects.create(
            name=f"{serializer.validated_data.get('name')} Team"
        )
        team.members.add(user)

        # Save the project linked to this team
        serializer.save(team=team)
   
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "count": queryset.count(),
            "results": serializer.data
        })
    
class SummaryView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user = request.user
        if user.is_superuser:
            all_projects = Project.objects.all()
            all_testcases = TestCase.objects.all()
            all_teststeps = TestStep.objects.all()
            all_project_count = all_projects.count()
            all_testcase_count = all_testcases.count()
            all_teststeps_count = all_teststeps.count()

            avg_steps = all_testcases.annotate(step_count=Count('steps')).aggregate(avg_steps=Avg('step_count'))['avg_steps'] or 0
            admin_data = {
            "totalProjects" : all_project_count,
            "totalTestCases" : all_testcase_count,
            "totalTestSteps" : all_teststeps_count,
            "avgSteps" : round(avg_steps, 1)
            }
            return Response(admin_data)
        team = Team.objects.filter(members=user).first()
        if not team:
            return Response({"detail": "User is not assigned to any team."}, status=400)
        projects = Project.objects.filter(team=team)
        modules = Group.objects.filter(project__team=team)
        testcases = TestCase.objects.filter(project__team=team)
        teststeps = TestStep.objects.filter(testcase__project__team=team)
        project_count = projects.count()
        module_count = modules.count()
        testcase_count = testcases.count()
        teststeps_count = teststeps.count()
   
        avg_steps = testcases.annotate(step_count=Count('steps')).aggregate(avg_steps=Avg('step_count'))['avg_steps'] or 0
    

        data = {
            "totalProjects" : project_count,
            "totalModules" : module_count,
            "totalTestCases" : testcase_count,
            "totalTestSteps" : teststeps_count,
            "avgSteps" : round(avg_steps, 1)
        }

        return Response(data)

class TestCaseViewSet(viewsets.ModelViewSet):
    queryset = TestCase.objects.all()
    serializer_class = TestCaseSerializer
    permission_classes = [AllowAny]
    pagination_class = SetPagination

    # --- API Endpoint ---
    @action(detail=True, methods=["post"], parser_classes=[MultiPartParser, FormParser])
    def run(self, request, pk=None):
        """
        Run a TestCase.
        - If an Excel file is uploaded → run in background thread and return TestRun id.
        - If no file → run inline asynchronously and return immediate results.
        """
        testcase = self.get_object()

        uploaded_file = request.FILES.get("file")  # optional

        if uploaded_file:
            # Large Excel → background execution
            test_run = run_testcase_in_background(testcase, uploaded_file)
            return Response({
                "testcase_id": testcase.id,
                "run_id": str(test_run.id),
                "message": "Execution started. Poll /task-status/{run_id}/ for updates."
            }, status=status.HTTP_202_ACCEPTED)
        else:
            # Small inline → run immediately
            import asyncio
            steps = list(testcase.steps.all().values())  # your JSON steps
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            results = loop.run_until_complete(run_testcase_async(steps, values=None, name=testcase.name))
            report_path = generate_html_report(testcase.id, results)
            project = testcase.project
            save_test_report(project=project, testcase=testcase, report_path=report_path, status="completed")
            log_test_action(user=request.user, test_name=testcase.name, status="completed", project_name=project.name, info={"testcase_id": testcase.id, "report": report_path, "project":project.name})
            return Response({
                "testcase_id": testcase.id,
                "results": results,
                "status": "completed",
                "report": report_path,
            }, status=status.HTTP_200_OK)

    @action(detail=True, methods=["get"], url_path="task-status")
    def task_status(self, request, pk=None):
        """
        Poll latest background TestRun status for a testcase.
        """
        testcase = self.get_object()
        latest_run = testcase.runs.order_by("-created_at").first()

        if not latest_run:
            return Response({"message": "No runs found for this testcase"}, status=404)
        project = testcase.project
        
        # log when status is "completed" or "failed"
        run_id = str(latest_run.id)
        final_states = ["completed", "failed"]
        
        # Check if a log already exists for this run_id with the current status
        existing_log = TestActionLog.objects.filter(
            user=request.user,
            test_name=testcase.name,
            status=latest_run.status
        ).filter(
            additional_info__run_id=run_id
        ).order_by('-created_at').first()
        
        should_log = (
            latest_run.status in final_states and 
            existing_log is None
        )
        
        if should_log:
            log_test_action(
                user=request.user, 
                test_name=testcase.name, 
                status=latest_run.status, 
                project_name=project.name, 
                info={
                    "testcase_id": testcase.id,
                    "run_id": run_id,
                    "report": latest_run.result_file.url if latest_run.result_file else None,
                    "project": project.name,
                    "progress": latest_run.progress
                }
            )

        return Response({
            "testcase_id": testcase.id,
            "run_id": run_id,
            "name":testcase.name,
            "status": latest_run.status,
            "progress": latest_run.progress,
            "result_file": latest_run.result_file.url if latest_run.result_file else None,
        })
    @action(detail=False, methods=["get"], url_path="all-task-status")
    def all_task_status(self, request):
        """
        Poll latest background TestRun status for a testcase.
        """
        user = request.user
        team = Team.objects.filter(members=user).first()
        projects = Project.objects.filter(team=team)

        if not team:
            return Response({"detail": "User is not part of any team."}, status=status.HTTP_400_BAD_REQUEST)
        data = []
        testcases = TestCase.objects.filter(project__in=projects).order_by('-id')

        for testcase in testcases:
            latest_run = testcase.runs.order_by("-created_at").first()
            if latest_run:
                data.append({
                    "testcase_id": testcase.id,
                    "name":testcase.name,
                    "run_id": str(latest_run.id),
                    "status": latest_run.status,
                    "progress": latest_run.progress,
                    "result_file": latest_run.result_file.url if latest_run.result_file else None,
                })

        page = self.paginate_queryset(data)
        if page is not None:
            return self.get_paginated_response(page)

        return Response(data)
  
    @action(detail=False, methods=["get"], url_path="reports")
    def testcase_report(self,request):
        user = request.user
        team = Team.objects.filter(members=user).first()
        if not team:
            return Response({"detail": "User is not part of any team."}, status=status.HTTP_400_BAD_REQUEST)
        projects = Project.objects.filter(team=team)
        testcases = TestCase.objects.filter(project__in=projects).order_by('-id')
        data = []
        for testcase in testcases:
            latest_report = TestRunReport.objects.filter(testcase=testcase).order_by("-created_at").first()
            if latest_report:
                data.append({
                    "testcase_id": testcase.id,
                    "name":testcase.name,
                    "project": testcase.project.name,
                    "status": latest_report.status,
                    "report": latest_report.report.url if latest_report.report else None,
                    "created_at": latest_report.created_at,
                })
        page = self.paginate_queryset(data)
        if page is not None:
            return self.get_paginated_response(page)


        return Response(data, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        testcase = self.get_object()
        self.perform_destroy(testcase)
        return Response({ "message": "Testcase deleted successfully"},
        status=status.HTTP_200_OK
    )

class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    pagination_class = SetPagination

    def get_queryset(self):
        project_id = self.request.query_params.get("project")
        if project_id:
            return self.queryset.filter(project_id=project_id)
        return self.queryset
    
    @action(detail=True, methods=["post"], url_path="run")
    def run_group(self, request, pk=None):
        try:
            group = self.get_object()
            testcases = group.testcases.all()

            if not testcases.exists():
                return Response({"detail": "No testcases under this group."}, status=status.HTTP_404_NOT_FOUND)

            results = []
            passed_count = 0
            failed_count = 0
            for testcase in testcases:
                import asyncio
                # get all steps
                steps = list(testcase.steps.all().values())
                
                # Create new asyncio loop
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)

                # Run each testcase
                res = loop.run_until_complete(run_testcase_async(steps))
                loop.close()
                
                report_path = generate_html_report(testcase.id, res)

                testcase_status = "passed"
                for step in res:
                    if step.get("status") == "failed":
                        testcase_status = "failed"
                        break
                if testcase_status == "passed":
                    passed_count += 1
                
                else:
                    failed_count += 1
            
                results.append({
                    "testcase_id": testcase.id,
                    "testcase_name": testcase.name,
                    "status" : testcase_status,
                    "result": res,
                    "report": report_path,
                })

            # Determine overall group status
            overall_status = "passed" if failed_count == 0 else "failed"


            group_report_path = generate_group_report(
                    group_name=group.name,
                    total_tests=len(results),
                    passed=passed_count,
                    failed=failed_count,
                    results=results
                )

            return Response({
                "group_id": group.id,
                "group_name": group.name,
                "total_testcases": len(results),
                "status":overall_status,
                "passed": passed_count,
                "failed": failed_count,
                "group_report": group_report_path,
                "results": results
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserTeamsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        teams = Team.objects.all() if user.is_superuser else Team.objects.filter(members=user)

        data = []

        for team in teams:
            data.append({
                "id": team.id,
                "name": team.name,
                "created_at": team.created_at,
                "members": [
                    {
                        "username": m.username,
                        "email": m.email,
                    }
                    for m in team.members.all()
                ]
            })
        return Response(list(data))

class RecentActionsViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TestActionLog.objects.all().order_by('-id')
    serializer_class = TestActionLogSerializer
    pagination_class = SetPagination

    def get_queryset(self):
        user = self.request.user
        teams = []
        if user.is_superuser:
            teams = Team.objects.all()
        else:
        # Get all teams where the user is a member
            teams = Team.objects.filter(members=user)

        # Get all project names under those teams
        project_names = Project.objects.filter(team__in=teams).values_list("name", flat=True)

        # Filter logs whose project name matches those projects
        return TestActionLog.objects.filter(project__in=project_names).order_by("-id")
         
class PlaywrightExecutorWithScreenshots:
    def __init__(self):
        self.logs = []
        self.screenshots = []
        self.start_time = None
        self.end_time = None
        self.current_page = None
    
    def log(self, message):
        """Enhanced logging function"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        log_entry = f"[{timestamp}] {message}"
        self.logs.append(log_entry)
    
    


    def take_screenshot(self, page=None, description="Screenshot", project_name="default",):
        """
        Capture screenshot and save to MEDIA folder (media/screenshots/{project}/...).
        Returns the URL path instead of base64.
        """
        def sanitize_filename(name: str) -> str:
    
            return re.sub(r'[<>:"/\\|?*]', '_', name)
        try:
            screenshot_page = page or self.current_page
            if not screenshot_page:
                self.log("⚠️ No page available for screenshot")
                return None

            # Ensure project folder exists inside media/screenshots
            screenshots_dir = os.path.join(settings.MEDIA_ROOT, "screenshots", project_name)
            os.makedirs(screenshots_dir, exist_ok=True)

            # Generate unique filename
                # Sanitize description for filename
            safe_description = sanitize_filename(description.lower().replace(" ", "_"))
            safe_project_name = sanitize_filename(project_name)
            print(safe_project_name)


        # Generate unique filename
            filename = f"{safe_description}_{uuid.uuid4().hex}.png"
            file_path = os.path.join(screenshots_dir, filename)

            # Save screenshot directly to file
            screenshot_page.screenshot(path=file_path, full_page=True)

            # Build relative MEDIA URL for frontend
            screenshot_url = os.path.join(settings.MEDIA_URL, "screenshots", project_name, filename)

            screenshot_info = {
                "description": description,
                "timestamp": datetime.now().isoformat(),
                #"file_path": file_path,    
                "url": screenshot_url,     
            }

            self.screenshots.append(screenshot_info)
            self.log(f"📸 Screenshot saved: {screenshot_url}")

            return screenshot_info

        except Exception as e:
            self.log(f"❌ Failed to capture screenshot: {str(e)}")
            return None

    
    def auto_screenshot_wrapper(self, func, page, description):
        """Wrapper to automatically take screenshots after actions"""
        try:
            result = func()
            # Wait a moment for any animations/loading
            page.wait_for_timeout(500)
            self.take_screenshot(page, description)
            return result
        except Exception as e:
            self.take_screenshot(page, f"Error during: {description}")
            raise e
    
    def execute_script(self, script_content, script_name, timeout=60, auto_screenshots=True):
        """Execute Playwright script with screenshot capture"""
        self.start_time = datetime.now()
        self.logs = []
        self.screenshots = []
        
        # Enhanced execution environment with screenshot functions
        def enhanced_take_screenshot(page=None, description="Manual Screenshot"):
            self.take_screenshot(page or self.current_page, description,project_name=script_name)
        
        def enhanced_goto(page, url, description=None):
            self.log(f"🌐 Navigating to: {url}")
            page.goto(url)
            page.wait_for_load_state('networkidle')
            if auto_screenshots:
                desc = description or f"Navigation to {url}"
                self.take_screenshot(page, desc,project_name=script_name)
        
        def enhanced_fill(page, selector, value, description=None):
            self.log(f"✏️ Filling '{selector}' with value")
            page.fill(selector, value)
            if auto_screenshots:
                desc = description or f"Filled {selector}"
                self.take_screenshot(page, desc,project_name=script_name)
        
        def enhanced_click(page, selector, description=None):
            self.log(f"👆 Clicking: {selector}")
            page.click(selector)
            page.wait_for_timeout(500)  # Wait for any animations
            if auto_screenshots:
                desc = description or f"Clicked {selector}"
                self.take_screenshot(page, desc,project_name=script_name)
        
        script_globals = {
            '__builtins__': __builtins__,
            'sync_playwright': sync_playwright,
            'log': self.log,
            'print': self.log,
            'take_screenshot': enhanced_take_screenshot,
            'enhanced_goto': enhanced_goto,
            'enhanced_fill': enhanced_fill,
            'enhanced_click': enhanced_click,
            'datetime': datetime,
            'time': time,
            'json': json,
        }
        
        # Capture stdout/stderr
        stdout_capture = io.StringIO()
        stderr_capture = io.StringIO()
        
        try:
            self.log("🚀 Starting Playwright script execution with screenshots...")
            
            execution_error = None
            
            def run_script():
                nonlocal execution_error
                try:
                    with contextlib.redirect_stdout(stdout_capture), \
                         contextlib.redirect_stderr(stderr_capture):
                        exec(script_content, script_globals)
                except Exception as e:
                    execution_error = e
            
            # Execute with timeout
            thread = threading.Thread(target=run_script)
            thread.daemon = True
            thread.start()
            thread.join(timeout=timeout)
            
            if thread.is_alive():
                raise TimeoutError(f"Script execution timeout after {timeout} seconds")
            
            if execution_error:
                raise execution_error
            
            self.end_time = datetime.now()
            self.log("✅ Script execution completed successfully!")
            
            return {
                'status': 'passed',
                'message': 'Script executed successfully with screenshots captured',
                'logs': self.logs,
                'screenshots': self.screenshots,
                'screenshot_count': len(self.screenshots),
                'stdout': stdout_capture.getvalue(),
                'stderr': stderr_capture.getvalue(),
                'execution_time': (self.end_time - self.start_time).total_seconds(),
                'start_time': self.start_time.isoformat(),
                'end_time': self.end_time.isoformat()
            }
            
        except Exception as e:
            self.end_time = datetime.now()
            error_msg = str(e)
            traceback_str = traceback.format_exc()
            
            self.log(f"❌ Script execution failed: {error_msg}")
            
            return {
                'status': 'failed',
                'message': f'Script execution failed: {error_msg}',
                'error': error_msg,
                'traceback': traceback_str,
                'logs': self.logs,
                'screenshots': self.screenshots,
                'screenshot_count': len(self.screenshots),
                'stdout': stdout_capture.getvalue(),
                'stderr': stderr_capture.getvalue(),
                'execution_time': (self.end_time - self.start_time).total_seconds() if self.start_time else 0,
                'start_time': self.start_time.isoformat() if self.start_time else None,
                'end_time': self.end_time.isoformat() if self.end_time else None
            }

class PlaywrightRunView(APIView):
    def post(self, request, *args, **kwargs):
        script_content = request.data.get('script')
        timeout = int(request.data.get('timeout', 60))
        auto_screenshots = request.data.get('auto_screenshots', True)
        
        if not script_content:
            return Response({
                "error": "Script content is required"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            executor = PlaywrightExecutorWithScreenshots()
            result = executor.execute_script(script_content, timeout, auto_screenshots)
            
            return Response(result, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                "status": "failed",
                "error": f"Unexpected error: {str(e)}",
                "traceback": traceback.format_exc()
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ScriptProjectViewSet(viewsets.ModelViewSet):
    # queryset = ScriptProject.objects.all()
    serializer_class = ScriptProjectSerializer

    def get_queryset(self):
        user = self.request.user
    
        if user.is_superuser:
            return ScriptProject.objects.all()

        return ScriptProject.objects.filter(user=user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=["post"], url_path="add-script")
    def add_script(self, request, pk=None):
        project = self.get_object()  # current ScriptProject

        serializer = ScriptCaseSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(project=project)  # attach project
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
   
class ScriptCaseViewSet(viewsets.ModelViewSet):
    # queryset = ScriptCase.objects.all()
    serializer_class = ScriptCaseSerializer

    def get_queryset(self):
        user = self.request.user

        if user.is_superuser:
            return ScriptCase.objects.all()

        return ScriptCase.objects.filter(project__user=user)

    @action(detail=True, methods=["post"], url_path="run")
    def run_script(self, request, pk=None):
        """Run the Playwright script for this testcase"""
        script_case = self.get_object()
        script_content = script_case.script
        script_name = script_case.name

        executor = PlaywrightExecutorWithScreenshots()
        result = executor.execute_script(script_content,script_name)

        # Save result in DB
        script_result = ScriptResult.objects.create(
            testcase=script_case,
            status=result["status"],
            details={
                "logs": result["logs"],
                "screenshots": result["screenshots"],
                "stdout": result["stdout"],
                "stderr": result["stderr"],
                "execution_time": result["execution_time"],
            }
        )

        return Response(
            {
                "id": script_result.id,
                "status": script_result.status,
                "logs": result["logs"],
                "screenshots": result["screenshots"],  # base64 encoded
                "stdout": result["stdout"],
                "stderr": result["stderr"],
                "execution_time": result["execution_time"],
            },
            status=status.HTTP_200_OK
        )

