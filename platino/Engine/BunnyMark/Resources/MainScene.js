var platino = require('co.lanica.platino');

var MainScene = function(window, game) {
	var scene = platino.createScene();
	var startBunnyCount = 599;
	var count = 0;
	var bunnyDrawY = 0;
	
	// forward declarations
	var countLabel = null;
	var fpsLabel = null;
	var labelBackground = null;
	var bunnyTransform = null;
	var movingBunny = null;
	var enterframeOn = false;
	
	var createBunnySprite = function() {
		if (bunnyDrawY > (game.TARGET_SCREEN.height + 37)) {
			bunnyDrawY = 0;
		}
		var bunny = platino.createSprite({
			image: 'graphics/bunny.png',
			width: 26,
			height: 37,
			center: {
				x: game.TARGET_SCREEN.width * 0.5 - 100,
				y: bunnyDrawY - 18
			}
		});
		count++;
		bunnyDrawY += 7;
		return bunny;
	};
	
	var update = function() {
		// this is the enterframe listener; it does nothing
	};
	
	var onScreenTouch = function(e) {
		if (e.type === 'touchstart') {
			if (enterframeOn === true) {
				// turn off enterframe listener
				game.removeEventListener("enterframe", update);
				game.enableOnDrawFrameEvent = false;
				enterframeOn = false;
				countLabel.setColor('#ff3014');
			} else {
				// turn on enterframe listener
				game.enableOnDrawFrameEvent = true;
				game.addEventListener("enterframe", update);
				enterframeOn = true;
				countLabel.setColor('#9cf500');
			};
		}
	};
	
	var onFPS = function(e) {
		if (fpsLabel) {
			fpsLabel.text = e.fps.toFixed(2) + ' FPS';
		}
	};

	var onSceneActivated = function(e) {
		var i;
		
		// fill background white
		scene.color(1.0, 1.0, 1.0);
		
		// create initial bunnies
		for (i = 0; i < startBunnyCount; i++) {
			scene.add(createBunnySprite());
		}
		
		// create label to display bunny count
		countLabel = Ti.UI.createLabel({
			text: count + ' bunnies.',
			textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
			color: '#ff3014',
			top: 15,
			width: Ti.UI.SIZE,
			height: Ti.UI.SIZE
		});
		
		// create label to display fps
		fpsLabel = Ti.UI.createLabel({
			text: game.fps + ' FPS',
			textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
			color: '#ffffff',
			top: 38,
			width: Ti.UI.SIZE,
			height: Ti.UI.SIZE
		});
		
		window.add(countLabel);
		window.add(fpsLabel);
		
		labelBackground = platino.createSprite({
			width: game.TARGET_SCREEN.width,
			height: 75
		});
		labelBackground.color(0, 0, 0);
		game.addHUD(labelBackground);
		
		//updateInterval = setInterval(update, 1000/game.fps);
		game.addEventListener('touchstart', onScreenTouch);
		game.addEventListener('onfps', onFPS);
		

		// create a bunny that moves continuously via a transform object
		bunnyTransform = platino.createTransform({
			y: 80,
			autoreverse: true,
			repeat: -1,
			duration: 1000
		});
		movingBunny = createBunnySprite();
		movingBunny.x = (game.TARGET_SCREEN.width * 0.5) - (movingBunny.width * 0.5);
		movingBunny.y = game.TARGET_SCREEN.height - movingBunny.height - 5;
		scene.add(movingBunny);
		movingBunny.transform(bunnyTransform);
		
		// update the bunny count label
		countLabel.setText(count + ' bunnies.');
	};

	scene.addEventListener('activated', onSceneActivated);
	return scene;
};

module.exports = MainScene;