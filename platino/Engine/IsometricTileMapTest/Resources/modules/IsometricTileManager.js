
(function() {
    var IsometricTileManager;
    var platino = require('co.lanica.platino');

    function isDefined(value) {
        return (value !== null && value !== undefined);
    }

    function isEmpty(value) {
        return !isDefined(value);
    }

    IsometricTileManager = function(game, scene, params, assetdir) {

        var debug  = isDefined(params.debug) ? params.debug : false;

        var gridHeight = params.height;
        var gridWidth  = params.width;
        var tileHeight = params.tileheight;
        var tileWidth  = params.tileheight * 2; // isometric tile width should be 2 times bigger than the height.

        // Tile margin between base layer and ground layer. It can be set only on constructor
        var margin = isDefined(params.margin) ? params.margin : 1;

        // Default tile map center equals center of the screen
        var tileMapCenter = isDefined(params.tileMapCenter) ? params.tileMapCenter : {x: game.screen.width * 0.5, y: game.screen.height * 0.5};

        var layers        = params.layers;
        var tilesets      = params.tilesets;
        var tilesets_names  = {};

        for (var key in tilesets) {
            tilesets_names[tilesets[key].did] = key;
        }

        var isViewReady = false;
        var isPanZoomEnabled = true;

        if (isEmpty(scene) || isEmpty(gridHeight) || isEmpty(gridWidth) || isEmpty(tileHeight) || isEmpty(tileWidth) || isEmpty(margin)) {
            alert("Failed to create IsometricTileMap: missing parameters");
            return;
        }

        var tileMap = platino.createIsometricTileMap({
                scene:   scene,
                rows:    gridHeight,       // number of rows
                columns: gridWidth,        // number of columns
                tileWidth:  tileWidth,     // tile width
                tileHeight: tileHeight,    // tile height (should be 2 times bigger than tileWidth)
                groundMargin: margin // number of margin tiles for ground tile
            });

        tileMap.initializeGround();

        var PINCH_SMOOTH_FACTOR = 1.0 / 16.0; // 0.125
        var tileMapDragLast, tileMapDidPan, cameraPanX, cameraPanY, cameraZoom;

        /*
         * Public Methods
         */

        /*
         * @method getFrameCount
         * Returns animation frame count of tileset
         */
        this.getFrameCount = function(tileset) {
            if (isDefined(tilesets) && isDefined(tilesets[tileset]) && isDefined(tilesets[tileset].frameCount)) {
                return tilesets[tileset].frameCount;
            } else {
                return 1;
            }
        };

        /*
         * @method enablePanZoom
         * Enable pan and zoom for this map
         * @param {Boolean} true to enable pan/zoom
         */
        this.enablePanZoom = function(enabled) {
            isPanZoomEnabled = enabled;
        };

        /*
         * @method placeTile
         * Place tile with given tile information
         *
         * ### Example
         *   tileMapManager.placeTile({
         *       row: tileInfo.row,
         *       col: tileInfo.col,
         *       tileset: tileset,
         *       isFlipped: false,
         *       frameIndex: 1,
         *       index:tileIndex})
         *
         * @param {Number} row Row to place tile
         * @param {Number} columnb Column to place tile
         * @param {String} tileset Texture name defined in tilesets
         * @param {Boolean} isFlipped true if tile is flipped
         * @param {Number} frameIndex Default frame index for this tileset
         * @param {NUmber} index Tile index to be placed
         * 
         */
        this.placeTile = function(tilePlaceInfo) {

            if (!isDefined(tilePlaceInfo.index)) {
                tilePlaceInfo.index = tileMap.getTileIndex(tilePlaceInfo.row, tilePlaceInfo.col);
            }

            if (!tileMap.canPlaceTile(tilePlaceInfo.index)) {
                return false;
            }

            placeDecorationTile(tilePlaceInfo);

            return true;
        };

        /*
         * @method placeEditingTile
         * Place dummy tile for editing mode
         */
        this.placeEditingTile = function(tilePlaceInfo) {
            tilePlaceInfo = updateTextureInfoForTile(tilePlaceInfo);
            tileMap.placeEditingTile(tilePlaceInfo);
        };

        /*
         * @method getTileMap
         * returns IsometricTileMap instance
         */
        this.getTileMap = function() {
            return tileMap;
        };

        /*
         * @method activate
         * Initialize tile map
         */
        this.activate = function() {

            // tilemap position should be set BEFORE initialize layers & tiles
            tileMap.center = {x:game.screen.width * 0.5, y:game.screen.height * 0.5};

            initCamera();
            initLayers();
            initDecorations();
            initTouchListeners();

            scene.add(tileMap);

            isViewReady = true;
        };

        /*
         * @method deactivate
         * Dispose tile map
         */
        this.deactivate = function() {
            isViewReady = false;

            teardownTouchListeners();

            scene.remove(tileMap);
            tileMap.dispose();
            tileMap = null;
        };

        /*
         * Private methods
         */

        function locationInView(_e) {
            var e = {type:_e.type, x:_e.x, y:_e.y, source:_e.source};
            var x = e.x * game.touchScaleX;
            var y = e.y * game.touchScaleY;

            e.x = x;
            e.y = y;

            return e;
        }

        function placeDecorationTile(tilePlaceInfo) {
            tilePlaceInfo = updateTextureInfoForTile(tilePlaceInfo);

            Ti.API.info("placeDecorationTile: " + JSON.stringify(tilePlaceInfo));
            tileMap.placeTile(tilePlaceInfo);            
        }

        /*
         * Fill tileset details for given tile for placement
         * (tileset details are constructed by 'params' from constructor)
         */
        function updateTextureInfoForTile(tilePlaceInfo) {
            if (isDefined(tilesets) && isDefined(tilesets[tilePlaceInfo.tileset])) {
                var tag      = tilePlaceInfo.tileset;
                var tileInfo = tilesets[tag];

                tilePlaceInfo.tag = tag;
                tilePlaceInfo.path = assetdir + tileInfo.image;
                tilePlaceInfo.spanColumns = tileInfo.spanColumns;
                tilePlaceInfo.spanRows    = tileInfo.spanRows;
                tilePlaceInfo.width = tileInfo.tilewidth;
                tilePlaceInfo.height = tileInfo.tileheight;
                tilePlaceInfo.registrationPointX = tileInfo.registrationPointX;
                tilePlaceInfo.registrationPointY = tileInfo.registrationPointY;
                tilePlaceInfo.frameCount = tileInfo.frameCount;
                tilePlaceInfo.isRoad = isDefined(tileInfo.isRoad) ? tileInfo.isRoad : false;
            }
 
            return tilePlaceInfo;
        }

        /*
         * Initialize Camara position
         */
        function initCamera() {
            cameraPanX = 0;
            cameraPanY = 0;
            cameraZoom = 1.0;
        }

        /*
         * Initialize base tile and ground tile
         * 
         * base tileset has did=0
         * ground tileset has did=1
         */
        function initLayers() {

            var mapBaseTile   = null;
            var mapGroundTile = null;

            for (var key in tilesets) {
                var tileset = tilesets[key];

                if (tileset.did === 0) {
                    mapBaseTile = tileset;
                } else if (tileset.did === 1) {
                    mapGroundTile = tileset;
                }
                if (isDefined(mapBaseTile) && isDefined(mapGroundTile)) {
                    break;
                }
            }

            if (isDefined(mapBaseTile) && isDefined(mapBaseTile.image)) {
                tileMap.initBaseLayer({
                    path: assetdir + mapBaseTile.image
                });
            }

            if (isDefined(mapGroundTile) && isDefined(mapGroundTile.image)) {
                tileMap.initGroundLayer({
                    path: assetdir + mapGroundTile.image
                });
            }

            tileMap.setupGroundLayers();
        }

        function initDecorations() {
            for (var i = 0; i < layers.length; i++) {
                var data  = layers[i].data;
                for (var j = 0; j < data.length; j++) {
                    var item = data[j];
                    placeDecorationTile({
                        row: item.row,
                        col: item.col,
                        tileset: tilesets_names[item.did],
                        isFlipped:  item.isFlipped ? item.isFlipped : false,
                        frameIndex: item.frame ? item.frame : 0
                        });
                }
            }            

        }

        /*
         * Reset Camera position smoothly by Transform
         */
        var resetCameraPanAndZoom = function() {
            var resetCameraTransform = platino.createTransform();
            resetCameraTransform.duration = 500;
            resetCameraTransform.easing   = platino.ANIMATION_CURVE_LINEAR;
            resetCameraTransform.lookAt_panX = 0;
            resetCameraTransform.lookAt_panY = 0;
            resetCameraTransform.lookAt_zoom = 1;

            game.moveCamera(resetCameraTransform);
        };

        /*
         * touchstart event for handling pan
         */
        var tileMapTouchStart = function(_e) {
            if (!isPanZoomEnabled) return;

            var e = locationInView(_e);

            tileMapDragLast = e;
            tileMapDidPan = false;
        };

        /*
         * touchmove event for handling pan
         */
        var tileMapTouchMove = function(_e) {
            if (!isPanZoomEnabled) return;

            var e = locationInView(_e);

            if (!tileMapDragLast) {
                tileMapDragLast = e;
            }

            var dx = (e.x - tileMapDragLast.x);
            var dy = (e.y - tileMapDragLast.y);

            cameraPanX += dx;
            cameraPanY += dy;

            game.panZoomCamera(cameraPanX, cameraPanY, cameraZoom);

            if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
                tileMapDidPan = true;
            }

            tileMapDragLast = e;
        };

        /*
         * touchend event
         */
        var tileMapTouchEnd = function(_e) {
            tileMapDragLast = null;
        };

        /*
         * pinch event for zooming
         */
        var tileMapPinch = function(e) {
            if (!isPanZoomEnabled) return;

            tileMapDragLast = null;

            cameraZoom = cameraZoom + (((cameraZoom / e.scale) - cameraZoom) * PINCH_SMOOTH_FACTOR);

            if (cameraZoom < 0.5) {
                cameraZoom = 0.5;
            } else if (cameraZoom > 1.5) {
                cameraZoom = 1.5;
            }

            game.panZoomCamera(cameraPanX, cameraPanY, cameraZoom);
        };

        /*
         * Register touch listeners
         */
        function initTouchListeners() {
            game.addEventListener('touchstart', tileMapTouchStart);
            game.addEventListener('touchmove',  tileMapTouchMove);
            game.addEventListener('touchend',   tileMapTouchEnd);
            game.addEventListener('pinch', tileMapPinch);
        }

        /*
         * Unregister touch listeners
         */
        function teardownTouchListeners() {
            game.removeEventListener('touchstart', tileMapTouchStart);
            game.removeEventListener('touchmove',  tileMapTouchMove);
            game.removeEventListener('touchend',   tileMapTouchEnd);
            game.removeEventListener('pinch', tileMapPinch);
        }

        return this;
    };

    module.exports = IsometricTileManager;

}).call(this);
