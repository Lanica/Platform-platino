
/**
* @class animo.Sprite
* @alternateClassName AnimoSprite
*
* Sprite class is used to load and display texture rectangles from an image.
* 
* The Sprite class is a wrapper over SpriteSheet class.
* 
* Has friendly methods to load a sprite together with its physical representation. 
*/

var chipmunk2dmodule = null;
var chipmunk = null;
var box2d = null;

if (require("animo/config").useChipmunk2dModule) {
    chipmunk2dmodule = require('co.lanica.chipmunk2d');
    chipmunk = co_lanica_chipmunk2d;
    var v = chipmunk.cpv;
}
else if(require("animo/config").useBox2dModule) 
{
box2d = require('co.lanica.box2djs');
    
var b2Vec2 = box2d.Common.Math.b2Vec2;
var b2BodyDef = box2d.Dynamics.b2BodyDef;
var b2Body = box2d.Dynamics.b2Body;
var b2FixtureDef = box2d.Dynamics.b2FixtureDef;
var b2Fixture = box2d.Dynamics.b2Fixture;
var b2World = box2d.Dynamics.b2World;
var b2PolygonShape = box2d.Collision.Shapes.b2PolygonShape;
var b2CircleShape = box2d.Collision.Shapes.b2CircleShape;
}
    
    
require ("animo/Utils");
var Director = require('animo/Director').Director;

function Sprite() 
{
    this.sprite = null; //the platino sprite sheet object
    this.body = null;//if sprite has a body associated with it - this will contain the body object
    this.shapes = null; 
    this.name = "";
    this.bodyInfo = null;//dictionary with body info
    this.spriteName = "";
    this.atlasPath = "";
    this.bodyInfoFilePath = "";
    return this;
}

Sprite.prototype = new Sprite();
Sprite.prototype.name = "Sprite";

Sprite.prototype.createSpriteWithSpriteSheetFile = function(spriteSheetFilePath, spriteName)
{  
    var segments = spriteSheetFilePath.split("/");
    var fileName = segments[segments.length -1];
    segments.splice(segments.length - 1, 1);//remove filename
    segments[segments.length] = "" + "Bodies/"+fileName; //add bodies and filename back
    var bodyFileName = segments.join("/");//joint back the path components
    
    var bodyFileNameNoExt = bodyFileName.substr(0, bodyFileName.lastIndexOf('.')) || input; //remove extension
    var bodyFilePath = bodyFileNameNoExt + ".json";
    
    
    return this.createSpriteWithSpriteSheetAndBodyFiles(spriteSheetFilePath, bodyFilePath, spriteName);
}

Sprite.prototype.createSpriteWithSpriteSheetAndBodyFiles = function(spriteSheetFilePath, bodyFilePath, spriteName)
{
    this.sprite = platino.createSpriteSheet({asset:spriteSheetFilePath});
    this.sprite.selectFrame(spriteName);
    this.spriteName = spriteName;
    this.atlasPath = spriteSheetFilePath;
    this.bodyInfoFilePath = bodyFilePath;
    
    var dict = null;
    var f = Titanium.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, bodyFilePath); 
    if(f.exists)
    {
        var contents = f.read();
        
        if(contents)
        {
            dict = JSON.parse(contents);
        }
        else{
            Ti.API.info("Body file could not be read.");
        }
    }

    if(dict != null)
    {
        var bodyInfo = dict[spriteName];
        this.bodyInfo = ANDeepCopy(dict[spriteName]);
        this.createBody();
    }
    
    return this;
}
/**
 * @method getSpriteSheet
 * Returns the Platino SpriteSheet object.
 * @return {SpriteSheet}
 */
Sprite.prototype.getSpriteSheet = function()
{
    return this.sprite;
}

/**
 * @method getBody
 * Returns the Box2d body object.
 * @return {b2Body}
 */
Sprite.prototype.getBody = function()
{
    return this.body;
}


