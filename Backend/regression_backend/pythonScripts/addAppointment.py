from playwright.sync_api import sync_playwright

log("🎬 Starting login and category creation automation...")

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page()
    
    try:
        # Step 1
        log("Step 1: Navigating to login page...")
        page.goto("https://cchms.socialroots-dev.net/")
        page.wait_for_load_state('networkidle')
        take_screenshot(page, "Login page loaded")
        
        # Step 2
        log("Step 2: Filling email field...")
        page.fill("#login-email-address", "nickrichardson@cchms.org")
        take_screenshot(page, "Email field filled")
        
        # Step 3
        log("Step 3: Filling password field...")
        page.fill("#login-password", "Clinic1234$")
        take_screenshot(page, "Password field filled")
        
        # Step 4
        log("Step 4: Clicking login button...")
        page.click("button:has-text('SIGN IN')")
        take_screenshot(page, "Login button clicked")
        
        # Step 5
        log("Step 5: Waiting for dashboard to load...")
        page.wait_for_timeout(5000)  # Wait 5 seconds
        take_screenshot(page, "Dashboard loaded after wait")
        
        # Step 6
        log("Step 6: Navigating to Client Chart")
        table_row = page.locator("table tbody tr").first
        table_row.locator("a[aria-label='Go to Client Chart']").first.click()
        page.wait_for_timeout(5000)
        take_screenshot(page, "Client Chart opened")
        

        # Step 7
        log("Step 7: Adding new appointment")
        appointments_add_new = page.locator("div.flex.justify-between.p-3:has-text('Appointments') >> a:has-text('Add New')").filter(has_not=page.locator("[aria-disabled='true']"))
        appointments_add_new.first.click()
        page.wait_for_load_state('networkidle')
        take_screenshot(page, "Add Appointments clicked")

        # Step 8
        log("Step 8: filling questions under appointment section")
        page.click("input[aria-label='Staff Facility']")
        page.wait_for_timeout(3000)
        page.click("div.react-select__option:has-text('Home Health Care Agency')")
        take_screenshot(page, "Select Staff Facility clicked")

        # Step 9
        log("Step 9: Selecting programs field")
        page.click("input[aria-label='Program']")
        page.wait_for_timeout(3000)
        page.click("div.react-select__option:has-text('Depression Counselling')")
        take_screenshot(page, "Program field selected")

        # Step 10
        log("Step 10: filling Start time field")
        page.fill("input[name='start_time']", "09/20/2025 10:00 AM")
        take_screenshot(page, "start time field filled")
    

        # Step 11
        log("Step 11: filling duration field")
        page.fill("input[name='duration']", "01:30")
        take_screenshot(page, "duration field filled")

        # Step 12
        log("Step 4: Clicking save button...")
        page.click("button:has-text('Save')")
        page.wait_for_timeout(5000)
        take_screenshot(page, "4. save button clicked")



                
        log("✅ Login and Appointment flow done successfully!")
        
    except Exception as e:
        log(f"❌ Test failed: {str(e)}")
        take_screenshot(page, f"ERROR: {str(e)}")
        
        # Additional debugging info
        current_url = page.url
        log(f"Current URL when error occurred: {current_url}")
        
        # Try to capture any error messages on page
        try:
            error_elements = page.locator('.error, .alert-error, [role="alert"]').all()
            if error_elements:
                for i, elem in enumerate(error_elements):
                    if elem.is_visible():
                        error_text = elem.inner_text()
                        log(f"Error message {i+1}: {error_text}")
        except:
            pass
            
        raise
    
    finally:
        log("🔚 Closing browser...")
        browser.close()

log("🎉 Complete automation workflow finished!")
