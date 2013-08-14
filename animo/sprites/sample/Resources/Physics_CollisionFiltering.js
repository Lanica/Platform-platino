var window = Ti.UI.createWindow({backgroundColor:'black', orientationModes: [Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT] });

// Obtain game module
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
var b2EdgeShape = box2d.Collision.Shapes.b2EdgeShape;
var b2MouseJointDef =  box2d.Dynamics.Joints.b2MouseJointDef;
    
    
// forward declarations
var world = null;
var update = null;
var updateTimer = null;
var velocityIterations = 1.0/30.0;
var xGravity = 0;
var yGravity = -8;
var mouseJoint = null;
var touchX, touchY = null;
var groundBody = null;
var isTouching = false;
        
        
var animo = require("animo");        


// Create view for your game.
// Note that game.screen.width and height are not yet set until the game is loaded
var game = platino.createGameView();

// ENABLE 'enterframe' event
game.enableOnDrawFrameEvent = true;
game.debug = false;
// Frame rate can be changed (fps can not be changed after the game is loaded)
game.fps = 30;

// set initial background color to black
game.color(0, 0, 0);

// Create game scene
var scene = platino.createScene();

// add your scene to game view
game.pushScene(scene);

// Converts platino y-coordinates to box2d y-coordinates (reversed)
var b2y = function(y) {
    return game.screen.height - y;
}
var pi = Math.PI;
var oneEightyDividedByPi = (180/pi); //  degrees = radians * (180/pi);
var piDividedByOneEighty = (pi/180); //  radians = degrees * (pi/180);
        
        
        
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
        
        
update = function() {
    
    
    if (mouseJoint) {
                if (isTouching) {
                    mouseJoint.SetTarget(new b2Vec2(touchX, b2y(touchY)));
                } else {
                    world.DestroyJoint(mouseJoint);
                    mouseJoint = null;
                };
            };
    
    world.Step(velocityIterations, 10, 10);
                        
    //Iterate over the bodies in the physics world
    for (var b = this.world.GetBodyList(); b; b = b.GetNext()) 
    {
        if (b.GetUserData() != null) {
            //Synchronize the AtlasSprites position and rotation with the corresponding body
            
            var angle = -b.GetAngle() * oneEightyDividedByPi; 
            var pos = b.GetPosition();
            
            var sprite = b.GetUserData();
            
            
            if (sprite) {
                    sprite.center = {
                        x: pos.x,
                        y: b2y(pos.y)
                    };
                    sprite.rotate(angle);
                };
            
        }
    }
    world.ClearForces(); // should be called after each world step
    updateTimer = setTimeout(update, (15 * 0.1) * 2);
   
};
        
        
// Onload event is called when the game is loaded.
// The game.screen.width and game.screen.height are not yet set until this onload event.
game.addEventListener('onload', function(e) {
    // Your game screen size is set here if you did not specifiy game width and height using screen property.
    // Note: game.size.width and height may be changed due to the parent layout so check them here.
    Ti.API.info("view size: " + game.size.width + "x" + game.size.height + "W" + game.screen.width + "H" + game.screen.height);
    Ti.API.info("game screen size: " + game.screen.width + "x" + game.screen.height);

    
    
    // Start the game
    game.start();
    
    
	// create new 
	{
	var text = platino.createTextSprite({text:'Collision Filtering... ', fontSize:14});
	text.textAlign = Ti.UI.TEXT_ALIGNMENT_CENTER;
	text.color(1, 1, 1);
	text.center = {x:game.screen.width * 0.5, y:game.screen.height * 0.5};
	scene.add(text);
    }

	{
    var text = platino.createTextSprite({text:'Drag robots around the screen to test. ', fontSize:14});
    text.textAlign = Ti.UI.TEXT_ALIGNMENT_CENTER;
    text.color(1, 1, 1);
    text.center = {x:game.screen.width * 0.5, y:game.screen.height * 0.5+20};
    scene.add(text);
    }

    {
    var text = platino.createTextSprite({text:'BLUE robots collide with GREEN and PINK but not with BLUE. ', fontSize:14});
    text.textAlign = Ti.UI.TEXT_ALIGNMENT_CENTER;
    text.color(1, 1, 1);
    text.center = {x:game.screen.width * 0.5, y:game.screen.height * 0.5+40};
    scene.add(text);
    }

	{
    var text = platino.createTextSprite({text:'GREEN robots collide with BLUE and PINK but not with GREEN ', fontSize:14});
    text.textAlign = Ti.UI.TEXT_ALIGNMENT_CENTER;
    text.color(1, 1, 1);
    text.center = {x:game.screen.width * 0.5, y:game.screen.height * 0.5+60};
    scene.add(text);
    }

	{
    var text = platino.createTextSprite({text:'PINK robots collide with all robots ', fontSize:14});
    text.textAlign = Ti.UI.TEXT_ALIGNMENT_CENTER;
    text.color(1, 1, 1);
    text.center = {x:game.screen.width * 0.5, y:game.screen.height * 0.5+80};
    scene.add(text);
    }
	 
   
    
	
	world = new b2World(new b2Vec2(xGravity, yGravity), false); // first argument is gravity
    updateTimer = setTimeout(update, (15 * 0.1) * 2);
    
    
    

// create invisible wall bodies to prevent objects from falling off edges of screen
            addPhysicsBody({
                width: game.screen.width,
                height: 100,
                left: 0,
                top: -100,
                bodyType: 'static'
            });
            
      groundBody = addPhysicsBody({
                width: game.screen.width,
                height: 100,
                left: 0,
                top: game.screen.height,
                bodyType: 'static'
            });
            
            addPhysicsBody({
                width: 100,
                height: game.screen.height,
                left: -100,
                top: 0,
                bodyType: 'static'
            });
            
            addPhysicsBody({
                width: 100,
                height: game.screen.height,
                left: game.screen.width,
                top: 0,
                bodyType: 'static'
            });
    
    
    createRobots();
});

