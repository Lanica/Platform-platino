(function() {
	var platino = require('co.lanica.platino');
	var box2d = require('co.lanica.box2djs');

	// box2d functions
	var b2settings = box2d.Common.b2Settings;
	var b2Vec2 = box2d.Common.Math.b2Vec2;
	var b2BodyDef = box2d.Dynamics.b2BodyDef;
	var b2Body = box2d.Dynamics.b2Body;
	var b2FixtureDef = box2d.Dynamics.b2FixtureDef;
	var b2Fixture = box2d.Dynamics.b2Fixture;
	var b2World = box2d.Dynamics.b2World;
	var b2MassData = box2d.Collision.Shapes.b2MassData;
	var b2PolygonShape = box2d.Collision.Shapes.b2PolygonShape;
	var b2CircleShape = box2d.Collision.Shapes.b2CircleShape;
	var b2MouseJointDef =  box2d.Dynamics.Joints.b2MouseJointDef;
	var b2RopeJointDef = box2d.Dynamics.Joints.b2RopeJointDef;
	var pi = Math.PI;
	var ceil = Math.ceil;
	var atan2 = Math.atan2;
	var sqrt = Math.sqrt;
	var round = Math.random;
	var random = Math.random;

	var MainScene = function(window, game) {
		var scene = platino.createScene();
		var sprites = {}; // holds references to sprites
		var bodies = {}; // holds references to physics bodies
		var velocityIterations = 1.0/30;
		var xGravity = 0;
		var yGravity = -14;
		var isTouching = false;
		var oneEightyDividedByPi = (180/pi); //  degrees = radians * (180/pi);
		var piDividedByOneEighty = (pi/180); //  radians = degrees * (pi/180);


		// forward declarations
		var world = null;
		var update = null;
		var mouseJoint = null;
		var touchX, touchY = null;
		var lineSprite = null;
		var touchSprite = null;

		// Converts platino y-coordinates to box2d y-coordinates (reversed)
		var b2y = function(y) {
			return game.TARGET_SCREEN.height - y;
		}

		function randomNumber(min,max) {
			return randVal = round(min+(random()*(max-min)));
		};

		// Updates height and angle of "rope" attached to touch location and touched sprite/physics body
		var updateLineSprite = function(x1, y1, x2, y2) {
			if (!lineSprite) return;
			lineSprite.height = ceil(sqrt(((y2 - y1) * (y2 - y1)) + ((x2 - x1) * (x2 - x1))));
			lineSprite.angle = ceil(atan2(y2 - y1, x2 - x1) * oneEightyDividedByPi) + 90;
			lineSprite.x = x2;
			lineSprite.y = y2;
			game.setupSpriteSize(lineSprite);
		};

		// Helper function to make it easier to associate a physics body with a sprite
		var addPhysicsBody = function(params) {
			var sprite = params.sprite;
			var width = null;
			var height = null;
			var left = null;
			var top = null;
			var angle = null;

			if (sprite) {
				width = (params.width) ? params.width : sprite.width;
				height = (params.height) ? params.height : sprite.height;
				left = sprite.x;
				top = sprite.y;
				angle = sprite.angle;
			} else {
				width = params.width;
				height = params.height;
				left = params.left;
				top = params.top;
				angle = 0;
			};

			var fixDef = new b2FixtureDef();
			fixDef.density = (params.density) ? params.density : 0.9;
			fixDef.friction = (params.friction) ? params.friction : 0.5;
			fixDef.restitution = (params.restitution) ? params.restitution : 0.2;
			if (!params.radius) {
				fixDef.shape = new b2PolygonShape();
				fixDef.shape.SetAsBox(width * 0.5, height * 0.5);
			} else {
				fixDef.shape = new b2CircleShape(params.radius);
			};

			var bodyDef = new b2BodyDef();
			if (params.bodyType) {
				if (params.bodyType === 'static') {
					bodyDef.type = b2Body.b2_staticBody;
				} else if (params.bodyType === 'dynamic') {
					bodyDef.type = b2Body.b2_dynamicBody;
				};
			} else {
				bodyDef.type = b2Body.b2_dynamicBody;
			};
			bodyDef.position.x = left + width * 0.5;
			bodyDef.position.y = b2y(top + height * 0.5);
			bodyDef.angle = angle * piDividedByOneEighty;

			var bodyRef = world.CreateBody(bodyDef);
			bodyRef.CreateFixture(fixDef);
			return bodyRef;
		};

		// Returns physics body at specified coordinates (if any)
		var getBodyAtPosition = function(x, y) {
			var foundBody = null;
			var foundSprite = null;

			for (var key in sprites) {
				if (sprites[key].contains(x, y, 35 * game.touchScaleX, 35 * game.touchScaleY)) {
					if (bodies[key]) {
						foundBody = bodies[key];
						foundSprite = sprites[key];
						break;
					};
				};
			};

			return [foundBody, foundSprite];
		};

		// Returns sprite associated with specified physics body
		var getSpriteForBody = function(body) {
			var sprite = null;
			for (var key in bodies) {
				if ((bodies[key] === body) && (sprites[key])) {
					sprite = sprites[key];
					break;
				}
			}
			return sprite;
		}

		// Converts touch coordinates by taking screen scale into account
		var locationInView = function(_e) {
      var e = {
        type: _e.type,
        source: _e.source
      };
      e.x = _e.x * game.touchScaleX;
      e.y = _e.y * game.touchScaleY;
      return e;
    };

    // Listener function for 'BeginContact' and 'EndContact' b2World events
    var bodyContactListener = function(e) {
    	// Below are commented out to preserve performance as contact events can be "noisy"
    	/*
    	if (e.type === 'BeginContact') {
    		Ti.API.info('Began contact on sprite.');
    	} else if (e.type == "EndContact") {
    		Ti.API.info('Ended contact on sprite.');
    	}
    	*/
    };

    // Create all sprites and add them to the scene
    var createSprites = function() {
    	var backgroundImage = 'graphics/background' + game.imageSuffix + '.png';
    	if (Ti.Platform.displayCaps.platformHeight === 568) {
    		backgroundImage = 'graphics/background-568' + game.imageSuffix + '.png';
    	};
    	sprites.background = platino.createSprite({
    		image: backgroundImage,
    		width: game.TARGET_SCREEN.width,
    		height: game.TARGET_SCREEN.height,
    		x: 0,
    		y: 0
    	});
    	game.setupSpriteSize(sprites.background);

    	// line sprite represents the "rope" that connects touch point to the object being dragged
			lineSprite = platino.createSprite({
				image: 'graphics/rope' + game.imageSuffix + '.png',
				width: 4,
				height: 100,
				center: {
					x: game.TARGET_SCREEN.width * 0.5,
					y: game.TARGET_SCREEN.height * 0.5
				}
			});
			game.setupSpriteSize(lineSprite);
			lineSprite.hide();
			scene.add(lineSprite);

    	sprites.ground = platino.createSprite({
    		image: 'graphics/ground' + game.imageSuffix + '.png',
    		width: game.TARGET_SCREEN.width,
    		height: 8,
    		x: 0,
    		y: game.TARGET_SCREEN.height - 8
    	});
    	game.setupSpriteSize(sprites.ground);
    	sprites.ground.isGroundSprite = true;

    	sprites.crate1 = platino.createSprite({
				image: 'graphics/crate' + game.imageSuffix + '.png',
				width:35,
				height:35,
				x: 80,
				y: game.TARGET_SCREEN.height * 0.5
			});
			game.setupSpriteSize(sprites.crate1);
			sprites.crate1.isTouchable = true;
			sprites.crate1.touchable = true;

			sprites.crate2 = platino.createSprite({
				image: 'graphics/crate' + game.imageSuffix + '.png',
				width:35,
				height:35,
				x: game.TARGET_SCREEN.width - 80,
				y: game.TARGET_SCREEN.height * 0.5
			});
			game.setupSpriteSize(sprites.crate2);
			sprites.crate2.isTouchable = true;

			sprites.bowling1 = platino.createSprite({
				image: 'graphics/bowlingball' + game.imageSuffix + '.png',
				width:29,
				height:29,
				x: randomNumber(29, game.TARGET_SCREEN.width-29),
				y: game.TARGET_SCREEN.height * 0.5
			});
			game.setupSpriteSize(sprites.bowling1);
			sprites.bowling1.isTouchable = true;

			sprites.bowling2 = platino.createSprite({
				image: 'graphics/bowlingball' + game.imageSuffix + '.png',
				width:29,
				height:29,
				x: randomNumber(29, game.TARGET_SCREEN.width-29),
				y: game.TARGET_SCREEN.height * 0.5
			});
			game.setupSpriteSize(sprites.bowling2);
			sprites.bowling2.isTouchable = true;

			sprites.soccer1 = platino.createSprite({
				image: 'graphics/soccerball' + game.imageSuffix + '.png',
				width:31,
				height:31,
				x: randomNumber(31, game.TARGET_SCREEN.width-31),
				y: game.TARGET_SCREEN.height * 0.5
			});
			game.setupSpriteSize(sprites.soccer1);
			sprites.soccer1.isTouchable = true;

			sprites.soccer2 = platino.createSprite({
				image: 'graphics/soccerball' + game.imageSuffix + '.png',
				width:31,
				height:31,
				x: randomNumber(31, game.TARGET_SCREEN.width-31),
				y: game.TARGET_SCREEN.height * 0.5
			});
			game.setupSpriteSize(sprites.soccer2);
			sprites.soccer2.isTouchable = true;

			sprites.crate1.addEventListener('touchstart', function(e) {
				Ti.API.info('Received touch! ' + JSON.stringify(e));
			});

			scene.add(sprites.background);
			scene.add(lineSprite);
			scene.add(sprites.ground);
			scene.add(sprites.crate1);
			scene.add(sprites.crate2);
			scene.add(sprites.bowling1);
			scene.add(sprites.bowling2);
			scene.add(sprites.soccer1);
			scene.add(sprites.soccer2);
    };

    // setup physics bodies for individual sprites
    var createBodies = function() {
    	bodies.ground = addPhysicsBody({
    		sprite: sprites.ground,
    		bodyType: 'static',
    		density: 12.0
    	});

    	bodies.crate1 = addPhysicsBody({
				sprite: sprites.crate1,
				width: sprites.crate1.width - 6,
				height: sprites.crate1.height - 6,
				friction: 1.0,
				density: 1.5,
				restitution: 0.1
			});

			bodies.crate2 = addPhysicsBody({
				sprite: sprites.crate2,
				width: sprites.crate2.width - 6,
				height: sprites.crate2.height - 6,
				friction: 1.0,
				density: 1.5,
				restitution: 0.1
			});

			bodies.bowling1 = addPhysicsBody({
				sprite: sprites.bowling1,
				radius: sprites.bowling1.width * 0.5 - 2,
				friction: 0.3,
				density: 5.0,
				restitution: 0.05
			});

			bodies.bowling2 = addPhysicsBody({
				sprite: sprites.bowling2,
				radius: sprites.bowling2.width * 0.5 - 2,
				friction: 0.3,
				density: 5.0,
				restitution: 0.05
			});

			bodies.soccer1 = addPhysicsBody({
				sprite: sprites.soccer1,
				radius: sprites.soccer1.width * 0.5 - 2,
				friction: 0.8,
				density: 0.7,
				restitution: 0.8
			});

			bodies.soccer2 = addPhysicsBody({
				sprite: sprites.soccer2,
				radius: sprites.soccer2.width * 0.5 - 2,
				friction: 0.8,
				density: 0.7,
				restitution: 0.8
			});

    	// create invisible wall bodies to prevent objects from falling off edges of screen
    	bodies.topWall = addPhysicsBody({
				width: game.TARGET_SCREEN.width,
				height: 100,
				left: 0,
				top: -100,
				bodyType: 'static'
			});

			bodies.leftWall = addPhysicsBody({
				width: 100,
				height: game.TARGET_SCREEN.height,
				left: -100,
				top: 0,
				bodyType: 'static'
			});

			bodies.rightWall = addPhysicsBody({
				width: 100,
				height: game.TARGET_SCREEN.height,
				left: game.TARGET_SCREEN.width,
				top: 0,
				bodyType: 'static'
			});
    };
    
    update = function() {
			if (mouseJoint) {
				if (isTouching) {
					mouseJoint.SetTarget(new b2Vec2(touchX, b2y(touchY)));
					updateLineSprite(touchX, touchY, touchSprite.center.x, touchSprite.center.y);
				} else {
					world.DestroyJoint(mouseJoint);
					mouseJoint = null;
					touchSprite = null;
					lineSprite.hide();
				};
			};

			world.Step(velocityIterations, 10, 10);

			// update sprite position/rotation to match corresponding physic body properties on every step
			for (var key in bodies) {
				var body = bodies[key];
				var sprite = sprites[key];
				var pos = body.GetPosition();
				var angle = -body.GetAngle() * oneEightyDividedByPi; 

				if (sprite) {
					sprite.center = {
						x: pos.x,
						y: b2y(pos.y)
					};
					sprite.rotate(angle);
				};
			}

			world.ClearForces(); // should be called after each world step
		};

    // Called after scene is loaded and is ready
		var onSceneActivated = function(e) {
			world = new b2World(new b2Vec2(xGravity, yGravity), false); // first argument is gravity
			world.addEventListener('BeginContact', bodyContactListener);
			world.addEventListener('EndContact', bodyContactListener);

			createSprites();
			createBodies();

			// start game timer (enterframe listener)
			game.enableOnDrawFrameEvent = true;
			game.addEventListener('enterframe', update);
		};

		var onSceneDeactivated = function(e) {

			// Remove enterframe listener
			game.removeEventListener('enterframe', update);

			// Dispose of scene sprites
			for (var key in sprites) {
				var sprite = sprites[key];
				scene.remove(sprite);
				if (sprite.tag) {
					game.unloadTextureByTag(sprite.tag);
				};
				sprite[key] = null;
			};
			sprites = null;

			// Dispose of physics bodies
			for (var key in bodies) {
				var body = bodies[key];
				world.DestroyBody(body);
				bodies[key] = null;
			};

			world = null;
			scene.dispose();
		};

		// Screen touch event (detects physics body at touch location and creates a b2MouseJoint)
		/*
		var onTouchStart = function(_e) {
			if (mouseJoint) return;
			var e = locationInView(_e);
			
			isTouching = true;
			touchX = e.x;
			touchY = e.y;
			
			var body_sprite = getBodyAtPosition(e.x, e.y);
			var body = body_sprite[0];
			
			if ((body) && (body_sprite.length === 2) && (body_sprite[1].isTouchable)) {
				touchSprite = body_sprite[1];
				var md = new b2MouseJointDef();
				md.bodyA = bodies.ground;
				md.bodyB = body;
				md.target.Set(e.x, b2y(e.y));
				//md.target = body.GetWorldCenter();
				md.collideConnected = true;
				md.maxForce = 1000.0 * body.GetMass();
				mouseJoint = world.CreateJoint(md);
				body.SetAwake(true);
				
				updateLineSprite(e.x, e.y, touchSprite.x, touchSprite.y);
				lineSprite.show();
			}
		}*/
		var onTouchStart = function(_e) {
			var e = locationInView(_e);
			//Ti.API.info(JSON.stringify(e));
			scene.forwardTouchToSprites(e.type, e.x, e.y);
			//Ti.API.info('hello world');
		}

		var onTouchMove = function(_e) {
			// update touch coordinate for use in update() function
			var e = locationInView(_e);
			touchX = e.x;
			touchY = e.y;
		}

		var onTouchEnd = function(_e) {
			var e = locationInView(_e);
			isTouching = false;
			touchSprite = null;
		}

		scene.addEventListener('activated', onSceneActivated);
		scene.addEventListener('deactivated', onSceneDeactivated);

		game.addEventListener('touchstart', onTouchStart);
		game.addEventListener('touchmove', onTouchMove);
		game.addEventListener('touchend', onTouchEnd);
		return scene;
	};

	module.exports = MainScene;
}).call(this);