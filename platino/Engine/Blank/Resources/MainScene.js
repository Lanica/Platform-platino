(function() {
	var platino = require('co.lanica.platino');

	var MainScene = function(window, game) {
		var scene = platino.createScene();
		
		//pragma-mark - Scene Events
		var onSceneActivated = function(e) {
			game.startCurrentScene();
		};

		var onSceneDeactivated = function(e) {
		};

		scene.addEventListener('activated', onSceneActivated);
		scene.addEventListener('deactivated', onSceneDeactivated);
		return scene;
	};

	module.exports = MainScene;
}).call(this);