// game.addEventListener('enterframe', function(e) {
//
// });

function createRobots()
{
    //singleton that keeps track of the current physical world. Sprite will read the world from Director and create the body in the 
    //approriate world object.
    animo.director().setPhysicalWorld(world);
    
    //game is used when setting the position of the sprite, in order to inverse the coordinates for box2d.
    animo.director().setGame(game);
    
    var suffix = "";//normal iphones
    
	
        // load skeleton atlas based on device
        if (game.screen.width == 320 || game.screen.width == 480) { //iphone 2G,3G 3GS
            suffix = "";
        }
        else if(game.screen.width == 640 || game.screen.width == 960) { //iphone 4, 4S, 5, 5S (retina)
            suffix = "-hd";
        }
        if(game.screen.width == 768 || game.screen.width == 1024) { //ipad 1, 2, mini
            suffix = "-ipad";        
        }
        else if(game.screen.width == 1536 || game.screen.width == 2048) { //ipad 3, 4 (retina)
            suffix = "-ipadhd";    
        }   		

{
        var blueRobot1 = animo.createSpriteWithFile("graphics/RES_Physics/physicsCollisionTestRobots_robots" + suffix + ".xml",
                                                                        "blueRobot");
        
        blueRobot1.setPosition(100, 100);
        scene.add(blueRobot1.getSpriteSheet());

        var blueRobot2 = animo.createSpriteWithFile("graphics/RES_Physics/physicsCollisionTestRobots_robots" + suffix + ".xml",
                                                                        "blueRobot");
        
        blueRobot2.setPosition(200, 100);
        scene.add(blueRobot2.getSpriteSheet());        
 }   


{
        var pinkRobot1 = animo.createSpriteWithFile("graphics/RES_Physics/physicsCollisionTestRobots_robots" + suffix + ".xml",
                                                                        "pinkRobot");
        
        pinkRobot1.setPosition(100, 200);
        scene.add(pinkRobot1.getSpriteSheet());


        var pinkRobot2 = animo.createSpriteWithFile("graphics/RES_Physics/physicsCollisionTestRobots_robots" + suffix + ".xml",
                                                                        "pinkRobot");
        
        pinkRobot2.setPosition(200, 200);
        scene.add(pinkRobot2.getSpriteSheet());
 }   


{
        var greenRobot1 = animo.createSpriteWithFile("graphics/RES_Physics/physicsCollisionTestRobots_robots" + suffix + ".xml",
                                                                        "greenRobot");
        
        greenRobot1.setPosition(100, 300);
        scene.add(greenRobot1.getSpriteSheet());


        var greenRobot2 = animo.createSpriteWithFile("graphics/RES_Physics/physicsCollisionTestRobots_robots" + suffix + ".xml",
                                                                        "greenRobot");
        
        greenRobot2.setPosition(200, 300);
        scene.add(greenRobot2.getSpriteSheet());
 }   
    
    
}
    
    
    // Returns physics body at specified coordinates (if any)
        var getBodyAtPosition = function(x, y) 
        {
            //Iterate over the bodies in the physics world
            for (var b = this.world.GetBodyList(); b; b = b.GetNext()) 
            {
                if(b != groundBody)
                {
                    
                    for (var stFix = b.GetFixtureList(); stFix; stFix = stFix.GetNext()) 
                    {
                        if(stFix.TestPoint(new b2Vec2(x, y)))
                        {
                            return b;
                        }
                    }
                }
            }
            return null;
        };
        
var onTouchStart = function(_e) {
            if (mouseJoint) return;
            
            isTouching = true;
            
            var body = getBodyAtPosition(_e.x, b2y(_e.y));
            
            if (body) {
                
                var md = new b2MouseJointDef();
                md.bodyA = groundBody;
                md.bodyB = body;
                md.target.Set(_e.x, b2y(_e.y));
                md.collideConnected = true;
                md.maxForce = 1000.0 * body.GetMass();
                mouseJoint = world.CreateJoint(md);
                body.SetAwake(true);
            }
        }
        
        var onTouchMove = function(_e) {
            // update touch coordinate for use in update() function
            var e = _e;
            touchX = e.x;
            touchY = e.y;
        }
        
        var onTouchEnd = function(_e) {
            var e = _e;//locationInView(_e);
            isTouching = false;
            touchSprite = null;
        }

        
        game.addEventListener('touchstart', onTouchStart);
        game.addEventListener('touchmove', onTouchMove);
        game.addEventListener('touchend', onTouchEnd);

        



// Add your game view
window.add(game);

// load debug functions
//Ti.include("debug.js");

window.open({fullscreen:true, navBarHidden:true});
