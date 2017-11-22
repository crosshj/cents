const puppeteer = require('puppeteer');
var debug = require('debug')('scrape:discover');

var getPrivateInfo = undefined;

function scrapeDiscover(callback){
  debug('discover scrape start...');
  (async () => {
    const browser = await puppeteer.launch({
        devtools: true,
        slowMo: 0
    });

    debug('first page');
    const pages = await browser.pages();
    const page = pages[0];
    await page.goto(getPrivateInfo.url());
  
    const usernameField = '#userid-content';
    const passwordField = '#password-content';
    const loginButton = '#log-in-button';
  
    await page.waitFor(loginButton);
    const loginButtonHandle = await page.$(loginButton);
    const usernameHandle = await page.$(usernameField);
    await usernameHandle.click();
    await usernameHandle.type(getPrivateInfo.username(), {delay: 100});    
    const passwordHandle = await page.$(passwordField);
    await passwordHandle.click();
    await passwordHandle.type(getPrivateInfo.password(), {delay: 100});    
    //await loginButtonHandle.click();
    await passwordHandle.press('Enter');

    debug('might be two-factor auth issue here');

    //$('.current-balance.main-money')[0].innerText
    const balance = 0;

    const transactions = [];


    //await browser.close();
    callback(undefined, {
        balance, transactions
    });
  })();
}

function getScraper(privateI){
  getPrivateInfo = privateI;
  return scrapeDiscover;
}

module.exports = getScraper;
