document.addEventListener("DOMContentLoaded",function(){
	function OpenCentsFullPage(){
		var a=chrome.extension.getBackgroundPage();
		window.close();
		a.OpenExtensionUrl("/src/cents.html");
	}
	window.addEventListener("load", function(){
		document.getElementById("cents-full-page").addEventListener("click",
			function(){
				OpenCentsFullPage();
			}
		);
		document.getElementById("cents-settings").addEventListener("click",
			function(){
				OpenCentsFullPage();
			}
		);
	});
});