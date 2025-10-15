/// <reference lib="dom" />

import * as cheerio from 'npm:cheerio'
import puppeteer from 'npm:puppeteer'

interface Product {
  name: string
  price: string
  oldPrice: string
  tag: string
  image: string
  link: string
  category: string
}

const WEBSITES = [
  ['processadores', 'https://www.kabum.com.br/hardware/processadores'],
  ['placas-de-video', 'https://www.kabum.com.br/hardware/placas-de-video'],
  ['placas-mae', 'https://www.kabum.com.br/hardware/placas-mae'],
  ['memorias', 'https://www.kabum.com.br/hardware/memorias'],
  ['armazenamento', 'https://www.kabum.com.br/hardware/armazenamento'],
  ['fontes', 'https://www.kabum.com.br/hardware/fontes'],
  ['coolers', 'https://www.kabum.com.br/hardware/coolers'],
  ['gabinetes', 'https://www.kabum.com.br/hardware/gabinetes'],
  ['perifericos', 'https://www.kabum.com.br/hardware/perifericos'],
  ['placas-de-video', 'https://www.kabum.com.br/hardware/placas-de-video']
]

const getTextContent = (element: Element, selector: string) => {
  return element.querySelector(selector)?.textContent?.trim() || ''
}

async function scrapeWithPagination() {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  let allProducts: any[] = []
  let pageNumber = 1
  let hasNextPage = true

  for (const [category, url] of WEBSITES) {
    while (hasNextPage && pageNumber <= 5) {
      // Limit to 5 pages for safety
      console.log(`Scraping page ${pageNumber} of ${category}, on ${url}...`)
      await page.goto(
        `${url}?page_number=${pageNumber}&page_size=20&page_size=100`,
        { waitUntil: 'networkidle2' }
      )

      const products = await page.evaluate((baseUrl) => {
        return Array.from(document.querySelectorAll('article.productCard')).map(
          (card: Element) => {
            const name = getTextContent(card, '.nameCard')
            const price = getTextContent(card, '.priceCard')
            const oldPrice = getTextContent(card, '.oldPriceCard')
            const tag = getTextContent(
              card,
              '[class*="flex"][class*="items-center"][class*="relative"][class*="h-[20px]"]'
            )
            const image = getTextContent(card, '.imageCard')
            const link = getTextContent(card, 'a.productLink')
            return { name, price, oldPrice, tag, image, link }
          }
        )
      }, url)

      allProducts = [...allProducts, ...products]

      // Check if there's a next page button that's not disabled
      const hasNext = await page.evaluate(() => {
        const nextButton = document.querySelector('[aria-label="Next page"]')
        return nextButton && !nextButton.hasAttribute('disabled')
      })

      hasNextPage = hasNext
      pageNumber++
    }
  }

  console.log(`Total products scraped: ${allProducts.length}`)
  await browser.close()
  return allProducts
}

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  // main()
  scrapeWithPagination()
}
