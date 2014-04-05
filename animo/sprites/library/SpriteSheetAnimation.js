

require('animo/Utils');
var platino = require('co.lanica.platino');

function AnimationFrame()
{    
    this.spriteFrameName = null;
    this.time = 0;
    this.userInfo = null;
    return this;
}

AnimationFrame.prototype.createWithDict = function(dict)
{
    this.spriteFrameName = dict.spriteframe;
    this.delayUnits = dict.delayUnits;
    this.offset = dict.offset;
    
    if(dict.notification && Object.keys(dict.notification).length>0)
        this.userInfo = ANDeepCopy(dict.notification)
    return this;
}
AnimationFrame.prototype = new AnimationFrame();
AnimationFrame.prototype.name = "AnimationFrame";
module.exports = AnimationFrame;


/**
* @class animo.SpriteSheetAnimation
* @alternateClassName SpriteSheetAnimation
*/


function SpriteSheetAnimation()
{
    this.totalTime = 0.0;
    this.frames = [];
    this.delayPerUnit = 0.0;
    this.loops = 1;
    this.randomReplay = false;
    this.minRandomTime = 0.0;
    this.maxRandomTime = 0.0;
    this.restoreOriginalFrame = false;
    this.randomFrames = false;
    this.loop = false;
    this.currentFrameIdx = 0;
    this.activeFrame = null;
    this.currentTime = 0.0;
    this.spriteSheet = null;
    this.playing = false;
    this.lastTime = 0.0;
    this.currentRandomRepeatTime = 0.0;
    this.repetitionsPerformed = 0;
    
    return this;
}

SpriteSheetAnimation.prototype.createWithDict = function(animDict, sprite)
{
    this.totalTime = 0.0;
    this.frames = [];
    this.delayPerUnit = animDict.delayPerUnit;
    this.loops = animDict.loops;
    this.randomReplay = animDict.randomReplay;
    this.minRandomTime = animDict.minRandomTime;
    this.maxRandomTime = animDict.maxRandomTime;
    this.restoreOriginalFrame = animDict.restoreOriginalFrame;
    this.randomFrames = animDict.randomFrames;
    this.loop = animDict.loop;
    this.currentFrameIdx = 0;
    this.activeFrame = null;
    this.currentTime = 0.0;
    this.spriteSheet = sprite;
    this.playing = false;
    this.lastTime = new Date();
    this.currentRandomRepeatTime = 0.0;
    this.repetitionsPerformed = 0;

    
    if(animDict.frames != null)
    {
        for(var i = 0; i < animDict.frames.length; i++)
        {
            var frmInfo = animDict.frames[i];
            
            var frameTime = frmInfo.delayUnits*this.delayPerUnit;
            this.totalTime += frameTime;
            
            var newFrame = new AnimationFrame().createWithDict(frmInfo);
            
            if(newFrame)
            {
                newFrame.time = frameTime;
                this.frames.push(newFrame);
                if(this.activeFrame == null){
                    this.activeFrame = newFrame;
                }
            }
        }
    }
    return this;
}
SpriteSheetAnimation.prototype.setCurrentTime = function(newTime)
{
    this.currentTime = newTime;
}

SpriteSheetAnimation.prototype.getCurrentTime = function()
{
    return this.currentTime;
}

SpriteSheetAnimation.prototype.play = function()
{
    this.playing = true;
    
    if(this.updateTimer){
        clearInterval(this.updateTimer);
    }
    this.lastTime = new Date();
    
    var myself = this;
    function callUpdateMethod() {
        myself.update(myself);
    }
    this.updateTimer = setInterval(callUpdateMethod, 1.0/30.0);
}

SpriteSheetAnimation.prototype.pause = function()
{
    this.playing = false;
    if(this.updateTimer){
        clearInterval(this.updateTimer);
    }
}


SpriteSheetAnimation.prototype.prepare = function()
{
    if(this.updateTimer){
        clearInterval(this.updateTimer);
    }
    this.currentRandomRepeatTime = 0.0;
    if(this.randomReplay){
        this.currentRandomRepeatTime = this.calculateRandomReplayTime();
    }
    this.playing = false;
    this.repetitionsPerformed = 0;
    this.moveToFirstFrame();
    this.currentTime = 0.0;
    this.animatingInProgress = false;
}

