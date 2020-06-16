const express = require('express');
const port = process.env.PORT || 5000;
const app = express();
const puppeteer = require('puppeteer');

app.get('/api/search', async function (req, res) {
    const { s } = req.query;
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.goto(`https://kisscartoon.nz/Search/?s=${s}`);
    await page.waitForSelector('a.item_movies_link');
    const links = await page.evaluate(`
        Array.from(document.querySelectorAll('a.item_movies_link')).map((link) => {
            return {
               title: link.textContent,
               url: link.href
            }
        });
    `);
    res.send(JSON.stringify(links));
    await browser.close();
});

app.get('/api/episodes', async function (req, res) {
    const { url } = req.query;
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.goto(url);
    await page.waitForSelector('div.listing a');
    const links = await page.evaluate(`
        const src = document.querySelector('div.a_center img').src;
        Array.from(document.querySelectorAll('div.listing a')).map((link) => {
            return {
               title: link.textContent,
               url: link.href,
               img: src
            }
        });
    `);
    res.send(JSON.stringify(links));
    await browser.close();
});

app.get('/api/play', async function (req, res) {
    const { url } = req.query;
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.goto(url + "&s=oserver");
    res.send((await page.waitForRequest(req => req.url().includes('m3u8'))).url());
    await browser.close();
});

app.listen(port, () => {
    console.log(`\x1b[0;32mListening on port ${port}\x1b[0m`)
});