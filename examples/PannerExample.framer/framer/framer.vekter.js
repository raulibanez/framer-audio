(function(scope) {var __layer_0__ = new Layer({"backgroundColor":"hsl(0, 0%, 100%)","width":375,"height":812,"constraintValues":{"height":812,"heightFactor":1,"width":375,"widthFactor":1},"blending":"normal","clip":true,"borderStyle":"solid"});var __layer_1__ = new Layer({"parent":__layer_0__,"name":"map","backgroundColor":null,"width":600,"x":-112,"height":600,"constraintValues":{"left":-112,"height":600,"centerAnchorX":0.5013333333333333,"width":600,"bottom":106,"right":-113,"top":106,"centerAnchorY":0.5},"blending":"normal","clip":false,"borderStyle":"solid","y":106});var __layer_2__ = new Layer({"parent":__layer_1__,"name":"circles","backgroundColor":null,"width":600,"height":600,"constraintValues":{"height":600,"centerAnchorX":0.5,"width":600,"bottom":0,"right":0,"centerAnchorY":0.5},"blending":"normal","clip":false,"borderStyle":"solid"});var __layer_3__ = new SVGLayer({"parent":__layer_2__,"name":".SVGLayer","backgroundColor":"hsl(200, 60%, 97%)","width":600,"stroke":"#0AF","strokeWidth":1,"htmlIntrinsicSize":{"height":600,"width":600},"rotation":null,"height":600,"fill":"hsl(200, 60%, 97%)","opacity":null,"svg":"<svg xmlns=\"http:\/\/www.w3.org\/2000\/svg\" width=\"600\" height=\"600\"><path d=\"M 300 0 C 465.685 0 600 134.315 600 300 C 600 465.685 465.685 600 300 600 C 134.315 600 0 465.685 0 300 C 0 134.315 134.315 0 300 0 Z\" stroke-dasharray=\"6\" name=\"Oval\"><\/path><\/svg>"});var __layer_4__ = new SVGLayer({"parent":__layer_2__,"name":".SVGLayer","backgroundColor":"hsl(200, 62%, 91%)","width":400,"stroke":"#0AF","strokeWidth":1,"x":100,"htmlIntrinsicSize":{"height":400,"width":400},"rotation":null,"height":400,"fill":"hsl(200, 62%, 91%)","opacity":null,"y":100,"svg":"<svg xmlns=\"http:\/\/www.w3.org\/2000\/svg\" width=\"400\" height=\"400\"><path d=\"M 200 0 C 310.457 0 400 89.543 400 200 C 400 310.457 310.457 400 200 400 C 89.543 400 0 310.457 0 200 C 0 89.543 89.543 0 200 0 Z\" stroke-dasharray=\"6\" name=\"Oval\"><\/path><\/svg>"});var __layer_5__ = new SVGLayer({"parent":__layer_2__,"name":".SVGLayer","backgroundColor":"hsl(200, 88%, 83%)","width":200,"stroke":"#0AF","strokeWidth":1,"x":200,"htmlIntrinsicSize":{"height":200,"width":200},"rotation":null,"height":200,"fill":"hsl(200, 88%, 83%)","opacity":null,"y":200,"svg":"<svg xmlns=\"http:\/\/www.w3.org\/2000\/svg\" width=\"200\" height=\"200\"><path d=\"M 100 0 C 155.228 0 200 44.772 200 100 C 200 155.228 155.228 200 100 200 C 44.772 200 0 155.228 0 100 C 0 44.772 44.772 0 100 0 Z\" stroke-dasharray=\"6\" name=\"Oval\"><\/path><\/svg>"});var __layer_6__ = new Layer({"parent":__layer_1__,"name":"axis","backgroundColor":null,"width":377,"x":112,"height":812,"constraintValues":{"left":112,"height":812,"centerAnchorX":0.50083333333333335,"width":377,"bottom":-106,"right":111,"top":-106,"centerAnchorY":0.5},"blending":"normal","clip":false,"borderStyle":"solid","y":-106});var __layer_7__ = new SVGLayer({"parent":__layer_6__,"name":".SVGLayer","backgroundColor":null,"width":1,"stroke":"#00AAFF","strokeWidth":1,"x":188,"htmlIntrinsicSize":{"height":812,"width":1},"rotation":null,"height":812,"opacity":null,"svg":"<svg xmlns=\"http:\/\/www.w3.org\/2000\/svg\" width=\"1\" height=\"812\"><path d=\"M 0 0 L 0 812\" fill=\"transparent\" opacity=\"0.27\" name=\"Path\"><\/path><\/svg>"});var __layer_8__ = new SVGLayer({"parent":__layer_6__,"name":".SVGLayer","backgroundColor":null,"width":1,"stroke":"#00AAFF","strokeWidth":1,"x":188,"htmlIntrinsicSize":{"height":376,"width":1},"rotation":null,"height":376,"opacity":null,"y":218,"svg":"<svg xmlns=\"http:\/\/www.w3.org\/2000\/svg\" width=\"1\" height=\"376\"><path d=\"M 0 0 L 0 376\" transform=\"rotate(90 0.5 188)\" fill=\"transparent\" opacity=\"0.27\" name=\"Path\"><\/path><\/svg>"});var __layer_9__ = new Layer({"parent":__layer_1__,"name":"labels","backgroundColor":null,"width":24,"x":272,"height":214,"constraintValues":{"left":272,"height":214,"centerAnchorX":0.47333333333333333,"width":24,"top":-18,"centerAnchorY":0.14833333333333334},"blending":"normal","clip":false,"borderStyle":"solid","y":-18});var __layer_10__ = new TextLayer({"parent":__layer_9__,"backgroundColor":null,"width":24,"styledText":{"blocks":[{"inlineStyles":[{"css":{"fontSize":"12px","WebkitTextFillColor":"hsl(0, 0%, 61%)","whiteSpace":"pre","fontWeight":400,"letterSpacing":"0px","tabSize":4,"fontFamily":"\"SFUIText-Regular\", \"SF UI Text\", sans-serif","lineHeight":"1.2"},"startIndex":0,"endIndex":3}],"text":"300"}]},"height":14,"constraintValues":{"left":null,"height":14,"centerAnchorX":0.5,"width":24,"centerAnchorY":0.032710280373831772},"blending":"normal","autoSize":true});var __layer_11__ = new TextLayer({"parent":__layer_9__,"backgroundColor":null,"width":24,"styledText":{"blocks":[{"inlineStyles":[{"css":{"fontSize":"12px","WebkitTextFillColor":"hsl(0, 0%, 61%)","whiteSpace":"pre","fontWeight":400,"letterSpacing":"0px","tabSize":4,"fontFamily":"\"SFUIText-Regular\", \"SF UI Text\", sans-serif","lineHeight":"1.2"},"startIndex":0,"endIndex":3}],"text":"200"}]},"height":14,"constraintValues":{"left":null,"height":14,"centerAnchorX":0.5,"width":24,"top":null,"centerAnchorY":0.5},"blending":"normal","autoSize":true,"y":100});var __layer_12__ = new TextLayer({"parent":__layer_9__,"backgroundColor":null,"width":22,"styledText":{"blocks":[{"inlineStyles":[{"css":{"fontSize":"12px","WebkitTextFillColor":"hsl(0, 0%, 61%)","whiteSpace":"pre","fontWeight":400,"letterSpacing":"0px","tabSize":4,"fontFamily":"\"SFUIText-Regular\", \"SF UI Text\", sans-serif","lineHeight":"1.2"},"startIndex":0,"endIndex":3}],"text":"100"}]},"height":14,"constraintValues":{"left":null,"height":14,"centerAnchorX":0.45833333333333331,"width":22,"bottom":0,"top":null,"centerAnchorY":0.96728971962616828},"blending":"normal","autoSize":true,"y":200});var __layer_13__ = new TextLayer({"parent":__layer_9__,"backgroundColor":null,"width":10,"x":13,"styledText":{"blocks":[{"inlineStyles":[{"css":{"fontSize":"16px","WebkitTextFillColor":"hsl(0, 0%, 61%)","whiteSpace":"pre","fontWeight":400,"letterSpacing":"0px","tabSize":4,"fontFamily":"\"SFUIText-Regular\", \"SF UI Text\", sans-serif","lineHeight":"1.2"},"startIndex":0,"endIndex":1}],"text":"y"}]},"height":19,"constraintValues":{"left":null,"height":19,"centerAnchorX":0.75,"width":10,"right":1,"top":-53,"centerAnchorY":-0.20327102803738317},"blending":"normal","autoSize":true,"y":-53});var __layer_14__ = new TextLayer({"parent":__layer_9__,"backgroundColor":null,"width":10,"x":201,"styledText":{"blocks":[{"inlineStyles":[{"css":{"fontSize":"16px","WebkitTextFillColor":"hsl(0, 0%, 61%)","whiteSpace":"pre","fontWeight":400,"letterSpacing":"0px","tabSize":4,"fontFamily":"\"SFUIText-Regular\", \"SF UI Text\", sans-serif","lineHeight":"1.2"},"startIndex":0,"endIndex":1}],"text":"x"}]},"height":19,"constraintValues":{"left":null,"height":19,"centerAnchorX":8.5833333333333339,"width":10,"bottom":-126,"right":-187,"top":null,"centerAnchorY":1.544392523364486},"blending":"normal","autoSize":true,"y":321});var mic = new Layer({"parent":__layer_0__,"name":"mic","backgroundColor":null,"width":32,"x":172,"height":32,"constraintValues":{"left":null,"height":32,"centerAnchorX":0.5013333333333333,"width":32,"top":null,"centerAnchorY":0.5},"blending":"normal","clip":false,"borderStyle":"solid","y":390});var __layer_15__ = new SVGLayer({"parent":mic,"name":".SVGLayer","backgroundColor":"hsl(200, 97%, 57%)","width":32,"stroke":"hsl(0, 0%, 100%)","strokeWidth":1,"htmlIntrinsicSize":{"height":32,"width":32},"rotation":null,"height":32,"fill":"hsl(200, 97%, 57%)","opacity":null,"svg":"<svg xmlns=\"http:\/\/www.w3.org\/2000\/svg\" width=\"32\" height=\"32\"><path d=\"M 16 0 C 24.837 0 32 7.163 32 16 C 32 24.837 24.837 32 16 32 C 7.163 32 0 24.837 0 16 C 0 7.163 7.163 0 16 0 Z\" name=\"Oval\"><\/path><\/svg>"});var __layer_16__ = new SVGLayer({"parent":mic,"backgroundColor":null,"width":24,"x":4,"htmlIntrinsicSize":{"height":24,"width":24},"color":"hsl(0, 0%, 100%)","height":24,"constraintValues":{"left":4,"aspectRatioLocked":true,"height":24,"centerAnchorX":0.5,"width":24,"right":4,"top":4,"centerAnchorY":0.5},"blending":"normal","y":4,"svg":"<?xml version=\"1.0\"?><svg xmlns=\"http:\/\/www.w3.org\/2000\/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\"><path d=\"M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z\"><\/path><\/svg>"});var speaker = new Layer({"parent":__layer_0__,"name":"speaker","backgroundColor":"#DF1515","width":36,"x":120,"height":36,"constraintValues":{"left":120,"aspectRatioLocked":true,"height":36,"centerAnchorX":0.36799999999999999,"width":36,"top":329,"centerAnchorY":0.42733990147783252},"blending":"normal","borderRadius":18,"clip":false,"borderStyle":"solid","y":329});var __layer_17__ = new SVGLayer({"parent":speaker,"name":"volume","backgroundColor":null,"width":24,"x":6,"htmlIntrinsicSize":{"height":24,"width":24},"color":"hsl(0, 0%, 100%)","height":24,"constraintValues":{"left":6,"aspectRatioLocked":true,"height":24,"centerAnchorX":0.5,"width":24,"right":6,"top":6,"centerAnchorY":0.5},"blending":"normal","y":6,"svg":"<?xml version=\"1.0\"?><svg xmlns=\"http:\/\/www.w3.org\/2000\/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"feather feather-volume-2\"><polygon points=\"11 5 6 9 2 9 2 15 6 15 11 19 11 5\"><\/polygon><path d=\"M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07\"><\/path><\/svg>"});if(__layer_9__ !== undefined){__layer_9__.__framerInstanceInfo = {"hash":"#vekter|__layer_9__","vekterClass":"FrameNode","framerClass":"Layer"}};if(__layer_7__ !== undefined){__layer_7__.__framerInstanceInfo = {"hash":"#vekter|__layer_7__","vekterClass":"PathNode","framerClass":"SVGLayer"}};if(speaker !== undefined){speaker.__framerInstanceInfo = {"framerClass":"Layer","hash":"#vekter|speaker","targetName":"speaker","vekterClass":"FrameNode"}};if(__layer_2__ !== undefined){__layer_2__.__framerInstanceInfo = {"hash":"#vekter|__layer_2__","vekterClass":"FrameNode","framerClass":"Layer"}};if(__layer_8__ !== undefined){__layer_8__.__framerInstanceInfo = {"hash":"#vekter|__layer_8__","vekterClass":"PathNode","framerClass":"SVGLayer"}};if(__layer_10__ !== undefined){__layer_10__.__framerInstanceInfo = {"framerClass":"TextLayer","hash":"#vekter|__layer_10__","vekterClass":"TextNode","text":"300"}};if(__layer_14__ !== undefined){__layer_14__.__framerInstanceInfo = {"framerClass":"TextLayer","hash":"#vekter|__layer_14__","vekterClass":"TextNode","text":"x"}};if(__layer_0__ !== undefined){__layer_0__.__framerInstanceInfo = {"framerClass":"Layer","hash":"#vekter|__layer_0__","vekterClass":"FrameNode","deviceType":"apple-iphone-x-space-gray","deviceName":"Apple iPhone X"}};if(__layer_13__ !== undefined){__layer_13__.__framerInstanceInfo = {"framerClass":"TextLayer","hash":"#vekter|__layer_13__","vekterClass":"TextNode","text":"y"}};if(__layer_11__ !== undefined){__layer_11__.__framerInstanceInfo = {"framerClass":"TextLayer","hash":"#vekter|__layer_11__","vekterClass":"TextNode","text":"200"}};if(__layer_12__ !== undefined){__layer_12__.__framerInstanceInfo = {"framerClass":"TextLayer","hash":"#vekter|__layer_12__","vekterClass":"TextNode","text":"100"}};if(mic !== undefined){mic.__framerInstanceInfo = {"framerClass":"Layer","hash":"#vekter|mic","targetName":"mic","vekterClass":"FrameNode"}};if(__layer_15__ !== undefined){__layer_15__.__framerInstanceInfo = {"hash":"#vekter|__layer_15__","vekterClass":"OvalShapeNode","framerClass":"SVGLayer"}};if(__layer_16__ !== undefined){__layer_16__.__framerInstanceInfo = {"originalFilename":"mic","framerClass":"SVGLayer","hash":"#vekter|__layer_16__","vekterClass":"SVGNode"}};if(__layer_4__ !== undefined){__layer_4__.__framerInstanceInfo = {"hash":"#vekter|__layer_4__","vekterClass":"OvalShapeNode","framerClass":"SVGLayer"}};if(__layer_1__ !== undefined){__layer_1__.__framerInstanceInfo = {"hash":"#vekter|__layer_1__","vekterClass":"FrameNode","framerClass":"Layer"}};if(__layer_6__ !== undefined){__layer_6__.__framerInstanceInfo = {"hash":"#vekter|__layer_6__","vekterClass":"FrameNode","framerClass":"Layer"}};if(__layer_17__ !== undefined){__layer_17__.__framerInstanceInfo = {"originalFilename":"volume-2","framerClass":"SVGLayer","hash":"#vekter|__layer_17__","vekterClass":"SVGNode"}};if(__layer_3__ !== undefined){__layer_3__.__framerInstanceInfo = {"hash":"#vekter|__layer_3__","vekterClass":"OvalShapeNode","framerClass":"SVGLayer"}};if(__layer_5__ !== undefined){__layer_5__.__framerInstanceInfo = {"hash":"#vekter|__layer_5__","vekterClass":"OvalShapeNode","framerClass":"SVGLayer"}};if (scope["__vekterVariables"]) { scope["__vekterVariables"].map(function(variable) { delete scope[variable] } ) };Object.assign(scope, {mic, speaker});scope["__vekterVariables"] = ["mic", "speaker"];if (typeof Framer.CurrentContext.layout === 'function') {Framer.CurrentContext.layout()};})(window);