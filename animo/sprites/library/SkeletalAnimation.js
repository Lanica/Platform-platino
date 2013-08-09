
require('animo/Utils');
function SkeletalSkinConnectionInfo()
{    
    this.boneName = "";
    this.angleOffset = 0;
    this.connectionAngle = 0;
    this.positionOffsetX = 0;
    this.positionOffsetY = 0;
    this.positionX = 0;
    this.positionY = 0;
    this.angle = 0;

    return this;
}

SkeletalSkinConnectionInfo.prototype.createWithBoneName = function(name)
{
    this.boneName = name;
	return this;
}

SkeletalSkinConnectionInfo.prototype.createWithSkinConnection = function(other)
{
	this.createWithBoneName(other.getBoneName());
	this.setAngleOffset(other.angleOffset);
	this.setConnectionAngle(other.connectionAngle);
	this.setPositionOffset(other.positionOffsetX, other.positionOffsetY);
	this.setPosition(other.positionX, other.positionY);
	this.setAngle(other.angle);
	return this;
}

SkeletalSkinConnectionInfo.prototype.getBoneName = function(){
	return this.boneName;
}

SkeletalSkinConnectionInfo.prototype.getAngleOffset = function(){
	return this.angleOffset;
}

SkeletalSkinConnectionInfo.prototype.setAngleOffset = function(val){
	this.angleOffset = val;
}

SkeletalSkinConnectionInfo.prototype.getConnectionAngle = function(){return this.connectionAngle;}

SkeletalSkinConnectionInfo.prototype.setConnectionAngle = function(val){this.connectionAngle = val;}

SkeletalSkinConnectionInfo.prototype.getPositionOffsetX = function(){return this.positionOffsetX;}
SkeletalSkinConnectionInfo.prototype.getPositionOffsetY = function(){return this.positionOffsetY;}
SkeletalSkinConnectionInfo.prototype.setPositionOffset = function(valX, valY){this.positionOffsetX = valX; this.positionOffsetY = valY;}


SkeletalSkinConnectionInfo.prototype.getPositionX = function(){return this.positionX;}
SkeletalSkinConnectionInfo.prototype.getPositionY = function(){return this.positionY;}
SkeletalSkinConnectionInfo.prototype.setPosition = function(valX, valY){this.positionX = valX; this.positionY = valY;}


SkeletalSkinConnectionInfo.prototype.getAngle = function(){return angle;}
SkeletalSkinConnectionInfo.prototype.setAngle = function(val){angle = val;}



SkeletalSkinConnectionInfo.prototype = new SkeletalSkinConnectionInfo();
SkeletalSkinConnectionInfo.prototype.name = "SkeletalSkinConnectionInfo";
module.exports = SkeletalSkinConnectionInfo;





function SkeletalAnimationFrame()
{
	this.time = 0;
	this.bonePositions = null;
	this.spritesZOrder = null;
	this.skinConnections = null;
	this.skinSprites = null;
	this.spritesVisibility = null;
	this.spritesTransform = null;
	
	return this;
}

SkeletalAnimationFrame.prototype.createWithTime = function(tm)
{
	this.time = tm;
	return this;
}
	
SkeletalAnimationFrame.prototype.createWithFrame = function(other)
{
	this.time = other.getTime();

    {//copy positions
        var bonePoses = other.getBonePositions();
        if(bonePoses)
        {
            this.bonePositions = new Array();
            for(var key in bonePoses)
            {
                this.bonePositions[key] = ANDeepCopy(bonePoses[key]);
            }
        }
    }

    {//copy sprites z order
        var zOrders = other.getSpritesZOrder();
        if(zOrders)
        {
            this.spritesZOrder = [];
            for(var key in zOrders)
            {
                this.spritesZOrder[key] = ANDeepCopy(zOrders[key]);
            }
        }
    }

    {//copy skin connections
        var skinCon = other.getSkinConnections();
        if(skinCon)
        {
            this.skinConnections = [];
            for(var key in skinCon)
            {
                this.skinConnections[key] =  new SkeletalSkinConnectionInfo().createWithSkinConnection(skinCon[key]);
            }
        }
    }

    {//copy skin sprites
        var skinSpr = this.getSkinSprites();
        if(skinSpr)
        {
            this.skinSprites = [];
            for(var key in skinSpr)
            {
                this.skinSprites[key] = ANDeepCopy(skinSpr[key]);
            }
        }
    }

    {//copy sprites visibility
        var sprVis = this.getSpritesVisibility();
        if(sprVis)
        {
            this.spritesVisibility = [];
            for(var key in sprVis)
            {
                this.spritesVisibility[key] = ANDeepCopy(sprVis[key]);
            }
        }
    }

    {//copy sprites transform
        var sprTrans = this.getSpritesTransform();
        if(sprTrans)
        {
            this.spritesTransform = [];
            for(var key in sprTrans)
            {
                this.spritesTransform[key] = new SkeletalSkinConnectionInfo().createWithSkinConnection(sprTrans[key]);
            }
        }
    }

	return this;
}

