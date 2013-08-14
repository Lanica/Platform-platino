require('animo/Utils');

/**
* @class animo.Bone
* @alternateClassName Bone
*
* Bone class is used to define skeleton structures. Each bone is connected to other children bones. 
* When a bone is moved each of its children is moved as well in order to simulate skeletons.
* End users will probably never have to use this class directly.
*/
function Bone()
{    
    this.m_rigid = false;
    this.m_name = "";
    this.m_uuid = "";
    
    this.children = new Array();
    this.neighbours = new Array();
    this.neighboursDistances = new Array();
    this.parent = null;
    
    this.positionX = 0.0;
    this.positionY = 0.0;
    this.previousPositionX = 0.0;//used when transitioning
    this.previousPositionY = 0.0;//used when transitioning
}

Bone.prototype.createWithDict = function(dict)
{
    //loading info from dictionary
    this.m_rigid = false;
    if(dict.rigid){ //property not available when bone is not rigid
        this.m_rigid = dict.rigid;
    }
    
    this.m_name = dict.name;
    this.m_uuid = dict.uuid;


    var bonePos = dict.localPos;  
    if(bonePos != null)//if bone is root it does not have a local pos 
    {
        var pos = ANPointFromString(bonePos);
        if (pos) {
            this.positionX = pos[0];
            this.positionY = pos[1];
        }
    }
    
    var childrenInfo = dict.children
    if(childrenInfo)
    {
        for (var i = 0; i < childrenInfo.length; i++) 
        {
            var childInfo = childrenInfo[i];
            if(childInfo)
            {
                //var Bone = require('GameDevHelperAPI/Bone').Bone;
                var newbone = new Bone();
                newbone.createWithDict(childInfo);
                if(newbone != null){
                    this.addChild(newbone);
                }
            }
        }
    }
    
    return this;
}

/**
* @method setRigid
* Set the rigid state of this bone.
* @param {Boolean} val
*/
Bone.prototype.setRigid = function(val){ this.m_rigid = val;}

/**
* @method getRigid
* Returns a variable representing the rigid state of this bone.
* @return {Boolean}
*/
Bone.prototype.getRigid = function(){ return this.m_rigid;}

/**
* @method getAllBones
* Returns an array which includes this and all children bones.
* @return {Array}
*/
Bone.prototype.getAllBones = function()
{
	var array = new Array();
	array.push(this);
	
	for (var i = 0; i < this.children.length; i++) 
	{
		var childBone = this.children[i];
		if(childBone)
		{
			var boneChildren = childBone.getAllBones();
			if(boneChildren){
				array = array.concat(boneChildren);
			}
		}
	}
	return array;       
}
/**
* @method getBoneWithName
* Returns a specific children bone given the name of the bone or null if no bone found.
* @param {String} val A string value representing the bone name.
* @return {Bone}
*/
Bone.prototype.getBoneWithName =function(val)
{
	if(this.m_name == val)
	{
		return this;
	}

	var boneChildren = this.getChildren();
	
	for(var i = 0; i < boneChildren.length; ++i)
	{
		var bone = boneChildren[i];
		if(bone)
		{
			var returnBone = bone.getBoneWithName(val)
			if(returnBone){
				return returnBone;
			}
		}
	}
		
	return null;
}

/**
* @method getName
* Returns the name of the bone as a string value.
* @return {String}
*/
Bone.prototype.getName = function(){
	return this.m_name;
}

/**
* @method getUUID
* Returns the unique identifier of the bone as a string value.
* @return {String}
*/	
Bone.prototype.getUUID = function(){
	return this.m_uuid;
}

/**
* @method setBonePosition
* Sets the position of the bone given the bone parent, which may be NULL.
* @param {Number} posX A number value.
* @param {Number} posY A number value.
* @param {Bone} father null or Bone object.
*/
Bone.prototype.setBonePosition = function(posX, posY, father)
{
	this.setPosition(posX, posY);
	this.move(father);
}

