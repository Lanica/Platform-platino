/*
 * Single Window Application Template:
 * A basic starting point for your application.  Mostly a blank canvas.
 * 
 * In app.js, we generally take care of a few things:
 * - Bootstrap the application with any data we need
 * - Check for dependencies like device type, platform version or network connection
 * - Require and open our top-level UI component
 *  
 */


//bootstrap and check dependencies
if (Ti.version < 1.8 ) {
	alert('Sorry - this application template requires Titanium Mobile SDK 1.8 or later');	  	
}

// This is a single context application with mutliple windows in a stack
(function() {
	//determine platform and form factor and render approproate components
	var osname = Ti.Platform.osname,
		version = Ti.Platform.version,
		height = Ti.Platform.displayCaps.platformHeight,
		width = Ti.Platform.displayCaps.platformWidth;
	
	//considering tablet to have one dimension over 900px - this is imperfect, so you should feel free to decide
	//yourself what you consider a tablet form factor for android
	var isTablet = osname === 'ipad' || (osname === 'android' && (width > 899 || height > 899));
	
	var Window;
	if (isTablet) {
		Window = require('ui/tablet/ApplicationWindow');
	}
	else {
		// Android uses platform-specific properties to create windows.
		// All other platforms follow a similar UI pattern.
		if (osname === 'android') {
			Window = require('ui/handheld/android/ApplicationWindow');
		}
		else {
			Window = require('ui/handheld/ApplicationWindow');
		}
	}


	var platino = require('co.lanica.platino');
	// Use platino.require(), not regular require(), to load ALmixer. (platino.require has extra magic)
	var ALmixer = platino.require('co.lanica.almixer');

	// First parameter is a requested frequency like 11025, 22050, or 44100.
	// Second parameter is the max number of channels. 32 is the best number.
	// Third paramter is mostly useless for the existing platforms.
	// Pass 0 to use defaults.
	var init_flag = ALmixer.Init(0,0,0);
	// Should be true
	Ti.API.info("init_flag is " + init_flag + ".\n");


	// Files are assumed to be in the Resources directory of your project.
	// If you need to specify outside file locations, provide absolute paths starting with '/'
	var sound_handle_pew = ALmixer.LoadAll("pew-pew-lei.wav");
	var sound_handle_note = ALmixer.LoadAll("notes_aac.aac");
	var music_handle = ALmixer.LoadStream("background-music-aac.m4a");

	// This will omit one channel (channel #0) from the automatic channel assignment mechanism so it is always available.
	// I will use this reserved channel for music. 
	// This is typical because you generally always want to make sure you have a free channel for music (since people will notice missing music more than any other missing sound effect),
	// and it also makes it easier because you can directly refer to the channel number instead of using a variable (if you choose). This can be useful for global user preferences such as having different volumes for music and sound effects.
	ALmixer.ReserveChannels(1);
	// This says play the music on channel 0, and loop infinitely (-1)
	var music_channel = ALmixer.PlayChannel(0, music_handle, -1);

	var win = Window();

	var note_button = Ti.UI.createButton({
//	backgroundImage:'blue.png',
	title:'note',
//	width:90,
//	height:35,
//	right:12,
//	bottom:10,
	top:80,
	left:10,
//	font:{fontFamily:'Arial',fontWeight:'bold',fontSize:14},
//	opacity:0
	});

	note_button.addEventListener('click', function(event)
	{
		// PlayChannel allows you to omit the channel (-1) and num_loops (0).
		var note_channel = ALmixer.PlayChannel(sound_handle_note, 
			function(e)
			{
			 	Ti.API.info("completed pew is "+e.name);
			 	Ti.API.info("name is "+e.name);
				Ti.API.info("channel is "+e.channel);
				Ti.API.info("source is "+e.alsource);
				Ti.API.info("finishedNaturally is "+e.finishedNaturally);
			}
		);
	}); 

	var pew_button = Ti.UI.createButton({
//	backgroundImage:'blue.png',
	title:'pew',
//	width:90,
//	height:35,
//	right:12,
//	bottom:10,
	top:80,
	left:100,
//	font:{fontFamily:'Arial',fontWeight:'bold',fontSize:14},
//	opacity:0
	});

	pew_button.addEventListener('click', function(event)
	{
		// Alternatively, if you prefer named parameters,
		// the ALmixer.util library provides this convenience function for this style.
		var pew_channel = ALmixer.util.Play(sound_handle_pew,
		{
			loops:2,
			onComplete:function(e)
			{
			 	Ti.API.info("completed_note is "+e.name);
			 	Ti.API.info("name is "+e.name);
				Ti.API.info("channel is "+e.channel);
				Ti.API.info("source is "+e.alsource);
				Ti.API.info("finishedNaturally is "+e.finishedNaturally);

			},
		});
	});
	
	var music_button = Ti.UI.createButton({
//	backgroundImage:'blue.png',
	title:'Pause-Music',
//	width:90,
//	height:35,
//	right:12,
//	bottom:10,
	top:10,
	left:10,
//	font:{fontFamily:'Arial',fontWeight:'bold',fontSize:14},
//	opacity:0
	});

	music_button.addEventListener('click', function(event)
	{

		if(ALmixer.IsPausedChannel(music_channel))
		{
			ALmixer.ResumeChannel(music_channel);
		}
		else
		{
			ALmixer.PauseChannel(music_channel);
		}


	}); 
	
	var volume_slider = Titanium.UI.createSlider({
    min:0,
    max:1.0,
    value:1.0,
    width:'80%',
    height:'auto',
    top:160,
	text:"Master (Listener) Volume",
 //   leftTrackImage:'../images/slider_orangebar.png',
 //   rightTrackImage:'../images/slider_lightbar.png',
 //   thumbImage:'../images/slider_thumb.png'
});
volume_slider.addEventListener('change',function(e)
{
	ALmixer.SetMasterVolume(e.value);
	
});

	var pitch_slider = Titanium.UI.createSlider({
    min:.25,
    max:2.0,
    value:1.0,
    width:'80%',
    height:'auto',
    top:280,
	text:"Pitch",
 //   leftTrackImage:'../images/slider_orangebar.png',
 //   rightTrackImage:'../images/slider_lightbar.png',
 //   thumbImage:'../images/slider_thumb.png'
});
pitch_slider.addEventListener('change',function(e)
{
	var ret_array = [];
	var ret_val = 0;
	var alsource = ALmixer.GetSource(0);
	var ret_val1 = [];
	var ret_val2 = [];
	var ret_val3 = [];

	// For OpenAL functions that pass arrays,
	// you must pass in a Javascript array instead.
	ALmixer.alGetSourcef(alsource, ALmixer.AL_PITCH, ret_val1);
	Ti.API.info("old pitch "+ ret_val1[0]);

	ALmixer.alSourcef(alsource, ALmixer.AL_PITCH, e.value);

	ALmixer.alGetSourcef(alsource, ALmixer.AL_PITCH, ret_val2);
	Ti.API.info("new pitch "+ ret_val2[0]);

  	// The 3f version is kind of lame because you have to pass 3 arrays
	// and then access the [0] element for each array.
	// You can use the fv version as an alternative. The fv version is nicer in my opinion.
	ALmixer.alGetSource3f(alsource, ALmixer.AL_POSITION, ret_val1, ret_val2, ret_val3);
	Ti.API.info("alGetSource3f position  "+ ret_val1[0] + ", " +  ret_val2[0] + ", " +  ret_val3[0]);
	
	// I think this fv is nicer than the 3f version
	ALmixer.alGetSourcefv(alsource, ALmixer.AL_POSITION, ret_array);
	Ti.API.info("alGetSourcefv position  "+ ret_array[0] + ", " +  ret_array[1] + ", " +  ret_array[2]);
  
});



win.add(note_button);
win.add(pew_button);
win.add(music_button);
win.add(volume_slider);
win.add(pitch_slider);

/* It is recommended that you setup the remaining event listeners for the window after 
 * it is opened on Android, so wait for it to open via event listener,
 * otherwise window.getActivity may return null on Android or the wrong activity.
 * (But remember to setup the this 'open' event listener before calling open() or you might miss the event, especially on iOS.)
 * Also note that the window MUST be a heavyweight window (e.g. using fullscreen or navbar settings)
 * otherwise, there will be no event listener callbacks. (Lightweight windows are gone as of Ti 3.2.0.GA)
 */
win.addEventListener('open', 
	function()
	{
		SetupApplicationLifeCycleHandlers(win);
	}
);
win.open();


/* You should copy all the event handlers below into your app. 
 * It makes sure that when an app is paused, the audio pauses, and when resumed, audio is resumed.
 * Additionally, when Android exits an app, it calls ALmixer_Quit() which is necessary to make sure
 * the audio system is properly cleaned up, or there could be problems on the next launch.
 */
/// @param the_window This variable is required for only Android. It should be you main application window.
function SetupApplicationLifeCycleHandlers(the_window)
{
	var application_reference;
	if(Ti.Platform.osname == 'android')
	{
		// For Android, we don't really have a global application reference. 
		// So we use the main game window's activity instead.
		// The window must be opened before we call getActivity()
		// Titanium.Android.currentActivity isn't good because it can change on you.
		application_reference = the_window.getActivity();
	}
	else
	{
		application_reference = Titanium.App;
	}

	application_reference.addEventListener('pause', 
		function()
		{
			Ti.API.info("pause called");
 			ALmixer.BeginInterruption();
		}
	);
	
	// onuserleavehint was introduced in Ti 3.2.0.GA to better handle Android events.
	// You need 3.2.0.GA for this to have any effect, but it is safe to run this on older versions because it will be a no-op.
	application_reference.addEventListener('onuserleavehint', 
		function()
		{
			Ti.API.info("onuserleavehint called");
 			ALmixer.BeginInterruption();
		}
	);


	// I think this is triggered when resuming Titanium phone call interruptions.	
	application_reference.addEventListener('resume', 
		function()
		{
			Ti.API.info("resume called");
			ALmixer.EndInterruption();
		}
	);

	// I think this is triggered for resuming all other paused events.
	application_reference.addEventListener('resumed', 
		function()
		{
			Ti.API.info("resumed called");
			ALmixer.EndInterruption();
		}
	);

}


})();