SkeletalAnimationFrame.prototype.getTime = function()
{
	return this.time;
}
SkeletalAnimationFrame.prototype.setTime = function(val)
{
	this.time = val;
}

SkeletalAnimationFrame.prototype.getBonePositions = function()
{
	return this.bonePositions;
}
SkeletalAnimationFrame.prototype.getSpritesZOrder = function()
{
	return this.spritesZOrder;
}
SkeletalAnimationFrame.prototype.getSkinConnections = function()
{
	return this.skinConnections;
}
SkeletalAnimationFrame.prototype.getSkinSprites = function()
{
	return this.skinSprites;
}
SkeletalAnimationFrame.prototype.getSpritesVisibility = function()
{
	return this.spritesVisibility;
}
SkeletalAnimationFrame.prototype.getSpritesTransform = function()
{
	return this.spritesTransform;
}

SkeletalAnimationFrame.prototype.setBonePositionsWithDictionary = function(bones)
{
	if(null == bones)
	{
		return;
	}
    
    this.bonePositions = [];
    
    for(var key in bones)
    {
        var boneName = key;
        var bonePos = bones[boneName];
        if(bonePos)
        {
            var position = ANPointFromString(bonePos);
            this.bonePositions[boneName] = new Array(position[0], position[1]);
        }
    }
}

SkeletalAnimationFrame.prototype.setSpritesZOrderWithDictionary = function(sprites)
{
    if(null == sprites)
    {
     	return;
    }
    this.spritesZOrder = ANDeepCopy(sprites);
}

SkeletalAnimationFrame.prototype.setSkinConnectionsWithDictionary = function(connections)
{
    if(connections == null)return;
    this.skinConnections = [];
    
    for(var key in connections)
    {
        var sprName = key;
        var connectionInfo = connections[sprName];
        
        if(connectionInfo)
        {
            var boneName = connectionInfo.bone;
            var angleOff = connectionInfo.angleOff;
            var connAngle= connectionInfo.connAngle;
            var posOff   = ANPointFromString(connectionInfo.posOff);
            
            var skinInfo = null;
            if(boneName)
            {
                skinInfo = new SkeletalSkinConnectionInfo();
                skinInfo.createWithBoneName(boneName);
            }
            else
            {
                skinInfo = new SkeletalSkinConnectionInfo();
                skinInfo.createWithBoneName(null);
            }
            
            if(skinInfo)
            {
                skinInfo.setAngleOffset(angleOff);
                skinInfo.setConnectionAngle(connAngle);
                skinInfo.setPositionOffset(posOff[0], posOff[1]);
                this.skinConnections[sprName] = skinInfo;
            }   
        }
    }
}
SkeletalAnimationFrame.prototype.setSkinSpritesWithDictionary = function(dictionary)
{
    if(dictionary == null)return;
    this.skinSprites = ANDeepCopy(dictionary);  
}
SkeletalAnimationFrame.prototype.setSpritesVisibilityWithDictionary = function(dictionary)
{
    if(dictionary == null)return;
    this.spritesVisibility = ANDeepCopy(dictionary);    
}
SkeletalAnimationFrame.prototype.setSpritesTransformWithDictionary = function(dictionary)
{
    if(dictionary == null)return;
    
    this.spritesTransform = [];
    
    for(var key in dictionary)
    {
        var sprName = key;
        var transformInfo = dictionary[sprName];
        
        if(transformInfo)
        {
            var angleOff = transformInfo.angleOff;
            var connAngle= transformInfo.connAngle;
            var posOff = ANPointFromString(transformInfo.posOff);
            
            var angle = transformInfo.angle;
            var position = ANPointFromString(transformInfo.position);
            
            var transform = new SkeletalSkinConnectionInfo();
            transform.createWithBoneName(null);
            
            if(transform)
            {
                transform.setAngleOffset(angleOff);
                transform.setConnectionAngle(connAngle);
                transform.setPositionOffset(posOff[0], posOff[1]);
                
                transform.setAngle(angle);
                transform.setPosition(position[0], position[1]);
                
                this.spritesTransform[sprName] = transform;
            } 
        }
    }
}


