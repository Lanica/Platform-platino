//bootstrap and check dependencies
if (Ti.version < 1.8 ) {
    alert('Sorry - this application template requires Titanium Mobile SDK 1.8 or later');
}

// Create a global object that other modules can read/write from
// (typeof exports !== "undefined" && exports !== null ? exports : this)._G = {};

// This is a single context application with mutliple windows in a stack
(function() {
	var platino = require('co.lanica.platino');
	var ALmixer = platino.require('co.lanica.almixer');

	ALmixer.Init(0,0,0);

	var Window = require('ApplicationWindow');
	new Window().open({fullscreen:true, navBarHidden:true, exitOnClose:true});

	
	/* You should copy all the event handlers below into your app. 
	 * It makes sure that when an app is paused, the audio pauses, and when resumed, audio is resumed.
	 * Additionally, when Android exits an app, it calls ALmixer_Quit() which is necessary to make sure
	 * the audio system is properly cleaned up, or there could be problems on the next launch.
	 */
	// Weird bug. pause/resume work in the almixertijstest demo, but not this one.
	// This post seems to have some information on what looks like a Titanium bug.
	// http://developer.appcelerator.com/question/149942/pause--resume-events-dont-fire-android
	// Without these being called, the audio will continue playing when the user switches out of the app which is annoying.
	// As a workaround, I've used the_window 'blur' and 'focus' events to handle this instead.
	/*
	if (Ti.Platform.osname == 'android')
	{
		Titanium.Android.currentActivity.addEventListener('pause', 
			function()
			{
				ALmixer.BeginInterruption();
			}
		);

		Titanium.Android.currentActivity.addEventListener('resume', 
			function()
			{
				ALmixer.EndInterruption();
			}
		);
*/
		Titanium.Android.currentActivity.addEventListener('destroy', 
			function()
			{
				Ti.API.info("exit called");
				ALmixer.Quit();
			}
		);

	}
	else
	{
		Titanium.App.addEventListener('pause', 
			function()
			{
				ALmixer.BeginInterruption();
			}
		);

		Titanium.App.addEventListener('resume', 
			function()
			{
				ALmixer.EndInterruption();
			}
		);
	}

})();
