from django.test import TestCase
import os
from datetime import datetime
from django.conf import settings

# Create your tests here.
def generate_group_report(group_name, total_tests, passed, failed, results):
    """Generate a Playwright-style HTML report summarizing a group's testcases."""
    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    filename = f"group_report_{group_name.replace(' ', '_')}_{timestamp}.html"
    filepath = os.path.join(settings.MEDIA_ROOT, "reports", filename)
    os.makedirs(os.path.dirname(filepath), exist_ok=True)

    # Build the rows for each testcase
    rows = []
    for idx, tc in enumerate(results, 1):
        status_class = "passed" if tc["status"] == "passed" else "failed"
        error_info = ""

        if tc["status"] == "failed":
            failed_step = next((s for s in tc["result"] if s["status"] == "failed"), None)
            if failed_step:
                error_info = f"{failed_step.get('error', '')}"
        report_link = f"<a href='/media/{tc['report']}' target='_blank'>View Report</a>"
        print(tc['report'])

        rows.append(f"""
        <tr class="{status_class}">
            <td>{idx}</td>
            <td>{tc["testcase_name"]}</td>
            <td>{tc["status"].capitalize()}</td>
            <td>{error_info}</td>
            <td>{report_link}</td>
        </tr>
        """)

    html_content = f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Test Report — {group_name}</title>
    <style>
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 20px;
            background-color: #f0f4f8;
            color: #333;
        }}
        h1 {{
            color: #1e3a8a;
            border-bottom: 3px solid #3b82f6;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }}
        p {{
            font-size: 15px;
            margin: 10px 0;
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            background: #fff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }}
        th, td {{
            border: 1px solid #e2e8f0;
            padding: 12px 15px;
            text-align: left;
            font-size: 14px;
        }}
        th {{
            background-color: #2563eb;
            color: #fff;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }}
        tr:nth-child(even) {{
            background-color: #f8fafc;
        }}
        .passed {{
            background-color: #dcfce7;
            color: #065f46;
            font-weight: bold;
        }}
        .failed {{
            background-color: #fee2e2;
            color: #991b1b;
            font-weight: bold;
        }}
        .summary {{
            background-color: #fff;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            margin-bottom: 20px;
        }}
        .footer {{
            margin-top: 30px;
            font-size: 13px;
            color: #555;
        }}
        a {{
            color: #1e40af;
            text-decoration: none;
        }}
        a:hover {{
            text-decoration: underline;
        }}
    </style>
</head>
<body>
    <h1>Regression Test Report — {group_name}</h1>
    <div class="summary">
        <p><b>Total Tests:</b> {total_tests}</p>
        <p><b>Passed:</b> {passed}</p>
        <p><b>Failed:</b> {failed}</p>
        <p><b>Generated on:</b> {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}</p>
    </div>

    <table>
        <tr>
            <th>#</th>
            <th>Testcase Name</th>
            <th>Status</th>
            <th>Error</th>
            <th>Report</th>
        </tr>
        {''.join(rows)}
    </table>

    <div class="footer">
        <hr>
        # <p>Generated automatically by Playwright Test Runner</p>
    </div>
</body>
</html>
"""

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(html_content)

    return f"reports/{filename}"