SkeletalAnimationFrame.prototype = new SkeletalAnimationFrame();
SkeletalAnimationFrame.prototype.name = "SkeletalAnimationFrame";
module.exports = SkeletalAnimationFrame;





/**
* @class animo.SkeletalAnimation
* @alternateClassName SkeletalAnimation
*
* SkeletalAnimation is used to load skeletons animations and then play them on the skeleton. 
*/
function SkeletalAnimation() 
{
	this.name = "";
	this.totalTime = 0.0;
	this.currentTime = 0.0;
	this.playMode = 0;
	this.bonePositionFrames = [];
	this.spriteZOrderFrames = [];
	this.skinConnectionFrames = [];
	this.skinSpriteFrames = [];
	this.visibilityFrames = [];
	this.spritesTransformFrames = [];
	
	this.numberOfLoops = 0;
	this.currentLoop = 0;
	this.reversed = false;
    this.paused = false;
    
    return this;
}

SkeletalAnimation.prototype.createWithFile = function(animationFileName)
{
	var dict = null;

	var f = Titanium.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, animationFileName); 
	Ti.API.info("file found " + f.exists);
	if(f.exists)
	{
		var contents = f.read();
		if(contents)
		{
            dict = JSON.parse(contents);
        }
        else{
            Ti.API.info("File cannot be read.");
        }
    }
    else{
        Ti.API.info("Error loading skeleton file. File is null");
    }

 
 	if(dict != null)
    {
        this.createWithDictionary(dict);
    }
	
	return this;
}

SkeletalAnimation.prototype.createWithDictionary = function(dict)
{
	if(dict.name){
		this.name = dict.name
	}
	else{
		this.name = "UntitledAnimation";
	}
	
	this.totalTime = dict.totalTime;
	this.playMode = dict.playMode;
	
	{//setting bone positions
		var posFrames = dict.positionFrames;
		for(var i = 0; i < posFrames.length; ++i)
		{
			var frmInfo = posFrames[i];
			
			var frmTime = frmInfo.time;
			
			var frm = new SkeletalAnimationFrame();
			frm.createWithTime(frmTime);
			frm.setBonePositionsWithDictionary(frmInfo.bones);
			this.bonePositionFrames.push(frm);
		}
	}
	
	{//setting sprites z order
		var zOrderFrames = dict.zOrderFrames;
		for(var i = 0; i < zOrderFrames.length; ++i)
		{
			var frmInfo = zOrderFrames[i];
			var frmTime = frmInfo.time;
			
			var frm = new SkeletalAnimationFrame();
			frm.createWithTime(frmTime);
			frm.setSpritesZOrderWithDictionary(frmInfo.sprites);
			this.spriteZOrderFrames.push(frm);
		}
	}
	
	{//setting skin connections
		var frames = dict.connectionFrames;
		for(var i = 0; i < frames.length; ++i)
		{
			var frmInfo = frames[i];
			var frmTime = frmInfo.time;
			
			var frm = new SkeletalAnimationFrame();
			frm.createWithTime(frmTime);
			frm.setSkinConnectionsWithDictionary(frmInfo.connections);
			this.skinConnectionFrames.push(frm);
		}
	}
	
	{//setting skin sprite frames
		var frames = dict.skinFrames;
		for(var i = 0; i < frames.length; ++i)
		{
			var frmInfo = frames[i];
			var frmTime = frmInfo.time;
			
			var frm = new SkeletalAnimationFrame();
			frm.createWithTime(frmTime);
			frm.setSkinSpritesWithDictionary(frmInfo.skins);
			this.skinSpriteFrames.push(frm);
		}
	}
	
	{//setting sprite visibility frames
		var frames = dict.visibilityFrames;
		for(var i = 0; i < frames.length; ++i)
		{
			var frmInfo = frames[i];
			var frmTime = frmInfo.time;
			
			var frm = new SkeletalAnimationFrame();
			frm.createWithTime(frmTime);
			frm.setSpritesVisibilityWithDictionary(frmInfo.sprites);
			this.visibilityFrames.push(frm);
		}
	}
	
	{//setting sprite transform frames
		var frames = dict.spriteTransformFrames;
		for(var i = 0; i < frames.length; ++i)
		{
			var frmInfo = frames[i];
			var frmTime = frmInfo.time;
			
			var frm = new SkeletalAnimationFrame();
			frm.createWithTime(frmTime);
			frm.setSpritesTransformWithDictionary(frmInfo.transform);
			this.spritesTransformFrames.push(frm);
		}
	}
	
	return this;	
}


