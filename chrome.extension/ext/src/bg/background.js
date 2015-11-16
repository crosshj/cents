// if you checked "fancy-settings" in extensionizr.com, uncomment this lines

// var settings = new Store("settings", {
//     "sample_setting": "This is how you use Store.js to remember values"
// });


//example of using a message handler from the inject scripts
chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {
  	chrome.pageAction.show(sender.tab.id);
    sendResponse();
  });

chrome.browserAction.onClicked.addListener(function(tab) { 
	chrome.tabs.create({url: '/src/cents.html'});
	//alert('icon clicked');
	//chrome.windows.create({ url: 'https://mobile.twitter.com/', type: 'foo' });
});

// got this from xmarks, not sure it is required
function OpenExtensionUrl(a,c){function d(a){for(var c=!1,d=0;d<a.length;d++){var g=a[d];if(0==g.url.indexOf(b)){chrome.tabs.update(g.id,{url:e,selected:!0});c=!0;break}}c||chrome.tabs.create({url:e,selected:!0})}var b=chrome.extension.getURL(a),e=b;c&&(e+="?"+c);chrome.windows.getCurrent(function(a){chrome.tabs.getAllInWindow(a.id,d)})}