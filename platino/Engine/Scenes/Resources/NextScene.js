(function() {
	var platino = require('co.lanica.platino');

	var NextScene = function(window, game) {
		var scene = platino.createScene();
		var redSprite = null;

        //pragma-mark - EVENTS METHODS
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
			
			var text = platino.createTextSprite({text:'Touch to go to previous scene. ', fontSize:14});
            text.textAlign = Ti.UI.TEXT_ALIGNMENT_CENTER;
            text.color(1, 1, 1);
            text.center = { x:game.screen.width  * 0.5, 
                            y:game.screen.height * 0.5};
            scene.add(text);
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
		
		var onSceneChange = function(e) {
            // load the module for the scene we want to transition to (in this case, NextScene.js)
            var MainScene = require('MainScene');
				
			// creates an easily accessible reference to the soon-to-be current scene
			game.currentScene = new MainScene(window, game);
				
			// pop the currently shown scene (MainScene.js) from the stack
			// and replace it with the new current scene (NextScene.js)
			game.replaceScene(game.currentScene);
		};

        game.addEventListener('touchstart', onSceneChange);
		scene.addEventListener('activated', onSceneActivated);
		scene.addEventListener('deactivated', onSceneDeactivated);
		return scene;
	};

	module.exports = NextScene;
}).call(this);