SkeletalAnimation.prototype.copyFramesFrom = function(otherArray)
{
    if(otherArray)
    {
        var toArray = [];
        
        for(var i = 0; i < otherArray.length; ++i)
        {
            var frm = otherArray[i];
            if(frm)
            {
                toArray.push(new SkeletalAnimationFrame().createWithFrame(frm));
            }   
        }
        return toArray;
    }
    return null;
}

SkeletalAnimation.prototype.createWithAnimation = function(other)
{
	//WE SHOULD CREATE NEW FRAMES FROM THIS ANIMATIONS FRAMES IN CASE THE USER CHANGES THE TIME
    //OF AN ANIMATION TO NOT CHANGE ON ALL SAME ANIMATIONS

    if(other.getBonePositionFrames())
    {
        this.bonePositionFrames  = [];
        
        for(var i = 0; i < other.getBonePositionFrames().length; ++i)
        {
            var frm = other.getBonePositionFrames()[i];
            if(frm)
            {
                this.bonePositionFrames.push(new SkeletalAnimationFrame().createWithFrame(frm));
            }   
        }
    }


    if(other.getSpriteZOrderFrames())
    {
        this.spriteZOrderFrames  = [];
        
        for(var i = 0; i < other.getSpriteZOrderFrames().length; ++i)
        {
            var frm = other.getSpriteZOrderFrames()[i];
            if(frm)
            {
                this.spriteZOrderFrames.push(new SkeletalAnimationFrame().createWithFrame(frm));
            }   
        }
    }        

   
    if(other.getSkinConnectionFrames())
    {
        this.skinConnectionFrames  = [];
        
        for(var i = 0; i < other.getSkinConnectionFrames().length; ++i)
        {
            var frm = other.getSkinConnectionFrames()[i];
            if(frm)
            {
                this.skinConnectionFrames.push(new SkeletalAnimationFrame().createWithFrame(frm));
            }   
        }
    }
    
    
    if(other.getSkinSpriteFrames())
    {
        this.skinSpriteFrames  = [];
        
        for(var i = 0; i < other.getSkinSpriteFrames().length; ++i)
        {
            var frm = other.getSkinSpriteFrames()[i];
            if(frm)
            {
                this.skinSpriteFrames.push(new SkeletalAnimationFrame().createWithFrame(frm));
            }   
        }
    }
    

    if(other.getVisibilityFrames())
    {
        this.visibilityFrames  = [];
        
        for(var i = 0; i < other.getVisibilityFrames().length; ++i)
        {
            var frm = other.getVisibilityFrames()[i];
            if(frm)
            {
                this.visibilityFrames.push(new SkeletalAnimationFrame().createWithFrame(frm));
            }   
        }
    }        


    if(other.getSpritesTransformFrames())
    {
        this.spritesTransformFrames  = [];
        
        for(var i = 0; i < other.getSpritesTransformFrames().length; ++i)
        {
            var frm = other.getSpritesTransformFrames()[i];
            if(frm)
            {
                this.spritesTransformFrames.push(new SkeletalAnimationFrame().createWithFrame(frm));
            }   
        }
    } 


    this.totalTime = other.getTotalTime();
    this.currentTime = 0;
    
    this.name = other.getName();
    this.paused = false;
    this.setNumberOfLoops(other.getNumberOfLoops());
    this.setCurrentLoop(other.getCurrentLoop());
    this.setPlayMode(other.getPlayMode());
    this.setCurrentTime(other.getCurrentTime());
    this.setReversed(other.getReversed());

    return this;
}

