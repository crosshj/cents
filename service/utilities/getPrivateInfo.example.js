const usaa = () => ({
    url: () => 'https://mobile.usaa.com/inet/ent_logon/Logon?acf=1',
    username: () => '*****',
    password: () => '*****',
    pin: () => '*****',
    answer: question => {
      var result = '';
      switch (true){
        case !!~question.indexOf('***** one?'):
          result = '*****';
          break;
        case !!~question.indexOf('***** two?'):
          result = '*****';
          break;
        case !!~question.indexOf('***** three?'):
          result = '*****';
          break;
        default:
          console.log('did not recognize the question: ', question);
      }
      return result;
    }
  });

const discover = () =>({
    url: () => 'https://portal.discover.com/customersvcs/universalLogin/ac_main',
    username: () => '*****',
    password: () => '*****'
});

module.exports = { usaa, discover };
