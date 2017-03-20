var Nightmare = require('nightmare');
var nightmare = Nightmare({ show: false, frame: false });
var path = require('path');
var getPrivateInfo = require('./getPrivateInfo').usaa;

nightmare
  .goto(getPrivateInfo().url())
  .click('#logOnButton a')
  .type('input#input_onlineid', getPrivateInfo().username())
  .type('input#input_password', getPrivateInfo().password())
  .click('input[type="submit"]')
  .wait('input#pinTextField')
  .type('input#pinTextField', getPrivateInfo().pin())
  .click('button[type="submit"]')
  .wait('label[for="securityQuestionTextField"]')
  .evaluate(() => document.querySelector('label[for="securityQuestionTextField"]').innerHTML)
  .then(result => {
    nightmare
      .type('#securityQuestionTextField', getPrivateInfo().answer(result.toLowerCase()))
      .click('button[type="submit"]')
      .wait('#menu')
      .click('#menu li:first-child a')
      .wait('.acct-group-list')
      //TODO: get info from here then move on to the next step (for each account)

  })
  .then(() => {
    nightmare
      .evaluate(() => [].slice.call(document.querySelectorAll('.acct-group-list:first-child  li .link-liner')).map(node=>{ return node.innerHTML; }))
      .then(result => result.forEach(
        string=>{
          if(!string.split('acct-bal">')[1]) return;
          const account = {
            name: string.split('acct-name">')[1].split('</span>')[0] + ' ' + string.split('acct-detail">')[1].split('</span>')[0],
            balance: string.split('acct-bal">')[1].split('</span>')[0]
          };
          console.log(account)
        })
      )
      // .then(() => {
      //   nightmare
      //     .click('.custom-accts > div:first-child > div:nth-child(2) .acct-group-list:first-child .acct-group-row:first-child a:first-child')
      //     .wait('.section')
      //     .screenshot(path.join(__dirname, 'usaa.png'))
      // })
  })
  .then(() => {
    nightmare
      .end()
  })
  .catch(function (error) {
    console.error('Error:', error);
  });


    // nightmare
    //   .goto('https://mobile.usaa.com/inet/ent_logon/Logon?acf=1')
    //   .click('input#input_onlineid')
    //   .click('div#main-ctr > div.section-ctr:nth-child(4)')
    //   .click('input#input_password')
    //   .click('div#main-ctr > div.section-ctr:nth-child(4)')
    //   .click('div#main-ctr > div.section-ctr:nth-child(4) > div.button-ctr:nth-child(1) > div.yui3-g.padded:nth-child(1) > div.yui3-u-1:nth-child(1) > input.main-button:nth-child(1)')
    //   .click('input#pinTextField')
    //   .click('button#id4')
    //   .click('input#securityQuestionTextField')
    //   .click('div#flowWrapper')
    //   .click('button#id6')
    //   .click('div#id3 > ul.acct-group-list:nth-child(1) > li.acct-group-row:nth-child(1) > a.usaa-link.acct-info.clearfix:nth-child(1) > span.link-liner:nth-child(1) > span.acct-name:nth-child(1)')
    //   .end()
    //     .then(function (result) {
    //       console.log(result)
    //     })
    //     .catch(function (error) {
    //       console.error('Error:', error);
    //     });
