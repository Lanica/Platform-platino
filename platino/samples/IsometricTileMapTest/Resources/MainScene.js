var platino = require('co.lanica.platino');
var IsometricTileManager = require('modules/IsometricTileManager');

/*
 * Main scene for isometric tile map test
 */
function MainScene(window, game) {

    var debug  = false;

    // Create scene
    var self = platino.createScene();
    //self.color(0.41, 0.61, 0.12); // Make this scene background green
    self.color(1, 1, 1); // Make this scene background green

    var tileMapManager = null;
    var tileMap        = null;

    var debugSquare = null;
    var debugSquareHUD = null;

    var currentEditMode = "addremove";
    var modeChangeButton = null;
    var modeChangeDialog = null;

    var editingTileInfo = null;

    function locationInView(_e) {
        var e = {type:_e.type, x:_e.x, y:_e.y, source:_e.source};
        var x = e.x * game.touchScaleX;
        var y = e.y * game.touchScaleY;

        e.x = x;
        e.y = y;

        return e;
    }
   
    /*
     * Place/Remove Tiles
     */
    var handlePlaceTileEvent = function(e) {
        if (tileMapManager === null) return;
        if (e.type != "touchend") return;

        // Get tile index at given coordinates
        // This method just takes base isometric height/width (32x64) into account
        // Use getTileAtPosition(x, y) if you need real collision between tile sprite
        var tileIndex  = tileMap.getTileAtPositionWithoutSprite(e.x, e.y);

        if (tileMap.spriteExists(tileIndex)) {
            // Remove tile with given index
            tileMap.removeTile(tileIndex);
        } else {

            // Get tile information for this index
            var tileInfo  = tileMap.getTileInfo(tileIndex);

            // Name of tileset
            var tileset   = "isometric_grass_and_water";

            // Get frame animation count for this tileset
            var frameCount = tileMapManager.getFrameCount(tileset);

            // Place tile, returns true if it finishes successfully
            if (tileMapManager.placeTile({
                row: tileInfo.row,
                col: tileInfo.col,
                tileset: tileset,
                isFlipped: false,
                frameIndex: Math.random() * 4, // set random grass tile for testing purpose
                index:tileIndex})) {
                // Successfully placed
            } else {
                // Index was out of bounds or another tile already exists
            }
        }

        moveDebugSquare(tileIndex);
    };

    /*
     * Select/Move Tiles
     */
    var handleMoveTileEvent = function(e) {
        if (tileMapManager === null) return;

        var tileIndex  = tileMap.getTileAtPositionWithoutSprite(e.x, e.y);

        if (e.type == "touchmove") {
            if (tileMap.isEditing()) {
                // Move editing tile to the index
                tileMap.moveEditingTile(tileIndex);
            }
        } else if (e.type == "touchend") {
            if (tileMap.spriteExists(tileIndex)) {

                if (tileMap.isEditing()) {
                    // Sprite is under editing but can not place here because aother tile exists
                    tileMap.colorEditingTile(0, 0, 0); // Paint it black to show 'can not placed here'
                } else {
                    // Start editing tile with given index
                    startEditingMode(tileIndex);
                    tileMap.colorEditingTile(1, 0, 0); // Paint it red to show 'this tile is selected'
                }
            } else {
                // Now safe to finish to move
                if (tileMap.isEditing()) {
                    var tileInfo  = tileMap.getTileInfo(tileIndex);

                    if (tileMapManager.placeTile({
                        row: tileInfo.row,
                        col: tileInfo.col,
                        tileset: editingTileInfo.tag,
                        isFlipped: false,
                        index:tileIndex})) {

                        // remove original tile
                        tileMap.removeTile(editingTileInfo.index);
                    }
                }

                endEditingMode();
            }
        }

        moveDebugSquare(tileIndex);
    };

    /*
     * Animate Selected Tiles
     */
    var handleAnimationEvent = function(e) {
        if (tileMapManager === null) return;

        var tileIndex  = tileMap.getTileAtPositionWithoutSprite(e.x, e.y);

        if (e.type == "touchend") {
            tileMap.tileAnimate(tileIndex, [0, 1, 2, 3], 500, -1, 0);
        }
    };

    /*
     * Handle touch events
     */
    var handleTouchEvent = function(_e) {
        var e = locationInView(_e);

        if (e.type == "touchstart") {
            debugSquareHUD.alpha = 0;
        }

        if (currentEditMode == "addremove") {
            handlePlaceTileEvent(e);
        } else if (currentEditMode == "selectmove") {
            handleMoveTileEvent(e);
        } else if (currentEditMode == "animation") {
            handleAnimationEvent(e);
        }

    };

    /*
     * Display dummy sprite for debugging
     */
    function moveDebugSquare(tileIndex) {
        var spriteInfo = tileMap.getSpriteInfo(tileIndex);

        // Place blue overlay onto current tile

        // debugSquare is placed onto scene, so we can use sprite coordinate as it is
        debugSquare.x = spriteInfo.x;
        debugSquare.y = spriteInfo.y;
        debugSquare.width  = spriteInfo.width;
        debugSquare.height = spriteInfo.height;

        // debugSquareHUD is palced onto HUD, so we have to convert world-screen coordinate
        // spriteInfo.center returns tile center position from screen coordinate
        debugSquareHUD.alpha = 0.5;
        debugSquareHUD.center = {x:spriteInfo.center.x, y:spriteInfo.center.y};
    } 

    /*
     * Start tile editing
     */
    function startEditingMode(index) {
        tileMap.copyEditingTile(index);      // Start editing tile with given index
        tileMapManager.enablePanZoom(false); // Disable pan/zoom

        editingTileInfo = tileMap.getSpriteInfo(index); // Save editing tile information
    }

    /*
     * End tile editing
     */
    function endEditingMode() {
        tileMapManager.enablePanZoom(true); // Enable pan/zoom

        // If tile map is under editing, finish it
        if (tileMap.isEditing()) {
            tileMap.removeEditingTile();
        }

        // Clear saved tile information
        editingTileInfo = null;
    }

    function enableCategory(e) {

        switch (e.index) {
            case 0: currentEditMode = "addremove";
                    modeChangeButton.title = "Edit Mode: (Add/Remove)";
                    break;
            case 1: currentEditMode = "selectmove";
                    modeChangeButton.title = "Edit Mode: (Select/Move)";
                    break;
            case 2: currentEditMode = "animation";
                    modeChangeButton.title = "Edit Mode: (Animation)";
                    break;
        }

        // If current map tile is under editing, remove editing status
        endEditingMode();

        if (currentEditMode == "animation") {
            // If tile is already animated, resume all animation
            tileMap.animateTiles(true);
        } else {
            // If tile is animating, pause all animation
            tileMap.animateTiles(false);
        }
    }

    function createTestCategories() {
        modeChangeButton = Ti.UI.createButton({title:'Edit Mode: (Add/Remove)', left:0, top:0});
        modeChangeDialog = Ti.UI.createOptionDialog();
        modeChangeDialog.title = "Edit Mode";
        modeChangeDialog.options = ["Add/Remove", "Select/Move", "Animation"];
        modeChangeDialog.selectedIndex = 0;
        modeChangeDialog.addEventListener('click', function(e) {
            enableCategory(e);
        });
        modeChangeButton.addEventListener('click', function(e) {
            modeChangeDialog.show();
        });
        window.add(modeChangeButton);
    }

    function removeTestCategories() {
        window.remove(modeChangeButton);
    }

    self.addEventListener('activated', function(e) {
        Ti.API.info("main scene is activated");

        game.panZoomCamera(0, 0, 1);

        var test_number = parseInt(Math.random() * 4, 10) + 1;

        var assetdir    = Ti.Filesystem.resourcesDirectory + "graphics/";
        //var mapsettings = Ti.Filesystem.getFile(assetdir + "isometric_map_test" + test_number + ".json");
        var mapsettings = Ti.Filesystem.getFile(assetdir + "isometric_map_test3.json");

        tileMapManager  = new IsometricTileManager(game, self, JSON.parse(mapsettings.read().toString()), assetdir);
        tileMap         = tileMapManager.getTileMap();
        tileMapManager.activate();

        // Create sprite for demonstrating how to handle world coordinate
        debugSquare = platino.createSprite();
        debugSquare.alpha = 0.5;
        debugSquare.color(0, 0, 1);
        debugSquare.z = 1000;
        self.add(debugSquare);

        // Create sprite for demonstrating how to handle screen coordinate from HUD
        debugSquareHUD = platino.createSprite();
        debugSquareHUD.width  = 16;
        debugSquareHUD.height = 16;
        debugSquareHUD.alpha = 0;
        debugSquareHUD.color(1, 0, 0);
        debugSquareHUD.z = 1001;
        game.addHUD(debugSquareHUD);

        createTestCategories();

        game.addEventListener('touchstart', handleTouchEvent);
        game.addEventListener('touchmove',  handleTouchEvent);
        game.addEventListener('touchend',   handleTouchEvent);

        game.startCurrentScene();
    });

    self.addEventListener('deactivated', function(e) {
        Ti.API.info("main scene is deactivated");

        self.remove(debugSquare);
        debugSquare.dispose();
        debugSquare = null;

        game.removeHUD(debugSquareHUD);
        debugSquareHUD.dispose();
        debugSquareHUD = null;

        game.removeEventListener('touchstart', handleTouchEvent);
        game.removeEventListener('touchmove',  handleTouchEvent);
        game.removeEventListener('touchend',   handleTouchEvent);

        if (tileMapManager !== null) {
            tileMapManager.deactivate();
            tileMapManager = null;
            tileMap        = null;
        }

        removeTestCategories();
    });

    return self;
}

module.exports = MainScene;
