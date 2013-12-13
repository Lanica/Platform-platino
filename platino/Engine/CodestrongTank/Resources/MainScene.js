/*
 * Tank game example
 */
var platino = require('co.lanica.platino');
var ALmixer = platino.require('co.lanica.almixer');

function MainScene(window, game) {

    // Create scene
    var self = platino.createScene();

    var updateTimerID = 0;

    var tank        = [];
    var tankTurret  = [];
    var tankBullet  = [];
    var bulletExplosion  = [];
    var tankRect    = [];
    var bulletRect    = [];

    var tankMovingSound = ALmixer.LoadAll("sounds/tankloop-5.wav");
    var tankBulletSound = ALmixer.LoadAll("sounds/fire-tank1.wav");
    var tankExplosionSound = ALmixer.LoadAll("sounds/explosion-3.wav");
    var tankRotateSound = ALmixer.LoadAll("sounds/rotate-tank3.wav");

    var tankMovingBullet  = [];
    var tankMovingBulletTransform  = [];

    var tankTransform = [];
    var tankTurretTransform = [];

    var buttonA = null;
    var buttonB = null;

    var tankCount = 3;

    var pubnub = null;
    var canUsePubNub = true;

    var useMultiplayer = true;

    var myUUID = null;
    var myTankIndex = 0;
    var myOffsetX = 0;
    var myOffsetY = 0;

    var started = false;

    var MAX_ANIMATION_FRAME_INDEX = 23;
    var MAX_ANIMATION_FRAME_COUNT = MAX_ANIMATION_FRAME_INDEX + 1;

    var ANIMATION_INTERVAL = 60;

    var useParticle = true;

    if (Ti.Platform.osname == 'android') {
        useParticle = false;
    }

    var map = null;
    var tree = [];
    var cloud = [];
    var cloudTransform = [];
    var rock = [];

	// Each tank needs to play a (looping) unique "moving" sound, that way when the specific tank stops moving, we know which sound to stop playing.
	// So play the sound, and save the channel in an array (keyed by which tank it belongs to).
	var	tankMovingCurrentPlayingChannel = [];
	// Similar case for the rotating sound.
	var tankRotatingCurrentPlayingChannel = [];

    var canFire = true;

    var tankFrame = {
        down: 0,
        left: 6,
        up  : 12,
        right: 18
    };

    var tankAnimationFrame = {
        down: {left:[1,2,3,4,5,6], up:[1,2,3,4,5,6,7,8,9,10,11,12], right:[23,22,21,20,19,18]},
        left: {down:[5,4,3,2,1,0], up:[7,8,9,10,11,12], right:[7,8,9,10,11,12,13,14,15,16,17,18]},
        up:   {right:[13,14,15,16,17,18], down:[13,14,15,16,17,18,19,20,21,22,23,0], left:[11,10,9,8,7,6]},
        right:{down:[19,20,21,22,23,0], left:[17,16,15,14,13,12,11,10,9,8,7,6], up:[17,16,15,14,13,12]}
    };

    var turretFirePosition = [
        {x:125, y:260}, // 0001
        {x:100, y:190}, // 0002
        {x:80,  y:180}, // 0003
        {x:55,  y:170}, // 0004
        {x:40,  y:155}, // 0005
        {x:35,  y:140}, // 0006
        {x:40,  y:130}, // 0007
        {x:35,  y:110}, // 0008
        {x:42,  y:96},  // 0009
        {x:60,  y:85},  // 0010
        {x:80,  y:72},  // 0011
        {x:100, y:70},  // 0012
        {x:125, y:65},  // 0013
        {x:155, y:67},  // 0014
        {x:180, y:80},  // 0015
        {x:200, y:85},  // 0016
        {x:220, y:100}, // 0017
        {x:225, y:110},  // 0018
        {x:220, y:130},  // 0019
        {x:224, y:145},  // 0020
        {x:215, y:160},  // 0021
        {x:200, y:170},  // 0022
        {x:180, y:180},  // 0023
        {x:160, y:190}   // 0024
    ];

    // randomized tree position
    var tree_seed =  [[988,198,5],[652,65,2],[198,492,3],[527,274,1],[427,13,3],[33,297,1],[706,375,0],[470,257,0]];
    var MAX_TREE_COUNT  = 8;
    var MAX_CLOUD_COUNT = 5;

    function checkCollision() {
        for (var i = 0; i < tankCount; i++) {
            if (tankMovingBullet[i].alpha === 0) continue;
            for (var j = 0; j < tankCount; j++) {
                if (i == j) continue;
                if (tank[j].alpha > 0 && bulletRect[i].collidesWith(tankRect[j])) {
                    tankMovingBullet[i].clearTransform(tankMovingBulletTransform[i]);
                    tankMovingBulletTransformCompleted({source:{index:i}});
                }
            }
        }
    }

    /*
    ** fix touch coordinates because parent view may have different scale and camera
    **/
    function locationInView(_e) {
        var e = {type:_e.type, source:_e.source};
        var x = _e.x * game.touchScaleX;
        var y = _e.y * game.touchScaleY;
        
        e.x = x;
        e.y = y;
        
        return e;
    }

    var tankMovingBulletTransformCompleted = function(e) {
        var index = e.source.index;
        var x = tankMovingBullet[index].center.x;
        var y = tankMovingBullet[index].center.y;

        tankMovingBullet[index].hide();

        canFire = true;

        explode(x, y, index);
    };

    function movetank(e, index) {
        Ti.API.info("MOVE " + index + " (" + e.x + "x" + e.y + ")");

        var speed = 150;

        tankTransform[index].x = e.x - (tank[index].width  * 0.5 * tank[index].scaleX);
        tankTransform[index].y = e.y - (tank[index].height * 0.5 * tank[index].scaleX);

        var distanceX = tank[index].x - tankTransform[index].x;
        var distanceY = tank[index].y - tankTransform[index].y;
        var distance = Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2));
        tankTransform[index].duration = distance / speed * 1000;

		// Each tank needs to play a (looping) unique "moving" sound, that way when the specific tank stops moving, we know which sound to stop playing.
		// So play the sound, and save the channel in an array (keyed by which tank it belongs to).
		// If the tank is already playing a sound, we want to skip playing another sound.
		if(tankMovingCurrentPlayingChannel[index] === -1)
		{
			var saved_channel = ALmixer.PlayChannel(tankMovingSound, -1);
			tankMovingCurrentPlayingChannel[index] = saved_channel;
		}

        tank[index].transform(tankTransform[index]);
    }

    function getRotationDegreeOfTank(e, index) {
        var x = e.x - tank[index].center.x;
        var y = e.y - tank[index].center.y;

        var r = Math.atan2(y, x);
        var d = r / (Math.PI / 180);

        return d;
    }

    function getAngleByFrame(frame) {
        return ((frame * (360 / MAX_ANIMATION_FRAME_COUNT)) + 90) % 360;
    }

    function getAngleOfTank(index) {
        return ((tank[index].frame * (360 / MAX_ANIMATION_FRAME_COUNT)) + 90) % 360;
    }

    function rotateTank(e, index) {

        var d = getRotationDegreeOfTank(e, index);
        var absd = Math.abs(d);

        var from_heading = tank[index].heading;
        var to_heading   = null;

        if (absd < 45) {
            to_heading = "right";
        } else if (absd > 135) {
            to_heading = "left";
        } else if (d >= 45 && d <= 135) {
            to_heading = "down";
        } else {
            to_heading = "up";
        }

        if (from_heading == to_heading) return;

        tank[index].heading = to_heading;
        tank[index].animate(tankAnimationFrame[from_heading][to_heading], ANIMATION_INTERVAL, 0, 0);
    }

    function zeroPad(num, places) {
        var zero = places - num.toString().length + 1;
        return Array(+(zero > 0 && zero)).join("0") + num;
    }

    function rotateTurret(e, index) {
        var frames = getAnimationFrame(tank[index], e, index);

        if (frames.length > 0) {
            tankTurret[index].animate(frames, ANIMATION_INTERVAL, 0, 0);
        }
        //tankTurret[index].selectFrame(zeroPad(to_frame, 4));

        return frames.length;
    }

    function getAnimationFrame(target, e, index) {
        var d = Math.abs(getRotationDegreeOfTank(e, index) + 270) % 360;

        var from_frame = tank[index].frame;
        var to_frame = Math.ceil(d / (360 / MAX_ANIMATION_FRAME_COUNT));

        var frame_count = to_frame - from_frame;
        var frames = [];
        var reverse = false;

        if (frame_count < 0) {
            frame_count = to_frame + (MAX_ANIMATION_FRAME_INDEX - from_frame);
        }

        if (frame_count > MAX_ANIMATION_FRAME_INDEX - (MAX_ANIMATION_FRAME_COUNT / 4)) {
            reverse = true;
            frame_count = MAX_ANIMATION_FRAME_INDEX - frame_count;
        }

        for (var i = 0; i < frame_count; i++) {
            frames[i] = from_frame;

            if (reverse) {
                from_frame = from_frame - 1;
            } else {
                from_frame = from_frame + 1;
            }

            if (from_frame > MAX_ANIMATION_FRAME_INDEX) from_frame = 0;
            if (from_frame < 0) from_frame = MAX_ANIMATION_FRAME_INDEX;
        }

        return frames;
    }

    function rotateTankAndTurret(e, index) {

        var frames = getAnimationFrame(tank[index], e, index);

        if (frames.length > 0) {
            tank[index].animate(frames, ANIMATION_INTERVAL, 0, 0);
            tankTurret[index].animate(frames, ANIMATION_INTERVAL, 0, 0);

			// If the tank was already playing a turning sound, let's halt that one first.
			// The abrupt sound restart will give clear audio feedback that the player changed their turn action and the game responded.
			if(tankRotatingCurrentPlayingChannel[index] > -1)
			{
				ALmixer.HaltChannel(tankRotatingCurrentPlayingChannel[index]);
			}
			// Since we know how long the turning animation is, we can use PlayChannelTimed to automatically stop the audio at the right time, especially if the turning time is shorter than the sample.
			// If the animation interval is longer than the audio file, it will stop playing before that unless we loop the audio.
			// But this audio file we're using doesn't sound very good looping, so let's not do that.
			var total_animation_time_in_msec = frames.length * ANIMATION_INTERVAL;
			tankRotatingCurrentPlayingChannel[index] = ALmixer.PlayChannelTimed(tankRotateSound, 0, total_animation_time_in_msec, function(sound_finished_event) {
					// Now that we know the sound finished via the callback, we should clear our variable indicating that the sound was playing.
					tankRotatingCurrentPlayingChannel[index] = -1;
				}
			);
        }
        //tank[index].selectFrame(zeroPad(to_frame, 4));

        return frames.length;
    }

    // Fire turret
    function fire(index, param) {

        if (!canFire) return;
        /*
        if (!useParticle) {
            tankBullet[index].scale(0.2, 0.2);

            tankBullet[index].x = tank[index].x + (turretFirePosition[tankTurret[index].frame].x * tank[index].scaleX) - tank[index].width  * 0.5;
            tankBullet[index].y = tank[index].y + (turretFirePosition[tankTurret[index].frame].y * tank[index].scaleY) - tank[index].height * 0.5;

            tankBullet[index].show();
            tankBullet[index].animate(0, 16, ANIMATION_INTERVAL, 0);

        } else {
            tankBullet[index].x = tank[index].x + (turretFirePosition[tankTurret[index].frame].x * tank[index].scaleX);
            tankBullet[index].y = tank[index].y + (turretFirePosition[tankTurret[index].frame].y * tank[index].scaleY);

            if (tankBullet[index].started) {
                tankBullet[index].restart();
            } else {
                tankBullet[index].started = true;
                self.add(tankBullet[index]);
            }
        }
        */

        fireBullet(getFireToPosition(param.x, param.y, getAngleByFrame(param.frame)), index);

        canFire = false;
    }

    // Fire bullet
    function fireBullet(param, index) {

		ALmixer.PlayChannel(tankBulletSound);

        var speed = 400;

        var fromX = tank[index].x + (turretFirePosition[tankTurret[index].frame].x * tank[index].scaleX) - tank[index].width  * 0.5;
        var fromY = tank[index].y + (turretFirePosition[tankTurret[index].frame].y * tank[index].scaleY) - tank[index].height * 0.5;

        tankMovingBullet[index].x = fromX;
        tankMovingBullet[index].y = fromY;

        var toX = param.x - tankMovingBullet[index].width  * 0.5;
        var toY = param.y - tankMovingBullet[index].height * 0.5;

        var distanceX = fromX - toX;
        var distanceY = fromY - toY;
        var distance = Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2));
        tankMovingBulletTransform[index].duration = distance / speed * 1000;

        tankMovingBulletTransform[index].x = toX;
        tankMovingBulletTransform[index].y = toY;

        tankMovingBullet[index].show();
        tankMovingBullet[index].frame = 1;

        tankMovingBullet[index].transform(tankMovingBulletTransform[index]);
    }

    function explode(toX, toY, index) {
		ALmixer.PlayChannel(tankExplosionSound);

        if (!useParticle) {
            bulletExplosion[index].x = toX - (bulletExplosion[index].width  * 0.5);
            bulletExplosion[index].y = toY - (bulletExplosion[index].height * 0.5);

            bulletExplosion[index].show();
            bulletExplosion[index].animate(0, 16, ANIMATION_INTERVAL, 0);
        } else {
            bulletExplosion[index].x = toX;
            bulletExplosion[index].y = toY;

            if (bulletExplosion[index].started) {
                bulletExplosion[index].restart();
            } else {
                bulletExplosion[index].started = true;
                self.add(bulletExplosion[index]);
            }
        }
    }

	var stopTankMovingAudioLoop = function (index) {
		// If the tank was playing a moving sound, we want to stop that specific sound now.
		var playing_channel = tankMovingCurrentPlayingChannel[index]
		// There is the possibility that so many sounds were playing at the same time (i.e. more than 32),
		// that PlayChannel refused to play and returned -1. Don't do anything in the -1 case.
		if(playing_channel > -1) {
			ALmixer.HaltChannel(playing_channel);
			// reset the value to -1 to represent no sound is playing
			tankMovingCurrentPlayingChannel[index] = -1;
		}
	}

    var aim = function(_e) {
        var e = locationInView(_e);

        var frameCount = rotateTankAndTurret(e, myTankIndex);
        var param = {x:tank[myTankIndex].center.x, y:tank[myTankIndex].center.y};

        // Stop moving
        send_a_message("stop", {x:param.x, y:param.y, tank:myTankIndex, offsetX:myOffsetX, offsetY:myOffsetY});
        setTimeout(function() { movetank(param, myTankIndex); }, ANIMATION_INTERVAL * frameCount);
    };

    function getFireToPosition(fromX, fromY, angle) {
        var r = angle * Math.PI / 180;
        var amount = game.screen.height * 0.7;

        return {x:fromX + (amount * Math.cos(r)), y:fromY + (amount * Math.sin(r))};
    }

    var handleTouchEvent = function(_e) {
        var e = locationInView(_e);

        if (e.type == "touchstart") {
            if (buttonA.contains(e.x, e.y)) {
                buttonA.color(0.5, 0.5, 0.5);
                return;
            }

        } else if (e.type == "touchend") {
            buttonA.color(1, 1, 1);

            if (buttonA.contains(e.x, e.y)) {
                var param = {x:tank[myTankIndex].center.x, y:tank[myTankIndex].center.y, frame:tank[myTankIndex].frame};
                send_a_message("fire", {tank:myTankIndex,
                        frame:tank[myTankIndex].frame,
                        x:param.x,
                        y:param.y,
                        offsetX:myOffsetX,
                        offsetY:myOffsetY
                    });
                movetank(param, myTankIndex);
                fire(myTankIndex, param);

                return;
            }

            // You can fire when the tank moves
            canFire = true;

            var frameCount = rotateTankAndTurret(e, myTankIndex);

            send_a_message("move", {x:e.x, y:e.y, tank:myTankIndex, offsetX:myOffsetX, offsetY:myOffsetY});
            setTimeout(function() { movetank(e, myTankIndex); }, ANIMATION_INTERVAL * frameCount);
        }
    };

    function showSettingDialog() {
        var dialog = Ti.UI.createOptionDialog();
        dialog.title = "SELECT PLAYER";
        dialog.options = ["Panzer", "M24", "Tiger"];

        dialog.addEventListener("click", function(e) {
            if (e.index >= 0 && e.index < tankCount) {
                myTankIndex = e.index;
            }

            var param = {tank:myTankIndex};
            send_a_message("ping", param);

            tank[myTankIndex].show();
            tankTurret[myTankIndex].show();
        });

        dialog.show();
    }

    function send_position() {
        var param = {tank:myTankIndex,
                x:tank[myTankIndex].center.x, y:tank[myTankIndex].center.y,
                offsetX:myOffsetX, offsetY:myOffsetY};
        send_a_message("position", param);
    }

    function setupPubNub() {
        if (!started) return;
        if (!useMultiplayer) return;

        // -------------------------------------
        // INIT PUBNUB
        // -------------------------------------
        pubnub = require('pubnub').init({
            publish_key   : YOUR_PUBNUB_PUBLISH_KEY_HERE,
            subscribe_key : YOUR_PUBNUB_SUBSCRIBE_KEY_HERE,
            ssl           : false,
            origin        : 'pubsub.pubnub.com'
        });

        // -------------------------------------
        // LISTEN FOR MESSAGES
        // -------------------------------------
        pubnub.subscribe({
            channel  : 'codestrong_tank',
            connect  : function() {
                Ti.API.info("subscribe:connect");
            },
            callback : function(message) {
                // Ignore my own message
                if (message.issuer == myUUID) return;

                Ti.API.log("subscribe:callback " + JSON.stringify(message));
                var index = 0;
                var param = {};
                if (message.command == "ping") {
                    index = parseInt(message.data.tank, 10);
                    if (index >= 0 && index < tank.length) {
                        tank[index].show();
                        tankTurret[index].show();
                        Ti.API.info("SHOW TANK " + index);
                    }
                    send_position();
                } else if (message.command == "move") {
                    index = parseInt(message.data.tank, 10);
                    if (index >= 0 && index < tank.length) {
                        param = {x:message.data.x, y:message.data.y};
                        rotateTankAndTurret(param, index);
                        movetank(param, index);
                    }
                    send_position();
                } else if (message.command == "stop") {
                    index = parseInt(message.data.tank, 10);
                    if (index >= 0 && index < tank.length) {
                        param = {x:message.data.x, y:message.data.y};
                        rotateTankAndTurret(param, index);
                        movetank(param, index);
                    }
                } else if (message.command == "fire") {
                    index = parseInt(message.data.tank, 10);
                    if (index >= 0 && index < tank.length) {
                        tank[index].selectFrame(zeroPad(message.data.frame, 4));
                        tankTurret[index].selectFrame(zeroPad(message.data.frame, 4));
                        tank[index].clearTransform(tankTransform[index]);
                        movetank({x:message.data.x, y:message.data.y}, index);
						// Since we're clearing the tank stopped moving transform and we're stopping the tank, we need to cancel its moving audio sound.
						// This is tricky, but we need to stop the audio after movetank(), otherwise movetank will start playing audio again.
						stopTankMovingAudioLoop(index);
                        fire(index, message.data);
                    }
                    send_position();
                } else if (message.command == "position") {
                    index = parseInt(message.data.tank, 10);
                    if (index >= 0 && index < tank.length) {
                        tank[index].center = {x:message.data.x, y: message.data.y};
                        tank[index].show();
                        tankTurret[index].show();
                    }
                }

            },
            error : function() {
                Ti.API.info("subscribe:error");
                canUsePubNub = false;
            }
        });

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
            channel  : 'codestrong_tank',
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

    var cloudTransformCompleted = function(e) {
        var index = e.source.index;

        cloud[index].x = cloud[index].initialX;
        cloud[index].y = cloud[index].initialY - game.screen.height;

        cloud[index].transform(cloudTransform[index]);
    };


    var tankTransformCompleted = function(e) {
        var index = e.source.index;

		stopTankMovingAudioLoop(index);
    };

    self.addEventListener('activated', function(e) {
        Ti.API.info("main scene is activated");

        setupPubNub();

        myUUID = Titanium.Platform.createUUID();

        tank = [];
        tankTurret = [];
        tankRect = [];
        bulletRect = [];

        tankTransform = [];
        tankTurretTransform = [];

        rock = [];
		
		tankMovingCurrentPlayingChannel = [];
		tankRotatingCurrentPlayingChannel = [];

        // Create on-screen controller
        buttonA = platino.createSprite({image:'graphics/A.png'});
        buttonA.tag = "buttonA";
        buttonA.alpha = 0.5;
        buttonA.width  = buttonA.width  * 2;
        buttonA.height = buttonA.height * 2;

        buttonA.x = game.screen.width  - buttonA.width;
        buttonA.y = game.screen.height - buttonA.height;
        buttonA.z = 99;

        self.add(buttonA);

        // Create Tanks
        for (var i = 0; i < tankCount; i++) {
            if (i % 3 === 0) {
                tank[i] = platino.createSpriteSheet({image:'graphics/Panzer/PanzerA.xml'});
                tankTurret[i] = platino.createSpriteSheet({image:'graphics/Panzer/PanzerTurret.xml'});
                tank[i].tag = "PanzerA";
                tankTurret[i].tag = "PanzerTurret";
            } else if (i % 3 === 1) {
                tank[i] = platino.createSpriteSheet({image:'graphics/Tiger/TigerA.xml'});
                tankTurret[i] = platino.createSpriteSheet({image:'graphics/Tiger/TigerTurret.xml'});
                tank[i].tag = "TigerA";
                tankTurret[i].tag = "TigerTurret";
            } else {
                tank[i] = platino.createSpriteSheet({image:'graphics/M24/M24A.xml'});
                tankTurret[i] = platino.createSpriteSheet({image:'graphics/M24/M24Turret.xml'});
                tank[i].tag = "M24A";
                tankTurret[i].tag = "M24Turret";
            }

            tankMovingBulletTransform[i] = platino.createTransform();
            tankMovingBullet[i] = platino.createSpriteSheet({image:'graphics/explosion.xml'});
            tankMovingBullet[i].hide();

            tankMovingBulletTransform[i].index = i;
            tankMovingBulletTransform[i].addEventListener('complete', tankMovingBulletTransformCompleted);

            if (!useParticle) {
                tankBullet[i] = platino.createSpriteSheet({image:'graphics/explosion.xml'});
                bulletExplosion[i] = platino.createSpriteSheet({image:'graphics/explosion.xml'});
                tankBullet[i].hide();
                bulletExplosion[i].hide();
                self.add(tankBullet[i]);
                self.add(bulletExplosion[i]);
            } else {
                tankBullet[i] = platino.createParticles({image:'graphics/fire.pex'});
                bulletExplosion[i] = platino.createParticles({image:'graphics/bang.pex'});
            }

            tankBullet[i].started = false;
            bulletExplosion[i].started = false;

            tank[i].heading = "down";
            tankTurret[i].heading = "down";

            tank[i].scaleFromCenter(0.7, 0.7, 0, 0);
            tankTurret[i].scaleFromCenter(0.7, 0.7, 0, 0);

            tankTurret[i].followParentTransformRotation = false;
            tankTurret[i].followParentMove = true;
            tank[i].addTransformChildWithRelativePosition(tankTurret[i]);

            tank[i].center = {x:game.screen.width * 0.5, y:game.screen.height * 0.5};
            tankTurret[i].center = {x:game.screen.width * 0.5, y:game.screen.height * 0.5};

            tankRect[i] = platino.createSprite({width:tank[i].width * 0.5, height:tank[i].height * 0.5});
            tankRect[i].color(0, 0, 1);
            tankRect[i].alpha = 0;

            bulletRect[i] = platino.createSprite({width:tankMovingBullet[i].width * 0.25, height:tankMovingBullet[i].height * 0.25});
            bulletRect[i].color(0, 1, 0);
            bulletRect[i].alpha = 0;

            tankRect[i].center = tank[i].center;
            tankRect[i].followParentMove = true;
            tank[i].addTransformChildWithRelativePosition(tankRect[i]);

            bulletRect[i].center = tankMovingBullet[i].center;
            bulletRect[i].followParentMove = true;
            tankMovingBullet[i].addTransformChildWithRelativePosition(bulletRect[i]);

            tank[i].z = i + 1;
            tankTurret[i].z = i + 2;
            tankBullet[i].z = i + 3;
            bulletExplosion[i].z = i + 4;
            tankMovingBullet[i].z = i + 5;
            tankRect[i].z = 99;
            bulletRect[i].z = 99;

            self.add(tank[i]);
            self.add(tankTurret[i]);
            self.add(tankMovingBullet[i]);
            self.add(tankRect[i]);
            self.add(bulletRect[i]);

            tankTransform[i] = platino.createTransform();
            tankTurretTransform[i] = platino.createTransform();

            tankTransform[i].index = i;
            tankTransform[i].addEventListener('complete', tankTransformCompleted);

            tank[i].hide();
            tankTurret[i].hide();

			// We need each tank to record which sounds they are currently playing so we can shut off the right sound when needed.
			// (This is also useful if we want to add positional audio effects because each tank has a unique position.)
			// Initialize each tank's playing channel to -1 which means it is not playing.
			tankMovingCurrentPlayingChannel[i] = -1;
			tankRotatingCurrentPlayingChannel[i] = -1;
			
        }

        // Create terrain map
        if (map === null) {
            var mapfile = Ti.Filesystem.getFile(Titanium.Filesystem.resourcesDirectory, 'graphics/Terrain.json');
            var mapjson = JSON.parse(mapfile.read().toString());

            var mapinfo = {
                image:"graphics/" + mapjson.tilesets[0].image,
                tileWidth:mapjson.tilesets[0].tilewidth,
                tileHeight:mapjson.tilesets[0].tileheight,
                border:mapjson.tilesets[0].spacing,
                margin:mapjson.tilesets[0].margin
            };

            map = platino.createMapSprite(mapinfo);

            map.firstgid = mapjson.tilesets[0].firstgid; // tilemap id is started from 'firstgid'
            map.tiles = mapjson.layers[0].data;
            map.orientation = platino.MAP_ISOMETRIC;
            map.mapSize = {width:mapjson.layers[0].width, height:mapjson.layers[0].height};
            map.tileTiltFactorY = mapjson.tileheight * 0.5 / mapjson.tilesets[0].tileheight;
            
            map.z = 0;
            map.center = {x:game.screen.width * 0.5, y:game.screen.height * 0.5};


            self.add(map);
        }

        // Create trees
        var generateRandom = false;
        var forprint = [];
        for (i = 0; i < MAX_TREE_COUNT; i++) {
            if (i % 4 === 0) {
                tree[i] = platino.createSprite({image:'graphics/Bush.png'});
            } else {
                tree[i] = platino.createSpriteSheet({image:'graphics/tree.xml'});
            }
            var frameindex = 0;
            if (generateRandom) {
                tree[i].x = Math.floor(Math.random() * (game.screen.width  - tree[i].width));
                tree[i].y = Math.floor(Math.random() * (game.screen.height - tree[i].height));
                frameindex = Math.floor(Math.random() * 4);
                tree[i].frame = frameindex;
            } else {
                tree[i].x = tree_seed[i][0];
                tree[i].y = tree_seed[i][1];
                tree[i].frame = tree_seed[i][2];
            }
            tree[i].z = 50;
            self.add(tree[i]);

            forprint[i] = [tree[i].x, tree[i].y, frameindex];
        }
        if (generateRandom) {
            Ti.API.info(JSON.stringify(forprint));
        }

        // Create clouds
        for (i = 0; i < MAX_CLOUD_COUNT; i++) {
            cloud[i] = platino.createSpriteSheet({image:'graphics/cloud.xml'});
            cloudTransform[i] = platino.createTransform();
            cloudTransform[i].index = i;
            cloudTransform[i].addEventListener('complete', cloudTransformCompleted);

            if (generateRandom) {
                cloud[i].x = Math.floor(Math.random() * game.screen.width);
                cloud[i].y = Math.floor(Math.random() * game.screen.height) - game.screen.height;
                cloud[i].frame = Math.floor(Math.random() * 3);
            } else {
                cloud[i].x = tree_seed[i][0];
                cloud[i].y = tree_seed[i][1] - game.screen.height - cloud[i].height;
                cloud[i].frame = tree_seed[i][2] <= 2 ? tree_seed[i][2] : 0;
            }

            cloud[i].initialX = cloud[i].x;
            cloud[i].initialY = cloud[i].y;
            cloud[i].z = 99;
            self.add(cloud[i]);

            cloud[i].alpha = 0.5;

            cloudTransform[i].duration = 20000;
            cloudTransform[i].x = cloud[i].x;
            cloudTransform[i].y = tree_seed[i][1] + game.screen.height;

            cloud[i].transform(cloudTransform[i]);
        }

        if (updateTimerID > 0) {
            clearInterval(updateTimerID);
            updateTimerID = 0;
        }

        updateTimerID = setInterval(function(e) {
            checkCollision();
        }, 100);

        game.addEventListener('touchstart', handleTouchEvent);
        game.addEventListener('touchend',   handleTouchEvent);
    });

    self.addEventListener('onloadsprite', function(e) {
        Ti.API.info("onloadsprite: " + e.tag);
        if (!started && e.tag == "PanzerA") {
            started = true;
            game.startCurrentScene();
            showSettingDialog();
        }
    });

    self.addEventListener('deactivated', function(e) {
        Ti.API.info("main scene is deactivated");

        game.removeEventListener('touchstart', handleTouchEvent);
        game.removeEventListener('touchend',   handleTouchEvent);

        self.remove(map);
        map = null;

        for (var i = 0; i < tankCount; i++) {

           tankMovingBulletTransform[i].removeEventListener('complete', tankMovingBulletTransformCompleted);

           self.remove(tank[i]);
           self.remove(tankTurret[i]);
           self.remove(tankBullet[i]);
           self.remove(tankMovingBullet[i]);
           self.remove(bulletExplosion[i]);
           self.remove(tankRect[i]);
           tank[i]       = null;
           tankTurret[i] = null;
           tankBullet[i] = null;
           tankMovingBullet[i] = null;
           tankMovingBulletTransform[i] = null;
           bulletExplosion[i] = null;
           tankTransform[i]       = null;
           tankTurretTransform[i] = null;
           tankRect[i] = null;
        }

        tank       = [];
        tankTurret = [];
        tankBullet = [];
        tankMovingBullet = [];
        bulletExplosion = [];
        tankTransform = [];
        tankTurretTransform = [];
        tankRect = [];
    });

    // Stop update timer before app is closed
    window.addEventListener('android:back', function(e) {
        if (updateTimerID > 0) {
            clearInterval(updateTimerID);
        }
    });

    return self;
}

module.exports = MainScene;
