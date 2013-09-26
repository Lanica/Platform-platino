var window = Ti.UI.createWindow({backgroundColor:'black'});

// Obtain game module
var platino = require('co.lanica.platino');

// Create view for your game.
// Note that game.screen.width and height are not yet set until the game is loaded
var game = platino.createGameView();

// Frame rate can be changed (fps can not be changed after the game is loaded)
game.fps = 30;

// set initial background color to black
game.color(0, 0, 0);

game.debug = true;

// Create game scene
var scene = platino.createScene();

var emitterIndex = 0;

// add your scene to game view
game.pushScene(scene);

// Onload event is called when the game is loaded.
// The game.screen.width and game.screen.height are not yet set until this onload event.
game.addEventListener('onload', function(e) {
    // Your game screen size is set here if you did not specifiy game width and height using screen property.
    // Note: game.size.width and height may be changed due to the parent layout so check them here.
    Ti.API.info("view size: " + game.size.width + "x" + game.size.height);
    Ti.API.info("game screen size: " + game.screen.width + "x" + game.screen.height);
    
    // Start the game
    game.start();

	addParticle();
});

var emitter = null;

function addParticle() {
	// remove current emitter from scene, then dispose it
	if (emitter !== null) {
		scene.remove(emitter);
		emitter.dispose();
		emitter = null;
	}

	switch(emitterIndex) {
		case 0: emitter = platino.createParticles({image:'graphics/forestfire.lap'}); break;
		case 1: emitter = platino.createParticles({image:'graphics/rocket.lap'}); break;
		case 2: emitter = platino.createParticles({image:'graphics/magic.lap'});  break;
		case 3: emitter = platino.createParticles({image:'graphics/smoke.lap'});  break;
		case 4: emitter = platino.createParticles({image:'graphics/galaxy.lap'}); break;
	}
    emitter.move(game.screen.width * 0.5, game.screen.height * 0.25);
	
	// add your shape to the scene
	scene.add(emitter);

	emitterIndex++;
	if (emitterIndex >= 5) {
		emitterIndex = 0;
	}
}

game.addEventListener('touchstart', function(e) {
	addParticle();
});

// Add your game view
window.add(game);

var centerLabel = Titanium.UI.createLabel({
    color:'black',
    backgroundColor:'white',
    text:'touch screen to change particles',
    font:{fontSize:20,fontFamily:'Helvetica Neue'},
    textAlign:'center',
    width:'auto',
    height:'auto'
});

// add label to the window
window.add(centerLabel);

window.open({fullscreen:true, navBarHidden:true});
