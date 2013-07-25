//
// Using Box2d Physics (iOS only)
//
// This is alloy port of Appcelerator's Ti.Box2d module.
//
// For more information about Ti.Box2d, see official documentation below.
// https://github.com/appcelerator/titanium_modules/blob/master/box2d/mobile/ios/README.md
//

var window = Ti.UI.createWindow({backgroundColor:'black'});

// Obtain game module
var platino = require('co.lanica.platino');

// Create view for your game.
// Note that game.screen.width and height are not yet set until the game is loaded
var game = platino.createGameView();

// The physics world surface accepts GameView instance.
var world = platino.createBox2dWorld({surface:game});

// Frame rate can be changed (fps can not be changed after the game is loaded)
game.fps = 30;

// set initial background color to black
game.color(0, 0, 0);

game.debug = true;

// Create game scene
var scene = platino.createScene();

// create new shape
var boxShape  = platino.createSprite({width:64, height:64});
var ballShape = platino.createSprite({image:'graphics/A.png'});

// create floor and walls
var floor     = platino.createSprite();
var leftWall   = platino.createSprite();
var rightWall  = platino.createSprite();

// color(red, green, blue) takes values from 0 to 1
boxShape.color(1, 0, 0);
ballShape.color(0, 0, 1);

// add your shape to the scene
scene.add(boxShape);
scene.add(ballShape);
scene.add(floor);
scene.add(leftWall);
scene.add(rightWall);

// add your scene to game view
game.pushScene(scene);

// body.setAngle accepts radians value so we need this function
function degreeToRadians(x) {
    return (Math.PI * x / 180.0);
}

// bodyrefs are reference of physical bodies
var redBodyRef, blueBodyRef, floorRef, leftWallRef;

// Onload event is called when the game is loaded.
// The game.screen.width and game.screen.height are not yet set until this onload event.
game.addEventListener('onload', function(e) {
    // Your game screen size is set here if you did not specifiy game width and height using screen property.
    // Note: game.size.width and height may be changed due to the parent layout so check them here.
    Ti.API.info("view size: " + game.size.width + "x" + game.size.height);
    Ti.API.info("game screen size: " + game.screen.width + "x" + game.screen.height);

	floor.width     = game.screen.width;
	leftWall.width  = 10;
	rightWall.width = 10;
	
	floor.height     = 10;
	leftWall.height  = game.screen.height;
	rightWall.height = game.screen.height;

	boxShape.move(game.screen.width  * 0.5 - boxShape.width  * 0.5, 0);
	ballShape.move(game.screen.width * 0.5 - ballShape.width * 0.5, -32);
	
	floor.move(0, game.screen.height * 0.75);
	
	leftWall.move(0, 0);
	rightWall.move(game.screen.width - rightWall.width, 0);
	
	// add bodies to the world
	// Note: this should be done AFTER game.screen has been set and all sprites has been initialized
	// otherwise physics world and its bodies can not determine their size.
	redBodyRef = world.addBody(boxShape, {
		density: 12.0,
	    friction: 0.3,
	    restitution: 0.4,
	    type: "dynamic"
	});

	blueBodyRef = world.addBody(ballShape, {
		radius: 16,
	    density: 12.0,
	    friction: 0.3,
	    restitution: 0.4,
	    type: "dynamic"
	});

	floorRef = world.addBody(floor, {
		density:12.0,
	    friction:0.3,
	    restitution:0.4,
	    type:"static"
	});

	leftWallRef = world.addBody(leftWall, {
		density:12.0,
	    friction:0.3,
	    restitution:0.4,
	    type:"static"
	});
	
	rightWallRef = world.addBody(rightWall, {
		density:12.0,
	    friction:0.3,
	    restitution:0.4,
	    type:"static"
	});
	
	redBodyRef.setAngle(degreeToRadians(45));
	floorRef.setAngle(degreeToRadians(15));
	
    // Start the game
    game.start();
    
    // Start the physics world
    world.start();
});

world.addEventListener("collision", function(e) {
	if ((e.a == redBodyRef || e.b == redBodyRef) && e.phase == "begin") {
		Ti.API.info("the red block collided with something");
		Ti.API.info(JSON.stringify(e));
	}
});

game.addEventListener('touchstart', function(e) {
	
});

// Add your game view
window.add(game);
window.open({fullscreen:true, navBarHidden:true});