/**
 * @method getNumberOfLoops
 * Get the number of loops this animation should play. Returns a number value.
 * @return {Number}
 **/
SkeletalAnimation.prototype.getNumberOfLoops = function()
{
	return this.numberOfLoops;
}

/**
 * @method setNumberOfLoops
 * Sets the number of loops this animation should play.
 * @param {Number} val A numeric value representing loops count.
 */ 
SkeletalAnimation.prototype.setNumberOfLoops = function(val)
{
	this.numberOfLoops = val;
}

/**
 * @method getCurrentLoop
 * The the current loop this animation object is at. Returns a number value.
 * @return {Number} 
 **/
SkeletalAnimation.prototype.getCurrentLoop = function()
{
	return this.currentLoop;
}
/**
 * @method setCurrentLoop
 * Set the current loop this animation object is at. The loop count will continue from this number. 
 * @param {Number} val A numeric value.
 **/
SkeletalAnimation.prototype.setCurrentLoop = function(val)
{
	this.currentLoop = val;
}

/**
 * @method getPlayMode
 * Returns the play mode as a numeric value.
 * 
 * 0 means normal play mode.
 * 
 * 1 means looping mode.
 * 
 * 2 means ping pong mode.
 **/
SkeletalAnimation.prototype.getPlayMode = function()
{	
	return this.playMode;
}

/**
 * @method setPlayMode
 * Sets the play mode of this animation object using a numeric value.
 * 
 * 0 means normal play mode.
 * 
 * 1 means looping mode.
 * 
 * 2 means ping pong mode.
 * 
 * @param {Number} val A numeric value.
 **/
SkeletalAnimation.prototype.setPlayMode = function(val)
{	
	this.playMode = val;
}

/**
 * @method getReversed
 * Get if this animation object is currently playing in reverse. Returns a boolean value.
 * @return {Boolean}
 **/
SkeletalAnimation.prototype.getReversed = function()
{
	return this.reversed;
}

/**
 * @method setReversed
 * Set this animation play mode as reversed. 
 * @param {Boolean} val A boolean value.
 **/
SkeletalAnimation.prototype.setReversed = function(val)
{
	this.reversed = val;
}

/**
 * @method getPaused
 * Get if this animation object is paused. Returns a boolean value.
 * @return {Boolean}
 **/
SkeletalAnimation.prototype.getPaused = function()
{
	return this.paused;
}
/**
 * @method setPaused
 * Pause or unpause this animation object.
 * @param {Boolean} val A boolean value.
 **/
SkeletalAnimation.prototype.setPaused = function(val)
{
	this.paused = val;
}

/**
 * @method getName
 * Get the name of this animation object as a string value.
 * @return {String}
 **/
SkeletalAnimation.prototype.getName = function()
{
	return this.name;
}

/**
 * @method setTotalTime
 * Set the total time this animation object should take to complete a loop.
 * When changing this value all frames will be placed at coresponding position.
 * @param {Number} newTime A numeric value representing the total time.
**/
SkeletalAnimation.prototype.setTotalTime = function(newTime)
{

    if(newTime < 0.02)
        newTime = 0.02;
    
    var currentTotalTime = this.totalTime;
    
    this.changeTimeForFrames(this.bonePositionFrames, currentTotalTime, newTime);

    this.changeTimeForFrames(this.spriteZOrderFrames, currentTotalTime, newTime);
    
    this.changeTimeForFrames(this.skinConnectionFrames, currentTotalTime, newTime);
    
    this.changeTimeForFrames(this.skinSpriteFrames, currentTotalTime, newTime);
    
    this.changeTimeForFrames(this.visibilityFrames, currentTotalTime, newTime);
    
    this.changeTimeForFrames(this.spritesTransformFrames, currentTotalTime, newTime);
    
    this.totalTime = newTime;
}

