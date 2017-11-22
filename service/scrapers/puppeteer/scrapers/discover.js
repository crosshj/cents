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

    const balanceSelector = '.current-balance.main-money';
    await page.waitFor(balanceSelector);
    var balance = await page.$eval(balanceSelector, el => el.innerText);
    balance = balance.replace(',', '');

    const pendingRowsSelector = '#pending-transction .row-details';
    await page.waitFor(pendingRowsSelector);
    const pendingTransactions = await page.$$eval(pendingRowsSelector, rows => 
      rows.map(row => ({
        date: row.children[1].innerText.trim(),
        description: row.children[2].innerText.trim(),
        status: row.children[3].innerText.trim(),
        amount: row.children[4].innerText.trim().replace('$', '').replace(',', '')
      })
    ));

    const postedRowsSelector = '#posted-transction .row-details';
    await page.waitFor(postedRowsSelector);
    const postedTransactions = await page.$$eval(postedRowsSelector, rows => 
      rows.map(row => ({
        date: row.children[1].innerText.trim(),
        description: row.children[2].innerText.trim(),
        status: row.children[3].innerText.trim(),
        amount: row.children[4].innerText.trim().replace('$', '').replace(',', '')
      })
    ));

    const transactions = pendingTransactions.concat(postedTransactions);

    await browser.close();
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
