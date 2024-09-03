import puppeteer from 'puppeteer';
import { startFlow } from 'lighthouse';
import { writeFileSync } from 'fs';

async function main() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const flow = await startFlow(page);

  try {
    await flow.navigate('http://localhost:3000/U1/place');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for 2 seconds
    await page.waitForSelector('#panzoom', { visible: true, timeout: 10000 });
    await page.click('#panzoom');
    await page.screenshot({ path: './Results/post-panandzoom.png' });
    await flow.snapshot({ stepName: 'After Pan and zoom' });

    await flow.navigate('http://localhost:3000/directions');
    await page.waitForSelector('#direct', { visible: true, timeout: 10000 });
    await page.click('#direct');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for 2 seconds
    await page.screenshot({ path: './Results/post-route-calculation.png' });
    await flow.snapshot({ stepName: 'After Route Calculation' });

    await flow.navigate('http://localhost:3000/search');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for 2 seconds

    // Debugging: Ensure the search box is available
    const searchBox = await page.$('input.search-box');
    if (searchBox) {
      await page.type('input.search-box', 'Dublin');
      await page.keyboard.press('Enter'); // Simulate pressing the "Enter" key

      // Wait for search results to appear
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for 2 seconds
      await page.screenshot({ path: './Results/post-search-results.png' });
      await flow.snapshot({ stepName: 'After Search Results' });
    } else {
      console.error('Search box not found.');
    }

  } catch (error) {
    console.error('Error during interaction:', error);
  }

  try {
    // Generate and save the Lighthouse report
    const report = await flow.generateReport();
    writeFileSync('./Results/report.html', report);

  } catch (error) {
    console.error('Error generating Lighthouse report:', error);
  } finally {
    // Ensure the browser closes regardless of what happens
    await browser.close();
  }
}

main().catch(console.error);
