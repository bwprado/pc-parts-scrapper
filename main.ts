/// <reference lib="dom" />

import * as cheerio from 'npm:cheerio'
import puppeteer from 'npm:puppeteer'

async function test() {
  const store = 'https://www.kabum.com.br'
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto(
    `${store}/hardware/processadores?page_number=1&page_size=1000&facet_filters=&sort=most_searched`,
    {
      waitUntil: 'networkidle2'
    }
  )

  const products = await page.evaluate(() => {
    const store = 'https://www.kabum.com.br'
    return Array.from(document.querySelectorAll('article.productCard')).map(
      (card: Element) => {
        const name = card.querySelector('.nameCard')?.textContent?.trim() || ''
        const price =
          card.querySelector('.priceCard')?.textContent?.trim() || ''
        const oldPrice =
          card.querySelector('.oldPriceCard')?.textContent?.trim() || ''
        const tag =
          card
            .querySelector(
              '[class*="flex"][class*="items-center"][class*="relative"][class*="h-[20px]"]'
            )
            ?.textContent?.trim() || ''
        const image =
          card.querySelector('.imageCard')?.getAttribute('src') || ''
        const link = `${store}${
          card.querySelector('a.productLink')?.getAttribute('href') || ''
        }`
        return { name, price, oldPrice, tag, image, link }
      }
    )
  })

  console.log(products[0])
  console.log(products.length)
  await browser.close()
}

async function main() {
  try {
    const storeUrl = 'https://www.kabum.com.br/hardware/processadores'
    const response = await fetch(storeUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    })
    const html = await response.text()
    Deno.writeTextFileSync('html.txt', html)
    console.log(html.includes('productCard'))
    const $ = cheerio.load(html)
    const products = $('article .productCard')
    console.log(products.length)
    products.each((index, element) => {
      console.log(index)
      const product = $(element)
      console.log(product.text())
      const name = product.find('.nameCard').text().trim()
      const price = product.find('.priceCard').text().trim()
      console.log(`${index + 1}. ${name} - ${price}`)
    })
  } catch (error) {
    console.error(error)
  }
}

async function scrapeWithPagination() {
  const store = 'https://www.kabum.com.br'
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  let allProducts = []
  let pageNumber = 1
  let hasNextPage = true

  while (hasNextPage && pageNumber <= 5) {
    // Limit to 5 pages for safety
    console.log(`Scraping page ${pageNumber}...`)
    await page.goto(
      `${store}/hardware/processadores?page_number=${pageNumber}&page_size=20`,
      { waitUntil: 'networkidle2' }
    )

    const products = await page.evaluate((baseUrl) => {
      return Array.from(document.querySelectorAll('article.productCard')).map(
        (card: Element) => {
          const name =
            card.querySelector('.nameCard')?.textContent?.trim() || ''
          const price =
            card.querySelector('.priceCard')?.textContent?.trim() || ''
          const oldPrice =
            card.querySelector('.oldPriceCard')?.textContent?.trim() || ''
          const tag =
            card
              .querySelector(
                '[class*="flex"][class*="items-center"][class*="relative"][class*="h-[20px]"]'
              )
              ?.textContent?.trim() || ''
          const image =
            card.querySelector('.imageCard')?.getAttribute('src') || ''
          const link = `${baseUrl}${
            card.querySelector('a.productLink')?.getAttribute('href') || ''
          }`
          return { name, price, oldPrice, tag, image, link }
        }
      )
    }, store)

    allProducts = [...allProducts, ...products]

    // Check if there's a next page button that's not disabled
    const hasNext = await page.evaluate(() => {
      const nextButton = document.querySelector('[aria-label="Next page"]')
      return nextButton && !nextButton.hasAttribute('disabled')
    })

    hasNextPage = hasNext
    pageNumber++
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