/**
 * @method setPosition
 * Sets the position to the sprite. If a body is also present, sets the position to the body also.
 * 
 * @note
 * In order to be able to set the position on the Box2d body the y axis has to be flipped, so make sure you set the game object in Director in the onload event.
 * 
 * @example
    animo.director().setGame(game);
 * 
 * 
 * Position is set at the center of the sprite.
 * 
 * @param {Number} pointX A numeric value representing X position.
 * @param {Number} pointY A numeric value representing Y position.    
 */
Sprite.prototype.setPosition = function(pointX, pointY)
{
    if(this.sprite){
        this.sprite.x = pointX - this.sprite.width*0.5;
        this.sprite.y = pointY - this.sprite.height*0.5;
    }
    if(this.body){
        
        var game = Director.sharedDirector().getGame();
        if(game == null){
            Ti.API.info("GameDevHelper WARNING: Sprite has physical body but \"game\" was not set in Director. Physical body position change will be dropped.");
            return;
        }
        
        if(box2d){
            this.body.SetPosition(new b2Vec2(pointX, game.screen.height - pointY));
        }
        else if(chipmunk){
            var world = Director.sharedDirector().getPhysicalWorld();
              
            chipmunk.cpBodySetPos(this.body, v(pointX,  game.screen.height - pointY));
            chipmunk.cpSpaceReindexStatic(world);
            //chipmunk.cpSpaceRehashStatic(world);//smaller memory - low performance
            //chipmunk.cpHashResizeStaticHash(world);//improved performance - bigger memory
        }
    }
}

/**
 * @method setName
 * Set the name of current sprite object.
 * @param {String} newName A name you want to give to this sprite. 
 */
Sprite.prototype.setName = function(newName)
{
    this.name = newName
}

/**
 * @method getName
 * Get the name of current sprite object as previously set by setName.
 * @return {String}
 */
Sprite.prototype.getName = function()
{
    return this.name;    
}

/**
 * @method getAtlasFilePath
 * Get the xml sprite sheet atlast file path from where the texture of this sprite was created.
 * @return {String}
 */
Sprite.prototype.getAtlasFilePath = function()
{
    return this.atlasPath;
}

/**
 * @method getBodyInfoFilePath
 * Get the json body information file path from where it was created.
 * @return {String}
 */
Sprite.prototype.getBodyInfoFilePath = function()
{
    return this.bodyInfoFilePath;
}


/**
 * @method destroyBody
 * Destroy the physical body created on this sprite, if any.
 */
Sprite.prototype.destroyBody = function()
{
    
}
/**
 * @method createBody
 * Creates the physical body as defined in Animo Sprites.
 * 
 * Body is initially created when sprite object is instantiated. This method is only useful when you previously destroyed the body and want to recreate it.
 * 
 * @note 
 * In order to be able to create the body, the Box2d world has to be known, so make sure you set the world object in Director in the onload event.
 *     
 * @example
 * animo.director().setPhysicalWorld(world);
 * 
 */