SpriteSheetAnimation.prototype.moveToFirstFrame = function(){    
    this.setActiveFrameWithIndex(0);
}
SpriteSheetAnimation.prototype.setActiveFrameWithIndex = function(frmIdx)
{
    if(frmIdx < 0)
    {
        frmIdx = 0;
    }
    if(frmIdx >= this.frames.length){
        frmIdx = this.frames.length - 1;
    }

    if(frmIdx >= 0 && frmIdx < this.frames.length)
    {
        this.currentFrameIdx = frmIdx;
        this.activeFrame = this.frames[frmIdx];
        this.spriteSheet.selectFrame(this.activeFrame.spriteFrameName);
        
        if(this.spriteSheet.didChangeFrameNotificationCallback != null){
            this.spriteSheet.didChangeFrameNotificationCallback(frmIdx, this.spriteSheet);
        }
    }
}
SpriteSheetAnimation.prototype.calculateRandomReplayTime = function()
{
    var from = this.minRandomTime;
    var to = this.maxRandomTime;
    
    return Math.floor(Math.random()*(to-from+1)+from);
}

SpriteSheetAnimation.prototype.randomFrame = function()
{
    var from = 0;
    var to = this.frames.length;
    return Math.floor(Math.random()*(to-from+1)+from);
}
       
SpriteSheetAnimation.prototype.update = function(self)
{
    if(this.playing == false){
        return;
    }
    
    if(this.animatingInProgress == true)
        return;
    
    //we use this variable so that in case the update function is called while we are still changing frames we should ignore the call
    this.animatingInProgress = true;
    
    var delta = new Date() - this.lastTime;
    this.lastTime = new Date();

    var dt = delta/1000;

    this.currentTime = this.currentTime + dt;

    var endedAllRep = false;
    var endedRep = false;    
    
    
    if(this.activeFrame.time <= this.currentTime)
    {
        var resetCurrentTime = true;
        var nextFrame = this.currentFrameIdx+1;

        if(this.randomFrames)
        {
            nextFrame = this.randomFrame();
            while (nextFrame == this.currentFrameIdx) 
            {
                nextFrame = this.randomFrame();
                //in case the random number returns the same frame
            }
        }
                
        if(nextFrame >= this.frames.length)
        {
            if(this.loop)
            {
                if(this.activeFrame.time + this.currentRandomRepeatTime <= this.currentTime)
                {
                    nextFrame = 0;
                    this.currentRandomRepeatTime = this.calculateRandomReplayTime();
                    this.repetitionsPerformed = this.repetitionsPerformed+1;
                    endedRep = true;
                }
                else{
                    nextFrame = this.frames.length - 1;
                    resetCurrentTime = false;
                }
            }
            else
            {
                this.repetitionsPerformed = this.repetitionsPerformed +1 
                if(this.repetitionsPerformed >= this.repetitions)
                {
                    nextFrame = this.frames.length -1;
                    endedAllRep = true;
                    this.playing = false;
                }
                else {
                    if(this.restoreSprite || this.repetitionsPerformed < this.repetitions)
                    {
                        nextFrame = 0;
                        endedRep = true;
                    }
                    else {
                        nextFrame = this.frames.length -1;
                    }
                }
            }
        }
        if(resetCurrentTime){
            this.currentTime = 0.0;
        }
        
        this.setActiveFrameWithIndex(nextFrame);
    }
    
    if(endedAllRep){
        this.playing = false;
    }
    
       if(endedRep && this.spriteSheet.didFinishRepetitionNotificationCallback)
       {
           this.spriteSheet.didFinishRepetitionNotificationCallback(this.repetitionsPerformed, this.spriteSheet);
       }
       
       
       if(endedAllRep && this.spriteSheet.didFinishPlayingNotificationCallback)
       {
           this.spriteSheet.didFinishPlayingNotificationCallback(this.spriteSheet);
       }
    
    this.animatingInProgress = false;
}


SpriteSheetAnimation.prototype = new SpriteSheetAnimation();
SpriteSheetAnimation.prototype.name = "SpriteSheetAnimation";
module.exports = SpriteSheetAnimation;




createAnimoSpriteSheetAnimationWithFile = function(animationFile, animationName) 
{    
    var dict = null;

    var f = Titanium.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, animationFile); 
    
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
        Ti.API.info("Error loading sprite sheet animation file. File is null");
    }

    var spriteSheet = null;


    if(dict != null)
    {
        var animations = dict.animations;
        if(animations != null)
        {
            var animDict = animations[animationName];
            if(animDict != null)
            {
                var animSpriteSheet = animDict.spriteSheet;
                
                var segements = animationFile.split("/");
                segements.splice(segements.length - 1, 1);//remove last elements
                segements[segements.length ] = "" + animSpriteSheet;
                var spriteAtlasFileName = segements.join("/");
        
                spriteSheet = platino.createSpriteSheet({asset:spriteAtlasFileName});
                spriteSheet.center = {x:0, y:0};
                
                if(spriteSheet != null)
                {
                    spriteSheet.sheetAnimation = new SpriteSheetAnimation().createWithDict(animDict, spriteSheet);                    
                    //Ti.API.info("TOTAL FRAMES " + spriteSheet.sheetAnimation.frames.length);
                }
            }
        }   
    }
    
    
    if(spriteSheet == null){
        return null;
    }
    
