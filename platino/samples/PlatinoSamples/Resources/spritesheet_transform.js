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

var block = platino.createSpriteSheet({image:'graphics/blocks.png', width:32, height:32});
var aButton = platino.createSpriteSheet({image:'graphics/icons_pack_OGRE.xml'});
var bButton = platino.createSpriteSheet({image:'graphics/icons_pack_OGRE.xml'});

aButton.selectFrame("A");
bButton.selectFrame("B");

scene.add(block);
scene.add(aButton);
scene.add(bButton);

// add your scene to game view
game.pushScene(scene);

// scene background color can be changed by using transform
var transform_scene = platino.createTransform();
transform_scene.addEventListener('start', function(e) {
	Ti.API.info("scene transform start");
});
transform_scene.addEventListener('complete', function(e) {
	Ti.API.info("scene transform complete");
	
	startTransformBlock();
});

// transform_scene.addEventListener('complete', function(e) {
// Ti.API.info("scene transform complete");
// });

// Onload event is called when the game is loaded.
// The game.screen.width and game.screen.height are not yet set until this onload event.
game.addEventListener('onload', function(e) {
    // Your game screen size is set here if you did not specifiy game width and height using screen property.
    // Note: game.size.width and height may be changed due to the parent layout so check them here.
    Ti.API.info("view size: " + game.size.width + "x" + game.size.height);
    Ti.API.info("game screen size: " + game.screen.width + "x" + game.screen.height);

    // Move your block to center of the screen
    block.x = (game.screen.width  * 0.5) - (block.width  * 0.5);
    block.y = (game.screen.height * 0.5) - (block.height * 0.5);
    
    // Animate from 0 to 4 frame index at 500 msec  <- animate([frame_index, ...], interval, repeat, 0)
    // This is same as block.animate(0, 5, 500)     <- animate(start_frame_index, frame_count, interval, repeat)
    // The parameter repeat=-1 means infinite loop
    block.animate([0, 1, 2, 3, 4], 500, -1, 0);
    
    aButton.move(0, aButton.height);
    bButton.move(game.screen.width - bButton.width, bButton.height);
    
    // Start the game
    game.start();

	// change background color of the scene to white
	transform_scene.duration = 1000;
	transform_scene.color(1, 1, 1);
	transform_scene.autoreverse = true;
    scene.transform(transform_scene);

	transform_aButton.duration = 1000;
	transform_aButton.rotate(aButton.angle + 360);
	transform_aButton.move(0, game.screen.height - aButton.height);
	transform_aButton.autoreverse = true;
	transform_aButton.repeat = -1; // infinite loop when repeat equals sub zero
	transform_aButton.easing = platino.ANIMATION_CURVE_CUBIC_IN;
	
	transform_bButton.duration = 1000;
	transform_bButton.scale(2, 1);
	transform_bButton.alpha = 0.5;
	transform_bButton.move(0, game.screen.height - bButton.height);
	transform_bButton.autoreverse = true;
	transform_bButton.repeat = -1; // infinite loop when repeat equals sub zero
	transform_bButton.easing =  platino.ANIMATION_CURVE_CUBIC_OUT;
	
	aButton.transform(transform_aButton);
	bButton.transform(transform_bButton);

});

var transform_block_rotate = platino.createTransform();
var transform_block_scale  = platino.createTransform();
var transform_block_move   = platino.createTransform();

var transform_aButton = platino.createTransform();
var transform_bButton = platino.createTransform();

transform_block_rotate.addEventListener('start', function(e) {
	Ti.API.info("block rotation start");
});
transform_block_rotate.addEventListener('complete', function(e) {
	Ti.API.info("block rotation completed");
	transform_block_scale.duration = 1000;
	transform_block_scale.scale(8, 8);
	transform_block_scale.rotate(block.angle + 180);
	transform_block_scale.alpha = 0;
	transform_block_scale.autoreverse = true;
	transform_block_scale.easing =  platino.ANIMATION_CURVE_CUBIC_IN;
	
	block.transform(transform_block_scale);
	
});

