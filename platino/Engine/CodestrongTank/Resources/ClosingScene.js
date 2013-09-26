/*
 * Closing scene ensures all other scenes are 'deactivated' before closing window
 */
var platino = require('co.lanica.platino');

function ClosingScene(window, game) {
    var self = platino.createScene();

    self.addEventListener('activated', function(e) {
        Ti.API.info("closing scene is activated");
        
        // unload all the other resources/textures as you want
        game.currentScene = null;
        
        // Request Garbage Collection
        game.cleanupGarbage();
        
        window.close();
    });

    return self;
}

module.exports = ClosingScene;
