

require('animo/AffineTransform');
require('animo/Utils');


/**
* @class animo.BoneSkin
* @alternateClassName BoneSkin
*
* This is a helper class that connects a bone to a sprite.
* End users will probably never have to use this class directly.
*/
function BoneSkin() 
{
	this.sprite = null;
    this.bone = null;
    this.name = "";
    this.uuid = "";
    this.positionOffsetX = 0;
    this.positionOffsetY = 0;
    this.angleOffset = 0;
    this.connectionAngle = 0;
    this.skeleton = null;
    
    return this;
}


BoneSkin.prototype.create = function(sprite, bone, skinName, skinUUID, skeleton)
{
    
    //load from constructor
    this.sprite = sprite;
    this.bone = bone;
    this.name = skinName;
    this.uuid = skinUUID;
    this.skeleton = skeleton;
    
    return this;
};

/**
* @method getSprite
* Get the sprite used in this object.
* @return {Sprite} 
*/
BoneSkin.prototype.getSprite = function()
{
	return this.sprite;
};

/**
* @method getBone
* Get the bone used in this object. A GHBone object.
* @return {Bone} 
*/
BoneSkin.prototype.getBone = function()
{
	return this.bone;
}


/**
* @method setBone
* Set the bone that will be used by this object.
* @param {Bone} newBone
*/
BoneSkin.prototype.setBone = function(newBone)
{
	this.bone = null;
	this.bone = newBone;
};

/**
* @method getName
* Get the name of this skin connection as a string value.
* @param {String}
*/
BoneSkin.prototype.getName = function()
{
	return this.name;  
};


/**
* @method getUUID
* Get the unique identifier of this connection as a string value.
* @param {String}
*/
BoneSkin.prototype.getUUID = function()
{
	return this.uuid;
};


BoneSkin.prototype.setAngleOffset = function(newVal)
{
	this.angleOffset = newVal;
};


BoneSkin.prototype.setConnectionAngle = function(newVal)
{
	this.connectionAngle = newVal;
};


BoneSkin.prototype.setPositionOffset = function(newValX, newValY)
{
	this.positionOffsetX = newValX;
	this.positionOffsetY = newValY;
};

BoneSkin.prototype.setupTransformations = function( )
{
	if(this.bone != null && this.sprite != null && this.skeleton != null)
	{
		var _father = this.bone.getParent();
		this.angleOffset = 0;
		
		var bonePointX = _father.getPositionX();
		var bonePointY = _father.getPositionY();
		
		var currentPosX = this.sprite.localPosX;//this.sprite.center.x;
		var currentPosY = this.sprite.localPosY;//this.sprite.center.y;
		
		var curAngle = this.sprite.angle;
		this.connectionAngle = curAngle;
		
		var posOffsetX = currentPosX - bonePointX;
		var posOffsetY = bonePointY - currentPosY;
		
		this.positionOffsetX = posOffsetX;
		this.positionOffsetY = posOffsetY;
		
		var boneAngle = this.bone.degrees();
		this.angleOffset = boneAngle - curAngle;
		
	}
};

BoneSkin.prototype.transform = function(){
	if(this.sprite == null || this.bone == null || this.skeleton == null)return;
	
	
	var degrees = this.bone.degrees();
	
	var posOffsetX = this.positionOffsetX;
	var posOffsetY = this.positionOffsetY;
	
	var bonePosX = this.bone.getParent().getPositionX();
	var bonePosY = this.bone.getParent().getPositionY();

	
	var transformOffset = AffineTransformTranslate(AffineTransformMakeIdentity(), 
														bonePosX,
														bonePosY);
														
	var transform = AffineTransformRotate(AffineTransformMakeIdentity(), 
											ANDegreesToRadians(degrees - this.angleOffset));
	
	var originX = 0.0;
	var originY = 0.0;
	
	var upwardX = 0.0;
	var upwardY= -10.0;
	 
	var transform3 = AffineTransformRotate(AffineTransformMakeIdentity(), 
						ANDegreesToRadians(degrees - this.angleOffset - this.connectionAngle));
	
	var posOffset = PointApplyAffineTransform(posOffsetX, posOffsetY, transform3);
	posOffsetX = posOffset[0];
	posOffsetY = posOffset[1];
	
	
	var origin = PointApplyAffineTransform(originX, originY, transform);
	originX = origin[0];
	originY = origin[1];
	
	var upward = PointApplyAffineTransform(upwardX, upwardY, transform);
	upwardX = upward[0];
	upwardY = upward[1];
	
	
	origin = PointApplyAffineTransform(originX, originY, transformOffset);
	originX = origin[0];
	originY = origin[1];
	
	
	upward = PointApplyAffineTransform(upwardX, upwardY, transformOffset);
	upwardX = upward[0];
	upwardY = upward[1];
	
	
	var newAngle = (Math.atan2( upwardY - originY, 
								upwardX - originX)*180.0)/Math.PI + 90.0;
	
	
	var rootBone = this.skeleton.getRootBone();
	
    this.sprite.center = {x:originX + posOffsetX, y: (-1.0)*(originY - posOffsetY)}
	
	this.sprite.localPosX = originX + posOffsetX;
	this.sprite.localPosY = (-1.0)*(originY - posOffsetY);
	
	this.sprite.rotate(newAngle);
};


BoneSkin.prototype = new BoneSkin();
module.exports = BoneSkin;
