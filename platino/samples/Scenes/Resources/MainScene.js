(function() {
	var platino = require('co.lanica.platino');

	var MainScene = function(window, game) {
		var scene = platino.createScene();
		var blueSprite = null;

		var onSceneActivated = function(e) {

			// ---- create sprites, add listeners, etc. ----

			Ti.API.info("MainScene has been activated.");
			
			blueSprite = platino.createSprite({
				width: Ti.Platform.displayCaps.platformWidth,
				height: Ti.Platform.displayCaps.platformHeight
			});
			blueSprite.color(0, 0, 1);
			scene.add(blueSprite);
			
			// in 3 seconds, switch scene to NextScene
			setTimeout(function() {
				
				// load the module for the scene we want to transition to (in this case, NextScene.js)
				var NextScene = require('NextScene');
				
				// creates an easily accessible reference to the soon-to-be current scene
				game.currentScene = new NextScene(window, game);
				
				// pop the currently shown scene (MainScene.js) from the stack
				// and replace it with the new current scene (NextScene.js)
				game.replaceScene(game.currentScene);
				
			}, 3000);
			
			game.startCurrentScene();
		};

		var onSceneDeactivated = function(e) {

			// ---- remove sprites, listeners, etc. ----

			Ti.API.info("MainScene has been deactivated.");

			if (blueSprite) {
				scene.remove(blueSprite);
				blueSprite.dispose();
				blueSprite = null;
			}
		};

		scene.addEventListener('activated', onSceneActivated);
		scene.addEventListener('deactivated', onSceneDeactivated);
		return scene;
	};

	module.exports = MainScene;
}).call(this);