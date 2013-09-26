(function() {
	var platino = require('co.lanica.platino');

	var MainScene = function(window, game) {
		var scene = platino.createScene();
		var blue = null;
		var transform1 = null;
		var transform2 = null;
		
		var onTransformStart = function(e) {
			if (e.source === transform1) {
				Ti.API.info("First transform started (with a delay of " + transform1.delay + ")");				
			} else if ((transform2) && (e.source === transform2)) {
				Ti.API.info("Second transform started.");
			}
		};
		
		var onTransformComplete = function(e) {
			Ti.API.info("First transform completed. Beginning second transform...");
			
			blue.clearTransforms();
			transform1 = null;
			
			transform2 = platino.createTransform({
				alpha: 0,
				autoreverse: true,
				repeat: 1,
				easing: platino.ANIMATION_CURVE_EASE_IN_OUT,
				duration: 2000,
				x: (game.TARGET_SCREEN.width * 0.5) - (blue.width * 0.5),
				y: (game.TARGET_SCREEN.height * 0.5) - (blue.height * 0.5)
			});
			
			transform2.addEventListener('start', onTransformStart);
			
			// begin second transform
			blue.transform(transform2);
		};

		var onSceneActivated = function(e) {

			// ---- create sprites, add listeners, etc. ----

			Ti.API.info("MainScene has been activated.");
			
			blue = platino.createSprite({
				width: 64,
				height: 64,
				x: 10,
				y: 10
			});
			blue.color(0, 0, 1.0);
			blue.hide();
			
			transform1 = platino.createTransform({
				delay: 1000,
				x: game.TARGET_SCREEN.width - blue.width - 10,
				y: game.TARGET_SCREEN.height - blue.height - 10,
				easing: platino.ANIMATION_CURVE_EXPO_IN,
				alpha: 1.0,
				duration: 3000
			});
			transform1.addEventListener('start', onTransformStart);
			transform1.addEventListener('complete', onTransformComplete);
			
			scene.add(blue);
			
			// begin first transform
			blue.transform(transform1);
		};

		var onSceneDeactivated = function(e) {

			// ---- remove sprites, listeners, etc. ----

			Ti.API.info("MainScene has been deactivated.");

		};

		scene.addEventListener('activated', onSceneActivated);
		scene.addEventListener('deactivated', onSceneDeactivated);
		return scene;
	};

	module.exports = MainScene;
}).call(this);