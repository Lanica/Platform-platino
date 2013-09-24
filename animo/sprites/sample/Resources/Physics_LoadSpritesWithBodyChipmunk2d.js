var window = Ti.UI.createWindow({backgroundColor:'black'});

var animo = require("animo");


// Obtain game module
var platino = require('co.lanica.platino');
var chipmunk2dmodule = require('co.lanica.chipmunk2d');
var DebugDraw = require("co.lanica.chipmunk2d.debugdraw");
var chipmunk = co_lanica_chipmunk2d;
var v = chipmunk.cpv;

var debugDraw = null;
//MAKE SURE TO CHANGE config.js to specify which physics engine you want to use.
    
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


// constants
var TIMESTEP = 1.0 / game.fps;
var PYRAMID_ROW_COUNT = 8;

// forward declarations
var ground = null;
var leftWall = null;
var rightWall = null;
var space = null;
var pSprites = null;


// chipmunk y-coordinates are reverse value of platino's, so use the following
// function to convert chipmunk y-coordinate values to platino y-coordinates and vice versa
var cpY = function(y) {
    return game.screen.height - y;
};

// convert chipmunk angle (radians) to platino angles (degrees)
var cpAngle = function(angle) {
	return -(angle) * (180/Math.PI);
};


// add your scene to game view
game.pushScene(scene);


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
    
    
// This function is called once for each body in the space.
var EachBody = function(body, sleeping)
{
    if(!cpBodyIsSleeping(body)){
      
        pos = chipmunk.cpBodyGetPos(body);
        angle = cpAngle(chipmunk.cpBodyGetAngle(body));
			
        var sprite = chipmunk.cpBodyGetUserData(body);
                
        if (sprite) {
            sprite.center = {
                x: pos.x,
                y: cpY(pos.y)
        };
            sprite.rotate(angle);
        }
    }
}

// Polls the position and angle of all physics bodies, and adjusts the
// properties of the corresponding sprite to match
var syncSpritesWithPhysics = function() {
	var i, pos, angle;
	
	for (i = 0; i < pSprites.length; i++) {
		if (!chipmunk.cpBodyIsSleeping(pSprites[i].getBody())) {
			pos = chipmunk.cpBodyGetPos(pSprites[i].getBody());
			angle = cpAngle(chipmunk.cpBodyGetAngle(pSprites[i].getBody()));
			
            var sprite = pSprites[i].getSpriteSheet();
            
            if (sprite) {
                    sprite.center = {
                        x: pos.x,
                        y: cpY(pos.y)
                    };
                    sprite.rotate(angle);
                }
		}
	}
    
    if (debugDraw !== null) {
        debugDraw.update();
	}
};

// game loop (enterframe listener)
var update = function() {
	syncSpritesWithPhysics();

    // Then in your tick method, do this:
//    var allSleeping = true;
//    chipmunk.cpSpaceEachBody(space, (chipmunk.cpSpaceBodyIteratorFunc(EachBody)), allSleeping);


	chipmunk.cpSpaceStep(space, TIMESTEP);
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



// Create chipmunk space
	space = chipmunk.cpSpaceNew();
	data = new chipmunk.cpSpaceAddCollisionHandlerContainer();
	chipmunk.cpSpaceSetGravity(space, v(0, -200));
	chipmunk.cpSpaceSetSleepTimeThreshold(space, 0.1);
	chipmunk.cpSpaceSetCollisionSlop(space, 0.1);
	
    debugDraw = new DebugDraw(platino, chipmunk, game, scene, {BB:false, Circle:true, Vertex:false, Poly:true, Constraint:true, ConstraintConnection:true});
    
	// holds references to all physics-enabled sprites
	pSprites = [];
	
	// The following arrays will hold references to moments, bodies, and shapes for two reasons:
	// a) so they are not garbage collected before you're ready to use them
	// b) so you can sync sprite properties with bodies in your game loop (e.g. enterframe)
	pMoments = [];
	pBodies = [];
	pShapes = [];
	
	createGroundAndWalls();
	//createSpritesMomentsBodiesAndShapes();
	
	// wait 3 seconds after the scene loads and start the game loop
	setTimeout(function() {
		game.addEventListener('enterframe', update);
	}, 3000);
    
    
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
    animo.director().setPhysicalWorld(space);
    
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
        
        pSprites.push(mySprite);
        
        if (debugDraw !== null) {
            debugDraw.addBody(mySprite.getBody());
		}
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
