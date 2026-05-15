const { Builder, By } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');
const path = require('path');

let options = new chrome.Options();
options.addArguments('--headless');
options.addArguments('--no-sandbox');
options.addArguments('--disable-dev-sh-usage');
options.addArguments('--window-size=1920,1080');  
options.addArguments('--force-device-scale-factor=1');

async function takeScreenshot(driver, testName) {
    await driver.sleep(10000); // Ensure the page is fully loaded
    const screenshot = await driver.takeScreenshot();   
    const dir = 'screenshots';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);

    // Date formatted as yyy-mm-dd_hh-mm-ss for better readability
    const now = new Date();
    const dateStr = now.toISOString()
        .replace('T', '_')
        .replace(/:/g, '-')
        .split('.')[0]; // Remove milliseconds

    const filePath = path.join(dir, `${testName}-${dateStr}.png`);
    fs.writeFileSync(filePath, screenshot, 'base64');
    console.log(`Screenshot saved: ${filePath}`);

    //Keep only the last 10 screenshots for this test name
    const allScreenshots = fs.readdirSync(dir)
        .filter(f => f.startsWith(testName) && f.endsWith('.png'))
        .sort(0;).reverse(); // Newest first

    if (allScreenshots.length > 10) {
        const toDelete = allScreenshots.slice(0, allScreenshots.length - 10);
        toDelete.forEach(f => {
            fs.unlinkSync(path.join(dir, f));
            console.log(`Deleted old screenshot: ${f}`);
        });
    }
}


test('Google search page loads', async () => {

    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    try {
        await driver.get('https://www.theimagineerdad.com');
        let title = await driver.getTitle();
        expect(title).toContain('Imagineer');
        await takeScreenshot(driver, 'Google_search_page_loads');
    } catch (err) {
         await takeScreenshot(driver, 'Google_search_page_loads');
        throw err;
    } finally {
        await driver.quit();
    }
}, 30000);

test('User can request a quote', async () => {

    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();
    try {
        await driver.get('https://www.theimagineerdad.com');
        let button = await driver.findElement(
            By.xpath('//*[contains(text(), "Request a Quote")]')
        );
        await button.click();
        await driver.sleep(10000); // Wait for navigation
        let url = await driver.getCurrentUrl();
        expect(url).not.toBe('https://www.theimagineerdad.com');
        await takeScreenshot(driver, 'User_can_request_a_quote');
    } catch (err) {
        await takeScreenshot(driver, 'User_can_request_a_quote');
        throw err;
    } finally {
        await driver.quit();
    }
}, 30000);