SkeletalAnimation.prototype.changeTimeForFrames = function(frames, currentTotalTime, newTime)
{
    for(var i = 0; i < frames.length; ++i)
    {
        var frame = frames[i];
        
        var currentFrameTime = frame.getTime();
        var frameUnit = currentFrameTime/currentTotalTime;
        //gives a value between 0 and 1 for the frame time
        //multiplying this unit value with the new total time gives use the new frame time
        var newFrameTime = frameUnit*newTime;
        frame.setTime(newFrameTime);
    }   
}

/**
 * @method getTotalTime
 * Get the total time of this animation object as a numeric value.
 * @return {Number}
 **/
SkeletalAnimation.prototype.getTotalTime = function()
{
	return this.totalTime;
}

/**
 * @method setCurrentTime
 * Change the time position where this animation is currently at.
 *
 * Method has no effect when animation is paused.
 * @param {Number} val A numeric value representing the time.
 **/
SkeletalAnimation.prototype.setCurrentTime = function(val)
{
    if(this.paused == false){
        this.currentTime = val;
    }
}
/**
 * @method getCurrentTime
 * Get the current time this animation is at.
 * @return {Number}
 **/
SkeletalAnimation.prototype.getCurrentTime = function()
{
	return this.currentTime;
}

SkeletalAnimation.prototype.getBonePositionFrames = function()
{
	return this.bonePositionFrames;
}
SkeletalAnimation.prototype.getSpriteZOrderFrames = function()
{
	return this.spriteZOrderFrames;
}
SkeletalAnimation.prototype.getSkinConnectionFrames = function()
{
	return this.skinConnectionFrames;
}
SkeletalAnimation.prototype.getSkinSpriteFrames = function()
{
	return this.skinSpriteFrames;
}
SkeletalAnimation.prototype.getVisibilityFrames = function()
{
	return this.visibilityFrames;
}
SkeletalAnimation.prototype.getSpritesTransformFrames = function()
{
	return this.spritesTransformFrames;
}

/**
 * @method goToNextBonePositionFrame
 * Moves the animation to first next position frame.
 * Returns new frame index.
 * @return {Number}
 **/
SkeletalAnimation.prototype.goToNextBonePositionFrame = function()
{
    return this.goToNextFrameUsingFramesArray(this.getBonePositionFrames());
}
/**
 * @method goToPreviousBonePositionFrame
 * Moves the animation to first previous position frame.
 * Returns new frame index.
 * @return {Number}
 **/
SkeletalAnimation.prototype.goToPreviousBonePositionFrame = function()
{
    return this.goToPreviousFrameUsingFramesArray(this.getBonePositionFrames());
}

/**
 * @method goToNextSpriteZOrderFrame
 * Moves the animation to first next sprite z order frame.
 * Returns new frame index.
 * @return {Number}
 **/
SkeletalAnimation.prototype.goToNextSpriteZOrderFrame = function()
{
    return this.goToNextFrameUsingFramesArray(this.getSpriteZOrderFrames());
}
/**
 * @method goToPreviousSpriteZOrderFrame
 * Moves the animation to first previous sprite z order frame.
 * 
 * Returns new frame index.
 * @return {Number}
 **/
SkeletalAnimation.prototype.goToPreviousSpriteZOrderFrame = function()
{
    return this.goToPreviousFrameUsingFramesArray(this.getSpriteZOrderFrames());
}

/**
 * @method goToNextSkinConnectionFrame
 * Moves the animation to first next skin connection frame.
 * 
 * Returns new frame index.
 * @return {Number}
 **/
