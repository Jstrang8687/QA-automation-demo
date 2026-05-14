const { Builder, By } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');
const path = require('path');

let options = new chrome.Options();
options.addArguments('--headless');
options.addArguments('--no-sandbox');
options.addArguments('--disable-dev-sh-usage');

async function takeScreenshot(driver, testName) {
    await driver.sleep(10000); // Ensure the page is fully loaded
    const screenshot = await driver.takeScreenshot();   
    const dir = 'screenshots';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    const filePath = path.join(dir, `${testName}-${Date.now()}.png`);
    fs.writeFileSync(filePath, screenshot, 'base64');
    console.log(`Screenshot saved: ${filePath}`);
}


test('Google search page loads', async () => {

    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    try {
        await driver.get('https://www.theimagineerdads.com');
        let title = await driver.getTitle();
        expect(title).toContain('Imagineer');
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
        await driver.sleep(2000); // Wait for navigation
        let url = await driver.getCurrentUrl();
        expect(url).not.toBe('https://www.theimagineerdad.com');
    } catch (err) {
        await takeScreenshot(driver, 'User_can_request_a_quote');
        throw err;
    } finally {
        await driver.quit();
    }
}, 30000);