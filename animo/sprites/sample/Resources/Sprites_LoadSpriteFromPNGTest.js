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
    
    //why does \n does not work???
    
	// create new 
	var text = platino.createTextSprite({text:'Touch screen to create sprite.', fontSize:14});
	text.textAlign = Ti.UI.TEXT_ALIGNMENT_CENTER;
	text.color(1, 1, 1);
	text.center = {x:game.screen.width * 0.5, y:game.screen.height * 0.5};
	scene.add(text);


	var text2 = platino.createTextSprite({text:'Please read the commets at line 45 ', fontSize:14});
	text2.textAlign = Ti.UI.TEXT_ALIGNMENT_CENTER;
	text2.color(1, 1, 1);
	text2.center = {x:game.screen.width * 0.5, y:game.screen.height * 0.5 + 20};
	scene.add(text2);
	
	var text3 = platino.createTextSprite({text:'in Sprites_LoadSpriteFromPNGTest.js ', fontSize:14});
	text3.textAlign = Ti.UI.TEXT_ALIGNMENT_CENTER;
	text3.color(1, 1, 1);
	text3.center = {x:game.screen.width * 0.5, y:game.screen.height * 0.5 + 40};
	scene.add(text3);

});

// game.addEventListener('enterframe', function(e) {
//
// });

function createNewSpriteAtPosition(posX, posY)
{

//When it comes to Platino make sure you set the path where the atlases and images to be generated in the sheet "Folder" property
//Then when you publish choose the "Resources" folder.
//Please investigate how "loadSprites.shdoc" has the "Folder" property set inside SpriteHelper

var sprite = null;//craete a temporary variable to store the sprite sheet

	var availableSpriteNames=new Array("backpack","banana","bananabunch", "canteen", "hat", "pineapple", "statue");

// load texture atlas based on device
  	if (game.screen.width == 320 || game.screen.width == 480) { //iphone 2G,3G 3GS
		sprite = platino.createSpriteSheet({asset:'graphics/RES_Sprites_LoadSpriteFromPNGTest/loadSprites_spritesSheet.xml'});
	}
  	else if(game.screen.width == 640 || game.screen.width == 960) { //iphone 4, 4S, 5, 5S (retina)
    	sprite = platino.createSpriteSheet({asset:'graphics/RES_Sprites_LoadSpriteFromPNGTest/loadSprites_spritesSheet-hd.xml'});
	}
   	if(game.screen.width == 768 || game.screen.width == 1024) { //ipad 1, 2, mini
    	sprite = platino.createSpriteSheet({asset:'graphics/RES_Sprites_LoadSpriteFromPNGTest/loadSprites_spritesSheet-ipad.xml'});
  	}
  	else if(game.screen.width == 1536 || game.screen.width == 2048) { //ipad 3, 4 (retina)
   		sprite = platino.createSpriteSheet({asset:'graphics/RES_Sprites_LoadSpriteFromPNGTest/loadSprites_spritesSheet-ipadhd.xml'});
  	}
  
  //change to any of the sprite in the sheet randomly
    sprite.selectFrame(availableSpriteNames[Math.floor(Math.random() * availableSpriteNames.length)]);
    
    
  // We should calculate the view scale because game.size.width and height may be changed due to the parent layout.
    var scale = game.screen.width  / game.size.width;
    
  // Move your sprite to center of the screen
    sprite.x = (posX * scale) - (sprite.width * 0.5);
    sprite.y = (posY * scale) - (sprite.height * 0.5);
    
    
	scene.add(sprite);  
}


game.addEventListener('touchstart', function(e) {
        
    createNewSpriteAtPosition(e.x, e.y);

});



// Add your game view
window.add(game);

// load debug functions
Ti.include("debug.js");

// var centerLabel = Titanium.UI.createLabel({
    // color:'black',
    // backgroundColor:'clear',
    // text:'Touch screen to change sprite.\nPlease read the commets at line 45 in Sprites_LoadSpriteFromPNGTest.js',
    // font:{fontSize:20,fontFamily:'Helvetica Neue'},
    // textAlign:'center',
    // width:'auto',
    // height:'auto'
// });
// 
// // add label to the window
// window.add(centerLabel);

window.open({fullscreen:true, navBarHidden:true});
