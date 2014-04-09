/**
* @class animo.Skeleton
* @alternateClassName Skeleton
*
* Skeleton class is used to create and control skeletons as defined in Animo Sprites tool. 
*/

var Bone = require('animo/Bone');
var BoneSkin = require('animo/BoneSkin');
require('animo/Utils');

var SkeletalAnimation = require('animo/SkeletalAnimation').SkeletalAnimation;

function Skeleton() 
{    
	this.rootBone = null;
    this.poses = null;//may be nil depending on publish settings
    this.skins = null;//contains BoneSkin objects
    this.sprites = [];
    this.batchNode = null;
    this.name = "";
    this.animation = null;//combined animations currently not supported
    
    this.transitionTime = null;//not nil only when transtioning to a new animation
    this.currentTranstionTime = 0.0;
    this.delegate = null;
    this.lastTime = 0;
    this.animatingInProgress = false;
    
    this.updateTimer = null;
    
    this.poseChangeNotificationCallback = null;
    this.animationStartNotificationCallback = null;
    this.animationStopNotificationCallback = null;
    this.animationLoopFinishNotificationCallback = null;
    this.animationDidFinishTransitionNotificationCallback = null;
    
    return this;
}

Skeleton.prototype.createWithFile = function(skeletonFileName, scene)
{
	var dict = null;

	var f = Titanium.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, skeletonFileName); 
    
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
        this.name = dict.name;
        this.loadBones(dict.root);
        
        
        var segements = skeletonFileName.split("/");
        segements.splice(segements.length - 2, 2);//remove last 2 elements
        segements[segements.length ] = "" + dict.sheetAtlas;
        var spriteAtlastFileName = segements.join("/");

        this.loadSprites(dict.sprites, spriteAtlastFileName);
        this.updateSkins();
        
        var posesDict = dict.poses;
        if(posesDict){
            this.poses = ANDeepCopy(posesDict);
        }
    }
    
    return this;
}

/**
 * @method setPoseChangeNotificationObserver
 * Add an observer for pose has change notification. Called just after a pose was loaded.
 * @param {Function} callback A function having following arguments (skeleton, poseName)     
 *
 *@example
 *mySkeleton.setPoseChangeNotificationObserver(function(skeleton, poseName){
 *             Ti.API.info("Did load pose with name " + poseName + " on skeleton with name " + skeleton.getName());
 *           });
 *
 */
Skeleton.prototype.setPoseChangeNotificationObserver = function(callback){
    this.poseChangeNotificationCallback = callback;
}


/**
 * @method setDidStartAnimationNotificationObserver
 * Add an observer for animation did start notification. Called just after an animation is started.
 * @param {Function} callback A function having following arguments (skeleton, animation)     
 *
 * @example
 * mySkeleton.setDidStartAnimationNotificationObserver(function(skeleton, animation){
 *             Ti.API.info("Did start animation with name " + animation.getName() + " on skeleton with name " + skeleton.getName());
 *           });
 * 
 */
Skeleton.prototype.setDidStartAnimationNotificationObserver  = function(callback){
    this.animationStartNotificationCallback = callback;
}             
       
/**
 * @method setDidStopAnimationNotificationObserver
 * Add an observer for animation did stop notification. Called just after an animation has finished.
 * @param {Function} callback A function having following arguments (skeleton, animation)     
 *
 * @example
 * mySkeleton.setDidStopAnimationNotificationObserver(function(skeleton, animation){
 *          Ti.API.info("Did stop animation with name " + animation.getName() + " on skeleton with name " + skeleton.getName());
 *          });
 * 
 */ 
Skeleton.prototype.setDidStopAnimationNotificationObserver = function(callback){
    this.animationStopNotificationCallback = callback;
}

/**
 * @method setDidFinishAnimationLoopNotificationObserver
 * Add an observer for animation did finish a loop notification. Called just after an animation has finished a loop.
 * @param {Function} callback A function having following arguments (skeleton, animation)     
 * 
 * @example
 * mySkeleton.setDidFinishAnimationLoopNotificationObserver(function(skeleton, animation){
 *              Ti.API.info("Did finish loop for animation with name " + animation.getName() + " on skeleton with name " + skeleton.getName());
 *            });
 * 
 */         
