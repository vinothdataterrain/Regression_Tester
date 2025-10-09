from rest_framework import viewsets,status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Project, TestCase, TestStep, ScriptProject, ScriptCase,ScriptResult
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from .serializers import ProjectSerializer, TestCaseSerializer, ScriptProjectSerializer,ScriptCaseSerializer
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
class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all().order_by('id')
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Project.objects.filter(user=self.request.user).order_by('id')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)    
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "count": queryset.count(),
            "results": serializer.data
        })
    
class SummaryView(APIView):
    def get(self, request):
        project_count = Project.objects.count()
        testcase_count = TestCase.objects.count()
        teststeps_count = TestStep.objects.count()

        avg_steps = TestCase.objects.annotate(step_count=Count('steps')).aggregate(avg_steps=Avg('step_count'))['avg_steps'] or 0

        data = {
            "totalProjects" : project_count,
            "totalTestCases" : testcase_count,
            "totalTestSteps" : teststeps_count,
            "avgSteps" : round(avg_steps, 1)
        }
        return Response(data)

class TestCaseViewSet(viewsets.ModelViewSet):
    queryset = TestCase.objects.all()
    serializer_class = TestCaseSerializer
    permission_classes = [AllowAny]

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

        return Response({
            "testcase_id": testcase.id,
            "run_id": str(latest_run.id),
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
        data = []
        testcases = TestCase.objects.all()

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

        return Response(data)

    def destroy(self, request, *args, **kwargs):
        testcase = self.get_object()
        self.perform_destroy(testcase)
        return Response({ "message": "Testcase deleted successfully"},
        status=status.HTTP_200_OK
    )

    

         
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
    queryset = ScriptProject.objects.all()
    serializer_class = ScriptProjectSerializer

    @action(detail=True, methods=["post"], url_path="add-script")
    def add_script(self, request, pk=None):
        project = self.get_object()  # current ScriptProject

        serializer = ScriptCaseSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(project=project)  # attach project
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
   
class ScriptCaseViewSet(viewsets.ModelViewSet):
    queryset = ScriptCase.objects.all()
    serializer_class = ScriptCaseSerializer

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

