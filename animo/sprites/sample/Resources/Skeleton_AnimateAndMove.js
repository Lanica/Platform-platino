var window = Ti.UI.createWindow({backgroundColor:'white', orientationModes: [Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT] });

// Obtain game module
var platino = require('co.lanica.platino');

var animo = require("animo");


// Create view for your game.
// Note that game.screen.width and height are not yet set until the game is loaded
var game = platino.createGameView();

// ENABLE 'enterframe' event
game.enableOnDrawFrameEvent = true;

// Frame rate can be changed (fps can not be changed after the game is loaded)
game.fps = 30;

// set initial background color to black
game.color(0, 0, 0);

// Create game scene
var scene = platino.createScene();

// add your scene to game view
game.pushScene(scene);

var updateTimer = null;
var mySkeleton = null;



update = function() {
    
    var posX = mySkeleton.getPositionX();
    var posY = mySkeleton.getPositionY();
    
    
    if(posX > game.screen.width || posX < 0)
    {
        mySkeleton.setFlipX(!mySkeleton.getFlipX());
    }    
    
    if(mySkeleton.getFlipX() == true)
    {
        posX = posX - 0.8;
    }
    else
    {
        posX = posX + 0.8;
    }
    
    mySkeleton.setPosition(posX, posY);
    updateTimer = setTimeout(update, (15 * 0.1) * 2);   
};


// Onload event is called when the game is loaded.
// The game.screen.width and game.screen.height are not yet set until this onload event.
game.addEventListener('onload', function(e) {
    // Your game screen size is set here if you did not specifiy game width and height using screen property.
    // Note: game.size.width and height may be changed due to the parent layout so check them here.
    Ti.API.info("view size: " + game.size.width + "x" + game.size.height + "W" + game.screen.width + "H" + game.screen.height);
    Ti.API.info("game screen size: " + game.screen.width + "x" + game.screen.height);
    
    // Start the game
    game.start();
    
    createSkeletonAtPosition(game.screen.width*0.5, game.screen.height*0.5+ 100);
    
    updateTimer = setTimeout(update, (15 * 0.1) * 2);
});


function createSkeletonAtPosition(posX, posY)
{

    var suffix = "";

	    // load skeleton atlas based on device
        if (game.screen.width == 320 || game.screen.width == 480) { //iphone 2G,3G 3GS
            Ti.API.info("Create skeleton for normal iphones");
            suffix = "";
        }
        else if(game.screen.width == 640 || game.screen.width == 960) { //iphone 4, 4S, 5, 5S (retina)
            Ti.API.info("Create skeleton for retina iphones");
            suffix = "-hd";     
        }
        if(game.screen.width == 768 || game.screen.width == 1024) { //ipad 1, 2, mini
            Ti.API.info("Create skeleton for normal ipads");
            suffix = "-ipad";     
        }
        else if(game.screen.width == 1536 || game.screen.width == 2048) { //ipad 3, 4 (retina)
            Ti.API.info("Create skeleton for retina ipads");
            suffix = "-ipadhd";     
        }   		

        mySkeleton = animo.createSkeletonWithFile("graphics/RES_Skeletons_LoadTest/skeletons/Officer_Officer" + suffix + ".json",
                                                        scene);     
        mySkeleton.setPosition(posX, posY);
	
	    var animToLoadName = "StrongWalk";
		
		// load skeleton atlas based on device
        var animToLoadPath = "graphics/RES_Skeletons_LoadTest/skeletons/animations/" + animToLoadName + suffix + ".json";     
        
        var anim = animo.createSkeletalAnimationWithFile(animToLoadPath);
        mySkeleton.playAnimation(anim);
}


game.addEventListener('touchstart', function(e) {
        
    if(mySkeleton)
    {
       // mySkeleton.flipX();
    }
});






// Add your game view
window.add(game);

// load debug functions
Ti.include("debug.js");

window.open({fullscreen:true, navBarHidden:true});
