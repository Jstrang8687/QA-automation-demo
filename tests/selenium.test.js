const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

test('Google search page loads', async () => {
    let options = new chrome.Options();
    options.addArguments('--headless');
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-sh-usage');

    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    try {
        await driver.get('https://www.theimagineerdad.com');
        let title = await driver.getTitle();
        expect(title).toContain('Imagineer');
    } finally {
        await driver.quit();
    }
}, 30000);

test('User can request a quote', async () => {
    let options = new chrome.Options();
        options.addArguments('--headless');
        options.addArguments('--no-sandbox');
        options.addArguments('--disable-dev-sh-usage');

    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    await driver.get('https://www.theimagineerdad.com');

    let button = await driver.findElement(
        By.linkText('Request a Free Quote')
    );
    await button.click();

    let url = await driver.getCurrentUrl();
    expect(url).not.toBe('https://www.theimagineerdad.com');
}, 30000);