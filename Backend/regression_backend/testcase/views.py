from rest_framework import viewsets
from urllib.parse import urljoin
from playwright.sync_api import sync_playwright
from rest_framework.response import Response
from .models import Project, TestCase
from .serializers import ProjectSerializer, TestCaseSerializer
from threading import Thread
from rest_framework.decorators import action

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer



class TestCaseViewSet(viewsets.ModelViewSet):
    queryset = TestCase.objects.all()
    serializer_class = TestCaseSerializer

    @action(detail=True, methods=["post"])
    def run(self, request, pk=None):
        testcase = self.get_object()
        steps = testcase.steps.all().order_by("order", "id")
        project_url = testcase.project.url

        results = []

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()

            for step in steps:
                try:
                    # Compute final URL
                    final_url = step.url or project_url
                    if step.action == "goto" and not final_url.startswith("http"):
                        from urllib.parse import urljoin
                        final_url = urljoin(project_url, step.url)

                    # Execute actions
                    if step.action == "goto":
                        page.goto(final_url)
                    elif step.action == "fill":
                        if not step.selector:
                            raise ValueError("Selector required for fill")
                        page.fill(step.selector, step.value)
                    elif step.action == "click":
                        if not step.selector:
                            raise ValueError("Selector required for click")
                        page.click(step.selector)
                    else:
                        raise ValueError(f"Unknown action {step.action}")

                    results.append({"step_number": step.order + 1, "status": "passed"})

                except Exception as e:
                    results.append({"step_number": step.order + 1, "status": "failed", "error": str(e)})
                    break  # stop on first failure

            browser.close()

        return Response({"testcase": testcase.id, "results": results})