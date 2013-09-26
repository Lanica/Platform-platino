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
var explosion = platino.createSpriteSheet({image:'graphics/explosion.png', width:19, height:19, border:3, margin:2});

scene.add(block);
scene.add(explosion);

// add your scene to game view
game.pushScene(scene);

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
    
    explosion.x = (game.screen.width  * 0.5) - (explosion.width  * 0.5);
    explosion.y = block.y +( block.height * 2);
    
    // Animate from 0 to 4 frame index at 500 msec  <- animate([frame_index, ...], interval, repeat, 0)
    // This is same as block.animate(0, 5, 500)     <- animate(start_frame_index, frame_count, interval, repeat)
    // The parameter repeat=-1 means infinite loop
    block.animate([0, 1, 2, 3, 4], 500, -1, 0);
    
    // Animate from 0 to 9 frame index at 100 msec, inifinite loop
    explosion.animate(0, 10, 100, -1);
    
    // Start the game
    game.start();
});

// game.addEventListener('enterframe', function(e) {
//
// });
//
// game.addEventListener('touchstart', function(e) {
//
// });

// Add your game view
window.add(game);

// load debug functions
Ti.include("debug.js");
window.open({fullscreen:true, navBarHidden:true});
