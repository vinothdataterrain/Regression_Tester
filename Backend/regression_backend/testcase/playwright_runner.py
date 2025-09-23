# playwright_runner.py
import re
import os
import uuid
from urllib.parse import urljoin
from playwright.async_api import async_playwright
from django.conf import settings

PLACEHOLDER_PATTERNS = [
    re.compile(r"\{\{(.*?)\}\}"),  # {{col}}
    re.compile(r"\{(.*?)\}"),      # {col}
]

async def run_testcase_async(steps, values=None):
    """
    steps: list[dict]  -- each dict must contain keys: action, selector, value, url, order (optional)
    project_url: str
    row_data: dict or None -- values from excel row to substitute into placeholders
    Returns: list of step results
    """
    def resolve_step_value(step_value):
        if step_value is None:
            return None
        if not isinstance(step_value, str):
            return step_value
        if not values:
            return step_value

        # Replace placeholders using both {{col}} and {col} style
        replaced = step_value
        for pat in PLACEHOLDER_PATTERNS:
            for m in pat.findall(step_value):
                if m in values and values[m] is not None:
                    replaced = replaced.replace(pat.pattern.replace("(.*?)","{m}").split("{m}")[0] + m + pat.pattern.split("(.*?)")[-1], str(values[m]))
        # simpler fallback: replace direct {col} or {{col}} occurrences
        for col, val in (values.items() if isinstance(values, dict) else []):
            replaced = replaced.replace(f"{{{{{col}}}}}", str(val))
            replaced = replaced.replace(f"{{{col}}}", str(val))
        return replaced

    results = []
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False,slow_mo=50)
        if(steps[0]["action"] == "use"):
            states_dir = os.path.join(settings.MEDIA_ROOT, "storage_states")
            os.makedirs(states_dir, exist_ok=True)
            file_path = os.path.join(states_dir, steps[0]["value"])
            context = await browser.new_context(storage_state=file_path)
            steps = steps[1:]
        else:
            context = await browser.new_context()
        page = await context.new_page()

        for idx, step in enumerate(steps, start=1):
            # defensive extraction
            action = step.get("action") if isinstance(step, dict) else None
            selector = step.get("selector") if isinstance(step, dict) else None
            raw_value = step.get("value") if isinstance(step, dict) else None
            step_order = step.get("order", idx - 1) if isinstance(step, dict) else idx - 1
            step_url = step.get("url") if isinstance(step, dict) else None
            form_errors = []
            try:
                final_url = step_url 
                step_value = resolve_step_value(raw_value)

                # nav URL join if needed
                # if action == "goto" and final_url and not str(final_url).startswith("http"):
                    # final_url = urljoin(project_url, str(final_url))

                # --- Actions ---
                if action == "goto":
                    if not final_url and not step_value and not selector:
                        raise ValueError("goto action requires URL or project_url")
                
                    await page.goto(final_url or selector)

                elif action == "fill":
                    if not selector:
                        raise ValueError("Selector required for fill")
                    await page.fill(selector, step_value or "")

                elif action == "click":
                    if not selector:
                        raise ValueError("Selector required for click")
                    await page.click(selector)

                elif action == "select":
                    if not selector or (step_value is None or step_value == ""):
                        raise ValueError("Selector & value required for select")
                    await page.select_option(selector, str(step_value))

                elif action == "check":
                    if not selector:
                        raise ValueError("Selector required for check")
                    await page.check(selector)

                elif action == "uncheck":
                    if not selector:
                        raise ValueError("Selector required for uncheck")
                    await page.uncheck(selector)

                elif action == "assert":
                    if not selector:
                        raise ValueError("Selector required for assert")
                    text = await page.text_content(selector) or ""
                    expected = step_value or ""
                    if expected not in text:
                        raise AssertionError(f"Expected '{expected}' in '{text}'")

                elif action == "wait":
                    # supports waiting for selector or timeout in ms
                    if selector:
                        timeout = int(step_value) if step_value else 5000
                        await page.wait_for_selector(selector, timeout=timeout)
                    elif step_value:
                        await page.wait_for_timeout(int(step_value))
                    else:
                        raise ValueError("wait action requires selector or value")

                elif action == "expect_visible":
                    if not selector:
                        raise ValueError("Selector required for expect_visible")
                    await page.wait_for_selector(selector, state="visible", timeout=5000)

                elif action == "expect_hidden":
                    if not selector:
                        raise ValueError("Selector required for expect_hidden")
                    await page.wait_for_selector(selector, state="hidden", timeout=5000)

                elif action == "expect_url":
                    expected = step_value or ""
                    if expected not in page.url:
                        raise AssertionError(f"Expected URL to contain '{expected}', got '{page.url}'")

                elif action == "expect_title":
                    expected = step_value or ""
                    title = await page.title()
                    if expected not in title:
                        raise AssertionError(f"Expected title '{expected}' in '{title}'")
                elif action == "validate_form":
                  

                    # Grab all inputs, selects, textareas
                    fields = await page.query_selector_all("input, select, textarea")

                    for idx, field in enumerate(fields, start=1):
                        field_name = (
                            await field.get_attribute("name")
                            or await field.get_attribute("id")
                            or await field.get_attribute("placeholder")
                            or f"field_{idx}"
                        )

                        # Get browser-side validation message
                        msg = await field.evaluate("el => el.validationMessage")

                        if msg.strip() != "":
                            form_errors.append({
                                "field": field_name,
                                "error": msg
                            })
                    screenshots_dir = os.path.join(settings.MEDIA_ROOT, "screenshots")
                    os.makedirs(screenshots_dir, exist_ok=True)
                    name = f"assert{step_order}_passed.png"
                    screenshot_path = os.path.join(screenshots_dir, name)
                    await page.screenshot(path=screenshot_path, full_page=True)
                    screenshot_url = os.path.join(settings.MEDIA_URL, "screenshots", name)
                    if form_errors:
                        results.append({
                            "action": "validate_form",
                            "status": "failed",
                            "error": form_errors,
                            "screenshot": screenshot_url,
                        })
                        # Stop further steps if you want strict mode
                        break
                    else:
                        results.append({
                            "action": "validate_form",
                            "status": "passed",
                            "screenshot": screenshot_url,
                        })
                elif action == "save":
                    states_dir = os.path.join(settings.MEDIA_ROOT, "storage_states")
                    os.makedirs(states_dir, exist_ok=True)
                    file_path = os.path.join(states_dir, step_value)
                    await context.storage_state(path=file_path)
                    continue
                else:
                    raise ValueError(f"Unknown action '{action}'")
                screenshots_dir = os.path.join(settings.MEDIA_ROOT, "screenshots")
                os.makedirs(screenshots_dir, exist_ok=True)

                filename = f"final{uuid.uuid1()}_passed.png"
                file_path = os.path.join(screenshots_dir, filename)
               
                if(idx== len(steps)):
                    await page.screenshot(path=file_path, full_page=True)
                if action != "validate_form":
                    results.append({
                        "action": action,
                        "value": raw_value,
                        "step_number": step_order + 1,
                        "status": "passed"
                    })
                if os.path.exists(file_path) and results:
                    screenshot_url = os.path.join(settings.MEDIA_URL, "screenshots", filename)
                    results[-1]["screenshot"] = screenshot_url

            except Exception as exc:
                screenshots_dir = os.path.join(settings.MEDIA_ROOT, "screenshots")
                os.makedirs(screenshots_dir, exist_ok=True)

                filename = f"final{uuid.uuid1().hex}_passed.png"
                file_path = os.path.join(screenshots_dir, filename)
                await page.screenshot(path=file_path, full_page=True)
                screenshot_url = os.path.join(settings.MEDIA_URL, "screenshots", filename)
                results.append({
                    "action": action,
                    "value": raw_value,
                    "step_number": step_order + 1,
                    "status": "failed",
                    "error": str(exc),
                    "screenshot": screenshot_url,
                })
                # stop on first failure per your earlier flow
                break

        await browser.close()
    return results
