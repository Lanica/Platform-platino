var platino = require('co.lanica.platino');
require('co.lanica.chipmunk2d');
var chipmunk = co_lanica_chipmunk2d;
var DebugDraw = require('co.lanica.chipmunk2d.debugdraw');
var v = chipmunk.cpv;

// constants
var TICKS_PER_SECOND = 180.0; // recommended between 60 and 240; higher = more accuracy (but higher CPU load)	
var FLUID_DENSITY = 0.00014;
var FLUID_DRAG = 2.0;
var INFINITY = 1.7976931348623157E+10308;
var PLAYER_MOVE_SPEED = 1.5;
var MAX_BOXES = 15;

// cached math functions
var Math_abs = Math.abs;
var Math_exp = Math.exp;
var Math_floor = Math.floor;
var Math_random = Math.random;

var GameScene = function(window, game) {
	var scene = platino.createScene();

	// sprite/physics references
	var space = null;
	var sprites = null;
	var bodies = null;
	var shapes = null;

	// other forward declarations
	var _accumulator = null;
	var boundary_bottom = null;
	var boundary_right = null;
	var boundary_bottom = null;
	var waterCollisionContainer = null;
	var water1_1 = null,
		water1_2 = null,
		water1_1_transform = null,
		water1_2_transform = null,
		water2_1 = null,
		water2_2 = null,
		water2_1_transform = null,
		water2_2_transform = null;
	var playerFeetCollisionContainer = null;
	var touchY = null;
	var boxCount = null,
		boxTimer = null;
	var playerContactPoints = null;

	// initialize debug drawing
	var debugDraw = new DebugDraw(platino, chipmunk, game, scene, {BB:true, Circle:true, Vertex:true, Poly:true, Constraint:false, ConstraintConnection:false});

	// converts between chipmunk and platino y-coordinate
	var cpY = function(y) {
		return (game.screen.height - y);
	};
	
	// converts radians (chipmunk) to degrees (platino)
	var cpAngle = function(angle) {
		return -(angle) * (180/Math.PI);
	};

	// returns random number within range
	var rand = function(min, max) { 
		var max = max++;
		return Math_floor(Math_random() * (max - min) + min); 
	};

	// Returns sprites associated with bodies in arbiter
    // (An arbiter is a chipmunk struct that holds information about two bodies that have collided)
	var getSpritesFromArbiter = function(arbiter) {
		var collisionBodies, collisionSprites, key;
		
		collisionBodies = [];
		collisionSprites = [];
		chipmunk.cpArbiterGetBodies(arbiter, collisionBodies);
		
		for (key in bodies) {
			if ((bodies.hasOwnProperty(key)) && (sprites.hasOwnProperty(key))) {
				if (collisionSprites.length === 0) {
					if (bodies[key].equals(collisionBodies[0])) {
						collisionSprites.push(sprites[key]);
					}
				} else if (collisionSprites.length === 1) {
					if (bodies[key].equals(collisionBodies[1])) {
						collisionSprites.push(sprites[key]);
						break;
					}
				}
			}
		}

		if (collisionSprites.length >= 2) {
			return {
				a: collisionSprites[0],
				b: collisionSprites[1]
			};
		}
	};

	function onPlayerCollision(arbiter, space) {
		var sh = [];
		chipmunk.cpArbiterGetShapes(arbiter, sh);
		if (sh[1].equals(shapes.playerFeet)) {
			playerContactPoints++;
			sprites.player.canJump = true;
			return true;
		}
	}

	function onPlayerSeparate(arbiter, space) {
		var sh = [];
		chipmunk.cpArbiterGetShapes(arbiter, sh);
		if (sh[1].equals(shapes.playerFeet)) {
			playerContactPoints--;

			if (playerContactPoints <= 0) {
				playerContactPoints = 0;
				if (!sprites.player.inWater) {
					sprites.player.canJump = false;
					sprites.player.pause();
					sprites.player.frame = 1;
				}
			}
			return true;
		}
	}

	// PreSolve collision handler for water
	function preSolveWater(arbiter, space) {
		var shapes, water, poly;
		shapes = [];
		
		chipmunk.cpArbiterGetShapes(arbiter, shapes);
		var water = shapes[0];
		var poly = shapes[1];
		
		var body = poly.body
		var level = water.bb.t;
		var count = chipmunk.cpPolyShapeGetNumVerts(poly);

		if (body.equals(bodies.player)) {
			if (!sprites.player.inWater) {
				sprites.player.inWater = true;
				sprites.player.walk();
				sprites.player.canJump = true;
			}

			if ((!sprites.player.inWater) && (!sprites.player.canJump)) {
				sprites.player.canJump = true;
			}
		}

		var clipped = [];
		var j = count - 1;
		for (var i = 0; i < count; i++) {
			var vj = chipmunk.cpPolyShapeGetVert(poly, j);
			var vi = chipmunk.cpPolyShapeGetVert(poly, i);
			var a = chipmunk.cpBodyLocal2World(body, vj);
			var b = chipmunk.cpBodyLocal2World(body, vi);

			if (a.y < level) {
				clipped.push(a);
			}

			var a_level = a.y - level;
			var b_level = b.y - level;

			if (a_level*b_level < 0.0) {
				var t = Math_abs(a_level)/(Math_abs(a_level) + Math_abs(b_level));
				var v1 = chipmunk.cpvlerp(a, b, t);
				clipped.push(v1);
			}
			j=i;
		}
		if (clipped.length < 1) {
			return true;
		}
		var clippedArea = chipmunk.cpAreaForPoly(clipped.length, clipped);
		var displacedMass = clippedArea * FLUID_DENSITY;
		var centroid = chipmunk.cpCentroidForPoly(clipped.length, clipped);
		var r = chipmunk.cpvsub(centroid, chipmunk.cpBodyGetPos(body));

		var dt = chipmunk.cpSpaceGetCurrentTimeStep(space);
		var g = space.gravity;

		// Apply the buoyancy force as an impulse
		var mult = chipmunk.cpvmult(g, -displacedMass*dt);
		if ((mult === null) || (mult === undefined) || (r === null) || (r === undefined)) {
			return true;
		}
		chipmunk.cpBodyApplyImpulse(body, mult, r);

		// Apply linear damping for the fluid drag
		var v_centroid = chipmunk.cpvadd(chipmunk.cpBodyGetVel(body), chipmunk.cpvmult(chipmunk.cpvperp(r), body.w));
    	var k = 1;
    	var damping = clippedArea * FLUID_DRAG * FLUID_DENSITY;
    	var v_coef = Math_exp(-damping*dt*k);
    	if (!v_centroid) {
    		return true;
    	}
    	chipmunk.cpBodyApplyImpulse(body, chipmunk.cpvmult(chipmunk.cpvsub(chipmunk.cpvmult(v_centroid, v_coef), v_centroid), 1.0/k), r);

    	// Apply angular damping for the fluid drag
    	var w_damping = chipmunk.cpMomentForPoly(FLUID_DRAG * FLUID_DENSITY * clippedArea, clipped.length, clipped, chipmunk.cpvneg(body.p));
    	var w = body.w * Math_exp(-w_damping*dt* (1/body.i));
    	if (w !== NaN) {
    		body.w = w;
    	}

    	return true;
    };

    function separateFromWater(arbiter, space) {
    	var shapes, water, body;
		shapes = [];
		
		chipmunk.cpArbiterGetShapes(arbiter, shapes);
		var water = shapes[0];
		var body = shapes[1].body;

    	if (body.equals(bodies.player)) {
    		if (sprites.player.inWater) {
    			sprites.player.inWater = false;
    		}
    	}
    }

	function createPhysicsBoundaries() {
		// Create left and right walls
		boundary_bottom = chipmunk.cpSegmentShapeNew(space.staticBody, v(0, cpY(0)), v(0, 0), 0);
		chipmunk.cpShapeSetElasticity(boundary_bottom, 1);
		chipmunk.cpShapeSetFriction(boundary_bottom, 1);
		chipmunk.cpSpaceAddShape(space, boundary_bottom);
		
		boundary_right = chipmunk.cpSegmentShapeNew(space.staticBody, v(game.screen.width, cpY(0)), v(game.screen.width, 0), 0);
		chipmunk.cpShapeSetElasticity(boundary_right, 1);
		chipmunk.cpShapeSetFriction(boundary_right, 1);
		chipmunk.cpSpaceAddShape(space, boundary_right);
		
		// Create a boundary_bottom at the very bottom of the screen.
		boundary_bottom = chipmunk.cpSegmentShapeNew(space.staticBody, v(0,0), v(game.screen.width, 0), 0);
		chipmunk.cpShapeSetElasticity(boundary_bottom, 1);
		chipmunk.cpShapeSetFriction(boundary_bottom, 1);
		chipmunk.cpSpaceAddShape(space, boundary_bottom);
	}


	function createStaticGroundBodies() {
		var box = chipmunk.cpBBNew(0, 0, 70, 240); // left, bottom, right, top
		shapes.ground1 = chipmunk.cpBoxShapeNew2(space.staticBody, box);
		chipmunk.cpShapeSetElasticity(shapes.ground1, 1);
		chipmunk.cpShapeSetFriction(shapes.ground1, 1);

		box = chipmunk.cpBBNew(491, 0, 769, 240);
		shapes.ground2 = chipmunk.cpBoxShapeNew2(space.staticBody, box);
		chipmunk.cpShapeSetElasticity(shapes.ground2, 1);
		chipmunk.cpShapeSetFriction(shapes.ground2, 1);

		box = chipmunk.cpBBNew(954, 0, game.STAGE_START.x + game.TARGET_SCREEN.width, 240);
		shapes.ground3 = chipmunk.cpBoxShapeNew2(space.staticBody, box);
		chipmunk.cpShapeSetElasticity(shapes.ground2, 1);
		chipmunk.cpShapeSetFriction(shapes.ground2, 1);

		// add shapes to space
		chipmunk.cpSpaceAddShape(space, shapes.ground1);
		chipmunk.cpSpaceAddShape(space, shapes.ground2);
		chipmunk.cpSpaceAddShape(space, shapes.ground3);
	}

	function createWaterSprites() {
		var fade_duration = 1000;

		water1_1 = platino.createSprite({
			image: 'graphics/water1-1.png',
			width: 420,
			height: 232,
			alpha: 0.6,
			z: 1
		});
		game.setupSpriteSize(water1_1);
		water1_1.x = 70;
		water1_1.y = game.STAGE_START.y + game.TARGET_SCREEN.height - 232;
		water1_1_transform = platino.createTransform({
			duration: fade_duration,
			alpha: 0.2,
			autoreverse: true,
			repeat: -1
		});
		scene.add(water1_1);

		water1_2 = platino.createSprite({
			image: 'graphics/water1-2.png',
			width: 420,
			height: 232,
			alpha: 0.2,
			z: 1
		});
		game.setupSpriteSize(water1_2);
		water1_2.x = 70;
		water1_2.y = game.STAGE_START.y + game.TARGET_SCREEN.height - 232;
		water1_2_transform = platino.createTransform({
			duration: fade_duration,
			alpha: 0.6,
			autoreverse: true,
			repeat: -1
		});
		scene.add(water1_2);

		water1_1.transform(water1_1_transform);
		water1_2.transform(water1_2_transform);

		water2_1 = platino.createSprite({
			image: 'graphics/water2-1.png',
			width: 185,
			height: 232,
			alpha: 0.6,
			z: 1
		});
		game.setupSpriteSize(water2_1);
		water2_1.x = 769;
		water2_1.y = game.STAGE_START.y + game.TARGET_SCREEN.height - 232;
		water2_1_transform = platino.createTransform({
			duration: fade_duration,
			alpha: 0.2,
			autoreverse: true,
			repeat: -1
		});
		scene.add(water2_1);

		water2_2 = platino.createSprite({
			image: 'graphics/water2-2.png',
			width: 185,
			height: 232,
			alpha: 0.2,
			z: 1
		});
		game.setupSpriteSize(water1_2);
		water2_2.x = 769;
		water2_2.y = game.STAGE_START.y + game.TARGET_SCREEN.height - 232;
		water2_2_transform = platino.createTransform({
			duration: fade_duration,
			alpha: 0.6,
			autoreverse: true,
			repeat: -1
		});
		scene.add(water2_2);

		water2_1.transform(water2_1_transform);
		water2_2.transform(water2_2_transform);		
	}

	function createWaterSensors() {
		var bb = chipmunk.cpBBNew(71, 0, 490, 216);
		shapes.water1 = chipmunk.cpBoxShapeNew2(space.staticBody, bb);
		chipmunk.cpShapeSetSensor(shapes.water1, 1);
		chipmunk.cpShapeSetCollisionType(shapes.water1, 1);
		chipmunk.cpSpaceAddShape(space, shapes.water1);

		bb = chipmunk.cpBBNew(769, 0, 954, 216);
		shapes.water2 = chipmunk.cpBoxShapeNew2(space.staticBody, bb);
		chipmunk.cpShapeSetSensor(shapes.water2, 1);
		chipmunk.cpShapeSetCollisionType(shapes.water2, 1);
		chipmunk.cpSpaceAddShape(space, shapes.water2);

		waterCollisionContainer = new chipmunk.cpSpaceAddCollisionHandlerContainer();
		chipmunk.cpSpaceAddCollisionHandler(space, 1, 0, null, preSolveWater, null, separateFromWater, waterCollisionContainer);
	}

	function createPlayer() {
		var width = 75-25;
		var height = 84;
		var mass = 0.3 * FLUID_DENSITY * width * height;
		//var moment = chipmunk.cpMomentForBox(mass, width, height);

		bodies.player = chipmunk.cpBodyNew(mass, INFINITY); // set to INFINITY instead of moment instance to disable rotation
		chipmunk.cpBodySetPos(bodies.player, v(555, cpY(0))); // 190
		chipmunk.cpBodySetVel(bodies.player, v(0, -100));
		chipmunk.cpSpaceAddBody(space, bodies.player);

		shapes.player = chipmunk.cpBoxShapeNew(bodies.player, width, height);
		chipmunk.cpShapeSetElasticity(shapes.player, 0.1);
		chipmunk.cpShapeSetFriction(shapes.player, 0.3);
		chipmunk.cpSpaceAddShape(space, shapes.player);

		// create a small sensor at player's feet to detect whether or not they are on the ground
		var bb = chipmunk.cpBBNew(-(width - 0) * 0.5, -(height * 0.5) - 15, (width - 0) * 0.5, -(height*0.5)+5);
		shapes.playerFeet = chipmunk.cpBoxShapeNew2(bodies.player, bb);
		chipmunk.cpShapeSetSensor(shapes.playerFeet, 1);
		chipmunk.cpSpaceAddShape(space, shapes.playerFeet);
		playerFeetCollisionContainer = new chipmunk.cpSpaceAddCollisionHandlerContainer();
		chipmunk.cpSpaceAddCollisionHandler(space, 0, 0, onPlayerCollision, null, null, onPlayerSeparate, playerFeetCollisionContainer);

		sprites.player = platino.createSpriteSheet({
			asset: 'graphics/player/player.xml',
			anchorPoint: {
				x: 0.5,
				y: 0.5
			},
			x: 555,
			y: cpY(0)
		});
		game.setupSpriteSize(sprites.player);
		sprites.player.lastValidX = sprites.player.x;
		sprites.player.lastValidY = sprites.player.y;
		sprites.player.moveDirection = 1;
		sprites.player.moveSpeed = PLAYER_MOVE_SPEED;
		sprites.player.isWalking = false;
		sprites.player.canJump = false;
		sprites.player.handleMovement = function() {
			sprites.player.scaleX = sprites.player.moveDirection;
			if (sprites.player.isWalking) {
				chipmunk.cpBodyApplyImpulse(bodies.player, v(sprites.player.moveSpeed, 0), v(0, 0));
			}
		};
		sprites.player.showProperFrame = function() {
			if (sprites.player.isWalking) {
				if (!sprites.player.inWater) {
					if (!sprites.player.canJump) {
						sprites.player.pause();
						sprites.player.frame = 1;
					}
				}
			} else {
				if (!sprites.player.inWater) {
					if (sprites.player.canJump) {
						if (Math_abs(bodies.player.v.x) < 0.25) {
							sprites.player.pause();
							sprites.player.frame = 2; // standing still frame
						}
					} else {
						sprites.player.pause();
						sprites.player.frame = 1; // jumping frame
					}
				}
			}
		};
		sprites.player.walk = function() {
			sprites.player.animate(3, 10, 1000/24, -1);
		};
		sprites.player.jump = function() {
			if (sprites.player.canJump) {
				if (bodies.player.v.y < 1) {
					chipmunk.cpBodyApplyImpulse(bodies.player, v(0, 65), v(0, 0));
					sprites.player.canJump = false;
					sprites.player.pause();
					sprites.player.frame = 1;
				}
			}
		};
		scene.add(sprites.player);
		playerContactPoints = 0;
	}

	function createBoxSpawner() {
		boxCount = 0;
		boxTimer = setInterval(function() {
			var boxName = 'box' + boxCount;
			var width = 56;
			var height = 56;
			var radius = (width * 0.5);
			var mass = 0.3 * FLUID_DENSITY * width * height;
			var x = rand(25, game.screen.width - 25);

			sprites[boxName] = platino.createSprite({
				image: 'graphics/box.png',
				width: width,
				height: height,
				anchorPoint: {
					x: 0.5,
					y: 0.5
				},
				x: x,
				y: game.STAGE_START.y - (height * 2)
			});
			game.setupSpriteSize(sprites[boxName]);
			sprites[boxName].lastValidX = sprites[boxName].x;
			sprites[boxName].lastValidY = sprites[boxName].y;
			scene.add(sprites[boxName]);

			// create body and shape for box
			var moment = chipmunk.cpMomentForBox(mass, width, height);
			bodies[boxName] = chipmunk.cpBodyNew(mass, moment);
			chipmunk.cpBodySetPos(bodies[boxName], v(sprites[boxName].x, cpY(sprites[boxName].y)));
			chipmunk.cpBodySetVel(bodies[boxName], v(0, -100));
			chipmunk.cpBodySetAngVel(bodies[boxName], 1);
			chipmunk.cpSpaceAddBody(space, bodies[boxName]);
			debugDraw.addBody(bodies[boxName]);

			shapes[boxName] = chipmunk.cpBoxShapeNew(bodies[boxName], width, height);
			chipmunk.cpShapeSetElasticity(shapes[boxName], 0.5);
			chipmunk.cpShapeSetFriction(shapes[boxName], 0.3);
			chipmunk.cpSpaceAddShape(space, shapes[boxName]);
			
			boxCount++;

			if (boxCount >= MAX_BOXES) {
				clearInterval(boxTimer);
				boxTimer = null;
			}
		}, 4000);
	}

	function stepPhysics(delta) {
		var dt = delta/1000.0;
        var fixed_dt = 1.0/TICKS_PER_SECOND;

        // add the current dynamic timestep to the accumulator
        _accumulator += dt;

        while(_accumulator > fixed_dt) {
        	chipmunk.cpSpaceStep(space, fixed_dt);
        	_accumulator -= fixed_dt;
        }
	}

	function syncSpritesWithPhysics() {
		var i, pos, angle;
		
		for (var key in sprites) {
			if ((sprites.hasOwnProperty(key)) && (bodies.hasOwnProperty(key))) {
				if (!chipmunk.cpBodyIsSleeping(bodies[key])) {
					pos = chipmunk.cpBodyGetPos(bodies[key]);
					angle = cpAngle(chipmunk.cpBodyGetAngle(bodies[key]));

					if (pos.x !== NaN) {
						sprites[key].lastValidX = pos.x;
						sprites[key].x = pos.x - (sprites[key].width * 0.5);
					} else {
						sprites[key].x = sprites[key].lastValidX;
					}

					if (pos.y !== NaN) {
						sprites[key].lastValidY = pos.y;
						sprites[key].y = cpY(pos.y) - (sprites[key].height * 0.5);
					} else {
						sprites[key].y = sprites[key].lastValidY;
					}
					sprites[key].angle = angle;
				}
			}
		};

		if ((debugDraw) && (debugDraw.active)) {
			debugDraw.update();
		}
	}

	function update(e) {
		stepPhysics(e.delta);
		syncSpritesWithPhysics();
		
		sprites.player.handleMovement();
		sprites.player.showProperFrame();
	}

	function onScreenTouchStart(_e) {
		var e = game.locationInView(_e);
		touchY = e.y; 

		if (e.x < (game.screen.width * 0.5)) {
			sprites.player.moveDirection = -1;
			sprites.player.moveSpeed = -(PLAYER_MOVE_SPEED);
		} else {
			sprites.player.moveDirection = 1;
			sprites.player.moveSpeed = PLAYER_MOVE_SPEED;
		}

		if (sprites.player.canJump) {
			sprites.player.isWalking = true;
			sprites.player.walk();
		}	
	}

	function onScreenTouchMove(_e) {
		var e = game.locationInView(_e);
		var dy = touchY - e.y;

		if (e.x < (game.screen.width * 0.5)) {
			sprites.player.moveDirection = -1;
			sprites.player.moveSpeed = -(PLAYER_MOVE_SPEED);
			sprites.player.jumpSpeed = -(PLAYER_MOVE_SPEED - 0.5);
		} else {
			sprites.player.moveDirection = 1;
			sprites.player.moveSpeed = PLAYER_MOVE_SPEED;
			sprites.player.jumpSpeed = PLAYER_MOVE_SPEED - 0.5;
		}
		
		// make player jump on slide-up gesture
		if (dy > 75) {
			sprites.player.jump();
			touchY = e.y;
		}
	}

	function onScreenTouchEnd(_e) {
		var e = game.locationInView(_e);
		sprites.player.isWalking = false;

		if (!sprites.player.inWater) {
			if (sprites.player.canJump) {
				if (Math_abs(bodies.player.v.x) < 0.25) {
					sprites.player.pause();
					sprites.player.frame = 2;
				}
			} else {
				sprites.player.pause();
				sprites.player.frame = 1;
			}
		} else {
			sprites.player.walk();
		}
	}

	function onSceneActivated(e) {
		var background = platino.createSprite({
			image: 'graphics/background.png',
			width: 1024,
			height: 768,
			x: 0,
			y: 0
		});
		game.setupSpriteSize(background);
		scene.add(background);

		// Create chipmunk space and set initial properties
		space = chipmunk.cpSpaceNew();
		chipmunk.cpSpaceSetIterations(space, 30);
		chipmunk.cpSpaceSetGravity(space, v(0, -500));
		chipmunk.cpSpaceSetSleepTimeThreshold(space, 0.5);
		chipmunk.cpSpaceSetCollisionSlop(space, 0.5);

		// Containers to hold references to sprite and physics instances
		sprites = {};
		bodies = {};
		shapes = {};

		createPhysicsBoundaries();
		createStaticGroundBodies();
		createPlayer();
		createBoxSpawner();
		createWaterSensors();
		createWaterSprites();

		debugDraw.active = false;

		if (debugDraw !== null) {
			for (var key in bodies) {
				if (bodies.hasOwnProperty(key)) {
					debugDraw.addBody(bodies[key]);
				}
			}
		}

		// begin updating physics on every frame
		_accumulator = 0.0;
		game.addEventListener('enterframe', update);
		game.addEventListener('touchstart', onScreenTouchStart);
		game.addEventListener('touchmove', onScreenTouchMove);
		game.addEventListener('touchend', onScreenTouchEnd);
	}

	function onSceneDeactivated(e) {
		// stop fading animation on water sprites
		water1_1.clearTransforms(); water1_1_transform = null;
		water1_2.clearTransforms(); water1_2_transform = null;
		water2_1.clearTransforms(); water2_1_transform = null;
		water2_2.clearTransforms(); water2_2_transform = null;
		
		game.removeEventListener('touchstart', onScreenTouchStart);
		game.removeEventListener('touchmove', onScreenTouchMove);
		game.removeEventListener('touchend', onScreenTouchEnd);
		game.removeEventListener('enterframe', update);
		scene.removeEventListener('activated', onSceneActivated);
		scene.removeEventListener('deactivated', onSceneDeactivated);
		scene.dispose();
		scene = null;
	}

	scene.addEventListener('activated', onSceneActivated);
	scene.addEventListener('deactivated', onSceneDeactivated);
	return scene;
};

module.exports = GameScene;