import * as cheerio from 'npm:cheerio'

import { gotScraping } from 'npm:got-scraping'

const storeUrl = 'https://www.kabum.com.br/hardware/processadores'

const response = await gotScraping(storeUrl)

const html = response.body

const $ = cheerio.load(html)

const products = $('article .productCard')

products.each((index, element) => {
  const product = $(element)
  const name = product.find('.nameCard').text().trim()
  const price = product.find('.priceCard').text().trim()
  console.log(`${index + 1}. ${name} - ${price}`)
})
