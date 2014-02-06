/**
* @class animo
* @alternateClassName animo
*
* Animo module will help create objects from Animo tools published files.
*/

var ANSprite    = require('animo/Sprite');
var ANDirector  = require('animo/Director').Director;
var ANSkeleton  = require('animo/Skeleton');
var ANSkeletalAnimation = require('animo/SkeletalAnimation');
require("animo/SpriteSheetAnimation");



function animo ()
{
    
}

/**
 * @method createSpriteWithFile
 * Create an animo sprite using info from an xml file generated with Lanica Animo Sprite tool.
 * @param {String} xmlFilePath The path to the xml file.
 * @param {String} spriteName The name of the sprite to be created as defined in Animo Sprite tool.
 * @return {Sprite} The newly created animo sprite object.
 */
animo.createSpriteWithFile = function (xmlFilePath, spriteName)
{
    return new ANSprite().createSpriteWithSpriteSheetFile(xmlFilePath, spriteName);
};


/**
 * @method createSkeletonWithFile
 * Create an animo skeleton using info from a json file generated with Lanica Animo Sprite tool.
 * @param {String} jsonFilePath The path to the json file.
 * @param {Scene} scene The scene where all sprites of the skeleton should be load into.
 * @return {Skeleton} The newly created animo skeleton object.
 */
animo.createSkeletonWithFile = function(jsonFilePath, scene)
{
    return new ANSkeleton().createWithFile(jsonFilePath, scene);
};


/**
 * @method createSkeletalAnimationWithFile
 * Create an animo skeleton animation using info from a json file generated with Lanica Animo Sprite tool.
 * @param {String} jsonFilePath The path to the json file.
 * @return {SkeletalAnimation} The newly created animo skeleton animation object.
 */
animo.createSkeletalAnimationWithFile = function(jsonFilePath)
{     
    return new ANSkeletalAnimation().createWithFile(jsonFilePath);
};
        
        
        
/**
 * @method director
 * Returns the Director singleton object.
 * @return {Director} The Director singleton object.
 */
animo.director = function ()
{
    return ANDirector.sharedDirector();
};


/**
 * @method createSpriteSheetAnimationWithFile
 * Create an animo sprite sheet animation using info from a json file generated with Lanica Animo Sprite tool.
 * @param {String} jsonFilePath The path to the json file.
 * @param {String} animationName The name of the animation to be created as defined in Animo Sprite tool.
 * @return {SpriteSheetAnimation} The newly created animo sprite sheet animation object.
 */
animo.createSpriteSheetAnimationWithFile = function(jsonFilePath, animationName) 
{
    return createAnimoSpriteSheetAnimationWithFile(jsonFilePath, animationName);
};

module.exports = animo;