from rest_framework import viewsets
from asgiref.sync import sync_to_async
from playwright.async_api import async_playwright
from urllib.parse import urljoin
from rest_framework.response import Response
from .models import Project, TestCase
from .serializers import ProjectSerializer, TestCaseSerializer
from threading import Thread
import asyncio
from rest_framework.decorators import action

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "count": queryset.count(),
            "results": serializer.data
        })


class TestCaseViewSet(viewsets.ModelViewSet):
    queryset = TestCase.objects.all()
    serializer_class = TestCaseSerializer

    @action(detail=True, methods=["post"])
    def run(self, request, pk=None):
        testcase = self.get_object()
        steps = list(testcase.steps.all().order_by("order", "id"))
        project_url = testcase.project.url

        async def run_playwright():
            results = []
            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=False, slow_mo=500)
                page = await browser.new_page()
                for step in steps:
                    try:
                        final_url = step.url or project_url
                        if step.action == "goto" and not final_url.startswith("http"):
                            from urllib.parse import urljoin
                            final_url = urljoin(project_url, step.url)

                        # Navigation
                        if step.action == "goto":
                            await page.goto(final_url)

                        # Fill inputs
                        elif step.action == "fill":
                            if not step.selector:
                                raise ValueError("Selector required for fill")
                            await page.fill(step.selector, step.value or "")

                        # Click
                        elif step.action == "click":
                            if not step.selector:
                                raise ValueError("Selector required for click")
                            await page.click(step.selector)

                        # Select dropdown option
                        elif step.action == "select":
                            if not step.selector:
                                raise ValueError("Selector required for select")
                            if not step.value:
                                raise ValueError("Value required for select")
                            await page.select_option(step.selector, step.value)

                        # Check a checkbox
                        elif step.action == "check":
                            if not step.selector:
                                raise ValueError("Selector required for check")
                            await page.check(step.selector)

                        # Uncheck a checkbox
                        elif step.action == "uncheck":
                            if not step.selector:
                                raise ValueError("Selector required for uncheck")
                            await page.uncheck(step.selector)

                        # Assert element text contains
                        elif step.action == "assert":
                            if not step.selector:
                                raise ValueError("Selector required for assert")
                            element_text = await page.text_content(step.selector) or ""
                            expected_value = step.value or ""
                            if expected_value not in element_text:
                                raise AssertionError(
                                    f"Expected '{expected_value}' in '{element_text}'"
                                )

                        # Expect element to be visible
                        elif step.action == "expect_visible":
                            if not step.selector:
                                raise ValueError("Selector required for expect_visible")
                            await page.wait_for_selector(step.selector, state="visible", timeout=5000)

                        # Expect element to be hidden
                        elif step.action == "expect_hidden":
                            if not step.selector:
                                raise ValueError("Selector required for expect_hidden")
                            await page.wait_for_selector(step.selector, state="hidden", timeout=5000)

                        # Expect URL contains
                        elif step.action == "expect_url":
                            expected_value = step.value or ""
                            current_url = page.url
                            if expected_value not in current_url:
                                raise AssertionError(
                                    f"Expected URL to contain '{expected_value}', got '{current_url}'"
                                )

                        # Expect title contains
                        elif step.action == "expect_title":
                            expected_value = step.value or ""
                            title = await page.title()
                            if expected_value not in title:
                                raise AssertionError(
                                    f"Expected title '{expected_value}' in '{title}'"
                                )

                        # wait for an action
                        elif step.action == "wait":
                            if step.selector:
                                timeout = int(step.value) if step.value else 5000
                                await page.wait_for_selector(step.selector, timeout=timeout)
                            elif step.value:
                                timeout = int(step.value)
                                await page.wait_for_timeout(timeout = timeout)
                            else:
                                raise ValueError("Wait action requires either selector or value")

                        else:
                            raise ValueError(f"Unknown action {step.action}")

                        # ✅ Success
                        results.append({"action": step.action,
                            "value": step.value,"step_number": step.order + 1, "status": "passed"})

                    except Exception as e:
                        results.append({
                            "action": step.action,
                            "value": step.value,
                            "step_number": step.order + 1,
                            "status": "failed",
                            "error": str(e),
                        })
                        break

                await browser.close()
            return results

        results = asyncio.run(run_playwright())
        overall_status = "passed"
        for step in results:
            if step["status"] == "failed":
                overall_status = "failed"
                break 
        return Response({"testcase": testcase.id, "status": overall_status , "results": results})