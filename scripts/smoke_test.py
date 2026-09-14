"""Smoke-test the landing page: console errors, preloader exit, hero render, theme flip, footer."""
from playwright.sync_api import sync_playwright

errors = []

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 900})
    page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
    page.on("pageerror", lambda e: errors.append(str(e)))

    page.goto("http://localhost:5173", wait_until="networkidle")

    # 1. Preloader should exit and remove itself
    page.wait_for_timeout(4500)
    preloader_gone = page.evaluate("document.querySelector('.preloader') === null")
    print(f"preloader removed: {preloader_gone}")

    # 2. Hero title rendered with words in place
    hero_visible = page.evaluate("getComputedStyle(document.querySelector('.hs-title-word span')).transform")
    print(f"hero title transform: {hero_visible}")

    # 3. Nav items faded in
    nav_op = page.evaluate("getComputedStyle(document.querySelector('.nav-item')).opacity")
    print(f"nav item opacity: {nav_op}")

    # 4. Scroll to final CTA -> theme should flip to dark
    page.evaluate("document.querySelector('#final-cta').scrollIntoView()")
    page.wait_for_timeout(2500)
    mode = page.evaluate("document.documentElement.getAttribute('data-color-mode')")
    print(f"color mode at final CTA: {mode}")

    # 5. Footer wordmark spans exist
    wm = page.evaluate("document.querySelectorAll('.footer-wordmark span').length")
    print(f"footer wordmark spans: {wm}")

    # Screenshots for visual check
    page.evaluate("window.scrollTo(0, 0)")
    page.wait_for_timeout(1200)
    page.screenshot(path="/tmp/shot_hero.png")

    page.screenshot(path="/tmp/shot_final.png")

    browser.close()

print("console errors:", errors if errors else "none")
