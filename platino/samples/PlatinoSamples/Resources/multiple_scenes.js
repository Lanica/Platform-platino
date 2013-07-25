var window = Ti.UI.createWindow({backgroundColor:'black'});

// Obtain game module
var platino = require('co.lanica.platino');

// Create view for your game.
// Note that game.screen.width and height are not yet set until the game is loaded
var game = platino.createGameView();

// Frame rate can be changed (fps can not be changed after the game is loaded)
game.fps = 30;

// set initial background color to blue because the first scene is blue
game.color(0, 0, 1);

// scene definitions
var SceneA = {
    scene:null,
    sprite:null,
    init:function() {
        this.scene = platino.createScene();
        
        var onloadsprite = (function(self) {
            return function(e) {
                Ti.API.info("onlaodsprite: " + e.name);
                if (e.name == "graphics/A.png") {
                    game.startCurrentScene();
                }
            };
        })(this);
        
        var touchstart = (function(self) {
            return function(e) {
                game.replaceScene(SceneB.scene);
            };
        })(this);
        
        var enterframe = (function(self) {
            return function(e) {
                
            };
        })(this);
        
        var activated = (function(self) {
            return function(e) {
                Ti.API.info("scene A is activated");
                
                // Set background color to blue
                self.scene.color(0, 0, 1);
                
                // Load sprite
                if (self.sprite === null) {
                    self.sprite = platino.createSprite({image:'graphics/A.png'});
                }
                
                // Move sprite at center of the screen
                self.sprite.x = (game.screen.width  * 0.5) - (self.sprite.width  * 0.5);
                self.sprite.y = (game.screen.height * 0.25) - (self.sprite.height * 0.5);

                // Add logo to the scene
                self.scene.add(self.sprite);
                
                // Start handling touch event
                game.addEventListener('touchstart', touchstart);
            };
        })(this);
        
        var deactivated = (function(self) {
            return function(e) {
                Ti.API.info("scene A is deactivated");
                
                // remove sprite from the scene and set variable null
                // that triggers removal from the memory at GC.
                self.scene.remove(self.sprite);
                self.sprite = null;
                
                // If you would like to remove cached texture resource from the memory,
                // use GameView.unloadTexture(texture_name) that unloads texture resource with given name.
                game.unloadTexture('graphics/A.png');
                
                // Stop handling touch event
                game.removeEventListener('touchstart', touchstart);
            };
        })(this);
        
        // register scene activationi event
        this.scene.addEventListener('activated',     activated);
        this.scene.addEventListener('deactivated',   deactivated);
        this.scene.addEventListener('onloadsprite',  onloadsprite);
        this.scene.addEventListener('enterframe',    enterframe);
    }
};


var SceneB = {
    scene:null,
    sprite:null,
    init:function() {
        this.scene = platino.createScene();
        
        var onloadsprite = (function(self) {
            return function(e) {
                Ti.API.info("onlaodsprite: " + e.name);
                if (e.name == "graphics/B.png") {
                    game.startCurrentScene();
                }
            };
        })(this);
        
        var touchstart = (function(self) {
            return function(e) {
                game.replaceScene(SceneA.scene);
            };
        })(this);
        
        var enterframe = (function(self) {
            return function(e) {
                
            };
        })(this);
        
        var activated = (function(self) {
            return function(e) {
                Ti.API.info("scene B is activated");
                
                // Set background color to green
                self.scene.color(0, 1, 0);
                
                // Load sprite
                if (self.sprite === null) {
                    self.sprite = platino.createSprite({image:'graphics/B.png'});
                }
                
                // Move sprite at center of the screen
                self.sprite.x = (game.screen.width  * 0.5) - (self.sprite.width  * 0.5);
                self.sprite.y = (game.screen.height * 0.25) - (self.sprite.height * 0.5);

                // Add logo to the scene
                self.scene.add(self.sprite);
                
                // Start handling touch event
                game.addEventListener('touchstart', touchstart);
            };
        })(this);
        
        var deactivated = (function(self) {
            return function(e) {
                Ti.API.info("scene B is deactivated");
                
                // remove sprite from the scene and set variable null
                // that triggers removal from the memory at GC.
                self.scene.remove(self.sprite);
                self.sprite = null;
                
                // If you would like to remove cached texture resource from the memory,
                // use GameView.unloadTexture(texture_name) that unloads texture resource with given name.
                game.unloadTexture('graphics/B.png');
                
                // Stop handling touch event
                game.removeEventListener('touchstart', touchstart);
            };
        })(this);
        
        // register scene activationi event
        this.scene.addEventListener('activated',     activated);
        this.scene.addEventListener('deactivated',   deactivated);
        this.scene.addEventListener('onloadsprite',  onloadsprite);
        this.scene.addEventListener('enterframe',    enterframe);
    }
};

// Onload event is called when the game is loaded.
// The game.screen.width and game.screen.height are not yet set until this onload event.
game.addEventListener('onload', function(e) {
    // Your game screen size is set here if you did not specifiy game width and height using screen property.
    // Note: game.size.width and height may be changed due to the parent layout so check them here.
    Ti.API.info("view size: " + game.size.width + "x" + game.size.height);
    Ti.API.info("game screen size: " + game.screen.width + "x" + game.screen.height);

    // Initialize scenes
    SceneA.init();
    SceneB.init();
    
    // Add first scene into game view
    game.pushScene(SceneA.scene);

    // Start the game
    game.start();
});


// Add your game view
window.add(game);

// load debug functions
Ti.include("debug.js");

var centerLabel = Titanium.UI.createLabel({
    color:'black',
    backgroundColor:'white',
    text:'touch screen to change scene',
    font:{fontSize:20,fontFamily:'Helvetica Neue'},
    textAlign:'center',
    width:'auto',
    height:'auto'
});

// add label to the window
window.add(centerLabel);

window.open({fullscreen:true, navBarHidden:true});
