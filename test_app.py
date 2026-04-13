from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    
    # 导航到应用
    page.goto('http://localhost:8080')
    page.wait_for_load_state('networkidle')
    
    # 截图查看初始状态
    page.screenshot(path='/tmp/initial.png', full_page=True)
    
    # 检查页面标题
    print(f"页面标题: {page.title()}")
    
    # 检查是否显示首次引导
    onboarding_overlay = page.locator('#onboarding-overlay')
    if onboarding_overlay.is_visible():
        print("首次引导已显示")
        # 点击下一步按钮
        for i in range(3):
            next_button = page.locator('#onboarding-next')
            if next_button.is_visible():
                next_button.click()
                page.wait_for_timeout(1000)
        # 点击开始使用按钮
        finish_button = page.locator('#onboarding-finish')
        if finish_button.is_visible():
            finish_button.click()
            page.wait_for_timeout(1000)
    
    # 检查空状态界面
    empty_state = page.locator('.empty-state')
    if empty_state.is_visible():
        print("空状态界面已显示")
        # 点击添加按钮
        add_button = page.locator('.empty-btn')
        if add_button.is_visible():
            add_button.click()
            page.wait_for_timeout(1000)
            
            # 测试添加关系表单
            name_input = page.locator('#name-input')
            if name_input.is_visible():
                name_input.fill('测试用户')
                
                # 选择关系类型
                type_option = page.locator('.type-option').first
                if type_option.is_visible():
                    type_option.click()
                    
                    # 选择关系等级
                    level_option = page.locator('.level-option').nth(2)
                    if level_option.is_visible():
                        level_option.click()
                        
                        # 点击添加按钮
                        submit_button = page.locator('.btn-primary')
                        if submit_button.is_visible():
                            submit_button.click()
                            page.wait_for_timeout(1000)
    
    # 检查关系卡片
    relationship_cards = page.locator('.relationship-card')
    if relationship_cards.count() > 0:
        print(f"找到 {relationship_cards.count()} 个关系卡片")
        # 点击第一个卡片
        first_card = relationship_cards.first
        first_card.click()
        page.wait_for_timeout(1000)
        
        # 检查详情页面
        detail_modal = page.locator('#detail-modal')
        if detail_modal.is_visible():
            print("详情页面已显示")
            # 关闭详情页面
            close_button = page.locator('#detail-modal .modal-close')
            if close_button.is_visible():
                close_button.click()
                page.wait_for_timeout(1000)
    
    # 检查快速记录温度功能
    quick_buttons = page.locator('.quick-btn')
    if quick_buttons.count() > 0:
        print(f"找到 {quick_buttons.count()} 个快速操作按钮")
        # 点击第一个快速记录按钮
        quick_button = quick_buttons.nth(0)
        quick_button.click()
        page.wait_for_timeout(1000)
        
        # 检查快速记录模态框
        quick_modal = page.locator('#quick-modal')
        if quick_modal.is_visible():
            print("快速记录模态框已显示")
            # 选择温度变化
            temp_option = page.locator('.temp-option').nth(2)
            if temp_option.is_visible():
                temp_option.click()
                
                # 点击记录按钮
                record_button = page.locator('#quick-content .btn-primary')
                if record_button.is_visible():
                    record_button.click()
                    page.wait_for_timeout(1000)
    
    # 检查浮动添加按钮
    floating_button = page.locator('.floating-btn')
    if floating_button.is_visible():
        print("浮动添加按钮已显示")
        # 点击浮动按钮
        floating_button.click()
        page.wait_for_timeout(1000)
        
        # 关闭添加模态框
        close_button = page.locator('#add-modal .modal-close')
        if close_button.is_visible():
            close_button.click()
            page.wait_for_timeout(1000)
    
    # 截图最终状态
    page.screenshot(path='/tmp/final.png', full_page=True)
    
    # 检查控制台日志
    console_logs = page.console.logs()
    if console_logs:
        print("控制台日志:")
        for log in console_logs:
            print(f"  {log.text}")
    else:
        print("没有控制台错误")
    
    browser.close()
    print("测试完成")