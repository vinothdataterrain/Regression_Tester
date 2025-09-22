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
        log("Step 4: Clicking Sign In button...")
        page.click("button:has-text('SIGN IN')")
        take_screenshot(page, "Sign In button clicked")
        
        # Step 5
        log("Step 5: Waiting for dashboard to load...")
        page.wait_for_timeout(5000)  # Wait 5 seconds
        take_screenshot(page, "Dashboard loaded after wait")
        
        # Step 6
        log("Step 6: Navigating to Client Chart for first row...")
        table_row = page.locator("table tbody tr").first
        table_row.locator("a[aria-label='Go to Client Chart']").first.click()
        page.wait_for_timeout(5000)
        take_screenshot(page, "Client Chart opened for first row")
        

        # Step 7
        log("Step 7: Add New Social Vital Signs clicked")
        page.locator(
            "div:has-text('Social Vital Signs') >> xpath=ancestor::div[contains(@class,'flex justify-between')] >> a:has-text('Add New')"
        ).first.click()
        # Wait for page/network to stabilize
        page.wait_for_load_state('networkidle')
        page.wait_for_timeout(5000)
        take_screenshot(page, "Add New Social Vital Signs clicked")


        # Step 8
        log("Step 8: Selecting the section")
        page.locator("div[id='4']").click()  # Use the div id for Depression
        take_screenshot(page, "first section selected")

        # Step 9
        log("Step 9: Filling questions")
        page.click("div.optionalQuestion:has-text('Do you have a personal phone where we can easily reach you?')")
        page.check("input#user_phone-Yes")
        take_screenshot(page, "Questions filled")
        page.click("div.optionalQuestion:has-text('Over the past year, did you ever have difficulty going to work, school, shopping, or an appointment, because the lack of convenient transportation?')")
        page.check("input#difficulty_transportation-Once\\ or\\ Twice")
        take_screenshot(page, "Questions filled")
        page.click("div.optionalQuestion:has-text('Is there someone now that you can depend on if you ever needed help to do a task, like getting a ride somewhere, or help with shopping or cooking a meal?')")
        page.check("input#help_available-No")
        page.wait_for_timeout(5000)
        take_screenshot(page, "Questions filled")

        # Step 10
        log("Step 10: Clicking submit button...")
        page.click("button:has-text('Submit')")
        page.wait_for_timeout(5000)
        take_screenshot(page, "4. submit button clicked")



                
        log("✅Added social vital signs successfully!")
        
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
