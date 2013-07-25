var platino = require('co.lanica.platino');

(function() {
	var ApplicationWindow = function() {
		var window = Ti.UI.createWindow({
			backgroundColor: 'black',
			orientationModes: [Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT], //[Ti.UI.PORTRAIT, Ti.UI.UPSIDE_PORTRAIT], //others: Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT
			fullscreen: true,
			navBarHidden: true
		});

		var game = platino.createGameView();
		game.fps = 60;
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
		game.TARGET_SCREEN = {
			width: 320,
			height: Ti.Platform.displayCaps.platformHeight * (320 / Ti.Platform.displayCaps.platformWidth), //Ti.Platform.displayCaps.platformWidth,
			density: Ti.Platform.displayCaps.density
		}

		game.touchScaleX = 1;
		game.touchScaleY = 1;
		game.imageSuffix = '@2x';
		game.fullSuffix = '@2x';
		
		if (game.TARGET_SCREEN.height == 568) {
			game.fullSuffix = '-568h';
		} else if (game.TARGET_SCREEN.density !== 'high') {
			game.imageSuffix = '';
			game.fullSuffix = '';
		};

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

		// Convenience functions
		game.getTiScale = function(x, y) {
			return {
				x: (x / game.touchScaleX),
				y:(y / game.touchScaleY) }
		}
		
		game.setupSpriteSize = function(sprite) {
			var width = sprite.width / game.screenScale;
      var height = sprite.height / game.screenScale;
      sprite.width = (width < 1) ? 1 : width;
      sprite.height = (height < 1) ? 1 : height;
		};

		// Free up game resources when window is closed
		window.addEventListener('close', function(e) {
			game = null;
		});

		window.add(game);
		return window;
	};

	module.exports = ApplicationWindow;
})();