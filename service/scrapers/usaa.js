var Nightmare = require('nightmare');
var nightmare = Nightmare({ show: false, frame: false });
var path = require('path');
var getPrivateInfo = require('../utilities/getPrivateInfo').usaa;

const getUSAA = callback => {
  var usaaOutput = {
    accounts: []
  };
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
      return nightmare
        .type('#securityQuestionTextField', getPrivateInfo().answer(result.toLowerCase()))
        .click('button[type="submit"]')
        .wait('#menu')
        .click('#menu li:first-child a')
        .wait('.acct-group-list')
        .evaluate(() => [...document.querySelectorAll('.acct-group-list:first-child  li .link-liner')]
          .map(node=>{ return node.innerHTML; })
        );
    })
    .then(result => {
      // results of accounts overview
      result.forEach(string=>{
          if(!string.split('acct-bal">')[1]) return;
          const account = {
            name: string.split('acct-name">')[1].split('</span>')[0] + ' ' + string.split('acct-detail">')[1].split('</span>')[0],
            balance: string.split('acct-bal">')[1].split('</span>')[0].replace('$','').replace(',','')
          };
          usaaOutput.accounts.push(account);
      });
    })
    .then(() => {
      return nightmare
        .click('.custom-accts > div:first-child > div:nth-child(2) .acct-group-list:first-child .acct-group-row:first-child a:first-child')
        //.click('a.acct-info')
        .wait('.section')
        .evaluate(() => [...document.querySelectorAll('.details')]
          .map(node=>{ return node.innerText.replace(/\n/g,'').replace(/\t/g,'').replace('&nbsp;',''); })
        );
    })
    .then(result => {
      // results of main account list
      const transactions = result
        .filter(x => /(\s){3}/g.test(x) ) //has whitespace repeated 3 times
        .map(x => ({
          date: x.split(/(\s){3}/g)[0],
          description: x.split(/(\s){3}/g)[2],
          amount: (() => {
            const value = x.split(/(\s){3}/g)[4].replace('$','').replace(',','');
            return value.match(/^\([\d,\.]*\)$/)
              ? '-' + value.replace(/[\(\)]/g,'')
              : value;
          })()
        }));
      usaaOutput.accounts[0].transactions = transactions;
    })
    .then(() => {
      return nightmare
        .back()
        .wait('.acct-group-list')
        .click('.acct-group-list li:nth-child(2) a')
        .wait('.section')
        .evaluate(() => [...document.querySelectorAll('.details')]
          .map(node=>{ return node.innerText.replace(/\n/g,'').replace(/\t/g,'').replace('&nbsp;',''); })
        );
        //TODO: get info from other accounts
    })
    .then(result => {
      // results of savings account list
      const transactions = result
        .filter(x => /(\s){3}/g.test(x) ) //has whitespace repeated 3 times
        .map(x => ({
          date: x.split(/(\s){3}/g)[0],
          description: x.split(/(\s){3}/g)[2],
          amount: (() => {
            const value = x.split(/(\s){3}/g)[4].replace('$','').replace(',','');
            return value.match(/^\([\d,\.]*\)$/)
              ? '-' + value.replace(/[\(\)]/g,'')
              : value;
          })()
        }));
      usaaOutput.accounts[1].transactions = transactions;
    })
    .then(() => {
      return nightmare
        .back()
        .wait('.acct-group-list')
        .click('.acct-group-list li:nth-child(3) a')
        .wait('.section')
        .evaluate(() => [...document.querySelectorAll('.details')]
          .map(node=>{ return node.innerText.replace(/\n/g,'').replace(/\t/g,'').replace('&nbsp;',''); })
        );
        //TODO: get info from other accounts
    })
    .then(result => {
      // results of savings account list
      const transactions = result
        .filter(x => /(\s){3}/g.test(x) ) //has whitespace repeated 3 times
        .map(x => ({
          date: x.split(/(\s){3}/g)[0],
          description: x.split(/(\s){3}/g)[2],
          amount: (() => {
            const value = x.split(/(\s){3}/g)[4].replace('$','').replace(',','');
            return value.match(/^\([\d,\.]*\)$/)
              ? '-' + value.replace(/[\(\)]/g,'')
              : value;
          })()
        }));
      usaaOutput.accounts[2].transactions = transactions;
    })
    // TODO: get VISA details
    // .then(() => {
    //   return nightmare
    //     .back()
    //     .wait('.acct-group-list')
    //     .click('.acct-group-list li:nth-child(4) a')
    //     .wait('.section')
    //     .evaluate(() => [...document.querySelectorAll('.details')]
    //       .map(node=>{ return node.innerText.replace(/\n/g,'').replace(/\t/g,'').replace('&nbsp;',''); })
    //     )
    // })
    // .then(result => {
    //   // results of VISA account list
    //   const transactions = result
    //     .filter(x => /(\s){3}/g.test(x) ) //has whitespace repeated 3 times
    //     .map(x => ({
    //       date: x.split(/(\s){3}/g)[0],
    //       description: x.split(/(\s){3}/g)[2],
    //       amount: (() => {
    //         const value = x.split(/(\s){3}/g)[4].replace('$','').replace(',','');
    //         return value.match(/^\([\d,\.]*\)$/)
    //           ? '-' + value.replace(/[\(\)]/g,'')
    //           : value;
    //       })()
    //     }))
    //   usaaOutput.accounts[3].transactions = transactions;
    // })
    .then(() => {
      callback(null, usaaOutput);
      return nightmare
        .screenshot(path.join(__dirname, 'usaa.png'))
        .end();
    })
    .catch(function (error) {
      callback(error);
    });
};

module.exports = getUSAA;
