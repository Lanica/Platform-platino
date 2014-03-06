var platino = require('co.lanica.platino');
var ALmixer = platino.require('co.lanica.almixer');
/*
var IsLandscape = function (orient)
{
    orient = orient || Ti.UI.orientation;
    return orient == Ti.UI.LANDSCAPE_LEFT || orient == Ti.UI.LANDSCAPE_RIGHT;
};
 
var IsPortrait = function (orient)
{
    orient = orient || Ti.UI.orientation;
    return orient == Ti.UI.PORTRAIT || orient == Ti.UI.UPSIDE_PORTRAIT;
};
*/
function CreateApplicationWindow()
{
	var the_window = Ti.UI.createWindow({
		backgroundColor:'black',
//		orientationModes:[Ti.UI.PORTRAIT, Ti.UI.UPSIDE_PORTRAIT], //others: Ti.UI.PORTRAIT, Ti.UI.UPSIDE_PORTRAIT, Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT
		orientationModes:[Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT], //others: Ti.UI.PORTRAIT, Ti.UI.UPSIDE_PORTRAIT, Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT
//		orientationModes:[Ti.UI.PORTRAIT, Ti.UI.UPSIDE_PORTRAIT, Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT], //others: Ti.UI.PORTRAIT, Ti.UI.UPSIDE_PORTRAIT, Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT
		fullscreen:true,
		navBarHidden:true
	});

	var gameView = platino.createGameView();
	gameView.fps = 30;
	gameView.color(0, 0, 0);
	gameView.debug = false; // disables debug logs (not to be used for production)

		// additional options:
		//gameView.keepScreenOn = false;
		//gameView.textureFilter = platino.OPENGL_LINEAR;
		//gameView.setUsePerspective(false); // for isometric
		//gameView.enableOnDrawFrameEvent = false; // optimization: disables 'enterframe' event
		//gameView.enableOnLoadSpriteEvent = false; // optimization: disables 'onloadsprite' and 'onunloadsprite' event except selected sprite by registerOnLoadSpriteName(name) or registerOnLoadSpriteTag(tag)
		//gameView.enableOnLoadTextureEvent = false; // optimization: disables 'onloadtexture' event except selected texture by registerOnLoadTextureName(name)
		//gameView.enableOnFpsEvent = false; // optimization: disables 'onfps' event
		//gameView.onFpsInterval = 5000; // sets 'onfps' event interval in msec (default: 5000)

	// Set your target screen resolution (in platform-specific units) below
	var target_width = 1024;
	var target_height = 768;
	
	gameView.TARGET_SCREEN = {
		width:target_width,
		height:target_height
	};

/*
	if ((Ti.Platform.displayCaps.platformWidth >= 768) && (Ti.Platform.displayCaps.dpi > 250))
	{
        // Retina-display iPads, high resolution phones (e.g. Galaxy S4), etc.
        gameView.imageSuffix = '@2x'; // change to @3x if you have the assets for it (very high resolution graphics)
        
	}
	else if (Ti.Platform.displayCaps.platformWidth >= 320)
	{
        // Non-retina iPads and retina-display iPhones, etc.
		if ((Ti.Platform.displayCaps.dpi > 200) || (Ti.Platform.displayCaps.platformWidth >= 640))
		{
            gameView.imageSuffix = '@2x';
		}
		else 
		{
			gameView.imageSuffix = '';
		}
	}
	else 
	{
        // All other lower resolution devices...
        gameView.imageSuffix = '';   
	}
*/

	// Sets up screen margins (useful for dynamic layouts, or if you want to implement letterboxing on some devices)
	// For a letter-boxed effect, add black bars to the HUD in the margin regions
	var UpdateMargins = function()
	{
		var margin_width = Math.ceil((gameView.screen.width - gameView.TARGET_SCREEN.width) * 0.5);
		
		// defines where screen-within-margin begins (add x and y values when positioning sprites)
		gameView.STAGE_START = 
		{
			x:margin_width,
			y:0
		};
		
		// defines where screen-within-margin ends
		gameView.STAGE_END =
		{
			x:gameView.screen.width - margin_width,
			y:gameView.screen.height
		};
		
		// defines where Titanium stage starts (outside of Game View)
		gameView.TI_STAGE_START =
		{
			x:Math.floor(gameView.STAGE_START.x / gameView.touchScaleX),
			y:gameView.STAGE_START.y / gameView.touchScaleY
		};
		
		// defines where Titanium stage ends (outside of Game View)
		gameView.TI_STAGE_END =
		{
			x:Math.ceil(gameView.STAGE_END.x / gameView.touchScaleX),
			y:gameView.STAGE_END.y / gameView.touchScaleY
		};
		
		// defines Titanium stage size (outside of Game View)
		gameView.TI_STAGE_SIZE =
		{
			width:gameView.TI_STAGE_END.x - gameView.TI_STAGE_START.x,
			height:gameView.TI_STAGE_END.y - gameView.TI_STAGE_START.y
		};
	};

	// Updates screen size, scale, and margins
	var UpdateScreenSize = function()
	{
		var screenScale = gameView.size.height / gameView.TARGET_SCREEN.height;
		gameView.screen = 
		{
			width:gameView.size.width / screenScale,
			height:gameView.size.height / screenScale
		};

		gameView.touchScaleX = gameView.screen.width  / gameView.size.width;
		gameView.touchScaleY = gameView.screen.height / gameView.size.height;
		gameView.screenScale = gameView.screen.height / gameView.TARGET_SCREEN.height;
		
		UpdateMargins();
	};



	// Loads MainScene.js as starting point to the app
	gameView.addEventListener('onload', 
    	function(e)
		{
			gameView.registerForMultiTouch();
			UpdateScreenSize();

			var MainScene  = require("MainScene");
			gameView.currentScene = new MainScene(the_window, gameView);

			// push loading scene and start the game
			gameView.pushScene(gameView.currentScene);
			gameView.start();
		}
	);

	gameView.addEventListener('onsurfacechanged', 
        function(e)
        {
			gameView.orientation = e.orientation;
			UpdateScreenSize();
        }    
    );

	// Convenience function to convert Titanium coordinate from a Platino coordinate
	gameView.getTiScale = function(x, y) {
		return {
			x: (x / gameView.touchScaleX),
			y: (y / gameView.touchScaleY)
		};
	};

	// Whenever a sprite is created, you should call this function to ensure width and height
	// properties always return the expected value depending on the device screen
	gameView.setupSpriteSize = function(sprite)
	{
		var width = sprite.width / gameView.screenScale;
		var height = sprite.height / gameView.screenScale;
		sprite.width = (width < 1) ? 1 : width;
		sprite.height = (height < 1) ? 1 : height;
	};

	// Converts screen touch event coordinates to Platino GameView coordinates
	gameView.locationInView = function(event)
	{
        var e = { type:event.type, x:event.x, y:event.y, source:event.source };
        var x = e.x * gameView.touchScaleX;
        var y = e.y * gameView.touchScaleY;
        e.x = x;
        e.y = y;
        return e;
	};
	
	/*

	// Handle android back button on a per-scene basis by adding defining a scene.backButtonHandler()
	// function within your scenes (or delete contents of below function to handle back button globally)
	the_window.addEventListener('androidback', function(e)
	{
        
		//if ((gameView.currentScene) && (gameView.currentScene.backButtonHandler))
	//	{
	//		gameView.currentScene.backButtonHandler();
	//	}
		the_window.close();
	});

	// Free up game resources when the_window is closed
	the_window.addEventListener('close', function(e) {
		gameView = null;
	});
*/
	// Instead of using the activity, as an alternative, you can also use focus/blur to pause/resume.
	/*
	the_window.addEventListener('blur', 
		function(e) 
		{
			Ti.API.info("in the_window blur");
 			ALmixer.BeginInterruption();
		}
	);

	the_window.addEventListener('focus', 
		function(e)
		{
			Ti.API.info("in the_window focus");
			ALmixer.EndInterruption();
		}
	);
*/
	the_window.add(gameView);
	return the_window;
}


function InitApplicationWindow()
{
    // Notice this returns a function, not a primitive value
	module.exports = CreateApplicationWindow;
}

InitApplicationWindow();
