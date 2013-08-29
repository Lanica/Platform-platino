var platino = require('co.lanica.platino');
var chipmunk2dmodule = require('co.lanica.chipmunk2d');
var chipmunk = chipmunk2d;
var v = chipmunk.cpv;

var MainScene = function(window, game) {
	var scene = platino.createScene();
	scene.color(0.85, 0.96, 0.96);
	
	// constants
	var TIMESTEP = 1.0 / game.fps;
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
	
	// chipmunk y-coordinates are reverse value of platino's, so use the following
	// function to convert chipmunk y-coordinate values to platino y-coordinates and vice versa
	var cpY = function(y) {
		return game.STAGE_START.y + game.TARGET_SCREEN.height - y;
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
		
		// create a pyramid of boxes starting at slightly off-screen (top)
		for (i = 0; i < PYRAMID_ROW_COUNT; i++) {
			for (j = 0; j <= i; j++) {
				
				// create the sprite and add it to the scene
				sprite = platino.createSprite({
					tag: 'sprite_' + i + '-' + j,
					image: 'graphics/crate' + game.imageSuffix + '.png',
					width: width,
					height: height,
					
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
				moment = chipmunk.cpMomentForBox(mass, width-2, height-2);
				
				// create a body for each sprite
				body = chipmunk.cpBodyNew(mass, moment);
				chipmunk.cpSpaceAddBody(space, body);
				chipmunk.cpBodySetPos(body, v(sprite.center.x, cpY(sprite.center.y)));
				
				// create a shape
				shape = chipmunk.cpBoxShapeNew(body, width-2, height-2);
				chipmunk.cpSpaceAddShape(space, shape);
				chipmunk.cpShapeSetElasticity(shape, 0.1);
				chipmunk.cpShapeSetFriction(shape, 0.8);
				
				// store references for sprite, moment, body, and shape
				pSprites.push(sprite);
				pMoments.push(moment);
				pBodies.push(body);
				pShapes.push(shape);
			}
		}
		
		// create a ball at the bottom of the screen for the pyramid to fall onto
		sprite = platino.createSprite({
			tag: 'ball',
			image: 'graphics/ball' + game.imageSuffix + '.png',
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
		scene.add(sprite);
		
		moment = chipmunk.cpMomentForCircle(mass, 0, radius, v(0, 0));
		body = chipmunk.cpBodyNew(mass, moment);
		chipmunk.cpSpaceAddBody(space, body);
		chipmunk.cpBodySetPos(body, v(sprite.center.x, cpY(sprite.center.y)));
		shape = chipmunk.cpCircleShapeNew(body, radius, v(0, 0));
		chipmunk.cpSpaceAddShape(space, shape);
		chipmunk.cpShapeSetElasticity(shape, 0);
		chipmunk.cpShapeSetFriction(shape, 0.9);
		
		pSprites.push(sprite);
		pMoments.push(moment);
		pBodies.push(body);
		pShapes.push(shape);
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
	};
	
	// game loop (enterframe listener)
	var update = function() {
        chipmunk.cpSpaceStep(space, TIMESTEP);
		syncSpritesWithPhysics();
	};
	
	var onSceneActivated = function(e) {
		
		// Create chipmunk space
		space = chipmunk.cpSpaceNew();
		data = new chipmunk.cpSpaceAddCollisionHandlerContainer();
		chipmunk.cpSpaceAddCollisionHandler(space, 0, 0, begin, preSolve, postSolve, separate, data);
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
		
		createGroundAndWalls();
		createSpritesMomentsBodiesAndShapes();
		
		// wait 3 seconds after the scene loads and start the game loop
		setTimeout(function() {
			game.addEventListener('enterframe', update);
		}, 3000);
	};

	// scene 'deactivated' event listener function (scene exit-point)
	var onSceneDeactivated = function(e) {
		game.removeEventListener('enterframe', update);
	};

	scene.addEventListener('activated', onSceneActivated);
	scene.addEventListener('deactivated', onSceneDeactivated);
	return scene;
};

module.exports = MainScene;