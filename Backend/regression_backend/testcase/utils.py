import os
from django.conf import settings
from rest_framework.pagination import PageNumberPagination


class SetPagination(PageNumberPagination):
    page_size = 5
    max_page_size = 50


def generate_html_report(testcase_id, results):     
    """Generate a blue-themed HTML report and save it in MEDIA folder."""
    path_url = None
    if 'path' in results[-1]:
        path_url = results[-1]['path']
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
        .bttn{{
            color: #dcfce7;
            background-color: #065f46;
            font-weight: bold; 
            }}
        @media (max-width: 768px) {{
            table, th, td {{
                font-size: 12px;
            }}
        }}
        
        /* Modal styles */
        .modal {{
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.8);
            backdrop-filter: blur(5px);
        }}
        
        .modal-content {{
            margin: auto;
            display: block;
            width: 90%;
            max-width: 800px;
            max-height: 90%;
            object-fit: contain;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }}
        
        .close {{
            position: absolute;
            top: 15px;
            right: 35px;
            color: #fff;
            font-size: 40px;
            font-weight: bold;
            cursor: pointer;
            z-index: 1001;
        }}
        
        .close:hover,
        .close:focus {{
            color: #bbb;
            text-decoration: none;
        }}
        
        .screenshot-thumbnail {{
            cursor: pointer;
            transition: transform 0.2s ease;
            border-radius: 4px;
        }}
        
        .screenshot-thumbnail:hover {{
            transform: scale(1.05);
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
            f"<td>{step['step_number'] if 'step_number' in step else ''}</td>"
            f"<td>{step['action']}</td>"
            f"<td>{step['value'] if 'value' in step else ''}</td>"
            f"<td>{step['status'].capitalize()}</td>"
            f"<td>{step.get('error','') if 'error' in step else ''}</td>"
            f"<td>{f'<img src=\"{step['screenshot']}\" width=\"150\" class=\"screenshot-thumbnail\" onclick=\"openModal(this)\" />' if 'screenshot' in step else ''}</td>"
            "</tr>"
            for step in results if 'action' in step
        ])}
    </table>
      {'<div><button class="bttn"><a href="' + path_url + '">View Path</a></button></div>' if path_url else ''}

    <!-- Modal for screenshot display -->
    <div id="screenshotModal" class="modal">
        <span class="close">&times;</span>
        <img class="modal-content" id="modalImage">
    </div>

    <script>
        // Get the modal
        var modal = document.getElementById('screenshotModal');
        
        // Get the image and insert it inside the modal
        var modalImg = document.getElementById("modalImage");
        
        // Function to open modal
        function openModal(img) {{
            modal.style.display = "block";
            modalImg.src = img.src;
        }}
        
        // Get the <span> element that closes the modal
        var span = document.getElementsByClassName("close")[0];
        
        // When the user clicks on <span> (x), close the modal
        span.onclick = function() {{
            modal.style.display = "none";
        }}
        
        // When the user clicks anywhere outside of the modal, close it
        window.onclick = function(event) {{
            if (event.target == modal) {{
                modal.style.display = "none";
            }}
        }}
        
        // Close modal with Escape key
        document.addEventListener('keydown', function(event) {{
            if (event.key === 'Escape') {{
                modal.style.display = "none";
            }}
        }});
    </script>
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

