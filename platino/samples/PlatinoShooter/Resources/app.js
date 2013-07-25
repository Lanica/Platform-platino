/*
 * Shooter game example
 *
 * Touch screen to move our ship. The bullets are fired automatically.
 */
var MAX_ENEMIES = 10;
var MAX_BULLETS = 10;

var window = Ti.UI.createWindow({backgroundColor:'black',
    orientationModes: [
        Ti.UI.LANDSCAPE_LEFT,
        Ti.UI.LANDSCAPE_RIGHT,
        Ti.UI.PORTRAIT,
        Ti.UI.UPSIDE_PORTRAIT
    ]
});

// Obtain module and create game view
var alloy = require('co.lanica.platino');
var game = alloy.createGameView();

game.debug = true;
game.fps = 30;
game.color(0, 0, 0);

// Create scene
var scene = alloy.createScene();
game.pushScene(scene);

// Create my ship instance
var myship = alloy.createSpriteSheet({image:'graphics/ship.png', width:24, height:29});

// Transform object that reacts to user interaction
var myshipMover = alloy.createTransform();
myshipMover.addEventListener('complete', function(e) {
    myship.frame = 2;
});

// Initialize bullets, enemies and background
var bullets = new Array(MAX_BULLETS);
var bulletMover = new Array(MAX_BULLETS);
var explosions = new Array(MAX_BULLETS);
var bulletIndex = 0;

var enemies = new Array(MAX_ENEMIES);
var enemyMover = new Array(MAX_ENEMIES);
var backgrounds;
var backgroundMover;
var backgroundFollowMover;

var touchScaleX = 1;
var touchScaleY = 1;

/*
 * Initialize background
 */
function createBackground() {
    backgrounds = [
        alloy.createSpriteSheet({image: 'graphics/cloud.xml', frame:0}),
        alloy.createSpriteSheet({image: 'graphics/cloud.xml', frame:1}),
        alloy.createSpriteSheet({image: 'graphics/cloud.xml', frame:2}),
        alloy.createSpriteSheet({image: 'graphics/cloud.xml', frame:3}),
        alloy.createSpriteSheet({image: 'graphics/cloud.xml', frame:4})
    ];
    
    backgroundMover = new Array(backgrounds.length);
    backgroundFollowMover = new Array(backgrounds.length);
    
    for (var i = 0; i < backgrounds.length; i++) {
        backgrounds[i].x = Math.random() * (game.screen.width - backgrounds[i].width);
        backgrounds[i].y = Math.random() * (game.screen.height - backgrounds[i].height);
        backgrounds[i].z = 0;
        backgrounds[i].ready = true;
        
        scene.add(backgrounds[i]);
        
        backgroundMover[i] = alloy.createTransform();
        backgroundMover[i].index = i;
        backgroundMover[i].addEventListener('complete', backgroundCompleted);
        
        backgroundFollowMover[i] = alloy.createTransform();
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
        bullets[i] = alloy.createSpriteSheet({image:'graphics/bullet.xml'});
        bullets[i].selectFrame("bullet3");
        bullets[i].width = bullets[i].width * 2;
        bullets[i].hide();
        bullets[i].ready = true;
        
        explosions[i] = alloy.createSpriteSheet({image:'graphics/explosion2.png', width:12, height:12});
        explosions[i].hide();
        
        bulletMover[i] = alloy.createTransform();
        bulletMover[i].index = i;
        
        bulletMover[i].addEventListener('complete', bulletsCompleted);
        scene.add(bullets[i]);
        scene.add(explosions[i]);
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
        {image:'graphics/enemy0.png', width:23, height:29, frame:1, speed: 120},
        {image:'graphics/enemy1.png', width:19, height:25, frame:1, speed: 140},
        {image:'graphics/enemy2.png', width:20, height:26, frame:1, speed: 160}
    ];
    
    for (var i = 0; i < MAX_ENEMIES; i++) {
        var rindex = parseInt(Math.random() * 3, 10) % 3;
        enemies[i] = alloy.createSpriteSheet(enemyprop[rindex]);
        enemies[i].hide();
        enemies[i].ready = true;
        enemyMover[i] = alloy.createTransform();
        enemyMover[i].index = i;
        
        enemyMover[i].addEventListener('complete', enemyCompleted);
        
        scene.add(enemies[i]);
    }
}

var enemyCompleted = function(e) {
    enemies[e.source.index].hide();
    enemies[e.source.index].ready = true;
};

/*
 * Move background, set speed of the movement slower than the enemies and my ship
 * that enables kind of parallax background effect.
 */
function moveBackground() {
    for (var i = 0; i < backgrounds.length; i++) {
        if (!backgrounds[i].ready) continue;
        
        if (backgrounds[i].y >= game.screen.height) {
            backgrounds[i].x =  Math.random() * game.screen.width;
            backgrounds[i].y = -backgrounds[i].height;
        }
        
        backgrounds[i].z = 0;
        backgrounds[i].ready = false;
        
        backgroundMover[i].y = game.screen.height;
        backgroundMover[i].duration = Math.abs(game.screen.height - backgrounds[i].y) / 50 * 1000;
        
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
                    explosions[j].x = enemies[i].x + (enemies[i].width  * 0.5);
                    explosions[j].y = enemies[i].y + (enemies[i].height * 0.5);
                    explosions[j].z = enemies[i].z + 1;
                    // Scale up the explosion bacause the image is too small.
                    explosions[j].scale(4, 4);
                    explosions[j].animate(0, 14, 33, 0);
                    explosions[j].show();
                    
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

        if (distanceX > game.screen.width * 0.25) {
            enemies[i].frame = 0;
        } else if (-distanceX > game.screen.width * 0.25) {
            enemies[i].frame = 2;
        } else {
            enemies[i].frame = 1;
        }
            
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
        bulletMover[bulletIndex].duration = (bullets[bulletIndex].y + bullets[bulletIndex].height) / 150 * 1000;
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
    myship.z = 1;
    myship.frame = 2;
}

function initGameScreen() {
    var sscale = 1;
    if (game.size.height >= game.size.width) {
        sscale = game.size.height / 480;
    } else {
        sscale = game.size.width  / 480;
    }
    game.screen = {width:game.size.width / sscale, height:game.size.height / sscale};

    touchScaleX = game.screen.width  / game.size.width;
    touchScaleY = game.screen.height / game.size.height;
}

var updateTimerID = 0;

game.addEventListener('onload', function(e) {
    initGameScreen();
    
    initMyShip();

    scene.add(myship);

    createBackground();
    createBullets();
    createEnemies();

    game.start();
    
    createUpdateTimer();
});

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
    window.close();
});

