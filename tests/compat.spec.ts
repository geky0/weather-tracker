import { test, expect } from '@playwright/test'

test.describe('Weather Tracker cross-browser', () => {
  test('loads shell, map, and radar controls without page errors', async ({
    page,
    browserName,
  }) => {
    const pageErrors: string[] = []
    page.on('pageerror', (err) => pageErrors.push(String(err)))

    await page.goto('/')
    await expect(page.locator('.brand-title')).toBeVisible()
    await expect(page.locator('html')).toHaveAttribute('data-browser', /.+/);

    const map = page.locator('.leaflet-container')
    await expect(map).toBeVisible()
    await expect(page.locator('.leaflet-tile-pane img').first()).toBeVisible({
      timeout: 25_000,
    })

    const radar = page.locator('button.radar-toggle')
    await expect(radar).toBeVisible()
    await radar.click()
    await expect(radar).toHaveAttribute('aria-pressed', 'false')
    await radar.click()
    await expect(radar).toHaveAttribute('aria-pressed', 'true')

    await expect(page.locator('button.status-btn.status-btn-active')).toHaveText('Open')

    const mapBox = await map.boundingBox()
    expect(mapBox?.width ?? 0).toBeGreaterThan(200)
    expect(mapBox?.height ?? 0).toBeGreaterThan(200)

    await expect(page.locator('.app-header')).toBeVisible()
    await expect(page.locator('.map-legend')).toBeVisible()

    const fatal = pageErrors.filter(
      (e) => !/ResizeObserver|Script error|NetworkError/i.test(e),
    )
    expect(fatal, `${browserName} page errors: ${fatal.join(' | ')}`).toEqual([])
  })

  test('mobile layout keeps radar and map usable', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')
    await expect(page.locator('.brand-title')).toBeVisible()
    await expect(page.locator('.radar-controls')).toBeVisible()

    const map = page.locator('.leaflet-container')
    await expect(map).toBeAttached()
    const box = await map.boundingBox()
    expect(box?.width ?? 0).toBeGreaterThan(200)
    expect(box?.height ?? 0).toBeGreaterThan(200)
  })
})
