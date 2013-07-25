var platino = require('co.lanica.platino');

//Application Window Component Constructor
function ApplicationWindow() {

    var leftCurtain  = null;
    var rightCurtain = null;

    //create component instance
    var self = Ti.UI.createWindow({
        backgroundColor:'black',
        orientationModes: [Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT]
    });
    
    //construct UI
    var game = platino.createGameView();
    
    // update game view texture settings for smooth rendering
    game.textureFilter = platino.OPENGL_LINEAR;

    // Frame rate can be changed (fps can not be changed after the game is loaded)
    game.fps = 30;

    // set initial background color to black
    game.color(0, 0, 0);

    game.setUsePerspective(false);

    // Onload event is called when the game is loaded.
    // The game.screen.width and game.screen.height are not yet set until this onload event.
    game.addEventListener('onload', function(e) {

        updateScreenSize();

        var LoadingScene  = require("LoadingScene");
        game.currentScene = new LoadingScene(self, game);
    
        // push loading scene and start the game
        game.pushScene(game.currentScene);
        game.start();
    });

    game.addEventListener('onsurfacechanged', function(e) {
        game.orientation = e.orientation;
        updateScreenSize();
    });
    
    game.touchScaleX = 1;
    game.touchScaleY = 1;
    
    // set screen size for your game (ipad size)
    game.TARGET_SCREEN = {width:1024, height:768};
    //game.TARGET_SCREEN = {width:2048, height:1536};

    function updateScreenSize() {
        // set screen size for your game (TARGET_SCREEN size)
        var screenScale = game.size.height / game.TARGET_SCREEN.height;
        game.screen = {width:game.size.width / screenScale, height:game.size.height / screenScale};
    
        // Your game screen size is set here if you did not specifiy game width and height using screen property.
        // Note: game.size.width and height may be changed due to the parent layout so check them here.
        Ti.API.info("view size: " + game.size.width + "x" + game.size.height);
        Ti.API.info("game screen size: " + game.screen.width + "x" + game.screen.height);
    
        game.touchScaleX = game.screen.width  / game.size.width;
        game.touchScaleY = game.screen.height / game.size.height;

        game.screenScale = game.screen.height / game.TARGET_SCREEN.height;

        updateCurtain();
    }
    
    function updateCurtain() {
        if (game.TARGET_SCREEN_WIDTH >= game.screen.width) return;
    
        if (leftCurtain === null) {
            leftCurtain = platino.createSprite();
            game.addHUD(leftCurtain);
        }
        if (rightCurtain === null) {
            rightCurtain = platino.createSprite();
            game.addHUD(rightCurtain);
        }
    
        var curtainWidth = Math.ceil((game.screen.width - game.TARGET_SCREEN.width) * 0.5);
    
        leftCurtain.color(0, 0, 0);
        leftCurtain.height = game.screen.height;
        leftCurtain.width  = curtainWidth;
        
        rightCurtain.color(0, 0, 0);
        rightCurtain.height = game.screen.height;
        rightCurtain.width  = curtainWidth;
        
        leftCurtain.x = 0;
        leftCurtain.y = 0;
        leftCurtain.z = 10000;
        
        rightCurtain.x = curtainWidth + game.TARGET_SCREEN.width;
        rightCurtain.y = 0;
        rightCurtain.z = 10000;

        game.STAGE_START = { x:curtainWidth, y:0 };
        game.STAGE_END   = { x:rightCurtain.x, y:game.screen.height };
    }

    // Disable 'enterframe' event
    game.enableOnDrawFrameEvent = false;

    // Disable 'onloadsprite' and 'onunloadsprite' event except selected sprite by registerOnLoadSpriteName(name) or registerOnLoadSpriteTag(tag)
    game.enableOnLoadSpriteEvent = false;

    // Disable 'onloadtexture' event except selected texture by registerOnLoadTextureName(name)
    game.enableOnLoadTextureEvent = false;

    // Enable debug logs
    game.debug = true;

    //
    // prints out fps(frame per second) on every 5 seconds
    //
    game.enableOnFpsEvent = false; // onfps event is disabled by default so enable this
    game.onFpsInterval    = 5000;  // set onfps interval msec (default value equals 5,000 msec)

    game.addEventListener('onfps', function(e) {
        Ti.API.info(e.fps.toFixed(2) + " fps");
        
        // Additional information for memory status
        if (e.memory !== undefined) {
            Ti.API.info("max memory: "   + (e.memory.max  / (1024*1024)).toFixed(2));
            Ti.API.info("free memory: "  + (e.memory.free / (1024*1024)).toFixed(2));
            Ti.API.info("total memory: " + (e.memory.total / (1024*1024)).toFixed(2));
            Ti.API.info("allocated: "    + (e.memory.allocated / (1024*1024)).toFixed(2));
            Ti.API.info("allocated (native): " + (e.memory.native_allocated / (1024*1024)).toFixed(2));
            Ti.API.info("max (native): " + (e.memory.native_heap / (1024*1024)).toFixed(2));
        }
    });

    platino.addEventListener('onlowmemory', function(e) {
        Ti.API.warn("Low Memory");
    });
    
    self.add(game);

    // a flag that ensures closing event is executed only once
    var closing = false;
    
    // Show exit dialog when Android back button is pressed
    self.addEventListener('android:back', function(e) {
        if (closing) return;
        
        closing = true;
        
        var dlg = Ti.UI.createAlertDialog({ message : 'Exit?', buttonNames : ['OK','Cancel']});
            dlg.addEventListener("click", function(e) {
            if (e.index === 0) {
            
                game.popScene();

                setTimeout(function(e) {

                    // push closing scene on top of scenes
                    // so that gameview can have chance to clean all resources
                    var ClosingScene  = require("ClosingScene");
                    game.currentScene = new ClosingScene(self, game);
                    game.replaceScene(game.currentScene);
                
                    // Request Garbage Collection
                    game.cleanupGarbage();

                }, 1000);

                closing = false;

                dlg.hide();
            } else {
                closing = false;
            }
        });
    
        dlg.show();
    });
    
    self.addEventListener('open', function(e) {
        Ti.API.info("ApplicationWindow is opend");
    });
    
    self.addEventListener('close', function(e) {
        Ti.API.info("ApplicationWindow is closed");
        
        leftCurtain  = null;
        rightCurtain = null;
        game         = null;
    });
    
    return self;
}

//make constructor function the public component interface
module.exports = ApplicationWindow;