Skeleton.prototype.setDidFinishAnimationLoopNotificationObserver = function(callback){
    this.animationLoopFinishNotificationCallback = callback;
}
        

/**
 * @method setDidFinishTransitionToAnimationNotificationObserver
 * Add an observer for animation did finish transition notification. Called just after an animation has finished transitioning to another animation.
 * @param {Function} callback A function having following arguments (skeleton, animation)     
 *
 * @example
 * mySkeleton.setDidFinishTransitionToAnimationNotificationObserver(function(skeleton, animation){
 *              Ti.API.info("Did finish transition to animation with name " + animation.getName() + " on skeleton with name " + skeleton.getName());
 *            });
 * 
 */         
Skeleton.prototype.setDidFinishTransitionToAnimationNotificationObserver = function(callback){
    this.animationDidFinishTransitionNotificationCallback = callback;
}
        

/**
 * @method getName
 * Returns the name of the skeleton.    
 * @return {String} A string value.
 */
Skeleton.prototype.getName = function()
{
    return this.name
}

/**
 * @method playAnimation
 * Start an animation on the skeleton given the animation object.
 * @param {SkeletalAnimation} anim A SkeletalAnimation object.    
 */
Skeleton.prototype.playAnimation = function(anim)
{
    this.animation = null;
    this.animation = anim;

    this.currentTransitionTime = 0;
    this.animation.setCurrentTime(0);
    this.animation.setCurrentLoop(0);
    
    
    if(this.animationStartNotificationCallback)
    {
        this.animationStartNotificationCallback(this, anim);
    }
    
    
    this.lastTime = new Date();
    
    this.animatingInProgress = false;
    
    var myself = this;
    function callUpdateMethod() {
        myself.update();
    }
    this.updateTimer = setInterval(callUpdateMethod, 1.0/30.0);
}

/**
 * @method transitionToAnimationInTime
 *
 * This will change or set an animation by transitioning each bone position to the new animation bone positions in the period of time specified.
 *
 * You should only transition related animations. Like from walk, to shoot gun. Character pose should be similar in nature. 
 *
 * Transitioning from a standing on a chair pose to a walking pose may lead to unrealistic behaviour. 
 *
 * In such a case, you will need a "in between" animation. An animation that will make the character get up of the chair. When this "in between" animation finishes you will change to a new walking animation.  
 *
 @param {SkeletalAnimation} anim A SkeletalAnimation object
 @param {Number} time How much time the transition should take. A number value.
 */
Skeleton.prototype.transitionToAnimationInTime = function(anim, time)
{    
    if(null == anim)return;

    var allBones = this.getAllBones();
    
    for(var i = 0; i< allBones.length; ++i)
    {
        var bone = allBones[i];
        bone.savePosition();
    }
    
    this.playAnimation(anim);//this will also rmeove any previous transition time
    
    this.transitionTime = time;
    this.currentTranstionTime = 0;
}

/**
 * @method stopAnimation
 * Stops the active skeleton animation and removes it from memory.    
 */
Skeleton.prototype.stopAnimation = function()
{
    if(this.animationStopNotificationCallback && this.animation)
    {
        this.animationStopNotificationCallback(this, this.animation);
    }
    
    this.animation = null;
    this.animatingInProgress = false;
    clearInterval(this.updateTimer);
}

/**
 * @method getAnimation
 * Returns the skeletal animation running on this skeleton object.
 * @return {SkeletalAnimation} A SkeletalAnimation object or null.    
 */
Skeleton.prototype.getAnimation = function()
{
    return this.animation;
}

/*
Skeleton.prototype.playAnimationWithName = function(animName)
{
    var anim = SkeletalAnimationCache.getInstance().skeletalAnimatonWithName(animName);
    if(anim)
    {
        var copyAnim = new SkeletalAnimation();
        copyAnim = copyAnim.createWithAnimation(anim);
        if(copyAnim){
            this.playAnimation(copyAnim);
        }
    }
}
*/

