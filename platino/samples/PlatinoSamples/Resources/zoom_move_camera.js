var window = Ti.UI.createWindow({backgroundColor:'black'});

// Obtain game module
var platino = require('co.lanica.platino');

// Create view for your game.
// Note that game.screen.width and height are not yet set until the game is loaded
var game = platino.createGameView();

// Frame rate can be changed (fps can not be changed after the game is loaded)
game.fps = 30;

// set initial background color to black
game.color(0, 0, 0);

// Create game scene
var scene = platino.createScene();

var background = platino.createSprite({image:'graphics/Splash.png'});

var dog1     = platino.createSpriteSheet({image:'graphics/dog.png', width:34, height:42, border:1, margin:1});
var dog2     = platino.createSpriteSheet({image:'graphics/dog.png', width:34, height:42, border:1, margin:1});
var dog3     = platino.createSpriteSheet({image:'graphics/dog.png', width:34, height:42, border:1, margin:1});

var button_zoomout = platino.createSprite({image:'graphics/button_zoomout.png'});
var button_zoomin  = platino.createSprite({image:'graphics/button_zoomin.png'});
var button_reset   = platino.createSprite({image:'graphics/button_reset.png'});

background.z = 0;
dog1.z   = 1;
dog2.z = 1;
dog3.z = 1;

scene.add(background);
scene.add(dog1);
scene.add(dog2);
scene.add(dog3);

game.addHUD(button_zoomout);
game.addHUD(button_zoomin);
game.addHUD(button_reset);

// add your scene to game view
game.pushScene(scene);

// variable to save 2d camera setting
var default2dCameraSetting;

// We should calculate the view scale because game.size.width and height may be changed due to the parent layout.
var WINDOW_SCALE_FACTOR_X = 1;
var WINDOW_SCALE_FACTOR_Y = 1;

// Onload event is called when the game is loaded.
// The game.screen.width and game.screen.height are not yet set until this onload event.
game.addEventListener('onload', function(e) {
	// set screen size for your game (non-retina size)
	var screenScale = game.size.width / 320;
	game.screen = {width:game.size.width / screenScale, height:game.size.height / screenScale};
	
    // Your game screen size is set here if you did not specifiy game width and height using screen property.
    // Note: game.size.width and height may be changed due to the parent layout so check them here.
    Ti.API.info("view size: " + game.size.width + "x" + game.size.height);
    Ti.API.info("game screen size: " + game.screen.width + "x" + game.screen.height);

    // Move your dog to center of the screen
    dog1.x = (game.screen.width  * 0.5) - (dog1.width  * 0.5);
    dog1.y = (game.screen.height * 0.5) - (dog1.height * 0.5);
    
    background.x = (game.screen.width  * 0.5) - (background.width  * 0.5);
    background.y = (game.screen.height * 0.5) - (background.height * 0.5);
    
    dog1.animate([2, 3], 500, -1, 0);
    dog2.animate([5, 6], 500, -1, 0);
    dog3.animate([0, 1], 500, -1, 0);
    
    dog2.move(0, dog2.height);
    dog3.move(game.screen.width - dog3.width, dog3.height);
    
    default2dCameraSetting = game.camera;
    
    button_zoomout.move(10, game.screen.height - button_zoomout.height - 10);
    button_zoomin.move(game.screen.width - button_zoomin.width - 10, game.screen.height - button_zoomin.height - 10);
    button_reset.move((game.screen.width  * 0.5) - (button_reset.width * 0.5), game.screen.height - button_reset.height - 10);
    
    WINDOW_SCALE_FACTOR_X = game.screen.width  / game.size.width;
    WINDOW_SCALE_FACTOR_Y = game.screen.height / game.size.height;
    
    // Start the game
    game.start();
});

var dogIndex = 0;
var transform_camera = platino.createTransform();

function getSpriteCenterX(sprite) {
	return sprite.x + (sprite.width * 0.5);
}

function getSpriteCenterY(sprite) {
	return sprite.y + (sprite.height * 0.5);
}

function zoom_in() {
	transform_camera.duration = 1000;
	transform_camera.easing = platino.ANIMATION_CURVE_BACK_OUT;
	
	switch (dogIndex) {
		case 0: transform_camera.lookAt_eyeX = getSpriteCenterX(dog1); transform_camera.lookAt_eyeY = getSpriteCenterY(dog1); break;
		case 1: transform_camera.lookAt_eyeX = getSpriteCenterX(dog2); transform_camera.lookAt_eyeY = getSpriteCenterY(dog2); break;
		case 2: transform_camera.lookAt_eyeX = getSpriteCenterX(dog3); transform_camera.lookAt_eyeY = getSpriteCenterY(dog3); break;
	}
	
	transform_camera.lookAt_centerX = transform_camera.lookAt_eyeX;
	transform_camera.lookAt_centerY = transform_camera.lookAt_eyeY;
	transform_camera.lookAt_eyeZ = 64;
	
	game.moveCamera(transform_camera);
	
	dogIndex = dogIndex + 1;
	if (dogIndex > 2) dogIndex = 0;
}

function zoom_out() {
	transform_camera.duration = 1000;
	transform_camera.easing = platino.ANIMATION_CURVE_BACK_OUT;
	
	transform_camera.lookAt_eyeX = default2dCameraSetting.eyeX;
	transform_camera.lookAt_eyeY = default2dCameraSetting.eyeY;
	transform_camera.lookAt_eyeZ = default2dCameraSetting.eyeZ;
	
	transform_camera.lookAt_centerX = default2dCameraSetting.centerX;
	transform_camera.lookAt_centerY = default2dCameraSetting.centerY;
	
	game.moveCamera(transform_camera);
}

function resetCamera() {
	dog1.angle = 0;
	dog2.angle = 0;
	dog3.angle = 0;
	
	game.resetCamera();
}

game.addEventListener('touchstart', function(e) {
	var x = e.x * WINDOW_SCALE_FACTOR_X;
    var y = e.y * WINDOW_SCALE_FACTOR_Y;
   
	if (button_zoomin.contains(x, y)) {
		button_zoomin.color(0.78, 0.78, 0.78);
	} else if (button_zoomout.contains(x, y)) {
		button_zoomout.color(0.78, 0.78, 0.78);
	} else if (button_reset.contains(x, y)) {
		button_reset.color(0.78, 0.78, 0.78);
	}
});

game.addEventListener('touchend', function(e) {
	var x = e.x * WINDOW_SCALE_FACTOR_X;
    var y = e.y * WINDOW_SCALE_FACTOR_Y;
   
	if (button_zoomin.contains(x, y)) {
		button_zoomin.color(1, 1, 1);
		zoom_in();
	} else if (button_zoomout.contains(x, y)) {
		button_zoomout.color(1, 1, 1);
		zoom_out();
	} else if (button_reset.contains(x, y)) {
		button_reset.color(1, 1, 1);
		resetCamera();
	} else {
		// FYI: if camera eye property has been changed, we should take camera position into account
		// when calculating position of touch event
		if (transform_camera.lookAt_eyeZ !== null) {
			var camera_rate = transform_camera.lookAt_eyeZ / default2dCameraSetting.eyeZ;
		
			var newX = (x * camera_rate) + (transform_camera.lookAt_eyeX - (game.screen.width  * camera_rate * 0.5));
			var newY = (y * camera_rate) + (transform_camera.lookAt_eyeY - (game.screen.height * camera_rate * 0.5));
		
			Ti.API.info("touchend: " + newX + "x" + newY);
		}
	}
});

// Add your game view
window.add(game);

// load debug functions
Ti.include("debug.js");

window.open({fullscreen:true, navBarHidden:true});
