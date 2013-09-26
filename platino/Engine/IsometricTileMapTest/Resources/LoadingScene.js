/*
 * Loading Scene
 */
var platino = require('co.lanica.platino');

function LoadingScene(window, game) {
    var self = platino.createScene();
    
    var progressBar   = null;
    var loadingScreen = null;
    var loadingBanner = null;
    var loadingBadge  = null;
    
    var loadingCount = 0;
    var loadingTextures = [ "graphics/isometric_base.png", "graphics/isometric_ground.png", "graphics/isometric_grass_and_water.png" ];

    var startloadingAssets = function(e) {
        if (progressBar === null) return;
        if (loadingCount === 0) {
            window.add(progressBar);
            progressBar.show();
        }
        if (loadingCount < loadingTextures.length) {
            game.loadTexture(loadingTextures[loadingCount]);
            
            loadingCount = loadingCount + 1;
            progressBar.value = loadingCount;

            setTimeout(startloadingAssets, 100);
        } else {
            progressBar.hide();
            
            var MainScene     = require("MainScene");
            game.currentScene = new MainScene(window, game);
            game.replaceScene(game.currentScene);
        }
    };
    
    self.addEventListener('activated', function(e) {
        Ti.API.info("loading scene is activated");
        
        loadingCount = 0;

        game.registerOnLoadSpriteTag("LOADING_SCREEN");

        if (loadingScreen === null) {
            loadingScreen = platino.createSprite({
                image:'graphics/mainloadingscreen.png',
                tag:'LOADING_SCREEN'});
        }
        
        var bgfactor = game.screen.height / loadingScreen.height;
        loadingScreen.width  = loadingScreen.width * bgfactor;
        loadingScreen.height = game.screen.height;
                
        //loadingScreen.center = {x:game.screen.width * 0.5, y:game.screen.height * 0.5};
        loadingScreen.x = game.STAGE_START.x;
        loadingScreen.y = game.STAGE_START.y;
        self.add(loadingScreen);

        if (progressBar === null) {
            progressBar = Titanium.UI.createProgressBar({
                width :  loadingScreen.width * 0.3 / game.touchScaleX,
                height : loadingScreen.height * 0.2 / game.touchScaleY,
                min : 0,
                max : loadingTextures.length,
                value : 0,
                color : '#888',
                message : '',
                style : Titanium.UI.iPhone.ProgressBarStyle.PLAIN
            });
            progressBar.center = {
                x : (game.screen.width * 0.5 / game.touchScaleX),
                y : (loadingScreen.height * 0.845 / game.touchScaleY)
            };
        }
    });
    
    self.addEventListener('deactivated', function(e) {
        Ti.API.info("loading scene is deactivated");
        
        if (loadingScreen !== null) {
            self.remove(loadingScreen);
            loadingScreen = null;
        }
        
        if (progressBar !== null) {
            window.remove(progressBar);
            progressBar = null;
        }
        
        game.unloadTextureByTag('LOADING_SCREEN');
        game.unregisterOnLoadSpriteTag("LOADING_SCREEN");
    });
    
    self.addEventListener('onloadsprite', function(e) {
        Ti.API.info("onloadsprite: " + e.tag);
        if (e.tag == "LOADING_SCREEN") {
            startloadingAssets();
        }
    });

    return self;
}

module.exports = LoadingScene;
