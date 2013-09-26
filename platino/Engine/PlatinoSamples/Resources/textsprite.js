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

game.debug = true;

// Create game scene
var scene = platino.createScene();

// create new text
var text = platino.createTextSprite({text:'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum rutrum. ', fontSize:24});
text.textAlign = Ti.UI.TEXT_ALIGNMENT_CENTER;

// Text size can be obtained without rendering or setting text ... will be available in alloy 1.3
// var loremTextSize = text.sizeWithText("Lorem ipsum dolor sit amet");
// Ti.API.info("'Lorem ipsum dolor sit amet' = " + loremTextSize.width + "x" + loremTextSize.height);

// color(red, green, blue) takes values from 0 to 1
text.color(1, 1, 1);

// add your text to the scene
scene.add(text);

// add your scene to game view
game.pushScene(scene);

// Onload event is called when the game is loaded.
// The game.screen.width and game.screen.height are not yet set until this onload event.
game.addEventListener('onload', function(e) {
    // Your game screen size is set here if you did not specifiy game width and height using screen property.
    // Note: game.size.width and height may be changed due to the parent layout so check them here.
    Ti.API.info("view size: " + game.size.width + "x" + game.size.height);
    Ti.API.info("game screen size: " + game.screen.width + "x" + game.screen.height);

	text.width  = game.screen.width  * 0.5;
	text.height = game.screen.height * 0.25;
    
    // Move your text to center of the screen
    //text.x = (game.screen.width  * 0.5)  - (text.width  * 0.5);
    //text.y = (game.screen.height * 0.25) - (text.height * 0.5);
    
    text.center = {x:game.screen.width * 0.5, y:game.screen.height * 0.5};
    Ti.API.info("center: " + text.center.x + "x" + text.center.y);
    
    // Start the game
    game.start();
});

game.addEventListener('touchstart', function(e) {
     // We should calculate the view scale because game.size.width and height may be changed due to the parent layout.
    var scaleX = game.screen.width  / game.size.width;
    var scaleY = game.screen.width  / game.size.width;
    
    // Move your text to center of the event position
    text.center = {x:e.x * scaleX, y:e.y * scaleY};
});

// load debug functions
Ti.include("debug.js");

// Add your game view
window.add(game);

window.open({fullscreen:true, navBarHidden:true});