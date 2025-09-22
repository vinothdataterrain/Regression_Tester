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
        log("Step 6: Clicking Clients from dashboard...")
        page.click("span:has-text('Clients')")
        take_screenshot(page, "Clients button clicked")
        

        # Step 7
        log("Step 7: Clicking Add New button...")
        page.click("span:has-text('Add New')")
        take_screenshot(page, "Add New button clicked")

        # Step 8
        log("Step 8: Filling First Name field...")
        page.fill("input[aria-label='First Name']", "Steve")
        take_screenshot(page, "First Name field filled")

        # Step 9
        log("Step 9: Filling Last Name field...")
        page.fill("input[aria-label='Last Name']", "Smith")
        take_screenshot(page, "Last Name field filled")

        # Step 10
        log("Step 10: Filling Nick/Preferred Name field...")
        page.fill("input[aria-label='Nick/Preferred Name']", "Steve")
        take_screenshot(page, "Nick/Preferred Name field filled")

        # Step 11
        log("Step 11: Filling Date of Birth field...")
        page.fill("input[aria-label='Date of Birth']", "09/22/1997")
        take_screenshot(page, "Date of Birth field filled")

        # Step 12
        log("Step 12: Clicking save button...")
        page.click("button:has-text('Save')")
        page.wait_for_timeout(5000)
        take_screenshot(page, "4. save button clicked")



                
        log("✅ Login and Add Client flow done successfully!")
        
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