/**
* @method degrees
* Returns the angle between this bone and its parent in degrees.
* @return {Number}
*/
Bone.prototype.degrees = function()
{
	var _father = this.getParent();
	if(_father)
	{
		var curPointX = _father.getPositionX();
		var curPointY = _father.getPositionY();
		
		var endPointX = this.getPositionX();
		var endPointY = this.getPositionY();
		
		//return (Math.atan2(   endPointY - curPointY, 
			//              endPointX - curPointX)*180.0)/Math.PI;
			
		return (Math.atan2( curPointY - endPointY, 
							endPointX - curPointX)*180.0)/Math.PI + 90.0;   
	}

	return 0.0;
}

/**
* @method getParent
* Returns the parent bone of this bone.
* @return {Bone}
*/
Bone.prototype.getParent = function()
{
	return this.parent;
}

/**
* @method getPositionX
* Get local X position of the bone.
* @return {Number}
*/
Bone.prototype.getPositionX = function()
{
    return this.positionX;
}
/**
* @method getPositionY
* Get local Y position of the bone.
* @return {Number}
*/    
Bone.prototype.getPositionY = function()
{
	return this.positionY;
}

/**
* @method setPosition
* Sets the local position of the bone.
* @param {Number} x a number value
* @param {Number} y a number value
*/ 
Bone.prototype.setPosition = function(x, y)
{
	this.positionX = x;
	this.positionY = y;
}

/**
* @method savePosition
* Save the current position to previousPosition. This is called at the begining of a transition.
*/
Bone.prototype.savePosition = function()
{
    this.previousPositionX = this.positionX;
    this.previousPositionY = this.positionY;
}

Bone.prototype.getPreviousPositionX = function()
{
    return this.previousPositionX;
}

Bone.prototype.getPreviousPositionY = function()
{
    return this.previousPositionY;
}

Bone.prototype.calculateDistancesFromNeighbours = function()
{
	this.neighboursDistances =[];
	
	for(var i = 0; i < this.neighbours.length; ++i)
	{
		var node = this.neighbours[i];
		
		var dx = node.getPositionX() - this.getPositionX();
		var dy = node.getPositionY() - this.getPositionY();
		
		this.neighboursDistances.push(Math.sqrt(dx*dx + dy*dy));
	}
}

Bone.prototype.addNeighbor = function(neighbor)
{
	if(this.neighbours == null){
		this.neighbours = new Array();
		this.neighboursDistances = new Array();
	}

	this.neighbours.push(neighbor);
	this.calculateDistancesFromNeighbours();
}

Bone.prototype.addChild = function(child)
{
	this.addNeighbor(child);
	this.children.push(child);
	child.setParent(this);
	this.calculateDistancesFromNeighbours();
	child.addNeighbor(this);
}

Bone.prototype.removeNeighbor = function(neighbor)
{
	var index = this.neighbours.indexOf(neighbor);
	this.neighbours.splice(index, 1);
}

Bone.prototype.setParent = function(father)
{
	if(this.parent == null)
	{
		this.parent = father;
	}
}

Bone.prototype.getChildren = function()
{
	return this.children;
};


Bone.prototype.makeMove = function(parent, child, dist)
{
	if(child && child.getRigid())
	{
	//do nothing
	}
	else if(parent)
	{
		var dx = this.getPositionX() - parent.getPositionX();
		var dy = this.getPositionY() - parent.getPositionY();
		var angle = Math.atan2(dy, dx);

		this.setPosition(parent.getPositionX() + Math.cos(angle)*dist,
                        parent.getPositionY() + Math.sin(angle)*dist);
	}
}


Bone.prototype.move = function(father)
{
	for(var i = 0; i < this.neighbours.length; ++i)
	{
		var node = this.neighbours[i];
		if(node != father)
		{
			node.makeMove(this, node, this.neighboursDistances[i]);
			
			node.move(this);
		}
	}
}


Bone.prototype.updateMovement = function()
{
	if(this.getRigid())
	{
		this.setBonePosition(this.getPositionX(), this.getPositionY(), null);
	}

	var boneChildren = this.getChildren();
	for(var i = 0; i < boneChildren.length; ++i)
	{
		var bone = boneChildren[i];
		bone.updateMovement();
	}
}

Bone.prototype = new Bone();
Bone.prototype.name = "Bone";
module.exports = Bone;
