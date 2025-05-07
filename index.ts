import * as cheerio from "cheerio";

import { gotScrapping } from "got-scraping";

const storeUrl = "https://www.kabum.com.br/processadores";

const response = await gotScrapping(storeUrl)

const html = response.body;

const $ = cheerio.load(html);

const products = $(".product-wrapper");

console.log(products);
