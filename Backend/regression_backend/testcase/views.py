from rest_framework import viewsets,status
from asgiref.sync import sync_to_async
from playwright.async_api import async_playwright
from urllib.parse import urljoin
from rest_framework.response import Response
from django.http import HttpResponse
from .models import Project, TestCase
from .serializers import ProjectSerializer, TestCaseSerializer
from threading import Thread
import asyncio
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from django.conf import settings
from io import BytesIO
import re
import asyncio
import openpyxl
from uuid import uuid4
class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes=[AllowAny]
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
    permission_classes = [AllowAny]

    # --- Utility: Resolve placeholders in step values ---
    def resolve_step_value(self, step_value, row_data):
        """
        Replace placeholders like {{column}} with row_data[column] if available.
        """
        if not step_value:
            return None

        if row_data:
            matches = re.findall(r"\{\{(.*?)\}\}", step_value)
            for m in matches:
                if m in row_data and row_data[m] is not None:
                    step_value = step_value.replace(f"{{{{{m}}}}}", str(row_data[m]))
        return step_value

    # --- Core Playwright Runner ---
    async def run_steps(self, steps, project_url, row_data=None):
        results = []
        
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=False, slow_mo=200)
            page = await browser.new_page()

            for step in steps:
                try:
                    final_url = step.url or project_url
                    if step.action == "goto" and final_url and not final_url.startswith("http"):
                        final_url = urljoin(project_url, step.url)

                    # Resolve value (JSON value or Excel/CSV override)
                    step_value = self.resolve_step_value(step.value, row_data)

                    # --- Action Handlers ---
                    if step.action == "goto":
                        await page.goto(final_url)

                    elif step.action == "fill":
                        if not step.selector:
                            raise ValueError("Selector required for fill")
                        await page.fill(step.selector, step_value or "")

                    elif step.action == "click":
                        if not step.selector:
                            raise ValueError("Selector required for click")
                        await page.click(step.selector)

                    elif step.action == "select":
                        if not step.selector or not step_value:
                            raise ValueError("Selector & value required for select")
                        await page.select_option(step.selector, step_value)

                    elif step.action == "check":
                        if not step.selector:
                            raise ValueError("Selector required for check")
                        await page.check(step.selector)

                    elif step.action == "uncheck":
                        if not step.selector:
                            raise ValueError("Selector required for uncheck")
                        await page.uncheck(step.selector)

                    elif step.action == "assert":
                        if not step.selector:
                            raise ValueError("Selector required for assert")
                        element_text = await page.text_content(step.selector) or ""
                        expected_value = step_value or ""
                        if expected_value not in element_text:
                            raise AssertionError(
                                f"Expected '{expected_value}' in '{element_text}'"
                            )

                    elif step.action == "expect_visible":
                        if not step.selector:
                            raise ValueError("Selector required for expect_visible")
                        await page.wait_for_selector(step.selector, state="visible", timeout=5000)

                    elif step.action == "expect_hidden":
                        if not step.selector:
                            raise ValueError("Selector required for expect_hidden")
                        await page.wait_for_selector(step.selector, state="hidden", timeout=5000)

                    elif step.action == "expect_url":
                        expected_value = step_value or ""
                        if expected_value not in page.url:
                            raise AssertionError(
                                f"Expected URL to contain '{expected_value}', got '{page.url}'"
                            )

                    elif step.action == "expect_title":
                        expected_value = step_value or ""
                        title = await page.title()
                        if expected_value not in title:
                            raise AssertionError(
                                f"Expected title '{expected_value}' in '{title}'"
                            )

                    else:
                        raise ValueError(f"Unknown action {step.action}")

                    results.append({
                        "action": step.action,
                        "value": step.value,
                        "step_number": step.order + 1,
                        "status": "passed"
                    })

                except Exception as e:
                    results.append({
                        "action": step.action,
                        "value": step.value,
                        "step_number": step.order + 1,
                        "status": "failed",
                        "error": str(e),
                    })
                    break  # stop on first failure

            await browser.close()
        return results

    # --- API Endpoint ---
    @action(detail=True, methods=["post"])
    def run(self, request, pk=None):
        testcase = self.get_object()
        steps = list(testcase.steps.all().order_by("order", "id"))
        print(steps,"Stepss")
        project_url = testcase.project.url if testcase.project else ""

        # --- Case 1: File uploaded (Excel or CSV) ---
        if "file" in request.FILES:
            file = request.FILES["file"]
            # Load uploaded Excel
            wb_input = openpyxl.load_workbook(file)
            ws_input = wb_input.active
            headers = [cell.value for cell in ws_input[1]]

            # Prepare output workbook in memory
            wb_output = openpyxl.Workbook()
            ws_output = wb_output.active
            ws_output.append(headers + ["Status", "Step Results"])  # header row

            for row in ws_input.iter_rows(min_row=2, values_only=True):
                row_data = dict(zip(headers, row))
                row_results = asyncio.run(self.run_steps(steps, project_url, row_data))
                overall_status = "passed" if all(r["status"] == "passed" for r in row_results) else "failed"

                # Save row + results to output sheet
                results_str = "; ".join([f"{r['step_number']}:{r['action']}={r['status']}" for r in row_results])
                ws_output.append(list(row) + [overall_status, results_str])

            # Save to in-memory bytes
            output = BytesIO()
            wb_output.save(output)
            output.seek(0)

            # Return as downloadable Excel
            response = HttpResponse(
                output.read(),
                content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            )
            response['Content-Disposition'] = f'attachment; filename=testcase_{testcase.name}_results.xlsx'
            return response

        # --- Case 2: Default run (use JSON values directly) ---
        else:
            results = asyncio.run(self.run_steps(steps, project_url))
            overall_status = "passed" if all(r["status"] == "passed" for r in results) else "failed"

            return Response({
                "testcase": testcase.id,
                "mode": "default",
                "status": overall_status,
                "results": results
            }, status=status.HTTP_200_OK)