SkeletalAnimation.prototype.goToNextSkinConnectionFrame = function()
{
    return this.goToNextFrameUsingFramesArray(this.getSkinConnectionFrames());
}
/**
 * @method goToPreviousSkinConnectionFrame
 * Moves the animation to first previous skin connection frame.
 * 
 * Returns new frame index.
 * @return {Number}
 **/
SkeletalAnimation.prototype.goToPreviousSkinConnectionFrame = function()
{
    return this.goToPreviousFrameUsingFramesArray(this.getSkinConnectionFrames());
}


/**
 * @method goToNextSkinSpriteFrame
 * Moves the animation to first next sprite texture atlas frame.
 * 
 * Returns new frame index.
 * @return {Number}
 **/
SkeletalAnimation.prototype.goToNextSkinSpriteFrame = function()
{
    return this.goToNextFrameUsingFramesArray(this.getSkinSpriteFrames());
}

/**
 * @method goToPreviousSkinSpriteFrame
 * Moves the animation to first previous sprite texture atlas frame.
 * Returns new frame index.
 * @return {Number}
 **/
SkeletalAnimation.prototype.goToPreviousSkinSpriteFrame = function()
{
    return this.goToPreviousFrameUsingFramesArray(this.getSkinSpriteFrames());
}

/**
 * @method goToNextVisibilityFrame
 * Moves the animation to first next sprite visibility frame.
 * 
 * Returns new frame index.
 * @return {Number}
 **/
SkeletalAnimation.prototype.goToNextVisibilityFrame = function()
{
    return this.goToNextFrameUsingFramesArray(this.getVisibilityFrames());
}
/**
 * @method goToPreviousVisibilityFrame
 * Moves the animation to first previous sprite visibility frame.
 * Returns new frame index.
 * @return {Number}
 **/
SkeletalAnimation.prototype.goToPreviousVisibilityFrame = function()
{
    return this.goToPreviousFrameUsingFramesArray(this.getVisibilityFrames());
}

/**
 * @method goToNextSpriteTransformFrame
 * Moves the animation to first next sprite transformation frame.
 * Returns new frame index.
 * @return {Number}
 **/
SkeletalAnimation.prototype.goToNextSpriteTransformFrame = function()
{
    return this.goToNextFrameUsingFramesArray(this.getSpritesTransformFrames());
}

/**
 * @method goToPreviousSpriteTransformFrame
 * Moves the animation to first previous sprite transformation frame.
 * 
 * Returns new frame index.
 * @return {Number}
 **/
SkeletalAnimation.prototype.goToPreviousSpriteTransformFrame = function()
{
	return this.goToPreviousFrameUsingFramesArray(this.getSpritesTransformFrames());
}



SkeletalAnimation.prototype.goToNextFrameUsingFramesArray = function(array)
{
	var currentFrame = null;
	var idx = -1;
	for(var i = 0; i < array.length; ++i)
	{
	    var frm = array[i];
	    if(frm.getTime() <= this.currentTime)
	    {
	       currentFrame = frm;
	       idx = i;    
	    }
	}
	
    if(currentFrame){
        idx+=1;
        
        if(idx >= array.length)
        {
            idx = array.length-1;
        } 
        
        var nextFrame = array[idx];
        if(nextFrame){
            this.currentTime = nextFrame.getTime();
        }
        return idx;
    }
    
    return -1;
}
SkeletalAnimation.prototype.goToPreviousFrameUsingFramesArray = function(array)
{
    var currentFrame = null;
    var idx = -1;
    
    for(var i = 0; i < array.length; ++i)
    {
        var frm = array[i];
        if(frm.getTime() <= this.currentTime)
        {
            currentFrame = frm;
            idx = i;
        }
    }
    
     if(currentFrame){
        idx-=1;
        
        if(idx<0){
            idx = 0;
        } 
        
        var nextFrame = array[idx];
        if(nextFrame){
            this.currentTime = nextFrame.getTime();
        }
        return idx;
    }
    
    return -1;	
}


SkeletalAnimation.prototype.copyFramesFrom = function(otherArray, toArray)
{	
}

SkeletalAnimation.prototype = new SkeletalAnimation();
SkeletalAnimation.prototype.name = "SkeletalAnimation";
module.exports = SkeletalAnimation;
