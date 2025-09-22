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
        log("Step 7: Clicking Add new care plan")
        page.locator("div.flex.justify-between.p-3:has(div:has-text('Care Plan'))").locator("a:has-text('Add New')").click()
        page.wait_for_load_state('networkidle')
        take_screenshot(page, "Add Care Plan clicked")

        # Step 8
        log("Step 8: Clicking Select Program field")
        page.click("input[aria-label='Program']")
        page.wait_for_timeout(3000)
        page.click("div.react-select__option:has-text('Depression Counselling')")
        take_screenshot(page, "Program selected")


        # Step 9
        log("Step 9: Clicking Select Care plan template field")
        page.click("input[aria-label='Care Plan Template']")
        page.wait_for_timeout(6000)
        page.click("div.react-select__option:has-text('check-123')")
        take_screenshot(page, "Care plan template selected")

        # Step 10
        log("Step 10: Clicking add care plan button...")
        page.click("button:has-text('Add Care Plan')")
        take_screenshot(page, "4. add care plan button clicked")

        
        # Step 11
        log("Step 11: Clicking select staff facility field")
        page.click("input[aria-label='Staff Facility']")
        page.wait_for_timeout(3000)
        page.click("div.react-select__option:has-text('Home Health Care Agency')")
        take_screenshot(page, "staff facility field selected")

        # Step 12
        log("Step 12: filling created date field")
        page.fill("input[aria-label='Created Date']", "09/18/2025")
        take_screenshot(page, "Created Date field filled")

        # Step 13
        log("Step 13: filling care plan summary description field")
        page.fill("textarea[aria-label='summary']", "care plan summary description")
        take_screenshot(page, "Care Plan Summary filled")


        # Step 14
        log("Step 4: Clicking save button...")
        page.click("button:has-text('Save')")
        page.wait_for_timeout(3000)
        take_screenshot(page, "4. save button clicked")



                
        log("✅ Login and add care plan flow completed successfully!")
        
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