function startTransformBlock() {
    // Move your block to center of the screen
    block.x = (game.screen.width  * 0.5) - (block.width  * 0.5);
    block.y = (game.screen.height * 0.5) - (block.height * 0.5);
    
	transform_block_rotate.duration = 1000;
	transform_block_rotate.rotate(block.angle + 180);
	transform_block_rotate.easing =  platino.ANIMATION_CURVE_BACK_IN;
	transform_block_rotate.repeat = 1;
	
	transform_block_move.duration = 1000;
	transform_block_move.x = game.screen.width  - block.width;
	transform_block_move.y = game.screen.height - block.height;
	transform_block_move.autoreverse = true;
	transform_block_move.easing =  platino.ANIMATION_CURVE_BOUNCE_OUT;
	
	// Following easing equations can be used for transformation.
	// For more information abount easing:
	//
	// http://msdn.microsoft.com/en-us/library/cc189019%28VS.96%29.aspx#easing_functions
	// http://www.cocos2d-iphone.org/wiki/doku.php/prog_guide:actions_ease
	//
	// ANIMATION_CURVE_EASE_IN_OUT
	// ANIMATION_CURVE_EASE_IN
	// ANIMATION_CURVE_EASE_OUT
	// ANIMATION_CURVE_LINEAR
	// ANIMATION_CURVE_CUBIC_IN_OUT
	// ANIMATION_CURVE_CUBIC_IN
	// ANIMATION_CURVE_CUBIC_OUT
	// ANIMATION_CURVE_BACK_IN_OUT
	// ANIMATION_CURVE_BACK_IN
	// ANIMATION_CURVE_BACK_OUT
	// ANIMATION_CURVE_ELASTIC_IN_OUT
	// ANIMATION_CURVE_ELASTIC_IN
	// ANIMATION_CURVE_ELASTIC_OUT
	// ANIMATION_CURVE_BOUNCE_IN_OUT
	// ANIMATION_CURVE_BOUNCE_IN
	// ANIMATION_CURVE_BOUNCE_OUT
	// ANIMATION_CURVE_EXPO_IN_OUT
	// ANIMATION_CURVE_EXPO_IN
	// ANIMATION_CURVE_EXPO_OUT
	// ANIMATION_CURVE_QUAD_IN_OUT
	// ANIMATION_CURVE_QUAD_IN
	// ANIMATION_CURVE_QUAD_OUT
	// ANIMATION_CURVE_SINE_IN_OUT
	// ANIMATION_CURVE_SINE_IN
	// ANIMATION_CURVE_SINE_OUT
	// ANIMATION_CURVE_CIRC_IN_OUT
	// ANIMATION_CURVE_CIRC_IN
	// ANIMATION_CURVE_CIRC_OUT
	// ANIMATION_CURVE_QUINT_IN_OUT
	// ANIMATION_CURVE_QUINT_IN
	// ANIMATION_CURVE_QUINT_OUT
	// ANIMATION_CURVE_QUART_IN_OUT
	// ANIMATION_CURVE_QUART_IN
	// ANIMATION_CURVE_QUART_OUT
	
	// Multiple transforms can be added at a time by calling transform() sequencially
	block.transform(transform_block_move);
	block.transform(transform_block_rotate);
}
game.addEventListener('touchstart', function(e) {
	startTransformBlock();
});

// Add your game view
window.add(game);

// load debug functions
Ti.include("debug.js");

var centerLabel = Titanium.UI.createLabel({
    color:'black',
    backgroundColor:'white',
    text:'touch screen to move the block',
    font:{fontSize:20,fontFamily:'Helvetica Neue'},
    textAlign:'center',
    width:'auto',
    height:'auto',
    top:0
});

// add label to the window
window.add(centerLabel);

window.open({fullscreen:true, navBarHidden:true});
