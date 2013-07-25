(function() {
	var platino = require('co.lanica.platino');

	var MainScene = function(window, game) {
		var scene = platino.createScene();
		var background = null;
		var cameraTransform1 = null;
		var cameraTransform2 = null;
		var cameraTransform3 = null;
		var cameraTransform4 = null;

		var onSceneActivated = function(e) {
			// ---- create sprites, add listeners, etc. ----

			Ti.API.info("MainScene has been activated.");
			
			background = platino.createSprite({
				image: 'graphics/track.png',
				width: 1024,
				height: 1024
			});
			scene.add(background);
			
			// NOTE: camera eyeX,eyeY begins at half the screen width and height.
			
			// create the transform objects
			cameraTransform1 = platino.createTransform();
			cameraTransform1.lookAt_eyeX = background.width - (game.TARGET_SCREEN.width * 0.5);
			cameraTransform1.lookAt_eyeY = background.height - (game.TARGET_SCREEN.height * 0.5);
			cameraTransform1.delay = 1000;
			cameraTransform1.duration = 3000;
			
			cameraTransform2 = platino.createTransform();
			cameraTransform2.lookAt_eyeX = game.TARGET_SCREEN.width * 0.5;
			cameraTransform2.duration = 3000;
			
			cameraTransform3 = platino.createTransform();
			cameraTransform3.lookAt_eyeX = background.width - (game.TARGET_SCREEN.width * 0.5);
			cameraTransform3.lookAt_eyeY = game.TARGET_SCREEN.height * 0.5;
			cameraTransform3.duration = 3000;

			cameraTransform4 = platino.createTransform();
			cameraTransform4.lookAt_eyeX = game.TARGET_SCREEN.width * 0.5;
			cameraTransform4.lookAt_eyeY = game.TARGET_SCREEN.height * 0.5;
			cameraTransform4.duration = 3000;
			
			// move camera to bottom-right corner of background image
			game.moveCamera(cameraTransform1);
			
			// move camera to bottom-left corner of background image
			setTimeout(function() {
				game.moveCamera(cameraTransform2);
			}, cameraTransform1.duration + 2000);
			
			// move camera to top-right corner of background image
			setTimeout(function() {
				game.moveCamera(cameraTransform3);
			}, cameraTransform1.duration + cameraTransform2.duration + 3000);

			// move camera back to starting location
			setTimeout(function() {
				game.moveCamera(cameraTransform4);
			}, cameraTransform1.duration + cameraTransform2.duration + cameraTransform3.duration + 4000);
			
			game.startCurrentScene();
		};

		var onSceneDeactivated = function(e) {

			// ---- remove sprites, listeners, etc. ----

			Ti.API.info("MainScene has been deactivated.");

			if (background) {
				scene.remove(background);
				background.dispose();
				background = null;
			}
			
			if (cameraTransform1) {
				cameraTransform1 = null;
			}

			if (cameraTransform2) {
				cameraTransform2 = null;
			}

			if (cameraTransform3) {
				cameraTransform3 = null;
			}

			if (cameraTransform4) {
				cameraTransform4 = null;
			}
		};

		scene.addEventListener('activated', onSceneActivated);
		scene.addEventListener('deactivated', onSceneDeactivated);
		return scene;
	};

	module.exports = MainScene;
}).call(this);