Skeleton.prototype.update = function(self)
{
    if(this.animatingInProgress == true)
        return;
        
    if(this.animation == null)
    {
        return;
    }
    
    //we use this variable so that in case the update function is called while we are still changing frames we should ignore the call
    this.animatingInProgress = true;
    
    var delta = new Date() - this.lastTime;
    this.lastTime = new Date();

    var dt = delta/1000.0;//deltaTime/1000.0; 
    
    var time = 0.0;
    
    
    if(this.transitionTime != null)
    {
        if(this.transitionTime < this.currentTransitionTime)
        {
            this.transitionTime = null;
            this.animation.setCurrentTime(dt);
            this.animation.setCurrentLoop(0);
            this.currentTransitionTime = 0;
            time = dt;
            
            if(this.animationDidFinishTransitionNotificationCallback)
            {
                this.animationDidFinishTransitionNotificationCallback(this, this.animation);
            }
        }
        else{
            time = this.currentTranstionTime;
            this.currentTranstionTime += dt;
        }
    }
    else{
        
        time = this.animation.getCurrentTime();
        if(this.animation.getReversed()){
            this.animation.setCurrentTime(this.animation.getCurrentTime() - dt);
        }
        else{
            this.animation.setCurrentTime(this.animation.getCurrentTime() + dt);
        }
    }
    
    
    if(this.animation.getReversed() && this.transitionTime == null)
    {
        if(time <= 0)
        {
            switch(this.animation.getPlayMode())
            {
                case 0: //normal
                case 1: //loop
                {
                    this.animation.setCurrentTime(this.animation.getTotalTime());    
                }
                break;
                
                case 2: //ping pong
                {
                    this.animation.setCurrentTime(0);
                    this.animation.setReversed(false);
                }
                break;
                
                default:
                break;
            }
            
            if(this.animationLoopFinishNotificationCallback)
            {
                this.animationLoopFinishNotificationCallback(this, this.animation);
            }
    
    
            this.animation.setCurrentLoop(this.animation.getCurrentLoop() + 1);
        }
        
    }
    else{
        if(time >= this.animation.getTotalTime())
        {
            switch(this.animation.getPlayMode())
            {
                case 0://normal
                case 1://loop
                {
                    this.animation.setCurrentTime(0);
                }
                break;
                
                case 2: //ping pong
                {
                    this.animation.setCurrentTime(this.animation.getTotalTime());
                    this.animation.setReversed(true);
                }
                break;
            }
            
            if(this.animationLoopFinishNotificationCallback)
            {
                this.animationLoopFinishNotificationCallback(this, this.animation);
            }
            
            
            this.animation.setCurrentLoop(this.animation.getCurrentLoop()+1);
            
        }
    }
    
    if(this.animation.getNumberOfLoops() != 0 && this.animation.getCurrentLoop() >= this.animation.getNumberOfLoops())
    {
        this.stopAnimation();
    }
    
    var allBones = this.getAllBones();
    
    
    {//handle bone positions
        
        var beginFrame = null
        var endFrame = null;
        
        var bonePosFrames = this.animation.getBonePositionFrames();
        for(var i = 0; i < bonePosFrames.length; ++i)
        {
            var frm = bonePosFrames[i];
            
            if(frm.getTime() <= time)
            {
                beginFrame = frm;
            }
            
            if(frm.getTime() > time)
            {
                endFrame = frm;
                break;//exit for
            }
        }
        
        if(this.transitionTime)
        {
            var positionFrames = this.animation.getBonePositionFrames();
            
            if(positionFrames.length > 0)
            {
                beginFrame = positionFrames[0];
            }
            
            var beginTime = 0;
            var endTime = this.transitionTime;
            
            var framesTimeDistance = endTime - beginTime;
            var timeUnit = (time - beginTime)/framesTimeDistance;//a value between 0 and 1
            
            var beginBonesInfo = beginFrame.getBonePositions();
            
            if(beginBonesInfo != null)
            {
                for(var b = 0; b < allBones.length; ++b)
                {
                    var bone = allBones[b];
                
                    var beginValue = beginBonesInfo[bone.getName()];
                
                    var beginPositionX = bone.getPreviousPositionX();
                    var beginPositionY = bone.getPreviousPositionY();
                
                    var endPositionX = bone.getPositionX();
                    var endPositionY = bone.getPositionY();
                
                    if(beginValue != null){
                        endPositionX = beginValue[0];
                        endPositionY = beginValue[1];
                    }
                
                    //lets calculate the position of the bone based on the start - end and unit time
                    var newX = beginPositionX + (endPositionX - beginPositionX)*timeUnit;
                    var newY = beginPositionY + (endPositionY - beginPositionY)*timeUnit;
            
                    bone.setPosition(newX, newY);
                }
                //this.transformSkins();
                this.rootBone.updateMovement();
            }
        }
        else if(beginFrame && endFrame)
        {
            var beginTime = beginFrame.getTime();
            var endTime = endFrame.getTime();
            
            var framesTimeDistance = endTime - beginTime;
            var timeUnit = (time - beginTime)/framesTimeDistance;//a value between 0 and 1
            
            var beginBonesInfo = beginFrame.getBonePositions();
            var endBonesInfo = endFrame.getBonePositions();
            
            if(null == beginBonesInfo || null == endBonesInfo){
                return;
            }
             
            for(var b = 0; b < allBones.length; ++b)
            {
                var bone = allBones[b];
                if(bone)
                {
                var beginValue   = beginBonesInfo[bone.getName()];
                var endValue     = endBonesInfo[bone.getName()];
                
                var beginPositionX = bone.getPositionX();
                var beginPositionY = bone.getPositionY();
                
                var endPositionX  = bone.getPositionX();
                var endPositionY  = bone.getPositionY();
                
                if(beginValue)
                {
                    beginPositionX = beginValue[0];
                    beginPositionY = beginValue[1];
                }
                
                if(endValue){
                    endPositionX = endValue[0];
                    endPositionY = endValue[1];
                }
                
                //lets calculate the position of the bone based on the start - end and unit time
                var newX = beginPositionX + (endPositionX - beginPositionX)*timeUnit;
                var newY = beginPositionY + (endPositionY - beginPositionY)*timeUnit;
                
                bone.setPosition(newX, newY);
                }
            }       
            this.rootBone.updateMovement();   
        }
        else if(beginFrame)
        {
            var beginBonesInfo = beginFrame.getBonePositions();
            for(var b = 0; b < allBones.length; ++b)
            {
                var bone = allBones[b];
                
                var beginValue = beginBonesInfo[bone.getName()];
                
                var beginPositionX = bone.getPositionX();
                var beginPositionY = bone.getPositionY();
                
                if(beginValue){
                    beginPositionX = beginValue[0];
                    beginPositionY = beginValue[1];
                }
                
                bone.setPosition(beginPositionX, beginPositionY);
                
            }
            this.rootBone.updateMovement();
        }
        
    }
    
    if(this.transitionTime){
        time = 0;
    }
    
    
    {//handle sprites z order
        
        var beginFrame = null
        var spriteZOrderFrames = this.animation.getSpriteZOrderFrames();
        for(var i = 0; i < spriteZOrderFrames.length; ++i)
        {
            var frm = spriteZOrderFrames[i];
            if(frm.getTime() <= time){
                beginFrame = frm;
            }
        }
        
        //we have the last frame with smaller time
        if(beginFrame)
        {
            var zOrderInfo = beginFrame.getSpritesZOrder();
            
            for(var s = 0; s< this.sprites.length; ++s)
            {
                var sprite = this.sprites[s];
                if(sprite)
                {
                    var sprName = sprite.name;
                    if(sprName)
                    {
                        var zNum = zOrderInfo[sprName];
                        if(zNum)
                        {
                            sprite.z = zNum;   
                        }
                    }
                }
            }
        }
    }
    
    {//handle skin connections
        
        var beginFrame = null;
        var skinConnectionFrames = this.animation.getSkinConnectionFrames();
        for(var i = 0; i < skinConnectionFrames.length; ++i)
        {
            var frm = skinConnectionFrames[i];
            if(frm.getTime() <= time)
            {
                beginFrame = frm;
            }
        }
        
        //we have the last frame with smaller time
        if(beginFrame)
        {
            var connections = beginFrame.getSkinConnections();
            
            for(var s = 0; s < this.skins.length; ++s)
            {
                var skin = this.skins[s];
                
                var sprite = skin.getSprite();
                
                if(sprite)
                {
                    var sprName = sprite.name;
                    if(sprName)
                    {
                        var connectionInfo = connections[sprName];
                        if(connectionInfo)
                        {
                            var boneName = connectionInfo.getBoneName();
                            
                            skin.setAngleOffset(connectionInfo.getAngleOffset());
                            skin.setPositionOffset(connectionInfo.getPositionOffsetX(), connectionInfo.getPositionOffsetY());
                            skin.setConnectionAngle(connectionInfo.getConnectionAngle());
                            
                            if(boneName == "" || boneName == null)
                            {
                                skin.setBone(null);
                            }
                            else{
                                
                                for(var b = 0; b < allBones.length; ++b)
                                {
                                    var bone = allBones[b];
                                    if(bone.getName() == boneName)
                                    {
                                        skin.setBone(bone);
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
                
            }
        }
    }
    
    {//handle skin sprites
        var beginFrame = null;
        var skinSpriteFrames = this.animation.getSkinSpriteFrames();
        for(var s = 0; s < skinSpriteFrames.length; ++s)
        {
            var frm = skinSpriteFrames[s];
            if(frm.getTime() <= time)
            {
                beginFrame = frm;
            }
        }
        
        //we have the last frame with smaller time
        if(beginFrame)
        {
            var info = beginFrame.getSkinSprites();
            if(info)
            {
                for(var s = 0; s< this.skins.length; ++s)
                {
                    var skin = this.skins[s];
                    var newSprFrameName = info[skin.getName()];
                    if(newSprFrameName)
                    {
                        skin.getSprite().selectFrame(newSprFrameName);
                    }
                }
            }
        }
    }
    
    
    {//handle sprites visibility
        
        var beginFrame = null;
        var visibilityFrames = this.animation.getVisibilityFrames();
        for(var v = 0; v < visibilityFrames.length; ++v)
        {
            var frm = visibilityFrames[v];
            if(frm.getTime() <= time)
            {
                beginFrame = frm;
            }
        }
        
        //we have the last frame with smaller time
        if(beginFrame)
        {
            var info = beginFrame.getSpritesVisibility();
            if(info)
            {
                for(var s = 0; s < this.sprites.length; ++s)
                {
                    var sprite = this.sprites[s];
                    if(sprite)
                    {
                        var sprFrmName = sprite.name;
                        if(sprFrmName != null && sprFrmName != "")
                        {
                            var val = info[sprFrmName];
                            
                            if(typeof(val) != undefined && val == true)
                            {
                                sprite.show();
                            }
                            else if(typeof(val) != undefined && val == false ){
                                sprite.hide();
                            }
                        }
                    }
                }
            }
        }
    }
    
    
    {//handle sprites transform
        
        var beginFrame = null;
        var endFrame = null;
        
        var spritesTransformFrames = this.animation.getSpritesTransformFrames();
        for(var t = 0; t < spritesTransformFrames.length; ++t)
        {
            var frm = spritesTransformFrames[t];
            if(frm.getTime() <= time){
                beginFrame = frm;
            }
            
            if(frm.getTime() > time){
                endFrame = frm;
                break;//exit for
            }
        }
        
        if(beginFrame && endFrame){
            
            var beginTime = beginFrame.getTime();
            var endTime = endFrame.getTime();
            
            var framesTimeDistance = endTime - beginTime;
            var timeUnit = (time - beginTime)/framesTimeDistance;
            
            var beginFrameInfo = beginFrame.getSpritesTransform();
            var endFrameInfo = endFrame.getSpritesTransform();
            
            if(beginFrameInfo == null || endFrameInfo == null)
                return;
                
            for(var sk= 0; sk < this.skins.length; ++sk)
            {
                var skin = this.skins[sk];
                
                var beginInfo = beginFrameInfo[skin.getName()];
                var endInfo = endFrameInfo[skin.getName()];
                
                
                if(skin.getSprite() != null && beginInfo != null && endInfo != null)
                {
                    
                    //set position
                    var beginPosX = beginInfo.getPositionX();
                    var beginPosY = beginInfo.getPositionY();
                    
                    var endPosX = endInfo.getPositionX();
                    var endPosY = endInfo.getPositionY();
                    
                    var newX = beginPosX + (endPosX - beginPosX)*timeUnit;
                    var newY = beginPosY + (endPosY - beginPosY)*timeUnit;
                    
                    skin.getSprite().center = {x: newX, y: -1.0*newY };
                    //skin.getSprite().x = newX      // + this.positionX + skin.getSprite().width*0.5;
                    //skin.getSprite().y = -1.0*newY // + this.positionY + skin.getSprite().height*0.5;
                    
                    //set angle
                    var beginAngle  = beginInfo.getAngle();
                    var endAngle    = endInfo.getAngle();
                    var newAngle    = beginAngle + (endAngle - beginAngle)*timeUnit;
                    skin.getSprite().rotate(newAngle);
                    
                    //set angle at skin time
                    var beginSkinAngle  = beginInfo.getConnectionAngle();
                    var endSkinAngle    = endInfo.getConnectionAngle();
                    var newSkinAngle    = beginSkinAngle + (endSkinAngle - beginSkinAngle)*timeUnit;
                    skin.setConnectionAngle(newSkinAngle);
                    
                    {
                        //set skin angle
                        var beginAngle  = beginInfo.getAngleOffset();
                        var endAngle    = endInfo.getAngleOffset();
                        var newAngle    = beginAngle + (endAngle - beginAngle)*timeUnit;
                        skin.setAngleOffset(newAngle);
                        
                        
                        //set skin position offset
                        var beginPosOffX = beginInfo.getPositionOffsetX();
                        var beginPosOffY = beginInfo.getPositionOffsetY();
                        
                        var endPosOffX = endInfo.getPositionOffsetX();
                        var endPosOffY = endInfo.getPositionOffsetY();
                        
                        var newX = beginPosOffX + (endPosOffX - beginPosOffX)*timeUnit;
                        var newY = beginPosOffY + (endPosOffY - beginPosOffY)*timeUnit;
                        
                        skin.setPositionOffset(newX, newY);
                    }
                    skin.transform();
                    
                }
            }
        }
        
    }

    
    this.transformSkins();
    this.currentTransitionTime += dt;
    
    this.animatingInProgress = false;
}

/**
 * @method getAllBones
 * Returns an array which includes "this" and all children bones.
 * @return {Array} 
 */
Skeleton.prototype.getAllBones = function()
{
	var array = [];
	
	array.push(this.rootBone);
	
	for (var i = 0; i < this.rootBone.children.length; i++) 
	{
        var childBone = this.rootBone.children[i];
        if(childBone)
        {
            var boneChildren = childBone.getAllBones();
            array = array.concat(boneChildren);
        }
    }	
    return array;
}

/**
 * @method setPosition
 * Sets the position of the skeleton.
 * @param {Number} pointX A numeric value representing the X position.
 * @param {Number} pointY A numeric value representing the Y position.
 */
Skeleton.prototype.setPosition = function(pointX, pointY)
{    
    this.batchNode.center = {x: pointX, y: pointY};
    this.updateSkins();
}

/**
 * @method getFlipX
 * Returns a boolean stating if the skeleton is flipped on x axis.
 * @return {Boolean} 
 */
Skeleton.prototype.getFlipX = function()
{
    if(this.batchNode.scaleX < 0)
    {
        return true;
    }
    return false;
}

/**
 * @method setFlipX
 * Flips the skeleton on x axis
 * @param {Boolean} val A boolean value.
 */
Skeleton.prototype.setFlipX = function(val)
{
    if(val)
    {
        this.batchNode.scaleX = -1.0
    }
    else{
        this.batchNode.scaleX = 1.0
    }    
}

/**
 * @method getPositionX
 * Returns the X position of the skeleton.
 * @return {Number}
 */
Skeleton.prototype.getPositionX = function(){
	return this.batchNode.center.x;
}
/**
 * @method getPositionY
 * Returns the Y position of the skeleton.
 * @return {Number}
 */
Skeleton.prototype.getPositionY = function(){
    return this.batchNode.center.y;
}

/**
 * @method getRootBone
 * Returns the root bone of this skeleton. A Bone object.
 * @return {Bone} 
 */
Skeleton.prototype.getRootBone = function()
{
	return this.rootBone;
}

Skeleton.prototype.updateSkins = function()
{
	for(var i = 0; i < this.skins.length; i++)
	{
		var skin = this.skins[i];
		if(skin)
		{
			skin.setupTransformations();
		}
	}
}

Skeleton.prototype.transformSkins = function()
{
	for(var i = 0; i < this.skins.length; ++i)
	{
		var skin = this.skins[i];
		if(skin){
			skin.transform();
		}
	}
}

/**
 * @method setPositionForBoneNamed
 * Finds a bone in the skeleton structure and set its position. 
 * 
 * This will cause all children bone to move acordingly.
 * @param {Number} posX A numeric value representing the X position where the bone should be placed.
 * @param {Number} posY A numeric value representing the Y position where the bone should be placed.
 * @param {String} boneName The name of the bone that should be moved.
 */
Skeleton.prototype.setPositionForBoneNamed = function(posX, posY, boneName)
{
	var bone = this.rootBone.getBoneWithName(boneName);

	if(bone){
		var localPointX = posX - this.getPositionX();
		var localPointY = posY - this.getPositionY();
		
		bone.setBonePosition(localPointX, localPointY, null);
	}
	this.rootBone.updateMovement();
	this.transformSkins();
}

Skeleton.prototype.addSkin = function(skin)
{
    if(skin == null)return;
	
	if(this.skins == null){
		this.skins = new Array();
	}
	
	this.skins.push(skin);
}


Skeleton.prototype.loadSprites = function(spritesInfo, spriteAtlastFileName)
{
	if(null == spritesInfo)return;
	
	var allBones = this.getAllBones();
	
	this.batchNode = platino.createSpriteSheet({asset:spriteAtlastFileName});
	this.batchNode.center = {x: 0, y: 0};
	this.batchNode.hide();
	
	for(var i = 0; i < spritesInfo.length; i++)
	{
		var sprInfo = spritesInfo[i];
		
		var localPosX = 0.0;
		var localPosY = 0.0;
		
		var sprPos = sprInfo.localPos
		if(sprPos)
		{
			var pos = ANPointFromString(sprPos);
            if (pos) {
                localPosX = pos[0];
                localPosY = pos[1];
			}
		}
		
		var angle = 0.0;
		var sprAngle = sprInfo.angle
		if(sprAngle){
			angle = Number(sprAngle);
		}
		
		var visible = false;
		var sprVis = sprInfo.visible;
		if(sprVis){
			visible = sprVis;
		}
		
		var boneUUID = sprInfo.boneUUID;
		var skinName = sprInfo.skinName;
		var skinUUID = sprInfo.skinUUID;
		var sprName  = sprInfo.sprName;
		
		if(sprName)
		{
		    var newSprite = platino.createSpriteSheet({asset:spriteAtlastFileName});
			newSprite.selectFrame(sprName);
			
			newSprite.followParentAlpha = false;
			
			newSprite.name = skinName;
			
			newSprite.center = {x: localPosX, y: -1.0*localPosY};
			newSprite.rotate(angle);
			
			newSprite.localPosX = localPosX;
			newSprite.localPosY = localPosY;
			
			if(visible == false){
				newSprite.hide();
			}
			
            this.sprites.push(newSprite);
            this.batchNode.addChildNode(newSprite);
            
			if(boneUUID){
				
				for(var b = 0; b < allBones.length;b++)
				{
					var bone = allBones[b];
					
					if(bone.getUUID() == boneUUID)
					{
						this.addSkin(new BoneSkin().create(newSprite, allBones[b], skinName, skinUUID, this));
						break;
					}
				}
			}
			else{
				this.addSkin(new BoneSkin().create(newSprite, null, skinName, skinUUID, this));
			}
		}	
	}
	
	scene.add(this.batchNode);
    
}

/**
 * @method setPoseWithName
 * Sets a pose onto the skeleton given the pose name.
 * @param {String} poseName The name of the pose to be loaded.
 */
Skeleton.prototype.setPoseWithName = function(poseName)
{
	if(this.poses == null)
	{
		Ti.API.info("ERROR: Skeleton has no poses or poses were not publish.\n\n");
		return;
	}

	var poseInfo =this.poses[poseName];
	if(poseInfo == null){
		Ti.API.info("\n\nERROR: Skeleton has no pose with name "+ poseName);
		return;
	}
	
	var visibility = poseInfo.visibility;
	if(visibility == null)
	{
		Ti.API.info("\n\nERROR: Skeleton pose is in wrong format. Skin visibilities were not found.\n\n");
		return;
	}
	
	var zOrder = poseInfo.zOrder;
	if(zOrder == null)
	{
		Ti.API.info("\n\nERROR: Skeleton pose is in wrong format. Skin z orders were not found.\n\n");
		return;
	}

	var skinTex = poseInfo.skinTex;
	if(skinTex == null)
	{
		Ti.API.info("\n\nERROR: Skeleton pose is in wrong format. Skin sprite frame names were not found.\n\n");
		return;
	}

	var connections = poseInfo.connections;
	if(connections == null)
	{
		Ti.API.info("\n\nERROR: Skeleton pose is in wrong format. Skin connections were not found.\n\n");
		return;
	}

    var allBones = this.getAllBones();


	for(var s = 0; s < this.skins.length; ++s)
	{
		var skin = this.skins[s];
		if(skin)
		{
			skin.getSprite().show();
			
			var value = visibility[skin.getUUID()];
			
			if(value == false)
			{
				skin.getSprite().hide();
			}
			
			var zValue = zOrder[skin.getUUID()];
			if(zValue)
			{
				skin.getSprite().z = zValue;
			}
            
			var spriteFrameName = skinTex[skin.getUUID()];
			if(spriteFrameName)
			{
				skin.getSprite().selectFrame(spriteFrameName);
			}
			
			
			var connectionInfo = connections[skin.getUUID()];
			if(connectionInfo)
			{
				//angleOff
				//boneUUID //this may be missing if no connection
				//conAngle
				//posOff
				
				var boneUUID = connectionInfo.boneUUID;//["boneUUID"];
				
				if(boneUUID)
				{
					//check if the current bone is already our connection bone - if not, change it
					if(!(skin.getBone() && skin.getBone().getUUID() == boneUUID))
					{
						for(var b = 0; b < allBones.length; ++b)
						{
							var bone = allBones[b];
							if(bone)
							{
								if(bone.getUUID() == boneUUID)
								{
									skin.setBone(bone);
									break;
								}
							}
						}
					}	
				}
				else{
					skin.setBone(null);	
				}
				
				var angleOff = connectionInfo.angleOff;
				if(angleOff)
				{
					skin.setAngleOffset(angleOff);
				}
				
				var posOff = connectionInfo.posOff;
				if(posOff){
					var pos = ANPointFromString(posOff);
   					if (pos) {
	 					skin.setPositionOffset(pos[0], pos[1]);
					}
				}
				
				var connectionAngle = connectionInfo.conAngle;
				if(connectionAngle)
				{
					skin.setConnectionAngle(connectionAngle);
				}
			}
		}
    }
  
    var positions = poseInfo.positions;
    if(positions == null)
    {
        Ti.API.info("\n\nERROR: Skeleton pose is in wrong format. Bone positions were not found.\n\n");
        return;
    }
	
	for(var j = 0; j < allBones.length; ++j)
	{
        var cbone = allBones[j];
        if(cbone)
		{
			var uuid = cbone.getUUID();
			if(uuid == null || uuid == "")
			{
				Ti.API.info("\n\nERROR: Bone has no UUID.\n\n");
				return;
			}
			
			var bonePos = positions[uuid];
			if(bonePos == null)
			{
				Ti.API.info("\n\nERROR: Bone pose does not have a position value. Must be in a wrong format.\n\n");
				return;
			}
            
			var newPos = ANPointFromString(bonePos);
			
			cbone.setPosition(newPos[0], newPos[1]);
		}
	}
	
    this.transformSkins();

    if(this.poseChangeNotificationCallback)
    {
        this.poseChangeNotificationCallback(this, poseName);
    }
}

Skeleton.prototype.loadBones = function(rootBoneInfo) 	
{
	if(null == rootBoneInfo)return;
	this.rootBone = new Bone().createWithDict(rootBoneInfo);
}


Skeleton.prototype = new Skeleton();
Skeleton.prototype.name = "Skeleton";
module.exports = Skeleton;
