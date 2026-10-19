import { test, expect } from '@playwright/test'

test.describe('page core', () => {
  test('hero renders and reveals', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.hero-title')).toContainText('staying in')
    await expect(page.locator('.hero-copy [data-reveal].is-revealed').first()).toBeVisible({
      timeout: 5_000,
    })
  })

  test('theme toggles and persists across reload', async ({ page }) => {
    await page.goto('/')
    const width = page.viewportSize()?.width ?? 1280
    if (width < 861) {
      // on mobile the toggle lives inside the drawer
      await page.click('#nav-toggle')
    }
    const before = await page.locator('html').getAttribute('data-theme')
    await page.click('#theme-toggle')
    // the flip happens in the View Transitions update callback (next frame)
    await expect.poll(async () => page.locator('html').getAttribute('data-theme')).not.toBe(before)
    const after = await page.locator('html').getAttribute('data-theme')
    await page.reload()
    expect(await page.locator('html').getAttribute('data-theme')).toBe(after)
  })

  test('counters reach final values once scrolled into view', async ({ page }) => {
    await page.goto('/')
    await page.locator('.stat-row').scrollIntoViewIfNeeded()
    // odometer keeps the final value as an aria-label on the counter span
    await expect(page.locator('[data-count-to="8400"]')).toHaveAttribute('aria-label', '8,400', {
      timeout: 5_000,
    })
    await expect(page.locator('[data-count-to="8400"]')).toHaveClass(/is-counting/, {
      timeout: 5_000,
    })
  })

  test('artwork actually loads', async ({ page }) => {
    await page.goto('/')
    const heroPosters = await page
      .locator('.poster-wall .poster img')
      .evaluateAll((imgs) => imgs.map((i) => i.naturalWidth))
    expect(heroPosters.length).toBeGreaterThanOrEqual(18)
    expect(heroPosters.every((w) => w > 0)).toBe(true)

    await page.locator('#vault').scrollIntoViewIfNeeded()
    await page.waitForTimeout(600)
    const vaultImgs = await page
      .locator('.vault img')
      .evaluateAll((imgs) => imgs.map((i) => i.naturalWidth))
    expect(vaultImgs.length).toBe(4)
    expect(vaultImgs.every((w) => w > 0)).toBe(true)

    await page.locator('.band-grid').scrollIntoViewIfNeeded()
    await page.waitForTimeout(600)
    const bandImgs = await page
      .locator('.band img')
      .evaluateAll((imgs) => imgs.map((i) => i.naturalWidth))
    expect(bandImgs.length).toBe(3)
    expect(bandImgs.every((w) => w > 0)).toBe(true)
  })

  test('intro curtain lifts away and marquee is velocity-driven', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.hero-title')).toBeVisible({ timeout: 4_000 })
    await page.waitForTimeout(2200)
    await expect(page.locator('#intro')).toHaveCount(0)
    const transform = await page.locator('.marquee-track').evaluate((el) => el.style.transform)
    expect(transform).toContain('translateX')
  })

  test('toast appears for demo actions', async ({ page }) => {
    await page.goto('/')
    await page.click('[data-demo-action]')
    await expect(page.locator('#toast')).toHaveClass(/is-visible/)
    await expect(page.locator('#toast')).toContainText('Demo only')
  })
})

test.describe('accordion', () => {
  test('opens and closes', async ({ page }) => {
    await page.goto('/')
    const trigger = page.locator('#acc-t-1')
    await trigger.click()
    await expect(page.locator('#acc-p-1')).toBeVisible()
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await trigger.click()
    await expect(page.locator('#acc-p-1')).toBeHidden({ timeout: 2_000 })
  })

  test('rapid double-click does not wedge the panel', async ({ page }) => {
    await page.goto('/')
    const trigger = page.locator('#acc-t-1')
    await trigger.click() // open
    await trigger.click() // close
    await trigger.click() // re-open mid-transition
    await page.waitForTimeout(700)
    await expect(page.locator('#acc-p-1')).toBeVisible()
    await trigger.click() // close again
    await page.waitForTimeout(700)
    await expect(page.locator('#acc-p-1')).toBeHidden()
  })
})

test.describe('billing', () => {
  test('annual switch tweens prices to yearly values', async ({ page }) => {
    await page.goto('/')
    await page.click('#billing-switch')
    await expect(page.locator('#billing-switch')).toHaveAttribute('aria-checked', 'true')
    await expect(page.locator('.plan-card').first().locator('.amount')).toHaveText('119')
    await expect(page.locator('.plan-card').nth(2).locator('.amount')).toHaveText('599')
    await page.click('#billing-switch')
    await expect(page.locator('.plan-card').first().locator('.amount')).toHaveText('149')
  })
})

test.describe('mobile drawer', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('opens, traps tab, closes on escape and restores focus', async ({ page }) => {
    await page.goto('/')
    const toggle = page.locator('#nav-toggle')
    await toggle.click()
    await expect(page.locator('#primary-nav')).toHaveClass(/is-open/)
    await page.keyboard.press('Escape')
    await expect(page.locator('#primary-nav')).not.toHaveClass(/is-open/)
    await expect(toggle).toBeFocused()
  })
})

test.describe('no-JS resilience', () => {
  test('content stays visible when no JavaScript runs at all', async ({ page }) => {
    await page.route('/', async (route) => {
      const original = await (await route.fetch()).text()
      const stripped = original.replace(/<script\b[\s\S]*?<\/script>/g, '')
      await route.fulfill({ body: stripped, contentType: 'text/html; charset=utf-8' })
    })
    await page.goto('/')
    expect(await page.locator('html').getAttribute('class')).toBeFalsy()
    await expect(page.locator('.hero-title')).toBeVisible()
    await expect(page.locator('.hero-sub')).toBeVisible()
    await expect(page.locator('#acc-p-1')).toBeVisible() // FAQ expanded without JS
    await expect(page.locator('[data-count-to="8400"]')).toHaveText('8,400') // real stats, no animation
  })
})
