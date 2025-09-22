from playwright.sync_api import sync_playwright

log("🎬 Starting login and category creation automation...")

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page()
    
    try:
        # Step 1: Navigate to login page
        log("Step 1: 🌐 Navigating to login page...")
        page.goto("https://gridpolaris-test.socialroots-test.net/login")
        page.wait_for_load_state('networkidle')
        take_screenshot(page, "1. Login page loaded")
        
        # Step 2: Fill email field
        log("Step 2: ✏️ Filling email field...")
        page.fill("input[type='email']", "admin@socialroots.ai")
        take_screenshot(page, "2. Email field filled")
        
        # Step 3: Fill password field
        log("Step 3: ✏️ Filling password field...")
        page.fill("input[type='password']", "Data@123")
        take_screenshot(page, "3. Password field filled")
        
        # Step 4: Click login button
        log("Step 4: 👆 Clicking login button...")
        page.click("button:has-text('Login')")
        take_screenshot(page, "4. Login button clicked")
        
        # Step 5: Wait for dashboard to load
        log("Step 5: ⏳ Waiting for dashboard to load...")
        page.wait_for_timeout(6000)  # Wait 6 seconds
        take_screenshot(page, "5. Dashboard loaded after wait")
        
        # Step 6: Click on menu/navigation icon
        log("Step 6: 👆 Clicking navigation menu...")
        page.click("svg.mr-2.cursor-pointer")
        page.wait_for_timeout(1000)  # Small wait for menu to appear
        take_screenshot(page, "6. Navigation menu opened")
        
        # Step 7: Click on category option
        log("Step 7: 👆 Clicking on category menu item...")
        page.click("li:has-text('category')")
        page.wait_for_timeout(2000)  # Wait for category page to load
        take_screenshot(page, "7. Category page loaded")
        
        # Step 8: Click Add Category button
        log("Step 8: 👆 Clicking Add Category button...")
        page.click("button:has-text('Add Category')")
        page.wait_for_timeout(1000)  # Wait for form to appear
        take_screenshot(page, "8. Add Category form opened")
        
        # Step 9: Fill category name
        log("Step 9: ✏️ Filling category name...")
        page.fill("input[name='category_name']", "scripts flow test 1")
        take_screenshot(page, "9. Category name filled")
        
        # Step 10: Fill description
        log("Step 10: ✏️ Filling description...")
        page.fill("#message", "Description")
        take_screenshot(page, "10. Description filled")
        
        # Step 11: Save the category
        log("Step 11: 💾 Clicking Save button...")
        page.click("button:has-text('Save')")
        page.wait_for_timeout(3000)  # Wait for save operation
        take_screenshot(page, "11. Category saved successfully")
        
        log("✅ Login and category creation completed successfully!")
        
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