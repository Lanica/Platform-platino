var window = Ti.UI.createWindow({backgroundColor:'black'});

// Obtain game module
var platino = require('co.lanica.platino');

var animo = require("animo");


// Create view for your game.
// Note that game.screen.width and height are not yet set until the game is loaded
var game = platino.createGameView();

// Frame rate can be changed (fps can not be changed after the game is loaded)
game.fps = 30;

// set initial background color to black
game.color(0, 0, 0);

// Create game scene
var scene = platino.createScene();

// add your scene to game view
game.pushScene(scene);


// Onload event is called when the game is loaded.
// The game.screen.width and game.screen.height are not yet set until this onload event.
game.addEventListener('onload', function(e) {
    // Your game screen size is set here if you did not specifiy game width and height using screen property.
    // Note: game.size.width and height may be changed due to the parent layout so check them here.
    Ti.API.info("view size: " + game.size.width + "x" + game.size.height + "W" + game.screen.width + "H" + game.screen.height);
    Ti.API.info("game screen size: " + game.screen.width + "x" + game.screen.height);

    // Start the game
    game.start();
    
    // create new 
	var text = platino.createTextSprite({text:'Touch screen to create sprite sheet animation.', fontSize:14});
	text.textAlign = Ti.UI.TEXT_ALIGNMENT_CENTER;
	text.color(1, 1, 1);
	text.center = {x:game.screen.width * 0.5, y:game.screen.height * 0.5};
	scene.add(text);

});

function createNewSpriteAtPosition(posX, posY)
{

var sprite = null;//craete a temporary variable to store the sprite sheet

    var suffix = "";

    if(game.screen.width == 320 || game.screen.width == 480) { //iphone 2G,3G 3GS
		suffix = "";
	}
    else if(game.screen.width == 640 || game.screen.width == 960) { //iphone 4, 4S, 5, 5S (retina)
        suffix = "-hd";
	}
    if(game.screen.width == 768 || game.screen.width == 1024) { //ipad 1, 2, mini
        suffix = "-ipad";
    }
    else if(game.screen.width == 1536 || game.screen.width == 2048) { //ipad 3, 4 (retina)
        suffix = "-ipadhd";
    }
  
    var pathToAnimationFile = "graphics/RES_SpriteSheetAnimation/spriteSheetAnimationsTest_SheetAnimations"+suffix+".json";
    
    var animation = animo.createSpriteSheetAnimationWithFile(pathToAnimationFile, "fireAnim");
    
  // We should calculate the view scale because game.size.width and height may be changed due to the parent layout.
    var scale = game.screen.width  / game.size.width;
  // Move your sprite to center of the screen
    animation.x = (posX * scale) - (animation.width * 0.5);
    animation.y = (posY * scale) - (animation.height * 0.5);
    
    
	scene.add(animation);  
    
    animation.scale(2);
    animation.play();  
}


game.addEventListener('touchstart', function(e) {
        
    createNewSpriteAtPosition(e.x, e.y);

});



// Add your game view
window.add(game);

// load debug functions
Ti.include("debug.js");

window.open({fullscreen:true, navBarHidden:true});
