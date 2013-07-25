var platino = require('co.lanica.platino');

(function() {
	var ApplicationWindow = function() {
		var window = Ti.UI.createWindow({
			backgroundColor: 'black',
			orientationModes: [Ti.UI.PORTRAIT, Ti.UI.UPSIDE_PORTRAIT], //others: Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT
			fullscreen: true,
			navBarHidden: true
		});

		var game = platino.createGameView();
		game.fps = 30;
		game.color(0, 0, 0);
		game.debug = false; // disables debug logs (not to be used for production)

		// additional options:
		//game.keepScreenOn = false;
		//game.textureFilter = platino.OPENGL_LINEAR;
		//game.setUsePerspective(false); // for isometric
		//game.enableOnDrawFrameEvent = false; // optimization: disables 'enterframe' event
		//game.enableOnLoadSpriteEvent = false; // optimization: disables 'onloadsprite' and 'onunloadsprite' event except selected sprite by registerOnLoadSpriteName(name) or registerOnLoadSpriteTag(tag)
		//game.enableOnLoadTextureEvent = false; // optimization: disables 'onloadtexture' event except selected texture by registerOnLoadTextureName(name)
		//game.enableOnFpsEvent = false; // optimization: disables 'onfps' event
		//game.onFpsInterval = 5000; // sets 'onfps' event interval in msec (default: 5000)

		// Set your target screen resolution (in points) below
		// Set your target screen resolution (in points) below
		var screenHeight = Ti.Platform.displayCaps.platformHeight;
		if (screenHeight >= 568) {
			screenHeight = 568;
		} else {
			screenHeight = 480;
		}
		
		game.TARGET_SCREEN = {
			width: 320,
			height: screenHeight
		}

		game.touchScaleX = 1;
		game.touchScaleY = 1;

		// Updates screen scale
		var updateScreenSize = function() {
			var screenScale = game.size.height / game.TARGET_SCREEN.height;
			game.screen = {
				width: game.size.width / screenScale,
				height: game.size.height / screenScale
			};

			game.touchScaleX = game.screen.width  / game.size.width;
			game.touchScaleY = game.screen.height / game.size.height;
			game.screenScale = game.screen.height / game.TARGET_SCREEN.height;
		};

		// Loads MainScene.js as starting point to the app
		game.addEventListener('onload', function(e) {
			updateScreenSize();

			var MainScene  = require("MainScene");
			game.currentScene = new MainScene(window, game);

			// push loading scene and start the game
			game.pushScene(game.currentScene);
			game.start();
		});

		game.addEventListener('onsurfacechanged', function(e) {
				game.orientation = e.orientation;
				updateScreenSize();
		});

		// Convenience function to convert Titanium coordinate from a Platino coordinate
		game.getTiScale = function(x, y) {
			return {
				x: (x / game.touchScaleX),
				y:(y / game.touchScaleY) }
		}

		// Free up game resources when window is closed
		window.addEventListener('close', function(e) {
			game = null;
		});

		window.add(game);
		return window;
	};

	module.exports = ApplicationWindow;
})();