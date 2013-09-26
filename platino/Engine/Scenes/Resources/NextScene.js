(function() {
	var platino = require('co.lanica.platino');

	var NextScene = function(window, game) {
		var scene = platino.createScene();
		var redSprite = null;

		var onSceneActivated = function(e) {

			// ---- create sprites, add listeners, etc. ----

			Ti.API.info("NextScene has been activated.");

			redSprite = platino.createSprite({
				width: Ti.Platform.displayCaps.platformWidth,
				height: Ti.Platform.displayCaps.platformHeight
			});
			redSprite.color(1, 0, 0);
			scene.add(redSprite);
			game.startCurrentScene();
		};

		var onSceneDeactivated = function(e) {

			// ---- remove sprites, listeners, etc. ----

			Ti.API.info("NextScene has been deactivated.");

			if (redSprite) {
				scene.remove(redSprite);
				redSprite.dispose();
				redSprite = null;
			}
		};

		scene.addEventListener('activated', onSceneActivated);
		scene.addEventListener('deactivated', onSceneDeactivated);
		return scene;
	};

	module.exports = NextScene;
}).call(this);