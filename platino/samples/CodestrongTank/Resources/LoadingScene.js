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
    var loadingTextures = ["graphics/bang.png",
        "graphics/A.png", "graphics/B.png", "graphics/control_base.png",
        "graphics/Panzer/PanzerA.png", "graphics/Panzer/PanzerTurret.png",
        "graphics/M24/M24A.png", "graphics/M24/M24Turret.png",
        "graphics/Tiger/TigerA.png", "graphics/Tiger/TigerTurret.png",
        "graphics/bang.png", "graphics/bang2.png", "graphics/fire.png"
        ];

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
        
        if (loadingScreen === null) {
            loadingScreen = platino.createSprite({
                image:'graphics/mainloading.png',
                tag:'LOADING_SCREEN'});
        }
        
        var bgfactor = game.screen.height / loadingScreen.height;
        loadingScreen.width  = loadingScreen.width * bgfactor;
        loadingScreen.height = game.screen.height;
                
        if (loadingScreen.width < game.screen.width) {
            loadingScreen.center = {x:game.screen.width * 0.5, y:game.screen.height * 0.5};
        } else {
            loadingScreen.x = game.STAGE_START.x;
            loadingScreen.y = game.STAGE_START.y;
        }
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
    });
    
    self.addEventListener('onloadsprite', function(e) {
        Ti.API.info("onloadsprite: " + e.tag);
        if (e.tag == "LOADING_SCREEN") {
            setTimeout(startloadingAssets, 500);
        }
    });

    return self;
}

module.exports = LoadingScene;