//add animation specific methods
////////////////////////////////////////////////////////////////////////////////


/**
 * @method moveToFirstFrame
 * Sets the animation to the first frame. 
 */

    spriteSheet.moveToFirstFrame = function(){
        this.sheetAnimation.moveToFirstFrame();
    }; 

/**
 * @method prepare
 * Prepare this animation in order to be played.
 */
    spriteSheet.prepare = function()
    {
        this.sheetAnimation.prepare();        
    };
/**
 * @method play
 * Start playing the sprite sheet animation.
 */    
    spriteSheet.play = function()
    {
        this.sheetAnimation.play();
    };
 /**
 * @method pause
 * Pauses the sprite sheet animation. Calling play() will unpause the animation.
 */     
    spriteSheet.pause = function()
    {
        this.sheetAnimation.pause();
    };
/**
 * @method setDidChangeFrameNotificationObserver
 * Setup the observer that will be called when a frame is changed.
 * 
 * **Example:**
 * 
 * animation.setDidChangeFrameNotificationObserver(function(frameIndex, spriteSheetObj){
 *        Ti.API.info("Did change frame index to " + frameIndex + " on animation running on sprite object " + spriteSheetObj);
 *        var userInfo = spriteSheetObj.getUserInfoForFrameAtIndex(frameIndex);
 *         if(userInfo){
 *            Ti.API.info("USER INFO " + JSON.stringify(userInfo));
 *        }
 *        else{
 *            Ti.API.info("This frame has NO user info");
 *        }
 *        
 *    });
 * 
 * @param {Function} callback A function having following signature function(frameIndex, spriteSheetObj)
 */  
    spriteSheet.setDidChangeFrameNotificationObserver = function(callback){
        spriteSheet.didChangeFrameNotificationCallback = callback;
    };
  
  
 /**
 * @method setDidFinishRepetitionNotificationObserver
 * Setup the observer that will be called when a the animation has finished a loop.
 * 
 * **Example:**
 * 
 * animation.setDidFinishRepetitionNotificationObserver(function(performedRepetitions, spriteSheetObj){
 *       Ti.API.info("Did finish repetition " + performedRepetitions + " on animation running on sprite object " + spriteSheetObj);
 *   });
 * 
 * @param {Function} callback A function having following signature function(performedRepetitions, spriteSheetObj)
 */

     spriteSheet.setDidFinishRepetitionNotificationObserver = function(callback){
        spriteSheet.didFinishRepetitionNotificationCallback = callback;
    };
    
 
 
 /**
 * @method setDidFinishPlayingNotificationObserver
  * Setup the observer that will be called when a the animation has finished playing.
 * 
 * **Example:**
 * 
 * animation.setDidFinishPlayingNotificationObserver(function(spriteSheetObj){
 *       Ti.API.info("Did finish playing animation running on sprite object " + spriteSheetObj);
 *   });
 * 
 * @param {Function} callback A function having following signature function(spriteSheetObj)
 */

  spriteSheet.setDidFinishPlayingNotificationObserver = function(callback){
        spriteSheet.didFinishPlayingNotificationCallback = callback;
    };
    
    
 /**
 * @method getUserInfoForFrameAtIndex
 * Get the info as defined in Animo Sprite for the frame specified by the index.
 * 
 * **Example:**
 * 
 * var userInfo = spriteSheetObj.getUserInfoForFrameAtIndex(frameIndex);
        if(userInfo){
            Ti.API.info("USER INFO " + JSON.stringify(userInfo));
        }
        else{
            Ti.API.info("This frame has NO user info");
        }
 *        
 */    
    spriteSheet.getUserInfoForFrameAtIndex = function(frmIdx)
    {
        var frm = spriteSheet.sheetAnimation.frames[frmIdx];
        if(frm)
        {
            // Ti.API.info("we have frame");
            return frm.userInfo;
        }
        return null;
    }
    
    
    
    
    
    
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
    spriteSheet.moveToFirstFrame();
    spriteSheet.prepare();
    
    
    return spriteSheet;
}
