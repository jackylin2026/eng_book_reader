import path from 'node:path'
import fs from 'node:fs'

import { expect, test } from '@playwright/test'

const repoMobiFixture = path.resolve('ebooks/Steve Jobs.mobi')
const repoAzw3Fixture = path.resolve('ebooks/Steve Jobs.azw3')
const mobiFixture = process.env.E2E_MOBI_FILE ?? (fs.existsSync(repoMobiFixture) ? repoMobiFixture : undefined)
const azw3Fixture =
  process.env.E2E_AZW3_FILE ?? (fs.existsSync(repoAzw3Fixture) ? repoAzw3Fixture : undefined)

test('loads library route', async ({ page }) => {
  await page.goto('/library')
  await expect(page.getByText('Import Ebook')).toBeVisible()
})

test('imports MOBI and opens reader', async ({ page }) => {
  test.skip(!mobiFixture, 'Place ebooks/Steve Jobs.mobi in the repo or set E2E_MOBI_FILE')

  await page.goto('/library')
  await page.setInputFiles('input[type="file"]', path.resolve(mobiFixture!))
  await expect(page.getByText('Back to library')).toBeVisible({ timeout: 30000 })
})

test('imports AZW3 and shows reader controls', async ({ page }) => {
  test.skip(!azw3Fixture, 'Place ebooks/Steve Jobs.azw3 in the repo or set E2E_AZW3_FILE')

  await page.goto('/library')
  await page.setInputFiles('input[type="file"]', path.resolve(azw3Fixture!))
  await expect(page.getByText('Pagination')).toBeVisible({ timeout: 30000 })
})
