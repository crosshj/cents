	function putPixel(context, x, y, r, g, b, a){
		context._imageData = context._imageData || context.getImageData(x,y,1,1);
		context._imageDataRaw  = context._imageDataRaw || context._imageData.data;
		context._imageDataRaw[0]   = r;
		context._imageDataRaw[1]   = g;
		context._imageDataRaw[2]   = b;
		context._imageDataRaw[3]   = a;
		context.putImageData( context._imageData, x, y );
	}

	var backgroundGradient = function(colors, w, h, bgColor){
		colors = colors || [];
		w = w || 3;
		h = h || 3;
		var canvas = document.createElement("canvas");
		canvas.id = "mycanvas";
		canvas.width = w || 3;
		canvas.height = h || 3;
		var context = canvas.getContext('2d');

		for (var y = 0; y < canvas.height; y++) { 
			for (var x = 0; x < canvas.width; x++) { 
				var red = Math.floor(Math.random() * 30)+20;
				var green = Math.floor(Math.random() * 50)+20;
				var blue = Math.floor(Math.random() * 50)+20;
				putPixel(
					context, 
					x, y, 
					red, 
					green, 
					blue, 
					255
				);
			}
		}

		var dataURI = canvas.toDataURL("image/png");
		document.body.background = dataURI;
		document.body.style.backgroundRepeat = "no-repeat";
		document.body.style.backgroundSize = "cover";
		if (bgColor){
			document.body.style.backgroundBlendMode = "lighten, luminosity";
			document.body.style.backgroundColor = bgColor;	
		}
	};
