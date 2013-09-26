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

game.debug = true;

// Create game scene
var scene = platino.createScene();

// create sprites
var dog = platino.createSpriteSheet({image:'graphics/dog.png', width:34, height:42, border:1, margin:1});

// on-screen controller and its guides
var vpad = platino.createSprite({image:'graphics/control_base.png'});
var vpad_nav = platino.createSprite({image:'graphics/particle.png'});

vpad_nav.hide();
vpad_nav.color(1, 1,  0);
vpad.alpha = 0.5;

// create map sprite. map data will be updated later at 'onload' event
var map = platino.createMapSprite({image:'graphics/hexagonal_tiles.png', tileWidth:64, tileHeight:64, border:0, margin:0});
map.orientation = platino.MAP_HEXAGONAL;

// set z-order

map.z  = 0;
dog.z  = 1;
vpad.z = 2;
vpad_nav.z = 3;

// add your shape to the scene
scene.add(dog);
scene.add(vpad);
scene.add(vpad_nav);
scene.add(map);

// add your scene to game view
game.pushScene(scene);

var WINDOW_SCALE_FACTOR_X = 1;
var WINDOW_SCALE_FACTOR_Y = 1;

var isVpadActive = false;
var touchX, touchY;

var updateVpadTimerID = 0;

// Onload event is called when the game is loaded.
// The game.screen.width and game.screen.height are not yet set until this onload event.
game.addEventListener('onload', function(e) {
    // set screen size for your game (non-retina size)
    var screenScale = game.size.width / 320;
    game.screen = {width:game.size.width / screenScale, height:game.size.height / screenScale};

    map.firstgid = 0;
    
    // initialize map size and data
    map.width  = game.screen.width  * 2;
    map.height = game.screen.height * 2;
    
    Ti.API.info("tiles: columns=" + map.tileCountX + " rows=" + map.tileCountY + " count=" + map.tileCount);
    
    var tiles = [map.tileCount];
    for (var i = 0; i < map.tileCount; i++) {
        tiles[i] = i % 4;
    }
    map.tiles = tiles;

    // Your game screen size is set here if you did not specifiy game width and height using screen property.
    // Note: game.size.width and height may be changed due to the parent layout so check them here.
    Ti.API.info("view size: " + game.size.width + "x" + game.size.height);
    Ti.API.info("game screen size: " + game.screen.width + "x" + game.screen.height);
    
    Ti.API.info("map: " + map.width + "x" + map.height);
    
    WINDOW_SCALE_FACTOR_X = game.screen.width  / game.size.width;
    WINDOW_SCALE_FACTOR_Y = game.screen.height / game.size.height;
    
    vpad.x = (game.screen.width * 0.5) - (vpad.width * 0.5);
    vpad.y = game.screen.height - vpad.height;
    
    // Start the game
    game.start();

    // default direction is "RIGHT"
    dog.direction = "RIGHT";
    dog.animate(0, 2, 250, -1);
    
    updateVpadTimerID = setInterval(function(e) {
        updateVpad();
    }, 66);
});

// Stop update timer before app is closed
window.addEventListener('android:back', function(e) {
    clearInterval(updateVpadTimerID);
    
    window.close();
});

function updateVpad() {
    if (isVpadActive) {
        var powerX = (touchX - (vpad.x + (vpad.width  * 0.5))) * 0.2;
        var powerY = (touchY - (vpad.y + (vpad.height * 0.5))) * 0.2;
    
        vpad.color(0.78, 0.78, 0.78);
        vpad_nav.x = touchX - (vpad_nav.width  * 0.5);
        vpad_nav.y = touchY - (vpad_nav.height * 0.5);
        vpad_nav.show();
        
        // Change animation of the dog sprite
        if (dog.direction == "RIGHT" && powerX < 0) {
            dog.direction = "LEFT";
            dog.animate(5, 2, 250, -1);
        } else if (dog.direction == "LEFT" && powerX > 0){
            dog.direction = "RIGHT";
            dog.animate(0, 2, 250, -1);
        }
        
        var nextDogX = dog.x + powerX;
        var nextDogY = dog.y + powerY;
        
        var nextMapX = map.x - powerX;
        var nextMapY = map.y - powerY;
        
        if (nextDogX > 0 && nextDogX < game.screen.width  - dog.width) {
            dog.x = nextDogX;
        } else if (nextMapX <= 0 && nextMapX > -map.width + game.screen.width){
            map.x = nextMapX;
        }
        if (nextDogY > 0 && nextDogY < game.screen.height - dog.height) {
            dog.y = nextDogY;
        } else if (nextMapY <= 0 && nextMapY > -map.height + game.screen.height){
            map.y = nextMapY;
        }

        /*
         * // To update tile dynamically, use getTile(index) and updateTile(tile)
         *
         * var tile = map.getTile(1);
         * Ti.API.info(JSON.stringify(tile));
         * tile.gid = 10; // change the tile id
         * map.updateTile(tile);
         *
         * // To remove tile, use removeTile(index) like below:
         *
         * map.removeTile(1);
         */
    
    } else {
        vpad.color(1, 1, 1);
        vpad_nav.hide();
    }
}

game.addEventListener('touchstart', function(e) {
    touchX = (e.x * WINDOW_SCALE_FACTOR_X);
    touchY = (e.y * WINDOW_SCALE_FACTOR_Y);
    
    isVpadActive = vpad.contains(touchX, touchY);
});

game.addEventListener('touchmove', function(e) {
    touchX = (e.x * WINDOW_SCALE_FACTOR_X);
    touchY = (e.y * WINDOW_SCALE_FACTOR_Y);
    
    isVpadActive = vpad.contains(touchX, touchY);
});

game.addEventListener('touchend', function(e) {
    isVpadActive = false;
});

// load debug functions
Ti.include("debug.js");

// Add your game view
window.add(game);
window.open({fullscreen:true, navBarHidden:true});

