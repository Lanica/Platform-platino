var platino = require('co.lanica.platino');
// Note: Yes, the module loading technique is a little different in this case.
// Instead of using a return value, a global variable called co_lanica_chipmunk2d was registered.
// We can alias that with a local variable called chipmunk for brevity.
require('co.lanica.chipmunk2d');
var chipmunk = co_lanica_chipmunk2d;
var v = chipmunk.cpv;

var DebugDraw = require("co.lanica.chipmunk2d.debugdraw");
// DebugDraw options: 
// 
// BB = draw bounding box
// Circle = draw circle shape
// Vertex = draw polygon vertex
// Poly = draw polygon shape
// Constraint = draw constraint anchor
// ConstraintConnection = draw constraint connection between bodies
//
// Methods:
// DebugDraw.addBody(body)
// DebugDraw.removeBody(body)
// DebugDraw.addBodies(arrayOfBodies)
// DebugDraw.removeBodies(arrayOfBodies)
//


var MainScene = function(window, game) {
	var scene = platino.createScene();
	scene.color(0.85, 0.96, 0.96);
	
	// constants
	var TICKS_PER_SECOND = 180.0; // recommended between 60 and 240; higher = more accuracy (but higher CPU load)
	var PYRAMID_ROW_COUNT = 6;

	// forward declarations
	var ground = null;
	var leftWall = null;
	var rightWall = null;
	var space = null;
	var data = null;
	var pSprites = null;
	var pMoments = null;
	var pBodies = null;
	var pShapes = null;

	var pConstraint1 = [];
	var pConstraint2 = [];
	var pConstraint3 = [];
	var _accumulator = 0.0;

	var debugDraw = new DebugDraw(platino, chipmunk, game, scene, {BB:false, Circle:true, Vertex:false, Poly:true, Constraint:true, ConstraintConnection:true});
	debugDraw.active = false;
	
	// chipmunk y-coordinates are reverse value of platino's, so use the following
	// function to convert chipmunk y-coordinate values to platino y-coordinates and vice versa
	var cpY = function(y) {
		return (game.screen.height - y);
	};
	
	// convert chipmunk angle (radians) to platino angles (degrees)
	var cpAngle = function(angle) {
		return -(angle) * (180/Math.PI);
	};
	
    // get a random number between min and max (not related to chipmunk directly)
	var getRandomInRange = function(min, max) {
		return Math.random() * (max - min) + min;
	};
    
    // returns sprites associated with arbiter
    // an arbiter is a chipmunk struct that holds information about two bodies that have collided
	var getSpritesFromArbiter = function(arbiter) {
		var bodies, sprites, i;
		
		bodies = [];
		sprites = [];
		chipmunk.cpArbiterGetBodies(arbiter, bodies);
		
		for (i = pBodies.length-1; i >= 0; i--) {
			// Notice how we use .equals method instead of JavaScript equality operator? (===)
			// Physics bodies must be compared using equals method.
			if ((pBodies[i].equals(bodies[0])) || (pBodies[i].equals(bodies[1]))) {
				sprites.unshift(pSprites[i]);
			}
			
			if (sprites.length >= 2) {
				break;
			}
		}
		if (sprites.length >= 2) {
			return {
				a: sprites[0],
				b: sprites[1]
			};
		}
	};
	
    // [begin] phase collision callback
	var begin = function(arbiter, space) {		
		var sprites;
		
		sprites = getSpritesFromArbiter(arbiter);
		
		if (sprites) {
			Ti.API.info("[begin] collision for " + sprites.a.tag + ' with ' + sprites.b.tag);
		}
	};
    
    // [preSolve] phase collision callback
    var preSolve = function(arbiter, space) {
        var sprites;
        
        sprites = getSpritesFromArbiter(arbiter);
		
		if (sprites) {
			Ti.API.info("[preSolve] collision for " + sprites.a.tag + ' with ' + sprites.b.tag);
		}
    };
    
    // [postSolve] phase collision callback
    var postSolve = function(arbiter, space) {
        var sprites;
        
		sprites = getSpritesFromArbiter(arbiter);
		
		if (sprites) {
			Ti.API.info("[postSolve] collision for " + sprites.a.tag + ' with ' + sprites.b.tag);
		}
    };
    
    // [separate] phase collision callback (bodies have separated)
    var separate = function(arbiter, space) {
        var sprites;
        
        sprites = getSpritesFromArbiter(arbiter);
		
		if (sprites) {
			Ti.API.info("[separate] collision for " + sprites.a.tag + ' with ' + sprites.b.tag);
		}
    };
	
	var createGroundAndWalls = function() {
		// Create left and right walls
		leftWall = chipmunk.cpSegmentShapeNew(space.staticBody, v(0, cpY(0)), v(0, 0), 0);
		chipmunk.cpShapeSetElasticity(leftWall, 1);
		chipmunk.cpShapeSetFriction(leftWall, 1);
		chipmunk.cpSpaceAddShape(space, leftWall);
		
		rightWall = chipmunk.cpSegmentShapeNew(space.staticBody, v(game.screen.width, cpY(0)), v(game.screen.width, 0), 0);
		chipmunk.cpShapeSetElasticity(rightWall, 1);
		chipmunk.cpShapeSetFriction(rightWall, 1);
		chipmunk.cpSpaceAddShape(space, rightWall);
		
		// Create a ground at the very bottom of the screen.
		ground = chipmunk.cpSegmentShapeNew(space.staticBody, v(0,0), v(game.screen.width, 0), 0);
		chipmunk.cpShapeSetElasticity(ground, 1);
		chipmunk.cpShapeSetFriction(ground, 1);
		chipmunk.cpSpaceAddShape(space, ground);
	};
	
	var createSpritesMomentsBodiesAndShapes = function() {
		var i, j, sprite, width, height, mass, moment, body, shape, radius;
		
		mass = 1; // we'll use a mass of 1 for everything
		width = 42;
		height = 42;
		radius = width * 0.5 - 1;
		
		// create a pyramid of basketballs starting at slightly off-screen (top)
		for (i = 0; i < PYRAMID_ROW_COUNT; i++) {
			for (j = 0; j <= i; j++) {
				sprite = platino.createSprite({
					tag: 'basketball',
					image: 'graphics/basketball' + game.imageSuffix + '.png',
					width: width,
					height: height,
					center: {
						x: game.STAGE_START.x + (game.TARGET_SCREEN.width * 0.5),
						y: game.TARGET_SCREEN.height - (radius*2)
					},
					
					// set the rotation anchor point to center of sprite
					anchorPoint: {
						x: 0.5,
						y: 0.5
					}
				});
				game.setupSpriteSize(sprite);
				sprite.color(getRandomInRange(0.5, 1.0), getRandomInRange(0.5, 1.0), getRandomInRange(0.5, 1.0)); // set sprite to random light color
				sprite.center = {
					x: j * width - i * (width * 0.5) + (game.STAGE_START.x + (game.TARGET_SCREEN.width * 0.5)),
					y: cpY((game.TARGET_SCREEN.height + 60) - i * width)
				};
				scene.add(sprite);
				
				// create a moment of inertia to use for body creation
				moment = chipmunk.cpMomentForCircle(mass, 0, radius, v(0, 0));

				// create a body for each sprite
				body = chipmunk.cpBodyNew(mass, moment);
				chipmunk.cpSpaceAddBody(space, body);
				chipmunk.cpBodySetPos(body, v(sprite.center.x, cpY(sprite.center.y)));

				// create a shape
				shape = chipmunk.cpCircleShapeNew(body, radius, v(0, 0));
				chipmunk.cpSpaceAddShape(space, shape);
				chipmunk.cpShapeSetElasticity(shape, 0.9);
				chipmunk.cpShapeSetFriction(shape, 0.1);
				
				// store references for sprite, moment, body, and shape
				pSprites.push(sprite);
				pMoments.push(moment);
				pBodies.push(body);
				pShapes.push(shape);

				var body_index = (i * j) + j;
				if (body_index > 0 && body_index % 4 === 0) {
					var constraint1 = chipmunk.cpSlideJointNew(pBodies[0], body, v(-20,-20), v(20,20), 0, 240);
					var constraint2 = chipmunk.cpGearJointNew(pBodies[0], body, 0, 2);
					var constraint3 = chipmunk.cpSimpleMotorNew(pBodies[0], body, 3);

					chipmunk.cpSpaceAddConstraint(space, constraint1);
					chipmunk.cpSpaceAddConstraint(space, constraint2);
					chipmunk.cpSpaceAddConstraint(space, constraint3);

					// IMPORTANT: save constraint pointer to protect from gc
					pConstraint1.push(constraint1);
					pConstraint2.push(constraint2);
					pConstraint3.push(constraint3);
				}
			}
		}
	};
	
	// Polls the position and angle of all physics bodies, and adjusts the
	// properties of the corresponding sprite to match
	var syncSpritesWithPhysics = function() {
		var i, pos, angle;
		
		for (i = 0; i < pSprites.length; i++) {
			if (!chipmunk.cpBodyIsSleeping(pBodies[i])) {
				pos = chipmunk.cpBodyGetPos(pBodies[i]);
				angle = cpAngle(chipmunk.cpBodyGetAngle(pBodies[i]));
				
				pSprites[i].x = pos.x - (pSprites[i].width * 0.5);
				pSprites[i].y = cpY(pos.y) - (pSprites[i].height * 0.5);
				pSprites[i].angle = angle;
			}
		}

		if ((debugDraw != null) && (debugDraw.active)) {
			debugDraw.update();
		}

	};

	var stepPhysics = function(delta) {
		var dt = delta/1000.0;
        var fixed_dt = 1.0/TICKS_PER_SECOND;

        // add the current dynamic timestep to the accumulator
        _accumulator += dt;

        while(_accumulator > fixed_dt) {
        	chipmunk.cpSpaceStep(space, fixed_dt);
        	_accumulator -= fixed_dt;
        }
	};
	
	// game loop (enterframe listener)
	var update = function(e) {
        stepPhysics(e.delta);
		syncSpritesWithPhysics();
	};

	// touch listener for the screen (turn debug draw on)
	var onScreenTouch = function() {
		debugDraw.active = true;
	};
	
	var onSceneActivated = function(e) {
		
		// Create chipmunk space
		space = chipmunk.cpSpaceNew();
		//data = new chipmunk.cpSpaceAddCollisionHandlerContainer();
		//chipmunk.cpSpaceAddCollisionHandler(space, 0, 0, begin, preSolve, postSolve, separate, data);
		chipmunk.cpSpaceSetGravity(space, v(0, -200));
		chipmunk.cpSpaceSetSleepTimeThreshold(space, 0.5);
		chipmunk.cpSpaceSetCollisionSlop(space, 0.5);
		
		// holds references to all physics-enabled sprites
		pSprites = [];
		
		// The following arrays will hold references to moments, bodies, and shapes for two reasons:
		// a) so they are not garbage collected before you're ready to use them
		// b) so you can sync sprite properties with bodies in your game loop (e.g. enterframe)
		pMoments = [];
		pBodies = [];
		pShapes = [];
		
		// add background image
		scene.add(platino.createSprite({
			image: 'graphics/bg.png',
			width: 320,
			height: 480,
			x: 0,
			y: 0
		}));

		// add message to let user know they can touch the screen to activate debug draw
		var message = platino.createTextSprite({
			text: 'Tap screen to activate debug draw.',
			fontSize: 16,
			x: 25,
			y: 25
		});
		var messageSize = message.sizeWithText(message.text);
		message.width = messageSize.width;
		message.height = messageSize.height;
		message.color(1.0, 1.0, 1.0);
		message.hide();
		scene.add(message);
		

		createGroundAndWalls();
		createSpritesMomentsBodiesAndShapes();

		if (debugDraw !== null) {
			debugDraw.addBodies(pBodies);
		}
		
		// wait 3 seconds after the scene loads and start the game loop
		setTimeout(function() {
			game.addEventListener('enterframe', update);
			game.addEventListener('touchstart', onScreenTouch);
			message.show();
		}, 3000);
	};

	// scene 'deactivated' event listener function (scene exit-point)
	var onSceneDeactivated = function(e) {
		game.removeEventListener('enterframe', update);
		game.removeEventListener('touchstart', onScreenTouch);
		scene.dispose();
	};

	scene.addEventListener('activated', onSceneActivated);
	scene.addEventListener('deactivated', onSceneDeactivated);
	return scene;
};

module.exports = MainScene;