Sprite.prototype.createBody = function()
{
    if(this.body != null){
        Ti.API.info("GameDevHelper WARNING: Trying to create a body while the body already exists. Action is dropped.");
        return;//if body already exists dont do anything.
    }
    
    if(this.bodyInfo == null){
        return;//no body information so drop the action
    }
    
    var world = Director.sharedDirector().getPhysicalWorld();
    if(world == null)return;
    var type = this.bodyInfo.type;
    if(type == 3)//no physics
        return;
        
        
    if(box2d)
    {
        // box2d functions
        var b2settings = box2d.Common.b2Settings;
        var b2MassData = box2d.Collision.Shapes.b2MassData;
        
        var pi = Math.PI;
        var ceil = Math.ceil;
        var atan2 = Math.atan2;
        var sqrt = Math.sqrt;
        var round = Math.random;
        var random = Math.random;
        
        var bodyDef = new b2BodyDef();
        bodyDef.type = type;
        
        this.body = world.CreateBody(bodyDef);
        
        this.body.SetFixedRotation(this.bodyInfo.fixed);
        //not available in this version of box2d
        //this.body.SetGravityScale(new b2Vec2(0.5,-2));
        this.body.SetSleepingAllowed(this.bodyInfo.sleep);
        this.body.SetBullet(this.bodyInfo.bullet);
        this.body.SetAwake(this.bodyInfo.awake);
        this.body.SetActive(this.bodyInfo.active); 
        
        this.body.SetUserData(this.sprite);
        
        
        var shapesInfo = this.bodyInfo.shapes;
        for(var s = 0; s< shapesInfo.length; ++s)
        {
            var shInfo = shapesInfo[s];
            
            var density = shInfo.density;
            var friction= shInfo.friction;
            var restitution = shInfo.restitution;
            var sensor = shInfo.sensor;
            
            var shType = shInfo.type;
            
            if(shType == 2)//circle
            {
                var fixDef = new b2FixtureDef();
                var circle = new b2CircleShape();
                
                var circleRadius = parseFloat(shInfo.radius);
                var offset = ANPointFromString(shInfo.circleOffset);
    
                var x = offset[0];
                var y = offset[1];
                
                //flip y for platino coordinate system
                y = this.sprite.height - y;
                y = y - this.sprite.height;
                  
                fixDef.shape = new b2CircleShape(circleRadius/2);
                
                fixDef.shape.SetLocalPosition(new b2Vec2(x, y));
                fixDef.density = density;
                fixDef.friction = friction;
                fixDef.restitution = restitution;
                fixDef.isSensor = sensor;
                
                var cat  = shInfo.category;
                var mask = shInfo.mask;
                if(cat != null && mask != null)
                {
                    fixDef.filter.categoryBits = parseInt(cat);
                    fixDef.filter.maskBits     = parseInt(mask);
                }
                             
                this.body.CreateFixture(fixDef);
    
    
            }
            else{//polygon shape
             
                var fixtures = shInfo.fixtures;
                
                for(var f = 0; f < fixtures.length; ++f)
                {
                    var fixturePoints = fixtures[f];
    
    
                    var fix = new b2FixtureDef();
                    fix.shape = new b2PolygonShape();
            
                    fix.density     = density;
                    fix.friction    = friction;
                    fix.restitution = restitution;
                    fix.isSensor    = sensor;
            
            
                    var arrayOfPoints = [];
                    
                    var i = fixturePoints.length - 1;
                    for(var j = 0; j< fixturePoints.length; ++j)
                    {
                        var point = ANPointFromString(fixturePoints[j]);
                        
                        var x = point[0];
                        var y = point[1];
                        
                        //flip y for platino coordinate system
                        y =  this.sprite.height - y;
                        y = y - this.sprite.height;
                        
                        arrayOfPoints[i] = new b2Vec2(x, y);
                        i = i-1;
                    }
                
                
                    var cat  = shInfo.category;
                    var mask = shInfo.mask;
                    if(cat != null && mask != null)
                    {
                        fix.filter.categoryBits = parseInt(cat);
                        fix.filter.maskBits     = parseInt(mask);
                    }
                
                    fix.shape.SetAsArray(arrayOfPoints);
                        
                    this.body.CreateFixture(fix);   
                }
            }
        }
    }  
    else if(chipmunk)
    {
        var mass = 1; // we'll use a mass of 1 for everything
        var width = this.sprite.width;
		var height = this.sprite.height;
		
        // create a moment of inertia to use for body creation
		var moment = chipmunk.cpMomentForBox(mass, width-2, height-2);
		
		// create a body for each sprite
		//this.body = chipmunk.cpBodyNew(mass, moment);		
        
        if(type == 0){//static
            this.body = chipmunk.cpBodyNewStatic();
           //  this.body = chipmunk.cpBodyNew(mass, moment);
            //this.body = chipmunk.cpBodyNew(chipmunk.INFINITY, chipmunk.INFINITY);
        }
        else
        {
            this.body = chipmunk.cpBodyNew(mass, moment);
            chipmunk.cpSpaceAddBody(world, this.body);
        }
    
        
        
        
        
		//this.body.SetFixedRotation(this.bodyInfo.fixed);
        
        //this.body.SetSleepingAllowed(this.bodyInfo.sleep);
        //this.body.SetBullet(this.bodyInfo.bullet);
        //this.body.SetAwake(this.bodyInfo.awake);
        //this.body.SetActive(this.bodyInfo.active); 
        chipmunk.cpBodySetUserData(this.body, this.sprite);
        
        
        
     
        var shapesInfo = this.bodyInfo.shapes;
        for(var s = 0; s< shapesInfo.length; ++s)
        {
            var shInfo = shapesInfo[s];
            
            var density = shInfo.density;
            var friction= shInfo.friction;
            var restitution = shInfo.restitution;
            var sensor = shInfo.sensor;
            
            var shType = shInfo.type;
            
            if(shType == 2)//circle
            {
                var circleRadius = parseFloat(shInfo.radius);
                var offset = ANPointFromString(shInfo.circleOffset);
                
                var x = offset[0];
                var y = offset[1];
                
                //flip y for platino coordinate system
                y = this.sprite.height - y;
                y = y - this.sprite.height;
                 
                // create a shape
                var shape = chipmunk.cpCircleShapeNew(this.body, circleRadius*0.5, v(x, y));
                
                if(this.shapes == null)
                    this.shapes = [];
                this.shapes.push(shape);
                
                
                if(type == 0){
                    chipmunk.cpSpaceAddStaticShape(world, shape);    
                }
                else{
                    chipmunk.cpSpaceAddShape(world, shape);
                }
                
                
                chipmunk.cpShapeSetElasticity(shape, restitution);
                chipmunk.cpShapeSetFriction(shape, friction);
                if(sensor){
                    chipmunk.cpShapeSetSensor(shape, 1);
                }
                else{
                    chipmunk.cpShapeSetSensor(shape, 0);
                }
                
                
                /*
                var cat  = shInfo.category;
                var mask = shInfo.mask;
                if(cat != null && mask != null)
                {
                    fixDef.filter.categoryBits = parseInt(cat);
                    fixDef.filter.maskBits     = parseInt(mask);
                }
                             
                this.body.CreateFixture(fixDef);
                */
    
            }
            else{//polygon shape
             
                var fixtures = shInfo.fixtures;
                
                for(var f = 0; f < fixtures.length; ++f)
                {
                    var fixturePoints = fixtures[f];
            
                    //fix.density     = density;
                    //fix.friction    = friction;
                    //fix.restitution = restitution;
                    //fix.isSensor    = sensor;
            
            
                    var arrayOfPoints = [];
                    
                    var i = fixturePoints.length - 1;
                    for(var p = fixturePoints.length-1; p > -1; --p)
                    {
                        var point = ANPointFromString(fixturePoints[p]);
                        
                        var x = point[0];
                        var y = point[1];
                        
                        //flip y for platino coordinate system
                        y =  this.sprite.height - y;
                        y = y - this.sprite.height;
                        
                        arrayOfPoints[i] = v(x, y);
                        
                        i = i-1;
                    }
                    
                   
                    /*                
                    var cat  = shInfo.category;
                    var mask = shInfo.mask;
                    if(cat != null && mask != null)
                    {
                        fix.filter.categoryBits = parseInt(cat);
                        fix.filter.maskBits     = parseInt(mask);
                    }
                    
                    */
                
                    shape = chipmunk.cpPolyShapeNew(this.body, arrayOfPoints.length, arrayOfPoints, v(0, 0));
                    
                    if(this.shapes == null){
                        this.shapes = [];
                    }
                    this.shapes.push(shape);


                    if(sensor){
                       chipmunk.cpShapeSetSensor(shape, 1);
                    }
                    else{
                        chipmunk.cpShapeSetSensor(shape, 0);
                    }
                    
                    if(type == 0){
                        chipmunk.cpSpaceAddStaticShape(world, shape);    
                    }
                    else{
                        chipmunk.cpSpaceAddShape(world, shape);
                    }
                
                    chipmunk.cpShapeSetElasticity(shape, restitution);
                    chipmunk.cpShapeSetFriction(shape, friction);
                }
            }
        
        }
        
        if(type == 0)//static
        {
//            chipmunk.cpSpaceConvertBodyToStatic(world, this.body);
        }
        
    }
}


module.exports = Sprite;
