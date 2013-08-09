/**
* @class animo.Director
* @alternateClassName Director
*
* Director class is a singleton and it's used to setup various necessary game info like the physical world. 
*/

exports.Director = (function () {

  // Instance stores a reference to the Singleton
  var instance;

  function init() {
    // Singleton
    // Private methods and variables
    var physicalWorld = null;
    var ptm = 32;
    var game = null
    
    return {
/**
* @method setGame
* Set game variable to be used by classes needing this object.
* @param {GameView} value A GameView object.
*/
      setGame:function(value)
      {
        this.game = value;
      },

/**
* @method getGame
* The currently used GameView object.
* @return {GameView} The currently used GameView object.
*/
      getGame:function()
      {
        return this.game;  
      },
      
/**
* @method setPhysicalWorld
* Set the Box2d world object to be used by classes needing this object.
* @param {b2World} world A b2World object.
*/
      setPhysicalWorld:function(world){
        this.physicalWorld = world;  
      },
      
/**
* @method getPhysicalWorld
* The currently used b2World object.
* @return {b2World} The currently used b2World object.
*/
      getPhysicalWorld:function(){
          return this.physicalWorld;
      },
      
      setPointToMeterRatio:function(value){
          this.ptm = value;
      },
      
      getPointToMeterRatio:function(){
          return this.ptm;
      }
    };

  };

  return {

    // Get the Singleton instance if one exists
    // or create one if it doesn't
    sharedDirector: function () {

      if ( !instance ) {
        instance = init();
      }

      return instance;
    }

  };

})();
