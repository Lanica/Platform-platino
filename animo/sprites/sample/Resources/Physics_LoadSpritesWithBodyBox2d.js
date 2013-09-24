var window = Ti.UI.createWindow({backgroundColor:'black'});

// Obtain game module
var platino = require('co.lanica.platino');
var box2d = require('co.lanica.box2djs');

//MAKE SURE TO CHANGE config.js to specify which physics engine you want to use.

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
    
// forward declarations
var world = null;
var update = null;
var updateTimer = null;
var velocityIterations = 1.0/30.0;
var xGravity = 0;
var yGravity = -8;
        
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
	var text = platino.createTextSprite({text:'Touch screen to create sprite. ', fontSize:14});
	text.textAlign = Ti.UI.TEXT_ALIGNMENT_CENTER;
	text.color(1, 1, 1);
	text.center = {x:game.screen.width * 0.5, y:game.screen.height * 0.5};
	scene.add(text);


	var text2 = platino.createTextSprite({text:'If sprite has a body, it will be created. ', fontSize:14});
	text2.textAlign = Ti.UI.TEXT_ALIGNMENT_CENTER;
	text2.color(1, 1, 1);
	text2.center = {x:game.screen.width * 0.5, y:game.screen.height * 0.5 + 20};
	scene.add(text2);
// 	
	// var text3 = platino.createTextSprite({text:'in Sprites_LoadSpriteFromPNGTest.js ', fontSize:14});
	// text3.textAlign = Ti.UI.TEXT_ALIGNMENT_CENTER;
	// text3.color(1, 1, 1);
	// text3.center = {x:game.screen.width * 0.5, y:game.screen.height * 0.5 + 40};
	// scene.add(text3);
	
	
	
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
            
            addPhysicsBody({
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
    
    
});

var currentSprIdx = 0;
function createSpriteAtPosition(posX, posY)
{
    var spriteNames=new Array("backpack","banana", "bananabunch", "canteen", "hat", "pineapple", "statue", "ball");
    var spriteNameToLoad = spriteNames[currentSprIdx];
        
    currentSprIdx += 1;
        
    if(currentSprIdx > spriteNames.length -1)
        currentSprIdx = 0;
    
    //singleton that keeps track of the current physical world. Sprite will read the world from Director and create the body in the 
    //approriate world object.
    animo.director().setPhysicalWorld(world);
    
    //game is used when setting the position of the sprite, in order to inverse the coordinates for box2d.
    animo.director().setGame(game);
    
    var suffix = "";//normal iphones
    
	{
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

        Ti.API.info("should create sprite");

        var mySprite = animo.createSpriteWithFile("graphics/RES_Physics/PhysicalSpritesObjects_Objects" + suffix + ".xml",
                                                  spriteNameToLoad);
                                                            
        mySprite.setPosition(posX, posY);
        scene.add(mySprite.getSpriteSheet());
    }
}


game.addEventListener('touchstart', function(e) {
    Ti.API.info("Touch start was called");
        
    createSpriteAtPosition(e.x, e.y);

});



        



// Add your game view
window.add(game);

// load debug functions
Ti.include("debug.js");

window.open({fullscreen:true, navBarHidden:true});
