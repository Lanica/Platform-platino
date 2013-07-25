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
    Ti.API.info("view size: " + game.size.width + "x" + game.size.height);
    Ti.API.info("game screen size: " + game.screen.width + "x" + game.screen.height);

    //
    // Example: Download appc logo image from the Internet
    //
    var xhr = Titanium.Network.createHTTPClient({
        onload : function() {
            //
            // Create new sprite and load texture data from response data
            //
            appc_logo = platino.createSprite();
            appc_logo.tag = "APPC_LOGO";

            // Set texture data by using data property
            appc_logo.data = this.responseData;
            
            // sprite name and texture name must be unique, so
            // alloy automatically set unique name to the sprite like 'tiblob://02F30ECE-F6DA-40C9-9353-678171E28DFC'
            
            // Load texture data (same as appc_logo.data = this.responseData;)
            // appc_logo.loadTextureByBlob(this.responseData);
            
            // Load texture data with unique name, this name will be only used for debug.
            // appc_logo.loadTextureByBlobWithName("THIS_NAME_MUST_BE_UNIQUE.png", this.responseData);
         
            scene.add(appc_logo);
        },
        timeout : 10000
    });
    xhr.open('GET', 'http://static.appcelerator.com/images/header/appc_logo.png');
    xhr.send();
    
    //
    // Example: Create TiBlob object from image file and load it to the sprite
    //
    /*
     var appc_logo_file = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, "graphics/A.png");
     if (appc_logo_file.exists()) {
         appc_logo = platino.createSprite({data:appc_logo_file.read()});
         appc_logo.tag = "APPC_LOGO";

         scene.add(appc_logo);
     }
     */
    
    // Start the game
    game.start();
});

game.addEventListener('onloadsprite', function(e) {
    if (e.tag == "APPC_LOGO") {
        appc_logo.center = {x:game.screen.width * 0.5, y:game.screen.height * 0.5};
    }
});

// load debug functions
Ti.include("debug.js");

// Add your game view
window.add(game);

window.open({fullscreen:true, navBarHidden:true});