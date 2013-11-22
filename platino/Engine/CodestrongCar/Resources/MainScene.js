/*
 * Shooter game example
 *
 * Touch screen to move our ship. The bullets are fired automatically.
 */
var alloy = require('co.lanica.platino');

function MainScene(window, game) {

    var debug = true;

    var updateTimerID = 0;
    var positionTimerID = 0;

    // Create scene
    var self = alloy.createScene();

    var track = null;
    var titleScreen = null;

    var titleScreenTransform = null;
    var trackTransform = null;

    var lookAtTransform  = null;
    var zoomOutTransform = null;

    var cars = [];

    var carControlPad = null;
    var brakeButton   = null;

    var DEFAULT_CAR_SPEED = 5;
    var DEFAULT_CAR_SPEED_WITH_BRAKE = 3;
    var carSpeed = DEFAULT_CAR_SPEED;

    var started = false;

    var pubnub = null;
    var canUsePubNub   = true;
    var useMultiplayer = true;

    var myUUID = null;
    var myCarIndex = 0;

    var braking = false;

    function moveCar(index, param) {
        cars[index].x = param.x;
        cars[index].y = param.y;
        cars[index].angle = param.angle;
    }

    function checkCameraPosition() {
        var diffX = Math.abs(cars[myCarIndex].x - game.camera.eyeX);
        var diffY = Math.abs(cars[myCarIndex].y - game.camera.eyeY);

        if (diffX > game.screen.width * 0.25) {
            lookAt(cars[myCarIndex].x, cars[myCarIndex].y, alloy.ANIMATION_CURVE_LINEAR);
        } else if (diffY > game.screen.height * 0.25) {
            lookAt(cars[myCarIndex].x, cars[myCarIndex].y, alloy.ANIMATION_CURVE_LINEAR);
        }
    }

    var updateTimer = function(e) {
        var r = cars[myCarIndex].angle * Math.PI / 180;
        cars[myCarIndex].x = cars[myCarIndex].x + carSpeed * Math.cos(r);
        cars[myCarIndex].y = cars[myCarIndex].y + carSpeed * Math.sin(r);

        if (cars[myCarIndex].x < cars[myCarIndex].width) cars[myCarIndex].x = cars[myCarIndex].width;
        if (cars[myCarIndex].x > track.width - cars[myCarIndex].width) cars[myCarIndex].x = track.width - cars[myCarIndex].width;

        if (cars[myCarIndex].y < cars[myCarIndex].width) cars[myCarIndex].y = cars[myCarIndex].width;
        if (cars[myCarIndex].y > track.height - cars[myCarIndex].width) cars[myCarIndex].y = track.height - cars[myCarIndex].width;

        checkCameraPosition();
    };

    var positionTimer = function(e) {
        send_position();
    };

    var zoomOutCompleted = function(e) {
        lookAt(680, 1500, alloy.ANIMATION_CURVE_EASE_IN);

        setInterval(updateTimer, 33);
        setInterval(positionTimer, 5000);
    };

    var titleScreenTransformCompleted = function(e) {
        started = true;

        track.show();
        carControlPad.alpha = 0.5;
        brakeButton.alpha   = 0.5;

        track.duration = 1500;
        track.transform(trackTransform);
    };

    var trackTransformCompleted = function(e) {
        zoomOut();
    };

    var handleCarControlPadAngle = 0;

    var handleCarControlPad = function(e) {
        var rX = carControlPad.center.x - e.x;
        var rY = carControlPad.center.y - e.y;

        var angle = (((Math.atan2(rY, rX) * 180 / Math.PI) - 90) % 360) * 0.8;
        if (angle >  45 || angle < -45) return;

        var angle0 = cars[myCarIndex].angle + (angle - handleCarControlPadAngle);

        cars[myCarIndex].angle = angle0;

        handleCarControlPadAngle = angle;
    };

    var handleTouch = function(_e) {

        var e =  {type:_e.type, source:_e.source};
        e.x = _e.x * game.touchScaleX;
        e.y = _e.y * game.touchScaleY;

        if (e.type == "touchstart") {
            if (!started) {
                if (titleScreen.alpha == 1) {
                    titleScreenTransform.duration = 1000;
                    titleScreenTransform.alpha = 0;
                    titleScreen.transform(titleScreenTransform);

                    return;
                } else {
                    return;
                }
            }

            if (brakeButton.contains(e.x, e.y)) {
                if (braking) {
                    carSpeed = DEFAULT_CAR_SPEED;
                    brakeButton.color(1, 1, 1);
                } else {
                    carSpeed = DEFAULT_CAR_SPEED_WITH_BRAKE;
                    brakeButton.color(0.5, 0.5, 0.5);
                }
                braking = !braking;
            }
        }

        if (e.type == "touchend") {
            handleCarControlPadAngle = 0;
        } else {
            if (carControlPad.contains(e.x, e.y)) {
                handleCarControlPad(e);
            }
        }
    };

    self.addEventListener('onloadsprite', function(e) {
        Ti.API.info("onloadsprite: " + e.tag);
        if (e.tag == "TRACK") {
            game.unloadTexture(e.tag);
        } else if (e.tag == "TITLE_SCREEN") {
            game.unloadTexture(e.tag);

            var t = alloy.createTransform();
            t.duration = 1500;
            t.alpha = 1;

            titleScreen.transform(t);
        }
    });

    function lookAt(eyeX, eyeY, easing) {
        var defaultCamera = game.defaultCamera;
        var camera = game.camera;

        if (eyeX < 500)  eyeX = 500;
        if (eyeX > 1500) eyeX = 1500;
        if (eyeY < 500)  eyeY = 500;
        if (eyeY > 1500) eyeY = 1500;

        var distanceX = camera.eyeX - eyeX;
        var distanceY = camera.eyeY - eyeY;

        var distance = Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2));
        lookAtTransform.duration = distance / 500 * 1000;

        lookAtTransform.easing = easing;
        lookAtTransform.lookAt_centerX = eyeX;
        lookAtTransform.lookAt_centerY = eyeY;
        lookAtTransform.lookAt_eyeX = eyeX;
        lookAtTransform.lookAt_eyeY = eyeY;
        lookAtTransform.lookAt_eyeZ = defaultCamera.eyeZ;

        game.moveCamera(lookAtTransform);
    }

    function zoomOut() {
        var defaultCamera = game.defaultCamera;

        zoomOutTransform.duration = 1000;
        zoomOutTransform.easing = alloy.ANIMATION_CURVE_EASE_IN;
        zoomOutTransform.lookAt_centerX = track.width  * 0.5;
        zoomOutTransform.lookAt_centerY = track.height * 0.5;
        zoomOutTransform.lookAt_eyeX = track.width  * 0.5;
        zoomOutTransform.lookAt_eyeY = track.height * 0.5;
        zoomOutTransform.lookAt_eyeZ = defaultCamera.eyeZ * 2;

        game.moveCamera(zoomOutTransform);
    }

    self.addEventListener('activated', function(e) {
        Ti.API.info("main scene is activated");


        setupPubNub();

        myUUID = Titanium.Platform.createUUID();

        cars = [];
        started = false;

        cars[myCarIndex] = alloy.createSprite({image:'graphics/car1.png'});
        cars[1] = alloy.createSprite({image:'graphics/car2.png'});
        cars[2] = alloy.createSprite({image:'graphics/car3.png'});

        if (updateTimerID > 0) {
            clearInterval(updateTimerID);
            updateTimerID = 0;
        }

        if (positionTimerID > 0) {
            clearInterval(positionTimerID);
            positionTimerID = 0;
        }

        if (track === null) {
            track = alloy.createSprite({image:'graphics/track.png'});
            track.tag = "TRACK";
        }

        if (titleScreen === null) {
            titleScreen = alloy.createSprite({image:'graphics/titlescreen.png'});
            titleScreen.tag = "TITLE_SCREEN";
        }

        if (lookAtTransform === null) {
            lookAtTransform = alloy.createTransform();
        }

        if (zoomOutTransform === null) {
            zoomOutTransform = alloy.createTransform();
        }

        if (titleScreenTransform === null) {
            titleScreenTransform = alloy.createTransform();
        }

        if (trackTransform === null) {
            trackTransform = alloy.createTransform();
        }

        if (carControlPad === null) {
            carControlPad = alloy.createSprite({image:'graphics/control_base.png'});
        }

        if (brakeButton === null) {
            brakeButton = alloy.createSprite({image:'graphics/A.png'});
        }

        zoomOutTransform.addEventListener('complete', zoomOutCompleted);
        titleScreenTransform.addEventListener('complete', titleScreenTransformCompleted);
        trackTransform.addEventListener('complete', trackTransformCompleted);

        cars[myCarIndex].x = 550;
        cars[myCarIndex].y = 1610;
        cars[myCarIndex].z = track.z + 1;

        cars[myCarIndex].rotationCenter = {x:cars[myCarIndex].width * 0.5, y:cars[myCarIndex].height * 0.5};

        cars[1].x = 550;
        cars[1].y = 1680;
        cars[1].z = track.z + 1;

        cars[1].rotationCenter = {x:cars[1].width * 0.5, y:cars[1].height * 0.5};

        cars[2].x = 550;
        cars[2].y = 1750;
        cars[2].z = track.z + 1;

        cars[2].rotationCenter = {x:cars[2].width * 0.5, y:cars[2].height * 0.5};

        carControlPad.width  = carControlPad.width  * 2;
        carControlPad.height = carControlPad.height * 2;

        brakeButton.width  = brakeButton.width  * 2;
        brakeButton.height = brakeButton.height * 2;

        carControlPad.x = game.STAGE_START.x;
        carControlPad.y = game.screen.height - (carControlPad.height * 0.5);
        carControlPad.z = 99;

        brakeButton.x = game.STAGE_END.x - brakeButton.width;
        brakeButton.y = game.screen.height - brakeButton.height;
        brakeButton.z = 99;

        carControlPad.hide();
        brakeButton.hide();

        track.hide();

        self.add(titleScreen);
        self.add(track);

        self.add(cars[myCarIndex]);
        self.add(cars[1]);
        self.add(cars[2]);

        game.addHUD(carControlPad);
        game.addHUD(brakeButton);

        game.addEventListener('touchstart', handleTouch);
        game.addEventListener('touchmove',  handleTouch);
        game.addEventListener('touchend',   handleTouch);

        game.startCurrentScene();
    });

    self.addEventListener('deactivated', function(e) {
        Ti.API.info("main scene is deactivated");

        if (track !== null) {
            self.remove(track);
            track = null;
        }

        game.removeEventListener('touchstart', handleTouch);
        game.removeEventListener('touchmove',  handleTouch);
        game.removeEventListener('touchend',   handleTouch);
    });

    // Stop update timer before app is closed
    window.addEventListener('android:back', function(e) {
        clearInterval(updateTimerID);
    });

    function setupPubNub() {
        if (!started) return;
        if (!useMultiplayer) return;

        // -------------------------------------
        // INIT PUBNUB
        // -------------------------------------
        pubnub = require('pubnub').init({
            publish_key   : 'pub-44d16618-cd6d-4d24-a53f-1e0c3892b25f',
            subscribe_key : 'sub-ec91aa28-16ff-11e2-be37-e33ebb8fccd1',
            ssl           : false,
            origin        : 'pubsub.pubnub.com'
        });

        // -------------------------------------
        // LISTEN FOR MESSAGES
        // -------------------------------------
        pubnub.subscribe({
            channel  : 'codestrong_car',
            connect  : function() {
                Ti.API.info("subscribe:connect");
            },
            callback : function(message) {
                // Ignore my own message
                if (message.issuer == myUUID) return;

                Ti.API.log("subscribe:callback " + JSON.stringify(message));
                var index = 0;
                if (message.command == "position") {
                    index = parseInt(message.data.car, 10);
                    if (index >= 0 && index < cars.length) {
                        moveCar(index, message.data);
                    }
                }

            },
            error : function() {
                Ti.API.info("subscribe:error");
                canUsePubNub = false;
            }
        });

    }

    function send_position() {
        var param = {car:myCarIndex,
                x:cars[myCarIndex].x, y:cars[myCarIndex].y, angle:cars[myCarIndex].angle};
        send_a_message("position", param);
    }

    // ----------------------------------
    // SEND MESSAGE
    // ----------------------------------
    function send_a_message(command, data) {
        // If we failed to subscribe, try to reconnect
        if (pubnub === null || !canUsePubNub) {
            setupPubNub();
        }

        if (pubnub === null) {
            return;
        }

        pubnub.publish({
            channel  : 'codestrong_car',
            message  : { command : command, data : data, issuer : myUUID },
            callback : function(info) {
                if (info[0]) {
                    Ti.API.log("Successfully Sent Message!");
                }
                if (!info[0]) {
                    Ti.API.log("Failed Because: " + info[1]);
                }
            }
        });
    }

    return self;
}

module.exports = MainScene;
