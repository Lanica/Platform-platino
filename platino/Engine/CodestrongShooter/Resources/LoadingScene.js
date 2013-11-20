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
    var loadingTextures = ["graphics/bang.png", "graphics/bang2.png",
        "graphics/bullets.png", "graphics/cloud.png", "graphics/explosion.png",
        "graphics/objects.png", "graphics/plane.png", "graphics/terrain_tile01.png",
        "graphics/tree.png"];

        if (Ti.Platform.osname != 'android') {
            loadingTextures.push("graphics/terrain_tile02.png");
            loadingTextures.push("graphics/terrain_tile03.png");
            loadingTextures.push("graphics/terrain_tile04.png");
            loadingTextures.push("graphics/terrain_tile05.png");
        }

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

        game.registerOnLoadSpriteTag("LOADING_SCREEN");
        
        loadingCount = 0;
        
        if (loadingScreen === null) {
            loadingScreen = platino.createSprite({
                image:'graphics/mainloading.png',
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
        if (e.tag == "LOADING_SCREEN") {
            // Show badge 0.5 seconds then start loading assets
            setTimeout(startloadingAssets, 500);
        }
    });

    return self;
}

module.exports = LoadingScene;
