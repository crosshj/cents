const puppeteer = require('puppeteer');
const getPrivateInfo = require('../../utilities/getPrivateInfo').usaa();

(async () => {
  const browser = await puppeteer.launch({
      headless: true,
      slowMo: 0 // slow down by 250ms
  });

  // first page
  const page = await browser.newPage();
  await page.goto('https://mobile.usaa.com');
  const loginButtonHandle = await page.$('.button-logon');
  await loginButtonHandle.tap();

  // second page
  await page.waitFor('#input_onlineid');
  const usernameHandle = await page.$('#input_onlineid');
  await usernameHandle.tap();
  await usernameHandle.type(getPrivateInfo.username(), {delay: 100});

  const passwordHandle = await page.$('#input_password');
  await passwordHandle.tap();
  await passwordHandle.type(getPrivateInfo.password(), {delay: 100});
  await passwordHandle.press('Enter');

  // third page
  await page.waitFor('#pinTextField');
  const pinHandle = await page.$('#pinTextField');
  await pinHandle.tap();
  await pinHandle.type(getPrivateInfo.pin(), {delay: 100});
  await pinHandle.press('Enter');

  // fourth page
  await page.waitFor('#securityQuestionTextField');
  const question = await page.$eval('label[for=securityQuestionTextField]', el => el.innerText)
  const answer = getPrivateInfo.answer(question);
  const questionFieldHandle = await page.$('#securityQuestionTextField');
  await questionFieldHandle.tap();
  await questionFieldHandle.type(answer, {delay: 100});
  await questionFieldHandle.press('Enter');

  // fifth
  await page.waitFor('#menu #ma');
  const myAccountsMenuHandle = await page.$('#menu #ma');
  myAccountsMenuHandle.tap();

  // sixth
  await page.waitFor('.acct-group-list .acct-group-row:first-child .acct-name');
  const firstAccountHandle = await page.$('.acct-group-list .acct-group-row:first-child .acct-name');
  firstAccountHandle.tap();

  // seventh
  // all transactions
  await page.waitFor('.details:nth-of-type(n+8)');
  const transactions = await page.evaluate(() =>
    Array.from(document.querySelectorAll('.details:nth-of-type(n+8)'))
      .map(el => ({
        date: el.querySelector('strong').childNodes[0].nodeValue.trim(),
        title: el.querySelector('a').innerText.trim(),
        amount: el.querySelector('font')
          ? el.querySelector('font').innerText
          : el.childNodes[2].nodeValue.trim()
      })
  ));

  // balance
  const balance = await page.evaluate(() =>
    document.querySelector('.details:nth-of-type(n+2)')
      .childNodes[2].nodeValue.trim()
  );

  console.log('--- balance: ', balance)
  console.log('--- transactions: ', transactions.length);

  await browser.close();
})();