# class TestCaseViewSet(viewsets.ModelViewSet):
#     queryset = TestCase.objects.all()
#     serializer_class = TestCaseSerializer
#     permission_classes = [AllowAny]

#     # def create(self, request, *args, **kwargs):
#     #     try:
#     #         print("glkdfjd")
#     #         return Response({'msg':"fldk"}, status=status.HTTP_200_OK)
#     #     except Exception as e:
#     #         return Response({"error", str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#     @action(detail=True, methods=["post"])
#     def run(self, request, pk=None):
#         testcase = self.get_object()
#         steps = list(testcase.steps.all().order_by("order", "id"))
#         project_url = testcase.project.url

#         async def run_playwright():
#             results = []
#             async with async_playwright() as p:
#                 browser = await p.chromium.launch(headless=False, slow_mo=500)
#                 page = await browser.new_page()
#                 for step in steps:
#                     try:
#                         final_url = step.url or project_url
#                         if step.action == "goto" and not final_url.startswith("http"):
#                             from urllib.parse import urljoin
#                             final_url = urljoin(project_url, step.url)

#                         # Navigation
#                         if step.action == "goto":
#                             await page.goto(final_url)

#                         # Fill inputs
#                         elif step.action == "fill":
#                             if not step.selector:
#                                 raise ValueError("Selector required for fill")
#                             await page.fill(step.selector, step.value or "")

#                         # Click
#                         elif step.action == "click":
#                             if not step.selector:
#                                 raise ValueError("Selector required for click")
#                             await page.click(step.selector)

#                         # Select dropdown option
#                         elif step.action == "select":
#                             if not step.selector:
#                                 raise ValueError("Selector required for select")
#                             if not step.value:
#                                 raise ValueError("Value required for select")
#                             await page.select_option(step.selector, step.value)

#                         # Check a checkbox
#                         elif step.action == "check":
#                             if not step.selector:
#                                 raise ValueError("Selector required for check")
#                             await page.check(step.selector)

#                         # Uncheck a checkbox
#                         elif step.action == "uncheck":
#                             if not step.selector:
#                                 raise ValueError("Selector required for uncheck")
#                             await page.uncheck(step.selector)

#                         # Assert element text contains
#                         elif step.action == "assert":
#                             if not step.selector:
#                                 raise ValueError("Selector required for assert")
#                             element_text = await page.text_content(step.selector) or ""
#                             expected_value = step.value or ""
#                             if expected_value not in element_text:
#                                 raise AssertionError(
#                                     f"Expected '{expected_value}' in '{element_text}'"
#                                 )

#                         # Expect element to be visible
#                         elif step.action == "expect_visible":
#                             if not step.selector:
#                                 raise ValueError("Selector required for expect_visible")
#                             await page.wait_for_selector(step.selector, state="visible", timeout=5000)

#                         # Expect element to be hidden
#                         elif step.action == "expect_hidden":
#                             if not step.selector:
#                                 raise ValueError("Selector required for expect_hidden")
#                             await page.wait_for_selector(step.selector, state="hidden", timeout=5000)

#                         # Expect URL contains
#                         elif step.action == "expect_url":
#                             expected_value = step.value or ""
#                             current_url = page.url
#                             if expected_value not in current_url:
#                                 raise AssertionError(
#                                     f"Expected URL to contain '{expected_value}', got '{current_url}'"
#                                 )

#                         # Expect title contains
#                         elif step.action == "expect_title":
#                             expected_value = step.value or ""
#                             title = await page.title()
#                             if expected_value not in title:
#                                 raise AssertionError(
#                                     f"Expected title '{expected_value}' in '{title}'"
#                                 )

#                         # wait for an action
#                         elif step.action == "wait":
#                             if step.selector:
#                                 timeout = int(step.value) if step.value else 5000
#                                 await page.wait_for_selector(step.selector, timeout=timeout)
#                             elif step.value:
#                                 timeout = int(step.value)
#                                 await page.wait_for_timeout(timeout = timeout)
#                             else:
#                                 raise ValueError("Wait action requires either selector or value")

#                         else:
#                             raise ValueError(f"Unknown action {step.action}")

#                         # ✅ Success
#                         results.append({"action": step.action,
#                             "value": step.value,"step_number": step.order + 1, "status": "passed"})

#                     except Exception as e:
#                         results.append({
#                             "action": step.action,
#                             "value": step.value,
#                             "step_number": step.order + 1,
#                             "status": "failed",
#                             "error": str(e),
#                         })
#                         break

#                 await browser.close()
#             return results

#         results = asyncio.run(run_playwright())
#         overall_status = "passed"
#         for step in results:
#             if step["status"] == "failed":
#                 overall_status = "failed"
#                 break 
#         return Response({"testcase": testcase.id, "status": overall_status , "results": results})