import os
from django.conf import settings


def generate_html_report(testcase_id, results):     
    """Generate a blue-themed HTML report and save it in MEDIA folder."""
    html_content = f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Test Run Report</title>
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
        @media (max-width: 768px) {{
            table, th, td {{
                font-size: 12px;
            }}
        }}
    </style>
</head>
<body>
    <h1>Test Run Report</h1>
    <p><strong>Testcase ID:</strong> {testcase_id}</p>

    <table>
        <tr>
            <th>Step #</th>
            <th>Action</th>
            <th>Value</th>
            <th>Status</th>
            <th>Error</th>
            <th>Screenshot</th>
        </tr>
        {''.join([
            f"<tr class='{step['status']}'>"
            f"<td>{step['step_number']}</td>"
            f"<td>{step['action']}</td>"
            f"<td>{step['value']}</td>"
            f"<td>{step['status'].capitalize()}</td>"
            f"<td>{step.get('error','')}</td>"
            f"<td>{f'<img src=\"{settings.MEDIA_URL}{step['screenshot']}\" width=\"150\" />' if 'screenshot' in step else ''}</td>"
            "</tr>"
            for step in results
        ])}
    </table>
</body>
</html>
"""


    # Save in MEDIA/reports/
    reports_dir = os.path.join(settings.MEDIA_ROOT, "reports")
    os.makedirs(reports_dir, exist_ok=True)

    file_path = os.path.join(reports_dir, f"report_testcase_{testcase_id}.html")
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(html_content)

    return  f"reports/report_testcase_{testcase_id}.html"