/*
 * Move our ship at the center of the touch-event position
 * Move the background a bit, that causes parallized effect
 */
game.addEventListener('touchstart', function(e) {
    myship.clearTransform(myshipMover);
    
    myshipMover.x = e.x * touchScaleX;
    myshipMover.y = e.y * touchScaleY;
    myshipMover.easing = alloy.ANIMATION_CURVE_CUBIC_OUT;
    
    var distanceX = myship.x - myshipMover.x;
    var distanceY = myship.y - myshipMover.y;
    
    var distance = Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2));
    myshipMover.duration = distance / 50 * 1000;
    
    myship.frame  = myship.x > myshipMover.x ? 0 : 4;
    myship.transform(myshipMover);
    
    for (var i = 0; i < backgrounds.length; i++) {
        backgrounds[i].clearTransform(backgroundFollowMover[i]);
        
        backgroundFollowMover[i].x = backgrounds[i].x + (distanceX * 0.2);
        backgroundFollowMover[i].duration = 1000;
        backgrounds[i].transform(backgroundFollowMover[i]);
    }
});

//
// transform 3d
//
function transform_standup_3d(target) {
    var transform = alloy.createTransform();
    
    transform.duration = 1000;
    transform.easing = alloy.ANIMATION_CURVE_LINEAR;
    transform.rotate_axis = alloy.X;
    transform.rotate_centerX = target.width * 0.5;
    transform.rotate_centerY = target.height;
    transform.angle = -20;
    
    target.transform(transform);
}

//
// transform 2d
//
function transform_sitdown_2d(target) {
    var transform = alloy.createTransform();
    
    transform.duration = 1000;
    transform.easing = alloy.ANIMATION_CURVE_LINEAR;
    transform.rotate_axis = alloy.X;
    transform.rotate_centerX = target.width * 0.5;
    transform.rotate_centerY = target.height;
    transform.angle = 0;
    
    target.transform(transform);
}

var transform_camera = alloy.createTransform();

transform_camera.addEventListener('complete', function(e) {
    var i;
    if (transform_camera.is3d) {
        for (i = 0; i < MAX_ENEMIES; i++) {
            transform_standup_3d(enemies[i]);
        }
        for (i = 0; i < MAX_BULLETS; i++) {
            transform_standup_3d(bullets[i]);
            transform_standup_3d(explosions[i]);
        }

    } else {
        for (i = 0; i < MAX_ENEMIES; i++) {
            transform_sitdown_2d(enemies[i]);
        }
        for (i = 0; i < MAX_BULLETS; i++) {
            transform_sitdown_2d(bullets[i]);
            transform_sitdown_2d(explosions[i]);
        }
    }
});

//
// Called when orientation is changed
//
game.addEventListener('orientationchange', function(e) {
    game.orientation = e.orientation;

    clearInterval(updateTimerID);
    initGameScreen();

    createUpdateTimer();

    myship.clearTransform(myshipMover);
    
    myshipMover.x = (game.screen.width * 0.5) - (myship.width * 0.5);
    myshipMover.y = game.screen.height - (myship.height * 2);
    myshipMover.duration = 1000;
    myship.transform(myshipMover);

    // We have to move our camera because camera setting has been changed
    if (transform_camera.is3d) {
        transform_3d();
    } else {
        transform_2d();
    }
});

//
// 3D camera transfromation
//
function transform_3d() {
    transform_camera.is3d = true;
    transform_camera.duration = 3000;
    transform_camera.lookAt_eyeY = game.screen.height;
    transform_camera.lookAt_eyeZ = 64;
    transform_camera.lookAt_centerY = 0;
    transform_camera.easing = alloy.ANIMATION_CURVE_LINEAR;
    
    game.moveCamera(transform_camera);
}

function transform_2d() {
    var default2dCameraSetting = game.defaultCamera;

    transform_camera.is3d = false;
    transform_camera.duration = 3000;
    transform_camera.lookAt_eyeX = default2dCameraSetting.eyeX;
    transform_camera.lookAt_eyeY = default2dCameraSetting.eyeY;
    transform_camera.lookAt_eyeZ = default2dCameraSetting.eyeZ;
    transform_camera.lookAt_centerX = default2dCameraSetting.centerX;
    transform_camera.lookAt_centerY = default2dCameraSetting.centerY;
    transform_camera.easing = alloy.ANIMATION_CURVE_LINEAR;
    
    game.moveCamera(transform_camera);
}

function resetCamera() {
    game.resetCamera();
    transform_camera.is3d = false;
}

/*
 * Double-tap to transform to 2.5D camera
 */
game.addEventListener('doubletap', function(e) {
    if (transform_camera.is3d) {
        transform_2d();
    } else {
        transform_3d();
    }
});

// load debug functions
Ti.include("debug.js");

window.add(game);
window.open({fullscreen:true, navBarHidden:true});
