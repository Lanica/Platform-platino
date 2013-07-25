var window = Ti.UI.createWindow({backgroundColor:'black',
    orientationModes: [
        Ti.UI.LANDSCAPE_LEFT,
        Ti.UI.LANDSCAPE_RIGHT,
        Ti.UI.PORTRAIT,
        Ti.UI.UPSIDE_PORTRAIT
    ]
});

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

var button_transform2d = platino.createSprite({image:'graphics/button_2d.png'});
var button_transform3d = platino.createSprite({image:'graphics/button_3d.png'});
var button_reset       = platino.createSprite({image:'graphics/button_reset.png'});

background.z = 0;
dog1.z   = 1;
dog2.z = 1;
dog3.z = 1;

scene.add(background);
scene.add(dog1);
scene.add(dog2);
scene.add(dog3);

game.addHUD(button_transform2d);
game.addHUD(button_transform3d);
game.addHUD(button_reset);

// add your scene to game view
game.pushScene(scene);

// We should calculate the view scale because game.size.width and height may be changed due to the parent layout.
var WINDOW_SCALE_FACTOR_X = 1;
var WINDOW_SCALE_FACTOR_Y = 1;

// Onload event is called when the game is loaded.
// The game.screen.width and game.screen.height are not yet set until this onload event.
game.addEventListener('onload', function(e) {
    updateSpritePositions();

    dog1.animate([2, 3], 500, -1, 0);
    dog2.animate([5, 6], 500, -1, 0);
    dog3.animate([0, 1], 500, -1, 0);
    
    // Start the game
    game.start();
});

function updateSpritePositions() {
    // set screen size for your game (non-retina size)
    var screenScale = game.size.width / 320;
    game.screen = {width:game.size.width / screenScale, height:game.size.height / screenScale};

    // Move your dog to center of the screen
    dog1.x = (game.screen.width  * 0.5) - (dog1.width  * 0.5);
    dog1.y = (game.screen.height * 0.5) - (dog1.height * 0.5);
    
    background.x = (game.screen.width  * 0.5) - (background.width  * 0.5);
    background.y = (game.screen.height * 0.5) - (background.height * 0.5);
 
    dog2.move(0, dog2.height);
    dog3.move(game.screen.width - dog3.width, dog3.height);
    
    button_transform2d.move(10, game.screen.height - button_transform2d.height - 10);
    button_transform3d.move(game.screen.width - button_transform3d.width - 10, game.screen.height - button_transform3d.height - 10);
    button_reset.move((game.screen.width  * 0.5) - (button_reset.width * 0.5), game.screen.height - button_reset.height - 10);
    
    WINDOW_SCALE_FACTOR_X = game.screen.width  / game.size.width;
    WINDOW_SCALE_FACTOR_Y = game.screen.height / game.size.height;

    Ti.API.info("view size: " + game.size.width + "x" + game.size.height);
    Ti.API.info("game screen size: " + game.screen.width + "x" + game.screen.height);
    Ti.API.info("game.camera " + game.camera.eyeZ);
    Ti.API.info("game.defaultCamera " + game.defaultCamera.eyeZ);
}

//
// Called when orientation is changed
//
game.addEventListener('orientationchange', function(e) {
    Ti.API.info("orientatinchange");
    game.orientation = e.orientation;
    updateSpritePositions();

    // We have to move our camera because camera setting has been changed
    if (transform_camera.is3d) {
        transform_3d();
    } else {
        transform_2d();
    }
});

//
// transform 3d
//
function transform_standup_3d(target) {
	var transform = platino.createTransform();
	
	transform.duration = 1000;
	transform.easing = platino.ANIMATION_CURVE_LINEAR;
	transform.rotate_axis = platino.X;
	transform.rotate_centerX = dog2.width * 0.5;
	transform.rotate_centerY = dog2.height;
	transform.angle = -90;
	
	target.transform(transform);
}

//
// transform 2d
//
function transform_sitdown_2d(target) {
	var transform = platino.createTransform();
	
	transform.duration = 1000;
	transform.easing = platino.ANIMATION_CURVE_LINEAR;
	transform.rotate_axis = platino.X;
	transform.rotate_centerX = dog2.width * 0.5;
	transform.rotate_centerY = dog2.height;
	transform.angle = 0;
	
	target.transform(transform);
}

var transform_camera = platino.createTransform();

transform_camera.addEventListener('complete', function(e) {
	if (transform_camera.is3d) {
		transform_standup_3d(dog1);
		transform_standup_3d(dog2);
		transform_standup_3d(dog3);
	} else {
		transform_sitdown_2d(dog1);
		transform_sitdown_2d(dog2);
		transform_sitdown_2d(dog3);
	}
});
	
//
// 3D camera transfromation
//
function transform_3d() {
	transform_camera.is3d = true;
	transform_camera.duration = 3000;
	transform_camera.lookAt_eyeY = game.screen.height;
	transform_camera.lookAt_eyeZ = 64;
	transform_camera.lookAt_centerY = 0;
	transform_camera.easing = platino.ANIMATION_CURVE_LINEAR;
	
	game.moveCamera(transform_camera);
}

function transform_2d() {
    var default2dCameraSetting = game.defaultCamera;

	transform_camera.is3d = false;
	transform_camera.duration = 3000;
    transform_camera.lookAt_eyeX = default2dCameraSetting.eyeX;
    transform_camera.lookAt_eyeY = default2dCameraSetting.eyeY;
	transform_camera.lookAt_eyeZ = default2dCameraSetting.eyeZ;
	transform_camera.lookAt_centerX = default2dCameraSetting.centerX;
    transform_camera.lookAt_centerY = default2dCameraSetting.centerY;
	transform_camera.easing = platino.ANIMATION_CURVE_LINEAR;
	
	game.moveCamera(transform_camera);
}

function resetCamera() {
	dog1.angle = 0;
	dog2.angle = 0;
	dog3.angle = 0;
	
	game.resetCamera();

    transform_camera.is3d = false;
}

game.addEventListener('touchstart', function(e) {
	var x = e.x * WINDOW_SCALE_FACTOR_X;
    var y = e.y * WINDOW_SCALE_FACTOR_Y;
   
	if (button_transform2d.contains(x, y)) {
		button_transform2d.color(0.78, 0.78, 0.78);
	} else if (button_transform3d.contains(x, y)) {
		button_transform3d.color(0.78, 0.78, 0.78);
	} else if (button_reset.contains(x, y)) {
		button_reset.color(0.78, 0.78, 0.78);
	}
});

game.addEventListener('touchend', function(e) {
	var x = e.x * WINDOW_SCALE_FACTOR_X;
    var y = e.y * WINDOW_SCALE_FACTOR_Y;

	if (button_transform2d.contains(x, y)) {
		button_transform2d.color(1, 1, 1);
		transform_2d();
	} else if (button_transform3d.contains(x, y)) {
		button_transform3d.color(1, 1, 1);
		transform_3d();
	} else if (button_reset.contains(x, y)) {
		button_reset.color(1, 1, 1);
		resetCamera();
	}
});

// Add your game view
window.add(game);

// load debug functions
Ti.include("debug.js");

window.open({fullscreen:true, navBarHidden:true});
