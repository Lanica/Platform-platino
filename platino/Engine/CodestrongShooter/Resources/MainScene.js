/*
 * Shooter game example
 *
 * Touch screen to move our ship. The bullets are fired automatically.
 */
var platino = require('co.lanica.platino');
var ALmixer = platino.require('co.lanica.almixer');

function MainScene(window, game) {

    var debug = false;

    var MAX_ENEMIES = 8;
    var MAX_BULLETS = 10;

    var MAX_TREES   = 6;

    if (Ti.Platform.osname == 'android') {
        MAX_ENEMIES = 5;

        game.fps = 30;
    }

    // Create scene
    var self = platino.createScene();

    var myship = null;
    var myshipMover = null;

    var useParticle = true;
    var useMultipleTerrainTile = true;

    if (Ti.Platform.osname == 'android') {
        useParticle = false;
        useMultipleTerrainTile = false;
    }

    // Initialize bullets, enemies and background
    var bullets = new Array(MAX_BULLETS);
    var bulletMover = new Array(MAX_BULLETS);
    var explosions = new Array(MAX_BULLETS);
    var bulletIndex = 0;

    var enemies = new Array(MAX_ENEMIES);
    var enemyMover = new Array(MAX_ENEMIES);
    var backgrounds = null;
    var backgroundMover = null;
    var backgroundFollowMover = null;

    var grounds = null;
    var lastGround  = null;
    var groundMover = null;

    var trees = null;
    var object_tracks = null;
    var object_tank   = null;
    var object_quonsetHut = null;

    var updateTimerID = 0;

    var propellerSound = ALmixer.LoadAll('sounds/propeller-plane-flying-steady-loop.wav');
    var machinegunSound = ALmixer.LoadAll('sounds/machine-gun-loop2.wav');
    var explosionSound = ALmixer.LoadAll('sounds/explode-3.wav');
	
    /*
     * Move our ship at the center of the touch-event position
     * Move the background a bit, that causes parallized effect
     */
    var touchstart = function(_e) {
        var e =  {type:_e.type, source:_e.source};
        e.x = _e.x * game.touchScaleX;
        e.y = _e.y * game.touchScaleY;

        myship.clearTransform(myshipMover);

        myship.angle = 0;
    
        myshipMover.x = e.x;
        myshipMover.y = e.y;
        myshipMover.easing = platino.ANIMATION_CURVE_CUBIC_OUT;
        myshipMover.rotate_axis = platino.Y;
        myshipMover.rotate_centerX = myship.width  * 0.5;
        myshipMover.rotate_centerY = 0;
        myshipMover.angle = myship.x > myshipMover.x ? 180 : -180;
    
        var distanceX = myship.x - myshipMover.x;
        var distanceY = myship.y - myshipMover.y;
    
        var distance = Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2));
        myshipMover.duration = distance / 300 * 1000;
    
        // myship.frame  = myship.x > myshipMover.x ? 0 : 4;
        myship.transform(myshipMover);
    
        for (var i = 0; i < backgrounds.length; i++) {
            backgrounds[i].clearTransform(backgroundFollowMover[i]);
        
            backgroundFollowMover[i].x = backgrounds[i].x + (distanceX * 0.2);
            backgroundFollowMover[i].duration = 1000;
            backgrounds[i].transform(backgroundFollowMover[i]);
        }
    };

    self.addEventListener('onloadsprite', function(e) {
        Ti.API.info("onloadsprite: " + e.tag);
        if (e.tag.lastIndexOf("TERRAIN_TILE", 0) === 0) {

        }
    });

    self.addEventListener('activated', function(e) {
        Ti.API.info("main scene is activated");

        if (debug) {
            game.usePerspective = false;
            game.panZoomCamera(0, 0, 2);
        }

        // Create my ship instance
        myship = platino.createSpriteSheet({image:'graphics/plane.xml'});

        // Transform object that reacts to user interaction
        myshipMover = platino.createTransform();
        myshipMover.addEventListener('complete', function(e) {
            myship.angle = 0;
        });

        // Initialize bullets, enemies and background
        bullets = new Array(MAX_BULLETS);
        bulletMover = new Array(MAX_BULLETS);
        explosions = new Array(MAX_BULLETS);
        bulletIndex = 0;

        enemies = new Array(MAX_ENEMIES);
        enemyMover = new Array(MAX_ENEMIES);

        if (updateTimerID > 0) {
            clearInterval(updateTimerID);
            updateTimerID = 0;
        }

        initMyShip();

        self.add(myship);

        createGround();
        createBackground();
        createBullets();
        createEnemies();
        createObjects();

        createUpdateTimer();

        game.addEventListener('touchstart', touchstart);

		// loop infinitely
		ALmixer.PlayChannel(propellerSound, -1);

        game.startCurrentScene();
    });

    self.addEventListener('deactivated', function(e) {
        Ti.API.info("main scene is deactivated");

        game.removeEventListener('touchstart', touchstart);
    });

    var groundMoverStarted = function(e) {
    };

    var groundMoverCompleted = function(e) {
        lastGround.show();
        grounds[0].y = -grounds[0].height * (grounds.length - 1);
        grounds[0].transform(groundMover);
        lastGround.hide();
    };

    function createGround() {
        grounds = [
            platino.createSprite({image: 'graphics/terrain_tile05.png', width:game.screen.width, height:game.screen.height})
        ];

        if (useMultipleTerrainTile) {
            grounds.push(platino.createSprite({image: 'graphics/terrain_tile04.png', width:game.screen.width, height:game.screen.height}));
            grounds.push(platino.createSprite({image: 'graphics/terrain_tile03.png', width:game.screen.width, height:game.screen.height}));
            grounds.push(platino.createSprite({image: 'graphics/terrain_tile02.png', width:game.screen.width, height:game.screen.height}));
            grounds.push(platino.createSprite({image: 'graphics/terrain_tile01.png', width:game.screen.width, height:game.screen.height}));
            grounds.push(platino.createSprite({image: 'graphics/terrain_tile05.png', width:game.screen.width, height:game.screen.height}));
        } else {
            grounds.push(platino.createSprite({image: 'graphics/terrain_tile05.png', width:game.screen.width, height:game.screen.height}));
            grounds.push(platino.createSprite({image: 'graphics/terrain_tile05.png', width:game.screen.width, height:game.screen.height}));
        }
    
        for (var i = 0; i < grounds.length; i++) {

            grounds[i].x = 0;
            grounds[i].y = (i * grounds[0].height);
            grounds[i].z = 0;
            grounds[i].tag = "TERRAIN_TILE" + i;

            game.registerOnLoadSpriteTag(grounds[i].tag);
        
            if (i > 0) {
                grounds[0].addChildNode(grounds[i]);
            }
        }

        lastGround = platino.createSprite({image:grounds[0].image,
                            width:grounds[0].width, height:grounds[0].height});
        lastGround.x = 0;
        lastGround.y = 0;
        lastGround.z = 1;
        lastGround.hide();

        grounds[0].y = -grounds[0].height * (grounds.length - 1);

        self.add(grounds[0]);
        self.add(lastGround);

        groundMover = platino.createTransform();
        groundMover.y = 0;
        groundMover.duration = grounds.length * 10000;

        groundMover.addEventListener('start', groundMoverStarted);
        groundMover.addEventListener('complete', groundMoverCompleted);

        grounds[0].transform(groundMover);
    }

    /*
     * Initialize background
     */
    function createBackground() {
        backgrounds = [
            platino.createSpriteSheet({image: 'graphics/cloud.xml', frame:0}),
            platino.createSpriteSheet({image: 'graphics/cloud.xml', frame:1}),
            platino.createSpriteSheet({image: 'graphics/cloud.xml', frame:2})
        ];
    
        backgroundMover = new Array(backgrounds.length);
        backgroundFollowMover = new Array(backgrounds.length);
    
        for (var i = 0; i < backgrounds.length; i++) {
            backgrounds[i].x = Math.random() * (game.screen.width - backgrounds[i].width);
            backgrounds[i].y = Math.random() * (game.screen.height - backgrounds[i].height);
            backgrounds[i].z = 4;
            backgrounds[i].ready = true;
            backgrounds[i].alpha = 0.8;
        
            self.add(backgrounds[i]);
        
            backgroundMover[i] = platino.createTransform();
            backgroundMover[i].index = i;
            backgroundMover[i].addEventListener('complete', backgroundCompleted);
        
            backgroundFollowMover[i] = platino.createTransform();
        }
    }

    function createObjects() {
        trees = [];
        object_tracks = [];

        for (var i = 0; i < MAX_TREES; i++) {
            trees[i] = platino.createSpriteSheet({image:'graphics/objects.xml'});

            var treeIndex = parseInt(((Math.random() * 5) + 1), 10);
            trees[i].selectFrame("tree" + treeIndex);

            trees[i].x = Math.random() * (game.screen.width -  trees[i].width);

            if (useMultipleTerrainTile) {
                trees[i].y = -(Math.random() * grounds[0].height * 3) - trees[i].height;
            } else {
                trees[i].y = -(Math.random() * grounds[0].height) - trees[i].height;
            }

            trees[i].z = 2;

            if (i < 2) {
                object_tracks[i] = platino.createSpriteSheet({image:'graphics/objects.xml'});
                object_tracks[i].selectFrame("halftrack");
                object_tracks[i].x = trees[i].width;
                object_tracks[i].y = trees[i].height;
                object_tracks[i].z = 2;

                object_tracks[i].rotate(Math.random() * 180);

                trees[i].addChildNode(object_tracks[i]);
            } if (i == 3) {
                object_tank = platino.createSpriteSheet({image:'graphics/objects.xml'});
                object_tank.selectFrame("tank");
                object_tank.x = trees[i].width;
                object_tank.y = trees[i].height;
                object_tank.z = 1.5;

                object_tank.rotate(Math.random() * 180);

                trees[i].addChildNode(object_tank);
            } else if (i == 4) {
                object_quonsetHut = platino.createSpriteSheet({image:'graphics/objects.xml'});
                object_quonsetHut.selectFrame("quonsetHut");
                trees[i].x    = object_quonsetHut.width;
                object_quonsetHut.x = 0;
                object_quonsetHut.y = trees[i].height;
                object_quonsetHut.z = 2.5;

                trees[i].addChildNode(object_quonsetHut);
            }

            grounds[grounds.length - 1].addChildNode(trees[i]);
        }

    }

    var backgroundCompleted = function(e) {
        backgrounds[e.source.index].ready = true;
    };

    /*
     * Initialize bullets
     */
    function createBullets() {
        for (var i = 0; i < MAX_BULLETS; i++) {
            bullets[i] = platino.createSpriteSheet({image:'graphics/bullets.xml'});
            bullets[i].selectFrame("bullet_yellow");
            bullets[i].width = bullets[i].width * 2;
            bullets[i].hide();
            bullets[i].ready = true;
        
            if (useParticle) {
                if (i % 2 === 0) {
                    explosions[i] = platino.createParticles({image:'graphics/bang.pex'});
                } else {
                    explosions[i] = platino.createParticles({image:'graphics/bang2.pex'});
                }
            } else {
                explosions[i] = platino.createSpriteSheet({image:'graphics/explosion.xml'});
                explosions[i].scaleFromCenter(4, 4, 0, 0);
                explosions[i].hide();
                self.add(explosions[i]);
            }
            explosions[i].started = false;

            bulletMover[i] = platino.createTransform();
            bulletMover[i].index = i;
        
            bulletMover[i].addEventListener('complete', bulletsCompleted);
            self.add(bullets[i]);
        }
    }

    var bulletsCompleted = function(e) {
        bullets[e.source.index].hide();
        bullets[e.source.index].ready = true;
    };

    /*
     * Initialize enemies
     */
    function createEnemies() {
    
        var enemyprop = [
            {image:'graphics/plane.xml', speed: 500, framename:'focke'},
            {image:'graphics/plane.xml', speed: 600, framename:'p51'},
            {image:'graphics/plane.xml', speed: 700, framename:'messerschmitt'},
            {image:'graphics/plane.xml', speed: 800, framename:'zero'}
        ];
    
        for (var i = 0; i < MAX_ENEMIES; i++) {
            var rindex = parseInt(Math.random() * 4, 10) % 4;
            Ti.API.info(rindex + " " + enemyprop[rindex].framename);
            enemies[i] = platino.createSpriteSheet(enemyprop[rindex]);
            enemies[i].hide();
            enemies[i].rotate(180);
            enemies[i].ready = true;
            enemyMover[i] = platino.createTransform();
            enemyMover[i].index = i;

            enemies[i].selectFrame(enemyprop[rindex].framename);

            enemyMover[i].addEventListener('complete', enemyCompleted);
        
            self.add(enemies[i]);
        }
    }

    var enemyCompleted = function(e) {
        enemies[e.source.index].hide();
        enemies[e.source.index].ready = true;
    };

    /*
     * Move background clouds, set speed of the movement slower than the enemies and my ship
     * that enables kind of parallax background effect.
     */
    function moveBackground() {
        for (var i = 0; i < backgrounds.length; i++) {
            if (!backgrounds[i].ready) continue;
        
            if (backgrounds[i].y >= game.screen.height) {
                backgrounds[i].x =  Math.random() * game.screen.width;
                backgrounds[i].y = -backgrounds[i].height;
            }
        
            backgrounds[i].ready = false;
        
            backgroundMover[i].y = game.screen.height;
            backgroundMover[i].duration = Math.abs(game.screen.height - backgrounds[i].y) / 400 * 1000;
        
            backgrounds[i].transform(backgroundMover[i]);
        }
    }

    /*
     * Check if enemies collides with bullets or ready to move
     */
    function checkEnemies() {
        for (var i = 0; i < MAX_ENEMIES; i++) {
            if (!enemies[i].ready) {
                for (var j = 0; j < MAX_BULLETS; j++) {
                    if (!bullets[j].ready && enemies[i].collidesWith(bullets[j])) {
                        explosions[j].z = enemies[i].z + 1;

                        if (useParticle) {
                            explosions[j].x = enemies[i].x + (enemies[i].width  * 0.5);
                            explosions[j].y = enemies[i].y + (enemies[i].height * 0.5);

                            if (explosions[j].started) {
                                explosions[j].restart();
                            } else {
                                explosions[j].started = true;
                                self.add(explosions[j]);
                            }
                        } else {
                            explosions[j].center = enemies[i].center;

                            explosions[j].show();
                            explosions[j].animate(0, 16, 66, 0);
                        }

						ALmixer.PlayChannel(explosionSound);

                        enemies[i].hide();
                        enemies[i].clearTransforms();
                        enemies[i].ready = true;
                    
                        bullets[j].hide();
                        bullets[j].ready = true;
                    
                        break;
                    }
                }
                continue;
            }
        
            enemies[i].x =  enemies[i].width  +(Math.random() * (game.screen.width  - enemies[i].width));
            enemies[i].y = -enemies[i].height -(Math.random() * (game.screen.height * 0.5));
            enemies[i].z = myship.z + 1;
            enemies[i].ready = false;
            enemies[i].show();
        
            enemyMover[i].x = Math.random() > 0.8 ? enemies[i].x : myship.x;
            enemyMover[i].y = game.screen.height;

            var distanceX = enemies[i].x - enemyMover[i].x;
            var distanceY = enemies[i].y - enemyMover[i].y;
            var distance = Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2));
            enemyMover[i].duration = distance / enemies[i].speed * 1000;

            enemies[i].transform(enemyMover[i]);
        }
    }

    function getInitialBulletYPosition() {
        return myship.y - (bullets[0].height);
    }

    function getInitialBulletXPosition(){
        return myship.x + (myship.width * 0.5) - (bullets[0].width * 0.5);
    }

    var lastTimeBulletFired = 0;

    /*
     * Fire next bullet
     */
    function fireBullet() {
		// Since the gun is always firing, it's easier to loop the sampling infinitely than try to play for each bullet.
		if(lastTimeBulletFired === 0)
		{
			ALmixer.PlayChannel(machinegunSound, -1);
		}
		
        // Wait 200 msec for firing next bullet
        if (+new Date() - lastTimeBulletFired > 200 && bullets[bulletIndex].ready) {
            bullets[bulletIndex].clearTransform(bulletMover[bulletIndex]);
        
            bullets[bulletIndex].x = getInitialBulletXPosition();
            bullets[bulletIndex].y = getInitialBulletYPosition();
            bullets[bulletIndex].z = myship.z + 1;
            bullets[bulletIndex].ready = false;
            bullets[bulletIndex].show();
            bulletMover[bulletIndex].x = getInitialBulletXPosition();
            bulletMover[bulletIndex].y = -bullets[bulletIndex].height;
            bulletMover[bulletIndex].duration = (bullets[bulletIndex].y + bullets[bulletIndex].height) / 600 * 1000;
            bullets[bulletIndex].transform(bulletMover[bulletIndex]);
        
            bulletIndex++;
            if (bulletIndex >= MAX_BULLETS) {
                bulletIndex = 0;
            }
        
            lastTimeBulletFired = +new Date();

        }
    }

    /*
     * Move my ship at the bottom of the screen
     */
    function initMyShip() {
        myship.x = (game.screen.width * 0.5) - (myship.width * 0.5);
        myship.y = game.screen.height - (myship.height * 2);
        myship.z = 3;
        myship.selectFrame("p38");
    }

    function createUpdateTimer() {
        updateTimerID = setInterval(function(e) {
            moveBackground();
        
            checkEnemies();
            fireBullet();
        }, 100);
    }

    // Stop update timer before app is closed
    window.addEventListener('android:back', function(e) {
        clearInterval(updateTimerID);
    });

    return self;
}

module.exports = MainScene;
