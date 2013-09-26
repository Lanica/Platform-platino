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

var NUMBER_OF_SPRITES = 10;
var sprites = new Array(NUMBER_OF_SPRITES);

for (var i = 0; i < NUMBER_OF_SPRITES; i++) {
    // Create sprite instance with given texture
    sprites[i] = platino.createSprite({image:'graphics/flare.png'});
    
    // Change sprite color to yellow
    sprites[i].color(1, 1, 0);
    
    scene.add(sprites[i]);
}

// add your scene to game view
game.pushScene(scene);

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

    // place sprites at random position
    for (var i = 0; i < NUMBER_OF_SPRITES; i++) {
        sprites[i].x = Math.random() * game.screen.width;
        sprites[i].y = Math.random() * game.screen.height;
    }

    // Start the game
    game.start();
});

game.addEventListener('enterframe', function(e) {

    for (var i = 0; i < NUMBER_OF_SPRITES; i++) {
        sprites[i].x = sprites[i].x + 2;

        // rotate sprites from local coordinate (0, 0)
        sprites[i].rotate(sprites[i].angle + 6);
    
        // If the sprite moves outside of the screen,
        // then the sprite appears from the other side of the screen
        if (sprites[i].x > game.screen.width) {
            sprites[i].x = -sprites[i].width;
        }
    }
});

game.addEventListener('touchstart', function(e) {
    // Change sprite positions at random
    for (var i = 0; i < NUMBER_OF_SPRITES; i++) {
        sprites[i].x = Math.random() * game.screen.width;
        sprites[i].y = Math.random() * game.screen.height;
    }
});

// load debug functions
Ti.include("debug.js");

// Add your game view
window.add(game);

var centerLabel = Titanium.UI.createLabel({
    color:'black',
    backgroundColor:'white',
    text:'touch screen to move sprites',
    font:{fontSize:20,fontFamily:'Helvetica Neue'},
    textAlign:'center',
    width:'auto',
    height:'auto'
});

// add label to the window
window.add(centerLabel);

window.open({fullscreen:true, navBarHidden:true});
